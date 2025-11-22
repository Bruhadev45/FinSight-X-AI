import { db } from '@/db';
import { complianceChecks } from '@/db/schema';

async function main() {
    const sampleComplianceChecks = [
        {
            documentId: 1,
            standardType: 'IFRS',
            checkName: 'Revenue Recognition Timing',
            result: 'fail',
            details: 'IAS 18 violation: revenue recognized before delivery',
            recommendation: 'Revise revenue recognition policy',
            checkedAt: new Date('2024-12-15').toISOString(),
        },
        {
            documentId: 2,
            standardType: 'IFRS',
            checkName: 'Asset Valuation',
            result: 'warning',
            details: 'IFRS 9 concern: fair value measurement inconsistency',
            recommendation: 'Review asset valuation methodology',
            checkedAt: new Date('2024-12-18').toISOString(),
        },
        {
            documentId: 3,
            standardType: 'IFRS',
            checkName: 'Financial Statement Presentation',
            result: 'pass',
            details: 'All IFRS presentation requirements met',
            recommendation: 'None',
            checkedAt: new Date('2024-12-20').toISOString(),
        },
        {
            documentId: 7,
            standardType: 'SEBI',
            checkName: 'Insider Trading Compliance',
            result: 'fail',
            details: 'Trading window violation detected',
            recommendation: 'Investigate and report to compliance committee',
            checkedAt: new Date('2024-12-22').toISOString(),
        },
        {
            documentId: 9,
            standardType: 'SEBI',
            checkName: 'Disclosure Requirements',
            result: 'pass',
            details: 'All material disclosures properly made',
            recommendation: 'None',
            checkedAt: new Date('2024-12-25').toISOString(),
        },
        {
            documentId: 11,
            standardType: 'SEBI',
            checkName: 'Corporate Governance',
            result: 'warning',
            details: 'Related party transaction disclosure incomplete',
            recommendation: 'Complete disclosure in next filing',
            checkedAt: new Date('2024-12-28').toISOString(),
        },
        {
            documentId: 4,
            standardType: 'ESG',
            checkName: 'Environmental Reporting',
            result: 'pass',
            details: 'Carbon emissions properly disclosed',
            recommendation: 'Continue current practices',
            checkedAt: new Date('2024-12-16').toISOString(),
        },
        {
            documentId: 6,
            standardType: 'ESG',
            checkName: 'Social Responsibility',
            result: 'warning',
            details: 'Labor practices disclosure lacking detail',
            recommendation: 'Enhance social impact reporting',
            checkedAt: new Date('2024-12-19').toISOString(),
        },
        {
            documentId: 8,
            standardType: 'ESG',
            checkName: 'Governance Structure',
            result: 'fail',
            details: 'Board independence requirements not met',
            recommendation: 'Restructure board composition',
            checkedAt: new Date('2024-12-21').toISOString(),
        },
        {
            documentId: 11,
            standardType: 'SOX',
            checkName: 'Internal Controls 404',
            result: 'fail',
            details: 'Material weakness in financial reporting controls',
            recommendation: 'Immediate remediation required',
            checkedAt: new Date('2024-12-23').toISOString(),
        },
        {
            documentId: 1,
            standardType: 'SOX',
            checkName: 'Management Assessment',
            result: 'warning',
            details: 'Control deficiency in revenue process',
            recommendation: 'Strengthen revenue controls',
            checkedAt: new Date('2024-12-24').toISOString(),
        },
        {
            documentId: 5,
            standardType: 'SOX',
            checkName: 'Auditor Independence',
            result: 'pass',
            details: 'No independence issues identified',
            recommendation: 'None',
            checkedAt: new Date('2024-12-26').toISOString(),
        },
        {
            documentId: 10,
            standardType: 'SOX',
            checkName: 'Financial Certification',
            result: 'pass',
            details: 'CEO/CFO certifications complete and accurate',
            recommendation: 'None',
            checkedAt: new Date('2024-12-27').toISOString(),
        },
        {
            documentId: 12,
            standardType: 'SOX',
            checkName: 'Change in Controls',
            result: 'warning',
            details: 'Significant control changes not properly documented',
            recommendation: 'Update control documentation',
            checkedAt: new Date('2024-12-29').toISOString(),
        },
        {
            documentId: 2,
            standardType: 'SOX',
            checkName: 'IT General Controls',
            result: 'pass',
            details: 'Technology controls operating effectively',
            recommendation: 'Continue monitoring',
            checkedAt: new Date('2024-12-30').toISOString(),
        },
    ];

    await db.insert(complianceChecks).values(sampleComplianceChecks);
    
    console.log('✅ Compliance checks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});