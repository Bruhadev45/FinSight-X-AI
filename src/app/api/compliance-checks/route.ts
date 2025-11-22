import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complianceChecks } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

const VALID_STANDARD_TYPES = ['IFRS', 'SEBI', 'ESG', 'SOX'];
const VALID_RESULTS = ['pass', 'warning', 'fail'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(complianceChecks)
        .where(eq(complianceChecks.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Compliance check not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const documentId = searchParams.get('documentId');
    const standardType = searchParams.get('standardType');
    const result = searchParams.get('result');
    const sortBy = searchParams.get('sort') ?? 'checkedAt';
    const order = searchParams.get('order') ?? 'desc';

    // Build filter conditions
    const conditions = [];

    if (documentId) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json({
          error: "Valid documentId is required",
          code: "INVALID_DOCUMENT_ID"
        }, { status: 400 });
      }
      conditions.push(eq(complianceChecks.documentId, parseInt(documentId)));
    }

    if (standardType) {
      if (!VALID_STANDARD_TYPES.includes(standardType)) {
        return NextResponse.json({
          error: `Invalid standardType. Must be one of: ${VALID_STANDARD_TYPES.join(', ')}`,
          code: "INVALID_STANDARD_TYPE"
        }, { status: 400 });
      }
      conditions.push(eq(complianceChecks.standardType, standardType));
    }

    if (result) {
      if (!VALID_RESULTS.includes(result)) {
        return NextResponse.json({
          error: `Invalid result. Must be one of: ${VALID_RESULTS.join(', ')}`,
          code: "INVALID_RESULT"
        }, { status: 400 });
      }
      conditions.push(eq(complianceChecks.result, result));
    }

    // Apply sorting
    const orderFn = order === 'asc' ? asc : desc;
    const sortColumn = sortBy === 'checkedAt' ? complianceChecks.checkedAt :
                       sortBy === 'id' ? complianceChecks.id :
                       sortBy === 'standardType' ? complianceChecks.standardType :
                       sortBy === 'result' ? complianceChecks.result :
                       complianceChecks.checkedAt;

    const baseQuery = db.select().from(complianceChecks);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(orderFn(sortColumn))
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
    const { documentId, standardType, checkName, result, details, recommendation } = body;

    // Validate required fields
    if (!documentId) {
      return NextResponse.json({ 
        error: "documentId is required",
        code: "MISSING_DOCUMENT_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(documentId))) {
      return NextResponse.json({ 
        error: "documentId must be a valid integer",
        code: "INVALID_DOCUMENT_ID" 
      }, { status: 400 });
    }

    if (!standardType) {
      return NextResponse.json({ 
        error: "standardType is required",
        code: "MISSING_STANDARD_TYPE" 
      }, { status: 400 });
    }

    if (!VALID_STANDARD_TYPES.includes(standardType)) {
      return NextResponse.json({ 
        error: `Invalid standardType. Must be one of: ${VALID_STANDARD_TYPES.join(', ')}`,
        code: "INVALID_STANDARD_TYPE" 
      }, { status: 400 });
    }

    if (!checkName || typeof checkName !== 'string' || checkName.trim() === '') {
      return NextResponse.json({ 
        error: "checkName is required and must be a non-empty string",
        code: "MISSING_CHECK_NAME" 
      }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ 
        error: "result is required",
        code: "MISSING_RESULT" 
      }, { status: 400 });
    }

    if (!VALID_RESULTS.includes(result)) {
      return NextResponse.json({ 
        error: `Invalid result. Must be one of: ${VALID_RESULTS.join(', ')}`,
        code: "INVALID_RESULT" 
      }, { status: 400 });
    }

    // Prepare insert data with auto-generated timestamp
    const insertData = {
      documentId: parseInt(documentId),
      standardType: standardType.trim(),
      checkName: checkName.trim(),
      result: result.trim(),
      details: details ? details.trim() : null,
      recommendation: recommendation ? recommendation.trim() : null,
      checkedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(complianceChecks)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(complianceChecks)
      .where(eq(complianceChecks.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Compliance check not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { documentId, standardType, checkName, result, details, recommendation } = body;

    // Prepare update data
    const updates: any = {};

    if (documentId !== undefined) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json({ 
          error: "documentId must be a valid integer",
          code: "INVALID_DOCUMENT_ID" 
        }, { status: 400 });
      }
      updates.documentId = parseInt(documentId);
    }

    if (standardType !== undefined) {
      if (!VALID_STANDARD_TYPES.includes(standardType)) {
        return NextResponse.json({ 
          error: `Invalid standardType. Must be one of: ${VALID_STANDARD_TYPES.join(', ')}`,
          code: "INVALID_STANDARD_TYPE" 
        }, { status: 400 });
      }
      updates.standardType = standardType.trim();
    }

    if (checkName !== undefined) {
      if (typeof checkName !== 'string' || checkName.trim() === '') {
        return NextResponse.json({ 
          error: "checkName must be a non-empty string",
          code: "INVALID_CHECK_NAME" 
        }, { status: 400 });
      }
      updates.checkName = checkName.trim();
    }

    if (result !== undefined) {
      if (!VALID_RESULTS.includes(result)) {
        return NextResponse.json({ 
          error: `Invalid result. Must be one of: ${VALID_RESULTS.join(', ')}`,
          code: "INVALID_RESULT" 
        }, { status: 400 });
      }
      updates.result = result.trim();
    }

    if (details !== undefined) {
      updates.details = details ? details.trim() : null;
    }

    if (recommendation !== undefined) {
      updates.recommendation = recommendation ? recommendation.trim() : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await db.update(complianceChecks)
      .set(updates)
      .where(eq(complianceChecks.id, parseInt(id)))
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(complianceChecks)
      .where(eq(complianceChecks.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Compliance check not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(complianceChecks)
      .where(eq(complianceChecks.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Compliance check deleted successfully',
      data: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}