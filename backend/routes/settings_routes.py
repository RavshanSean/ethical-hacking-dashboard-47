from fastapi import APIRouter
from pydantic import BaseModel

from db.database import SessionLocal
from db.models import AppSettings


router = APIRouter()


class SettingsUpdate(BaseModel):
    max_file_size: int
    max_archive_depth: int
    zip_inspection: bool
    ai_analysis: bool
    websocket_enabled: bool


def get_or_create_settings(db):
    settings = db.query(AppSettings).first()

    if not settings:
        settings = AppSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.get("/settings")
def get_settings():
    db = SessionLocal()

    settings = get_or_create_settings(db)

    result = {
        "max_file_size": settings.max_file_size,
        "max_archive_depth": settings.max_archive_depth,
        "zip_inspection": settings.zip_inspection,
        "ai_analysis": settings.ai_analysis,
        "websocket_enabled": settings.websocket_enabled,
    }

    db.close()

    return result


@router.put("/settings")
def update_settings(payload: SettingsUpdate):
    db = SessionLocal()

    settings = get_or_create_settings(db)

    settings.max_file_size = payload.max_file_size
    settings.max_archive_depth = payload.max_archive_depth
    settings.zip_inspection = payload.zip_inspection
    settings.ai_analysis = payload.ai_analysis
    settings.websocket_enabled = payload.websocket_enabled

    db.commit()
    db.refresh(settings)

    result = {
        "max_file_size": settings.max_file_size,
        "max_archive_depth": settings.max_archive_depth,
        "zip_inspection": settings.zip_inspection,
        "ai_analysis": settings.ai_analysis,
        "websocket_enabled": settings.websocket_enabled,
    }

    db.close()

    return result