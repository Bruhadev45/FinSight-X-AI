import { db } from '@/db';
import { aiAgentLogs } from '@/db/schema';

async function main() {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const getRandomDate = () => {
        const randomTime = sixtyDaysAgo.getTime() + Math.random() * (now.getTime() - sixtyDaysAgo.getTime());
        return new Date(randomTime).toISOString();
    };
    
    const getRandomProcessingTime = () => {
        return Math.floor(Math.random() * (15000 - 500) + 500);
    };
    
    const getRandomDocumentId = () => {
        return Math.floor(Math.random() * 90) + 1;
    };
    
    const parserSuccessMessages = [
        "Successfully extracted 247 financial data points from 10-K document",
        "Identified 12 tables, 8 charts, and 156 key metrics",
        "OCR completed with 98.5% confidence - 89 pages processed",
        "Parsed balance sheet with 100% accuracy - 87 line items extracted",
        "Extracted income statement data - 124 data points validated",
        "PDF table extraction completed - 15 financial schedules parsed",
        "Successfully parsed cash flow statement - 98 line items",
        "Footnote extraction completed - 23 notes processed",
        "Multi-page table stitching successful - 6 tables reconstructed",
        "Extracted 312 numerical values with 99.2% confidence",
        "Successfully parsed quarterly report - 45 pages, 189 metrics",
        "Excel workbook analysis completed - 18 sheets processed",
        "Identified and extracted 28 financial ratios from narrative text",
        "Parsed management discussion section - 47 key points identified"
    ];
    
    const parserProcessingMessages = [
        "Processing page 34 of 89 - extracting table data",
        "OCR in progress - analyzing page 12 of 45",
        "Parsing complex multi-column table on page 18"
    ];
    
    const parserFailedMessages = [
        "Failed to parse corrupted PDF on page 23 - encoding error",
        "OCR confidence too low (62%) - manual review required"
    ];
    
    const validatorSuccessMessages = [
        "Validated 189 data points - 3 warnings found, 0 errors",
        "Cross-referenced values with prior quarter - 98% consistency",
        "Data integrity check passed - all checksums validated",
        "Verified mathematical accuracy of 45 calculated fields",
        "Balance sheet equation validated: Assets = Liabilities + Equity",
        "Cross-footed all financial statements - no discrepancies",
        "Validated 67 footnote references - all consistent",
        "Checked 124 data points against source documents - 100% match",
        "Verified YoY comparisons - 2 immaterial differences flagged",
        "Validated account reconciliations - 23 accounts checked",
        "Currency conversion calculations verified - all correct",
        "Segment reporting totals reconciled to consolidated figures"
    ];
    
    const validatorProcessingMessages = [
        "Validating revenue recognition entries - 45 of 89 complete",
        "Cross-checking intercompany eliminations"
    ];
    
    const validatorFailedMessages = [
        "Validation failed - balance sheet does not balance (off by $2.3M)",
        "Data mismatch detected between footnotes and main statements"
    ];
    
    const analyzerSuccessMessages = [
        "Calculated 45 financial ratios - 12 metrics flagged for review",
        "Trend analysis completed - 8 adverse trends identified",
        "Computed YoY growth rates for 67 line items",
        "Peer comparison analysis finished - 15 variances noted",
        "DuPont analysis completed - ROE decomposition calculated",
        "Working capital analysis done - 4 efficiency issues found",
        "Cash flow analysis completed - 6 red flags identified",
        "Profitability ratios calculated - margins declining 3.2%",
        "Leverage analysis completed - debt levels elevated",
        "Liquidity ratios computed - current ratio at 1.2",
        "Efficiency metrics analyzed - asset turnover improving",
        "Coverage ratios calculated - interest coverage adequate",
        "Valuation multiples computed - P/E at 18.3x",
        "EBITDA bridge analysis completed"
    ];
    
    const analyzerProcessingMessages = [
        "Analyzing cash flow patterns - computing operating metrics",
        "Running Monte Carlo simulation on revenue forecast"
    ];
    
    const analyzerFailedMessages = [
        "Analysis failed - insufficient historical data for trend analysis"
    ];
    
    const fraudSuccessMessages = [
        "Scanned for 28 fraud patterns - 2 high-risk matches found",
        "Analyzed transaction flows - circular pattern detected in 3 transactions",
        "Checked for duplicate payments - 1 suspicious duplicate identified",
        "Benford's Law analysis completed - 89% conformity (acceptable)",
        "Related party transaction scan - 4 undisclosed relationships flagged",
        "Revenue recognition pattern analysis - 1 anomaly detected",
        "Ghost vendor check completed - 1 vendor requires verification",
        "Sequential invoice gap analysis - 12 gaps found (normal)",
        "Round number transaction scan - unusual frequency detected",
        "After-hours entry analysis - 8 suspicious entries found",
        "Vendor master file analysis - 2 address duplications found",
        "Journal entry pattern analysis - 3 unusual manual entries",
        "Expense report analysis - 2 policy violations detected"
    ];
    
    const fraudProcessingMessages = [
        "Analyzing 2,847 transactions for fraud indicators",
        "Running digital forensics on modified document timestamps"
    ];
    
    const fraudFailedMessages = [
        "Fraud pattern detection failed - insufficient transaction data"
    ];
    
    const complianceSuccessMessages = [
        "IFRS compliance check completed - 3 issues found requiring remediation",
        "Verified disclosure requirements - 2 missing disclosures identified",
        "SOX 404 controls validated - 1 material weakness found",
        "GAAP compliance scan completed - revenue recognition issue detected",
        "ASC 842 lease accounting verified - 89% compliant",
        "SEC filing requirements checked - all deadlines met",
        "IFRS 9 expected credit loss model validated",
        "Fair value measurement hierarchy verified - Level 3 documentation weak",
        "Related party disclosure checklist completed - 92% compliant",
        "Segment reporting requirements validated",
        "Stock compensation disclosure verified - adequate",
        "Pension accounting compliance checked - actuarial assumptions reasonable",
        "Derivative hedge accounting documentation reviewed"
    ];
    
    const complianceProcessingMessages = [
        "Checking compliance with 47 IFRS requirements",
        "Validating SOX control documentation"
    ];
    
    const complianceFailedMessages = [
        "Compliance check failed - unable to access prior period comparatives"
    ];
    
    const alertSuccessMessages = [
        "Generated 4 high-priority alerts based on threshold breaches",
        "Created 7 compliance violation notifications",
        "Triggered 2 critical fraud pattern alerts",
        "Generated 5 anomaly detection alerts - stakeholders notified",
        "Created risk spike alert - score increased 15 points",
        "Triggered 3 threshold breach notifications sent to risk team",
        "Generated 6 alerts from compliance findings",
        "Created 2 fraud alerts - escalated to audit committee"
    ];
    
    const alertProcessingMessages = [
        "Evaluating 28 findings to determine alert priority"
    ];
    
    const sampleLogs = [];
    
    // Parser logs (45 total: 36 completed, 7 processing, 2 failed)
    for (let i = 0; i < 36; i++) {
        sampleLogs.push({
            agentName: 'parser',
            documentId: getRandomDocumentId(),
            taskType: 'PDF text extraction',
            status: 'completed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: parserSuccessMessages[Math.floor(Math.random() * parserSuccessMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 7; i++) {
        sampleLogs.push({
            agentName: 'parser',
            documentId: getRandomDocumentId(),
            taskType: 'PDF text extraction',
            status: 'processing',
            processingTimeMs: null,
            resultSummary: parserProcessingMessages[Math.floor(Math.random() * parserProcessingMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 2; i++) {
        sampleLogs.push({
            agentName: 'parser',
            documentId: getRandomDocumentId(),
            taskType: 'PDF text extraction',
            status: 'failed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: parserFailedMessages[Math.floor(Math.random() * parserFailedMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    // Validator logs (36 total: 31 completed, 3 processing, 2 failed)
    for (let i = 0; i < 31; i++) {
        sampleLogs.push({
            agentName: 'validator',
            documentId: getRandomDocumentId(),
            taskType: 'Data validation',
            status: 'completed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: validatorSuccessMessages[Math.floor(Math.random() * validatorSuccessMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 3; i++) {
        sampleLogs.push({
            agentName: 'validator',
            documentId: getRandomDocumentId(),
            taskType: 'Data validation',
            status: 'processing',
            processingTimeMs: null,
            resultSummary: validatorProcessingMessages[Math.floor(Math.random() * validatorProcessingMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 2; i++) {
        sampleLogs.push({
            agentName: 'validator',
            documentId: getRandomDocumentId(),
            taskType: 'Data validation',
            status: 'failed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: validatorFailedMessages[Math.floor(Math.random() * validatorFailedMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    // Analyzer logs (36 total: 29 completed, 5 processing, 2 failed)
    for (let i = 0; i < 29; i++) {
        sampleLogs.push({
            agentName: 'analyzer',
            documentId: getRandomDocumentId(),
            taskType: 'Financial ratio calculation',
            status: 'completed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: analyzerSuccessMessages[Math.floor(Math.random() * analyzerSuccessMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 5; i++) {
        sampleLogs.push({
            agentName: 'analyzer',
            documentId: getRandomDocumentId(),
            taskType: 'Financial ratio calculation',
            status: 'processing',
            processingTimeMs: null,
            resultSummary: analyzerProcessingMessages[Math.floor(Math.random() * analyzerProcessingMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 2; i++) {
        sampleLogs.push({
            agentName: 'analyzer',
            documentId: getRandomDocumentId(),
            taskType: 'Financial ratio calculation',
            status: 'failed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: analyzerFailedMessages[Math.floor(Math.random() * analyzerFailedMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    // Fraud detector logs (27 total: 20 completed, 5 processing, 2 failed)
    for (let i = 0; i < 20; i++) {
        sampleLogs.push({
            agentName: 'fraud_detector',
            documentId: getRandomDocumentId(),
            taskType: 'Fraud pattern detection',
            status: 'completed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: fraudSuccessMessages[Math.floor(Math.random() * fraudSuccessMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 5; i++) {
        sampleLogs.push({
            agentName: 'fraud_detector',
            documentId: getRandomDocumentId(),
            taskType: 'Fraud pattern detection',
            status: 'processing',
            processingTimeMs: null,
            resultSummary: fraudProcessingMessages[Math.floor(Math.random() * fraudProcessingMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 2; i++) {
        sampleLogs.push({
            agentName: 'fraud_detector',
            documentId: getRandomDocumentId(),
            taskType: 'Fraud pattern detection',
            status: 'failed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: fraudFailedMessages[Math.floor(Math.random() * fraudFailedMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    // Compliance checker logs (27 total: 22 completed, 4 processing, 1 failed)
    for (let i = 0; i < 22; i++) {
        sampleLogs.push({
            agentName: 'compliance_checker',
            documentId: getRandomDocumentId(),
            taskType: 'Compliance verification',
            status: 'completed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: complianceSuccessMessages[Math.floor(Math.random() * complianceSuccessMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    for (let i = 0; i < 4; i++) {
        sampleLogs.push({
            agentName: 'compliance_checker',
            documentId: getRandomDocumentId(),
            taskType: 'Compliance verification',
            status: 'processing',
            processingTimeMs: null,
            resultSummary: complianceProcessingMessages[Math.floor(Math.random() * complianceProcessingMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    sampleLogs.push({
        agentName: 'compliance_checker',
        documentId: getRandomDocumentId(),
        taskType: 'Compliance verification',
        status: 'failed',
        processingTimeMs: getRandomProcessingTime(),
        resultSummary: complianceFailedMessages[0],
        createdAt: getRandomDate()
    });
    
    // Alert generator logs (9 total: 8 completed, 1 processing)
    for (let i = 0; i < 8; i++) {
        sampleLogs.push({
            agentName: 'alert_generator',
            documentId: getRandomDocumentId(),
            taskType: 'Alert generation',
            status: 'completed',
            processingTimeMs: getRandomProcessingTime(),
            resultSummary: alertSuccessMessages[Math.floor(Math.random() * alertSuccessMessages.length)],
            createdAt: getRandomDate()
        });
    }
    
    sampleLogs.push({
        agentName: 'alert_generator',
        documentId: getRandomDocumentId(),
        taskType: 'Alert generation',
        status: 'processing',
        processingTimeMs: null,
        resultSummary: alertProcessingMessages[0],
        createdAt: getRandomDate()
    });
    
    await db.insert(aiAgentLogs).values(sampleLogs);
    
    console.log('✅ AI Agent Logs seeder completed successfully - 180 logs generated');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});