import { db } from '@/db';
import { forecastData } from '@/db/schema';

async function main() {
    const methodologies = ['time_series', 'regression', 'monte_carlo', 'arima'];
    const quarters = [
        { period: 'Q1 2025', date: '2025-03-31' },
        { period: 'Q2 2025', date: '2025-06-30' },
        { period: 'Q3 2025', date: '2025-09-30' },
        { period: 'Q4 2025', date: '2025-12-31' }
    ];

    const getRecentDate = () => {
        const daysAgo = Math.floor(Math.random() * 15);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const getRandomMethodology = () => {
        return methodologies[Math.floor(Math.random() * methodologies.length)];
    };

    const applyGrowth = (value: number, quarterIndex: number, minGrowth: number = 0.05, maxGrowth: number = 0.15) => {
        const growthRate = minGrowth + Math.random() * (maxGrowth - minGrowth);
        return value * Math.pow(1 + growthRate, quarterIndex);
    };

    const sampleForecasts = [
        // REVENUE FORECASTS - Apple (20 total revenue forecasts, 5 companies x 4 quarters)
        ...quarters.map((q, index) => ({
            companyId: 1,
            forecastType: 'revenue',
            period: q.period,
            lowEstimate: applyGrowth(95000000000, index, 0.05, 0.10),
            midEstimate: applyGrowth(98000000000, index, 0.05, 0.12),
            highEstimate: applyGrowth(102000000000, index, 0.08, 0.15),
            confidence: 0.85 - (index * 0.02),
            methodology: getRandomMethodology(),
            forecastDate: q.date,
            createdAt: getRecentDate(),
        })),

        // Microsoft Revenue
        ...quarters.map((q, index) => ({
            companyId: 2,
            forecastType: 'revenue',
            period: q.period,
            lowEstimate: applyGrowth(62000000000, index, 0.06, 0.11),
            midEstimate: applyGrowth(65000000000, index, 0.07, 0.13),
            highEstimate: applyGrowth(69000000000, index, 0.09, 0.15),
            confidence: 0.82 - (index * 0.02),
            methodology: getRandomMethodology(),
            forecastDate: q.date,
            createdAt: getRecentDate(),
        })),

        // JPMorgan Revenue
        ...quarters.map((q, index) => ({
            companyId: 3,
            forecastType: 'revenue',
            period: q.period,
            lowEstimate: applyGrowth(40000000000, index, 0.05, 0.10),
            midEstimate: applyGrowth(43000000000, index, 0.06, 0.12),
            highEstimate: applyGrowth(46000000000, index, 0.08, 0.14),
            confidence: 0.78 - (index * 0.02),
            methodology: getRandomMethodology(),
            forecastDate: q.date,
            createdAt: getRecentDate(),
        })),

        // Tesla Revenue (companyId: 5, skipping 4 to match requirement)
        ...quarters.map((q, index) => ({
            companyId: 5,
            forecastType: 'revenue',
            period: q.period,
            lowEstimate: applyGrowth(24000000000, index, 0.08, 0.13),
            midEstimate: applyGrowth(26000000000, index, 0.09, 0.14),
            highEstimate: applyGrowth(29000000000, index, 0.10, 0.15),
            confidence: 0.72 - (index * 0.02),
            methodology: getRandomMethodology(),
            forecastDate: q.date,
            createdAt: getRecentDate(),
        })),

        // Walmart Revenue (companyId: 4)
        ...quarters.map((q, index) => ({
            companyId: 4,
            forecastType: 'revenue',
            period: q.period,
            lowEstimate: applyGrowth(158000000000, index, 0.03, 0.08),
            midEstimate: applyGrowth(162000000000, index, 0.04, 0.09),
            highEstimate: applyGrowth(168000000000, index, 0.05, 0.10),
            confidence: 0.80 - (index * 0.02),
            methodology: getRandomMethodology(),
            forecastDate: q.date,
            createdAt: getRecentDate(),
        })),

        // RISK_SCORE FORECASTS (15 total: 4 companies, different quarters)
        // Apple Risk Score - Q1 2025
        {
            companyId: 1,
            forecastType: 'risk_score',
            period: 'Q1 2025',
            lowEstimate: 23,
            midEstimate: 25,
            highEstimate: 28,
            confidence: 0.88,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },

        // Microsoft Risk Score - Q2 2025
        {
            companyId: 2,
            forecastType: 'risk_score',
            period: 'Q2 2025',
            lowEstimate: 20,
            midEstimate: 22,
            highEstimate: 25,
            confidence: 0.86,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },

        // JPMorgan Risk Score - Q3 2025
        {
            companyId: 3,
            forecastType: 'risk_score',
            period: 'Q3 2025',
            lowEstimate: 42,
            midEstimate: 45,
            highEstimate: 50,
            confidence: 0.80,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },

        // Tesla Risk Score - Q4 2025
        {
            companyId: 5,
            forecastType: 'risk_score',
            period: 'Q4 2025',
            lowEstimate: 65,
            midEstimate: 68,
            highEstimate: 73,
            confidence: 0.75,
            methodology: getRandomMethodology(),
            forecastDate: '2025-12-31',
            createdAt: getRecentDate(),
        },

        // Additional Risk Score forecasts for other quarters and companies
        {
            companyId: 1,
            forecastType: 'risk_score',
            period: 'Q2 2025',
            lowEstimate: 24,
            midEstimate: 26,
            highEstimate: 29,
            confidence: 0.87,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 1,
            forecastType: 'risk_score',
            period: 'Q3 2025',
            lowEstimate: 25,
            midEstimate: 27,
            highEstimate: 31,
            confidence: 0.85,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'risk_score',
            period: 'Q1 2025',
            lowEstimate: 19,
            midEstimate: 21,
            highEstimate: 24,
            confidence: 0.87,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'risk_score',
            period: 'Q3 2025',
            lowEstimate: 21,
            midEstimate: 23,
            highEstimate: 26,
            confidence: 0.84,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'risk_score',
            period: 'Q1 2025',
            lowEstimate: 40,
            midEstimate: 43,
            highEstimate: 48,
            confidence: 0.82,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'risk_score',
            period: 'Q2 2025',
            lowEstimate: 41,
            midEstimate: 44,
            highEstimate: 49,
            confidence: 0.81,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'risk_score',
            period: 'Q4 2025',
            lowEstimate: 43,
            midEstimate: 46,
            highEstimate: 51,
            confidence: 0.79,
            methodology: getRandomMethodology(),
            forecastDate: '2025-12-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 5,
            forecastType: 'risk_score',
            period: 'Q1 2025',
            lowEstimate: 62,
            midEstimate: 65,
            highEstimate: 70,
            confidence: 0.77,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 5,
            forecastType: 'risk_score',
            period: 'Q2 2025',
            lowEstimate: 63,
            midEstimate: 66,
            highEstimate: 71,
            confidence: 0.76,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 5,
            forecastType: 'risk_score',
            period: 'Q3 2025',
            lowEstimate: 64,
            midEstimate: 67,
            highEstimate: 72,
            confidence: 0.76,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 4,
            forecastType: 'risk_score',
            period: 'Q2 2025',
            lowEstimate: 32,
            midEstimate: 35,
            highEstimate: 39,
            confidence: 0.83,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },

        // CASH_FLOW FORECASTS (10 total: Apple Q1, Microsoft Q2, and additional quarters)
        {
            companyId: 1,
            forecastType: 'cash_flow',
            period: 'Q1 2025',
            lowEstimate: 28000000000,
            midEstimate: 30000000000,
            highEstimate: 33000000000,
            confidence: 0.84,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 1,
            forecastType: 'cash_flow',
            period: 'Q2 2025',
            lowEstimate: 29500000000,
            midEstimate: 31500000000,
            highEstimate: 34500000000,
            confidence: 0.83,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 1,
            forecastType: 'cash_flow',
            period: 'Q3 2025',
            lowEstimate: 31000000000,
            midEstimate: 33000000000,
            highEstimate: 36000000000,
            confidence: 0.82,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'cash_flow',
            period: 'Q2 2025',
            lowEstimate: 22000000000,
            midEstimate: 24000000000,
            highEstimate: 27000000000,
            confidence: 0.81,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'cash_flow',
            period: 'Q1 2025',
            lowEstimate: 21000000000,
            midEstimate: 23000000000,
            highEstimate: 26000000000,
            confidence: 0.82,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'cash_flow',
            period: 'Q3 2025',
            lowEstimate: 23000000000,
            midEstimate: 25000000000,
            highEstimate: 28000000000,
            confidence: 0.80,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'cash_flow',
            period: 'Q1 2025',
            lowEstimate: 12000000000,
            midEstimate: 13500000000,
            highEstimate: 15500000000,
            confidence: 0.79,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'cash_flow',
            period: 'Q2 2025',
            lowEstimate: 12500000000,
            midEstimate: 14000000000,
            highEstimate: 16000000000,
            confidence: 0.78,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'cash_flow',
            period: 'Q3 2025',
            lowEstimate: 13000000000,
            midEstimate: 14500000000,
            highEstimate: 16500000000,
            confidence: 0.77,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 3,
            forecastType: 'cash_flow',
            period: 'Q4 2025',
            lowEstimate: 13500000000,
            midEstimate: 15000000000,
            highEstimate: 17000000000,
            confidence: 0.76,
            methodology: getRandomMethodology(),
            forecastDate: '2025-12-31',
            createdAt: getRecentDate(),
        },

        // PROFITABILITY FORECASTS (5 total: Apple ROE and Microsoft)
        {
            companyId: 1,
            forecastType: 'profitability',
            period: 'Q1 2025',
            lowEstimate: 0.138,
            midEstimate: 0.145,
            highEstimate: 0.152,
            confidence: 0.87,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 1,
            forecastType: 'profitability',
            period: 'Q2 2025',
            lowEstimate: 0.140,
            midEstimate: 0.147,
            highEstimate: 0.155,
            confidence: 0.86,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'profitability',
            period: 'Q1 2025',
            lowEstimate: 0.162,
            midEstimate: 0.170,
            highEstimate: 0.178,
            confidence: 0.85,
            methodology: getRandomMethodology(),
            forecastDate: '2025-03-31',
            createdAt: getRecentDate(),
        },
        {
            companyId: 2,
            forecastType: 'profitability',
            period: 'Q2 2025',
            lowEstimate: 0.165,
            midEstimate: 0.173,
            highEstimate: 0.182,
            confidence: 0.84,
            methodology: getRandomMethodology(),
            forecastDate: '2025-06-30',
            createdAt: getRecentDate(),
        },
        {
            companyId: 1,
            forecastType: 'profitability',
            period: 'Q3 2025',
            lowEstimate: 0.142,
            midEstimate: 0.150,
            highEstimate: 0.158,
            confidence: 0.85,
            methodology: getRandomMethodology(),
            forecastDate: '2025-09-30',
            createdAt: getRecentDate(),
        },
    ];

    await db.insert(forecastData).values(sampleForecasts);

    console.log('✅ Forecast data seeder completed successfully');
    console.log(`   - Total forecasts created: ${sampleForecasts.length}`);
    console.log(`   - Revenue forecasts: 20`);
    console.log(`   - Risk score forecasts: 15`);
    console.log(`   - Cash flow forecasts: 10`);
    console.log(`   - Profitability forecasts: 5`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});