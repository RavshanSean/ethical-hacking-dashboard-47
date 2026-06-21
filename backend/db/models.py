from sqlalchemy import Column, Integer, String, Boolean
from db.database import Base
from sqlalchemy import Float



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
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    
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
    
class VulnerabilityScanResult(Base):
    """
    Stores vulnerability scan history.
    """

    __tablename__ = "vulnerability_scan_results"

    id = Column(Integer, primary_key=True, index=True)

    target = Column(String)
    hostname = Column(String)

    score = Column(Integer)
    ssl_valid = Column(Boolean)
    ssl_days_left = Column(Integer, nullable=True)

    security_headers = Column(String)
    findings = Column(String)

    created_at = Column(String)
    
class AppSettings(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)

    max_file_size = Column(Integer, default=25)

    max_archive_depth = Column(Integer, default=2)

    zip_inspection = Column(Boolean, default=True)

    ai_analysis = Column(Boolean, default=True)

    websocket_enabled = Column(Boolean, default=True)
    
    
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True)

    email = Column(String, unique=True, index=True)

    hashed_password = Column(String)

    is_active = Column(Boolean, default=True)