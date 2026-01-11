import asyncio
import logging
import time
from datetime import datetime, timedelta
from backend import ha_client
from backend.storage import db, Room, Zone

logger = logging.getLogger(__name__)

class Scheduler:
    def __init__(self):
        self._running = False
        self._kill_switch = False
        self._tasks = []

    async def start(self):
        self._running = True
        logger.info("Scheduler started.")
        asyncio.create_task(self._tick_loop())

    async def stop(self):
        self._running = False
        logger.info("Scheduler stopped.")

    def set_kill_switch(self, active: bool):
        self._kill_switch = active
        if active:
            logger.critical("Global Kill Switch ACTIVATED. Stopping all irrigation.")
            self.emergency_stop()
        else:
            logger.info("Global Kill Switch deactivated.")

    def emergency_stop(self):
        """Immediately closes all valves."""
        for room in db.config.rooms:
            # Turn off master pump if exists (logic complexity: shared pump requires care, assumed per zone for now or handled via automations)
            # For this MVP, we turn off all valves and pumps defined in zones
            for zone in room.zones:
                if zone.pump_entity:
                    ha_client.turn_off(zone.pump_entity)
                if zone.valve_entity:
                    ha_client.turn_off(zone.valve_entity)

    async def _tick_loop(self):
        while self._running:
            if self._kill_switch:
                await asyncio.sleep(5)
                continue
            
            # Check HA connection safety
            if not ha_client.check_connection():
                # Log only once per minute, not every 10 seconds
                logger.warning("Waiting for Home Assistant connection...")
                await asyncio.sleep(60)
                continue

            try:
                await self._process_logic()
            except Exception as e:
                logger.error(f"Error in scheduler tick: {e}")
            
            await asyncio.sleep(60) # Run every minute

    async def _process_logic(self):
        now = datetime.now()
        for room in db.config.rooms:
            await self._process_room(room, now)

    async def _process_room(self, room: Room, now: datetime):
        # 1. Determine Phase
        # We need state of lights.
        # This is tricky without persistent history or complex state tracking.
        # For this MVP, we rely on current state + assumptions or simplified logic.
        # Ideally, we'd read "last_changed" from HA, but that's complex.
        # SIMPLIFICATION: We assume lights are automated and we just check status.
        # BUT: Athena logic relies on "Time since lights on".
        
        # Let's get light state
        light_state = ha_client.get_entity_state(room.lights_on_entity)
        if not light_state or light_state.get('state') != 'on':
            # Night mode or unavailable
            return

        # We need "Time ON". `last_changed` is in the state object.
        last_changed_str = light_state.get('last_changed')
        if not last_changed_str:
            return
        
        # Parse HA timestamp (ISO format)
        try:
            # HA returns UTC usually, need to be careful with timezones.
            # Assuming simple local/naive for MVP or that container time matches HA time.
            last_changed = datetime.fromisoformat(last_changed_str.replace('Z', '+00:00')) 
            # Convert to local if 'now' is local is tricky. 
            # Better strategy: Compare deltas if possible or just use current time if schedule is fixed.
            # Athena: "1 hour after lights on".
            
            # To avoid timezone hell in MVP, we might ask user for "Lights On Time" in config 
            # OR we just rely on "last_changed" relative to "now" (assuming container clock is synced).
            
            time_on = (datetime.now(last_changed.tzinfo) - last_changed).total_seconds() / 60.0 # minutes
            
        except Exception as e:
            logger.error(f"Failed to parse time: {e}")
            return

        phase = "NIGHT"
        if time_on < 60:
            phase = "RAMP_UP_WAIT" # First hour: dry
        elif 60 <= time_on < (60 + 105): # 105 min window for P1
            phase = "P1"
        elif (60 + 105) <= time_on < (60 + 105 + 60): # 60m Gap
            phase = "GAP"
        else:
            # P2 until 1hr before lights off. 
            # We don't know lights off time easily without config. 
            # Assumed valid P2 for remainder for now.
            phase = "P2"

        # LOGIC: Scheduler needs to fire shots.
        # This is where it gets complex. We need to track "shots taken today".
        # Reset shots if lights went from off to on (time_on < few minutes).
        if time_on < 5:
             self._reset_daily_stats(room)

        if phase == "P1":
            await self._manage_p1(room)
        elif phase == "P2":
            await self._manage_p2(room)

    def _reset_daily_stats(self, room: Room):
        for zone in room.zones:
            zone.shots_today = 0
        db.save() # Crude, but persists for now if we mapped to config

    async def _manage_p1(self, room: Room):
        # Distribute P1 shots evenly.
        # MVP: Simple check. "If shots_today < p1_shots" and "time since last shot > interval"
        # Interval = 105_minutes / p1_shots.
        
        for zone in room.zones:
            if zone.p1_shots == 0: continue
            if zone.shots_today >= zone.p1_shots: continue # Done P1

            interval_min = 105 / zone.p1_shots
            
            # Check last shot time
            # For MVP, we might just fire immediately if ready.
            # We need a 'last_shot_time' in memory.
            # If never shot today, fire!
            should_fire = False
            
            if zone.shots_today == 0:
                should_fire = True
            else:
                # Check interval
                # This requires parsing zone.last_shot_time
                # TODO: Implement robust timing.
                # For this step, I will just log "Would fire P1".
                pass

            if should_fire:
                await self.fire_shot(zone)

    async def _manage_p2(self, room: Room):
        # Maintenance logic (dryback trigger).
        # Complex. MVP: skipped or simplified.
        pass

    async def fire_shot(self, zone: Zone):
        """Hardware Interlock Sequence"""
        logger.info(f"Firing shot for {zone.name} ({zone.shot_volume_ms}ms)")
        
        # 1. Open Valve
        ha_client.turn_on(zone.valve_entity)
        await asyncio.sleep(0.05) # 50ms
        
        # 2. Pump On
        if zone.pump_entity:
            ha_client.turn_on(zone.pump_entity)
            
        # 3. Wait Duration
        await asyncio.sleep(zone.shot_volume_ms / 1000.0)
        
        # 4. Pump Off
        if zone.pump_entity:
            ha_client.turn_off(zone.pump_entity)
            
        # 5. Wait 50ms
        await asyncio.sleep(0.05)
        
        # 6. Valve Off
        ha_client.turn_off(zone.valve_entity)
        
        # Update stats
        zone.shots_today += 1
        zone.last_shot_time = datetime.now().isoformat()
        db.save()

scheduler = Scheduler()
