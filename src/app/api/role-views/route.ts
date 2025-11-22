import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  documents, 
  alerts, 
  companies, 
  financialMetrics,
  complianceChecks,
  documentAnalysis 
} from "@/db/schema";
import { eq, and, desc, sql, count, avg } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as "cfo" | "risk" | "auditor" | null;

    if (!role) {
      return NextResponse.json(
        { error: "Role parameter is required" },
        { status: 400 }
      );
    }

    // Fetch base data
    const [
      allDocuments,
      allAlerts,
      allCompanies,
      allFinancialMetrics,
      allComplianceChecks,
      allDocumentAnalysis
    ] = await Promise.all([
      db.select().from(documents).orderBy(desc(documents.uploadDate)),
      db.select().from(alerts).orderBy(desc(alerts.triggeredAt)),
      db.select().from(companies),
      db.select().from(financialMetrics),
      db.select().from(complianceChecks),
      db.select().from(documentAnalysis)
    ]);

    // Calculate role-specific data
    if (role === "cfo") {
      // CFO View: Financial KPIs and forecasts
      const totalRevenue = allFinancialMetrics
        .reduce((sum, m) => sum + (m.revenue || 0), 0);

      const netIncomes = allFinancialMetrics
        .map(m => m.netIncome || 0);

      const avgProfitMargin = netIncomes.length > 0
        ? netIncomes.reduce((a, b) => a + b, 0) / netIncomes.length
        : 0;

      const ebitdaValues = allFinancialMetrics
        .reduce((sum, m) => sum + (m.ebitda || 0), 0);

      const totalAssets = allFinancialMetrics
        .reduce((sum, m) => sum + (m.totalAssets || 0), 0);

      // Calculate trends (mock for now - in production, compare with previous period)
      const revenueTrend = "+18%";
      const profitTrend = "+2.3%";
      const ebitdaTrend = "+12%";
      const cashTrend = "+8%";

      return NextResponse.json({
        role: "cfo",
        kpis: [
          { 
            label: "Revenue (YTD)", 
            value: `$${(totalRevenue / 1000000).toFixed(1)}M`, 
            trend: revenueTrend 
          },
          { 
            label: "Net Profit Margin", 
            value: `${avgProfitMargin.toFixed(1)}%`, 
            trend: profitTrend 
          },
          { 
            label: "EBITDA", 
            value: `$${(ebitdaValues / 1000000).toFixed(1)}M`, 
            trend: ebitdaTrend 
          },
          {
            label: "Total Assets",
            value: `$${(totalAssets / 1000000).toFixed(1)}M`,
            trend: cashTrend
          }
        ],
        widgets: [
          { name: "Revenue Trends", count: allFinancialMetrics.length },
          { name: "Profitability Analysis", count: netIncomes.length },
          { name: "Cash Flow Forecast", count: allCompanies.length },
          { name: "Investment Overview", count: allDocuments.length }
        ],
        recentActivity: allFinancialMetrics.slice(0, 10).map(m => ({
          id: m.id,
          type: "metric",
          description: `${m.companyName}: Revenue $${(m.revenue || 0) / 1000000}M`,
          timestamp: m.extractedAt
        })),
        companiesCount: allCompanies.length,
        documentsCount: allDocuments.length
      });
    }

    if (role === "risk") {
      // Risk Officer View: Alerts and violations
      const criticalAlerts = allAlerts.filter(a => a.severity === "red" && a.status === "pending");
      const highRiskAlerts = allAlerts.filter(a => a.severity === "red" || a.severity === "yellow");
      const openViolations = allAlerts.filter(a => a.status === "pending");
      
      // Calculate average risk score from compliance checks
      // ComplianceChecks table doesn't have complianceScore field
      const avgRiskScore = 5.0; // Default risk score

      // Group alerts by company for high risk count
      const alertsByCompany = allAlerts.reduce((acc, alert) => {
        const companyId = alert.companyId || "unknown";
        acc[companyId] = (acc[companyId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const highRiskCompanies = Object.values(alertsByCompany).filter(count => count >= 3).length;

      return NextResponse.json({
        role: "risk",
        kpis: [
          { 
            label: "Critical Alerts", 
            value: criticalAlerts.length.toString(), 
            trend: "-2" 
          },
          { 
            label: "High Risk Companies", 
            value: highRiskCompanies.toString(), 
            trend: "+1" 
          },
          { 
            label: "Open Violations", 
            value: openViolations.length.toString(), 
            trend: "0" 
          },
          { 
            label: "Avg Risk Score", 
            value: `${avgRiskScore.toFixed(1)}/10`, 
            trend: "-0.5" 
          }
        ],
        widgets: [
          { name: "Risk Heat Map", count: allCompanies.length },
          { name: "Active Violations", count: openViolations.length },
          { name: "Fraud Alerts", count: allAlerts.filter(a => a.alertType === "fraud").length },
          { name: "Compliance Status", count: allComplianceChecks.length }
        ],
        recentAlerts: allAlerts.slice(0, 10).map(a => ({
          id: a.id,
          type: a.alertType,
          severity: a.severity,
          message: a.description,
          status: a.status,
          timestamp: a.triggeredAt
        })),
        totalAlerts: allAlerts.length,
        criticalCount: criticalAlerts.length
      });
    }

    if (role === "auditor") {
      // Auditor View: Document traces and compliance
      const reviewedDocuments = allDocuments.filter(d => d.status === "completed");
      const pendingDocuments = allDocuments.filter(d => d.status === "processing");
      
      // Audit findings from compliance checks
      const auditFindings = allComplianceChecks.filter(c =>
        c.result === "failed" || c.result === "warning"
      );

      // Calculate average compliance score (schema doesn't have complianceScore field)
      const passedChecks = allComplianceChecks.filter(c => c.result === "passed").length;
      const totalChecks = allComplianceChecks.length;

      const avgComplianceScore = totalChecks > 0
        ? (passedChecks / totalChecks) * 100
        : 0;

      return NextResponse.json({
        role: "auditor",
        kpis: [
          { 
            label: "Documents Reviewed", 
            value: reviewedDocuments.length.toString(), 
            trend: `+${Math.floor(reviewedDocuments.length * 0.1)}` 
          },
          { 
            label: "Pending Verifications", 
            value: pendingDocuments.length.toString(), 
            trend: "-8" 
          },
          { 
            label: "Audit Findings", 
            value: auditFindings.length.toString(), 
            trend: "+3" 
          },
          { 
            label: "Compliance Score", 
            value: `${avgComplianceScore.toFixed(0)}%`, 
            trend: "+2%" 
          }
        ],
        widgets: [
          { name: "Document Audit Log", count: allDocuments.length },
          { name: "Compliance Citations", count: allComplianceChecks.length },
          { name: "Change History", count: allDocumentAnalysis.length },
          { name: "Verification Status", count: reviewedDocuments.length }
        ],
        recentDocuments: allDocuments.slice(0, 10).map(d => ({
          id: d.id,
          name: d.fileName,
          status: d.status,
          uploadedAt: d.uploadDate,
          companyId: d.companyId
        })),
        complianceChecks: allComplianceChecks.slice(0, 10).map(c => ({
          id: c.id,
          status: c.result,
          checkName: c.checkName,
          details: c.details,
          timestamp: c.checkedAt
        })),
        totalDocuments: allDocuments.length,
        findingsCount: auditFindings.length
      });
    }

    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error fetching role view data:", error);
    return NextResponse.json(
      { error: "Failed to fetch role view data" },
      { status: 500 }
    );
  }
}
