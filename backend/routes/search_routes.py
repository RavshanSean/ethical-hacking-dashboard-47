from fastapi import APIRouter, Query
from sqlalchemy import or_

from db.database import SessionLocal
from db.models import SecurityEvent, ScanResult


router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def global_search(q: str = Query(..., min_length=1)):
    query_text = f"%{q}%"

    db = SessionLocal()

    events = (
        db.query(SecurityEvent)
        .filter(
            or_(
                SecurityEvent.event_type.ilike(query_text),
                SecurityEvent.severity.ilike(query_text),
                SecurityEvent.message.ilike(query_text),
                SecurityEvent.country.ilike(query_text),
                SecurityEvent.city.ilike(query_text),
            )
        )
        .order_by(SecurityEvent.id.desc())
        .limit(5)
        .all()
    )

    scans = (
        db.query(ScanResult)
        .filter(
            or_(
                ScanResult.url.ilike(query_text),
                ScanResult.domain.ilike(query_text),
                ScanResult.threat_level.ilike(query_text),
                ScanResult.registrar.ilike(query_text),
            )
        )
        .order_by(ScanResult.id.desc())
        .limit(5)
        .all()
    )

    db.close()

    return {
        "query": q,
        "events": [
            {
                "id": event.id,
                "type": event.event_type,
                "severity": event.severity,
                "message": event.message,
                "timestamp": event.timestamp,
            }
            for event in events
        ],
        "scans": [
            {
                "id": scan.id,
                "url": scan.url,
                "domain": scan.domain,
                "risk_score": scan.risk_score,
                "threat_level": scan.threat_level,
                "created_at": scan.created_at,
            }
            for scan in scans
        ],
    }