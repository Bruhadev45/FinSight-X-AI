"""
Demo Setup API Endpoint
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import logging

from config.database import get_db
from models.organization import Organization, OrganizationMember, PlanType, MemberRole

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/demo-setup")
async def setup_demo(db: Session = Depends(get_db)):
    """Create demo organization and user if not exists"""
    try:
        # Check if demo org exists
        demo_org = db.query(Organization).filter(Organization.slug == "demo-org").first()

        if demo_org:
            return {
                "success": True,
                "organization": {
                    "id": demo_org.id,
                    "name": demo_org.name,
                    "slug": demo_org.slug,
                    "plan": demo_org.plan.value
                },
                "message": "Demo organization already exists"
            }

        # Create demo organization
        demo_org = Organization(
            name="Demo Organization",
            slug="demo-org",
            plan=PlanType.BUSINESS,  # Give demo users business plan
        )
        db.add(demo_org)
        db.commit()
        db.refresh(demo_org)

        # Create demo user membership
        demo_member = OrganizationMember(
            organization_id=demo_org.id,
            user_id="demo-user",
            role=MemberRole.OWNER,
            permissions='{"read": true, "write": true, "delete": true, "admin": true}'
        )
        db.add(demo_member)
        db.commit()

        logger.info(f"Demo organization created: {demo_org.id}")

        return {
            "success": True,
            "organization": {
                "id": demo_org.id,
                "name": demo_org.name,
                "slug": demo_org.slug,
                "plan": demo_org.plan.value
            },
            "message": "Demo organization created successfully"
        }

    except Exception as e:
        logger.error(f"Failed to setup demo: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demo-setup")
async def check_demo(db: Session = Depends(get_db)):
    """Check if demo organization exists"""
    try:
        demo_org = db.query(Organization).filter(Organization.slug == "demo-org").first()

        if demo_org:
            return {
                "success": True,
                "exists": True,
                "organization": {
                    "id": demo_org.id,
                    "name": demo_org.name,
                    "slug": demo_org.slug,
                    "plan": demo_org.plan.value
                }
            }

        return {
            "success": True,
            "exists": False
        }

    except Exception as e:
        logger.error(f"Failed to check demo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
