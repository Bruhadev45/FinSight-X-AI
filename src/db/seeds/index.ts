import { db } from '@/db';
import * as schema from '@/db/schema';
import { seedTestUsers } from './testUsers';

// Seed data generators
const getRandomDate = (daysBack: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

async function seedAll() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // Seed test users FIRST
    await seedTestUsers();
    
    // 1. Companies (no dependencies)
    console.log('📊 Seeding companies...');
    const companiesData = [
      { name: 'Apple Inc.', industry: 'Technology', tickerSymbol: 'AAPL', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 8, avgRiskScore: 0.25 },
      { name: 'Microsoft Corp.', industry: 'Technology', tickerSymbol: 'MSFT', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 7, avgRiskScore: 0.38 },
      { name: 'JPMorgan Chase', industry: 'Finance', tickerSymbol: 'JPM', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 8, avgRiskScore: 0.52 },
      { name: 'Goldman Sachs', industry: 'Finance', tickerSymbol: 'GS', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 7, avgRiskScore: 0.63 },
      { name: 'Tesla Inc.', industry: 'Automotive', tickerSymbol: 'TSLA', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 8, avgRiskScore: 0.55 },
      { name: 'Johnson & Johnson', industry: 'Healthcare', tickerSymbol: 'JNJ', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 7, avgRiskScore: 0.32 },
      { name: 'ExxonMobil', industry: 'Energy', tickerSymbol: 'XOM', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 8, avgRiskScore: 0.68 },
      { name: 'Walmart', industry: 'Retail', tickerSymbol: 'WMT', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 7, avgRiskScore: 0.29 },
      { name: 'Amazon', industry: 'Technology', tickerSymbol: 'AMZN', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 8, avgRiskScore: 0.42 },
      { name: 'Meta Platforms', industry: 'Technology', tickerSymbol: 'META', country: 'USA', lastAnalyzed: getRandomDate(7), totalDocuments: 7, avgRiskScore: 0.48 },
      { name: 'Siemens AG', industry: 'Manufacturing', tickerSymbol: 'SIE', country: 'Germany', lastAnalyzed: getRandomDate(7), totalDocuments: 8, avgRiskScore: 0.38 },
      { name: 'Toyota Motor', industry: 'Automotive', tickerSymbol: 'TM', country: 'Japan', lastAnalyzed: getRandomDate(7), totalDocuments: 7, avgRiskScore: 0.45 },
    ];
    await db.insert(schema.companies).values(companiesData);
    console.log(`✅ Seeded ${companiesData.length} companies\n`);

    // Get inserted company IDs
    const companies = await db.select().from(schema.companies);
    
    // 2. Documents (depends on companies - via companyId implicitly through file names)
    console.log('📄 Seeding documents...');
    const documentsData = [];
    const fileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const statuses = ['completed', 'processing', 'failed'];
    const riskLevels = ['low', 'medium', 'high'];
    const complianceStatuses = ['Pass', 'Review', 'Failed'];

    companies.forEach((company, idx) => {
      const docCount = idx < 4 ? 8 : 7;
      for (let i = 0; i < docCount; i++) {
        const status = i === docCount - 1 && idx % 3 === 0 ? 'failed' : (i === docCount - 2 && idx % 4 === 0 ? 'processing' : 'completed');
        const riskLevel = status === 'completed' ? riskLevels[getRandomInt(0, 2)] : null;
        
        documentsData.push({
          userId: null,
          fileName: `${company.tickerSymbol}_Report_Q${getRandomInt(1, 4)}_2024_v${i + 1}.${i % 3 === 0 ? 'pdf' : 'xlsx'}`,
          fileType: fileTypes[i % 3],
          fileSize: getRandomInt(800000, 12000000),
          uploadDate: getRandomDate(60),
          status,
          riskLevel,
          anomalyCount: riskLevel === 'high' ? getRandomInt(7, 12) : riskLevel === 'medium' ? getRandomInt(3, 6) : getRandomInt(0, 2),
          complianceStatus: status === 'completed' ? complianceStatuses[riskLevel === 'high' ? 2 : riskLevel === 'medium' ? 1 : 0] : null,
          summary: status === 'completed' ? `Financial report for ${company.name} showing ${riskLevel} risk level with detailed analysis of revenue, expenses, and key metrics.` : null,
          storagePath: `/uploads/2024/${getRandomInt(1, 12)}/${company.tickerSymbol}_Report.pdf`,
          createdAt: getRandomDate(60),
        });
      }
    });
    
    await db.insert(schema.documents).values(documentsData);
    console.log(`✅ Seeded ${documentsData.length} documents\n`);

    // Get inserted document IDs
    const documents = await db.select().from(schema.documents);

    // 3. Financial Metrics (depends on documents and companies)
    console.log('💰 Seeding financial metrics...');
    const financialMetricsData = [];
    documents.forEach((doc) => {
      if (doc.status === 'completed') {
        const companyIdx = getRandomInt(0, companies.length - 1);
        financialMetricsData.push({
          documentId: doc.id,
          companyName: companies[companyIdx].name,
          fiscalYear: 2024,
          fiscalQuarter: `Q${getRandomInt(1, 4)}`,
          revenue: getRandomFloat(50000000, 500000000000),
          ebitda: getRandomFloat(10000000, 100000000000),
          netIncome: getRandomFloat(5000000, 80000000000),
          totalAssets: getRandomFloat(100000000, 600000000000),
          totalLiabilities: getRandomFloat(50000000, 400000000000),
          equity: getRandomFloat(50000000, 200000000000),
          debtToEquityRatio: getRandomFloat(0.2, 2.5),
          roe: getRandomFloat(5, 35),
          currentRatio: getRandomFloat(0.8, 3.5),
          extractedAt: getRandomDate(30),
        });
      }
    });
    await db.insert(schema.financialMetrics).values(financialMetricsData);
    console.log(`✅ Seeded ${financialMetricsData.length} financial metrics\n`);

    // 4. Alerts (depends on documents)
    console.log('🚨 Seeding alerts...');
    const alertsData = [];
    const alertTypes = ['anomaly', 'threshold_breach', 'compliance_violation', 'fraud_pattern', 'risk_spike'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const alertStatuses = ['open', 'acknowledged', 'resolved'];

    for (let i = 0; i < 60; i++) {
      const severity = severities[getRandomInt(0, 3)];
      const status = alertStatuses[getRandomInt(0, 2)];
      const triggeredAt = getRandomDate(30);
      
      alertsData.push({
        userId: null,
        alertType: alertTypes[getRandomInt(0, 4)],
        severity,
        title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Risk Alert - ${alertTypes[getRandomInt(0, 4)]}`,
        description: `Detailed alert description explaining the ${severity} severity issue detected in financial data. This requires immediate attention and investigation.`,
        sourceDocumentId: documents[getRandomInt(0, documents.length - 1)].id,
        status,
        triggeredAt,
        acknowledgedAt: status !== 'open' ? getRandomDate(20) : null,
        resolvedAt: status === 'resolved' ? getRandomDate(10) : null,
      });
    }
    await db.insert(schema.alerts).values(alertsData);
    console.log(`✅ Seeded ${alertsData.length} alerts\n`);

    // 5. AI Agent Logs (depends on documents)
    console.log('🤖 Seeding AI agent logs...');
    const aiAgentLogsData = [];
    const agentNames = ['parser', 'validator', 'anomaly_detector', 'fraud_detector', 'compliance_checker', 'semantic_analyzer'];
    
    documents.forEach((doc) => {
      agentNames.forEach((agent) => {
        aiAgentLogsData.push({
          agentName: agent,
          documentId: doc.id,
          taskType: `${agent}_analysis`,
          status: doc.status === 'failed' ? 'failed' : doc.status === 'processing' ? 'running' : 'completed',
          processingTimeMs: getRandomInt(500, 25000),
          resultSummary: doc.status === 'completed' ? `${agent} completed successfully with confidence ${getRandomFloat(0.75, 0.99).toFixed(2)}` : null,
          createdAt: doc.uploadDate,
        });
      });
    });
    await db.insert(schema.aiAgentLogs).values(aiAgentLogsData);
    console.log(`✅ Seeded ${aiAgentLogsData.length} AI agent logs\n`);

    // 6. Document Analysis (depends on documents)
    console.log('🧠 Seeding document analysis...');
    const documentAnalysisData = [];
    documents.forEach((doc) => {
      if (doc.status === 'completed') {
        documentAnalysisData.push({
          documentId: doc.id,
          analysisType: 'comprehensive',
          keyFindings: JSON.stringify(['Revenue growth detected', 'Expense optimization needed', 'Compliance requirements met']),
          fraudIndicators: JSON.stringify(doc.riskLevel === 'high' ? ['Unusual transaction pattern', 'Timing anomaly'] : []),
          confidenceScore: getRandomFloat(0.7, 0.99),
          analyzedAt: getRandomDate(30),
        });
      }
    });
    await db.insert(schema.documentAnalysis).values(documentAnalysisData);
    console.log(`✅ Seeded ${documentAnalysisData.length} document analyses\n`);

    // 7. Compliance Checks (depends on documents)
    console.log('✅ Seeding compliance checks...');
    const complianceChecksData = [];
    const standards = ['SOX', 'GDPR', 'Basel III', 'MiFID II', 'IFRS'];
    
    documents.forEach((doc) => {
      if (doc.status === 'completed') {
        const numChecks = getRandomInt(2, 4);
        for (let i = 0; i < numChecks; i++) {
          const result = doc.riskLevel === 'high' ? 'failed' : doc.riskLevel === 'medium' ? 'warning' : 'passed';
          complianceChecksData.push({
            documentId: doc.id,
            standardType: standards[getRandomInt(0, standards.length - 1)],
            checkName: `${standards[i % standards.length]} Compliance Check`,
            result,
            details: result === 'passed' ? 'All compliance requirements met' : 'Some compliance issues detected',
            recommendation: result !== 'passed' ? 'Review and address compliance violations' : null,
            checkedAt: getRandomDate(30),
          });
        }
      }
    });
    await db.insert(schema.complianceChecks).values(complianceChecksData);
    console.log(`✅ Seeded ${complianceChecksData.length} compliance checks\n`);

    // 8. Search Queries
    console.log('🔍 Seeding search queries...');
    const searchQueriesData = [];
    const queries = [
      'fraud detection results',
      'compliance violations 2024',
      'high-risk transactions',
      'revenue analysis Q4',
      'anomaly detection reports',
      'financial metrics comparison',
      'audit trail review',
      'risk assessment summary',
    ];
    
    queries.forEach((query) => {
      searchQueriesData.push({
        userId: null,
        queryText: query,
        resultsCount: getRandomInt(5, 30),
        relevantDocuments: JSON.stringify(documents.slice(0, getRandomInt(3, 10)).map(d => d.id)),
        executedAt: getRandomDate(30),
      });
    });
    await db.insert(schema.searchQueries).values(searchQueriesData);
    console.log(`✅ Seeded ${searchQueriesData.length} search queries\n`);

    // 9. Benchmarks (depends on companies)
    console.log('📊 Seeding benchmarks...');
    const benchmarksData = [];
    const metrics = ['revenue_growth', 'profit_margin', 'debt_ratio', 'roe', 'asset_turnover'];
    
    companies.forEach((company, idx) => {
      if (idx < companies.length - 1) {
        metrics.forEach((metric) => {
          const companyValue = getRandomFloat(5, 25);
          const peerValue = getRandomFloat(5, 25);
          benchmarksData.push({
            companyId: company.id,
            peerCompanyId: companies[idx + 1].id,
            metricName: metric,
            companyValue,
            peerValue,
            variancePercentage: ((companyValue - peerValue) / peerValue) * 100,
            period: `Q${getRandomInt(1, 4)}-2024`,
            createdAt: getRandomDate(30),
          });
        });
      }
    });
    await db.insert(schema.benchmarks).values(benchmarksData);
    console.log(`✅ Seeded ${benchmarksData.length} benchmarks\n`);

    // 10. Knowledge Graph Entities
    console.log('🕸️ Seeding knowledge graph entities...');
    const entitiesData = [];
    const entityTypes = ['company', 'person', 'location', 'regulation', 'transaction'];
    
    companies.forEach((company, idx) => {
      entitiesData.push({
        entityId: `company-${company.id}`,
        entityType: 'company',
        name: company.name,
        properties: JSON.stringify({ industry: company.industry, ticker: company.tickerSymbol }),
        createdAt: getRandomDate(180),
        updatedAt: getRandomDate(30),
      });
      
      // Add related persons
      entitiesData.push({
        entityId: `person-ceo-${company.id}`,
        entityType: 'person',
        name: `CEO of ${company.tickerSymbol}`,
        properties: JSON.stringify({ role: 'CEO', tenure: '5 years' }),
        createdAt: getRandomDate(180),
        updatedAt: getRandomDate(30),
      });
    });
    await db.insert(schema.knowledgeGraphEntities).values(entitiesData);
    console.log(`✅ Seeded ${entitiesData.length} knowledge graph entities\n`);

    // 11. Knowledge Graph Relationships
    console.log('🔗 Seeding knowledge graph relationships...');
    const relationshipsData = [];
    companies.forEach((company) => {
      relationshipsData.push({
        relationshipId: `rel-manages-${company.id}`,
        sourceEntityId: `person-ceo-${company.id}`,
        targetEntityId: `company-${company.id}`,
        relationshipType: 'manages',
        properties: JSON.stringify({ since: '2019' }),
        createdAt: getRandomDate(180),
      });
    });
    await db.insert(schema.knowledgeGraphRelationships).values(relationshipsData);
    console.log(`✅ Seeded ${relationshipsData.length} knowledge graph relationships\n`);

    // 12. Forecast Data (depends on companies)
    console.log('📈 Seeding forecast data...');
    const forecastsData = [];
    companies.forEach((company) => {
      ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025'].forEach((period) => {
        forecastsData.push({
          companyId: company.id,
          forecastType: 'revenue',
          period,
          lowEstimate: getRandomFloat(50000000, 100000000),
          midEstimate: getRandomFloat(100000000, 200000000),
          highEstimate: getRandomFloat(200000000, 300000000),
          confidence: getRandomFloat(0.75, 0.95),
          methodology: 'Time series analysis with ML',
          forecastDate: getRandomDate(30),
          createdAt: getRandomDate(30),
        });
      });
    });
    await db.insert(schema.forecastData).values(forecastsData);
    console.log(`✅ Seeded ${forecastsData.length} forecast data points\n`);

    // 13. Reports
    console.log('📝 Seeding reports...');
    const reportsData = [];
    const reportTypes = ['financial_summary', 'risk_assessment', 'compliance_audit', 'fraud_analysis'];
    
    for (let i = 0; i < 20; i++) {
      reportsData.push({
        userId: null,
        reportType: reportTypes[getRandomInt(0, reportTypes.length - 1)],
        title: `${reportTypes[i % reportTypes.length].replace('_', ' ').toUpperCase()} Report ${i + 1}`,
        content: `Comprehensive analysis report containing detailed findings and recommendations for ${companies[i % companies.length].name}.`,
        sourceDocuments: JSON.stringify(documents.slice(i * 3, i * 3 + 3).map(d => d.id)),
        citations: JSON.stringify(['Source 1', 'Source 2', 'Source 3']),
        format: i % 2 === 0 ? 'PDF' : 'XLSX',
        generatedAt: getRandomDate(45),
      });
    }
    await db.insert(schema.reports).values(reportsData);
    console.log(`✅ Seeded ${reportsData.length} reports\n`);

    // 14. Notifications (depends on documents and alerts)
    console.log('📧 Seeding notifications...');
    const notificationsData = [];
    const alerts = await db.select().from(schema.alerts);
    const channels = ['email', 'sms', 'webhook', 'in_app'];
    
    alerts.slice(0, 40).forEach((alert) => {
      notificationsData.push({
        userId: null,
        channel: channels[getRandomInt(0, channels.length - 1)],
        type: alert.alertType,
        title: `Alert: ${alert.title}`,
        message: alert.description.substring(0, 200),
        status: alert.status === 'resolved' ? 'sent' : getRandomInt(0, 1) === 0 ? 'sent' : 'pending',
        documentId: alert.sourceDocumentId,
        alertId: alert.id,
        sentAt: alert.status === 'resolved' ? alert.resolvedAt : null,
        createdAt: alert.triggeredAt,
      });
    });
    await db.insert(schema.notifications).values(notificationsData);
    console.log(`✅ Seeded ${notificationsData.length} notifications\n`);

    // 15. Alert Rules
    console.log('⚙️ Seeding alert rules...');
    const alertRulesData = [
      { userId: null, ruleName: 'High Revenue Variance', metricType: 'revenue', thresholdValue: 1000000, comparisonOperator: 'greater_than', notificationChannels: JSON.stringify(['email', 'in_app']), enabled: true, createdAt: getRandomDate(90) },
      { userId: null, ruleName: 'Debt Ratio Breach', metricType: 'debt_to_equity', thresholdValue: 2.5, comparisonOperator: 'greater_than', notificationChannels: JSON.stringify(['email', 'sms']), enabled: true, createdAt: getRandomDate(90) },
      { userId: null, ruleName: 'Low Liquidity Warning', metricType: 'current_ratio', thresholdValue: 1.0, comparisonOperator: 'less_than', notificationChannels: JSON.stringify(['email']), enabled: true, createdAt: getRandomDate(90) },
      { userId: null, ruleName: 'Anomaly Count Threshold', metricType: 'anomaly_count', thresholdValue: 5, comparisonOperator: 'greater_than', notificationChannels: JSON.stringify(['email', 'in_app', 'webhook']), enabled: true, createdAt: getRandomDate(90) },
      { userId: null, ruleName: 'Compliance Failure', metricType: 'compliance_status', thresholdValue: 1, comparisonOperator: 'equals', notificationChannels: JSON.stringify(['email', 'sms', 'in_app']), enabled: true, createdAt: getRandomDate(90) },
    ];
    await db.insert(schema.alertRules).values(alertRulesData);
    console.log(`✅ Seeded ${alertRulesData.length} alert rules\n`);

    // 16. Document Versions (depends on documents)
    console.log('📋 Seeding document versions...');
    const documentVersionsData = [];
    documents.slice(0, 25).forEach((doc, idx) => {
      if (idx % 3 === 0) {
        documentVersionsData.push({
          documentId: doc.id,
          versionNumber: 2,
          changesDetected: JSON.stringify(['Updated revenue figures', 'Corrected typos']),
          numericChanges: JSON.stringify([{ field: 'revenue', old: 1000000, new: 1050000 }]),
          textualChanges: JSON.stringify([{ field: 'summary', old: 'Old text', new: 'New text' }]),
          createdAt: getRandomDate(20),
        });
      }
    });
    await db.insert(schema.documentVersions).values(documentVersionsData);
    console.log(`✅ Seeded ${documentVersionsData.length} document versions\n`);

    // 17. Explainable AI (depends on documents, alerts, AI agent logs)
    console.log('💡 Seeding explainable AI...');
    const explainableAIData = [];
    alerts.slice(0, 30).forEach((alert) => {
      explainableAIData.push({
        documentId: alert.sourceDocumentId,
        aiAgentLogId: null,
        alertId: alert.id,
        finding: alert.title,
        explanation: `AI analysis detected this pattern using machine learning algorithms. The confidence score indicates high probability based on historical data patterns.`,
        confidenceScore: getRandomFloat(0.8, 0.99),
        citations: JSON.stringify(['Financial statement page 12', 'Transaction log entry 456']),
        reasoningChain: JSON.stringify(['Step 1: Data extraction', 'Step 2: Pattern analysis', 'Step 3: Risk assessment']),
        modelVersion: 'v2.5.0',
        createdAt: alert.triggeredAt,
      });
    });
    await db.insert(schema.explainableAI).values(explainableAIData);
    console.log(`✅ Seeded ${explainableAIData.length} explainable AI records\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • Companies: ${companiesData.length}`);
    console.log(`  • Documents: ${documentsData.length}`);
    console.log(`  • Financial Metrics: ${financialMetricsData.length}`);
    console.log(`  • Alerts: ${alertsData.length}`);
    console.log(`  • AI Agent Logs: ${aiAgentLogsData.length}`);
    console.log(`  • Total Records: ${companiesData.length + documentsData.length + financialMetricsData.length + alertsData.length + aiAgentLogsData.length + documentAnalysisData.length + complianceChecksData.length + searchQueriesData.length + benchmarksData.length + entitiesData.length + relationshipsData.length + forecastsData.length + reportsData.length + notificationsData.length + alertRulesData.length + documentVersionsData.length + explainableAIData.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seedAll();