from fastapi import APIRouter
from pydantic import BaseModel, Field

from utils.settings_service import get_app_settings, get_or_create_settings
from db.database import SessionLocal


router = APIRouter()


class SettingsUpdate(BaseModel):
    max_file_size: int = Field(ge=1, le=500)
    max_archive_depth: int = Field(ge=1, le=10)
    zip_inspection: bool
    ai_analysis: bool
    websocket_enabled: bool


@router.get("/settings")
def get_settings():
    return get_app_settings()


@router.put("/settings")
def update_settings(payload: SettingsUpdate):
    db = SessionLocal()

    try:
        settings = get_or_create_settings(db)

        settings.max_file_size = payload.max_file_size
        settings.max_archive_depth = payload.max_archive_depth
        settings.zip_inspection = payload.zip_inspection
        settings.ai_analysis = payload.ai_analysis
        settings.websocket_enabled = payload.websocket_enabled

        db.commit()
        db.refresh(settings)

        return {
            "max_file_size": settings.max_file_size,
            "max_archive_depth": settings.max_archive_depth,
            "zip_inspection": settings.zip_inspection,
            "ai_analysis": settings.ai_analysis,
            "websocket_enabled": settings.websocket_enabled,
        }
    finally:
        db.close()
