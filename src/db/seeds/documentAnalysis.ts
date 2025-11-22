import { db } from '@/db';
import { documentAnalysis } from '@/db/schema';

async function main() {
    const sampleDocumentAnalysis = [
        // Document 1 - Fraud Analysis
        {
            documentId: 1,
            analysisType: 'fraud',
            keyFindings: [
                'Round number transactions pattern detected in Q4',
                'Sequential invoice numbering gaps between INV-2045 and INV-2089',
                'After-hours transaction entries on weekends',
                'Vendor payment amounts consistently ending in .00'
            ],
            fraudIndicators: [
                'Round number transactions pattern',
                'Sequential invoice numbering gaps',
                'After-hours transaction entries',
                'Suspicious vendor payment patterns'
            ],
            confidenceScore: 0.87,
            analyzedAt: new Date('2024-12-15T10:30:00Z').toISOString(),
        },
        // Document 1 - Compliance Analysis
        {
            documentId: 1,
            analysisType: 'compliance',
            keyFindings: [
                'Missing supporting documentation for $75,000 transaction',
                'Revenue recognition timing appears inconsistent with GAAP',
                'Incomplete audit trail for expense reimbursements'
            ],
            fraudIndicators: [],
            confidenceScore: 0.92,
            analyzedAt: new Date('2024-12-16T14:20:00Z').toISOString(),
        },
        // Document 2 - Risk Analysis
        {
            documentId: 2,
            analysisType: 'risk',
            keyFindings: [
                'Debt-to-equity ratio of 2.8 exceeds industry average of 1.5',
                'Current ratio below 1.0 indicates liquidity concerns',
                'Significant concentration risk with top 3 customers (75% revenue)',
                'Operating cash flow declined 40% year-over-year'
            ],
            fraudIndicators: [],
            confidenceScore: 0.89,
            analyzedAt: new Date('2024-12-17T09:15:00Z').toISOString(),
        },
        // Document 2 - KPI Analysis
        {
            documentId: 2,
            analysisType: 'kpi',
            keyFindings: [
                'Gross margin decreased from 45% to 38% over last fiscal year',
                'Customer acquisition cost increased by 35%',
                'Revenue per employee below industry benchmark',
                'Days sales outstanding increased to 68 days'
            ],
            fraudIndicators: [],
            confidenceScore: 0.94,
            analyzedAt: new Date('2024-12-18T11:45:00Z').toISOString(),
        },
        // Document 3 - Fraud Analysis
        {
            documentId: 3,
            analysisType: 'fraud',
            keyFindings: [
                'Duplicate payments to same vendor within 3-day period',
                'Expense reports submitted minutes before policy deadline',
                'Vendor address matches employee home address',
                'Unusual spike in Q4 consulting expenses'
            ],
            fraudIndicators: [
                'Duplicate payment pattern',
                'Last-minute expense submissions',
                'Vendor-employee address correlation',
                'End-of-period expense anomalies'
            ],
            confidenceScore: 0.91,
            analyzedAt: new Date('2024-12-19T13:30:00Z').toISOString(),
        },
        // Document 3 - Compliance Analysis
        {
            documentId: 3,
            analysisType: 'compliance',
            keyFindings: [
                'Related party transactions not properly disclosed',
                'Stock option expense recognition timing issues',
                'Inadequate controls over journal entry approvals'
            ],
            fraudIndicators: [],
            confidenceScore: 0.88,
            analyzedAt: new Date('2024-12-20T10:00:00Z').toISOString(),
        },
        // Document 4 - Risk Analysis
        {
            documentId: 4,
            analysisType: 'risk',
            keyFindings: [
                'Goodwill impairment risk due to declining market conditions',
                'Foreign exchange exposure increased by 60%',
                'Working capital deficit of $2.3M',
                'Key customer bankruptcy filing detected'
            ],
            fraudIndicators: [],
            confidenceScore: 0.85,
            analyzedAt: new Date('2024-12-21T15:20:00Z').toISOString(),
        },
        // Document 4 - KPI Analysis
        {
            documentId: 4,
            analysisType: 'kpi',
            keyFindings: [
                'EBITDA margin compressed to 12% from 18%',
                'Inventory turnover ratio declined to 4.2x',
                'Customer churn rate increased to 28%',
                'Marketing ROI below breakeven threshold'
            ],
            fraudIndicators: [],
            confidenceScore: 0.93,
            analyzedAt: new Date('2024-12-22T09:45:00Z').toISOString(),
        },
        // Document 5 - Fraud Analysis
        {
            documentId: 5,
            analysisType: 'fraud',
            keyFindings: [
                'Manual journal entries bypass normal approval workflow',
                'Recurring vendor with no prior payment history',
                'Check numbers out of sequence for multiple transactions',
                'Expense categories reclassified after quarter close'
            ],
            fraudIndicators: [
                'Manual journal entry anomalies',
                'New vendor red flags',
                'Check number sequencing issues',
                'Post-period reclassifications'
            ],
            confidenceScore: 0.86,
            analyzedAt: new Date('2024-12-23T11:15:00Z').toISOString(),
        },
        // Document 5 - Compliance Analysis
        {
            documentId: 5,
            analysisType: 'compliance',
            keyFindings: [
                'Lease accounting treatment inconsistent with ASC 842',
                'Capitalized software costs exceed policy thresholds',
                'Segment reporting disclosures incomplete',
                'Management override of internal controls detected'
            ],
            fraudIndicators: [],
            confidenceScore: 0.90,
            analyzedAt: new Date('2024-12-24T14:30:00Z').toISOString(),
        },
        // Document 6 - Risk Analysis
        {
            documentId: 6,
            analysisType: 'risk',
            keyFindings: [
                'Pension liability underfunded by $8.5M',
                'Concentration in single geographic market (82% revenue)',
                'Debt covenant compliance margin less than 5%',
                'Regulatory investigation disclosed in footnotes'
            ],
            fraudIndicators: [],
            confidenceScore: 0.88,
            analyzedAt: new Date('2024-12-25T10:20:00Z').toISOString(),
        },
        // Document 6 - KPI Analysis
        {
            documentId: 6,
            analysisType: 'kpi',
            keyFindings: [
                'Return on assets decreased to 3.2%',
                'Asset utilization ratio below peer average',
                'Operating expense ratio increased to 78%',
                'Cash conversion cycle extended to 95 days'
            ],
            fraudIndicators: [],
            confidenceScore: 0.91,
            analyzedAt: new Date('2024-12-26T13:00:00Z').toISOString(),
        },
        // Document 7 - Fraud Analysis
        {
            documentId: 7,
            analysisType: 'fraud',
            keyFindings: [
                'Unusual patterns in credit memo issuance',
                'Vendor setup forms lack proper authorization',
                'Bank reconciliation items outstanding over 90 days',
                'Payroll adjustments concentrated in single department'
            ],
            fraudIndicators: [
                'Credit memo manipulation patterns',
                'Unauthorized vendor additions',
                'Unreconciled banking items',
                'Payroll adjustment anomalies'
            ],
            confidenceScore: 0.84,
            analyzedAt: new Date('2024-12-27T09:30:00Z').toISOString(),
        },
        // Document 7 - Compliance Analysis
        {
            documentId: 7,
            analysisType: 'compliance',
            keyFindings: [
                'Transfer pricing documentation inadequate',
                'Stock compensation expense calculation errors',
                'Contingent liability disclosure timing issues',
                'SOX control deficiencies identified'
            ],
            fraudIndicators: [],
            confidenceScore: 0.87,
            analyzedAt: new Date('2024-12-28T11:45:00Z').toISOString(),
        },
        // Document 8 - Risk Analysis
        {
            documentId: 8,
            analysisType: 'risk',
            keyFindings: [
                'Interest coverage ratio declined to 1.8x',
                'Supply chain disruption impact quantified at $12M',
                'Cybersecurity incident disclosed with potential liability',
                'Credit rating downgraded from A- to BBB+'
            ],
            fraudIndicators: [],
            confidenceScore: 0.92,
            analyzedAt: new Date('2024-12-29T14:15:00Z').toISOString(),
        },
        // Document 8 - KPI Analysis
        {
            documentId: 8,
            analysisType: 'kpi',
            keyFindings: [
                'Revenue growth rate decelerated to 8% from 22%',
                'Customer lifetime value decreased 30%',
                'Operating margin compressed by 400 basis points',
                'Employee productivity metrics below target'
            ],
            fraudIndicators: [],
            confidenceScore: 0.89,
            analyzedAt: new Date('2024-12-30T10:30:00Z').toISOString(),
        },
        // Document 9 - Fraud Analysis
        {
            documentId: 9,
            analysisType: 'fraud',
            keyFindings: [
                'Refund transactions processed without proper documentation',
                'Ghost employee indicators in payroll records',
                'Inventory shrinkage exceeds industry norms by 250%',
                'Purchase order modifications post-approval'
            ],
            fraudIndicators: [
                'Unauthorized refund patterns',
                'Payroll ghost employee red flags',
                'Excessive inventory shrinkage',
                'Post-approval PO changes'
            ],
            confidenceScore: 0.90,
            analyzedAt: new Date('2024-12-31T12:00:00Z').toISOString(),
        },
        // Document 9 - Compliance Analysis
        {
            documentId: 9,
            analysisType: 'compliance',
            keyFindings: [
                'GDPR data retention policies not consistently applied',
                'Environmental liability disclosure inadequate',
                'Executive compensation disclosure incomplete',
                'Audit committee charter violations detected'
            ],
            fraudIndicators: [],
            confidenceScore: 0.86,
            analyzedAt: new Date('2025-01-01T09:15:00Z').toISOString(),
        },
        // Document 10 - Risk Analysis
        {
            documentId: 10,
            analysisType: 'risk',
            keyFindings: [
                'Cash reserves provide only 45 days of operating runway',
                'Customer concentration with top 5 accounts at 85%',
                'Product liability insurance coverage below recommended levels',
                'Key person dependency risk with single founder'
            ],
            fraudIndicators: [],
            confidenceScore: 0.88,
            analyzedAt: new Date('2025-01-02T11:30:00Z').toISOString(),
        },
        // Document 10 - KPI Analysis
        {
            documentId: 10,
            analysisType: 'kpi',
            keyFindings: [
                'Net promoter score declined to 28 from 45',
                'Sales cycle length increased by 35%',
                'Free cash flow negative for three consecutive quarters',
                'Research and development spending below peer average'
            ],
            fraudIndicators: [],
            confidenceScore: 0.93,
            analyzedAt: new Date('2025-01-03T13:45:00Z').toISOString(),
        },
        // Additional Document 1 - Risk Analysis
        {
            documentId: 1,
            analysisType: 'risk',
            keyFindings: [
                'Accounts receivable aging shows 35% over 90 days',
                'Derivative instruments lack proper hedge documentation',
                'Significant related party transaction volume',
                'Going concern warning from external auditors'
            ],
            fraudIndicators: [],
            confidenceScore: 0.85,
            analyzedAt: new Date('2025-01-04T10:00:00Z').toISOString(),
        },
        // Additional Document 2 - Fraud Analysis
        {
            documentId: 2,
            analysisType: 'fraud',
            keyFindings: [
                'Sales returns processed outside normal patterns',
                'Vendor rebates lack supporting agreements',
                'Travel expense reimbursements exceed policy limits',
                'Revenue recognized before delivery confirmation'
            ],
            fraudIndicators: [
                'Abnormal sales return patterns',
                'Undocumented vendor rebates',
                'Policy violation patterns',
                'Premature revenue recognition'
            ],
            confidenceScore: 0.83,
            analyzedAt: new Date('2025-01-05T14:20:00Z').toISOString(),
        },
        // Additional Document 3 - KPI Analysis
        {
            documentId: 3,
            analysisType: 'kpi',
            keyFindings: [
                'Burn rate increased to $850K per month',
                'Customer retention rate dropped to 72%',
                'Average contract value declined 18%',
                'Sales pipeline velocity decreased significantly'
            ],
            fraudIndicators: [],
            confidenceScore: 0.90,
            analyzedAt: new Date('2025-01-06T09:30:00Z').toISOString(),
        },
        // Additional Document 4 - Compliance Analysis
        {
            documentId: 4,
            analysisType: 'compliance',
            keyFindings: [
                'Anti-money laundering controls need strengthening',
                'Export control documentation incomplete',
                'Privacy policy not updated for recent regulations',
                'Board meeting minutes show governance gaps'
            ],
            fraudIndicators: [],
            confidenceScore: 0.87,
            analyzedAt: new Date('2025-01-07T11:00:00Z').toISOString(),
        },
        // Additional Document 5 - Risk Analysis
        {
            documentId: 5,
            analysisType: 'risk',
            keyFindings: [
                'Product warranty reserves appear understated',
                'Intellectual property infringement lawsuit pending',
                'Key supplier dependency on single source',
                'Business interruption insurance coverage gaps'
            ],
            fraudIndicators: [],
            confidenceScore: 0.86,
            analyzedAt: new Date('2025-01-08T13:15:00Z').toISOString(),
        }
    ];

    await db.insert(documentAnalysis).values(sampleDocumentAnalysis);
    
    console.log('✅ Document analysis seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});