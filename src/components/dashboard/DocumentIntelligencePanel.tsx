"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, FileText, Search, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentAnalysis {
  id: number;
  documentId: number;
  documentType: string;
  confidence: number;
  entities: any;
  keyMetrics: any;
  summary: string;
  createdAt: string;
}

export const DocumentIntelligencePanel = () => {
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/document-analysis?limit=10");
      if (!response.ok) throw new Error("Failed to fetch analyses");
      
      const data = await response.json();
      setAnalyses(data);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      toast.error("Failed to load document intelligence");
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => 
    (a.documentType?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (a.summary?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Document Intelligence
        </CardTitle>
        <CardDescription>AI-powered document understanding and entity extraction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by document type or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchAnalyses} variant="outline">
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{analyses.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Analyzed</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {analyses.filter(a => a.confidence > 0.8).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">High Confidence</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(analyses.map(a => a.documentType).filter(Boolean)).size}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Doc Types</div>
          </div>
        </div>

        {/* Analysis List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No document analyses found</p>
            <p className="text-xs mt-1">Upload documents to see AI-powered insights</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="bg-white dark:bg-slate-900">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <Badge variant="outline">{analysis.documentType || "Unknown"}</Badge>
                    </div>
                    <Badge 
                      variant={analysis.confidence > 0.8 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {(analysis.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {analysis.summary || "No summary available"}
                  </p>

                  {analysis.entities && Object.keys(analysis.entities).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                        Extracted Entities:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(analysis.entities).slice(0, 5).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.keyMetrics && Object.keys(analysis.keyMetrics).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                        Key Metrics:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(analysis.keyMetrics).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                            <span className="ml-1 font-semibold">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    {new Date(analysis.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};