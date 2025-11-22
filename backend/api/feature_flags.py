"""
Feature Flags API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging
import json

from config.database import get_db
from models.feature_flag import FeatureFlag

logger = logging.getLogger(__name__)

router = APIRouter()


class FeatureFlagCreate(BaseModel):
    organizationId: int
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    enabled: bool = True


@router.get("/feature-flags")
async def list_feature_flags(
    organizationId: int = Query(),
    db: Session = Depends(get_db)
):
    """List feature flags for an organization"""
    try:
        flags = db.query(FeatureFlag).filter(
            FeatureFlag.organization_id == organizationId,
            FeatureFlag.enabled == True
        ).all()

        return {
            "success": True,
            "flags": [
                {
                    "id": f.id,
                    "key": f.key,
                    "value": json.loads(f.value),
                    "description": f.description,
                    "enabled": f.enabled
                }
                for f in flags
            ],
        }

    except Exception as e:
        logger.error(f"Failed to list feature flags: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feature-flags")
async def create_feature_flag(
    flag: FeatureFlagCreate,
    db: Session = Depends(get_db)
):
    """Create or update a feature flag"""
    try:
        # Check if flag exists
        existing = db.query(FeatureFlag).filter(
            FeatureFlag.organization_id == flag.organizationId,
            FeatureFlag.key == flag.key
        ).first()

        if existing:
            # Update existing flag
            existing.value = json.dumps(flag.value)
            existing.description = flag.description
            existing.enabled = flag.enabled
            db.commit()
            db.refresh(existing)
            flag_obj = existing
        else:
            # Create new flag
            new_flag = FeatureFlag(
                organization_id=flag.organizationId,
                key=flag.key,
                value=json.dumps(flag.value),
                description=flag.description,
                enabled=flag.enabled
            )
            db.add(new_flag)
            db.commit()
            db.refresh(new_flag)
            flag_obj = new_flag

        return {
            "success": True,
            "flag": {
                "id": flag_obj.id,
                "key": flag_obj.key,
                "value": json.loads(flag_obj.value),
                "description": flag_obj.description,
                "enabled": flag_obj.enabled
            },
            "message": "Feature flag saved successfully"
        }

    except Exception as e:
        logger.error(f"Failed to save feature flag: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/feature-flags")
async def delete_feature_flag(
    flagId: int = Query(),
    db: Session = Depends(get_db)
):
    """Delete a feature flag"""
    try:
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == flagId).first()

        if not flag:
            raise HTTPException(status_code=404, detail="Feature flag not found")

        db.delete(flag)
        db.commit()

        return {
            "success": True,
            "message": "Feature flag deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete feature flag: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
