import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  documents, 
  documentAnalysis, 
  financialMetrics, 
  complianceChecks, 
  aiAgentLogs, 
  documentVersions 
} from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid document ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const documentId = parseInt(id);

    // Fetch the document record first to ensure it exists
    const document = await db.select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      return NextResponse.json(
        { 
          error: 'Document not found',
          code: "DOCUMENT_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Fetch all related records in parallel
    const [analyses, metrics, compliance, aiLogs, versions] = await Promise.all([
      db.select()
        .from(documentAnalysis)
        .where(eq(documentAnalysis.documentId, documentId)),
      
      db.select()
        .from(financialMetrics)
        .where(eq(financialMetrics.documentId, documentId)),
      
      db.select()
        .from(complianceChecks)
        .where(eq(complianceChecks.documentId, documentId)),
      
      db.select()
        .from(aiAgentLogs)
        .where(eq(aiAgentLogs.documentId, documentId)),
      
      db.select()
        .from(documentVersions)
        .where(eq(documentVersions.documentId, documentId))
    ]);

    // Return aggregated data
    return NextResponse.json(
      {
        document: document[0],
        analyses: analyses,
        metrics: metrics,
        complianceChecks: compliance,
        aiLogs: aiLogs,
        versions: versions
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET document analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}