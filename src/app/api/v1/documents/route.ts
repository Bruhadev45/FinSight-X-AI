import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey, hasPermission } from '@/middleware/apiAuth';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/v1/documents - Public API to list documents
export async function GET(request: NextRequest) {
  try {
    // Authenticate API key
    const apiContext = await authenticateApiKey(request);

    if (!apiContext) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Check permission
    if (!hasPermission(apiContext, 'documents:read')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get documents for this organization
    // TODO: Add organizationId to documents table, for now filter by userId
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, apiContext.userId))
      .limit(Math.min(limit, 100))
      .offset(offset);

    return NextResponse.json({
      data: docs,
      meta: {
        limit,
        offset,
        count: docs.length,
      },
    });
  } catch (error) {
    console.error('API v1 documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/documents - Public API to create document
export async function POST(request: NextRequest) {
  try {
    const apiContext = await authenticateApiKey(request);

    if (!apiContext) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    if (!hasPermission(apiContext, 'documents:write')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    // TODO: Implement document creation via API

    return NextResponse.json({
      data: {
        message: 'Document upload via API - Coming soon',
      },
    });
  } catch (error) {
    console.error('API v1 create document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
