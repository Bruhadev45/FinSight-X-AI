import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documentVersions, documents } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const documentId = searchParams.get('documentId');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const version = await db.select()
        .from(documentVersions)
        .where(eq(documentVersions.id, parseInt(id)))
        .limit(1);

      if (version.length === 0) {
        return NextResponse.json({
          error: 'Document version not found',
          code: "VERSION_NOT_FOUND"
        }, { status: 404 });
      }

      return NextResponse.json(version[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Filter by documentId if provided
    if (documentId && isNaN(parseInt(documentId))) {
      return NextResponse.json({
        error: "Valid documentId is required",
        code: "INVALID_DOCUMENT_ID"
      }, { status: 400 });
    }

    const baseQuery = db.select().from(documentVersions);

    // Order by versionNumber DESC
    const results = await (documentId
      ? baseQuery.where(eq(documentVersions.documentId, parseInt(documentId)))
      : baseQuery)
      .orderBy(desc(documentVersions.versionNumber))
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
    const { documentId, versionNumber, changesDetected, numericChanges, textualChanges } = body;

    // Validate required fields
    if (!documentId) {
      return NextResponse.json({
        error: "documentId is required",
        code: "MISSING_DOCUMENT_ID"
      }, { status: 400 });
    }

    if (!versionNumber) {
      return NextResponse.json({
        error: "versionNumber is required",
        code: "MISSING_VERSION_NUMBER"
      }, { status: 400 });
    }

    // Validate documentId is a valid integer
    if (isNaN(parseInt(documentId))) {
      return NextResponse.json({
        error: "documentId must be a valid integer",
        code: "INVALID_DOCUMENT_ID"
      }, { status: 400 });
    }

    // Validate versionNumber is a valid integer
    if (isNaN(parseInt(versionNumber))) {
      return NextResponse.json({
        error: "versionNumber must be a valid integer",
        code: "INVALID_VERSION_NUMBER"
      }, { status: 400 });
    }

    // Verify that the referenced document exists
    const existingDocument = await db.select()
      .from(documents)
      .where(eq(documents.id, parseInt(documentId)))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json({
        error: "Referenced document does not exist",
        code: "DOCUMENT_NOT_FOUND"
      }, { status: 400 });
    }

    // Validate JSON fields if provided
    let parsedChangesDetected = null;
    let parsedNumericChanges = null;
    let parsedTextualChanges = null;

    if (changesDetected !== undefined && changesDetected !== null) {
      try {
        // If it's already an object/array, use it; if string, parse it
        parsedChangesDetected = typeof changesDetected === 'string' 
          ? JSON.parse(changesDetected) 
          : changesDetected;
      } catch (e) {
        return NextResponse.json({
          error: "changesDetected must be valid JSON",
          code: "INVALID_CHANGES_DETECTED_JSON"
        }, { status: 400 });
      }
    }

    if (numericChanges !== undefined && numericChanges !== null) {
      try {
        parsedNumericChanges = typeof numericChanges === 'string'
          ? JSON.parse(numericChanges)
          : numericChanges;
      } catch (e) {
        return NextResponse.json({
          error: "numericChanges must be valid JSON",
          code: "INVALID_NUMERIC_CHANGES_JSON"
        }, { status: 400 });
      }
    }

    if (textualChanges !== undefined && textualChanges !== null) {
      try {
        parsedTextualChanges = typeof textualChanges === 'string'
          ? JSON.parse(textualChanges)
          : textualChanges;
      } catch (e) {
        return NextResponse.json({
          error: "textualChanges must be valid JSON",
          code: "INVALID_TEXTUAL_CHANGES_JSON"
        }, { status: 400 });
      }
    }

    // Create new document version
    const newVersion = await db.insert(documentVersions)
      .values({
        documentId: parseInt(documentId),
        versionNumber: parseInt(versionNumber),
        changesDetected: parsedChangesDetected,
        numericChanges: parsedNumericChanges,
        textualChanges: parsedTextualChanges,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newVersion[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(documentVersions)
      .where(eq(documentVersions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Document version not found',
        code: "VERSION_NOT_FOUND"
      }, { status: 404 });
    }

    const body = await request.json();
    const { documentId, versionNumber, changesDetected, numericChanges, textualChanges } = body;

    // Build update object with only provided fields
    const updates: any = {};

    // Validate and add documentId if provided
    if (documentId !== undefined) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json({
          error: "documentId must be a valid integer",
          code: "INVALID_DOCUMENT_ID"
        }, { status: 400 });
      }

      // Verify that the referenced document exists
      const existingDocument = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(documentId)))
        .limit(1);

      if (existingDocument.length === 0) {
        return NextResponse.json({
          error: "Referenced document does not exist",
          code: "DOCUMENT_NOT_FOUND"
        }, { status: 400 });
      }

      updates.documentId = parseInt(documentId);
    }

    // Validate and add versionNumber if provided
    if (versionNumber !== undefined) {
      if (isNaN(parseInt(versionNumber))) {
        return NextResponse.json({
          error: "versionNumber must be a valid integer",
          code: "INVALID_VERSION_NUMBER"
        }, { status: 400 });
      }
      updates.versionNumber = parseInt(versionNumber);
    }

    // Validate and add JSON fields if provided
    if (changesDetected !== undefined) {
      if (changesDetected === null) {
        updates.changesDetected = null;
      } else {
        try {
          updates.changesDetected = typeof changesDetected === 'string'
            ? JSON.parse(changesDetected)
            : changesDetected;
        } catch (e) {
          return NextResponse.json({
            error: "changesDetected must be valid JSON",
            code: "INVALID_CHANGES_DETECTED_JSON"
          }, { status: 400 });
        }
      }
    }

    if (numericChanges !== undefined) {
      if (numericChanges === null) {
        updates.numericChanges = null;
      } else {
        try {
          updates.numericChanges = typeof numericChanges === 'string'
            ? JSON.parse(numericChanges)
            : numericChanges;
        } catch (e) {
          return NextResponse.json({
            error: "numericChanges must be valid JSON",
            code: "INVALID_NUMERIC_CHANGES_JSON"
          }, { status: 400 });
        }
      }
    }

    if (textualChanges !== undefined) {
      if (textualChanges === null) {
        updates.textualChanges = null;
      } else {
        try {
          updates.textualChanges = typeof textualChanges === 'string'
            ? JSON.parse(textualChanges)
            : textualChanges;
        } catch (e) {
          return NextResponse.json({
            error: "textualChanges must be valid JSON",
            code: "INVALID_TEXTUAL_CHANGES_JSON"
          }, { status: 400 });
        }
      }
    }

    // Perform update
    const updated = await db.update(documentVersions)
      .set(updates)
      .where(eq(documentVersions.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if record exists before deleting
    const existing = await db.select()
      .from(documentVersions)
      .where(eq(documentVersions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Document version not found',
        code: "VERSION_NOT_FOUND"
      }, { status: 404 });
    }

    // Delete the record
    const deleted = await db.delete(documentVersions)
      .where(eq(documentVersions.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Document version deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}