import 'dotenv/config';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { hashSync } from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...\n');
  console.log('📝 Using DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');

  try {
    // 1. Create sample users
    console.log('👤 Creating users...');
    const users = await db.insert(schema.user).values([
      {
        id: 'user_1',
        name: 'John Anderson',
        email: 'john@finsight.ai',
        emailVerified: true,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user_2',
        name: 'Sarah Mitchell',
        email: 'sarah@finsight.ai',
        emailVerified: true,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user_3',
        name: 'Michael Chen',
        email: 'michael@finsight.ai',
        emailVerified: true,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]).returning();
    console.log(`✓ Created ${users.length} users`);

    // 2. Create accounts for users
    console.log('🔐 Creating accounts...');
    await db.insert(schema.account).values([
      {
        id: 'acc_1',
        accountId: 'john@finsight.ai',
        providerId: 'credential',
        userId: 'user_1',
        password: hashSync('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'acc_2',
        accountId: 'sarah@finsight.ai',
        providerId: 'credential',
        userId: 'user_2',
        password: hashSync('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'acc_3',
        accountId: 'michael@finsight.ai',
        providerId: 'credential',
        userId: 'user_3',
        password: hashSync('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('✓ Created 3 accounts');

    // 3. Create companies
    console.log('🏢 Creating companies...');
    const companies = await db.insert(schema.companies).values([
      {
        name: 'Apple Inc.',
        industry: 'Technology',
        tickerSymbol: 'AAPL',
        country: 'United States',
        lastAnalyzed: new Date().toISOString(),
        totalDocuments: 12,
        avgRiskScore: 2.3,
      },
      {
        name: 'Tesla Inc.',
        industry: 'Automotive',
        tickerSymbol: 'TSLA',
        country: 'United States',
        lastAnalyzed: new Date().toISOString(),
        totalDocuments: 8,
        avgRiskScore: 5.7,
      },
      {
        name: 'Microsoft Corporation',
        industry: 'Technology',
        tickerSymbol: 'MSFT',
        country: 'United States',
        lastAnalyzed: new Date().toISOString(),
        totalDocuments: 15,
        avgRiskScore: 1.8,
      },
      {
        name: 'Amazon.com Inc.',
        industry: 'E-commerce',
        tickerSymbol: 'AMZN',
        country: 'United States',
        lastAnalyzed: new Date().toISOString(),
        totalDocuments: 10,
        avgRiskScore: 3.2,
      },
      {
        name: 'JPMorgan Chase & Co.',
        industry: 'Banking',
        tickerSymbol: 'JPM',
        country: 'United States',
        lastAnalyzed: new Date().toISOString(),
        totalDocuments: 20,
        avgRiskScore: 4.1,
      },
      {
        name: 'Alphabet Inc.',
        industry: 'Technology',
        tickerSymbol: 'GOOGL',
        country: 'United States',
        lastAnalyzed: new Date().toISOString(),
        totalDocuments: 14,
        avgRiskScore: 2.1,
      },
    ]).returning();
    console.log(`✓ Created ${companies.length} companies`);

    // 4. Create documents
    console.log('📄 Creating documents...');
    const documents = await db.insert(schema.documents).values([
      {
        userId: 'user_1',
        companyId: companies[0].id,
        fileName: 'Apple_Q4_2024_Financial_Report.pdf',
        fileType: 'application/pdf',
        fileSize: 2458369,
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        riskLevel: 'low',
        anomalyCount: 2,
        complianceStatus: 'compliant',
        summary: 'Q4 2024 financial report showing strong revenue growth of 12% YoY. Net income increased by 15%. All financial ratios within acceptable ranges.',
        storagePath: '/uploads/apple_q4_2024.pdf',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_1',
        companyId: companies[1].id,
        fileName: 'Tesla_Annual_Report_2024.pdf',
        fileType: 'application/pdf',
        fileSize: 5247891,
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        riskLevel: 'medium',
        anomalyCount: 7,
        complianceStatus: 'review_required',
        summary: 'Annual report reveals significant cash flow concerns. Debt-to-equity ratio has increased to 2.8. Several accounting irregularities detected requiring further review.',
        storagePath: '/uploads/tesla_annual_2024.pdf',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        companyId: companies[2].id,
        fileName: 'Microsoft_Q3_Earnings.pdf',
        fileType: 'application/pdf',
        fileSize: 1987456,
        uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        riskLevel: 'low',
        anomalyCount: 1,
        complianceStatus: 'compliant',
        summary: 'Q3 earnings beat expectations. Cloud revenue up 28% YoY. Operating margins improved to 42%. Strong cash position.',
        storagePath: '/uploads/msft_q3_earnings.pdf',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        companyId: companies[3].id,
        fileName: 'Amazon_10K_Filing_2024.pdf',
        fileType: 'application/pdf',
        fileSize: 6784512,
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        riskLevel: 'medium',
        anomalyCount: 4,
        complianceStatus: 'compliant',
        summary: '10-K filing shows mixed results. AWS growth slowing. E-commerce margins under pressure. Workforce reduction of 8%.',
        storagePath: '/uploads/amazon_10k_2024.pdf',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        companyId: companies[4].id,
        fileName: 'JPMorgan_Risk_Assessment_2024.pdf',
        fileType: 'application/pdf',
        fileSize: 3456789,
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        riskLevel: 'high',
        anomalyCount: 12,
        complianceStatus: 'non_compliant',
        summary: 'Risk assessment reveals significant exposure to commercial real estate. Credit loss provisions increased by 45%. Basel III compliance issues identified.',
        storagePath: '/uploads/jpmorgan_risk_2024.pdf',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        companyId: companies[5].id,
        fileName: 'Alphabet_Quarterly_Results.pdf',
        fileType: 'application/pdf',
        fileSize: 2134567,
        uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        riskLevel: 'low',
        anomalyCount: 3,
        complianceStatus: 'compliant',
        summary: 'Quarterly results show strong advertising recovery. YouTube revenue up 21%. Cloud segment approaching profitability.',
        storagePath: '/uploads/alphabet_quarterly.pdf',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]).returning();
    console.log(`✓ Created ${documents.length} documents`);

    // 5. Create financial metrics
    console.log('💰 Creating financial metrics...');
    await db.insert(schema.financialMetrics).values([
      {
        documentId: documents[0].id,
        companyName: 'Apple Inc.',
        fiscalYear: 2024,
        fiscalQuarter: 'Q4',
        revenue: 394328000000,
        ebitda: 123456000000,
        netIncome: 96995000000,
        totalAssets: 352755000000,
        totalLiabilities: 290437000000,
        equity: 62318000000,
        debtToEquityRatio: 1.78,
        roe: 0.147,
        currentRatio: 0.98,
        extractedAt: new Date().toISOString(),
      },
      {
        documentId: documents[1].id,
        companyName: 'Tesla Inc.',
        fiscalYear: 2024,
        fiscalQuarter: 'Q4',
        revenue: 96773000000,
        ebitda: 12456000000,
        netIncome: 8456000000,
        totalAssets: 82338000000,
        totalLiabilities: 52437000000,
        equity: 29901000000,
        debtToEquityRatio: 2.8,
        roe: 0.283,
        currentRatio: 1.52,
        extractedAt: new Date().toISOString(),
      },
      {
        documentId: documents[2].id,
        companyName: 'Microsoft Corporation',
        fiscalYear: 2024,
        fiscalQuarter: 'Q3',
        revenue: 211915000000,
        ebitda: 89234000000,
        netIncome: 72738000000,
        totalAssets: 411976000000,
        totalLiabilities: 198298000000,
        equity: 213678000000,
        debtToEquityRatio: 0.45,
        roe: 0.42,
        currentRatio: 1.77,
        extractedAt: new Date().toISOString(),
      },
      {
        documentId: documents[3].id,
        companyName: 'Amazon.com Inc.',
        fiscalYear: 2024,
        fiscalQuarter: 'Q4',
        revenue: 574785000000,
        ebitda: 78234000000,
        netIncome: 30425000000,
        totalAssets: 527854000000,
        totalLiabilities: 420193000000,
        equity: 107661000000,
        debtToEquityRatio: 1.58,
        roe: 0.193,
        currentRatio: 1.09,
        extractedAt: new Date().toISOString(),
      },
      {
        documentId: documents[4].id,
        companyName: 'JPMorgan Chase & Co.',
        fiscalYear: 2024,
        fiscalQuarter: 'Q4',
        revenue: 158100000000,
        ebitda: 67234000000,
        netIncome: 48334000000,
        totalAssets: 3875000000000,
        totalLiabilities: 3542000000000,
        equity: 333000000000,
        debtToEquityRatio: 10.64,
        roe: 0.145,
        currentRatio: 1.21,
        extractedAt: new Date().toISOString(),
      },
      {
        documentId: documents[5].id,
        companyName: 'Alphabet Inc.',
        fiscalYear: 2024,
        fiscalQuarter: 'Q3',
        revenue: 307394000000,
        ebitda: 98234000000,
        netIncome: 73795000000,
        totalAssets: 402392000000,
        totalLiabilities: 123456000000,
        equity: 278936000000,
        debtToEquityRatio: 0.13,
        roe: 0.26,
        currentRatio: 2.34,
        extractedAt: new Date().toISOString(),
      },
    ]);
    console.log('✓ Created 6 financial metrics records');

    // 6. Create document analysis
    console.log('🔍 Creating document analysis...');
    await db.insert(schema.documentAnalysis).values([
      {
        documentId: documents[0].id,
        analysisType: 'fraud_detection',
        keyFindings: {
          findings: [
            'Revenue recognition policies consistent with industry standards',
            'No unusual related-party transactions detected',
            'Cash flow patterns align with reported earnings'
          ]
        },
        fraudIndicators: {
          indicators: [
            'Minor discrepancy in inventory valuation ($2.3M)',
            'Unusual Q4 marketing expense spike'
          ]
        },
        confidenceScore: 0.94,
        analyzedAt: new Date().toISOString(),
      },
      {
        documentId: documents[1].id,
        analysisType: 'fraud_detection',
        keyFindings: {
          findings: [
            'Aggressive revenue recognition on vehicle deliveries',
            'Significant warranty reserve adjustments',
            'Multiple restatements of previous quarters'
          ]
        },
        fraudIndicators: {
          indicators: [
            'Unusual pattern in accounts receivable aging',
            'Inventory write-downs not adequately explained',
            'Related-party transactions with CEO entities',
            'Cash flow significantly lower than reported earnings'
          ]
        },
        confidenceScore: 0.72,
        analyzedAt: new Date().toISOString(),
      },
      {
        documentId: documents[4].id,
        analysisType: 'risk_assessment',
        keyFindings: {
          findings: [
            'High exposure to commercial real estate sector',
            'Increased credit loss provisions',
            'Trading revenue volatility concerns',
            'Regulatory capital ratios declining'
          ]
        },
        fraudIndicators: {
          indicators: [
            'Suspicious loan-loss reserve calculations',
            'Timing of asset write-downs questioned',
            'Off-balance-sheet exposures not fully disclosed'
          ]
        },
        confidenceScore: 0.68,
        analyzedAt: new Date().toISOString(),
      },
    ]);
    console.log('✓ Created 3 document analysis records');

    // 7. Create alerts
    console.log('🚨 Creating alerts...');
    const alerts = await db.insert(schema.alerts).values([
      {
        userId: 'user_1',
        companyId: companies[1].id,
        alertType: 'fraud_risk',
        severity: 'high',
        title: 'Potential Accounting Irregularities Detected',
        description: 'Tesla Inc. financial report shows concerning patterns in revenue recognition and cash flow mismatches. Recommend immediate detailed review.',
        sourceDocumentId: documents[1].id,
        status: 'unread',
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        companyId: companies[4].id,
        alertType: 'compliance',
        severity: 'critical',
        title: 'Basel III Compliance Issues',
        description: 'JPMorgan Chase risk assessment reveals capital ratio deficiencies. Required regulatory action within 30 days.',
        sourceDocumentId: documents[4].id,
        status: 'unread',
        triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_1',
        companyId: companies[0].id,
        alertType: 'anomaly',
        severity: 'medium',
        title: 'Inventory Valuation Discrepancy',
        description: 'Minor discrepancy of $2.3M detected in Apple Q4 inventory valuation. Within acceptable threshold but flagged for review.',
        sourceDocumentId: documents[0].id,
        status: 'acknowledged',
        triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        companyId: companies[3].id,
        alertType: 'financial_metric',
        severity: 'medium',
        title: 'Declining Profit Margins',
        description: 'Amazon e-commerce margins have compressed by 3.2% YoY. Competitive pressure and wage inflation cited as factors.',
        sourceDocumentId: documents[3].id,
        status: 'resolved',
        triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_1',
        companyId: companies[1].id,
        alertType: 'cash_flow',
        severity: 'high',
        title: 'Cash Flow Warning',
        description: 'Operating cash flow 40% below net income. Potential working capital management issues or aggressive accrual accounting.',
        sourceDocumentId: documents[1].id,
        status: 'unread',
        triggeredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ]).returning();
    console.log(`✓ Created ${alerts.length} alerts`);

    // 8. Create alert rules
    console.log('📋 Creating alert rules...');
    await db.insert(schema.alertRules).values([
      {
        userId: 'user_1',
        ruleName: 'High Debt-to-Equity Ratio',
        metricType: 'debt_to_equity_ratio',
        thresholdValue: 2.5,
        comparisonOperator: 'greater_than',
        notificationChannels: { channels: ['email', 'sms', 'in_app'] },
        enabled: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_1',
        ruleName: 'Low Current Ratio',
        metricType: 'current_ratio',
        thresholdValue: 1.0,
        comparisonOperator: 'less_than',
        notificationChannels: { channels: ['email', 'in_app'] },
        enabled: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        ruleName: 'Negative ROE',
        metricType: 'roe',
        thresholdValue: 0,
        comparisonOperator: 'less_than',
        notificationChannels: { channels: ['email', 'sms'] },
        enabled: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        ruleName: 'Revenue Decline',
        metricType: 'revenue',
        thresholdValue: -5.0,
        comparisonOperator: 'percentage_change',
        notificationChannels: { channels: ['email', 'in_app'] },
        enabled: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_1',
        ruleName: 'Fraud Score Threshold',
        metricType: 'fraud_score',
        thresholdValue: 7.0,
        comparisonOperator: 'greater_than',
        notificationChannels: { channels: ['email', 'sms', 'in_app'] },
        enabled: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    console.log('✓ Created 5 alert rules');

    // 9. Create notifications
    console.log('🔔 Creating notifications...');
    await db.insert(schema.notifications).values([
      {
        userId: 'user_1',
        alertId: alerts[0].id,
        title: 'High-Risk Alert Triggered',
        message: 'Potential accounting irregularities detected in Tesla Inc. financial report.',
        type: 'alert',
        status: 'pending',
        channel: 'in_app',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        alertId: alerts[1].id,
        title: 'Critical Compliance Issue',
        message: 'Basel III compliance issues identified for JPMorgan Chase. Immediate action required.',
        type: 'compliance',
        status: 'pending',
        channel: 'email',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_1',
        title: 'Document Analysis Complete',
        message: 'Apple Q4 2024 Financial Report analysis has been completed successfully.',
        type: 'system',
        status: 'sent',
        channel: 'in_app',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        title: 'Weekly Summary Report Available',
        message: 'Your weekly financial analysis summary is ready for review.',
        type: 'report',
        status: 'sent',
        channel: 'in_app',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    console.log('✓ Created 4 notifications');

    // 10. Create reports
    console.log('📊 Creating reports...');
    await db.insert(schema.reports).values([
      {
        userId: 'user_1',
        reportType: 'fraud_analysis',
        title: 'Tesla Inc. Fraud Risk Assessment',
        content: JSON.stringify({
          summary: 'Comprehensive fraud risk analysis of Tesla Inc. 2024 annual report',
          riskScore: 7.2,
          findings: [
            'Aggressive revenue recognition policies',
            'Cash flow concerns',
            'Related-party transactions',
            'Multiple restatements'
          ],
          recommendations: [
            'Conduct detailed audit of revenue recognition',
            'Review all related-party transactions',
            'Investigate cash flow discrepancies'
          ]
        }),
        sourceDocuments: JSON.stringify([documents[1].id]),
        citations: JSON.stringify([
          'Page 12: Revenue Recognition Policy',
          'Page 34: Cash Flow Statement',
          'Page 67: Related-Party Disclosures'
        ]),
        format: 'pdf',
        generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        reportType: 'portfolio_summary',
        title: 'Technology Sector Portfolio Analysis',
        content: JSON.stringify({
          summary: 'Quarterly analysis of technology sector holdings',
          totalValue: 2450000000,
          performance: '+12.3%',
          topPerformers: ['Microsoft', 'Apple', 'Alphabet'],
          concerns: ['Market volatility', 'Regulatory pressure']
        }),
        sourceDocuments: JSON.stringify([documents[0].id, documents[2].id, documents[5].id]),
        format: 'pdf',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        reportType: 'compliance',
        title: 'Banking Sector Compliance Review',
        content: JSON.stringify({
          summary: 'Regulatory compliance assessment for banking holdings',
          complianceScore: 68,
          criticalIssues: 2,
          warnings: 5,
          status: 'Action Required'
        }),
        sourceDocuments: JSON.stringify([documents[4].id]),
        format: 'pdf',
        generatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    console.log('✓ Created 3 reports');

    // 11. Create AI agent logs
    console.log('🤖 Creating AI agent logs...');
    await db.insert(schema.aiAgentLogs).values([
      {
        agentName: 'Document Analyzer',
        documentId: documents[0].id,
        taskType: 'document_analysis',
        status: 'completed',
        processingTimeMs: 4567,
        resultSummary: 'Successfully analyzed Apple Q4 report. Identified 2 minor anomalies. Risk level: Low',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        agentName: 'Fraud Detector',
        documentId: documents[1].id,
        taskType: 'fraud_detection',
        status: 'completed',
        processingTimeMs: 8923,
        resultSummary: 'Detected 7 potential fraud indicators in Tesla annual report. High-risk patterns identified.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        agentName: 'Compliance Checker',
        documentId: documents[4].id,
        taskType: 'compliance_check',
        status: 'completed',
        processingTimeMs: 12456,
        resultSummary: 'JPMorgan report shows Basel III compliance issues. Non-compliant status assigned.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        agentName: 'Financial Metrics Extractor',
        taskType: 'metric_extraction',
        status: 'running',
        processingTimeMs: null,
        resultSummary: null,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ]);
    console.log('✓ Created 4 AI agent logs');

    // 12. Create search queries
    console.log('🔎 Creating search queries...');
    await db.insert(schema.searchQueries).values([
      {
        userId: 'user_1',
        queryText: 'fraud indicators in tech companies',
        resultsCount: 12,
        relevantDocuments: JSON.stringify([documents[0].id, documents[1].id, documents[2].id]),
        executedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_2',
        queryText: 'high debt to equity ratio',
        resultsCount: 8,
        relevantDocuments: JSON.stringify([documents[1].id, documents[3].id, documents[4].id]),
        executedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: 'user_3',
        queryText: 'Basel III compliance banking sector',
        resultsCount: 3,
        relevantDocuments: JSON.stringify([documents[4].id]),
        executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    console.log('✓ Created 3 search queries');

    // 13. Create compliance checks
    console.log('✅ Creating compliance checks...');
    await db.insert(schema.complianceChecks).values([
      {
        documentId: documents[0].id,
        standardType: 'GAAP',
        checkName: 'Revenue Recognition',
        result: 'passed',
        details: 'Revenue recognition policies comply with ASC 606 standards',
        recommendation: 'Continue current practices',
        checkedAt: new Date().toISOString(),
      },
      {
        documentId: documents[1].id,
        standardType: 'GAAP',
        checkName: 'Cash Flow Statement',
        result: 'warning',
        details: 'Operating cash flow significantly below net income',
        recommendation: 'Review working capital management and accrual accounting practices',
        checkedAt: new Date().toISOString(),
      },
      {
        documentId: documents[4].id,
        standardType: 'Basel III',
        checkName: 'Capital Adequacy Ratio',
        result: 'failed',
        details: 'Common Equity Tier 1 ratio below minimum threshold of 4.5%',
        recommendation: 'Immediate capital raising required. File regulatory remediation plan within 30 days.',
        checkedAt: new Date().toISOString(),
      },
      {
        documentId: documents[2].id,
        standardType: 'SOX',
        checkName: 'Internal Controls',
        result: 'passed',
        details: 'Internal control framework meets SOX Section 404 requirements',
        recommendation: 'Maintain current control environment',
        checkedAt: new Date().toISOString(),
      },
    ]);
    console.log('✓ Created 4 compliance checks');

    // 14. Create benchmarks
    console.log('📈 Creating benchmarks...');
    await db.insert(schema.benchmarks).values([
      {
        companyId: companies[0].id,
        peerCompanyId: companies[2].id,
        metricName: 'ROE',
        companyValue: 0.147,
        peerValue: 0.42,
        variancePercentage: -65.0,
        period: '2024-Q4',
        createdAt: new Date().toISOString(),
      },
      {
        companyId: companies[1].id,
        peerCompanyId: companies[3].id,
        metricName: 'Current Ratio',
        companyValue: 1.52,
        peerValue: 1.09,
        variancePercentage: 39.4,
        period: '2024-Q4',
        createdAt: new Date().toISOString(),
      },
      {
        companyId: companies[4].id,
        peerCompanyId: companies[0].id,
        metricName: 'Debt to Equity',
        companyValue: 10.64,
        peerValue: 1.78,
        variancePercentage: 497.8,
        period: '2024-Q4',
        createdAt: new Date().toISOString(),
      },
    ]);
    console.log('✓ Created 3 benchmarks');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${companies.length} companies created`);
    console.log(`   • ${documents.length} documents created`);
    console.log(`   • ${alerts.length} alerts created`);
    console.log('   • 6 financial metrics records');
    console.log('   • 5 alert rules');
    console.log('   • 4 notifications');
    console.log('   • 3 reports');
    console.log('   • 4 AI agent logs');
    console.log('   • 3 search queries');
    console.log('   • 4 compliance checks');
    console.log('   • 3 benchmarks\n');

    console.log('🔑 Test User Credentials:');
    console.log('   Email: john@finsight.ai');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
