from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from backend.storage import db, Room, Zone, Event
from backend.scheduler import scheduler
from backend import ha_client

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WaterME")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await scheduler.start()
    yield
    # Shutdown
    await scheduler.stop()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/waterme-api/status")
async def get_status():
    """Returns the current state of the system."""
    return {
        "status": "running",
        "kill_switch": scheduler._kill_switch,
        "rooms": db.config.rooms,
        "history": db.config.history,
        "sensor_history": db.sensor_history
    }

@app.get("/waterme-api/config")
async def get_config():
    return db.config

@app.get("/waterme-api/entities")
async def get_entities(domain: Optional[str] = None, search: Optional[str] = None):
    entities = ha_client.get_all_entities()
    if entities is None: return {"entities": []}
    
    if domain:
        entities = [e for e in entities if e.get("entity_id", "").startswith(f"{domain}.")]
    if search:
        search_lower = search.lower()
        entities = [e for e in entities if search_lower in e.get("entity_id", "").lower() 
                    or search_lower in (e.get("attributes", {}).get("friendly_name", "") or "").lower()]
    return {"entities": entities}

@app.post("/waterme-api/rooms")
async def add_room(room: Room):
    db.config.rooms.append(room)
    db.save()
    return {"status": "ok", "room": room}

@app.put("/waterme-api/rooms/{room_id}")
async def update_room(room_id: str, room: Room):
    for i, r in enumerate(db.config.rooms):
        if r.id == room_id:
            db.config.rooms[i] = room
            db.save()
            return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Room not found")

@app.delete("/waterme-api/rooms/{room_id}")
async def delete_room(room_id: str):
    for i, r in enumerate(db.config.rooms):
        if r.id == room_id:
            db.config.rooms.pop(i)
            db.save()
            return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Room not found")

@app.post("/waterme-api/kill_switch/{state}")
async def set_kill_switch(state: str):
    is_active = (state.lower() == "true" or state == "1")
    scheduler.set_kill_switch(is_active)
    return {"kill_switch": is_active}

@app.post("/waterme-api/manual/shot/{zone_id}")
async def manual_shot(zone_id: str):
    for room in db.config.rooms:
        for zone in room.zones:
            if zone.id == zone_id:
                import asyncio
                asyncio.create_task(scheduler.fire_shot(room, zone, zone.p1_volume_sec, "Manual"))
                return {"status": "fired", "zone": zone.name}
    raise HTTPException(status_code=404, detail="Zone not found")

@app.post("/waterme-api/toggle/{type}/{id}")
async def toggle_enabled(type: str, id: str, state: bool):
    """Toggle enabled state for a room or zone."""
    if type == "room":
        for room in db.config.rooms:
            if room.id == id:
                room.enabled = state
                db.save()
                return {"status": "ok"}
    elif type == "zone":
        for room in db.config.rooms:
            for zone in room.zones:
                if zone.id == id:
                    zone.enabled = state
                    db.save()
                    return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Not found")

# Serve the React frontend
app.mount("/", StaticFiles(directory="/www", html=True), name="static")
