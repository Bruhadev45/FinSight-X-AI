// Enhanced Multi-Agent System with 7 Specialized Agents
import OpenAI from "openai";
import { AgentTask, AgentResponse, OrchestratorResult, RiskLevel } from "@/lib/types/enterprise";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class MultiAgentOrchestrator {
  private agents = {
    parser: this.createParserAgent.bind(this),
    analyzer: this.createAnalyzerAgent.bind(this),
    compliance: this.createComplianceAgent.bind(this),
    fraud: this.createFraudAgent.bind(this),
    alert: this.createAlertAgent.bind(this),
    insight: this.createInsightAgent.bind(this),
  };

  async orchestrate(documentContent: string, fileName: string): Promise<OrchestratorResult> {
    const taskId = crypto.randomUUID();
    const startTime = Date.now();

    // Create tasks for all agents
    const tasks: AgentTask[] = Object.keys(this.agents).map((agentType, index) => ({
      id: crypto.randomUUID(),
      type: agentType as any,
      status: "pending" as const,
      priority: index,
      input: { documentContent, fileName },
    }));

    // Execute all agents in parallel
    const agentResults = await Promise.all(
      tasks.map(async (task) => {
        const startTime = Date.now();
        try {
          const agentFn = this.agents[task.type as keyof typeof this.agents];
          const result = await agentFn(documentContent, fileName);
          return {
            agentType: task.type,
            findings: result.findings,
            confidence: result.confidence,
            processingTime: Date.now() - startTime,
            metadata: result.metadata,
          };
        } catch (error) {
          return {
            agentType: task.type,
            findings: [],
            confidence: 0,
            processingTime: Date.now() - startTime,
            metadata: { error: error instanceof Error ? error.message : "Unknown error" },
          };
        }
      })
    );

    // Aggregate results
    const allFindings = agentResults.flatMap((r) => r.findings);
    const overallRisk = this.calculateOverallRisk(agentResults);
    const keyFindings = this.extractKeyFindings(agentResults);
    const recommendations = this.generateRecommendations(agentResults);

    return {
      taskId,
      agentResults,
      overallRisk,
      keyFindings,
      recommendations,
      executionTime: Date.now() - startTime,
    };
  }

  private async createParserAgent(
    content: string,
    fileName: string
  ): Promise<AgentResponse> {
    const prompt = `You are a Document Parser Agent specialized in extracting structured data from financial documents.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Extract and structure:
1. Document metadata (type, date, company)
2. Financial tables and key figures
3. Section structure
4. Named entities (companies, accounts, amounts)

Return JSON with:
{
  "findings": [
    {
      "type": "metadata|table|entity|section",
      "content": "extracted content",
      "confidence": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "metadata": {
    "tablesFound": number,
    "entitiesFound": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private async createAnalyzerAgent(
    content: string,
    fileName: string
  ): Promise<AgentResponse> {
    const prompt = `You are a Financial Analyzer Agent that computes KPIs and performs trend analysis.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Analyze and calculate:
1. Key financial ratios (ROE, ROI, D/E, Current Ratio, etc.)
2. Year-over-year trends
3. Performance metrics
4. Risk indicators

Return JSON with:
{
  "findings": [
    {
      "metric": "metric name",
      "value": number,
      "trend": "up|down|stable",
      "insight": "interpretation",
      "confidence": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "metadata": {
    "metricsCalculated": number,
    "trendsIdentified": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private async createComplianceAgent(
    content: string,
    fileName: string
  ): Promise<AgentResponse> {
    const prompt = `You are a Compliance Monitoring Agent that validates regulatory requirements.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Check compliance with:
1. IFRS/GAAP accounting standards
2. SEBI regulations (if applicable)
3. SOX requirements
4. ESG disclosure standards

Return JSON with:
{
  "findings": [
    {
      "standard": "IFRS|GAAP|SEBI|SOX|ESG",
      "requirement": "specific requirement",
      "status": "compliant|non-compliant|unclear",
      "severity": "low|medium|high",
      "confidence": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "metadata": {
    "checksPerformed": number,
    "issuesFound": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private async createFraudAgent(
    content: string,
    fileName: string
  ): Promise<AgentResponse> {
    const prompt = `You are a Fraud Detection Agent that identifies suspicious patterns and anomalies.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Detect:
1. Revenue manipulation patterns
2. Expense misclassification
3. Hidden liabilities
4. Related-party transactions (undisclosed)
5. Round number bias
6. Duplicate entries

Return JSON with:
{
  "findings": [
    {
      "pattern": "fraud pattern type",
      "description": "detailed description",
      "severity": "low|medium|high|critical",
      "evidence": "supporting evidence",
      "confidence": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "metadata": {
    "patternsChecked": number,
    "suspiciousActivities": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.15,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private async createAlertAgent(
    content: string,
    fileName: string
  ): Promise<AgentResponse> {
    const prompt = `You are an Alert Generation Agent that creates actionable notifications.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Generate alerts for:
1. Critical risk indicators
2. Compliance violations
3. Fraud red flags
4. Performance anomalies

Return JSON with:
{
  "findings": [
    {
      "alertType": "risk|compliance|fraud|performance",
      "severity": "low|medium|high|critical",
      "title": "alert title",
      "description": "alert description",
      "actionRequired": "recommended action",
      "confidence": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "metadata": {
    "alertsGenerated": number,
    "criticalAlerts": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private async createInsightAgent(
    content: string,
    fileName: string
  ): Promise<AgentResponse> {
    const prompt = `You are an Insight Generation Agent that writes plain-language reports and summaries.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Generate:
1. Executive summary
2. Key insights and trends
3. Risk assessment
4. Strategic recommendations

Return JSON with:
{
  "findings": [
    {
      "type": "summary|insight|risk|recommendation",
      "title": "finding title",
      "content": "detailed content",
      "impact": "low|medium|high",
      "confidence": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "metadata": {
    "insightsGenerated": number,
    "recommendationsMade": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private calculateOverallRisk(results: AgentResponse[]): RiskLevel {
    const fraudResult = results.find((r) => r.agentType === "fraud");
    const complianceResult = results.find((r) => r.agentType === "compliance");

    const criticalIssues = results.flatMap((r) =>
      r.findings.filter((f: any) => f.severity === "critical" || f.severity === "high")
    );

    if (criticalIssues.length >= 3) return "critical";
    if (criticalIssues.length >= 1) return "high";
    if (fraudResult && fraudResult.findings.length > 0) return "medium";
    return "low";
  }

  private extractKeyFindings(results: AgentResponse[]): string[] {
    const allFindings = results.flatMap((r) =>
      r.findings.map((f: any) => ({
        ...f,
        agent: r.agentType,
        confidence: f.confidence || r.confidence,
      }))
    );

    // Sort by severity and confidence
    const sorted = allFindings
      .filter((f: any) => f.confidence > 0.7)
      .sort((a: any, b: any) => {
        const severityScore = (s: string) => {
          switch (s) {
            case "critical":
              return 4;
            case "high":
              return 3;
            case "medium":
              return 2;
            default:
              return 1;
          }
        };
        return severityScore(b.severity) - severityScore(a.severity);
      });

    return sorted
      .slice(0, 5)
      .map(
        (f: any) =>
          `[${f.agent}] ${f.description || f.content || f.title || "Finding detected"}`
      );
  }

  private generateRecommendations(results: AgentResponse[]): string[] {
    const recommendations: string[] = [];

    const fraudResult = results.find((r) => r.agentType === "fraud");
    if (fraudResult && fraudResult.findings.length > 0) {
      recommendations.push("Conduct detailed forensic audit of flagged transactions");
    }

    const complianceResult = results.find((r) => r.agentType === "compliance");
    if (complianceResult && complianceResult.findings.some((f: any) => f.status === "non-compliant")) {
      recommendations.push("Address compliance violations with regulatory team");
    }

    const analyzerResult = results.find((r) => r.agentType === "analyzer");
    if (analyzerResult && analyzerResult.findings.some((f: any) => f.trend === "down")) {
      recommendations.push("Review declining metrics and develop improvement plan");
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue monitoring - no critical issues detected");
    }

    return recommendations;
  }
}

export const orchestrator = new MultiAgentOrchestrator();
