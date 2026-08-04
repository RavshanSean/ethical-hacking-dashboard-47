"""Shared access to persisted AppSettings."""

from db.database import SessionLocal
from db.models import AppSettings


DEFAULT_SETTINGS = {
    "max_file_size": 25,
    "max_archive_depth": 2,
    "zip_inspection": True,
    "ai_analysis": True,
    "websocket_enabled": True,
}


def get_or_create_settings(db):
    settings = db.query(AppSettings).first()

    if not settings:
        settings = AppSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def get_app_settings() -> dict:
    db = SessionLocal()
    try:
        settings = get_or_create_settings(db)
        return {
            "max_file_size": settings.max_file_size,
            "max_archive_depth": settings.max_archive_depth,
            "zip_inspection": settings.zip_inspection,
            "ai_analysis": settings.ai_analysis,
            "websocket_enabled": settings.websocket_enabled,
        }
    finally:
        db.close()
