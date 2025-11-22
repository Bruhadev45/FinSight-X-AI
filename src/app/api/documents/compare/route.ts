import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@/lib/ai-engine';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doc1Id, doc2Id, doc1Text, doc2Text } = body;

    let text1 = doc1Text;
    let text2 = doc2Text;

    // If IDs provided, fetch from database
    if (doc1Id && !doc1Text) {
      const doc = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(doc1Id)))
        .limit(1);

      if (doc.length > 0 && doc[0].summary) {
        text1 = doc[0].summary;
      }
    }

    if (doc2Id && !doc2Text) {
      const doc = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(doc2Id)))
        .limit(1);

      if (doc.length > 0 && doc[0].summary) {
        text2 = doc[0].summary;
      }
    }

    if (!text1 || !text2) {
      return NextResponse.json(
        { error: 'Both documents text content is required' },
        { status: 400 }
      );
    }

    // Perform comparison
    const comparison = AIEngine.compareDocuments(text1, text2);

    // Analyze both documents individually
    const analysis1 = AIEngine.analyzeText(text1);
    const analysis2 = AIEngine.analyzeText(text2);

    // Calculate change metrics
    const metrics = {
      similarityScore: comparison.similarity,
      entitiesAdded: comparison.addedEntities.length,
      entitiesRemoved: comparison.removedEntities.length,
      riskScoreChange: analysis2.riskScore - analysis1.riskScore,
      sentimentChange: analysis2.sentimentScore - analysis1.sentimentScore,
      anomalyCountChange: analysis2.anomalies.length - analysis1.anomalies.length,
    };

    // Generate comparison insights
    const insights = [];
    if (metrics.similarityScore > 0.8) {
      insights.push('Documents are highly similar');
    } else if (metrics.similarityScore < 0.3) {
      insights.push('⚠️ Documents have significant differences');
    }

    if (metrics.riskScoreChange > 0.2) {
      insights.push('🔴 Risk level increased significantly');
    } else if (metrics.riskScoreChange < -0.2) {
      insights.push('🟢 Risk level decreased');
    }

    if (metrics.entitiesAdded > 5) {
      insights.push(`${metrics.entitiesAdded} new entities detected`);
    }

    if (metrics.entitiesRemoved > 5) {
      insights.push(`⚠️ ${metrics.entitiesRemoved} entities were removed`);
    }

    return NextResponse.json({
      success: true,
      comparison: {
        ...comparison,
        metrics,
        insights,
        doc1Analysis: {
          riskScore: analysis1.riskScore,
          sentimentScore: analysis1.sentimentScore,
          entityCount: analysis1.entities.length,
          anomalyCount: analysis1.anomalies.length,
        },
        doc2Analysis: {
          riskScore: analysis2.riskScore,
          sentimentScore: analysis2.sentimentScore,
          entityCount: analysis2.entities.length,
          anomalyCount: analysis2.anomalies.length,
        },
      },
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Comparison failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
