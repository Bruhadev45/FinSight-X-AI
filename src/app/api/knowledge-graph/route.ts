// Knowledge Graph & Memory API
import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db';
import { knowledgeGraphEntities, knowledgeGraphRelationships } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all entities and relationships from database
    const entities = await db
      .select()
      .from(knowledgeGraphEntities)
      .orderBy(desc(knowledgeGraphEntities.createdAt))
      .limit(100);

    const relationships = await db
      .select()
      .from(knowledgeGraphRelationships)
      .orderBy(desc(knowledgeGraphRelationships.createdAt))
      .limit(100);

    // Calculate entity type distribution
    const entityTypes: Record<string, number> = {};
    entities.forEach(entity => {
      entityTypes[entity.entityType] = (entityTypes[entity.entityType] || 0) + 1;
    });

    return NextResponse.json({
      entities,
      relationships,
      stats: {
        totalEntities: entities.length,
        totalRelationships: relationships.length,
        entityTypes,
      },
    });
  } catch (error) {
    console.error("Knowledge graph GET error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to retrieve knowledge graph" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, entity, relationship, sourceId, targetId, type, properties } = body;

    switch (action) {
      case "addEntity":
        if (!entity || !entity.entityId || !entity.entityType || !entity.name) {
          return NextResponse.json(
            { error: "Missing required entity fields" },
            { status: 400 }
          );
        }

        const newEntity = await db
          .insert(knowledgeGraphEntities)
          .values({
            entityId: entity.entityId,
            entityType: entity.entityType,
            name: entity.name,
            properties: JSON.stringify(entity.properties || {}),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning();

        return NextResponse.json({ success: true, entity: newEntity[0] });

      case "addRelationship":
        if (!sourceId || !targetId || !type) {
          return NextResponse.json(
            { error: "Missing required relationship fields" },
            { status: 400 }
          );
        }

        const newRelationship = await db
          .insert(knowledgeGraphRelationships)
          .values({
            relationshipId: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sourceEntityId: sourceId,
            targetEntityId: targetId,
            relationshipType: type,
            properties: JSON.stringify(properties || {}),
            createdAt: new Date().toISOString(),
          })
          .returning();

        return NextResponse.json({ success: true, relationship: newRelationship[0] });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Knowledge graph error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Knowledge graph operation failed" },
      { status: 500 }
    );
  }
}