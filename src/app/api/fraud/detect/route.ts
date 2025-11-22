import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@/lib/ai-engine';
import { db } from '@/db';
import { documents, alerts } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

interface FraudPattern {
  type: string;
  confidence: number;
  description: string;
  indicators: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, text, amount, merchantName, transactionDate, userId } = body;

    const fraudPatterns: FraudPattern[] = [];

    // Pattern 1: Analyze text for fraud keywords
    const fraudKeywords = [
      'unauthorized', 'dispute', 'chargeback', 'fraudulent', 'stolen',
      'suspicious', 'alert', 'warning', 'violation', 'breach'
    ];

    const lowerText = (text || '').toLowerCase();
    const matchedKeywords = fraudKeywords.filter(keyword => lowerText.includes(keyword));

    if (matchedKeywords.length > 0) {
      fraudPatterns.push({
        type: 'keyword_match',
        confidence: Math.min(0.9, matchedKeywords.length * 0.2),
        description: `Detected ${matchedKeywords.length} fraud-related keyword(s)`,
        indicators: matchedKeywords,
        riskLevel: matchedKeywords.length > 2 ? 'high' : 'medium',
      });
    }

    // Pattern 2: Amount anomaly detection
    if (amount && documentId) {
      try {
        // Get user's recent transactions
        const recentDocs = await db.select()
          .from(documents)
          .where(
            and(
              eq(documents.userId, userId || 'user_1'),
              sql`${documents.createdAt} >= datetime('now', '-30 days')`
            )
          )
          .limit(20);

        // Extract amounts from summaries (simplified)
        const amounts = recentDocs
          .map(doc => {
            const match = doc.summary?.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            return match ? parseFloat(match[1].replace(/,/g, '')) : null;
          })
          .filter((a): a is number => a !== null);

        if (amounts.length > 0) {
          const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const stdDev = Math.sqrt(
            amounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / amounts.length
          );

          const parsedAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[$,]/g, '')) : amount;

          if (Math.abs(parsedAmount - avg) > 3 * stdDev) {
            fraudPatterns.push({
              type: 'amount_anomaly',
              confidence: 0.75,
              description: `Amount $${parsedAmount.toLocaleString()} is significantly different from user's average ($${avg.toFixed(2)})`,
              indicators: [`${((parsedAmount - avg) / avg * 100).toFixed(1)}% deviation from average`],
              riskLevel: parsedAmount > avg * 2 ? 'critical' : 'high',
            });
          }
        }
      } catch (dbError) {
        console.error('DB query error:', dbError);
      }
    }

    // Pattern 3: Duplicate transaction detection
    if (merchantName && amount) {
      try {
        const duplicates = await db.select()
          .from(documents)
          .where(
            and(
              sql`${documents.summary} LIKE '%${merchantName}%'`,
              sql`${documents.createdAt} >= datetime('now', '-24 hours')`
            )
          )
          .limit(5);

        if (duplicates.length > 1) {
          fraudPatterns.push({
            type: 'duplicate_transaction',
            confidence: 0.7,
            description: `Found ${duplicates.length} similar transactions in the last 24 hours`,
            indicators: [`${duplicates.length} transactions with ${merchantName}`],
            riskLevel: duplicates.length > 3 ? 'high' : 'medium',
          });
        }
      } catch (dbError) {
        console.error('Duplicate check error:', dbError);
      }
    }

    // Pattern 4: AI-based text analysis
    if (text) {
      const analysis = AIEngine.analyzeText(text);

      if (analysis.riskScore > 0.6) {
        fraudPatterns.push({
          type: 'ai_risk_assessment',
          confidence: analysis.confidence,
          description: `AI detected high risk score: ${(analysis.riskScore * 100).toFixed(1)}%`,
          indicators: analysis.insights,
          riskLevel: analysis.riskScore > 0.8 ? 'critical' : 'high',
        });
      }

      // Check for critical anomalies
      const criticalAnomalies = analysis.anomalies.filter(a => a.severity === 'critical');
      if (criticalAnomalies.length > 0) {
        fraudPatterns.push({
          type: 'data_anomaly',
          confidence: 0.85,
          description: `${criticalAnomalies.length} critical data anomalies detected`,
          indicators: criticalAnomalies.map(a => a.description),
          riskLevel: 'critical',
        });
      }
    }

    // Pattern 5: Time-based fraud detection
    if (transactionDate) {
      const hour = new Date(transactionDate).getHours();
      // Unusual hours (2 AM - 5 AM)
      if (hour >= 2 && hour <= 5) {
        fraudPatterns.push({
          type: 'unusual_time',
          confidence: 0.5,
          description: 'Transaction occurred during unusual hours',
          indicators: [`Transaction at ${hour}:00`],
          riskLevel: 'medium',
        });
      }
    }

    // Calculate overall fraud score
    const overallScore = fraudPatterns.length > 0
      ? fraudPatterns.reduce((sum, p) => sum + p.confidence, 0) / fraudPatterns.length
      : 0;

    const isFraudulent = overallScore > 0.6 || fraudPatterns.some(p => p.riskLevel === 'critical');

    // Create alert if fraud detected and documentId provided
    if (isFraudulent && documentId) {
      try {
        await db.insert(alerts).values({
          sourceDocumentId: parseInt(documentId),
          alertType: 'fraud_detected',
          severity: overallScore > 0.8 ? 'critical' : 'high',
          title: 'Potential Fraud Detected',
          description: `Potential fraud detected: ${fraudPatterns.length} suspicious pattern(s)`,
          triggeredAt: new Date().toISOString(),
          status: 'unread',
        });
      } catch (dbError) {
        console.error('Alert creation error:', dbError);
      }
    }

    // Generate recommendations
    const recommendations = [];
    if (isFraudulent) {
      recommendations.push('🔴 IMMEDIATE ACTION REQUIRED');
      recommendations.push('Contact card holder for verification');
      recommendations.push('Consider temporary card suspension');
      recommendations.push('Review recent transaction history');
    } else if (overallScore > 0.3) {
      recommendations.push('🟡 Enhanced monitoring recommended');
      recommendations.push('Flag for manual review');
    } else {
      recommendations.push('🟢 No fraud detected - proceed with standard processing');
    }

    return NextResponse.json({
      success: true,
      fraudDetection: {
        isFraudulent,
        fraudScore: parseFloat((overallScore * 100).toFixed(2)),
        confidence: parseFloat((overallScore * 100).toFixed(2)),
        patterns: fraudPatterns,
        recommendations,
        detectedAt: new Date().toISOString(),
        analysis: {
          totalPatterns: fraudPatterns.length,
          highRiskPatterns: fraudPatterns.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
          criticalPatterns: fraudPatterns.filter(p => p.riskLevel === 'critical').length,
        },
      },
    });
  } catch (error) {
    console.error('Fraud detection error:', error);
    return NextResponse.json(
      { error: 'Fraud detection failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
