from routes.websocket_routes import router as websocket_router
from routes.scanner_routes import router as scanner_router
from routes.event_routes import router as event_router
from routes.stats_routes import router as stats_router
from routes.scan_result_routes import router as scan_result_router
from routes.file_routes import router as file_router
from routes.threat_map_routes import router as threat_map_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from db import models

# Create FastAPI app
app = FastAPI()
app.include_router(scanner_router)
app.include_router(event_router)
app.include_router(stats_router)
app.include_router(websocket_router)
app.include_router(scan_result_router)
app.include_router(file_router)
app.include_router(threat_map_router)

# Create database tables
Base.metadata.create_all(bind=engine)

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

# Simple test route
@app.get("/")
def home():

    return {
        "message":
        "Ethical Hacking Dashboard #47 backend is alive"
    }