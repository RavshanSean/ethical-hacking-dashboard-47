from datetime import datetime


# Temporary in-memory event storage
security_events = []

# Maximum amount of stored events
MAX_EVENTS = 50


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

    # Add newest event at top
    security_events.insert(0, event)

    # Keep only latest 50 events
    del security_events[MAX_EVENTS:]

    return event


def get_recent_events(limit: int = 10):
    """
    Returns latest security events.
    """

    return security_events[:limit]