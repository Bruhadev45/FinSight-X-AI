import { describe, it, expect, vi } from 'vitest';

// Mock OpenAI before importing the service
vi.mock('openai', () => {
  const MockOpenAI = vi.fn();
  MockOpenAI.prototype.chat = {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Mocked report content: INVESTOR MEMO for Test Corp' } }],
      }),
    },
  };
  return { default: MockOpenAI };
});

import { reportGenerator } from '@/lib/services/report-generator';

describe('Report Generator', () => {
  describe('generateInvestorMemo', () => {
    it('should generate an investor memo report', async () => {
      const companyData = {
        name: 'Test Corp',
        financials: {
          revenue: 10000000,
          profit: 2000000,
          growth: 25,
        },
        analysis: {
          strengths: ['Strong revenue growth', 'Healthy profit margins'],
          weaknesses: ['Limited market presence'],
          opportunities: ['Expanding market'],
          threats: ['Competition'],
        },
        risks: ['Market volatility'],
      };

      const result = await reportGenerator.generateInvestorMemo(companyData);

      expect(result).toBeDefined();
      expect(result).toContain('Mocked report content');
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate a compliance report', async () => {
      const complianceData = [
        {
          standard: 'IFRS',
          status: 'Compliant',
        }
      ];
      const period = 'Q1 2024';

      const result = await reportGenerator.generateComplianceReport(complianceData, period);

      expect(result).toBeDefined();
      expect(result).toContain('Mocked report content');
    });
  });

  describe('generateRiskReport', () => {
    it('should generate a risk report', async () => {
      const riskAnalysis = { overall: 'Medium' };
      const predictions = { trend: 'Stable' };
      const monteCarlo = { var: 100 };

      const result = await reportGenerator.generateRiskReport(riskAnalysis, predictions, monteCarlo);

      expect(result).toBeDefined();
      expect(result).toContain('Mocked report content');
    });
  });
});
