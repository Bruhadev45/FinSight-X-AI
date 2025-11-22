"""
Organization Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base


class PlanType(str, enum.Enum):
    INDIVIDUAL = "individual"
    PROFESSIONAL = "professional"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


class MemberRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    # logo = Column(Text, nullable=True)  # Optional - not in existing DB
    plan = Column(Enum(PlanType), default=PlanType.INDIVIDUAL)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    members = relationship("OrganizationMember", back_populates="organization")
    documents = relationship("Document", back_populates="organization")
    webhooks = relationship("Webhook", back_populates="organization")
    feature_flags = relationship("FeatureFlag", back_populates="organization")
    ai_usage = relationship("AIUsage", back_populates="organization")


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(255), nullable=False)
    role = Column(Enum(MemberRole), default=MemberRole.MEMBER)
    permissions = Column(Text, nullable=True)  # JSON stored as text
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="members")
