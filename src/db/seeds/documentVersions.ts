import { db } from '@/db';
import { documentVersions } from '@/db/schema';

async function main() {
    const sampleDocumentVersions = [
        // Document 1 (Apple 10-K) - 3 versions
        {
            documentId: 1,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            documentId: 1,
            versionNumber: 2,
            changesDetected: ["Revenue figure updated", "Performance obligation timing correction"],
            numericChanges: [
                {
                    field: "revenue",
                    section: "Q4 Revenue",
                    oldValue: 95500000000,
                    newValue: 94800000000,
                    variance: -700000000,
                    variancePercentage: -0.73
                }
            ],
            textualChanges: [
                {
                    section: "Note 2 - Revenue Recognition",
                    changeType: "modified",
                    description: "Updated revenue figures after quarterly restatement - Q4 revenue adjusted from $95.5B to $94.8B due to performance obligation timing correction"
                }
            ],
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            documentId: 1,
            versionNumber: 3,
            changesDetected: ["Related party transaction disclosure added", "Footnote correction"],
            numericChanges: [
                {
                    field: "related_party_transactions",
                    section: "Note 15 - Related Party Transactions",
                    oldValue: 0,
                    newValue: 2300000,
                    variance: 2300000,
                    variancePercentage: 100
                }
            ],
            textualChanges: [
                {
                    section: "Note 15 - Related Party Transactions",
                    changeType: "added",
                    description: "Corrected footnote disclosures for related party transactions - Added missing disclosure of $2.3M consulting fees paid to executive's firm"
                }
            ],
            createdAt: new Date('2024-02-03').toISOString(),
        },

        // Document 2 (Microsoft 10-K) - 2 versions
        {
            documentId: 2,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            documentId: 2,
            versionNumber: 2,
            changesDetected: ["Cloud revenue recognition correction", "Deferred revenue adjustment"],
            numericChanges: [
                {
                    field: "deferred_revenue",
                    section: "Balance Sheet",
                    oldValue: 45200000000,
                    newValue: 47800000000,
                    variance: 2600000000,
                    variancePercentage: 5.75
                }
            ],
            textualChanges: [
                {
                    section: "Note 1 - Significant Accounting Policies",
                    changeType: "modified",
                    description: "Revised cloud services revenue recognition methodology to align with updated ASC 606 guidance for multi-year contracts"
                }
            ],
            createdAt: new Date('2024-01-25').toISOString(),
        },

        // Document 3 (Tesla 10-Q) - 4 versions
        {
            documentId: 3,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            documentId: 3,
            versionNumber: 2,
            changesDetected: ["Inventory valuation adjustment", "Cost of goods sold correction"],
            numericChanges: [
                {
                    field: "inventory",
                    section: "Balance Sheet - Current Assets",
                    oldValue: 8900000000,
                    newValue: 8450000000,
                    variance: -450000000,
                    variancePercentage: -5.06
                },
                {
                    field: "cost_of_goods_sold",
                    section: "Income Statement",
                    oldValue: 18200000000,
                    newValue: 18650000000,
                    variance: 450000000,
                    variancePercentage: 2.47
                }
            ],
            textualChanges: [
                {
                    section: "Note 4 - Inventory",
                    changeType: "modified",
                    description: "Corrected lower-of-cost-or-market inventory valuation for aging battery components totaling $450M"
                }
            ],
            createdAt: new Date('2024-02-08').toISOString(),
        },
        {
            documentId: 3,
            versionNumber: 3,
            changesDetected: ["Warranty liability increase", "Additional footnote disclosure"],
            numericChanges: [
                {
                    field: "warranty_liability",
                    section: "Balance Sheet - Current Liabilities",
                    oldValue: 1200000000,
                    newValue: 1450000000,
                    variance: 250000000,
                    variancePercentage: 20.83
                }
            ],
            textualChanges: [
                {
                    section: "Note 9 - Commitments and Contingencies",
                    changeType: "added",
                    description: "Added disclosure of increased warranty reserves for battery replacement program covering 2021-2022 model years"
                }
            ],
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            documentId: 3,
            versionNumber: 4,
            changesDetected: ["Regulatory credit revenue reclassification"],
            numericChanges: [
                {
                    field: "automotive_revenue",
                    section: "Income Statement",
                    oldValue: 21300000000,
                    newValue: 20800000000,
                    variance: -500000000,
                    variancePercentage: -2.35
                },
                {
                    field: "regulatory_credits",
                    section: "Income Statement",
                    oldValue: 800000000,
                    newValue: 1300000000,
                    variance: 500000000,
                    variancePercentage: 62.5
                }
            ],
            textualChanges: [
                {
                    section: "Note 2 - Revenue",
                    changeType: "modified",
                    description: "Reclassified $500M of regulatory credit revenue previously included in automotive sales to separate line item per SEC guidance"
                }
            ],
            createdAt: new Date('2024-02-28').toISOString(),
        },

        // Document 8 (JPMorgan 10-K) - 3 versions
        {
            documentId: 8,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            documentId: 8,
            versionNumber: 2,
            changesDetected: ["Goodwill impairment testing methodology revised"],
            numericChanges: [
                {
                    field: "goodwill",
                    section: "Balance Sheet - Intangible Assets",
                    oldValue: 48900000000,
                    newValue: 47200000000,
                    variance: -1700000000,
                    variancePercentage: -3.48
                }
            ],
            textualChanges: [
                {
                    section: "Note 12 - Goodwill and Intangible Assets",
                    changeType: "modified",
                    description: "Revised goodwill impairment testing methodology - Updated discount rate from 8.5% to 9.2% based on current market conditions resulting in $1.7B impairment charge"
                }
            ],
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            documentId: 8,
            versionNumber: 3,
            changesDetected: ["Lease liability disclosure added", "ASC 842 compliance correction"],
            numericChanges: [
                {
                    field: "operating_lease_liability",
                    section: "Balance Sheet - Non-Current Liabilities",
                    oldValue: 0,
                    newValue: 450000000,
                    variance: 450000000,
                    variancePercentage: 100
                },
                {
                    field: "right_of_use_assets",
                    section: "Balance Sheet - Non-Current Assets",
                    oldValue: 0,
                    newValue: 450000000,
                    variance: 450000000,
                    variancePercentage: 100
                }
            ],
            textualChanges: [
                {
                    section: "Note 8 - Leases",
                    changeType: "added",
                    description: "Added missing lease liability disclosures - Recognized $450M operating lease for data center facilities not previously capitalized under ASC 842"
                }
            ],
            createdAt: new Date('2024-02-18').toISOString(),
        },

        // Document 11 (Goldman Sachs 10-K) - 2 versions
        {
            documentId: 11,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            documentId: 11,
            versionNumber: 2,
            changesDetected: ["Material restatement", "Level 3 fair value measurement adjustment", "Private equity valuation correction"],
            numericChanges: [
                {
                    field: "level_3_investments",
                    section: "Fair Value Measurements",
                    oldValue: 85600000000,
                    newValue: 85168000000,
                    variance: -432000000,
                    variancePercentage: -0.50
                },
                {
                    field: "trading_revenue",
                    section: "Income Statement",
                    oldValue: 21300000000,
                    newValue: 20868000000,
                    variance: -432000000,
                    variancePercentage: -2.03
                }
            ],
            textualChanges: [
                {
                    section: "Note 6 - Fair Value Measurements",
                    changeType: "modified",
                    description: "Material restatement: Level 3 fair value measurements adjusted - Corrected valuation methodology for private equity investments totaling $432M using updated market comparables and DCF assumptions"
                },
                {
                    section: "Management Discussion and Analysis",
                    changeType: "added",
                    description: "Added disclosure explaining impact of valuation adjustment on trading revenue and earnings per share"
                }
            ],
            createdAt: new Date('2024-02-10').toISOString(),
        },

        // Document 12 (Bank of America 10-Q) - 3 versions
        {
            documentId: 12,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            documentId: 12,
            versionNumber: 2,
            changesDetected: ["Loan loss provision adjustment", "CECL model update"],
            numericChanges: [
                {
                    field: "allowance_for_credit_losses",
                    section: "Balance Sheet",
                    oldValue: 12800000000,
                    newValue: 14200000000,
                    variance: 1400000000,
                    variancePercentage: 10.94
                },
                {
                    field: "provision_for_credit_losses",
                    section: "Income Statement",
                    oldValue: 800000000,
                    newValue: 2200000000,
                    variance: 1400000000,
                    variancePercentage: 175
                }
            ],
            textualChanges: [
                {
                    section: "Note 5 - Allowance for Credit Losses",
                    changeType: "modified",
                    description: "Updated CECL model assumptions incorporating higher unemployment forecasts and commercial real estate stress scenarios"
                }
            ],
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            documentId: 12,
            versionNumber: 3,
            changesDetected: ["Hedging relationship designation correction"],
            numericChanges: [
                {
                    field: "oci_derivative_gains",
                    section: "Other Comprehensive Income",
                    oldValue: 320000000,
                    newValue: 185000000,
                    variance: -135000000,
                    variancePercentage: -42.19
                }
            ],
            textualChanges: [
                {
                    section: "Note 14 - Derivatives and Hedging Activities",
                    changeType: "modified",
                    description: "Corrected hedge accounting designation for interest rate swaps - $135M reclassified from OCI to current period earnings due to hedge ineffectiveness"
                }
            ],
            createdAt: new Date('2024-02-20').toISOString(),
        },

        // Document 15 (Visa 10-K) - 2 versions
        {
            documentId: 15,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-08').toISOString(),
        },
        {
            documentId: 15,
            versionNumber: 2,
            changesDetected: ["Foreign exchange impact restatement", "Revenue recognition correction"],
            numericChanges: [
                {
                    field: "international_transaction_revenue",
                    section: "Revenue",
                    oldValue: 8900000000,
                    newValue: 8650000000,
                    variance: -250000000,
                    variancePercentage: -2.81
                },
                {
                    field: "fx_gain_loss",
                    section: "Other Income",
                    oldValue: 125000000,
                    newValue: -125000000,
                    variance: -250000000,
                    variancePercentage: -200
                }
            ],
            textualChanges: [
                {
                    section: "Note 1 - Revenue Recognition",
                    changeType: "modified",
                    description: "Corrected classification of foreign exchange impacts on cross-border transaction revenue - $250M reclassified from revenue to other income per ASC 830"
                }
            ],
            createdAt: new Date('2024-01-23').toISOString(),
        },

        // Document 23 (Pfizer 10-Q) - 3 versions
        {
            documentId: 23,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            documentId: 23,
            versionNumber: 2,
            changesDetected: ["R&D expense capitalization correction", "Clinical trial cost adjustment"],
            numericChanges: [
                {
                    field: "research_development_expense",
                    section: "Income Statement",
                    oldValue: 2800000000,
                    newValue: 3150000000,
                    variance: 350000000,
                    variancePercentage: 12.5
                },
                {
                    field: "intangible_assets",
                    section: "Balance Sheet",
                    oldValue: 52000000000,
                    newValue: 51650000000,
                    variance: -350000000,
                    variancePercentage: -0.67
                }
            ],
            textualChanges: [
                {
                    section: "Note 3 - Research and Development",
                    changeType: "modified",
                    description: "Corrected capitalization of Phase II clinical trial costs - $350M reclassified from intangible assets to R&D expense due to increased technical risk assessment"
                }
            ],
            createdAt: new Date('2024-02-07').toISOString(),
        },
        {
            documentId: 23,
            versionNumber: 3,
            changesDetected: ["Contingent liability disclosure added", "Product liability reserve increase"],
            numericChanges: [
                {
                    field: "product_liability_reserve",
                    section: "Current Liabilities",
                    oldValue: 890000000,
                    newValue: 1240000000,
                    variance: 350000000,
                    variancePercentage: 39.33
                }
            ],
            textualChanges: [
                {
                    section: "Note 13 - Commitments and Contingencies",
                    changeType: "added",
                    description: "Added disclosure of ongoing litigation regarding product safety - Established additional reserve of $350M for potential settlements"
                }
            ],
            createdAt: new Date('2024-02-22').toISOString(),
        },

        // Document 34 (ExxonMobil 10-K) - 4 versions
        {
            documentId: 34,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            documentId: 34,
            versionNumber: 2,
            changesDetected: ["Asset retirement obligation recalculation"],
            numericChanges: [
                {
                    field: "asset_retirement_obligation",
                    section: "Non-Current Liabilities",
                    oldValue: 18500000000,
                    newValue: 21200000000,
                    variance: 2700000000,
                    variancePercentage: 14.59
                }
            ],
            textualChanges: [
                {
                    section: "Note 11 - Asset Retirement Obligations",
                    changeType: "modified",
                    description: "Updated ARO estimates using revised decommissioning cost assumptions and extended field life projections for Gulf of Mexico assets"
                }
            ],
            createdAt: new Date('2024-01-30').toISOString(),
        },
        {
            documentId: 34,
            versionNumber: 3,
            changesDetected: ["Proved reserves revision", "Depreciation methodology update"],
            numericChanges: [
                {
                    field: "proved_reserves_mboe",
                    section: "Supplemental Oil and Gas Information",
                    oldValue: 17800000000,
                    newValue: 17200000000,
                    variance: -600000000,
                    variancePercentage: -3.37
                }
            ],
            textualChanges: [
                {
                    section: "Note 22 - Supplemental Oil and Gas Information",
                    changeType: "modified",
                    description: "Revised proved reserves downward by 600M BOE due to updated reservoir modeling and economic assumptions at Permian Basin operations"
                }
            ],
            createdAt: new Date('2024-02-14').toISOString(),
        },
        {
            documentId: 34,
            versionNumber: 4,
            changesDetected: ["Environmental liability addition", "Climate-related disclosure expansion"],
            numericChanges: [
                {
                    field: "environmental_remediation_liability",
                    section: "Current and Non-Current Liabilities",
                    oldValue: 2300000000,
                    newValue: 2850000000,
                    variance: 550000000,
                    variancePercentage: 23.91
                }
            ],
            textualChanges: [
                {
                    section: "Note 10 - Environmental Matters",
                    changeType: "added",
                    description: "Added disclosure of increased environmental remediation costs for legacy refinery sites - $550M additional liability recognized for groundwater contamination cleanup"
                }
            ],
            createdAt: new Date('2024-03-01').toISOString(),
        },

        // Document 45 (Boeing 10-Q) - 3 versions
        {
            documentId: 45,
            versionNumber: 1,
            changesDetected: ["Initial filing"],
            numericChanges: [],
            textualChanges: [],
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            documentId: 45,
            versionNumber: 2,
            changesDetected: ["Contract loss provision increase", "787 program accounting adjustment"],
            numericChanges: [
                {
                    field: "contract_loss_provision",
                    section: "Current Liabilities",
                    oldValue: 3200000000,
                    newValue: 4500000000,
                    variance: 1300000000,
                    variancePercentage: 40.63
                },
                {
                    field: "gross_profit",
                    section: "Income Statement",
                    oldValue: 1850000000,
                    newValue: 550000000,
                    variance: -1300000000,
                    variancePercentage: -70.27
                }
            ],
            textualChanges: [
                {
                    section: "Note 2 - Revenue Recognition",
                    changeType: "modified",
                    description: "Increased forward loss provision for 787 program by $1.3B due to higher-than-expected production costs and delivery delays"
                }
            ],
            createdAt: new Date('2024-02-19').toISOString(),
        },
        {
            documentId: 45,
            versionNumber: 3,
            changesDetected: ["Pension liability remeasurement", "Actuarial assumption updates"],
            numericChanges: [
                {
                    field: "pension_liability",
                    section: "Non-Current Liabilities",
                    oldValue: 18900000000,
                    newValue: 17200000000,
                    variance: -1700000000,
                    variancePercentage: -8.99
                },
                {
                    field: "oci_pension_adjustment",
                    section: "Other Comprehensive Income",
                    oldValue: -2400000000,
                    newValue: -700000000,
                    variance: 1700000000,
                    variancePercentage: 70.83
                }
            ],
            textualChanges: [
                {
                    section: "Note 18 - Postretirement Plans",
                    changeType: "modified",
                    description: "Updated pension liability using revised discount rate (5.25% to 5.75%) and mortality assumptions, resulting in $1.7B reduction in projected benefit obligation"
                }
            ],
            createdAt: new Date('2024-03-05').toISOString(),
        },
    ];

    await db.insert(documentVersions).values(sampleDocumentVersions);
    
    console.log('✅ Document versions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});