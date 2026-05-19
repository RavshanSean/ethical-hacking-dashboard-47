
from fastapi import WebSocket, WebSocketDisconnect
from services.websocket_manager import manager

from routes.scanner_routes import router as scanner_router
from routes.event_routes import router as event_router
from routes.stats_routes import router as stats_router
# FastAPI framework
from fastapi import FastAPI

# Allows frontend to talk to backend
from fastapi.middleware.cors import CORSMiddleware

# Data validation for incoming JSON

# Import our scanner engine

from db.database import Base, engine
from db import models

# Create FastAPI app
app = FastAPI()
app.include_router(scanner_router)
app.include_router(event_router)
app.include_router(stats_router)
# Create database tables
Base.metadata.create_all(bind=engine)


# CORS configuration
# Allows frontend running on localhost:3000
# to make requests to backend
app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# Incoming JSON structure
# Example:
# {
#   "url": "https://instagram.com"
# }


# Simple test route
@app.get("/")
def home():

    return {
        "message":
        "Ethical Hacking Dashboard #47 backend is alive"
    }
    
# WebSocket live telemetry route
@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):

    # Accept frontend connection
    await manager.connect(websocket)

    try:
        # Keep connection alive forever
        while True:

            # Wait for frontend messages
            # (placeholder for future)
            await websocket.receive_text()

    except WebSocketDisconnect:

        # Remove disconnected frontend
        manager.disconnect(websocket)