from fastapi import WebSocket, WebSocketDisconnect
from services.websocket_manager import manager

from services.event_service import get_recent_events

# FastAPI framework
from fastapi import FastAPI

# Allows frontend to talk to backend
from fastapi.middleware.cors import CORSMiddleware

# Data validation for incoming JSON
from pydantic import BaseModel

# Import our scanner engine
from services.scanner_service import scan_website


# Create FastAPI app
app = FastAPI()


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
class UrlRequest(BaseModel):

    url: str


# Simple test route
@app.get("/")
def home():

    return {
        "message":
        "Ethical Hacking Dashboard #47 backend is alive"
    }

# Main scanner API route
@app.post("/scan-url")
def scan_url(request: UrlRequest):

    # Send URL into scanner engine
    # located inside services/scanner_service.py
    return scan_website(request.url)

# Recent security events API route
@app.get("/events")
def get_events():
    return {
        "events": get_recent_events()
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