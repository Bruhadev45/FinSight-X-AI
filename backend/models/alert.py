"""
Alert Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, Boolean
from datetime import datetime
import enum
from config.database import Base


class AlertSeverity(str, enum.Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, enum.Enum):
    UNREAD = "unread"
    READ = "read"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.INFO, index=True)
    status = Column(Enum(AlertStatus), default=AlertStatus.UNREAD)
    source = Column(String(255), nullable=True)
    alert_metadata = Column(Text, nullable=True)  # JSON stored as text (renamed from metadata)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
