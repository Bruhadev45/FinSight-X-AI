"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  id: number;
  fileName: string;
  fileType: string;
  summary: string;
  riskLevel: string;
  uploadDate: string;
  relevanceScore: number;
}

export const SemanticSearchPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      
      // Search documents based on query
      const response = await fetch(`/api/documents?search=${encodeURIComponent(query)}&limit=10`);

      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      
      // Transform documents to search results format
      const searchResults: SearchResult[] = (data.documents || []).map((doc: any) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        summary: doc.summary || "No summary available",
        riskLevel: doc.riskLevel || "unknown",
        uploadDate: doc.uploadDate,
        relevanceScore: 0.85 // Mock relevance score
      }));
      
      setResults(searchResults);
      
      // Log search query
      await fetch("/api/search-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryText: query,
          resultsCount: searchResults.length,
          relevantDocuments: searchResults.map(r => r.id),
        }),
      }).catch(console.error);
      
      if (searchResults.length === 0) {
        toast.info("No results found for your query");
      } else {
        toast.success(`Found ${searchResults.length} relevant documents`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Semantic Financial Search
        </CardTitle>
        <CardDescription>
          AI-powered contextual search across all financial documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search financial documents, metrics, or companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading || !query.trim()}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {/* Example Queries */}
        {!searchPerformed && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
              Try searching for:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "high risk documents",
                "Q4 financial reports",
                "compliance status",
                "revenue metrics",
              ].map((example) => (
                <Badge
                  key={example}
                  variant="secondary"
                  className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : searchPerformed && results.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No results found</p>
            <p className="text-xs mt-1">Try a different query or upload more documents</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {results.map((result) => (
              <Card key={result.id} className="bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{result.fileName}</h4>
                        <p className="text-xs text-gray-500">{result.fileType} • {new Date(result.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.relevanceScore * 100)}% match
                      </Badge>
                      <Badge variant={getRiskColor(result.riskLevel)}>
                        {result.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};