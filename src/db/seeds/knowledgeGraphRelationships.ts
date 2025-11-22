import { db } from '@/db';
import { knowledgeGraphRelationships } from '@/db/schema';

async function main() {
    const now = new Date();
    const getRecentDate = (daysAgo: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const sampleRelationships = [
        // OWNS relationships (15)
        {
            relationshipId: 'rel_owns_001',
            sourceEntityId: 'company_apple_001',
            targetEntityId: 'subsidiary_apple_services_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2015-01-01', ownershipPercentage: 100 }),
            createdAt: getRecentDate(28)
        },
        {
            relationshipId: 'rel_owns_002',
            sourceEntityId: 'company_meta_001',
            targetEntityId: 'subsidiary_whatsapp_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2014-02-19', acquisitionValue: 19000000000 }),
            createdAt: getRecentDate(27)
        },
        {
            relationshipId: 'rel_owns_003',
            sourceEntityId: 'company_meta_001',
            targetEntityId: 'subsidiary_instagram_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2012-04-09', acquisitionValue: 1000000000 }),
            createdAt: getRecentDate(26)
        },
        {
            relationshipId: 'rel_owns_004',
            sourceEntityId: 'company_microsoft_001',
            targetEntityId: 'subsidiary_linkedin_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2016-12-08', acquisitionValue: 26200000000 }),
            createdAt: getRecentDate(25)
        },
        {
            relationshipId: 'rel_owns_005',
            sourceEntityId: 'company_amazon_001',
            targetEntityId: 'subsidiary_aws_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2006-03-14', ownershipPercentage: 100 }),
            createdAt: getRecentDate(24)
        },
        {
            relationshipId: 'rel_owns_006',
            sourceEntityId: 'company_tesla_001',
            targetEntityId: 'subsidiary_tesla_energy_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2016-11-21', ownershipPercentage: 100 }),
            createdAt: getRecentDate(23)
        },
        {
            relationshipId: 'rel_owns_007',
            sourceEntityId: 'company_alphabet_001',
            targetEntityId: 'subsidiary_google_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2015-10-02', ownershipPercentage: 100 }),
            createdAt: getRecentDate(22)
        },
        {
            relationshipId: 'rel_owns_008',
            sourceEntityId: 'company_alphabet_001',
            targetEntityId: 'subsidiary_waymo_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2016-12-13', ownershipPercentage: 100 }),
            createdAt: getRecentDate(21)
        },
        {
            relationshipId: 'rel_owns_009',
            sourceEntityId: 'company_berkshire_001',
            targetEntityId: 'subsidiary_geico_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '1996-01-02', ownershipPercentage: 100 }),
            createdAt: getRecentDate(20)
        },
        {
            relationshipId: 'rel_owns_010',
            sourceEntityId: 'company_jpmorgan_001',
            targetEntityId: 'subsidiary_chase_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '2000-12-31', ownershipPercentage: 100 }),
            createdAt: getRecentDate(19)
        },
        {
            relationshipId: 'rel_owns_011',
            sourceEntityId: 'company_toyota_001',
            targetEntityId: 'subsidiary_lexus_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '1989-01-01', ownershipPercentage: 100 }),
            createdAt: getRecentDate(18)
        },
        {
            relationshipId: 'rel_owns_012',
            sourceEntityId: 'company_walmart_001',
            targetEntityId: 'subsidiary_samsclub_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '1983-04-07', ownershipPercentage: 100 }),
            createdAt: getRecentDate(17)
        },
        {
            relationshipId: 'rel_owns_013',
            sourceEntityId: 'company_nestle_001',
            targetEntityId: 'subsidiary_nespresso_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 1.0, since: '1986-01-01', ownershipPercentage: 100 }),
            createdAt: getRecentDate(16)
        },
        {
            relationshipId: 'rel_owns_014',
            sourceEntityId: 'company_samsung_001',
            targetEntityId: 'subsidiary_samsung_electronics_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 0.95, since: '1969-01-13', ownershipPercentage: 95 }),
            createdAt: getRecentDate(15)
        },
        {
            relationshipId: 'rel_owns_015',
            sourceEntityId: 'company_siemens_001',
            targetEntityId: 'subsidiary_siemens_healthineers_001',
            relationshipType: 'owns',
            properties: JSON.stringify({ strength: 0.85, since: '2018-03-16', ownershipPercentage: 85 }),
            createdAt: getRecentDate(14)
        },

        // TRANSACTS_WITH relationships (20)
        {
            relationshipId: 'rel_transact_001',
            sourceEntityId: 'company_amazon_001',
            targetEntityId: 'company_toyota_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.85, since: '2020-03-15', transactionValue: 500000000, category: 'logistics' }),
            createdAt: getRecentDate(13)
        },
        {
            relationshipId: 'rel_transact_002',
            sourceEntityId: 'company_exxonmobil_001',
            targetEntityId: 'company_siemens_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.78, since: '2019-06-20', transactionValue: 750000000, category: 'equipment' }),
            createdAt: getRecentDate(12)
        },
        {
            relationshipId: 'rel_transact_003',
            sourceEntityId: 'company_walmart_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.92, since: '2018-01-10', transactionValue: 2000000000, category: 'retail' }),
            createdAt: getRecentDate(11)
        },
        {
            relationshipId: 'rel_transact_004',
            sourceEntityId: 'company_nestle_001',
            targetEntityId: 'company_walmart_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.88, since: '2015-05-12', transactionValue: 3500000000, category: 'distribution' }),
            createdAt: getRecentDate(10)
        },
        {
            relationshipId: 'rel_transact_005',
            sourceEntityId: 'company_tesla_001',
            targetEntityId: 'company_panasonic_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.95, since: '2014-07-31', transactionValue: 5000000000, category: 'batteries' }),
            createdAt: getRecentDate(9)
        },
        {
            relationshipId: 'rel_transact_006',
            sourceEntityId: 'company_samsung_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.82, since: '2017-03-22', transactionValue: 8000000000, category: 'components' }),
            createdAt: getRecentDate(8)
        },
        {
            relationshipId: 'rel_transact_007',
            sourceEntityId: 'company_microsoft_001',
            targetEntityId: 'company_amazon_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.75, since: '2019-11-15', transactionValue: 1200000000, category: 'cloud_services' }),
            createdAt: getRecentDate(7)
        },
        {
            relationshipId: 'rel_transact_008',
            sourceEntityId: 'company_pfizer_001',
            targetEntityId: 'company_walmart_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.87, since: '2016-02-28', transactionValue: 2500000000, category: 'pharmaceuticals' }),
            createdAt: getRecentDate(6)
        },
        {
            relationshipId: 'rel_transact_009',
            sourceEntityId: 'company_jpmorgan_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.91, since: '2020-08-19', transactionValue: 15000000000, category: 'financial_services' }),
            createdAt: getRecentDate(5)
        },
        {
            relationshipId: 'rel_transact_010',
            sourceEntityId: 'company_intel_001',
            targetEntityId: 'company_dell_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.93, since: '2010-01-01', transactionValue: 6000000000, category: 'processors' }),
            createdAt: getRecentDate(4)
        },
        {
            relationshipId: 'rel_transact_011',
            sourceEntityId: 'company_unilever_001',
            targetEntityId: 'company_amazon_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.84, since: '2018-09-12', transactionValue: 1800000000, category: 'ecommerce' }),
            createdAt: getRecentDate(3)
        },
        {
            relationshipId: 'rel_transact_012',
            sourceEntityId: 'company_boeing_001',
            targetEntityId: 'company_ge_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.89, since: '2012-04-15', transactionValue: 4500000000, category: 'engines' }),
            createdAt: getRecentDate(2)
        },
        {
            relationshipId: 'rel_transact_013',
            sourceEntityId: 'company_chevron_001',
            targetEntityId: 'company_shell_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.72, since: '2021-01-20', transactionValue: 3200000000, category: 'energy_trading' }),
            createdAt: getRecentDate(1)
        },
        {
            relationshipId: 'rel_transact_014',
            sourceEntityId: 'company_visa_001',
            targetEntityId: 'company_jpmorgan_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.96, since: '2015-07-08', transactionValue: 20000000000, category: 'payment_processing' }),
            createdAt: getRecentDate(29)
        },
        {
            relationshipId: 'rel_transact_015',
            sourceEntityId: 'company_cocacola_001',
            targetEntityId: 'company_mcdonalds_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.98, since: '1955-04-15', transactionValue: 8500000000, category: 'beverage_supply' }),
            createdAt: getRecentDate(28)
        },
        {
            relationshipId: 'rel_transact_016',
            sourceEntityId: 'company_oracle_001',
            targetEntityId: 'company_walmart_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.81, since: '2016-10-22', transactionValue: 900000000, category: 'enterprise_software' }),
            createdAt: getRecentDate(27)
        },
        {
            relationshipId: 'rel_transact_017',
            sourceEntityId: 'company_broadcom_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.86, since: '2019-02-14', transactionValue: 4200000000, category: 'semiconductors' }),
            createdAt: getRecentDate(26)
        },
        {
            relationshipId: 'rel_transact_018',
            sourceEntityId: 'company_adobe_001',
            targetEntityId: 'company_microsoft_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.74, since: '2020-05-30', transactionValue: 650000000, category: 'software_integration' }),
            createdAt: getRecentDate(25)
        },
        {
            relationshipId: 'rel_transact_019',
            sourceEntityId: 'company_costco_001',
            targetEntityId: 'company_procter_gamble_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.90, since: '2013-08-19', transactionValue: 5500000000, category: 'consumer_goods' }),
            createdAt: getRecentDate(24)
        },
        {
            relationshipId: 'rel_transact_020',
            sourceEntityId: 'company_netflix_001',
            targetEntityId: 'company_amazon_001',
            relationshipType: 'transacts_with',
            properties: JSON.stringify({ strength: 0.88, since: '2017-12-01', transactionValue: 1100000000, category: 'cloud_infrastructure' }),
            createdAt: getRecentDate(23)
        },

        // REPORTS_TO relationships (20)
        {
            relationshipId: 'rel_reports_001',
            sourceEntityId: 'person_cfo_apple_001',
            targetEntityId: 'person_ceo_apple_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2019-06-01', department: 'finance' }),
            createdAt: getRecentDate(22)
        },
        {
            relationshipId: 'rel_reports_002',
            sourceEntityId: 'person_director_finance_microsoft_001',
            targetEntityId: 'person_cfo_microsoft_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2020-03-15', department: 'finance' }),
            createdAt: getRecentDate(21)
        },
        {
            relationshipId: 'rel_reports_003',
            sourceEntityId: 'person_vp_operations_amazon_001',
            targetEntityId: 'person_ceo_amazon_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2018-09-01', department: 'operations' }),
            createdAt: getRecentDate(20)
        },
        {
            relationshipId: 'rel_reports_004',
            sourceEntityId: 'person_cto_tesla_001',
            targetEntityId: 'person_ceo_tesla_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2021-01-10', department: 'technology' }),
            createdAt: getRecentDate(19)
        },
        {
            relationshipId: 'rel_reports_005',
            sourceEntityId: 'person_cfo_meta_001',
            targetEntityId: 'person_ceo_meta_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2019-11-20', department: 'finance' }),
            createdAt: getRecentDate(18)
        },
        {
            relationshipId: 'rel_reports_006',
            sourceEntityId: 'person_vp_hr_walmart_001',
            targetEntityId: 'person_ceo_walmart_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2020-07-01', department: 'human_resources' }),
            createdAt: getRecentDate(17)
        },
        {
            relationshipId: 'rel_reports_007',
            sourceEntityId: 'person_director_marketing_toyota_001',
            targetEntityId: 'person_cmo_toyota_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2019-04-15', department: 'marketing' }),
            createdAt: getRecentDate(16)
        },
        {
            relationshipId: 'rel_reports_008',
            sourceEntityId: 'person_cfo_jpmorgan_001',
            targetEntityId: 'person_ceo_jpmorgan_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2017-12-01', department: 'finance' }),
            createdAt: getRecentDate(15)
        },
        {
            relationshipId: 'rel_reports_009',
            sourceEntityId: 'person_vp_engineering_alphabet_001',
            targetEntityId: 'person_cto_alphabet_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2021-03-22', department: 'engineering' }),
            createdAt: getRecentDate(14)
        },
        {
            relationshipId: 'rel_reports_010',
            sourceEntityId: 'person_director_compliance_berkshire_001',
            targetEntityId: 'person_general_counsel_berkshire_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2018-08-10', department: 'legal' }),
            createdAt: getRecentDate(13)
        },
        {
            relationshipId: 'rel_reports_011',
            sourceEntityId: 'person_cfo_samsung_001',
            targetEntityId: 'person_ceo_samsung_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2020-02-01', department: 'finance' }),
            createdAt: getRecentDate(12)
        },
        {
            relationshipId: 'rel_reports_012',
            sourceEntityId: 'person_vp_supply_chain_nestle_001',
            targetEntityId: 'person_coo_nestle_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2019-09-15', department: 'operations' }),
            createdAt: getRecentDate(11)
        },
        {
            relationshipId: 'rel_reports_013',
            sourceEntityId: 'person_director_rd_pfizer_001',
            targetEntityId: 'person_cso_pfizer_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2021-05-01', department: 'research' }),
            createdAt: getRecentDate(10)
        },
        {
            relationshipId: 'rel_reports_014',
            sourceEntityId: 'person_cfo_boeing_001',
            targetEntityId: 'person_ceo_boeing_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2018-11-20', department: 'finance' }),
            createdAt: getRecentDate(9)
        },
        {
            relationshipId: 'rel_reports_015',
            sourceEntityId: 'person_vp_innovation_siemens_001',
            targetEntityId: 'person_cto_siemens_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2020-06-12', department: 'technology' }),
            createdAt: getRecentDate(8)
        },
        {
            relationshipId: 'rel_reports_016',
            sourceEntityId: 'person_director_audit_exxonmobil_001',
            targetEntityId: 'person_cfo_exxonmobil_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2019-01-08', department: 'finance' }),
            createdAt: getRecentDate(7)
        },
        {
            relationshipId: 'rel_reports_017',
            sourceEntityId: 'person_cmo_cocacola_001',
            targetEntityId: 'person_ceo_cocacola_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2020-10-01', department: 'marketing' }),
            createdAt: getRecentDate(6)
        },
        {
            relationshipId: 'rel_reports_018',
            sourceEntityId: 'person_vp_security_visa_001',
            targetEntityId: 'person_ciso_visa_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2021-02-15', department: 'security' }),
            createdAt: getRecentDate(5)
        },
        {
            relationshipId: 'rel_reports_019',
            sourceEntityId: 'person_director_strategy_intel_001',
            targetEntityId: 'person_ceo_intel_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2019-07-20', department: 'strategy' }),
            createdAt: getRecentDate(4)
        },
        {
            relationshipId: 'rel_reports_020',
            sourceEntityId: 'person_cfo_oracle_001',
            targetEntityId: 'person_ceo_oracle_001',
            relationshipType: 'reports_to',
            properties: JSON.stringify({ strength: 1.0, since: '2018-05-01', department: 'finance' }),
            createdAt: getRecentDate(3)
        },

        // AUDITS relationships (12)
        {
            relationshipId: 'rel_audits_001',
            sourceEntityId: 'person_deloitte_partner_001',
            targetEntityId: 'company_tesla_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.95, since: '2020-01-01', auditType: 'financial', lastAudit: '2024-03-15' }),
            createdAt: getRecentDate(2)
        },
        {
            relationshipId: 'rel_audits_002',
            sourceEntityId: 'person_pwc_partner_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.98, since: '2015-01-01', auditType: 'financial', lastAudit: '2024-04-10' }),
            createdAt: getRecentDate(1)
        },
        {
            relationshipId: 'rel_audits_003',
            sourceEntityId: 'person_ey_partner_001',
            targetEntityId: 'company_microsoft_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.97, since: '2018-01-01', auditType: 'financial', lastAudit: '2024-03-20' }),
            createdAt: getRecentDate(30)
        },
        {
            relationshipId: 'rel_audits_004',
            sourceEntityId: 'person_kpmg_partner_001',
            targetEntityId: 'company_amazon_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.96, since: '2017-01-01', auditType: 'financial', lastAudit: '2024-04-05' }),
            createdAt: getRecentDate(29)
        },
        {
            relationshipId: 'rel_audits_005',
            sourceEntityId: 'person_deloitte_partner_002',
            targetEntityId: 'company_walmart_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.94, since: '2019-01-01', auditType: 'financial', lastAudit: '2024-03-28' }),
            createdAt: getRecentDate(28)
        },
        {
            relationshipId: 'rel_audits_006',
            sourceEntityId: 'person_pwc_partner_002',
            targetEntityId: 'company_jpmorgan_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.99, since: '2016-01-01', auditType: 'financial', lastAudit: '2024-04-12' }),
            createdAt: getRecentDate(27)
        },
        {
            relationshipId: 'rel_audits_007',
            sourceEntityId: 'person_ey_partner_002',
            targetEntityId: 'company_meta_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.93, since: '2020-01-01', auditType: 'financial', lastAudit: '2024-03-25' }),
            createdAt: getRecentDate(26)
        },
        {
            relationshipId: 'rel_audits_008',
            sourceEntityId: 'person_kpmg_partner_002',
            targetEntityId: 'company_toyota_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.95, since: '2018-01-01', auditType: 'financial', lastAudit: '2024-04-08' }),
            createdAt: getRecentDate(25)
        },
        {
            relationshipId: 'rel_audits_009',
            sourceEntityId: 'person_deloitte_partner_003',
            targetEntityId: 'company_samsung_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.92, since: '2021-01-01', auditType: 'financial', lastAudit: '2024-03-18' }),
            createdAt: getRecentDate(24)
        },
        {
            relationshipId: 'rel_audits_010',
            sourceEntityId: 'person_pwc_partner_003',
            targetEntityId: 'company_nestle_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.96, since: '2017-01-01', auditType: 'financial', lastAudit: '2024-04-02' }),
            createdAt: getRecentDate(23)
        },
        {
            relationshipId: 'rel_audits_011',
            sourceEntityId: 'person_ey_partner_003',
            targetEntityId: 'company_pfizer_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.97, since: '2019-01-01', auditType: 'financial', lastAudit: '2024-03-30' }),
            createdAt: getRecentDate(22)
        },
        {
            relationshipId: 'rel_audits_012',
            sourceEntityId: 'person_kpmg_partner_003',
            targetEntityId: 'company_boeing_001',
            relationshipType: 'audits',
            properties: JSON.stringify({ strength: 0.94, since: '2020-01-01', auditType: 'financial', lastAudit: '2024-04-15' }),
            createdAt: getRecentDate(21)
        },

        // INVESTS_IN relationships (12)
        {
            relationshipId: 'rel_invest_001',
            sourceEntityId: 'company_jpmorgan_001',
            targetEntityId: 'company_goldman_sachs_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.82, since: '2019-06-15', investmentValue: 5000000000, stake: 8.5 }),
            createdAt: getRecentDate(20)
        },
        {
            relationshipId: 'rel_invest_002',
            sourceEntityId: 'company_berkshire_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.95, since: '2016-05-12', investmentValue: 150000000000, stake: 5.4 }),
            createdAt: getRecentDate(19)
        },
        {
            relationshipId: 'rel_invest_003',
            sourceEntityId: 'company_softbank_001',
            targetEntityId: 'company_alibaba_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.88, since: '2000-01-01', investmentValue: 20000000000, stake: 25.0 }),
            createdAt: getRecentDate(18)
        },
        {
            relationshipId: 'rel_invest_004',
            sourceEntityId: 'company_vanguard_001',
            targetEntityId: 'company_microsoft_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.91, since: '2015-03-20', investmentValue: 80000000000, stake: 7.8 }),
            createdAt: getRecentDate(17)
        },
        {
            relationshipId: 'rel_invest_005',
            sourceEntityId: 'company_blackrock_001',
            targetEntityId: 'company_amazon_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.89, since: '2017-08-10', investmentValue: 95000000000, stake: 6.2 }),
            createdAt: getRecentDate(16)
        },
        {
            relationshipId: 'rel_invest_006',
            sourceEntityId: 'company_fidelity_001',
            targetEntityId: 'company_tesla_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.84, since: '2019-11-22', investmentValue: 45000000000, stake: 5.9 }),
            createdAt: getRecentDate(15)
        },
        {
            relationshipId: 'rel_invest_007',
            sourceEntityId: 'company_sequoia_capital_001',
            targetEntityId: 'company_stripe_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.93, since: '2012-02-01', investmentValue: 2000000000, stake: 15.0 }),
            createdAt: getRecentDate(14)
        },
        {
            relationshipId: 'rel_invest_008',
            sourceEntityId: 'company_a16z_001',
            targetEntityId: 'company_coinbase_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.87, since: '2013-05-09', investmentValue: 1500000000, stake: 12.5 }),
            createdAt: getRecentDate(13)
        },
        {
            relationshipId: 'rel_invest_009',
            sourceEntityId: 'company_tiger_global_001',
            targetEntityId: 'company_bytedance_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.85, since: '2018-09-30', investmentValue: 3000000000, stake: 8.0 }),
            createdAt: getRecentDate(12)
        },
        {
            relationshipId: 'rel_invest_010',
            sourceEntityId: 'company_benchmark_001',
            targetEntityId: 'company_uber_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.90, since: '2011-12-01', investmentValue: 6000000000, stake: 11.0 }),
            createdAt: getRecentDate(11)
        },
        {
            relationshipId: 'rel_invest_011',
            sourceEntityId: 'company_insight_partners_001',
            targetEntityId: 'company_datadog_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.86, since: '2015-07-15', investmentValue: 1200000000, stake: 9.5 }),
            createdAt: getRecentDate(10)
        },
        {
            relationshipId: 'rel_invest_012',
            sourceEntityId: 'company_kkr_001',
            targetEntityId: 'company_bytedance_001',
            relationshipType: 'invests_in',
            properties: JSON.stringify({ strength: 0.81, since: '2020-03-18', investmentValue: 2500000000, stake: 6.5 }),
            createdAt: getRecentDate(9)
        },

        // SUPPLIES_TO relationships (12)
        {
            relationshipId: 'rel_supply_001',
            sourceEntityId: 'company_siemens_001',
            targetEntityId: 'company_toyota_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.87, since: '2017-04-10', supplyValue: 850000000, category: 'automation' }),
            createdAt: getRecentDate(8)
        },
        {
            relationshipId: 'rel_supply_002',
            sourceEntityId: 'company_intel_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.92, since: '2016-01-01', supplyValue: 5500000000, category: 'processors' }),
            createdAt: getRecentDate(7)
        },
        {
            relationshipId: 'rel_supply_003',
            sourceEntityId: 'company_tsmc_001',
            targetEntityId: 'company_nvidia_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.98, since: '2015-03-22', supplyValue: 12000000000, category: 'semiconductors' }),
            createdAt: getRecentDate(6)
        },
        {
            relationshipId: 'rel_supply_004',
            sourceEntityId: 'company_lg_chem_001',
            targetEntityId: 'company_tesla_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.89, since: '2018-08-15', supplyValue: 3200000000, category: 'batteries' }),
            createdAt: getRecentDate(5)
        },
        {
            relationshipId: 'rel_supply_005',
            sourceEntityId: 'company_corning_001',
            targetEntityId: 'company_samsung_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.91, since: '2014-06-10', supplyValue: 2800000000, category: 'glass' }),
            createdAt: getRecentDate(4)
        },
        {
            relationshipId: 'rel_supply_006',
            sourceEntityId: 'company_basf_001',
            targetEntityId: 'company_nestle_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.84, since: '2019-02-28', supplyValue: 1500000000, category: 'chemicals' }),
            createdAt: getRecentDate(3)
        },
        {
            relationshipId: 'rel_supply_007',
            sourceEntityId: 'company_qualcomm_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.86, since: '2020-01-15', supplyValue: 7000000000, category: 'modems' }),
            createdAt: getRecentDate(2)
        },
        {
            relationshipId: 'rel_supply_008',
            sourceEntityId: 'company_3m_001',
            targetEntityId: 'company_boeing_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.88, since: '2016-09-20', supplyValue: 1900000000, category: 'materials' }),
            createdAt: getRecentDate(1)
        },
        {
            relationshipId: 'rel_supply_009',
            sourceEntityId: 'company_honeywell_001',
            targetEntityId: 'company_airbus_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.90, since: '2015-11-12', supplyValue: 2400000000, category: 'avionics' }),
            createdAt: getRecentDate(30)
        },
        {
            relationshipId: 'rel_supply_010',
            sourceEntityId: 'company_micron_001',
            targetEntityId: 'company_dell_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.93, since: '2013-05-08', supplyValue: 4200000000, category: 'memory' }),
            createdAt: getRecentDate(29)
        },
        {
            relationshipId: 'rel_supply_011',
            sourceEntityId: 'company_sk_hynix_001',
            targetEntityId: 'company_apple_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.87, since: '2017-07-25', supplyValue: 6500000000, category: 'memory' }),
            createdAt: getRecentDate(28)
        },
        {
            relationshipId: 'rel_supply_012',
            sourceEntityId: 'company_asml_001',
            targetEntityId: 'company_tsmc_001',
            relationshipType: 'supplies_to',
            properties: JSON.stringify({ strength: 0.99, since: '2010-01-01', supplyValue: 15000000000, category: 'lithography' }),
            createdAt: getRecentDate(27)
        },

        // COMPETES_WITH relationships (9)
        {
            relationshipId: 'rel_compete_001',
            sourceEntityId: 'company_tesla_001',
            targetEntityId: 'company_toyota_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.85, since: '2012-06-22', marketSegment: 'automotive', intensity: 'high' }),
            createdAt: getRecentDate(26)
        },
        {
            relationshipId: 'rel_compete_002',
            sourceEntityId: 'company_amazon_001',
            targetEntityId: 'company_walmart_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.92, since: '2015-01-01', marketSegment: 'retail', intensity: 'very_high' }),
            createdAt: getRecentDate(25)
        },
        {
            relationshipId: 'rel_compete_003',
            sourceEntityId: 'company_apple_001',
            targetEntityId: 'company_samsung_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.95, since: '2010-06-07', marketSegment: 'smartphones', intensity: 'very_high' }),
            createdAt: getRecentDate(24)
        },
        {
            relationshipId: 'rel_compete_004',
            sourceEntityId: 'company_microsoft_001',
            targetEntityId: 'company_google_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.88, since: '2006-08-09', marketSegment: 'cloud_services', intensity: 'high' }),
            createdAt: getRecentDate(23)
        },
        {
            relationshipId: 'rel_compete_005',
            sourceEntityId: 'company_cocacola_001',
            targetEntityId: 'company_pepsi_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.99, since: '1898-01-01', marketSegment: 'beverages', intensity: 'very_high' }),
            createdAt: getRecentDate(22)
        },
        {
            relationshipId: 'rel_compete_006',
            sourceEntityId: 'company_boeing_001',
            targetEntityId: 'company_airbus_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.97, since: '1970-12-18', marketSegment: 'aerospace', intensity: 'very_high' }),
            createdAt: getRecentDate(21)
        },
        {
            relationshipId: 'rel_compete_007',
            sourceEntityId: 'company_visa_001',
            targetEntityId: 'company_mastercard_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.94, since: '1966-09-18', marketSegment: 'payment_networks', intensity: 'very_high' }),
            createdAt: getRecentDate(20)
        },
        {
            relationshipId: 'rel_compete_008',
            sourceEntityId: 'company_netflix_001',
            targetEntityId: 'company_disney_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.91, since: '2019-11-12', marketSegment: 'streaming', intensity: 'high' }),
            createdAt: getRecentDate(19)
        },
        {
            relationshipId: 'rel_compete_009',
            sourceEntityId: 'company_uber_001',
            targetEntityId: 'company_lyft_001',
            relationshipType: 'competes_with',
            properties: JSON.stringify({ strength: 0.96, since: '2012-07-01', marketSegment: 'ridesharing', intensity: 'very_high' }),
            createdAt: getRecentDate(18)
        }
    ];

    await db.insert(knowledgeGraphRelationships).values(sampleRelationships);
    
    console.log('✅ Knowledge graph relationships seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});