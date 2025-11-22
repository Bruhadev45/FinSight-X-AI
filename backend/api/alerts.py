"""
Alerts API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import logging

from config.database import get_db
from models.alert import Alert, AlertStatus, AlertSeverity

logger = logging.getLogger(__name__)

router = APIRouter()


class AlertAcknowledge(BaseModel):
    alertId: int


class AlertResolve(BaseModel):
    alertId: int


@router.get("/alerts")
async def list_alerts(
    status: Optional[str] = Query(default=None),
    limit: int = Query(default=50),
    db: Session = Depends(get_db)
):
    """List alerts with optional filtering"""
    try:
        query = db.query(Alert)

        if status:
            query = query.filter(Alert.status == AlertStatus(status))

        alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()

        return {
            "success": True,
            "alerts": [
                {
                    "id": a.id,
                    "title": a.title,
                    "message": a.message,
                    "severity": a.severity.value,
                    "status": a.status.value,
                    "source": a.source,
                    "created_at": a.created_at.isoformat(),
                    "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
                    "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None
                }
                for a in alerts
            ],
        }

    except Exception as e:
        logger.error(f"Failed to list alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/acknowledge")
async def acknowledge_alert(
    request: AlertAcknowledge,
    db: Session = Depends(get_db)
):
    """Acknowledge an alert"""
    try:
        alert = db.query(Alert).filter(Alert.id == request.alertId).first()

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.status = AlertStatus.ACKNOWLEDGED
        alert.acknowledged_at = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "message": "Alert acknowledged successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to acknowledge alert: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/resolve")
async def resolve_alert(
    request: AlertResolve,
    db: Session = Depends(get_db)
):
    """Resolve an alert"""
    try:
        alert = db.query(Alert).filter(Alert.id == request.alertId).first()

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "message": "Alert resolved successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resolve alert: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
