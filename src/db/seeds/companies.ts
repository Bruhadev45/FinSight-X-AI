import { db } from '@/db';
import { companies } from '@/db/schema';

async function main() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const getRandomDateWithinLastSevenDays = () => {
        const randomTime = sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime());
        return new Date(randomTime).toISOString();
    };

    const sampleCompanies = [
        {
            name: 'Apple Inc.',
            industry: 'Technology',
            tickerSymbol: 'AAPL',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 45,
            avgRiskScore: 0.25,
        },
        {
            name: 'Microsoft Corp.',
            industry: 'Technology',
            tickerSymbol: 'MSFT',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 38,
            avgRiskScore: 0.22,
        },
        {
            name: 'JPMorgan Chase',
            industry: 'Finance',
            tickerSymbol: 'JPM',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 52,
            avgRiskScore: 0.45,
        },
        {
            name: 'Goldman Sachs',
            industry: 'Finance',
            tickerSymbol: 'GS',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 41,
            avgRiskScore: 0.48,
        },
        {
            name: 'Tesla Inc.',
            industry: 'Automotive',
            tickerSymbol: 'TSLA',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 33,
            avgRiskScore: 0.65,
        },
        {
            name: 'Johnson & Johnson',
            industry: 'Healthcare',
            tickerSymbol: 'JNJ',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 36,
            avgRiskScore: 0.28,
        },
        {
            name: 'ExxonMobil',
            industry: 'Energy',
            tickerSymbol: 'XOM',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 29,
            avgRiskScore: 0.55,
        },
        {
            name: 'Walmart',
            industry: 'Retail',
            tickerSymbol: 'WMT',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 44,
            avgRiskScore: 0.32,
        },
        {
            name: 'Amazon',
            industry: 'Technology',
            tickerSymbol: 'AMZN',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 50,
            avgRiskScore: 0.35,
        },
        {
            name: 'Meta Platforms',
            industry: 'Technology',
            tickerSymbol: 'META',
            country: 'USA',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 31,
            avgRiskScore: 0.42,
        },
        {
            name: 'Siemens AG',
            industry: 'Manufacturing',
            tickerSymbol: 'SIE',
            country: 'Germany',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 27,
            avgRiskScore: 0.38,
        },
        {
            name: 'Toyota Motor',
            industry: 'Automotive',
            tickerSymbol: 'TM',
            country: 'Japan',
            lastAnalyzed: getRandomDateWithinLastSevenDays(),
            totalDocuments: 34,
            avgRiskScore: 0.30,
        },
    ];

    await db.insert(companies).values(sampleCompanies);
    
    console.log('✅ Companies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});