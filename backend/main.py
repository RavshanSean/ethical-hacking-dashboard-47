from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import Base, engine
from db import models
from utils.auth_utils import get_current_user

from routes.websocket_routes import router as websocket_router
from routes.scanner_routes import router as scanner_router
from routes.event_routes import router as event_router
from routes.stats_routes import router as stats_router
from routes.scan_result_routes import router as scan_result_router
from routes.file_routes import router as file_router
from routes.threat_map_routes import router as threat_map_router
from routes.settings_routes import router as settings_router
from routes.auth_routes import router as auth_router
from routes.system_routes import router as system_router
from routes.vulnerability_routes import router as vulnerability_router
from routes.process_routes import router as process_router
from routes.network_routes import router as network_router
from routes.quarantine_routes import router as quarantine_router
from routes.browser_protection_routes import router as browser_protection_router
from routes.ip_lookup_routes import router as ip_lookup_router
from routes.ai_copilot_routes import router as ai_copilot_router
from routes.search_routes import router as search_router
from routes.report_routes import router as report_router
from routes.threat_intel_routes import router as threat_intel_router
from routes.ioc_routes import router as ioc_router


app = FastAPI()

# Public: auth + health. Everything else requires a valid JWT.
protected = [Depends(get_current_user)]

app.include_router(auth_router)
app.include_router(scanner_router, dependencies=protected)
app.include_router(event_router, dependencies=protected)
app.include_router(stats_router, dependencies=protected)
app.include_router(websocket_router)
app.include_router(scan_result_router, dependencies=protected)
app.include_router(file_router, dependencies=protected)
app.include_router(threat_map_router, dependencies=protected)
app.include_router(settings_router, dependencies=protected)
app.include_router(system_router, dependencies=protected)
app.include_router(vulnerability_router, dependencies=protected)
app.include_router(process_router, dependencies=protected)
app.include_router(network_router, dependencies=protected)
app.include_router(quarantine_router, dependencies=protected)
app.include_router(browser_protection_router, dependencies=protected)
app.include_router(ip_lookup_router, dependencies=protected)
app.include_router(ai_copilot_router, dependencies=protected)
app.include_router(search_router, dependencies=protected)
app.include_router(report_router, dependencies=protected)
app.include_router(threat_intel_router, dependencies=protected)
app.include_router(ioc_router, dependencies=protected)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Ethical Hacking Dashboard #47 backend is alive"
    }
