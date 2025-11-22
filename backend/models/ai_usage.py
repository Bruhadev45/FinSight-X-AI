"""
AI Usage Tracking Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base


class UsageType(str, enum.Enum):
    MULTI_AGENT_ANALYSIS = "multi_agent_analysis"
    DOCUMENT_ANALYSIS = "document_analysis"
    CHAT_INTERACTION = "chat_interaction"
    REPORT_GENERATION = "report_generation"


class AIUsage(Base):
    __tablename__ = "usage_tracking"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    usage_type = Column(Enum(UsageType), nullable=False)
    count = Column(Integer, default=0)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="ai_usage")


class AIAgentLog(Base):
    __tablename__ = "ai_agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False, index=True)
    agent_type = Column(String(100), nullable=False)
    operation = Column(String(255), nullable=False)
    input_data = Column(Text, nullable=True)  # JSON stored as text
    output_data = Column(Text, nullable=True)  # JSON stored as text
    tokens_used = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    status = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
