from sqlalchemy import Column, Integer, String
from db.database import Base



class SecurityEvent(Base):
    """
    Stores backend security telemetry events.
    """

    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)

    event_type = Column(String)

    severity = Column(String)

    message = Column(String)

    timestamp = Column(String)
    
    
class ScanResult(Base):
    """
    Stores full URL scan results.

    This is different from SecurityEvent:
    - SecurityEvent = timeline/log event
    - ScanResult = full scan report/history
    """

    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)

    url = Column(String)
    domain = Column(String)

    registrar = Column(String)
    creation_date = Column(String)
    expiration_date = Column(String)

    risk_score = Column(Integer)
    threat_level = Column(String)

    reasons = Column(String)

    scripts_detected = Column(Integer)
    login_forms_detected = Column(Integer)
    password_fields_detected = Column(Integer)

    camera_microphone_access = Column(String)
    location_access = Column(String)
    notification_access = Column(String)

    scan_type = Column(String)
    engine_version = Column(String)
    analysis_source = Column(String)

    created_at = Column(String)