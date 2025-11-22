import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledgeGraphRelationships } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_RELATIONSHIP_TYPES = [
  'owns',
  'transacts_with',
  'reports_to',
  'audits',
  'invests_in',
  'supplies_to',
  'competes_with'
] as const;

function generateRelationshipId(relationshipType: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `rel_${relationshipType}_${randomStr}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const relationshipId = searchParams.get('relationshipId');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(knowledgeGraphRelationships)
        .where(eq(knowledgeGraphRelationships.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Relationship not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Single record by relationshipId
    if (relationshipId) {
      const record = await db
        .select()
        .from(knowledgeGraphRelationships)
        .where(eq(knowledgeGraphRelationships.relationshipId, relationshipId))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Relationship not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const relationshipType = searchParams.get('relationshipType');
    const sourceEntityId = searchParams.get('sourceEntityId');
    const targetEntityId = searchParams.get('targetEntityId');

    const conditions = [];

    if (relationshipType) {
      conditions.push(eq(knowledgeGraphRelationships.relationshipType, relationshipType));
    }

    if (sourceEntityId) {
      conditions.push(eq(knowledgeGraphRelationships.sourceEntityId, sourceEntityId));
    }

    if (targetEntityId) {
      conditions.push(eq(knowledgeGraphRelationships.targetEntityId, targetEntityId));
    }

    const baseQuery = db.select().from(knowledgeGraphRelationships);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(knowledgeGraphRelationships.createdAt))
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceEntityId, targetEntityId, relationshipType, relationshipId, properties } = body;

    // Validate required fields
    if (!sourceEntityId) {
      return NextResponse.json(
        { error: 'sourceEntityId is required', code: 'MISSING_SOURCE_ENTITY' },
        { status: 400 }
      );
    }

    if (!targetEntityId) {
      return NextResponse.json(
        { error: 'targetEntityId is required', code: 'MISSING_TARGET_ENTITY' },
        { status: 400 }
      );
    }

    if (!relationshipType) {
      return NextResponse.json(
        { error: 'relationshipType is required', code: 'MISSING_RELATIONSHIP_TYPE' },
        { status: 400 }
      );
    }

    // Validate relationshipType
    if (!VALID_RELATIONSHIP_TYPES.includes(relationshipType as any)) {
      return NextResponse.json(
        {
          error: `Invalid relationshipType. Must be one of: ${VALID_RELATIONSHIP_TYPES.join(', ')}`,
          code: 'INVALID_RELATIONSHIP_TYPE'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedSourceEntityId = sourceEntityId.trim();
    const sanitizedTargetEntityId = targetEntityId.trim();
    const sanitizedRelationshipType = relationshipType.trim();

    // Generate relationshipId if not provided
    const finalRelationshipId = relationshipId?.trim() || generateRelationshipId(sanitizedRelationshipType);

    // Check if relationshipId already exists
    if (relationshipId) {
      const existing = await db
        .select()
        .from(knowledgeGraphRelationships)
        .where(eq(knowledgeGraphRelationships.relationshipId, finalRelationshipId))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Relationship with this relationshipId already exists', code: 'DUPLICATE_RELATIONSHIP_ID' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const newRelationship = await db
      .insert(knowledgeGraphRelationships)
      .values({
        relationshipId: finalRelationshipId,
        sourceEntityId: sanitizedSourceEntityId,
        targetEntityId: sanitizedTargetEntityId,
        relationshipType: sanitizedRelationshipType,
        properties: properties ? JSON.stringify(properties) : null,
        createdAt: now
      })
      .returning();

    return NextResponse.json(newRelationship[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { sourceEntityId, targetEntityId, relationshipType, properties } = body;

    // Check if record exists
    const existing = await db
      .select()
      .from(knowledgeGraphRelationships)
      .where(eq(knowledgeGraphRelationships.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Relationship not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate relationshipType if provided
    if (relationshipType && !VALID_RELATIONSHIP_TYPES.includes(relationshipType as any)) {
      return NextResponse.json(
        {
          error: `Invalid relationshipType. Must be one of: ${VALID_RELATIONSHIP_TYPES.join(', ')}`,
          code: 'INVALID_RELATIONSHIP_TYPE'
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (sourceEntityId !== undefined) {
      updates.sourceEntityId = sourceEntityId.trim();
    }

    if (targetEntityId !== undefined) {
      updates.targetEntityId = targetEntityId.trim();
    }

    if (relationshipType !== undefined) {
      updates.relationshipType = relationshipType.trim();
    }

    if (properties !== undefined) {
      updates.properties = properties ? JSON.stringify(properties) : null;
    }

    // Only proceed if there are fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(knowledgeGraphRelationships)
      .set(updates)
      .where(eq(knowledgeGraphRelationships.id, parseInt(id)))
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
      .from(knowledgeGraphRelationships)
      .where(eq(knowledgeGraphRelationships.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Relationship not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(knowledgeGraphRelationships)
      .where(eq(knowledgeGraphRelationships.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Relationship deleted successfully',
        relationship: deleted[0]
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