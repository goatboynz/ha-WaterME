import asyncio
import logging
import time
from datetime import datetime, timedelta, time as dt_time
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

    def _is_lights_on(self, room: Room, now: datetime):
        if room.use_fixed_schedule:
            try:
                on_h, on_m = map(int, room.lights_on_time.split(':'))
                off_h, off_m = map(int, room.lights_off_time.split(':'))
                on_time = dt_time(on_h, on_m)
                off_time = dt_time(off_h, off_m)
                current_time = now.time()
                
                if on_time < off_time:
                    return on_time <= current_time < off_time
                else: # Overnight schedule
                    return current_time >= on_time or current_time < off_time
            except:
                return False
        else:
            light_state = ha_client.get_entity_state(room.lights_on_entity)
            return light_state and light_state.get('state') == 'on'

    def _get_minutes_since_lights_on(self, room: Room, now: datetime):
        if room.use_fixed_schedule:
            on_h, on_m = map(int, room.lights_on_time.split(':'))
            on_dt = now.replace(hour=on_h, minute=on_m, second=0, microsecond=0)
            if on_dt > now:
                on_dt -= timedelta(days=1)
            return (now - on_dt).total_seconds() / 60.0
        else:
            light_state = ha_client.get_entity_state(room.lights_on_entity)
            last_changed_str = light_state.get('last_changed')
            if not last_changed_str: return 0
            last_changed = datetime.fromisoformat(last_changed_str.replace('Z', '+00:00'))
            return (datetime.now(last_changed.tzinfo) - last_changed).total_seconds() / 60.0

    async def _process_room(self, room: Room, now: datetime):
        # Update Sensors
        for zone in room.zones:
            if zone.moisture_sensor_entity:
                state = ha_client.get_entity_state(zone.moisture_sensor_entity)
                try: zone.current_moisture = float(state.get('state'))
                except: pass
            if zone.ec_sensor_entity:
                state = ha_client.get_entity_state(zone.ec_sensor_entity)
                try: zone.current_ec = float(state.get('state'))
                except: pass

        if not self._is_lights_on(room, now):
            return

        time_on = self._get_minutes_since_lights_on(room, now)
        
        # Reset daily stats if brand new day
        if 0 <= time_on < 2:
             self._reset_daily_stats(room)

        # Stagger check
        if room.last_zone_run_time:
            last_run = datetime.fromisoformat(room.last_zone_run_time)
            stagger = room.zones[0].stagger_minutes if room.zones else 3
            if (datetime.now() - last_run).total_seconds() < stagger * 60:
                return

        # Phase logic
        phase = "NIGHT"
        if time_on < 60: phase = "RAMP_UP"
        elif 60 <= time_on < (60 + 105): phase = "P1"
        elif (60 + 105) <= time_on < (60 + 105 + 60): phase = "GAP"
        else: phase = "P2"

        if phase == "P1":
            await self._manage_p1(room, time_on)
        elif phase == "P2":
            await self._manage_p2(room, time_on)

    def _reset_daily_stats(self, room: Room):
        for zone in room.zones:
            zone.shots_today = 0
            zone.last_shot_time = None
            zone.next_event_time = None
        room.last_zone_run_time = None
        db.save()

    async def _manage_p1(self, room: Room, time_on: float):
        for zone in room.zones:
            if zone.p1_shots <= 0: continue
            if zone.shots_today >= zone.p1_shots: continue

            # Calc interval: 105 mins / p1_shots
            interval = 105 / zone.p1_shots
            target_time_on = 60 + (zone.shots_today * interval)
            
            # Predict next event for UI
            if zone.shots_today < zone.p1_shots:
                 next_on = 60 + (zone.shots_today * interval)
                 # find actual datetime... 
                 # this is complex to do perfectly with sensors, but we try:
                 zone.next_event_time = (datetime.now() + timedelta(minutes=(next_on - time_on))).isoformat()

            if time_on >= target_time_on:
                await self.fire_shot(room, zone, zone.p1_volume_sec, "P1")
                break

    async def _manage_p2(self, room: Room, time_on: float):
        # Simplified P2 for now
        total_p1 = sum(z.p1_shots for z in room.zones)
        for zone in room.zones:
            if zone.p2_shots <= 0: continue
            if zone.shots_today >= (zone.p1_shots + zone.p2_shots): continue
            
            await self.fire_shot(room, zone, zone.p2_volume_sec, "P2")
            break

    def _calculate_ml(self, zone: Zone, duration_sec: float):
        # Rate is ml/min. duration is sec.
        # ml = (rate / 60) * duration * drippers_per_zone
        total_ml = (zone.dripper_rate_ml_min / 60.0) * duration_sec * zone.drippers_per_zone
        per_plant_ml = total_ml / max(1, (zone.drippers_per_zone / max(1, zone.drippers_per_plant)))
        # simpler: total_ml / (number of plants? the user needs to input plants count too?)
        # User requested: "dripper rate and how many there are for each zone... also somthing to impot dripper per plant"
        # Let's assume drips/plant is used to find plant count = drips_total / drips_per_plant
        plants_count = zone.drippers_per_zone / max(1, zone.drippers_per_plant)
        per_plant_ml = total_ml / max(1, plants_count)
        return round(total_ml, 1), round(per_plant_ml, 1)

    async def fire_shot(self, room: Room, zone: Zone, duration_sec: float, shot_type: str):
        try:
            room.last_zone_run_time = datetime.now().isoformat()
            ha_client.turn_on(zone.pump_entity)
            if zone.valve_entity:
                await asyncio.sleep(zone.valve_delay_ms / 1000.0)
                ha_client.turn_on(zone.valve_entity)
            
            await asyncio.sleep(duration_sec)
            
            if zone.valve_entity:
                ha_client.turn_off(zone.valve_entity)
                await asyncio.sleep(zone.valve_delay_ms / 1000.0)
            ha_client.turn_off(zone.pump_entity)
            
            zone.shots_today += 1
            zone.last_shot_time = datetime.now().isoformat()
            
            total_ml, plant_ml = self._calculate_ml(zone, duration_sec)
            
            db.add_history(Event(
                timestamp=datetime.now().isoformat(),
                zone_name=zone.name,
                room_name=room.name,
                type=shot_type,
                duration_sec=duration_sec,
                volume_ml_total=total_ml,
                volume_ml_per_plant=plant_ml
            ))
            db.save()
        except Exception as e:
            logger.error(f"Failed shot: {e}")
            if zone.pump_entity: ha_client.turn_off(zone.pump_entity)
            if zone.valve_entity: ha_client.turn_off(zone.valve_entity)

scheduler = Scheduler()
