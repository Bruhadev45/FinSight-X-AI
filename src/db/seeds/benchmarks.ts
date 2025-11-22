import { db } from '@/db';
import { benchmarks } from '@/db/schema';

async function main() {
    const now = new Date();
    const getRecentDate = (daysAgo: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const sampleBenchmarks = [
        // TechCorp vs Global Finance Bank (Q4-2023)
        {
            companyId: 1,
            peerCompanyId: 2,
            metricName: 'revenue',
            companyValue: 50000000,
            peerValue: 85000000,
            variancePercentage: -41.18,
            period: 'Q4-2023',
            createdAt: getRecentDate(15),
        },
        {
            companyId: 1,
            peerCompanyId: 2,
            metricName: 'net_income',
            companyValue: 8000000,
            peerValue: 18000000,
            variancePercentage: -55.56,
            period: 'Q4-2023',
            createdAt: getRecentDate(15),
        },
        {
            companyId: 1,
            peerCompanyId: 2,
            metricName: 'debt_to_equity',
            companyValue: 0.6,
            peerValue: 5.67,
            variancePercentage: -89.42,
            period: 'Q4-2023',
            createdAt: getRecentDate(15),
        },
        {
            companyId: 1,
            peerCompanyId: 2,
            metricName: 'roe',
            companyValue: 0.107,
            peerValue: 0.24,
            variancePercentage: -55.42,
            period: 'Q4-2023',
            createdAt: getRecentDate(15),
        },

        // TechCorp vs ManuCraft (Q4-2023)
        {
            companyId: 1,
            peerCompanyId: 3,
            metricName: 'revenue',
            companyValue: 50000000,
            peerValue: 38000000,
            variancePercentage: 31.58,
            period: 'Q4-2023',
            createdAt: getRecentDate(20),
        },
        {
            companyId: 1,
            peerCompanyId: 3,
            metricName: 'ebitda',
            companyValue: 12000000,
            peerValue: 8000000,
            variancePercentage: 50.0,
            period: 'Q4-2023',
            createdAt: getRecentDate(20),
        },
        {
            companyId: 1,
            peerCompanyId: 3,
            metricName: 'current_ratio',
            companyValue: 2.1,
            peerValue: 1.8,
            variancePercentage: 16.67,
            period: 'Q4-2023',
            createdAt: getRecentDate(20),
        },

        // Global Finance Bank vs HealthCare Plus (Q4-2023)
        {
            companyId: 2,
            peerCompanyId: 4,
            metricName: 'revenue',
            companyValue: 85000000,
            peerValue: 72000000,
            variancePercentage: 18.06,
            period: 'Q4-2023',
            createdAt: getRecentDate(25),
        },
        {
            companyId: 2,
            peerCompanyId: 4,
            metricName: 'debt_to_equity',
            companyValue: 5.67,
            peerValue: 0.76,
            variancePercentage: 645.39,
            period: 'Q4-2023',
            createdAt: getRecentDate(25),
        },
        {
            companyId: 2,
            peerCompanyId: 4,
            metricName: 'net_income',
            companyValue: 18000000,
            peerValue: 10000000,
            variancePercentage: 80.0,
            period: 'Q4-2023',
            createdAt: getRecentDate(25),
        },

        // RetailMax vs ManuCraft (Q4-2023)
        {
            companyId: 5,
            peerCompanyId: 3,
            metricName: 'revenue',
            companyValue: 65000000,
            peerValue: 38000000,
            variancePercentage: 71.05,
            period: 'Q4-2023',
            createdAt: getRecentDate(30),
        },
        {
            companyId: 5,
            peerCompanyId: 3,
            metricName: 'current_ratio',
            companyValue: 2.2,
            peerValue: 1.8,
            variancePercentage: 22.22,
            period: 'Q4-2023',
            createdAt: getRecentDate(30),
        },
        {
            companyId: 5,
            peerCompanyId: 3,
            metricName: 'roe',
            companyValue: 0.122,
            peerValue: 0.106,
            variancePercentage: 15.09,
            period: 'Q4-2023',
            createdAt: getRecentDate(30),
        },

        // HealthCare Plus vs TechCorp (Q4-2023)
        {
            companyId: 4,
            peerCompanyId: 1,
            metricName: 'revenue',
            companyValue: 72000000,
            peerValue: 50000000,
            variancePercentage: 44.0,
            period: 'Q4-2023',
            createdAt: getRecentDate(35),
        },
        {
            companyId: 4,
            peerCompanyId: 1,
            metricName: 'ebitda',
            companyValue: 15000000,
            peerValue: 12000000,
            variancePercentage: 25.0,
            period: 'Q4-2023',
            createdAt: getRecentDate(35),
        },
        {
            companyId: 4,
            peerCompanyId: 1,
            metricName: 'equity',
            companyValue: 85000000,
            peerValue: 75000000,
            variancePercentage: 13.33,
            period: 'Q4-2023',
            createdAt: getRecentDate(35),
        },

        // Historical Comparisons (Q3-2023)
        {
            companyId: 1,
            peerCompanyId: 3,
            metricName: 'revenue',
            companyValue: 48000000,
            peerValue: 36000000,
            variancePercentage: 33.33,
            period: 'Q3-2023',
            createdAt: getRecentDate(40),
        },
        {
            companyId: 2,
            peerCompanyId: 4,
            metricName: 'net_income',
            companyValue: 17000000,
            peerValue: 9500000,
            variancePercentage: 78.95,
            period: 'Q3-2023',
            createdAt: getRecentDate(45),
        },
        {
            companyId: 1,
            peerCompanyId: 2,
            metricName: 'debt_to_equity',
            companyValue: 0.597,
            peerValue: 6.0,
            variancePercentage: -90.05,
            period: 'Q3-2023',
            createdAt: getRecentDate(50),
        },
        {
            companyId: 5,
            peerCompanyId: 3,
            metricName: 'current_ratio',
            companyValue: 2.15,
            peerValue: 1.75,
            variancePercentage: 22.86,
            period: 'Q3-2023',
            createdAt: getRecentDate(55),
        },
    ];

    await db.insert(benchmarks).values(sampleBenchmarks);
    
    console.log('✅ Benchmarks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});