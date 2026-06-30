from datetime import datetime
import json

from db.database import SessionLocal
from db.models import IOCRecord


VALID_IOC_TYPES = [
    "IP",
    "DOMAIN",
    "URL",
    "SHA256",
    "SHA1",
    "MD5",
    "CVE",
    "EMAIL",
]


def normalize_ioc_value(ioc_type: str, value: str):
    value = value.strip()

    if ioc_type in ["IP", "DOMAIN", "URL", "EMAIL"]:
        return value.lower()

    return value


def create_ioc_record(data: dict):
    ioc_type = data.get("ioc_type", "").upper()
    value = normalize_ioc_value(ioc_type, data.get("value", ""))

    if ioc_type not in VALID_IOC_TYPES:
        return {
            "error": "Invalid IOC type",
            "valid_types": VALID_IOC_TYPES,
        }

    if not value:
        return {
            "error": "IOC value is required",
        }

    db = SessionLocal()

    try:
        existing = (
            db.query(IOCRecord)
            .filter(
                IOCRecord.ioc_type == ioc_type,
                IOCRecord.value == value,
            )
            .first()
        )

        now = datetime.now().isoformat()

        if existing:
            existing.severity = data.get("severity", existing.severity)
            existing.source = data.get("source", existing.source)
            existing.description = data.get("description", existing.description)
            existing.tags = json.dumps(data.get("tags", []))
            existing.updated_at = now

            db.commit()
            db.refresh(existing)

            return serialize_ioc(existing)

        record = IOCRecord(
            ioc_type=ioc_type,
            value=value,
            severity=data.get("severity", "UNKNOWN").upper(),
            source=data.get("source", "Local RavShield IOC Database"),
            description=data.get("description", ""),
            tags=json.dumps(data.get("tags", [])),
            created_at=now,
            updated_at=now,
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return serialize_ioc(record)

    finally:
        db.close()


def list_ioc_records(limit: int = 100):
    db = SessionLocal()

    try:
        records = (
            db.query(IOCRecord)
            .order_by(IOCRecord.id.desc())
            .limit(limit)
            .all()
        )

        return [serialize_ioc(record) for record in records]

    finally:
        db.close()


def check_ioc_record(ioc_type: str, value: str):
    ioc_type = ioc_type.upper()
    value = normalize_ioc_value(ioc_type, value)

    db = SessionLocal()

    try:
        record = (
            db.query(IOCRecord)
            .filter(
                IOCRecord.ioc_type == ioc_type,
                IOCRecord.value == value,
            )
            .first()
        )

        if not record:
            return {
                "matched": False,
                "ioc_type": ioc_type,
                "value": value,
                "message": "No IOC match found.",
            }

        return {
            "matched": True,
            "record": serialize_ioc(record),
        }

    finally:
        db.close()


def delete_ioc_record(ioc_id: int):
    db = SessionLocal()

    try:
        record = (
            db.query(IOCRecord)
            .filter(IOCRecord.id == ioc_id)
            .first()
        )

        if not record:
            return False

        db.delete(record)
        db.commit()

        return True

    finally:
        db.close()


def serialize_ioc(record: IOCRecord):
    try:
        tags = json.loads(record.tags or "[]")
    except Exception:
        tags = []

    return {
        "id": record.id,
        "ioc_type": record.ioc_type,
        "value": record.value,
        "severity": record.severity,
        "source": record.source,
        "description": record.description,
        "tags": tags,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }