"""
Webhook Management API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import secrets
import json

from config.database import get_db
from models.webhook import Webhook

logger = logging.getLogger(__name__)

router = APIRouter()


class WebhookCreate(BaseModel):
    organizationId: int
    url: HttpUrl
    events: List[str]
    description: Optional[str] = None


class WebhookResponse(BaseModel):
    id: int
    organization_id: int
    url: str
    events: List[str]
    description: Optional[str]
    enabled: bool
    created_at: str

    class Config:
        from_attributes = True


@router.get("/webhooks")
async def list_webhooks(
    organizationId: int = Query(),
    db: Session = Depends(get_db)
):
    """List webhooks for an organization"""
    try:
        webhooks = db.query(Webhook).filter(
            Webhook.organization_id == organizationId
        ).all()

        return {
            "success": True,
            "webhooks": [
                {
                    "id": w.id,
                    "organization_id": w.organization_id,
                    "url": w.url,
                    "events": json.loads(w.events),
                    "description": w.description,
                    "enabled": w.enabled,
                    "created_at": w.created_at.isoformat()
                }
                for w in webhooks
            ],
        }

    except Exception as e:
        logger.error(f"Failed to list webhooks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhooks")
async def create_webhook(
    webhook: WebhookCreate,
    db: Session = Depends(get_db)
):
    """Create a new webhook"""
    try:
        # Generate webhook secret
        secret = secrets.token_urlsafe(32)

        new_webhook = Webhook(
            organization_id=webhook.organizationId,
            url=str(webhook.url),
            secret=secret,
            events=json.dumps(webhook.events),
            description=webhook.description,
            enabled=True
        )

        db.add(new_webhook)
        db.commit()
        db.refresh(new_webhook)

        return {
            "success": True,
            "webhook": {
                "id": new_webhook.id,
                "organization_id": new_webhook.organization_id,
                "url": new_webhook.url,
                "events": json.loads(new_webhook.events),
                "description": new_webhook.description,
                "secret": secret,  # Only returned on creation
                "enabled": new_webhook.enabled,
                "created_at": new_webhook.created_at.isoformat()
            },
            "message": "Webhook created successfully"
        }

    except Exception as e:
        logger.error(f"Failed to create webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/webhooks")
async def delete_webhook(
    webhookId: int = Query(),
    db: Session = Depends(get_db)
):
    """Delete a webhook"""
    try:
        webhook = db.query(Webhook).filter(Webhook.id == webhookId).first()

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        db.delete(webhook)
        db.commit()

        return {
            "success": True,
            "message": "Webhook deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
