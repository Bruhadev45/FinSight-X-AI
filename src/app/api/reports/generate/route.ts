// Report Generation API
import { NextRequest, NextResponse } from "next/server";
import { reportGenerator } from "@/lib/services/report-generator";

import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Optional auth - allow demo usage without login
    const user = await getCurrentUser(request);
    // Continue even if no user for demo purposes

    const { reportType, data } = await request.json();

    if (!reportType || !data) {
      return NextResponse.json(
        { error: "reportType and data are required" },
        { status: 400 }
      );
    }

    let reportContent = "";

    switch (reportType) {
      case "comprehensive":
        // Generate a comprehensive company report
        reportContent = `# Comprehensive Report: ${data.company?.name || "Company Analysis"}

## Executive Summary
${data.executiveSummary || "Comprehensive analysis report"}

## Company Overview
- **Name**: ${data.company?.name || "N/A"}
- **Industry**: ${data.company?.industry || "N/A"}
- **Country**: ${data.company?.country || "N/A"}
- **Ticker Symbol**: ${data.company?.tickerSymbol || "N/A"}
- **Analysis Period**: ${data.period || "N/A"}

## Key Metrics
${data.keyMetrics?.map((m: any) => `- **${m.label}**: ${m.value}`).join("\n") || "No metrics available"}

## Document Analysis
- **Total Documents Analyzed**: ${data.stats?.totalDocuments || 0}
- **Average Risk Score**: ${data.stats?.avgRiskScore ? `${data.stats.avgRiskScore.toFixed(1)}%` : "N/A"}
- **Total Alerts**: ${data.stats?.totalAlerts || 0}

## Documents by Status
${Object.entries(data.stats?.documentsByStatus || {}).map(([status, count]) => `- **${status}**: ${count}`).join("\n") || "No data"}

## Alerts by Severity
${Object.entries(data.stats?.alertsBySeverity || {}).map(([severity, count]) => `- **${severity}**: ${count}`).join("\n") || "No data"}

## Strategic Insights
${data.strategicInsights?.map((insight: string) => `- ${insight}`).join("\n") || "No insights available"}

## Recent Documents
${data.documents?.slice(0, 10).map((doc: any, i: number) =>
          `${i + 1}. **${doc.fileName}** - Status: ${doc.status}, Risk: ${doc.riskLevel || "N/A"}`
        ).join("\n") || "No documents"}

## Recent Alerts
${data.alerts?.slice(0, 10).map((alert: any, i: number) =>
          `${i + 1}. **${alert.title}** - Severity: ${alert.severity}, Status: ${alert.status}`
        ).join("\n") || "No alerts"}

## Analysis Summary
${data.analysis?.length || 0} analysis records available for detailed review.

---
*Report Generated: ${new Date().toISOString()}*
`;
        break;

      case "investor_memo":
        reportContent = await reportGenerator.generateInvestorMemo(data);
        break;

      case "audit_summary":
        reportContent = await reportGenerator.generateAuditSummary(
          data.complianceChecks || [],
          data.fraudFindings || []
        );
        break;

      case "risk_report":
        reportContent = await reportGenerator.generateRiskReport(
          data.riskAnalysis || {},
          data.predictions || {},
          data.monteCarloResults || {}
        );
        break;

      case "compliance_report":
        reportContent = await reportGenerator.generateComplianceReport(
          data.complianceData || [],
          data.period || "Q1 2024"
        );
        break;

      case "board_deck":
        reportContent = await reportGenerator.generateBoardDeck(
          data.executiveSummary || "",
          data.keyMetrics || [],
          data.strategicInsights || []
        );
        break;

      case "tax_filing":
        reportContent = await reportGenerator.generateTaxFilingReport(
          data.financialData || {},
          data.taxYear || new Date().getFullYear().toString()
        );
        break;

      case "sec_filing":
        reportContent = await reportGenerator.generateSECFiling(
          data.companyData || {},
          data.filingType || "10-K",
          data.fiscalPeriod || "FY2024"
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      reportType,
      content: reportContent,
      generatedAt: new Date().toISOString(),
      format: "markdown",
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate report" },
      { status: 500 }
    );
  }
}