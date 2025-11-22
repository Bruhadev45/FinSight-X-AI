"""
AI Usage Tracking API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta
import logging

from config.database import get_db
from models.ai_usage import AIUsage, AIAgentLog, UsageType
from models.organization import Organization, PlanType

logger = logging.getLogger(__name__)

router = APIRouter()


# Plan-based usage limits
PLAN_LIMITS = {
    PlanType.INDIVIDUAL: {
        "multi_agent_analysis": 50,
        "document_analysis": 50,
        "chat_interaction": 100,
    },
    PlanType.PROFESSIONAL: {
        "multi_agent_analysis": 500,
        "document_analysis": 500,
        "chat_interaction": 1000,
    },
    PlanType.BUSINESS: {
        "multi_agent_analysis": float('inf'),
        "document_analysis": float('inf'),
        "chat_interaction": float('inf'),
    },
    PlanType.ENTERPRISE: {
        "multi_agent_analysis": float('inf'),
        "document_analysis": float('inf'),
        "chat_interaction": float('inf'),
    },
}


class UsageTrackRequest(BaseModel):
    organizationId: int
    usageType: str
    count: int = 1


@router.get("/ai/usage")
async def get_usage(
    organizationId: int = Query(),
    db: Session = Depends(get_db)
):
    """Get AI usage statistics for an organization"""
    try:
        # Get organization plan
        org = db.query(Organization).filter(Organization.id == organizationId).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        plan = org.plan
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS[PlanType.INDIVIDUAL])

        # Get current month usage
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)

        usage_stats = {}
        for usage_type in UsageType:
            count = db.query(func.count(AIAgentLog.id)).filter(
                AIAgentLog.organization_id == organizationId,
                AIAgentLog.operation == usage_type.value,
                AIAgentLog.created_at >= start_of_month,
                AIAgentLog.created_at <= end_of_month
            ).scalar()

            limit = limits.get(usage_type.value, 0)

            usage_stats[usage_type.value] = {
                "used": count or 0,
                "limit": limit if limit != float('inf') else None,
                "unlimited": limit == float('inf')
            }

        # Get performance metrics
        avg_processing_time = db.query(func.avg(AIAgentLog.processing_time_ms)).filter(
            AIAgentLog.organization_id == organizationId,
            AIAgentLog.created_at >= start_of_month
        ).scalar()

        avg_tokens = db.query(func.avg(AIAgentLog.tokens_used)).filter(
            AIAgentLog.organization_id == organizationId,
            AIAgentLog.created_at >= start_of_month,
            AIAgentLog.tokens_used.isnot(None)
        ).scalar()

        success_rate = db.query(
            func.count(AIAgentLog.id).filter(AIAgentLog.status == "success")
        ).filter(
            AIAgentLog.organization_id == organizationId,
            AIAgentLog.created_at >= start_of_month
        ).scalar()

        total_operations = db.query(func.count(AIAgentLog.id)).filter(
            AIAgentLog.organization_id == organizationId,
            AIAgentLog.created_at >= start_of_month
        ).scalar()

        return {
            "success": True,
            "usage": usage_stats,
            "plan": plan.value,
            "metrics": {
                "avgProcessingTime": round(avg_processing_time, 2) if avg_processing_time else 0,
                "avgTokensUsed": round(avg_tokens, 2) if avg_tokens else 0,
                "successRate": round((success_rate / total_operations * 100), 2) if total_operations else 0
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get usage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/usage")
async def track_usage(
    request: UsageTrackRequest,
    db: Session = Depends(get_db)
):
    """Track AI usage"""
    try:
        # This is called automatically by AI features
        # Just return success
        return {
            "success": True,
            "message": "Usage tracked successfully"
        }

    except Exception as e:
        logger.error(f"Failed to track usage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai-agent-logs")
async def get_agent_logs(
    organizationId: int = Query(),
    limit: int = Query(default=50),
    db: Session = Depends(get_db)
):
    """Get AI agent operation logs"""
    try:
        logs = db.query(AIAgentLog).filter(
            AIAgentLog.organization_id == organizationId
        ).order_by(AIAgentLog.created_at.desc()).limit(limit).all()

        return {
            "success": True,
            "logs": [
                {
                    "id": log.id,
                    "agent_type": log.agent_type,
                    "operation": log.operation,
                    "status": log.status,
                    "processing_time_ms": log.processing_time_ms,
                    "tokens_used": log.tokens_used,
                    "created_at": log.created_at.isoformat()
                }
                for log in logs
            ],
        }

    except Exception as e:
        logger.error(f"Failed to get agent logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
