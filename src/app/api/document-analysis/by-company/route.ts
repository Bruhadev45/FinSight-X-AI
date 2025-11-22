import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documentAnalysis, documents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Get document analysis records for a specific company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    if (!companyId || isNaN(parseInt(companyId))) {
      return NextResponse.json(
        { error: 'Valid companyId is required', code: 'INVALID_COMPANY_ID' },
        { status: 400 }
      );
    }

    // Join document_analysis with documents to filter by companyId
    const results = await db
      .select({
        id: documentAnalysis.id,
        documentId: documentAnalysis.documentId,
        analysisType: documentAnalysis.analysisType,
        keyFindings: documentAnalysis.keyFindings,
        fraudIndicators: documentAnalysis.fraudIndicators,
        confidenceScore: documentAnalysis.confidenceScore,
        analyzedAt: documentAnalysis.analyzedAt,
      })
      .from(documentAnalysis)
      .innerJoin(documents, eq(documentAnalysis.documentId, documents.id))
      .where(eq(documents.companyId, parseInt(companyId)))
      .orderBy(desc(documentAnalysis.analyzedAt))
      .limit(limit);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
