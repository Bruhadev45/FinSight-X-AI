import { db } from "@/db";
import { 
  companies, 
  documents, 
  documentAnalysis,
  alerts,
  aiAgentLogs,
  financialMetrics,
  complianceChecks,
  notifications,
  forecastData,
  explainableAI
} from "@/db/schema";

async function seed() {
  console.log("🌱 Starting comprehensive data seeding...");

  // 1. Add companies
  const companiesData = [
    { name: "Apple Inc.", industry: "Technology", tickerSymbol: "AAPL", country: "USA", totalDocuments: 0, avgRiskScore: 0.15 },
    { name: "Microsoft Corp", industry: "Technology", tickerSymbol: "MSFT", country: "USA", totalDocuments: 0, avgRiskScore: 0.12 },
    { name: "Google LLC", industry: "Technology", tickerSymbol: "GOOGL", country: "USA", totalDocuments: 0, avgRiskScore: 0.18 },
    { name: "Amazon.com Inc", industry: "E-Commerce", tickerSymbol: "AMZN", country: "USA", totalDocuments: 0, avgRiskScore: 0.22 },
    { name: "Tesla Inc.", industry: "Automotive", tickerSymbol: "TSLA", country: "USA", totalDocuments: 0, avgRiskScore: 0.28 },
    { name: "JPMorgan Chase", industry: "Banking", tickerSymbol: "JPM", country: "USA", totalDocuments: 0, avgRiskScore: 0.16 },
    { name: "Goldman Sachs", industry: "Investment Banking", tickerSymbol: "GS", country: "USA", totalDocuments: 0, avgRiskScore: 0.19 },
    { name: "Pfizer Inc.", industry: "Pharmaceutical", tickerSymbol: "PFE", country: "USA", totalDocuments: 0, avgRiskScore: 0.14 },
    { name: "Walmart Inc.", industry: "Retail", tickerSymbol: "WMT", country: "USA", totalDocuments: 0, avgRiskScore: 0.11 },
    { name: "Netflix Inc.", industry: "Entertainment", tickerSymbol: "NFLX", country: "USA", totalDocuments: 0, avgRiskScore: 0.25 },
  ];

  console.log("📊 Inserting companies...");
  await db.insert(companies).values(companiesData);

  // 2. Add documents
  const documentsData = [
    { companyId: 1, fileName: "Q4_2024_Financial_Statement.pdf", fileType: "application/pdf", fileSize: 2458000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "low", anomalyCount: 0, complianceStatus: "compliant", summary: "Quarterly financial results showing strong revenue growth", storagePath: "/uploads/doc1.pdf", createdAt: new Date().toISOString() },
    { companyId: 1, fileName: "SEC_10K_Filing_2024.pdf", fileType: "application/pdf", fileSize: 5123000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "low", anomalyCount: 1, complianceStatus: "compliant", summary: "Annual SEC filing with comprehensive financial data", storagePath: "/uploads/doc2.pdf", createdAt: new Date().toISOString() },
    { companyId: 2, fileName: "Annual_Audit_Report_2024.xlsx", fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileSize: 1856000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "medium", anomalyCount: 2, complianceStatus: "review_required", summary: "External audit findings with minor concerns", storagePath: "/uploads/doc3.xlsx", createdAt: new Date().toISOString() },
    { companyId: 3, fileName: "Tax_Return_FY2024.pdf", fileType: "application/pdf", fileSize: 987000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "low", anomalyCount: 0, complianceStatus: "compliant", summary: "Corporate tax filing for fiscal year 2024", storagePath: "/uploads/doc4.pdf", createdAt: new Date().toISOString() },
    { companyId: 4, fileName: "Investment_Proposal_Q1.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 456000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "high", anomalyCount: 5, complianceStatus: "non_compliant", summary: "High-risk investment opportunity with regulatory concerns", storagePath: "/uploads/doc5.docx", createdAt: new Date().toISOString() },
    { companyId: 5, fileName: "Compliance_Report_Nov_2024.pdf", fileType: "application/pdf", fileSize: 1234000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "low", anomalyCount: 0, complianceStatus: "compliant", summary: "Monthly compliance check showing full adherence", storagePath: "/uploads/doc6.pdf", createdAt: new Date().toISOString() },
    { companyId: 6, fileName: "Risk_Assessment_2024.xlsx", fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileSize: 2100000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "medium", anomalyCount: 3, complianceStatus: "review_required", summary: "Enterprise risk assessment identifying key exposure areas", storagePath: "/uploads/doc7.xlsx", createdAt: new Date().toISOString() },
    { companyId: 7, fileName: "Quarterly_Earnings_Q3.pdf", fileType: "application/pdf", fileSize: 1567000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "low", anomalyCount: 1, complianceStatus: "compliant", summary: "Q3 earnings report showing positive growth", storagePath: "/uploads/doc8.pdf", createdAt: new Date().toISOString() },
    { companyId: 8, fileName: "Balance_Sheet_Oct_2024.csv", fileType: "text/csv", fileSize: 234000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "low", anomalyCount: 0, complianceStatus: "compliant", summary: "Monthly balance sheet with healthy ratios", storagePath: "/uploads/doc9.csv", createdAt: new Date().toISOString() },
    { companyId: 9, fileName: "Cash_Flow_Statement_2024.pdf", fileType: "application/pdf", fileSize: 1890000, uploadDate: new Date().toISOString(), status: "completed", riskLevel: "medium", anomalyCount: 2, complianceStatus: "review_required", summary: "Annual cash flow analysis with some irregularities", storagePath: "/uploads/doc10.pdf", createdAt: new Date().toISOString() },
  ];

  console.log("📄 Inserting documents...");
  await db.insert(documents).values(documentsData);

  // 3. Add document analyses
  const analysesData = [
    { documentId: 1, analysisType: "Financial Statement Analysis", keyFindings: JSON.stringify(["Revenue increased 23% YoY", "Profit margins improved to 28%", "Strong cash position"]), fraudIndicators: JSON.stringify([]), confidenceScore: 0.95, analyzedAt: new Date().toISOString() },
    { documentId: 2, analysisType: "Regulatory Compliance Check", keyFindings: JSON.stringify(["All SEC requirements met", "Proper disclosures included", "Audit trail complete"]), fraudIndicators: JSON.stringify([]), confidenceScore: 0.92, analyzedAt: new Date().toISOString() },
    { documentId: 3, analysisType: "Audit Review", keyFindings: JSON.stringify(["Minor inventory discrepancies", "Revenue recognition timing issues"]), fraudIndicators: JSON.stringify(["Unusual accrual patterns"]), confidenceScore: 0.78, analyzedAt: new Date().toISOString() },
    { documentId: 4, analysisType: "Tax Compliance", keyFindings: JSON.stringify(["Proper deductions claimed", "Accurate income reporting"]), fraudIndicators: JSON.stringify([]), confidenceScore: 0.96, analyzedAt: new Date().toISOString() },
    { documentId: 5, analysisType: "Risk Assessment", keyFindings: JSON.stringify(["High leverage ratios", "Speculative investment strategy", "Limited due diligence evidence"]), fraudIndicators: JSON.stringify(["Incomplete disclosure", "Potential conflicts of interest"]), confidenceScore: 0.65, analyzedAt: new Date().toISOString() },
  ];

  console.log("🔍 Inserting document analyses...");
  await db.insert(documentAnalysis).values(analysesData);

  // 4. Add alerts
  const alertsData = [
    { companyId: 4, alertType: "fraud_detected", severity: "critical", title: "High-Risk Investment Proposal Detected", description: "Investment proposal contains multiple red flags including incomplete disclosure and potential conflicts of interest", sourceDocumentId: 5, status: "active", triggeredAt: new Date().toISOString() },
    { companyId: 3, alertType: "compliance_issue", severity: "high", title: "Audit Discrepancy Found", description: "Minor inventory discrepancies and revenue recognition timing issues identified", sourceDocumentId: 3, status: "active", triggeredAt: new Date().toISOString() },
    { companyId: 9, alertType: "anomaly", severity: "medium", title: "Cash Flow Irregularities", description: "Unusual patterns detected in cash flow statement requiring review", sourceDocumentId: 10, status: "pending", triggeredAt: new Date().toISOString() },
    { companyId: 1, alertType: "info", severity: "low", title: "Document Processing Complete", description: "Q4 financial statement successfully analyzed with no issues", sourceDocumentId: 1, status: "resolved", triggeredAt: new Date().toISOString(), resolvedAt: new Date().toISOString() },
    { companyId: 5, alertType: "compliance_check", severity: "low", title: "Compliance Report Approved", description: "Monthly compliance check shows full adherence to regulations", sourceDocumentId: 6, status: "resolved", triggeredAt: new Date().toISOString(), resolvedAt: new Date().toISOString() },
  ];

  console.log("🚨 Inserting alerts...");
  await db.insert(alerts).values(alertsData);

  // 5. Add AI agent logs
  const agentLogsData = [
    { agentName: "Document Parser", documentId: 1, taskType: "extraction", status: "completed", processingTimeMs: 1234, resultSummary: "Successfully extracted financial data from Q4 statement", createdAt: new Date().toISOString() },
    { agentName: "Fraud Detection Agent", documentId: 5, taskType: "fraud_analysis", status: "completed", processingTimeMs: 3456, resultSummary: "Detected 2 high-risk indicators and 3 medium-risk patterns", createdAt: new Date().toISOString() },
    { agentName: "Compliance Validator", documentId: 2, taskType: "compliance_check", status: "completed", processingTimeMs: 2345, resultSummary: "All SEC requirements validated successfully", createdAt: new Date().toISOString() },
    { agentName: "Anomaly Detector", documentId: 3, taskType: "anomaly_detection", status: "completed", processingTimeMs: 1876, resultSummary: "Identified 2 anomalies in audit report requiring review", createdAt: new Date().toISOString() },
    { agentName: "Risk Analyzer", documentId: 7, taskType: "risk_assessment", status: "completed", processingTimeMs: 2987, resultSummary: "Overall risk score: Medium. 3 concerns flagged for review", createdAt: new Date().toISOString() },
  ];

  console.log("🤖 Inserting AI agent logs...");
  await db.insert(aiAgentLogs).values(agentLogsData);

  // 6. Add financial metrics
  const metricsData = [
    { documentId: 1, companyName: "Apple Inc.", fiscalYear: 2024, fiscalQuarter: "Q4", revenue: 394328000000, ebitda: 123500000000, netIncome: 99800000000, totalAssets: 352755000000, totalLiabilities: 290437000000, equity: 62318000000, debtToEquityRatio: 1.78, roe: 0.28, currentRatio: 1.07, extractedAt: new Date().toISOString() },
    { documentId: 2, companyName: "Microsoft Corp", fiscalYear: 2024, fiscalQuarter: "Q4", revenue: 211915000000, ebitda: 97500000000, netIncome: 72700000000, totalAssets: 411976000000, totalLiabilities: 205753000000, equity: 206223000000, debtToEquityRatio: 0.42, roe: 0.35, currentRatio: 1.77, extractedAt: new Date().toISOString() },
  ];

  console.log("💰 Inserting financial metrics...");
  await db.insert(financialMetrics).values(metricsData);

  // 7. Add compliance checks
  const complianceData = [
    { documentId: 2, standardType: "SEC", checkName: "10-K Filing Requirements", result: "passed", details: "All required sections present and complete", recommendation: "No action needed", checkedAt: new Date().toISOString() },
    { documentId: 3, standardType: "GAAP", checkName: "Revenue Recognition", result: "warning", details: "Minor timing discrepancies in revenue recognition", recommendation: "Review Q2 revenue entries for proper period allocation", checkedAt: new Date().toISOString() },
  ];

  console.log("✅ Inserting compliance checks...");
  await db.insert(complianceChecks).values(complianceData);

  // 8. Add notifications
  const notificationsData = [
    { channel: "email", type: "alert", title: "Critical Alert: High-Risk Investment", message: "A critical risk has been detected in Investment Proposal Q1. Immediate review required.", status: "sent", documentId: 5, alertId: 1, sentAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { channel: "in_app", type: "info", title: "Document Processing Complete", message: "Q4 Financial Statement has been successfully analyzed", status: "delivered", documentId: 1, sentAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  ];

  console.log("📧 Inserting notifications...");
  await db.insert(notifications).values(notificationsData);

  // 9. Add forecast data
  const forecastsData = [
    { companyId: 1, forecastType: "revenue", period: "2025-Q1", lowEstimate: 89500000000, midEstimate: 94200000000, highEstimate: 98800000000, confidence: 0.82, methodology: "Time series analysis with ML", forecastDate: new Date().toISOString(), createdAt: new Date().toISOString() },
    { companyId: 2, forecastType: "revenue", period: "2025-Q1", lowEstimate: 51200000000, midEstimate: 54300000000, highEstimate: 57100000000, confidence: 0.85, methodology: "Regression analysis with market factors", forecastDate: new Date().toISOString(), createdAt: new Date().toISOString() },
  ];

  console.log("📈 Inserting forecast data...");
  await db.insert(forecastData).values(forecastsData);

  // 10. Add explainable AI entries
  const explainableData = [
    { documentId: 5, alertId: 1, finding: "High-risk investment detected", explanation: "The model identified multiple risk factors including incomplete disclosure (weight: 0.35), high leverage ratios (weight: 0.28), and limited due diligence evidence (weight: 0.22).", confidenceScore: 0.87, citations: JSON.stringify([{ page: 5, text: "Investment returns not guaranteed" }, { page: 12, text: "Limited historical performance data" }]), reasoningChain: JSON.stringify(["Analyzed document structure", "Extracted key financial metrics", "Compared against risk thresholds", "Identified disclosure gaps", "Generated risk score"]), modelVersion: "risk-analyzer-v2.1", createdAt: new Date().toISOString() },
  ];

  console.log("💡 Inserting explainable AI data...");
  await db.insert(explainableAI).values(explainableData);

  console.log("✅ Comprehensive data seeding completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
