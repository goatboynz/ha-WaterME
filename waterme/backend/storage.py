import json
import os
import logging
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

CONFIG_PATH = "/data/config.json"
logger = logging.getLogger(__name__)

class Event(BaseModel):
    timestamp: str
    zone_name: str
    room_name: str
    type: str # P1, P2, Manual
    duration_sec: float
    volume_ml_total: float = 0
    volume_ml_per_plant: float = 0

class Zone(BaseModel):
    id: str
    name: str
    pump_entity: str
    valve_entity: Optional[str] = None
    
    # Irrigation Settings
    p1_shots: int = 5
    p2_shots: int = 0
    p1_volume_sec: float = 10.0
    p2_volume_sec: float = 10.0
    valve_delay_ms: int = 100
    stagger_minutes: int = 3
    
    # Dripper Calculations
    dripper_rate_ml_min: float = 2000.0 # Standard 2.0L/h converted or ml/min
    drippers_per_zone: int = 1
    drippers_per_plant: int = 1
    
    # Sensors
    moisture_sensor_entity: Optional[str] = None
    ec_sensor_entity: Optional[str] = None
    
    # Runtime state
    last_shot_time: Optional[str] = None
    shots_today: int = 0
    next_event_time: Optional[str] = None
    current_moisture: Optional[float] = None
    current_ec: Optional[float] = None

class Room(BaseModel):
    id: str
    name: str
    
    # Light Schedule
    use_fixed_schedule: bool = False
    lights_on_time: str = "06:00"
    lights_off_time: str = "18:00"
    
    # Sensors (legacy/backup)
    lights_on_entity: str = ""
    lights_off_entity: str = ""
    
    zones: List[Zone] = []
    last_zone_run_time: Optional[str] = None

class SystemConfig(BaseModel):
    rooms: List[Room] = []
    history: List[Event] = []

class Storage:
    def __init__(self):
        self.config = SystemConfig()
        self.load()

    def load(self):
        if os.path.exists(CONFIG_PATH):
            try:
                with open(CONFIG_PATH, 'r') as f:
                    data = json.load(f)
                    self.config = SystemConfig(**data)
                logger.info("Configuration loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load config: {e}")
        else:
            logger.info("No config found, initializing defaults.")
            self.save()

    def save(self):
        try:
            with open(CONFIG_PATH, 'w') as f:
                f.write(self.config.model_dump_json(indent=2))
        except Exception as e:
            logger.error(f"Failed to save config: {e}")

    def add_history(self, event: Event):
        self.config.history.insert(0, event)
        self.config.history = self.config.history[:100] # Keep last 100 events
        self.save()

db = Storage()
