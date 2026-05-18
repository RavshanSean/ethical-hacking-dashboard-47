from datetime import datetime
import asyncio

from services.websocket_manager import manager


security_events = []

MAX_EVENTS = 50


def create_event(event_type: str, severity: str, message: str):
    event = {
        "type": event_type,
        "severity": severity,
        "message": message,
        "timestamp": datetime.now().isoformat(),
    }

    security_events.insert(0, event)

    del security_events[MAX_EVENTS:]

    # Try to broadcast event to connected frontend dashboards
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast(event))
    except RuntimeError:
        pass

    return event


def get_recent_events(limit: int = 10):
    return security_events[:limit]