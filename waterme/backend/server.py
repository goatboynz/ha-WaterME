from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from storage import db, Room, Zone
from scheduler import scheduler

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

# CORS (important for potential dev/ingress issues)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/api/status")
async def get_status():
    """Returns the current state of the system."""
    return {
        "status": "running",
        "kill_switch": scheduler._kill_switch,
        "rooms": db.config.rooms
    }

@app.get("/api/config")
async def get_config():
    return db.config

@app.post("/api/rooms")
async def add_room(room: Room):
    db.add_room(room)
    return {"status": "ok", "room": room}

@app.post("/api/kill_switch/{state}")
async def set_kill_switch(state: str):
    is_active = (state.lower() == "true" or state == "1")
    scheduler.set_kill_switch(is_active)
    return {"kill_switch": is_active}

@app.post("/api/manual/shot/{zone_id}")
async def manual_shot(zone_id: str):
    # Find zone
    for room in db.config.rooms:
        for zone in room.zones:
            if zone.id == zone_id:
                # Trigger shot in background
                import asyncio
                asyncio.create_task(scheduler.fire_shot(zone))
                return {"status": "fired", "zone": zone.name}
    raise HTTPException(status_code=404, detail="Zone not found")

# --- Static Files ---
# Serve the React frontend from /www
app.mount("/", StaticFiles(directory="/www", html=True), name="static")
