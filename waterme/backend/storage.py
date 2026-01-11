import json
import os
import logging
from typing import List, Optional
from pydantic import BaseModel

CONFIG_PATH = "/data/config.json"
logger = logging.getLogger(__name__)

class Zone(BaseModel):
    id: str
    name: str
    valve_entity: str
    pump_entity: Optional[str] = None
    p1_shots: int = 0
    p2_shots: int = 0
    shot_volume_ms: int = 2000
    stagger_minutes: int = 0
    # Runtime state (not persisted, but defined here for simplicity of returning objects)
    last_shot_time: Optional[str] = None
    shots_today: int = 0

class Room(BaseModel):
    id: str
    name: str
    lights_on_entity: str
    lights_off_entity: str
    zones: List[Zone] = []

class SystemConfig(BaseModel):
    rooms: List[Room] = []

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
            logger.info("Configuration saved.")
        except Exception as e:
            logger.error(f"Failed to save config: {e}")

    def get_room(self, room_id: str) -> Optional[Room]:
        for room in self.config.rooms:
            if room.id == room_id:
                return room
        return None

    def add_room(self, room: Room):
        self.config.rooms.append(room)
        self.save()

    def update_room(self, room: Room):
        for i, r in enumerate(self.config.rooms):
            if r.id == room.id:
                self.config.rooms[i] = room
                self.save()
                return
        # If not found, add it
        self.add_room(room)

db = Storage()
