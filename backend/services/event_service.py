from datetime import datetime


# Temporary in-memory event storage
# Later this will move to PostgreSQL or WebSockets
security_events = []


def create_event(event_type: str, severity: str, message: str):
    """
    Creates a security event.

    event_type examples:
    - SCAN
    - THREAT
    - SYSTEM
    - NETWORK

    severity examples:
    - LOW
    - MEDIUM
    - HIGH
    """

    event = {
        "type": event_type,
        "severity": severity,
        "message": message,
        "timestamp": datetime.now().isoformat(),
    }

    security_events.insert(0, event)

    return event


def get_recent_events(limit: int = 10):
    """
    Returns latest security events.
    """

    return security_events[:limit]