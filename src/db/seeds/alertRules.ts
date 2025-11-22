import { db } from '@/db';
import { alertRules } from '@/db/schema';

async function main() {
    const sampleAlertRules = [
        {
            userId: null,
            ruleName: 'Critical Debt-to-Equity Alert',
            metricType: 'debt_to_equity',
            thresholdValue: 5.0,
            comparisonOperator: '>',
            notificationChannels: JSON.stringify(['push', 'email', 'sms']),
            enabled: true,
            createdAt: new Date('2024-10-15').toISOString(),
        },
        {
            userId: null,
            ruleName: 'Revenue Decline Warning',
            metricType: 'revenue_change',
            thresholdValue: -10.0,
            comparisonOperator: '<',
            notificationChannels: JSON.stringify(['push', 'email']),
            enabled: true,
            createdAt: new Date('2024-11-01').toISOString(),
        },
        {
            userId: null,
            ruleName: 'Compliance Score Threshold',
            metricType: 'compliance_score',
            thresholdValue: 75.0,
            comparisonOperator: '<',
            notificationChannels: JSON.stringify(['push']),
            enabled: true,
            createdAt: new Date('2024-11-20').toISOString(),
        },
        {
            userId: null,
            ruleName: 'High Debt Ratio Monitor',
            metricType: 'debt_to_equity',
            thresholdValue: 3.0,
            comparisonOperator: '>=',
            notificationChannels: JSON.stringify(['email', 'push']),
            enabled: false,
            createdAt: new Date('2024-12-05').toISOString(),
        },
        {
            userId: null,
            ruleName: 'Revenue Growth Target',
            metricType: 'revenue_change',
            thresholdValue: 5.0,
            comparisonOperator: '>=',
            notificationChannels: JSON.stringify(['push']),
            enabled: true,
            createdAt: new Date('2024-12-28').toISOString(),
        }
    ];

    await db.insert(alertRules).values(sampleAlertRules);
    
    console.log('✅ Alert rules seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});