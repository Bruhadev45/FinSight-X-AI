import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledgeGraphEntities } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_ENTITY_TYPES = ['company', 'person', 'account', 'transaction', 'subsidiary'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];

function generateEntityId(entityType: string, name: string): string {
  const slugified = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `${entityType}_${slugified}_${random}`;
}

function isValidEntityType(type: string): type is EntityType {
  return VALID_ENTITY_TYPES.includes(type as EntityType);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const entityId = searchParams.get('entityId');

    if (id) {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const entity = await db
        .select()
        .from(knowledgeGraphEntities)
        .where(eq(knowledgeGraphEntities.id, parsedId))
        .limit(1);

      if (entity.length === 0) {
        return NextResponse.json(
          { error: 'Entity not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(entity[0], { status: 200 });
    }

    if (entityId) {
      const entity = await db
        .select()
        .from(knowledgeGraphEntities)
        .where(eq(knowledgeGraphEntities.entityId, entityId))
        .limit(1);

      if (entity.length === 0) {
        return NextResponse.json(
          { error: 'Entity not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(entity[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const entityType = searchParams.get('entityType');

    const conditions = [];

    if (search) {
      conditions.push(like(knowledgeGraphEntities.name, `%${search}%`));
    }

    if (entityType) {
      if (!isValidEntityType(entityType)) {
        return NextResponse.json(
          {
            error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
            code: 'INVALID_ENTITY_TYPE'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(knowledgeGraphEntities.entityType, entityType));
    }

    const baseQuery = db.select().from(knowledgeGraphEntities);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(knowledgeGraphEntities.createdAt))
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
    const { entityType, name, entityId, properties } = body;

    if (!entityType) {
      return NextResponse.json(
        { error: 'entityType is required', code: 'MISSING_ENTITY_TYPE' },
        { status: 400 }
      );
    }

    if (!isValidEntityType(entityType)) {
      return NextResponse.json(
        { 
          error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          code: 'INVALID_ENTITY_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const finalEntityId = entityId?.trim() || generateEntityId(entityType, trimmedName);

    const existingEntity = await db
      .select()
      .from(knowledgeGraphEntities)
      .where(eq(knowledgeGraphEntities.entityId, finalEntityId))
      .limit(1);

    if (existingEntity.length > 0) {
      return NextResponse.json(
        { 
          error: 'An entity with this entityId already exists',
          code: 'DUPLICATE_ENTITY_ID' 
        },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    const newEntity = await db
      .insert(knowledgeGraphEntities)
      .values({
        entityId: finalEntityId,
        entityType,
        name: trimmedName,
        properties: properties || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    return NextResponse.json(newEntity[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    const existing = await db
      .select()
      .from(knowledgeGraphEntities)
      .where(eq(knowledgeGraphEntities.id, parsedId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Entity not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { entityType, name, entityId, properties } = body;

    if (entityType !== undefined && !isValidEntityType(entityType)) {
      return NextResponse.json(
        { 
          error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          code: 'INVALID_ENTITY_TYPE' 
        },
        { status: 400 }
      );
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'name must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (entityId !== undefined && entityId !== existing[0].entityId) {
      const existingEntityId = await db
        .select()
        .from(knowledgeGraphEntities)
        .where(eq(knowledgeGraphEntities.entityId, entityId))
        .limit(1);

      if (existingEntityId.length > 0) {
        return NextResponse.json(
          { 
            error: 'An entity with this entityId already exists',
            code: 'DUPLICATE_ENTITY_ID' 
          },
          { status: 400 }
        );
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (entityType !== undefined) updates.entityType = entityType;
    if (name !== undefined) updates.name = name.trim();
    if (entityId !== undefined) updates.entityId = entityId.trim();
    if (properties !== undefined) updates.properties = properties;

    const updated = await db
      .update(knowledgeGraphEntities)
      .set(updates)
      .where(eq(knowledgeGraphEntities.id, parsedId))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    const existing = await db
      .select()
      .from(knowledgeGraphEntities)
      .where(eq(knowledgeGraphEntities.id, parsedId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Entity not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(knowledgeGraphEntities)
      .where(eq(knowledgeGraphEntities.id, parsedId))
      .returning();

    return NextResponse.json(
      {
        message: 'Entity deleted successfully',
        entity: deleted[0],
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