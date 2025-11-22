import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@/lib/ai-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, documentId, extractionType = 'comprehensive' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const analysis = AIEngine.analyzeText(text);

    // Organize entities by type
    const entitiesByType = {
      companies: analysis.entities.filter(e => e.type === 'company'),
      people: analysis.entities.filter(e => e.type === 'person'),
      amounts: analysis.entities.filter(e => e.type === 'amount'),
      dates: analysis.entities.filter(e => e.type === 'date'),
      accounts: analysis.entities.filter(e => e.type === 'account'),
      locations: analysis.entities.filter(e => e.type === 'location'),
    };

    // Calculate financial metrics from amounts
    const amounts = entitiesByType.amounts.map(a =>
      parseFloat(a.value.replace(/[$,]/g, ''))
    );

    const financialMetrics = amounts.length > 0 ? {
      total: amounts.reduce((sum, a) => sum + a, 0),
      average: amounts.reduce((sum, a) => sum + a, 0) / amounts.length,
      minimum: Math.min(...amounts),
      maximum: Math.max(...amounts),
      count: amounts.length,
      median: amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)],
    } : null;

    // Extract key phrases (simple implementation)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const meaningfulWords = words.filter((w: string) => !stopWords.has(w) && w.length > 3);
    const wordFreq = new Map<string, number>();

    meaningfulWords.forEach((word: string) => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    const keyPhrases = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, frequency: count }));

    // Compliance indicators
    const complianceKeywords = {
      regulatory: ['regulation', 'compliance', 'regulatory', 'sec', 'finra', 'gdpr'],
      audit: ['audit', 'auditor', 'audited', 'review', 'inspection'],
      legal: ['legal', 'contract', 'agreement', 'terms', 'conditions'],
      privacy: ['privacy', 'confidential', 'pii', 'personal data', 'sensitive'],
      security: ['security', 'encrypted', 'secure', 'protected', 'authentication'],
    };

    const complianceIndicators: Record<string, string[]> = {};
    Object.entries(complianceKeywords).forEach(([category, keywords]) => {
      const found = keywords.filter(k => text.toLowerCase().includes(k));
      if (found.length > 0) {
        complianceIndicators[category] = found;
      }
    });

    // Risk indicators
    const riskIndicators = {
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[],
    };

    if (analysis.riskScore > 0.7) {
      riskIndicators.high.push('Overall high risk score detected');
    }

    analysis.anomalies.forEach(anomaly => {
      if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
        riskIndicators.high.push(anomaly.description);
      } else if (anomaly.severity === 'medium') {
        riskIndicators.medium.push(anomaly.description);
      } else {
        riskIndicators.low.push(anomaly.description);
      }
    });

    // Document health score
    const healthScore = calculateHealthScore(analysis, entitiesByType, complianceIndicators);

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(
      analysis,
      entitiesByType,
      financialMetrics,
      healthScore
    );

    return NextResponse.json({
      success: true,
      intelligence: {
        entities: entitiesByType,
        financialMetrics,
        keyPhrases,
        compliance: {
          indicators: complianceIndicators,
          score: calculateComplianceScore(complianceIndicators),
          status: Object.keys(complianceIndicators).length > 0 ? 'compliant' : 'needs_review',
        },
        risk: {
          score: analysis.riskScore,
          level: analysis.riskScore > 0.7 ? 'high' : analysis.riskScore > 0.4 ? 'medium' : 'low',
          indicators: riskIndicators,
          anomalies: analysis.anomalies,
        },
        sentiment: {
          score: analysis.sentimentScore,
          interpretation: analysis.sentimentScore > 0.3 ? 'positive' : analysis.sentimentScore < -0.3 ? 'negative' : 'neutral',
        },
        health: {
          score: healthScore,
          grade: healthScore > 0.8 ? 'A' : healthScore > 0.6 ? 'B' : healthScore > 0.4 ? 'C' : 'D',
          status: healthScore > 0.7 ? 'excellent' : healthScore > 0.5 ? 'good' : healthScore > 0.3 ? 'fair' : 'poor',
        },
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        executiveSummary,
        metadata: {
          textLength: text.length,
          entityCount: analysis.entities.length,
          processingTime: '~150ms',
          extractedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Intelligence extraction error:', error);
    return NextResponse.json(
      { error: 'Extraction failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

function calculateHealthScore(
  analysis: any,
  entities: any,
  compliance: any
): number {
  let score = 0.5; // Base score

  // Positive factors
  if (entities.companies.length > 0) score += 0.1;
  if (entities.amounts.length > 0) score += 0.1;
  if (entities.dates.length > 0) score += 0.05;
  if (Object.keys(compliance).length > 0) score += 0.15;
  if (analysis.sentimentScore > 0) score += 0.1;

  // Negative factors
  score -= analysis.riskScore * 0.3;
  score -= analysis.anomalies.length * 0.05;

  return Math.max(0, Math.min(1, score));
}

function calculateComplianceScore(indicators: Record<string, string[]>): number {
  const categoryCount = Object.keys(indicators).length;
  const maxCategories = 5; // regulatory, audit, legal, privacy, security
  return categoryCount / maxCategories;
}

function generateExecutiveSummary(
  analysis: any,
  entities: any,
  financialMetrics: any,
  healthScore: number
): string {
  const parts = [];

  parts.push(`Document Health: ${healthScore > 0.7 ? 'Excellent' : healthScore > 0.5 ? 'Good' : 'Needs Attention'} (${(healthScore * 100).toFixed(0)}%)`);

  if (entities.companies.length > 0) {
    parts.push(`Identified ${entities.companies.length} company reference(s)`);
  }

  if (financialMetrics) {
    parts.push(`Total financial value: $${financialMetrics.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }

  parts.push(`Risk Level: ${analysis.riskScore > 0.7 ? 'High' : analysis.riskScore > 0.4 ? 'Medium' : 'Low'}`);

  if (analysis.anomalies.length > 0) {
    parts.push(`${analysis.anomalies.length} anomaly/anomalies detected`);
  }

  return parts.join('. ') + '.';
}
