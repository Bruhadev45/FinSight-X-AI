"""
Document Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(255), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_url = Column(Text, nullable=True)
    file_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    analysis_result = Column(Text, nullable=True)  # JSON stored as text
    risk_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="documents")
