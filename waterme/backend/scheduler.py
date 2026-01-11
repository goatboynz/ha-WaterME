import asyncio
import logging
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
        asyncio.create_task(self._sensor_polling_loop())

    async def stop(self):
        self._running = False
        logger.info("Scheduler stopped.")

    def set_kill_switch(self, active: bool):
        self._kill_switch = active
        if active:
            self.emergency_stop()

    def emergency_stop(self):
        for room in db.config.rooms:
            for zone in room.zones:
                if zone.pump_entity: ha_client.turn_off(zone.pump_entity)
                if zone.valve_entity: ha_client.turn_off(zone.valve_entity)

    async def _sensor_polling_loop(self):
        """Polls sensors every 5 minutes for history."""
        while self._running:
            try:
                for room in db.config.rooms:
                    for zone in room.zones:
                        if zone.moisture_sensor_entity:
                            s = ha_client.get_entity_state(zone.moisture_sensor_entity)
                            try:
                                val = float(s.get('state'))
                                db.add_sensor_point(zone.moisture_sensor_entity, val)
                            except: pass
                        if zone.ec_sensor_entity:
                            s = ha_client.get_entity_state(zone.ec_sensor_entity)
                            try:
                                val = float(s.get('state'))
                                db.add_sensor_point(zone.ec_sensor_entity, val)
                            except: pass
            except Exception as e:
                logger.error(f"Sensor polling error: {e}")
            await asyncio.sleep(300) # 5 mins

    async def _tick_loop(self):
        while self._running:
            if self._kill_switch:
                await asyncio.sleep(5)
                continue
            
            if not ha_client.check_connection():
                await asyncio.sleep(60)
                continue

            try:
                await self._process_logic()
            except Exception as e:
                logger.error(f"Scheduler tick error: {e}")
            
            await asyncio.sleep(30) # Run every 30 seconds for better timing

    async def _process_logic(self):
        now = datetime.now()
        for room in db.config.rooms:
            if not room.enabled: continue
            await self._process_room(room, now)

    def _is_lights_on(self, room: Room, now: datetime):
        if room.use_fixed_schedule:
            try:
                on_h, on_m = map(int, room.lights_on_time.split(':'))
                off_h, off_m = map(int, room.lights_off_time.split(':'))
                on_t = dt_time(on_h, on_m)
                off_t = dt_time(off_h, off_m)
                curr_t = now.time()
                if on_t < off_t: return on_t <= curr_t < off_t
                return curr_t >= on_t or curr_t < off_t
            except: return False
        else:
            s = ha_client.get_entity_state(room.lights_on_entity)
            return s and s.get('state') == 'on'

    def _get_minutes_since_lights_on(self, room: Room, now: datetime):
        if room.use_fixed_schedule:
            on_h, on_m = map(int, room.lights_on_time.split(':'))
            on_dt = now.replace(hour=on_h, minute=on_m, second=0, microsecond=0)
            if on_dt > now: on_dt -= timedelta(days=1)
            return (now - on_dt).total_seconds() / 60.0
        else:
            s = ha_client.get_entity_state(room.lights_on_entity)
            lc = s.get('last_changed') if s else None
            if not lc: return 0
            ts = datetime.fromisoformat(lc.replace('Z', '+00:00'))
            return (datetime.now(ts.tzinfo) - ts).total_seconds() / 60.0

    async def _process_room(self, room: Room, now: datetime):
        # Update realtime sensors for Dashboard
        for zone in room.zones:
            if zone.moisture_sensor_entity:
                s = ha_client.get_entity_state(zone.moisture_sensor_entity)
                try: zone.current_moisture = float(s.get('state'))
                except: pass
            if zone.ec_sensor_entity:
                s = ha_client.get_entity_state(zone.ec_sensor_entity)
                try: zone.current_ec = float(s.get('state'))
                except: pass

        if not self._is_lights_on(room, now):
            # When lights are off, clear next run predictions
            for zone in room.zones: zone.next_event_time = None
            return

        time_on = self._get_minutes_since_lights_on(room, now)
        if 0 <= time_on < 1: self._reset_daily_stats(room)

        # Stagger check
        if room.last_zone_run_time:
            lr = datetime.fromisoformat(room.last_zone_run_time)
            stagger = room.zones[0].stagger_minutes if room.zones else 3
            if (now - lr).total_seconds() < stagger * 60: return

        # Phase logic
        # P1: 105 min window starting at +60m
        # P2: Remaining light cycle
        if 60 <= time_on < 165:
            await self._manage_p1(room, time_on)
        elif time_on >= 225: # 60m GAP after P1
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
            if not zone.enabled or zone.p1_shots <= 0: continue
            if zone.shots_today >= zone.p1_shots: continue

            interval = 105 / zone.p1_shots
            target = 60 + (zone.shots_today * interval)
            
            # Predict
            zone.next_event_time = (datetime.now() + timedelta(minutes=max(0, target - time_on))).isoformat()

            if time_on >= target:
                await self.fire_shot(room, zone, zone.p1_volume_sec, "P1")
                break

    async def _manage_p2(self, room: Room, time_on: float):
        # Evenly spread P2 shots across remaining lights-on time (assuming 12/12)
        # Remaining time ≈ 12h - 4h (P1+GAP) = 8h (480 mins)
        for zone in room.zones:
            if not zone.enabled or zone.p2_shots <= 0: continue
            
            p2_index = zone.shots_today - zone.p1_shots
            if p2_index < 0: continue # Should be done with P1
            if p2_index >= zone.p2_shots: continue

            interval = 480 / zone.p2_shots
            target = 225 + (p2_index * interval)
            
            # Predict
            zone.next_event_time = (datetime.now() + timedelta(minutes=max(0, target - time_on))).isoformat()

            if time_on >= target:
                await self.fire_shot(room, zone, zone.p2_volume_sec, "P2")
                break

    def _calculate_ml(self, zone: Zone, duration_sec: float):
        # lph to ml/min: (lph * 1000) / 60
        ml_min = (zone.dripper_rate_lph * 1000.0) / 60.0
        total_ml = (ml_min / 60.0) * duration_sec * zone.drippers_per_zone
        plants = zone.drippers_per_zone / max(1, zone.drippers_per_plant)
        plant_ml = total_ml / max(1, plants)
        return round(total_ml, 1), round(plant_ml, 1)

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
            
            t_ml, p_ml = self._calculate_ml(zone, duration_sec)
            db.add_history(Event(
                timestamp=datetime.now().isoformat(),
                zone_name=zone.name,
                room_name=room.name,
                type=shot_type,
                duration_sec=duration_sec,
                volume_ml_total=t_ml,
                volume_ml_per_plant=p_ml
            ))
            db.save()
        except Exception as e:
            logger.error(f"Shot failure: {e}")
            if zone.pump_entity: ha_client.turn_off(zone.pump_entity)
            if zone.valve_entity: ha_client.turn_off(zone.valve_entity)

scheduler = Scheduler()
