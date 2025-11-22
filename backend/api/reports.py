"""
Report Generation API Endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

from services.report_generator import ReportGenerator

logger = logging.getLogger(__name__)

router = APIRouter()
report_generator = ReportGenerator()


class ReportRequest(BaseModel):
    reportType: str
    data: Dict[str, Any]
    organizationId: Optional[int] = 1


class ReportResponse(BaseModel):
    success: bool
    report: dict
    message: str


@router.post("/reports/generate", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate financial reports

    Supported report types:
    - investor_memo: Professional investor memo
    - audit_summary: Government-compliant audit summary
    - board_deck: Board presentation deck
    - compliance_report: Regulatory compliance report
    - risk_report: Risk assessment with Monte Carlo simulations
    - tax_filing: IRS/government tax filing report
    - sec_filing: SEC filing (10-K/10-Q)
    """
    try:
        logger.info(f"Generating report: {request.reportType}")

        report = await report_generator.generate_report(
            request.reportType,
            request.data
        )

        return ReportResponse(
            success=True,
            report=report,
            message=f"Report generated successfully: {request.reportType}"
        )

    except ValueError as e:
        logger.error(f"Invalid report type: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
