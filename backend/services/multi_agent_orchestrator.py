"""
Multi-Agent Orchestrator - Coordinates 6 specialized AI agents for financial document analysis
"""
import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from openai import AsyncOpenAI
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class MultiAgentOrchestrator:
    """Orchestrates multiple AI agents for comprehensive financial analysis"""

    def __init__(self):
        self.agents = {
            "parser": self._create_parser_agent,
            "analyzer": self._create_analyzer_agent,
            "compliance": self._create_compliance_agent,
            "fraud": self._create_fraud_agent,
            "alert": self._create_alert_agent,
            "insight": self._create_insight_agent,
        }

    async def orchestrate(
        self, document_content: str, file_name: str
    ) -> Dict[str, Any]:
        """
        Orchestrate all agents to analyze a financial document

        Args:
            document_content: The content of the financial document
            file_name: Name of the file being analyzed

        Returns:
            Comprehensive analysis results from all agents
        """
        task_id = str(uuid.uuid4())
        start_time = datetime.now()

        logger.info(f"Starting multi-agent analysis: {task_id} for {file_name}")

        # Execute all agents in parallel
        tasks = [
            self._execute_agent(agent_type, agent_fn, document_content, file_name)
            for agent_type, agent_fn in self.agents.items()
        ]

        agent_results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        processed_results = []
        for i, result in enumerate(agent_results):
            agent_type = list(self.agents.keys())[i]
            if isinstance(result, Exception):
                logger.error(f"Agent {agent_type} failed: {str(result)}")
                processed_results.append({
                    "agentType": agent_type,
                    "findings": [],
                    "confidence": 0,
                    "processingTime": 0,
                    "metadata": {"error": str(result)},
                })
            else:
                processed_results.append(result)

        # Aggregate results
        all_findings = [
            finding
            for result in processed_results
            for finding in result.get("findings", [])
        ]
        overall_risk = self._calculate_overall_risk(processed_results)
        key_findings = self._extract_key_findings(processed_results)
        recommendations = self._generate_recommendations(processed_results)

        execution_time = (datetime.now() - start_time).total_seconds() * 1000

        logger.info(f"Multi-agent analysis completed: {task_id} in {execution_time}ms")

        return {
            "taskId": task_id,
            "agentResults": processed_results,
            "overallRisk": overall_risk,
            "keyFindings": key_findings,
            "recommendations": recommendations,
            "executionTime": int(execution_time),
        }

    async def _execute_agent(
        self, agent_type: str, agent_fn, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Execute a single agent and measure performance"""
        start_time = datetime.now()

        try:
            result = await agent_fn(content, file_name)
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            return {
                "agentType": agent_type,
                "findings": result.get("findings", []),
                "confidence": result.get("confidence", 0),
                "processingTime": int(processing_time),
                "metadata": result.get("metadata", {}),
            }
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.error(f"Agent {agent_type} failed: {str(e)}")
            raise

    async def _create_parser_agent(
        self, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Parser Agent - Extracts structured data from financial documents"""
        prompt = f"""You are a Document Parser Agent specialized in extracting structured data from financial documents.

Document: {file_name}
Content: {content[:4000]}

Extract and structure:
1. Document metadata (type, date, company)
2. Financial tables and key figures
3. Section structure
4. Named entities (companies, accounts, amounts)

Return JSON with:
{{
  "findings": [
    {{
      "type": "metadata|table|entity|section",
      "content": "extracted content",
      "confidence": 0.0-1.0
    }}
  ],
  "confidence": 0.0-1.0,
  "metadata": {{
    "tablesFound": number,
    "entitiesFound": number
  }}
}}"""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        return json.loads(completion.choices[0].message.content or "{}")

    async def _create_analyzer_agent(
        self, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Analyzer Agent - Calculates KPIs and financial ratios"""
        prompt = f"""You are a Financial Analyzer Agent that computes KPIs and performs trend analysis.

Document: {file_name}
Content: {content[:4000]}

Analyze and calculate:
1. Key financial ratios (ROE, ROI, D/E, Current Ratio, etc.)
2. Year-over-year trends
3. Performance metrics
4. Risk indicators

Return JSON with:
{{
  "findings": [
    {{
      "metric": "metric name",
      "value": number,
      "trend": "up|down|stable",
      "insight": "interpretation",
      "confidence": 0.0-1.0
    }}
  ],
  "confidence": 0.0-1.0,
  "metadata": {{
    "metricsCalculated": number,
    "trendsIdentified": number
  }}
}}"""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        return json.loads(completion.choices[0].message.content or "{}")

    async def _create_compliance_agent(
        self, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Compliance Agent - Validates regulatory compliance"""
        prompt = f"""You are a Compliance Agent validating adherence to financial regulations.

Document: {file_name}
Content: {content[:4000]}

Check compliance with:
1. IFRS (International Financial Reporting Standards)
2. GAAP (Generally Accepted Accounting Principles)
3. SOX (Sarbanes-Oxley Act)
4. SEBI (Securities and Exchange Board of India)
5. ESG (Environmental, Social, Governance)

Return JSON with:
{{
  "findings": [
    {{
      "regulation": "IFRS|GAAP|SOX|SEBI|ESG",
      "status": "compliant|non-compliant|unclear",
      "details": "explanation",
      "severity": "low|medium|high|critical",
      "confidence": 0.0-1.0
    }}
  ],
  "confidence": 0.0-1.0,
  "metadata": {{
    "regulationsChecked": number,
    "violationsFound": number
  }}
}}"""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        return json.loads(completion.choices[0].message.content or "{}")

    async def _create_fraud_agent(
        self, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Fraud Detection Agent - Identifies financial irregularities"""
        prompt = f"""You are a Fraud Detection Agent specialized in identifying financial irregularities.

Document: {file_name}
Content: {content[:4000]}

Detect:
1. Revenue manipulation patterns
2. Expense misclassification
3. Hidden liabilities
4. Undisclosed related-party transactions
5. Round number bias
6. Duplicate entries
7. Unusual financial patterns

Return JSON with:
{{
  "findings": [
    {{
      "type": "fraud indicator type",
      "description": "detailed description",
      "severity": "low|medium|high|critical",
      "evidence": "supporting evidence",
      "confidence": 0.0-1.0
    }}
  ],
  "confidence": 0.0-1.0,
  "metadata": {{
    "redFlagsFound": number,
    "riskScore": 0-100
  }}
}}"""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        return json.loads(completion.choices[0].message.content or "{}")

    async def _create_alert_agent(
        self, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Alert Agent - Generates actionable alerts"""
        prompt = f"""You are an Alert Agent that generates actionable notifications for critical issues.

Document: {file_name}
Content: {content[:4000]}

Generate alerts for:
1. Critical compliance violations
2. High-risk fraud indicators
3. Significant financial anomalies
4. Urgent action items
5. Regulatory deadlines

Return JSON with:
{{
  "findings": [
    {{
      "title": "alert title",
      "message": "detailed message",
      "severity": "info|low|medium|high|critical",
      "actionRequired": "action to take",
      "deadline": "optional deadline",
      "confidence": 0.0-1.0
    }}
  ],
  "confidence": 0.0-1.0,
  "metadata": {{
    "alertsGenerated": number,
    "criticalAlerts": number
  }}
}}"""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        return json.loads(completion.choices[0].message.content or "{}")

    async def _create_insight_agent(
        self, content: str, file_name: str
    ) -> Dict[str, Any]:
        """Insight Agent - Creates plain-language summaries and recommendations"""
        prompt = f"""You are an Insight Agent that creates plain-language summaries and actionable recommendations.

Document: {file_name}
Content: {content[:4000]}

Provide:
1. Executive summary (2-3 sentences)
2. Key insights in plain language
3. Strategic recommendations
4. Risk assessment
5. Opportunities identified

Return JSON with:
{{
  "findings": [
    {{
      "type": "summary|insight|recommendation|risk|opportunity",
      "content": "plain language content",
      "priority": "low|medium|high",
      "confidence": 0.0-1.0
    }}
  ],
  "confidence": 0.0-1.0,
  "metadata": {{
    "insightsGenerated": number,
    "recommendationsCount": number
  }}
}}"""

        completion = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        return json.loads(completion.choices[0].message.content or "{}")

    def _calculate_overall_risk(self, agent_results: List[Dict]) -> str:
        """Calculate overall risk level from all agent findings"""
        risk_scores = {
            "info": 0,
            "low": 25,
            "medium": 50,
            "high": 75,
            "critical": 100,
        }

        total_score = 0
        count = 0

        for result in agent_results:
            for finding in result.get("findings", []):
                severity = finding.get("severity", "info").lower()
                if severity in risk_scores:
                    total_score += risk_scores[severity]
                    count += 1

        if count == 0:
            return "Low Risk"

        avg_score = total_score / count

        if avg_score >= 75:
            return "Critical Risk"
        elif avg_score >= 50:
            return "High Risk"
        elif avg_score >= 25:
            return "Medium Risk"
        else:
            return "Low Risk"

    def _extract_key_findings(self, agent_results: List[Dict]) -> List[str]:
        """Extract most important findings from all agents"""
        key_findings = []

        for result in agent_results:
            agent_type = result.get("agentType", "")
            findings = result.get("findings", [])

            # Get high-confidence, high-priority findings
            for finding in findings[:3]:  # Top 3 from each agent
                if finding.get("confidence", 0) > 0.7:
                    content = finding.get("content") or finding.get("description") or finding.get("insight", "")
                    if content:
                        key_findings.append(f"[{agent_type.upper()}] {content}")

        return key_findings[:10]  # Return top 10 findings

    def _generate_recommendations(self, agent_results: List[Dict]) -> List[str]:
        """Generate actionable recommendations from agent findings"""
        recommendations = []

        for result in agent_results:
            if result.get("agentType") == "insight":
                findings = result.get("findings", [])
                for finding in findings:
                    if finding.get("type") == "recommendation":
                        recommendations.append(finding.get("content", ""))

        # Add default recommendations if none found
        if not recommendations:
            recommendations = [
                "Continue monitoring financial metrics regularly",
                "Maintain compliance with regulatory requirements",
                "Review and update risk management procedures",
            ]

        return recommendations[:5]  # Top 5 recommendations
