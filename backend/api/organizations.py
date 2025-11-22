"""
Organization Management API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from config.database import get_db
from models.organization import Organization, OrganizationMember, PlanType, MemberRole

logger = logging.getLogger(__name__)

router = APIRouter()


class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    created_at: str

    class Config:
        from_attributes = True


class MemberResponse(BaseModel):
    id: int
    organization_id: int
    user_id: str
    role: str
    joined_at: str

    class Config:
        from_attributes = True


@router.get("/organizations")
async def list_organizations(
    user_id: str = Query(default="demo-user"),
    db: Session = Depends(get_db)
):
    """List organizations for a user"""
    try:
        members = db.query(OrganizationMember).filter(
            OrganizationMember.user_id == user_id
        ).all()

        org_ids = [m.organization_id for m in members]
        organizations = db.query(Organization).filter(
            Organization.id.in_(org_ids)
        ).all() if org_ids else []

        return {
            "success": True,
            "organizations": [
                {
                    "id": org.id,
                    "name": org.name,
                    "slug": org.slug,
                    "plan": org.plan.value,
                    "created_at": org.created_at.isoformat()
                }
                for org in organizations
            ],
        }

    except Exception as e:
        logger.error(f"Failed to list organizations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organization-members")
async def list_members(
    organization_id: int = Query(),
    db: Session = Depends(get_db)
):
    """List members of an organization"""
    try:
        members = db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == organization_id
        ).all()

        return {
            "success": True,
            "members": [
                {
                    "id": m.id,
                    "organization_id": m.organization_id,
                    "user_id": m.user_id,
                    "role": m.role.value,
                    "joined_at": m.joined_at.isoformat()
                }
                for m in members
            ],
        }

    except Exception as e:
        logger.error(f"Failed to list members: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
