"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Building2, FileText, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GraphEntity {
  id: number;
  entityId: string;
  entityType: string;
  name: string;
  properties: any;
}

interface GraphRelationship {
  id: number;
  relationshipId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  properties: any;
}

interface GraphData {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  stats: {
    totalEntities: number;
    totalRelationships: number;
    entityTypes: Record<string, number>;
  };
}

export const KnowledgeGraphPanel = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/knowledge-graph");
      if (!response.ok) throw new Error("Failed to fetch knowledge graph");
      
      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error("Error fetching graph:", error);
      toast.error("Failed to load knowledge graph");
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "company": return <Building2 className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      case "metric": return <TrendingUp className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "company": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "document": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "metric": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  return (
    <Card className="border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-cyan-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Knowledge Graph
        </CardTitle>
        <CardDescription>
          Financial entity relationships and temporal intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        ) : !graphData || graphData.entities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No graph data available</p>
            <p className="text-xs mt-1">Graph will populate as you upload documents</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
                <div className="text-2xl font-bold text-cyan-600">
                  {graphData.stats.totalEntities}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Entities</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {graphData.stats.totalRelationships}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Relationships</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(graphData.stats.entityTypes).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Types</div>
              </div>
            </div>

            {/* Entity Type Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-3">Entity Distribution</h4>
              <div className="space-y-2">
                {Object.entries(graphData.stats.entityTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEntityIcon(type)}
                      <span className="text-sm capitalize">{type}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Entities List */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Entities</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {graphData.entities.slice(0, 20).map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedEntity(entity)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEntity?.id === entity.id
                        ? "bg-cyan-50 dark:bg-cyan-950 border-cyan-300 dark:border-cyan-700"
                        : "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(entity.entityType)}
                        <span className="font-semibold text-sm">{entity.name}</span>
                      </div>
                      <Badge className={getEntityColor(entity.entityType)}>
                        {entity.entityType}
                      </Badge>
                    </div>
                    {entity.properties && Object.keys(entity.properties).length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {Object.entries(entity.properties).slice(0, 2).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Entity Details */}
            {selectedEntity && (
              <Card className="bg-cyan-50 dark:bg-cyan-950 border-cyan-300 dark:border-cyan-700">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Entity Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="ml-2 font-medium">{selectedEntity.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <Badge className="ml-2">{selectedEntity.entityType}</Badge>
                    </div>
                    {selectedEntity.properties && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Properties:</span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(selectedEntity.properties).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                              <span className="ml-1 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Related Relationships */}
                  <div className="mt-3">
                    <h5 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                      Relationships:
                    </h5>
                    <div className="space-y-1">
                      {graphData.relationships
                        .filter(r => r.sourceEntityId === selectedEntity.entityId || r.targetEntityId === selectedEntity.entityId)
                        .slice(0, 5)
                        .map((rel) => (
                          <div key={rel.id} className="text-xs p-2 bg-white dark:bg-slate-900 rounded">
                            {rel.sourceEntityId} → <Badge variant="outline" className="mx-1">{rel.relationshipType}</Badge> → {rel.targetEntityId}
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Button onClick={fetchGraphData} variant="outline" className="w-full">
          Refresh Graph
        </Button>
      </CardContent>
    </Card>
  );
};