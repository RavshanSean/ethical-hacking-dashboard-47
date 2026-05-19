from collections import defaultdict

from fastapi import APIRouter

from db.database import SessionLocal
from db.models import SecurityEvent


router = APIRouter()


# Telemetry statistics API
@router.get("/stats")
def get_stats():

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


# Telemetry timeline API
@router.get("/stats/timeline")
def get_timeline_stats():

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