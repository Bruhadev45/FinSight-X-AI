import { db } from "../index";
import { documents, documentAnalysis, alerts, companies } from "../schema";

async function seedSampleDocuments() {
  console.log("🌱 Seeding sample documents...");

  // Get existing companies
  const existingCompanies = await db.select().from(companies).limit(5);
  const companyIds = existingCompanies.map(c => c.id);

  // Sample documents
  const sampleDocs = [
    { fileName: "Q4_2024_Financial_Statement.pdf", fileSize: 2547896, fileType: "application/pdf", status: "completed", riskLevel: "low", companyId: companyIds[0] || 1 },
    { fileName: "SEC_10K_Filing_2024.pdf", fileSize: 8965432, fileType: "application/pdf", status: "completed", riskLevel: "medium", companyId: companyIds[1] || 2 },
    { fileName: "Annual_Audit_Report_2024.pdf", fileSize: 4532189, fileType: "application/pdf", status: "completed", riskLevel: "low", companyId: companyIds[2] || 3 },
    { fileName: "Tax_Return_FY2024.pdf", fileSize: 1876543, fileType: "application/pdf", status: "completed", riskLevel: "high", companyId: companyIds[0] || 1 },
    { fileName: "Investment_Proposal_Q1.pdf", fileSize: 3298765, fileType: "application/pdf", status: "completed", riskLevel: "medium", companyId: companyIds[3] || 4 },
    { fileName: "Compliance_Report_Nov_2024.pdf", fileSize: 1654321, fileType: "application/pdf", status: "completed", riskLevel: "low", companyId: companyIds[1] || 2 },
    { fileName: "Risk_Assessment_2024.xlsx", fileSize: 987654, fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", status: "completed", riskLevel: "high", companyId: companyIds[2] || 3 },
    { fileName: "Quarterly_Earnings_Q3.pdf", fileSize: 2198765, fileType: "application/pdf", status: "completed", riskLevel: "low", companyId: companyIds[4] || 5 },
    { fileName: "Balance_Sheet_Oct_2024.pdf", fileSize: 1432876, fileType: "application/pdf", status: "processing", riskLevel: "low", companyId: companyIds[0] || 1 },
    { fileName: "Cash_Flow_Statement_2024.pdf", fileSize: 1765432, fileType: "application/pdf", status: "completed", riskLevel: "medium", companyId: companyIds[3] || 4 },
    { fileName: "SEC_8K_Emergency_Filing.pdf", fileSize: 3456789, fileType: "application/pdf", status: "completed", riskLevel: "high", companyId: companyIds[1] || 2 },
    { fileName: "Loan_Application_2024.pdf", fileSize: 2987654, fileType: "application/pdf", status: "completed", riskLevel: "medium", companyId: companyIds[4] || 5 },
    { fileName: "Income_Statement_Nov.csv", fileSize: 654321, fileType: "text/csv", status: "completed", riskLevel: "low", companyId: companyIds[2] || 3 },
    { fileName: "Fraud_Investigation_Report.pdf", fileSize: 5432198, fileType: "application/pdf", status: "failed", riskLevel: "high", companyId: companyIds[0] || 1 },
    { fileName: "Monthly_Financial_Summary.pdf", fileSize: 987654, fileType: "application/pdf", status: "pending", riskLevel: "low", companyId: companyIds[3] || 4 },
  ];

  const insertedDocs = [];
  for (const doc of sampleDocs) {
    const uploadDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    const [inserted] = await db.insert(documents).values({
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadDate: uploadDate,
      status: doc.status,
      riskLevel: doc.riskLevel,
      companyId: doc.companyId,
      anomalyCount: Math.floor(Math.random() * 5),
      createdAt: uploadDate,
    }).returning();
    insertedDocs.push(inserted);
  }

  console.log(`✅ Inserted ${insertedDocs.length} documents`);

  // Sample document analyses
  const completedDocs = insertedDocs.filter(d => d.status === "completed");
  for (const doc of completedDocs) {
    await db.insert(documentAnalysis).values({
      documentId: doc.id,
      analysisType: doc.fileName.includes("10K") ? "sec_filing" : 
                   doc.fileName.includes("Balance") ? "balance_sheet" :
                   doc.fileName.includes("Income") ? "income_statement" : "financial_report",
      confidenceScore: 0.75 + Math.random() * 0.23,
      keyFindings: JSON.stringify({
        company_name: `Company ${doc.companyId}`,
        fiscal_year: "2024",
        total_revenue: `$${(Math.random() * 10 + 1).toFixed(1)}M`,
        revenue_growth: `${(Math.random() * 20).toFixed(1)}%`,
        profit_margin: `${(Math.random() * 25).toFixed(1)}%`,
      }),
      fraudIndicators: JSON.stringify({
        risk_score: Math.random() * 100,
        flags: Math.floor(Math.random() * 3),
      }),
      analyzedAt: new Date().toISOString(),
    });
  }

  console.log(`✅ Inserted ${completedDocs.length} document analyses`);

  // Sample alerts
  const alertTypes = [
    { title: "High Risk Transaction Detected", severity: "critical", alertType: "risk", description: "Unusual large transaction flagged for review" },
    { title: "Compliance Issue Found", severity: "high", alertType: "compliance", description: "Document missing required regulatory information" },
    { title: "Anomaly in Financial Data", severity: "medium", alertType: "anomaly", description: "Statistical anomaly detected in revenue figures" },
    { title: "Missing Documentation", severity: "medium", alertType: "missing", description: "Supporting documents not found for transaction" },
    { title: "Fraud Pattern Identified", severity: "critical", alertType: "fraud", description: "Pattern matching known fraud indicators" },
    { title: "Data Quality Warning", severity: "low", alertType: "quality", description: "Some fields contain inconsistent data" },
    { title: "Duplicate Entry Detected", severity: "low", alertType: "duplicate", description: "Possible duplicate transaction found" },
    { title: "Threshold Exceeded", severity: "high", alertType: "threshold", description: "Transaction amount exceeds normal threshold" },
    { title: "Unusual Activity Pattern", severity: "medium", alertType: "pattern", description: "Activity pattern deviates from baseline" },
    { title: "Regulatory Change Alert", severity: "medium", alertType: "regulatory", description: "New regulation may affect this document" },
  ];

  for (let i = 0; i < alertTypes.length; i++) {
    const alert = alertTypes[i];
    const doc = insertedDocs[i % insertedDocs.length];
    const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString();
    await db.insert(alerts).values({
      title: alert.title,
      alertType: alert.alertType,
      severity: alert.severity,
      description: alert.description,
      sourceDocumentId: doc.id,
      companyId: doc.companyId,
      status: Math.random() > 0.4 ? "unread" : (Math.random() > 0.5 ? "acknowledged" : "resolved"),
      triggeredAt: createdDate,
    });
  }

  console.log(`✅ Inserted ${alertTypes.length} alerts`);
  console.log("🎉 Sample data seeding complete!");
}

seedSampleDocuments().catch(console.error);