from collections import defaultdict

from db.database import SessionLocal
from db.models import SecurityEvent



def calculate_stats():

    db = SessionLocal()

    total_events = db.query(SecurityEvent).count()

    high_threats = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.severity == "HIGH")
        .count()
    )

    medium_threats = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.severity == "MEDIUM")
        .count()
    )

    low_threats = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.severity == "LOW")
        .count()
    )

    db.close()

    return {
        "total_events": total_events,
        "high_threats": high_threats,
        "medium_threats": medium_threats,
        "low_threats": low_threats,
    }


def calculate_timeline_stats():

    db = SessionLocal()

    events = db.query(SecurityEvent).all()

    timeline = defaultdict(lambda: {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "TOTAL": 0,
    })

    for event in events:

        hour = event.timestamp[:13] + ":00"

        timeline[hour][event.severity] += 1
        timeline[hour]["TOTAL"] += 1

    db.close()

    return {
        "timeline": [
            {
                "time": time,
                "low": values["LOW"],
                "medium": values["MEDIUM"],
                "high": values["HIGH"],
                "total": values["TOTAL"],
            }
            for time, values in sorted(timeline.items())
        ]
    }
    
def get_recent_threats(limit: int = 5):
    db = SessionLocal()

    events = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    return {
        "threats": [
            {
                "id": event.id,
                "type": event.event_type,
                "severity": event.severity,
                "message": event.message,
                "timestamp": event.timestamp,
            }
            for event in events
        ]
    }