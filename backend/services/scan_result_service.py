from datetime import datetime
import json

from sqlalchemy.orm import Session

from db.database import SessionLocal
from db.models import ScanResult


def save_scan_result(scan_data: dict):
    db: Session = SessionLocal()

    scan_result = ScanResult(
        url=scan_data.get("url", ""),
        domain=scan_data.get("domain", ""),
        registrar=scan_data.get("registrar", ""),
        creation_date=str(scan_data.get("creation_date", "")),
        expiration_date=str(scan_data.get("expiration_date", "")),
        risk_score=scan_data.get("risk_score", 0),
        threat_level=scan_data.get("threat_level", "UNKNOWN"),
        reasons=json.dumps(scan_data.get("reasons", [])),
        scripts_detected=scan_data.get("scripts_detected", 0),
        login_forms_detected=scan_data.get("login_forms_detected", 0),
        password_fields_detected=scan_data.get("password_fields_detected", 0),
        camera_microphone_access=str(scan_data.get("camera_microphone_access", False)),
        location_access=str(scan_data.get("location_access", False)),
        notification_access=str(scan_data.get("notification_access", False)),
        scan_type=scan_data.get("scan_type", ""),
        engine_version=scan_data.get("engine_version", ""),
        analysis_source=scan_data.get("analysis_source", ""),
        created_at=datetime.now().isoformat(),
    )

    db.add(scan_result)
    db.commit()
    db.refresh(scan_result)
    db.close()

    return scan_result


def get_recent_scan_results(
    limit: int = 10,
    page: int = 1,
    threat_level: str | None = None,
):
    db: Session = SessionLocal()

    query = db.query(ScanResult)

    if threat_level:
        query = query.filter(
            ScanResult.threat_level == threat_level
        )

    total_results = query.count()

    offset = (page - 1) * limit

    scans = (
        query
        .order_by(ScanResult.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    db.close()

    return {
        "items": [
            {
                "id": scan.id,
                "url": scan.url,
                "domain": scan.domain,
                "risk_score": scan.risk_score,
                "threat_level": scan.threat_level,
                "registrar": scan.registrar,
                "created_at": scan.created_at,
                "scan_type": scan.scan_type,
            }
            for scan in scans
        ],
        "page": page,
        "limit": limit,
        "total_results": total_results,
        "has_next": page * limit < total_results,
    }
    
    
def get_scan_result_by_id(scan_id: int):
    db: Session = SessionLocal()

    scan = (
        db.query(ScanResult)
        .filter(ScanResult.id == scan_id)
        .first()
    )

    db.close()

    if not scan:
        return None

    return {
        "id": scan.id,
        "url": scan.url,
        "domain": scan.domain,
        "registrar": scan.registrar,
        "creation_date": scan.creation_date,
        "expiration_date": scan.expiration_date,
        "risk_score": scan.risk_score,
        "threat_level": scan.threat_level,
        "reasons": scan.reasons,
        "scripts_detected": scan.scripts_detected,
        "login_forms_detected": scan.login_forms_detected,
        "password_fields_detected": scan.password_fields_detected,
        "camera_microphone_access": scan.camera_microphone_access,
        "location_access": scan.location_access,
        "notification_access": scan.notification_access,
        "scan_type": scan.scan_type,
        "engine_version": scan.engine_version,
        "analysis_source": scan.analysis_source,
        "created_at": scan.created_at,
    }