import { db } from '@/db';
import { knowledgeGraphEntities } from '@/db/schema';

async function main() {
    const sampleEntities = [
        // Company Entities (12)
        {
            entityId: 'company_apple_001',
            entityType: 'company',
            name: 'Apple Inc.',
            properties: JSON.stringify({
                industry: 'Technology',
                tickerSymbol: 'AAPL',
                country: 'United States',
                marketCap: '2800000000000'
            }),
            createdAt: new Date('2024-12-05').toISOString(),
            updatedAt: new Date('2024-12-05').toISOString(),
        },
        {
            entityId: 'company_microsoft_002',
            entityType: 'company',
            name: 'Microsoft Corporation',
            properties: JSON.stringify({
                industry: 'Technology',
                tickerSymbol: 'MSFT',
                country: 'United States',
                marketCap: '2750000000000'
            }),
            createdAt: new Date('2024-12-06').toISOString(),
            updatedAt: new Date('2024-12-06').toISOString(),
        },
        {
            entityId: 'company_jpmorgan_003',
            entityType: 'company',
            name: 'JPMorgan Chase & Co.',
            properties: JSON.stringify({
                industry: 'Financial Services',
                tickerSymbol: 'JPM',
                country: 'United States',
                marketCap: '485000000000'
            }),
            createdAt: new Date('2024-12-07').toISOString(),
            updatedAt: new Date('2024-12-07').toISOString(),
        },
        {
            entityId: 'company_goldman_004',
            entityType: 'company',
            name: 'Goldman Sachs Group Inc.',
            properties: JSON.stringify({
                industry: 'Financial Services',
                tickerSymbol: 'GS',
                country: 'United States',
                marketCap: '115000000000'
            }),
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        },
        {
            entityId: 'company_tesla_005',
            entityType: 'company',
            name: 'Tesla Inc.',
            properties: JSON.stringify({
                industry: 'Automotive',
                tickerSymbol: 'TSLA',
                country: 'United States',
                marketCap: '780000000000'
            }),
            createdAt: new Date('2024-12-09').toISOString(),
            updatedAt: new Date('2024-12-09').toISOString(),
        },
        {
            entityId: 'company_jnj_006',
            entityType: 'company',
            name: 'Johnson & Johnson',
            properties: JSON.stringify({
                industry: 'Healthcare',
                tickerSymbol: 'JNJ',
                country: 'United States',
                marketCap: '385000000000'
            }),
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
        {
            entityId: 'company_exxon_007',
            entityType: 'company',
            name: 'ExxonMobil Corporation',
            properties: JSON.stringify({
                industry: 'Energy',
                tickerSymbol: 'XOM',
                country: 'United States',
                marketCap: '415000000000'
            }),
            createdAt: new Date('2024-12-11').toISOString(),
            updatedAt: new Date('2024-12-11').toISOString(),
        },
        {
            entityId: 'company_walmart_008',
            entityType: 'company',
            name: 'Walmart Inc.',
            properties: JSON.stringify({
                industry: 'Retail',
                tickerSymbol: 'WMT',
                country: 'United States',
                marketCap: '445000000000'
            }),
            createdAt: new Date('2024-12-12').toISOString(),
            updatedAt: new Date('2024-12-12').toISOString(),
        },
        {
            entityId: 'company_amazon_009',
            entityType: 'company',
            name: 'Amazon.com Inc.',
            properties: JSON.stringify({
                industry: 'Technology',
                tickerSymbol: 'AMZN',
                country: 'United States',
                marketCap: '1650000000000'
            }),
            createdAt: new Date('2024-12-13').toISOString(),
            updatedAt: new Date('2024-12-13').toISOString(),
        },
        {
            entityId: 'company_meta_010',
            entityType: 'company',
            name: 'Meta Platforms Inc.',
            properties: JSON.stringify({
                industry: 'Technology',
                tickerSymbol: 'META',
                country: 'United States',
                marketCap: '875000000000'
            }),
            createdAt: new Date('2024-12-14').toISOString(),
            updatedAt: new Date('2024-12-14').toISOString(),
        },
        {
            entityId: 'company_siemens_011',
            entityType: 'company',
            name: 'Siemens AG',
            properties: JSON.stringify({
                industry: 'Industrial',
                tickerSymbol: 'SIEGY',
                country: 'Germany',
                marketCap: '125000000000'
            }),
            createdAt: new Date('2024-12-15').toISOString(),
            updatedAt: new Date('2024-12-15').toISOString(),
        },
        {
            entityId: 'company_toyota_012',
            entityType: 'company',
            name: 'Toyota Motor Corporation',
            properties: JSON.stringify({
                industry: 'Automotive',
                tickerSymbol: 'TM',
                country: 'Japan',
                marketCap: '285000000000'
            }),
            createdAt: new Date('2024-12-16').toISOString(),
            updatedAt: new Date('2024-12-16').toISOString(),
        },

        // Person Entities (20)
        {
            entityId: 'person_tim_cook_ceo',
            entityType: 'person',
            name: 'Tim Cook',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Apple Inc.',
                department: 'Executive',
                email: 'tim.cook@apple.com'
            }),
            createdAt: new Date('2024-12-05').toISOString(),
            updatedAt: new Date('2024-12-05').toISOString(),
        },
        {
            entityId: 'person_luca_maestri_cfo',
            entityType: 'person',
            name: 'Luca Maestri',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Apple Inc.',
                department: 'Finance',
                email: 'luca.maestri@apple.com'
            }),
            createdAt: new Date('2024-12-05').toISOString(),
            updatedAt: new Date('2024-12-05').toISOString(),
        },
        {
            entityId: 'person_satya_nadella_ceo',
            entityType: 'person',
            name: 'Satya Nadella',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Microsoft Corporation',
                department: 'Executive',
                email: 'satya.nadella@microsoft.com'
            }),
            createdAt: new Date('2024-12-06').toISOString(),
            updatedAt: new Date('2024-12-06').toISOString(),
        },
        {
            entityId: 'person_amy_hood_cfo',
            entityType: 'person',
            name: 'Amy Hood',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Microsoft Corporation',
                department: 'Finance',
                email: 'amy.hood@microsoft.com'
            }),
            createdAt: new Date('2024-12-06').toISOString(),
            updatedAt: new Date('2024-12-06').toISOString(),
        },
        {
            entityId: 'person_jamie_dimon_ceo',
            entityType: 'person',
            name: 'Jamie Dimon',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'JPMorgan Chase & Co.',
                department: 'Executive',
                email: 'jamie.dimon@jpmorgan.com'
            }),
            createdAt: new Date('2024-12-07').toISOString(),
            updatedAt: new Date('2024-12-07').toISOString(),
        },
        {
            entityId: 'person_jeremy_barnum_cfo',
            entityType: 'person',
            name: 'Jeremy Barnum',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'JPMorgan Chase & Co.',
                department: 'Finance',
                email: 'jeremy.barnum@jpmorgan.com'
            }),
            createdAt: new Date('2024-12-07').toISOString(),
            updatedAt: new Date('2024-12-07').toISOString(),
        },
        {
            entityId: 'person_david_solomon_ceo',
            entityType: 'person',
            name: 'David Solomon',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Goldman Sachs Group Inc.',
                department: 'Executive',
                email: 'david.solomon@gs.com'
            }),
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        },
        {
            entityId: 'person_denis_coleman_cfo',
            entityType: 'person',
            name: 'Denis Coleman',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Goldman Sachs Group Inc.',
                department: 'Finance',
                email: 'denis.coleman@gs.com'
            }),
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        },
        {
            entityId: 'person_elon_musk_ceo',
            entityType: 'person',
            name: 'Elon Musk',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Tesla Inc.',
                department: 'Executive',
                email: 'elon.musk@tesla.com'
            }),
            createdAt: new Date('2024-12-09').toISOString(),
            updatedAt: new Date('2024-12-09').toISOString(),
        },
        {
            entityId: 'person_zachary_kirkhorn_cfo',
            entityType: 'person',
            name: 'Zachary Kirkhorn',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Tesla Inc.',
                department: 'Finance',
                email: 'zachary.kirkhorn@tesla.com'
            }),
            createdAt: new Date('2024-12-09').toISOString(),
            updatedAt: new Date('2024-12-09').toISOString(),
        },
        {
            entityId: 'person_joaquin_duato_ceo',
            entityType: 'person',
            name: 'Joaquin Duato',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Johnson & Johnson',
                department: 'Executive',
                email: 'joaquin.duato@jnj.com'
            }),
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
        {
            entityId: 'person_joseph_wolk_cfo',
            entityType: 'person',
            name: 'Joseph Wolk',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Johnson & Johnson',
                department: 'Finance',
                email: 'joseph.wolk@jnj.com'
            }),
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
        {
            entityId: 'person_darren_woods_ceo',
            entityType: 'person',
            name: 'Darren Woods',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'ExxonMobil Corporation',
                department: 'Executive',
                email: 'darren.woods@exxonmobil.com'
            }),
            createdAt: new Date('2024-12-11').toISOString(),
            updatedAt: new Date('2024-12-11').toISOString(),
        },
        {
            entityId: 'person_kathryn_mikells_cfo',
            entityType: 'person',
            name: 'Kathryn Mikells',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'ExxonMobil Corporation',
                department: 'Finance',
                email: 'kathryn.mikells@exxonmobil.com'
            }),
            createdAt: new Date('2024-12-11').toISOString(),
            updatedAt: new Date('2024-12-11').toISOString(),
        },
        {
            entityId: 'person_doug_mcmillon_ceo',
            entityType: 'person',
            name: 'Doug McMillon',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Walmart Inc.',
                department: 'Executive',
                email: 'doug.mcmillon@walmart.com'
            }),
            createdAt: new Date('2024-12-12').toISOString(),
            updatedAt: new Date('2024-12-12').toISOString(),
        },
        {
            entityId: 'person_john_rainey_cfo',
            entityType: 'person',
            name: 'John Rainey',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Walmart Inc.',
                department: 'Finance',
                email: 'john.rainey@walmart.com'
            }),
            createdAt: new Date('2024-12-12').toISOString(),
            updatedAt: new Date('2024-12-12').toISOString(),
        },
        {
            entityId: 'person_andy_jassy_ceo',
            entityType: 'person',
            name: 'Andy Jassy',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Amazon.com Inc.',
                department: 'Executive',
                email: 'andy.jassy@amazon.com'
            }),
            createdAt: new Date('2024-12-13').toISOString(),
            updatedAt: new Date('2024-12-13').toISOString(),
        },
        {
            entityId: 'person_brian_olsavsky_cfo',
            entityType: 'person',
            name: 'Brian Olsavsky',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Amazon.com Inc.',
                department: 'Finance',
                email: 'brian.olsavsky@amazon.com'
            }),
            createdAt: new Date('2024-12-13').toISOString(),
            updatedAt: new Date('2024-12-13').toISOString(),
        },
        {
            entityId: 'person_mark_zuckerberg_ceo',
            entityType: 'person',
            name: 'Mark Zuckerberg',
            properties: JSON.stringify({
                role: 'Chief Executive Officer',
                company: 'Meta Platforms Inc.',
                department: 'Executive',
                email: 'mark.zuckerberg@meta.com'
            }),
            createdAt: new Date('2024-12-14').toISOString(),
            updatedAt: new Date('2024-12-14').toISOString(),
        },
        {
            entityId: 'person_susan_li_cfo',
            entityType: 'person',
            name: 'Susan Li',
            properties: JSON.stringify({
                role: 'Chief Financial Officer',
                company: 'Meta Platforms Inc.',
                department: 'Finance',
                email: 'susan.li@meta.com'
            }),
            createdAt: new Date('2024-12-14').toISOString(),
            updatedAt: new Date('2024-12-14').toISOString(),
        },

        // Account Entities (25)
        {
            entityId: 'account_revenue_001',
            entityType: 'account',
            name: 'Product Sales Revenue',
            properties: JSON.stringify({
                accountNumber: '4000-001',
                category: 'Revenue',
                balance: '125000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-20').toISOString(),
        },
        {
            entityId: 'account_revenue_002',
            entityType: 'account',
            name: 'Service Revenue',
            properties: JSON.stringify({
                accountNumber: '4000-002',
                category: 'Revenue',
                balance: '85000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-20').toISOString(),
        },
        {
            entityId: 'account_revenue_003',
            entityType: 'account',
            name: 'Subscription Revenue',
            properties: JSON.stringify({
                accountNumber: '4000-003',
                category: 'Revenue',
                balance: '45000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-21').toISOString(),
        },
        {
            entityId: 'account_revenue_004',
            entityType: 'account',
            name: 'Licensing Revenue',
            properties: JSON.stringify({
                accountNumber: '4000-004',
                category: 'Revenue',
                balance: '32000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-21').toISOString(),
        },
        {
            entityId: 'account_revenue_005',
            entityType: 'account',
            name: 'Interest Income',
            properties: JSON.stringify({
                accountNumber: '4000-005',
                category: 'Revenue',
                balance: '12500000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-22').toISOString(),
        },
        {
            entityId: 'account_asset_001',
            entityType: 'account',
            name: 'Cash and Cash Equivalents',
            properties: JSON.stringify({
                accountNumber: '1000-001',
                category: 'Current Assets',
                balance: '185000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-22').toISOString(),
        },
        {
            entityId: 'account_asset_002',
            entityType: 'account',
            name: 'Accounts Receivable',
            properties: JSON.stringify({
                accountNumber: '1000-002',
                category: 'Current Assets',
                balance: '95000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-23').toISOString(),
        },
        {
            entityId: 'account_asset_003',
            entityType: 'account',
            name: 'Inventory',
            properties: JSON.stringify({
                accountNumber: '1000-003',
                category: 'Current Assets',
                balance: '65000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-23').toISOString(),
        },
        {
            entityId: 'account_asset_004',
            entityType: 'account',
            name: 'Prepaid Expenses',
            properties: JSON.stringify({
                accountNumber: '1000-004',
                category: 'Current Assets',
                balance: '15000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-24').toISOString(),
        },
        {
            entityId: 'account_asset_005',
            entityType: 'account',
            name: 'Property, Plant and Equipment',
            properties: JSON.stringify({
                accountNumber: '1500-001',
                category: 'Fixed Assets',
                balance: '425000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-24').toISOString(),
        },
        {
            entityId: 'account_asset_006',
            entityType: 'account',
            name: 'Intangible Assets',
            properties: JSON.stringify({
                accountNumber: '1500-002',
                category: 'Fixed Assets',
                balance: '285000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-25').toISOString(),
        },
        {
            entityId: 'account_asset_007',
            entityType: 'account',
            name: 'Goodwill',
            properties: JSON.stringify({
                accountNumber: '1500-003',
                category: 'Fixed Assets',
                balance: '195000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-25').toISOString(),
        },
        {
            entityId: 'account_asset_008',
            entityType: 'account',
            name: 'Long-term Investments',
            properties: JSON.stringify({
                accountNumber: '1500-004',
                category: 'Fixed Assets',
                balance: '325000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-26').toISOString(),
        },
        {
            entityId: 'account_liability_001',
            entityType: 'account',
            name: 'Accounts Payable',
            properties: JSON.stringify({
                accountNumber: '2000-001',
                category: 'Current Liabilities',
                balance: '75000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-26').toISOString(),
        },
        {
            entityId: 'account_liability_002',
            entityType: 'account',
            name: 'Short-term Debt',
            properties: JSON.stringify({
                accountNumber: '2000-002',
                category: 'Current Liabilities',
                balance: '125000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-27').toISOString(),
        },
        {
            entityId: 'account_liability_003',
            entityType: 'account',
            name: 'Accrued Expenses',
            properties: JSON.stringify({
                accountNumber: '2000-003',
                category: 'Current Liabilities',
                balance: '45000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-27').toISOString(),
        },
        {
            entityId: 'account_liability_004',
            entityType: 'account',
            name: 'Deferred Revenue',
            properties: JSON.stringify({
                accountNumber: '2000-004',
                category: 'Current Liabilities',
                balance: '35000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-28').toISOString(),
        },
        {
            entityId: 'account_liability_005',
            entityType: 'account',
            name: 'Long-term Debt',
            properties: JSON.stringify({
                accountNumber: '2500-001',
                category: 'Long-term Liabilities',
                balance: '385000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-28').toISOString(),
        },
        {
            entityId: 'account_liability_006',
            entityType: 'account',
            name: 'Pension Obligations',
            properties: JSON.stringify({
                accountNumber: '2500-002',
                category: 'Long-term Liabilities',
                balance: '155000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-29').toISOString(),
        },
        {
            entityId: 'account_liability_007',
            entityType: 'account',
            name: 'Deferred Tax Liabilities',
            properties: JSON.stringify({
                accountNumber: '2500-003',
                category: 'Long-term Liabilities',
                balance: '95000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-29').toISOString(),
        },
        {
            entityId: 'account_equity_001',
            entityType: 'account',
            name: 'Common Stock',
            properties: JSON.stringify({
                accountNumber: '3000-001',
                category: 'Equity',
                balance: '125000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-30').toISOString(),
        },
        {
            entityId: 'account_equity_002',
            entityType: 'account',
            name: 'Additional Paid-in Capital',
            properties: JSON.stringify({
                accountNumber: '3000-002',
                category: 'Equity',
                balance: '385000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-30').toISOString(),
        },
        {
            entityId: 'account_equity_003',
            entityType: 'account',
            name: 'Retained Earnings',
            properties: JSON.stringify({
                accountNumber: '3000-003',
                category: 'Equity',
                balance: '685000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-31').toISOString(),
        },
        {
            entityId: 'account_equity_004',
            entityType: 'account',
            name: 'Treasury Stock',
            properties: JSON.stringify({
                accountNumber: '3000-004',
                category: 'Equity',
                balance: '-125000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-31').toISOString(),
        },
        {
            entityId: 'account_equity_005',
            entityType: 'account',
            name: 'Accumulated Other Comprehensive Income',
            properties: JSON.stringify({
                accountNumber: '3000-005',
                category: 'Equity',
                balance: '45000000.00',
                currency: 'USD'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2025-01-01').toISOString(),
        },

        // Transaction Entities (15)
        {
            entityId: 'transaction_acquisition_001',
            entityType: 'transaction',
            name: 'Subsidiary Acquisition - WhatsApp',
            properties: JSON.stringify({
                amount: '19000000000.00',
                date: '2024-11-15',
                parties: ['Meta Platforms Inc.', 'WhatsApp Inc.'],
                type: 'acquisition'
            }),
            createdAt: new Date('2024-11-15').toISOString(),
            updatedAt: new Date('2024-11-15').toISOString(),
        },
        {
            entityId: 'transaction_bond_002',
            entityType: 'transaction',
            name: 'Corporate Bond Issuance',
            properties: JSON.stringify({
                amount: '5000000000.00',
                date: '2024-12-01',
                parties: ['Apple Inc.', 'Bond Market Investors'],
                type: 'debt_issuance'
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-01').toISOString(),
        },
        {
            entityId: 'transaction_dividend_003',
            entityType: 'transaction',
            name: 'Quarterly Dividend Payment',
            properties: JSON.stringify({
                amount: '3500000000.00',
                date: '2024-12-15',
                parties: ['Microsoft Corporation', 'Shareholders'],
                type: 'dividend'
            }),
            createdAt: new Date('2024-12-15').toISOString(),
            updatedAt: new Date('2024-12-15').toISOString(),
        },
        {
            entityId: 'transaction_merger_004',
            entityType: 'transaction',
            name: 'Strategic Merger - LinkedIn',
            properties: JSON.stringify({
                amount: '26200000000.00',
                date: '2024-11-20',
                parties: ['Microsoft Corporation', 'LinkedIn Corporation'],
                type: 'merger'
            }),
            createdAt: new Date('2024-11-20').toISOString(),
            updatedAt: new Date('2024-11-20').toISOString(),
        },
        {
            entityId: 'transaction_loan_005',
            entityType: 'transaction',
            name: 'Corporate Loan Agreement',
            properties: JSON.stringify({
                amount: '8500000000.00',
                date: '2024-12-05',
                parties: ['Tesla Inc.', 'JPMorgan Chase & Co.'],
                type: 'loan'
            }),
            createdAt: new Date('2024-12-05').toISOString(),
            updatedAt: new Date('2024-12-05').toISOString(),
        },
        {
            entityId: 'transaction_investment_006',
            entityType: 'transaction',
            name: 'Strategic Investment - AI Startup',
            properties: JSON.stringify({
                amount: '1200000000.00',
                date: '2024-12-10',
                parties: ['Goldman Sachs Group Inc.', 'TechAI Ventures'],
                type: 'investment'
            }),
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
        {
            entityId: 'transaction_divestiture_007',
            entityType: 'transaction',
            name: 'Business Unit Divestiture',
            properties: JSON.stringify({
                amount: '4500000000.00',
                date: '2024-11-25',
                parties: ['Johnson & Johnson', 'Private Equity Group'],
                type: 'divestiture'
            }),
            createdAt: new Date('2024-11-25').toISOString(),
            updatedAt: new Date('2024-11-25').toISOString(),
        },
        {
            entityId: 'transaction_buyback_008',
            entityType: 'transaction',
            name: 'Share Buyback Program',
            properties: JSON.stringify({
                amount: '15000000000.00',
                date: '2024-12-20',
                parties: ['Apple Inc.', 'Public Markets'],
                type: 'share_buyback'
            }),
            createdAt: new Date('2024-12-20').toISOString(),
            updatedAt: new Date('2024-12-20').toISOString(),
        },
        {
            entityId: 'transaction_capex_009',
            entityType: 'transaction',
            name: 'Capital Expenditure - New Facility',
            properties: JSON.stringify({
                amount: '2800000000.00',
                date: '2024-12-08',
                parties: ['Toyota Motor Corporation', 'Construction Contractors'],
                type: 'capital_expenditure'
            }),
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        },
        {
            entityId: 'transaction_settlement_010',
            entityType: 'transaction',
            name: 'Legal Settlement Payment',
            properties: JSON.stringify({
                amount: '875000000.00',
                date: '2024-12-12',
                parties: ['ExxonMobil Corporation', 'Regulatory Authority'],
                type: 'settlement'
            }),
            createdAt: new Date('2024-12-12').toISOString(),
            updatedAt: new Date('2024-12-12').toISOString(),
        },
        {
            entityId: 'transaction_ipo_011',
            entityType: 'transaction',
            name: 'Initial Public Offering',
            properties: JSON.stringify({
                amount: '6500000000.00',
                date: '2024-11-30',
                parties: ['Tech Startup Inc.', 'Public Markets'],
                type: 'ipo'
            }),
            createdAt: new Date('2024-11-30').toISOString(),
            updatedAt: new Date('2024-11-30').toISOString(),
        },
        {
            entityId: 'transaction_refinance_012',
            entityType: 'transaction',
            name: 'Debt Refinancing',
            properties: JSON.stringify({
                amount: '12500000000.00',
                date: '2024-12-18',
                parties: ['Amazon.com Inc.', 'Syndicated Lenders'],
                type: 'refinancing'
            }),
            createdAt: new Date('2024-12-18').toISOString(),
            updatedAt: new Date('2024-12-18').toISOString(),
        },
        {
            entityId: 'transaction_jv_013',
            entityType: 'transaction',
            name: 'Joint Venture Formation',
            properties: JSON.stringify({
                amount: '3200000000.00',
                date: '2024-12-22',
                parties: ['Walmart Inc.', 'Global Retail Partners'],
                type: 'joint_venture'
            }),
            createdAt: new Date('2024-12-22').toISOString(),
            updatedAt: new Date('2024-12-22').toISOString(),
        },
        {
            entityId: 'transaction_licensing_014',
            entityType: 'transaction',
            name: 'Technology Licensing Agreement',
            properties: JSON.stringify({
                amount: '2100000000.00',
                date: '2024-12-25',
                parties: ['Siemens AG', 'Manufacturing Consortium'],
                type: 'licensing'
            }),
            createdAt: new Date('2024-12-25').toISOString(),
            updatedAt: new Date('2024-12-25').toISOString(),
        },
        {
            entityId: 'transaction_asset_sale_015',
            entityType: 'transaction',
            name: 'Real Estate Asset Sale',
            properties: JSON.stringify({
                amount: '1850000000.00',
                date: '2024-12-28',
                parties: ['Meta Platforms Inc.', 'Real Estate Investment Trust'],
                type: 'asset_sale'
            }),
            createdAt: new Date('2024-12-28').toISOString(),
            updatedAt: new Date('2024-12-28').toISOString(),
        },

        // Subsidiary Entities (8)
        {
            entityId: 'subsidiary_whatsapp_001',
            entityType: 'subsidiary',
            name: 'WhatsApp Inc.',
            properties: JSON.stringify({
                parentCompany: 'Meta Platforms Inc.',
                industry: 'Technology',
                foundedYear: 2009
            }),
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-01').toISOString(),
        },
        {
            entityId: 'subsidiary_instagram_002',
            entityType: 'subsidiary',
            name: 'Instagram LLC',
            properties: JSON.stringify({
                parentCompany: 'Meta Platforms Inc.',
                industry: 'Technology',
                foundedYear: 2010
            }),
            createdAt: new Date('2024-12-02').toISOString(),
            updatedAt: new Date('2024-12-02').toISOString(),
        },
        {
            entityId: 'subsidiary_linkedin_003',
            entityType: 'subsidiary',
            name: 'LinkedIn Corporation',
            properties: JSON.stringify({
                parentCompany: 'Microsoft Corporation',
                industry: 'Technology',
                foundedYear: 2002
            }),
            createdAt: new Date('2024-12-03').toISOString(),
            updatedAt: new Date('2024-12-03').toISOString(),
        },
        {
            entityId: 'subsidiary_apple_services_004',
            entityType: 'subsidiary',
            name: 'Apple Services Division',
            properties: JSON.stringify({
                parentCompany: 'Apple Inc.',
                industry: 'Technology',
                foundedYear: 2015
            }),
            createdAt: new Date('2024-12-04').toISOString(),
            updatedAt: new Date('2024-12-04').toISOString(),
        },
        {
            entityId: 'subsidiary_aws_005',
            entityType: 'subsidiary',
            name: 'Amazon Web Services',
            properties: JSON.stringify({
                parentCompany: 'Amazon.com Inc.',
                industry: 'Technology',
                foundedYear: 2006
            }),
            createdAt: new Date('2024-12-05').toISOString(),
            updatedAt: new Date('2024-12-05').toISOString(),
        },
        {
            entityId: 'subsidiary_azure_006',
            entityType: 'subsidiary',
            name: 'Microsoft Azure',
            properties: JSON.stringify({
                parentCompany: 'Microsoft Corporation',
                industry: 'Technology',
                foundedYear: 2010
            }),
            createdAt: new Date('2024-12-06').toISOString(),
            updatedAt: new Date('2024-12-06').toISOString(),
        },
        {
            entityId: 'subsidiary_tesla_energy_007',
            entityType: 'subsidiary',
            name: 'Tesla Energy',
            properties: JSON.stringify({
                parentCompany: 'Tesla Inc.',
                industry: 'Energy',
                foundedYear: 2015
            }),
            createdAt: new Date('2024-12-07').toISOString(),
            updatedAt: new Date('2024-12-07').toISOString(),
        },
        {
            entityId: 'subsidiary_janssen_008',
            entityType: 'subsidiary',
            name: 'Janssen Pharmaceuticals',
            properties: JSON.stringify({
                parentCompany: 'Johnson & Johnson',
                industry: 'Healthcare',
                foundedYear: 1953
            }),
            createdAt: new Date('2024-12-08').toISOString(),
            updatedAt: new Date('2024-12-08').toISOString(),
        }
    ];

    await db.insert(knowledgeGraphEntities).values(sampleEntities);
    
    console.log('✅ Knowledge Graph Entities seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});