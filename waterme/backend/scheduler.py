import asyncio
import logging
import time
from datetime import datetime, timedelta
from backend import ha_client
from backend.storage import db, Room, Zone, Event

logger = logging.getLogger(__name__)

class Scheduler:
    def __init__(self):
        self._running = False
        self._kill_switch = False

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
                if zone.pump_entity: ha_client.turn_off(zone.pump_entity)
                if zone.valve_entity: ha_client.turn_off(zone.valve_entity)

    async def _tick_loop(self):
        while self._running:
            if self._kill_switch:
                await asyncio.sleep(5)
                continue
            
            if not ha_client.check_connection():
                logger.warning("Waiting for Home Assistant connection...")
                await asyncio.sleep(60)
                continue

            try:
                await self._process_logic()
            except Exception as e:
                logger.error(f"Error in scheduler tick: {e}")
            
            await asyncio.sleep(60)

    async def _process_logic(self):
        now = datetime.now()
        for room in db.config.rooms:
            await self._process_room(room, now)

    async def _process_room(self, room: Room, now: datetime):
        light_state = ha_client.get_entity_state(room.lights_on_entity)
        if not light_state or light_state.get('state') != 'on':
            return

        last_changed_str = light_state.get('last_changed')
        if not last_changed_str: return
        
        try:
            last_changed = datetime.fromisoformat(last_changed_str.replace('Z', '+00:00')) 
            time_on = (datetime.now(last_changed.tzinfo) - last_changed).total_seconds() / 60.0
        except: return

        # Reset daily stats
        if time_on < 5:
             self._reset_daily_stats(room)

        # 3-Minute Stagger Check for the Room
        # If any zone in this room ran recently, wait.
        if room.last_zone_run_time:
            last_run = datetime.fromisoformat(room.last_zone_run_time)
            # Default to 3 mins or first zone's stagger setting
            min_stagger = room.zones[0].stagger_minutes if room.zones else 3
            if (datetime.now() - last_run).total_seconds() < min_stagger * 60:
                logger.debug(f"Room {room.name} is in stagger cooldown.")
                return

        # Determine Phase
        phase = "NIGHT"
        if time_on < 60: phase = "RAMP_UP_WAIT"
        elif 60 <= time_on < (60 + 105): phase = "P1"
        elif (60 + 105) <= time_on < (60 + 105 + 60): phase = "GAP"
        else: phase = "P2"

        if phase == "P1":
            await self._manage_p1(room)
        elif phase == "P2":
            await self._manage_p2(room)

    def _reset_daily_stats(self, room: Room):
        for zone in room.zones:
            zone.shots_today = 0
            zone.last_shot_time = None
        room.last_zone_run_time = None
        db.save()

    async def _manage_p1(self, room: Room):
        # Calculate P1 distribution
        # Phase window is 105 minutes.
        for zone in room.zones:
            if zone.p1_shots <= 0: continue
            if zone.shots_today >= zone.p1_shots: continue

            # If it's this zone's turn (simple sequential for MVP with stagger)
            # We fire the first available zone that hasn't finished.
            # The stagger check in _process_room ensures only one fires every 3 mins.
            await self.fire_shot(room, zone, zone.p1_volume_sec, "P1")
            break # Only one zone per tick (enforces staggering naturally)

    async def _manage_p2(self, room: Room):
        for zone in room.zones:
            if zone.p2_shots <= 0: continue
            if zone.shots_today >= (zone.p1_shots + zone.p2_shots): continue
            
            await self.fire_shot(room, zone, zone.p2_volume_sec, "P2")
            break

    async def fire_shot(self, room: Room, zone: Zone, duration_sec: float, shot_type: str):
        logger.info(f"Firing {shot_type} shot for {room.name}:{zone.name} ({duration_sec}s)")
        
        try:
            # Mark room as busy immediately
            room.last_zone_run_time = datetime.now().isoformat()
            
            # Start Pump
            ha_client.turn_on(zone.pump_entity)
            
            # Delay for Valve
            if zone.valve_entity:
                await asyncio.sleep(zone.valve_delay_ms / 1000.0)
                ha_client.turn_on(zone.valve_entity)
                
            # Wait for irrigation
            await asyncio.sleep(duration_sec)
            
            # Close Valve
            if zone.valve_entity:
                ha_client.turn_off(zone.valve_entity)
                await asyncio.sleep(zone.valve_delay_ms / 1000.0)
                
            # Stop Pump
            ha_client.turn_off(zone.pump_entity)
            
            # Record Success
            zone.shots_today += 1
            zone.last_shot_time = datetime.now().isoformat()
            
            # Record History
            db.add_history(Event(
                timestamp=datetime.now().isoformat(),
                zone_name=zone.name,
                room_name=room.name,
                type=shot_type,
                duration_sec=duration_sec
            ))
            
            db.save()
        except Exception as e:
            logger.error(f"Failed shot for {zone.name}: {e}")
            if zone.pump_entity: ha_client.turn_off(zone.pump_entity)
            if zone.valve_entity: ha_client.turn_off(zone.valve_entity)

scheduler = Scheduler()
