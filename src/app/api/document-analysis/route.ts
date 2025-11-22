import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documentAnalysis, documents } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_ANALYSIS_TYPES = ['fraud', 'compliance', 'risk', 'kpi'] as const;

// GET - List all document analysis records with filters or get single by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(documentAnalysis)
        .where(eq(documentAnalysis.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Document analysis not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const documentId = searchParams.get('documentId');
    const analysisType = searchParams.get('analysisType');

    // Build where conditions
    const conditions = [];

    if (documentId) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json(
          { error: 'Valid documentId is required', code: 'INVALID_DOCUMENT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(documentAnalysis.documentId, parseInt(documentId)));
    }

    if (analysisType) {
      if (!VALID_ANALYSIS_TYPES.includes(analysisType as any)) {
        return NextResponse.json(
          {
            error: `Invalid analysisType. Must be one of: ${VALID_ANALYSIS_TYPES.join(', ')}`,
            code: 'INVALID_ANALYSIS_TYPE',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(documentAnalysis.analysisType, analysisType));
    }

    const baseQuery = db.select().from(documentAnalysis);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(documentAnalysis.analyzedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Create new document analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      analysisType,
      keyFindings,
      fraudIndicators,
      confidenceScore,
    } = body;

    // Validate required fields
    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required', code: 'MISSING_DOCUMENT_ID' },
        { status: 400 }
      );
    }

    if (!analysisType) {
      return NextResponse.json(
        { error: 'analysisType is required', code: 'MISSING_ANALYSIS_TYPE' },
        { status: 400 }
      );
    }

    // Validate documentId is a valid number
    if (isNaN(parseInt(documentId))) {
      return NextResponse.json(
        { error: 'documentId must be a valid number', code: 'INVALID_DOCUMENT_ID' },
        { status: 400 }
      );
    }

    // Validate analysisType
    if (!VALID_ANALYSIS_TYPES.includes(analysisType)) {
      return NextResponse.json(
        {
          error: `analysisType must be one of: ${VALID_ANALYSIS_TYPES.join(', ')}`,
          code: 'INVALID_ANALYSIS_TYPE',
        },
        { status: 400 }
      );
    }

    // Verify document exists
    const documentExists = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parseInt(documentId)))
      .limit(1);

    if (documentExists.length === 0) {
      return NextResponse.json(
        { error: 'Document not found', code: 'DOCUMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate JSON fields if provided
    if (keyFindings !== undefined && keyFindings !== null) {
      if (!Array.isArray(keyFindings)) {
        return NextResponse.json(
          { error: 'keyFindings must be an array', code: 'INVALID_KEY_FINDINGS' },
          { status: 400 }
        );
      }
    }

    if (fraudIndicators !== undefined && fraudIndicators !== null) {
      if (!Array.isArray(fraudIndicators)) {
        return NextResponse.json(
          {
            error: 'fraudIndicators must be an array',
            code: 'INVALID_FRAUD_INDICATORS',
          },
          { status: 400 }
        );
      }
    }

    // Validate confidenceScore if provided
    if (confidenceScore !== undefined && confidenceScore !== null) {
      const score = parseFloat(confidenceScore);
      if (isNaN(score) || score < 0 || score > 1) {
        return NextResponse.json(
          {
            error: 'confidenceScore must be a number between 0 and 1',
            code: 'INVALID_CONFIDENCE_SCORE',
          },
          { status: 400 }
        );
      }
    }

    // Create new document analysis
    const newAnalysis = await db
      .insert(documentAnalysis)
      .values({
        documentId: parseInt(documentId),
        analysisType: analysisType.trim(),
        keyFindings: keyFindings || null,
        fraudIndicators: fraudIndicators || null,
        confidenceScore: confidenceScore ? parseFloat(confidenceScore) : null,
        analyzedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAnalysis[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update document analysis by ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(documentAnalysis)
      .where(eq(documentAnalysis.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Document analysis not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      documentId,
      analysisType,
      keyFindings,
      fraudIndicators,
      confidenceScore,
    } = body;

    // Validate documentId if provided
    if (documentId !== undefined) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json(
          {
            error: 'documentId must be a valid number',
            code: 'INVALID_DOCUMENT_ID',
          },
          { status: 400 }
        );
      }

      // Verify document exists
      const documentExists = await db
        .select()
        .from(documents)
        .where(eq(documents.id, parseInt(documentId)))
        .limit(1);

      if (documentExists.length === 0) {
        return NextResponse.json(
          { error: 'Document not found', code: 'DOCUMENT_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    // Validate analysisType if provided
    if (analysisType !== undefined) {
      if (!VALID_ANALYSIS_TYPES.includes(analysisType)) {
        return NextResponse.json(
          {
            error: `analysisType must be one of: ${VALID_ANALYSIS_TYPES.join(', ')}`,
            code: 'INVALID_ANALYSIS_TYPE',
          },
          { status: 400 }
        );
      }
    }

    // Validate JSON fields if provided
    if (keyFindings !== undefined && keyFindings !== null) {
      if (!Array.isArray(keyFindings)) {
        return NextResponse.json(
          { error: 'keyFindings must be an array', code: 'INVALID_KEY_FINDINGS' },
          { status: 400 }
        );
      }
    }

    if (fraudIndicators !== undefined && fraudIndicators !== null) {
      if (!Array.isArray(fraudIndicators)) {
        return NextResponse.json(
          {
            error: 'fraudIndicators must be an array',
            code: 'INVALID_FRAUD_INDICATORS',
          },
          { status: 400 }
        );
      }
    }

    // Validate confidenceScore if provided
    if (confidenceScore !== undefined && confidenceScore !== null) {
      const score = parseFloat(confidenceScore);
      if (isNaN(score) || score < 0 || score > 1) {
        return NextResponse.json(
          {
            error: 'confidenceScore must be a number between 0 and 1',
            code: 'INVALID_CONFIDENCE_SCORE',
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (documentId !== undefined) {
      updates.documentId = parseInt(documentId);
    }
    if (analysisType !== undefined) {
      updates.analysisType = analysisType.trim();
    }
    if (keyFindings !== undefined) {
      updates.keyFindings = keyFindings;
    }
    if (fraudIndicators !== undefined) {
      updates.fraudIndicators = fraudIndicators;
    }
    if (confidenceScore !== undefined) {
      updates.confidenceScore = confidenceScore ? parseFloat(confidenceScore) : null;
    }

    const updated = await db
      .update(documentAnalysis)
      .set(updates)
      .where(eq(documentAnalysis.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Delete document analysis by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(documentAnalysis)
      .where(eq(documentAnalysis.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Document analysis not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(documentAnalysis)
      .where(eq(documentAnalysis.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Document analysis deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}