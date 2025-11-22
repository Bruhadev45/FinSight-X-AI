import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { searchQueries } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const query = await db.select()
        .from(searchQueries)
        .where(eq(searchQueries.id, parseInt(id)))
        .limit(1);

      if (query.length === 0) {
        return NextResponse.json({ 
          error: 'Search query not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(query[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('userId');

    const baseQuery = db.select().from(searchQueries);

    // Order by executedAt DESC to show recent searches first
    const results = await (userId
      ? baseQuery.where(eq(searchQueries.userId, userId))
      : baseQuery)
      .orderBy(desc(searchQueries.executedAt))
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
    const { queryText, resultsCount, userId, relevantDocuments } = body;

    // Validate required fields
    if (!queryText || queryText.trim() === '') {
      return NextResponse.json({ 
        error: "queryText is required",
        code: "MISSING_QUERY_TEXT" 
      }, { status: 400 });
    }

    if (resultsCount === undefined || resultsCount === null) {
      return NextResponse.json({ 
        error: "resultsCount is required",
        code: "MISSING_RESULTS_COUNT" 
      }, { status: 400 });
    }

    if (typeof resultsCount !== 'number' || isNaN(resultsCount)) {
      return NextResponse.json({ 
        error: "resultsCount must be a valid number",
        code: "INVALID_RESULTS_COUNT" 
      }, { status: 400 });
    }

    // Validate relevantDocuments if provided
    if (relevantDocuments !== undefined && relevantDocuments !== null) {
      if (!Array.isArray(relevantDocuments)) {
        return NextResponse.json({ 
          error: "relevantDocuments must be an array",
          code: "INVALID_RELEVANT_DOCUMENTS" 
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const insertData: any = {
      queryText: queryText.trim(),
      resultsCount: parseInt(resultsCount.toString()),
      executedAt: new Date().toISOString(),
    };

    // Add optional fields
    if (userId) {
      insertData.userId = userId.trim();
    }

    if (relevantDocuments !== undefined && relevantDocuments !== null) {
      insertData.relevantDocuments = relevantDocuments;
    }

    const newQuery = await db.insert(searchQueries)
      .values(insertData)
      .returning();

    return NextResponse.json(newQuery[0], { status: 201 });
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(searchQueries)
      .where(eq(searchQueries.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Search query not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { queryText, resultsCount, userId, relevantDocuments } = body;

    // Validate fields if provided
    if (queryText !== undefined && (typeof queryText !== 'string' || queryText.trim() === '')) {
      return NextResponse.json({ 
        error: "queryText must be a non-empty string",
        code: "INVALID_QUERY_TEXT" 
      }, { status: 400 });
    }

    if (resultsCount !== undefined && (typeof resultsCount !== 'number' || isNaN(resultsCount))) {
      return NextResponse.json({ 
        error: "resultsCount must be a valid number",
        code: "INVALID_RESULTS_COUNT" 
      }, { status: 400 });
    }

    if (relevantDocuments !== undefined && relevantDocuments !== null && !Array.isArray(relevantDocuments)) {
      return NextResponse.json({ 
        error: "relevantDocuments must be an array",
        code: "INVALID_RELEVANT_DOCUMENTS" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};

    if (queryText !== undefined) {
      updateData.queryText = queryText.trim();
    }

    if (resultsCount !== undefined) {
      updateData.resultsCount = parseInt(resultsCount.toString());
    }

    if (userId !== undefined) {
      updateData.userId = userId ? userId.trim() : null;
    }

    if (relevantDocuments !== undefined) {
      updateData.relevantDocuments = relevantDocuments;
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await db.update(searchQueries)
      .set(updateData)
      .where(eq(searchQueries.id, parseInt(id)))
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(searchQueries)
      .where(eq(searchQueries.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Search query not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(searchQueries)
      .where(eq(searchQueries.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Search query deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}