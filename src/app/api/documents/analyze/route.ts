import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@/lib/ai-engine';
import { db } from '@/db';
import { documents, alerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, text, options } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required for analysis' },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const analysis = AIEngine.analyzeText(text);

    // If documentId provided, update the document and create alerts
    if (documentId) {
      try {
        // Update document with analysis results
        await db.update(documents)
          .set({
            status: 'processed',
            riskLevel: analysis.riskScore > 0.7 ? 'high' : analysis.riskScore > 0.4 ? 'medium' : 'low',
            complianceStatus: analysis.anomalies.some(a => a.severity === 'critical') ? 'failed' : 'passed',
            summary: analysis.insights.join(' | '),
          })
          .where(eq(documents.id, parseInt(documentId)));

        // Create alerts for high-severity anomalies
        const criticalAnomalies = analysis.anomalies.filter(
          a => a.severity === 'critical' || a.severity === 'high'
        );

        for (const anomaly of criticalAnomalies) {
          await db.insert(alerts).values({
            sourceDocumentId: parseInt(documentId),
            alertType: 'anomaly_detected',
            severity: anomaly.severity === 'critical' ? 'critical' : 'high',
            title: 'Anomaly Detected',
            description: anomaly.description,
            triggeredAt: new Date().toISOString(),
            status: 'unread',
          });
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Continue even if DB update fails
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        metadata: {
          processedAt: new Date().toISOString(),
          textLength: text.length,
          processingTime: '~100ms',
        },
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Batch analysis endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents: docs } = body;

    if (!Array.isArray(docs) || docs.length === 0) {
      return NextResponse.json(
        { error: 'Array of documents is required' },
        { status: 400 }
      );
    }

    const results = await AIEngine.batchAnalyze(docs);

    return NextResponse.json({
      success: true,
      totalDocuments: docs.length,
      results: Object.fromEntries(results),
      processingTime: `~${docs.length * 100}ms`,
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: 'Batch analysis failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
