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
        # Let's get light state
        light_state = ha_client.get_entity_state(room.lights_on_entity)
        if not light_state or light_state.get('state') != 'on':
            return

        last_changed_str = light_state.get('last_changed')
        if not last_changed_str:
            return
        
        try:
            last_changed = datetime.fromisoformat(last_changed_str.replace('Z', '+00:00')) 
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
            phase = "P2"

        if time_on < 5:
             self._reset_daily_stats(room)

        if phase == "P1":
            await self._manage_p1(room)
        elif phase == "P2":
            await self._manage_p2(room)

    def _reset_daily_stats(self, room: Room):
        for zone in room.zones:
            zone.shots_today = 0
        db.save()

    async def _manage_p1(self, room: Room):
        for zone in room.zones:
            if zone.p1_shots == 0: continue
            if zone.shots_today >= zone.p1_shots: continue 
            
            should_fire = False
            if zone.shots_today == 0:
                should_fire = True
            else:
                # Interval logic could go here
                pass

            if should_fire:
                await self.fire_shot(zone, zone.p1_volume_sec)

    async def _manage_p2(self, room: Room):
        # Simplified P2 logic for now
        for zone in room.zones:
            if zone.p2_shots == 0: continue
            # TODO: Add dry-back logic
            pass

    async def fire_shot(self, zone: Zone, duration_sec: float):
        """Hardware Interlock Sequence"""
        logger.info(f"Firing shot for {zone.name} ({duration_sec}s)")
        
        try:
            # 1. Start Pump (Mandatory)
            ha_client.turn_on(zone.pump_entity)
            
            # 2. Delay for Valve (if exists)
            if zone.valve_entity:
                await asyncio.sleep(zone.valve_delay_ms / 1000.0)
                ha_client.turn_on(zone.valve_entity)
                
            # 3. Wait for irrigation duration
            await asyncio.sleep(duration_sec)
            
            # 4. Turn off Valve first (if exists)
            if zone.valve_entity:
                ha_client.turn_off(zone.valve_entity)
                await asyncio.sleep(zone.valve_delay_ms / 1000.0) # Drain down delay
                
            # 5. Turn off Pump
            ha_client.turn_off(zone.pump_entity)
            
            # Update stats
            zone.shots_today += 1
            zone.last_shot_time = datetime.now().isoformat()
            db.save()
        except Exception as e:
            logger.error(f"Failed to execute shot for {zone.name}: {e}")
            # Safety stop
            if zone.pump_entity: ha_client.turn_off(zone.pump_entity)
            if zone.valve_entity: ha_client.turn_off(zone.valve_entity)

scheduler = Scheduler()
