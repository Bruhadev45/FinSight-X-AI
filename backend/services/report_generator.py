"""
Report Generation Service - Generates 7 types of government-compliant reports
"""
import json
from typing import Dict, Any, Optional
from datetime import datetime
from openai import AsyncOpenAI
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class ReportGenerator:
    """Generates professional financial reports using AI"""

    async def generate_report(
        self, report_type: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a financial report based on type and data

        Args:
            report_type: Type of report to generate
            data: Data for the report

        Returns:
            Generated report with content and metadata
        """
        logger.info(f"Generating report: {report_type}")

        report_generators = {
            "investor_memo": self._generate_investor_memo,
            "audit_summary": self._generate_audit_summary,
            "board_deck": self._generate_board_deck,
            "compliance_report": self._generate_compliance_report,
            "risk_report": self._generate_risk_report,
            "tax_filing": self._generate_tax_filing,
            "sec_filing": self._generate_sec_filing,
        }

        if report_type not in report_generators:
            raise ValueError(f"Unknown report type: {report_type}")

        content = await report_generators[report_type](data)

        return {
            "reportType": report_type,
            "content": content,
            "generatedAt": datetime.utcnow().isoformat(),
            "format": "markdown",
        }

    async def _generate_investor_memo(self, data: Dict[str, Any]) -> str:
        """Generate professional investor memo"""
        company_data = data.get("companyData", {})
        financial_data = data.get("financialData", {})
        analysis_findings = data.get("analysisFindings", {})

        prompt = f"""Generate a professional investor memo for {company_data.get('name', 'Company')}.

Financial Data:
{json.dumps(financial_data, indent=2)}

Analysis Results:
{json.dumps(analysis_findings, indent=2)}

Create a comprehensive investor memo with:
1. Executive Summary
2. Financial Performance Analysis
3. Key Metrics & Ratios
4. Risk Assessment
5. Investment Recommendation

Format as professional business document in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a financial analyst creating professional investor memos.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        return completion.choices[0].message.content or ""

    async def _generate_audit_summary(self, data: Dict[str, Any]) -> str:
        """Generate government-compliant audit summary"""
        compliance_checks = data.get("complianceStatus", {})
        audit_findings = data.get("auditFindings", {})

        prompt = f"""Generate a government-compliant audit summary report.

Compliance Status:
{json.dumps(compliance_checks, indent=2)}

Audit Findings:
{json.dumps(audit_findings, indent=2)}

Create a comprehensive audit summary with:
1. Executive Summary
2. Compliance Status (IFRS, GAAP, SOX, SEBI)
3. Fraud Risk Assessment
4. Key Findings & Issues
5. Recommendations
6. Required Actions

Follow government audit standards 2024. Format as professional audit report in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an audit professional creating formal government-compliant audit reports.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        return completion.choices[0].message.content or ""

    async def _generate_board_deck(self, data: Dict[str, Any]) -> str:
        """Generate board presentation deck"""
        executive_summary = data.get("executiveSummary", "")
        key_metrics = data.get("keyMetrics", {})
        strategic_initiatives = data.get("strategicInitiatives", [])

        prompt = f"""Generate a professional board deck presentation.

Executive Summary:
{executive_summary}

Key Metrics:
{json.dumps(key_metrics, indent=2)}

Strategic Initiatives:
{json.dumps(strategic_initiatives, indent=2)}

Create a comprehensive board deck with:
1. Executive Summary
2. Financial Performance Dashboard
3. Key Metrics & KPIs
4. Strategic Initiatives
5. Risks & Opportunities
6. Recommendations

Format as presentation slides in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior executive creating board presentations.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        return completion.choices[0].message.content or ""

    async def _generate_compliance_report(self, data: Dict[str, Any]) -> str:
        """Generate regulatory compliance report"""
        compliance_status = data.get("complianceStatus", {})
        audit_findings = data.get("auditFindings", {})

        prompt = f"""Generate a regulatory compliance report for IFRS/GAAP/SOX/SEBI.

Compliance Status:
{json.dumps(compliance_status, indent=2)}

Audit Findings:
{json.dumps(audit_findings, indent=2)}

Create a comprehensive compliance report with:
1. Regulatory Compliance Summary
2. IFRS/GAAP Compliance Status
3. SOX Compliance Review
4. SEBI Requirements
5. ESG Disclosure Review
6. Audit Findings & Recommendations

Format as professional compliance report in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a compliance officer creating regulatory reports.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        return completion.choices[0].message.content or ""

    async def _generate_risk_report(self, data: Dict[str, Any]) -> str:
        """Generate comprehensive risk assessment report with Monte Carlo simulations"""
        risk_analysis = data.get("riskAnalysis", {})
        predictions = data.get("predictions", {})
        monte_carlo = data.get("monteCarloResults", {})

        prompt = f"""Generate a comprehensive risk assessment report with predictive analytics.

Risk Analysis:
{json.dumps(risk_analysis, indent=2)}

Predictions:
{json.dumps(predictions, indent=2)}

Monte Carlo Simulation Results:
{json.dumps(monte_carlo, indent=2)}

Create a detailed risk report with:
1. Executive Summary
2. Risk Category Analysis (Credit, Market, Operational, Liquidity)
3. Predictive Scenarios
4. Monte Carlo Simulation Results
5. Value at Risk (VaR) Analysis
6. Stress Test Results
7. Risk Mitigation Recommendations

Format as professional risk assessment report in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a risk management expert creating detailed risk assessment reports.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        return completion.choices[0].message.content or ""

    async def _generate_tax_filing(self, data: Dict[str, Any]) -> str:
        """Generate IRS/government-compliant tax filing report"""
        financial_data = data.get("financialData", {})
        tax_year = data.get("taxYear", datetime.now().year)

        prompt = f"""Generate an IRS/government-compliant tax filing report.

Tax Year: {tax_year}
Financial Data:
{json.dumps(financial_data, indent=2)}

Create a comprehensive tax filing report with:
1. Tax Summary Overview
2. Income Statement for Tax Purposes
3. Deductions and Credits
4. Tax Liability Calculation
5. Payment Schedule
6. Supporting Documentation Requirements

Follow IRS and government tax filing standards. Format as official tax document in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a certified tax professional creating government-compliant tax filing documents.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
        )

        return completion.choices[0].message.content or ""

    async def _generate_sec_filing(self, data: Dict[str, Any]) -> str:
        """Generate SEC filing (10-K/10-Q) compliant report"""
        company_data = data.get("companyData", {})
        filing_type = data.get("filingType", "10-K")
        fiscal_period = data.get("fiscalPeriod", "")

        prompt = f"""Generate an SEC filing ({filing_type}) compliant report.

Company Data:
{json.dumps(company_data, indent=2)}

Filing Type: {filing_type}
Fiscal Period: {fiscal_period}

Create a comprehensive SEC filing with:
1. Cover Page and Filing Information
2. Business Overview
3. Risk Factors
4. Financial Statements (Balance Sheet, Income Statement, Cash Flow)
5. Management Discussion & Analysis (MD&A)
6. Controls and Procedures
7. Certifications

Follow SEC EDGAR filing standards. Format as official SEC document in markdown."""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a securities lawyer creating SEC-compliant filing documents.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
        )

        return completion.choices[0].message.content or ""
