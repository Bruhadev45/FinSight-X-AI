"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Save,
  Bell,
  Star,
  FileText,
  Building2,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  type: "document" | "insight" | "entity";
  title: string;
  excerpt: string;
  document: string;
  page?: number;
  relevance: number;
  date: string;
  tags: string[];
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches] = useState<SavedSearch[]>([
    {
      id: "1",
      name: "High Revenue Growth",
      query: "revenue growth > 20%",
      filters: { dateRange: "last-quarter" },
    },
    {
      id: "2",
      name: "Compliance Issues",
      query: "compliance violations",
      filters: { type: "all", confidence: "70" },
    },
  ]);

  // Filters
  const [dateRange, setDateRange] = useState("all");
  const [documentType, setDocumentType] = useState("all");
  const [company, setCompany] = useState("all");
  const [confidence, setConfidence] = useState("0");
  const [sortBy, setSortBy] = useState("relevance");

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "document",
      title: "Q4_2024_Financial_Report.pdf",
      excerpt: "Revenue grew from $8M to $10M, a 25% increase compared to previous year...",
      document: "Q4_2024_Financial_Report.pdf",
      page: 3,
      relevance: 98,
      date: "2024-12-31",
      tags: ["revenue", "growth", "Q4"],
    },
    {
      id: "2",
      type: "insight",
      title: "Revenue increased 25% YoY",
      excerpt: "Analysis shows consistent revenue growth across all quarters with strong market position...",
      document: "Annual_Summary.pdf",
      page: 12,
      relevance: 95,
      date: "2024-12-31",
      tags: ["revenue", "annual", "analysis"],
    },
    {
      id: "3",
      type: "entity",
      title: "TechCorp Inc. - Revenue Metrics",
      excerpt: "Company revenue reached $10M in Q4 2024, representing 25% year-over-year growth...",
      document: "Market_Analysis.pdf",
      page: 5,
      relevance: 92,
      date: "2024-12-15",
      tags: ["company", "revenue", "metrics"],
    },
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setResults(mockResults);
    setIsSearching(false);
    toast.success(`Found ${mockResults.length} results`);
  };

  const saveSearch = () => {
    toast.success("Search saved successfully");
  };

  const createAlert = () => {
    toast.success("Alert created for new results");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return FileText;
      case "insight":
        return TrendingUp;
      case "entity":
        return Building2;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "insight":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "entity":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Natural language search across all documents with intelligent filters
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder='Search for "revenue growth Q4" or "compliance issues"...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !query}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Saved Searches</div>
            <div className="flex gap-2 flex-wrap">
              {savedSearches.map((saved) => (
                <Button
                  key={saved.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(saved.query);
                    handleSearch();
                  }}
                  className="gap-2"
                >
                  <Star className="h-3 w-3 fill-current" />
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange("all");
                  setDocumentType("all");
                  setCompany("all");
                  setConfidence("0");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="last-month">Last month</SelectItem>
                    <SelectItem value="last-quarter">Last quarter</SelectItem>
                    <SelectItem value="last-6-months">Last 6 months</SelectItem>
                    <SelectItem value="last-year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Document Type</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="financial">Financial Reports</SelectItem>
                    <SelectItem value="audit">Audit Reports</SelectItem>
                    <SelectItem value="tax">Tax Documents</SelectItem>
                    <SelectItem value="compliance">Compliance Docs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Company</label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    <SelectItem value="techcorp">TechCorp Inc.</SelectItem>
                    <SelectItem value="startupxyz">StartupXYZ</SelectItem>
                    <SelectItem value="innovateai">InnovateAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">
                  Min Confidence: {confidence}%
                </label>
                <Select value={confidence} onValueChange={setConfidence}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any (0%)</SelectItem>
                    <SelectItem value="50">Medium (50%)</SelectItem>
                    <SelectItem value="70">High (70%)</SelectItem>
                    <SelectItem value="90">Very High (90%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="confidence">Sort by Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Results: {results.length} documents, {results.length * 3} mentions
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveSearch}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Search
                </Button>
                <Button variant="outline" size="sm" onClick={createAlert}>
                  <Bell className="h-4 w-4 mr-1" />
                  Alert on New Results
                </Button>
              </div>
            </div>

            <Separator />

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {results.map((result) => {
                  const Icon = getTypeIcon(result.type);
                  return (
                    <Card
                      key={result.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(
                              result.type
                            )}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{result.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {result.excerpt}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium text-blue-600">
                                    {result.relevance}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    relevance
                                  </div>
                                </div>
                                <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {result.document}
                              </div>
                              {result.page && (
                                <>
                                  <span>•</span>
                                  <span>Page {result.page}</span>
                                </>
                              )}
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(result.date).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex gap-1 flex-wrap">
                              {result.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !isSearching && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Search across all your documents with natural language</p>
            <p className="text-sm">Try: "revenue growth Q4" or "compliance issues"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
