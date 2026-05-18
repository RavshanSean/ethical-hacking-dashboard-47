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