"""
API Key Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from datetime import datetime
from config.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), nullable=False, unique=True, index=True)
    key_prefix = Column(String(20), nullable=False)
    permissions = Column(Text, nullable=False)  # JSON stored as text
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
