"""
Multi-Agent Analysis API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import logging

from services.multi_agent_orchestrator import MultiAgentOrchestrator
from config.database import get_db
from models.ai_usage import AIAgentLog

logger = logging.getLogger(__name__)

router = APIRouter()
orchestrator = MultiAgentOrchestrator()


class AnalysisRequest(BaseModel):
    fileName: str
    fileContent: str
    organizationId: Optional[int] = 1


class AnalysisResponse(BaseModel):
    success: bool
    data: dict
    message: str


@router.post("/multi-agent-analysis", response_model=AnalysisResponse)
async def analyze_document(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze a financial document using multi-agent AI system

    This endpoint orchestrates 6 specialized AI agents:
    - Parser: Extracts structured data
    - Analyzer: Calculates KPIs and ratios
    - Compliance: Validates regulatory compliance
    - Fraud: Detects irregularities
    - Alert: Generates actionable alerts
    - Insight: Creates plain-language summaries
    """
    try:
        logger.info(f"Starting multi-agent analysis for {request.fileName}")

        # Orchestrate multi-agent analysis
        result = await orchestrator.orchestrate(
            request.fileContent,
            request.fileName
        )

        # Log the operation
        log_entry = AIAgentLog(
            organization_id=request.organizationId,
            agent_type="multi_agent_orchestrator",
            operation="document_analysis",
            input_data=request.fileName,
            output_data=str(result.get("overallRisk", "")),
            tokens_used=None,  # Can be calculated if needed
            processing_time_ms=result.get("executionTime", 0),
            status="success",
        )
        db.add(log_entry)
        db.commit()

        return AnalysisResponse(
            success=True,
            data=result,
            message="Document analyzed successfully"
        )

    except Exception as e:
        logger.error(f"Multi-agent analysis failed: {str(e)}")

        # Log the error
        log_entry = AIAgentLog(
            organization_id=request.organizationId,
            agent_type="multi_agent_orchestrator",
            operation="document_analysis",
            input_data=request.fileName,
            status="error",
            error_message=str(e),
        )
        db.add(log_entry)
        db.commit()

        raise HTTPException(status_code=500, detail=str(e))
