// Knowledge Graph & Memory (Simplified In-Memory Implementation)
// For production, integrate with Neo4j or ArangoDB

export interface Entity {
  id: string;
  type: "company" | "person" | "transaction" | "account" | "metric";
  name: string;
  properties: Record<string, any>;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export class KnowledgeGraphService {
  private entities: Map<string, Entity> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private temporalMemory: Map<string, Array<{ timestamp: Date; value: any }>> = new Map();

  addEntity(entity: Omit<Entity, "id">): Entity {
    const fullEntity: Entity = {
      id: crypto.randomUUID(),
      ...entity,
    };
    this.entities.set(fullEntity.id, fullEntity);
    return fullEntity;
  }

  addRelationship(
    sourceId: string,
    targetId: string,
    type: string,
    properties: Record<string, any> = {}
  ): Relationship {
    const relationship: Relationship = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
      type,
      properties,
      timestamp: new Date(),
    };
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  findEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  findEntitiesByType(type: Entity["type"]): Entity[] {
    return Array.from(this.entities.values()).filter((e) => e.type === type);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getAllRelationships(): Array<{ from: string; to: string; type: string; properties: any }> {
    return Array.from(this.relationships.values()).map(rel => ({
      from: rel.source,
      to: rel.target,
      type: rel.type,
      properties: rel.properties,
    }));
  }

  findRelationships(entityId: string, direction: "outgoing" | "incoming" | "both" = "both"): Relationship[] {
    const rels = Array.from(this.relationships.values());

    if (direction === "outgoing") {
      return rels.filter((r) => r.source === entityId);
    } else if (direction === "incoming") {
      return rels.filter((r) => r.target === entityId);
    } else {
      return rels.filter((r) => r.source === entityId || r.target === entityId);
    }
  }

  // Detect related-party transactions
  detectRelatedPartyTransactions(): Array<{
    transaction: Entity;
    parties: Entity[];
    relationshipPath: string[];
  }> {
    const results: Array<{
      transaction: Entity;
      parties: Entity[];
      relationshipPath: string[];
    }> = [];

    const transactions = this.findEntitiesByType("transaction");
    const companies = this.findEntitiesByType("company");
    const persons = this.findEntitiesByType("person");

    for (const txn of transactions) {
      const relatedParties: Entity[] = [];
      const path: string[] = [];

      // Find connections
      const rels = this.findRelationships(txn.id, "both");
      for (const rel of rels) {
        const otherEntity =
          rel.source === txn.id
            ? this.findEntity(rel.target)
            : this.findEntity(rel.source);

        if (otherEntity && (otherEntity.type === "company" || otherEntity.type === "person")) {
          relatedParties.push(otherEntity);
          path.push(`${txn.name} -[${rel.type}]-> ${otherEntity.name}`);
        }
      }

      if (relatedParties.length > 1) {
        results.push({
          transaction: txn,
          parties: relatedParties,
          relationshipPath: path,
        });
      }
    }

    return results;
  }

  // Temporal tracking for metrics
  trackMetricOverTime(metricName: string, value: any): void {
    if (!this.temporalMemory.has(metricName)) {
      this.temporalMemory.set(metricName, []);
    }

    this.temporalMemory.get(metricName)!.push({
      timestamp: new Date(),
      value,
    });
  }

  getMetricHistory(metricName: string, fromDate?: Date): Array<{ timestamp: Date; value: any }> {
    const history = this.temporalMemory.get(metricName) || [];

    if (fromDate) {
      return history.filter((h) => h.timestamp >= fromDate);
    }

    return history;
  }

  // Find entity connections (up to 3 degrees of separation)
  findConnectionPath(sourceId: string, targetId: string, maxDepth: number = 3): string[] | null {
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.id === targetId) {
        return current.path;
      }

      if (current.path.length >= maxDepth) {
        continue;
      }

      if (visited.has(current.id)) {
        continue;
      }

      visited.add(current.id);

      const rels = this.findRelationships(current.id, "outgoing");
      for (const rel of rels) {
        if (!visited.has(rel.target)) {
          queue.push({
            id: rel.target,
            path: [...current.path, rel.target],
          });
        }
      }
    }

    return null;
  }

  // Build entity graph for a company
  buildCompanyGraph(companyId: string): { entities: Entity[]; relationships: Relationship[] } {
    const relatedEntities: Entity[] = [];
    const relatedRelationships: Relationship[] = [];
    const visited = new Set<string>();

    const traverse = (entityId: string, depth: number) => {
      if (depth > 2 || visited.has(entityId)) return;

      visited.add(entityId);
      const entity = this.findEntity(entityId);
      if (entity) {
        relatedEntities.push(entity);
      }

      const rels = this.findRelationships(entityId, "both");
      for (const rel of rels) {
        relatedRelationships.push(rel);
        const nextId = rel.source === entityId ? rel.target : rel.source;
        traverse(nextId, depth + 1);
      }
    };

    traverse(companyId, 0);

    return { entities: relatedEntities, relationships: relatedRelationships };
  }

  // Clear all data (for testing)
  clear(): void {
    this.entities.clear();
    this.relationships.clear();
    this.temporalMemory.clear();
  }
}

export const knowledgeGraph = new KnowledgeGraphService();