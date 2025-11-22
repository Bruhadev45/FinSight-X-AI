import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single document by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const document = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(id)))
        .limit(1);

      if (document.length === 0) {
        return NextResponse.json({ 
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(document[0], { status: 200 });
    }

    // List documents with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const complianceStatus = searchParams.get('complianceStatus');
    const companyId = searchParams.get('companyId');

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(like(documents.fileName, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(documents.status, status));
    }

    if (riskLevel) {
      conditions.push(eq(documents.riskLevel, riskLevel));
    }

    if (complianceStatus) {
      conditions.push(eq(documents.complianceStatus, complianceStatus));
    }

    if (companyId) {
      conditions.push(eq(documents.companyId, parseInt(companyId)));
    }

    const baseQuery = db.select().from(documents);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, userId, riskLevel, complianceStatus, summary, storagePath, companyId } = body;

    // Validate required fields
    if (!fileName) {
      return NextResponse.json({ 
        error: "fileName is required",
        code: "MISSING_FILE_NAME" 
      }, { status: 400 });
    }

    if (!fileType) {
      return NextResponse.json({ 
        error: "fileType is required",
        code: "MISSING_FILE_TYPE" 
      }, { status: 400 });
    }

    if (!fileSize || isNaN(parseInt(fileSize))) {
      return NextResponse.json({ 
        error: "fileSize is required and must be a number",
        code: "INVALID_FILE_SIZE" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedFileName = fileName.trim();
    const sanitizedFileType = fileType.trim();

    const now = new Date().toISOString();

    // Create new document
    const newDocument = await db.insert(documents)
      .values({
        userId: userId || null,
        companyId: companyId ? parseInt(companyId) : null,
        fileName: sanitizedFileName,
        fileType: sanitizedFileType,
        fileSize: parseInt(fileSize),
        uploadDate: now,
        status: 'processing',
        riskLevel: riskLevel || null,
        anomalyCount: 0,
        complianceStatus: complianceStatus || null,
        summary: summary || null,
        storagePath: storagePath || null,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { 
      fileName, 
      fileType, 
      fileSize, 
      userId, 
      status, 
      riskLevel, 
      anomalyCount, 
      complianceStatus, 
      summary, 
      storagePath,
      companyId
    } = body;

    // Check if document exists
    const existing = await db.select()
      .from(documents)
      .where(eq(documents.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (fileName !== undefined) updates.fileName = fileName.trim();
    if (fileType !== undefined) updates.fileType = fileType.trim();
    if (fileSize !== undefined) {
      if (isNaN(parseInt(fileSize))) {
        return NextResponse.json({ 
          error: "fileSize must be a number",
          code: "INVALID_FILE_SIZE" 
        }, { status: 400 });
      }
      updates.fileSize = parseInt(fileSize);
    }
    if (userId !== undefined) updates.userId = userId;
    if (companyId !== undefined) updates.companyId = companyId ? parseInt(companyId) : null;
    if (status !== undefined) updates.status = status;
    if (riskLevel !== undefined) updates.riskLevel = riskLevel;
    if (anomalyCount !== undefined) {
      if (isNaN(parseInt(anomalyCount))) {
        return NextResponse.json({ 
          error: "anomalyCount must be a number",
          code: "INVALID_ANOMALY_COUNT" 
        }, { status: 400 });
      }
      updates.anomalyCount = parseInt(anomalyCount);
    }
    if (complianceStatus !== undefined) updates.complianceStatus = complianceStatus;
    if (summary !== undefined) updates.summary = summary;
    if (storagePath !== undefined) updates.storagePath = storagePath;

    const updated = await db.update(documents)
      .set(updates)
      .where(eq(documents.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if document exists
    const existing = await db.select()
      .from(documents)
      .where(eq(documents.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(documents)
      .where(eq(documents.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Document deleted successfully',
      document: deleted[0] 
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}