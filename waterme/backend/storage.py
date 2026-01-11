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

class Zone(BaseModel):
    id: str
    name: str
    pump_entity: str
    valve_entity: Optional[str] = None
    p1_shots: int = 5
    p2_shots: int = 0
    p1_volume_sec: float = 10.0
    p2_volume_sec: float = 10.0
    valve_delay_ms: int = 100
    stagger_minutes: int = 3 # Default 3 min stagger
    # Runtime state (not persisted but used in API)
    last_shot_time: Optional[str] = None
    shots_today: int = 0
    next_event_time: Optional[str] = None

class Room(BaseModel):
    id: str
    name: str
    lights_on_entity: str
    lights_off_entity: str = ""
    zones: List[Zone] = []
    last_zone_run_time: Optional[str] = None # Tracks when any zone in this room last ran

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
        self.config.history = self.config.history[:50] # Keep last 50 events
        self.save()

    def add_room(self, room: Room):
        self.config.rooms.append(room)
        self.save()

db = Storage()
