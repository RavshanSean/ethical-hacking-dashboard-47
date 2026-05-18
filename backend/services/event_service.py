from sqlalchemy.orm import Session

from db.database import SessionLocal
from db.models import SecurityEvent

from datetime import datetime
import asyncio

from services.websocket_manager import manager

MAX_EVENTS = 50


def create_event(event_type: str, severity: str, message: str):
    event = {
        "type": event_type,
        "severity": severity,
        "message": message,
        "timestamp": datetime.now().isoformat(),
    }

    db: Session = SessionLocal()

    db_event = SecurityEvent(
        event_type=event_type,
        severity=severity,
        message=message,
        timestamp=event["timestamp"],
    )

    db.add(db_event)

    db.commit()

    db.refresh(db_event)

    db.close()
    
    # Broadcast live telemetry to connected dashboards
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast(event))

    except RuntimeError:
        pass

    return event


def get_recent_events(limit: int = 10):

    db: Session = SessionLocal()

    events = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    return [
        {
            "type": event.event_type,
            "severity": event.severity,
            "message": event.message,
            "timestamp": event.timestamp,
        }
        for event in events
    ]