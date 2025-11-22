"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  ExternalLink,
  Lightbulb,
  MapPin,
  TrendingUp,
  Shield,
  AlertCircle,
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface Citation {
  id: string;
  document: string;
  page: number;
  lineNumber?: number;
  excerpt: string;
  confidence: number;
  type: "data" | "claim" | "analysis" | "reference";
}

interface AIInsight {
  id: string;
  insight: string;
  category: "financial" | "risk" | "compliance" | "fraud";
  confidence: number;
  citations: Citation[];
  reasoning?: string;
}

export function CitationTracker() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Mock data - would come from API
  const insights: AIInsight[] = [
    {
      id: "1",
      insight: "Revenue increased 25% YoY from $8M to $10M",
      category: "financial",
      confidence: 95,
      citations: [
        {
          id: "c1",
          document: "Q4_2024_Report.pdf",
          page: 3,
          lineNumber: 42,
          excerpt: "Revenue grew from $8M to $10M, a 25% increase compared to the previous year.",
          confidence: 95,
          type: "data",
        },
        {
          id: "c2",
          document: "Annual_Summary.pdf",
          page: 12,
          excerpt: "Year-over-year revenue growth of 25% demonstrates strong market position.",
          confidence: 88,
          type: "claim",
        },
      ],
      reasoning: "Found explicit revenue figures in financial statements with supporting analysis in annual summary.",
    },
    {
      id: "2",
      insight: "Debt-to-Equity ratio of 0.45 is within healthy range",
      category: "risk",
      confidence: 92,
      citations: [
        {
          id: "c3",
          document: "Balance_Sheet_Q4.pdf",
          page: 5,
          lineNumber: 18,
          excerpt: "Total debt: $4.5M, Total equity: $10M, D/E ratio: 0.45",
          confidence: 98,
          type: "data",
        },
      ],
      reasoning: "Industry standard D/E ratio for tech companies is below 0.5. This company's ratio indicates low financial risk.",
    },
    {
      id: "3",
      insight: "All IFRS and GAAP compliance requirements met",
      category: "compliance",
      confidence: 88,
      citations: [
        {
          id: "c4",
          document: "Audit_Report_2024.pdf",
          page: 2,
          excerpt: "The financial statements comply with International Financial Reporting Standards (IFRS) and Generally Accepted Accounting Principles (GAAP).",
          confidence: 92,
          type: "claim",
        },
        {
          id: "c5",
          document: "Compliance_Checklist.pdf",
          page: 1,
          excerpt: "All 23 IFRS requirements verified and documented.",
          confidence: 85,
          type: "reference",
        },
      ],
      reasoning: "Independent audit confirms compliance with international accounting standards. All required disclosures present.",
    },
    {
      id: "4",
      insight: "No fraud indicators detected in financial statements",
      category: "fraud",
      confidence: 85,
      citations: [
        {
          id: "c6",
          document: "Fraud_Analysis_Report.pdf",
          page: 7,
          excerpt: "Analysis of 156 transactions revealed no unusual patterns, duplicate entries, or suspicious round-number bias.",
          confidence: 87,
          type: "analysis",
        },
      ],
      reasoning: "Comprehensive fraud detection analysis using AI pattern recognition found no red flags across all transaction categories.",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "risk":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "compliance":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "fraud":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return TrendingUp;
      case "risk":
        return AlertCircle;
      case "compliance":
        return Shield;
      case "fraud":
        return Shield;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "data":
        return "📊 Data";
      case "claim":
        return "💬 Claim";
      case "analysis":
        return "🔍 Analysis";
      case "reference":
        return "📖 Reference";
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Insights with Citations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Every AI insight includes clickable citations to source documents
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getCategoryIcon(insight.category);
              const isExpanded = selectedInsight === insight.id;

              return (
                <Card
                  key={insight.id}
                  className={`border-2 transition-all ${
                    isExpanded
                      ? "border-blue-500 shadow-lg"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Insight Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(
                          insight.category
                        )}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="secondary"
                            className={getCategoryColor(insight.category)}
                          >
                            {insight.category.toUpperCase()}
                          </Badge>
                          <HoverCard>
                            <HoverCardTrigger>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Confidence: {insight.confidence}%</span>
                                <Progress
                                  value={insight.confidence}
                                  className="w-16 h-2"
                                />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Confidence Score</h4>
                                <p className="text-xs text-muted-foreground">
                                  Based on {insight.citations.length} source(s) with
                                  average confidence of{" "}
                                  {Math.round(
                                    insight.citations.reduce(
                                      (acc, c) => acc + c.confidence,
                                      0
                                    ) / insight.citations.length
                                  )}
                                  %
                                </p>
                                <Progress value={insight.confidence} className="h-1" />
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                        <p className="text-base font-semibold mb-2">
                          {insight.insight}
                        </p>

                        {/* Citations Preview */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{insight.citations.length} source(s)</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-blue-600"
                            onClick={() =>
                              setSelectedInsight(
                                isExpanded ? null : insight.id
                              )
                            }
                          >
                            {isExpanded ? "Hide sources" : "View sources"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Citations */}
                    {isExpanded && (
                      <>
                        <Separator className="my-3" />

                        {/* AI Reasoning */}
                        {insight.reasoning && (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Why AI believes this:
                              </span>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200 ml-6">
                              {insight.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Citations */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Sources ({insight.citations.length})
                          </h4>
                          {insight.citations.map((citation, index) => (
                            <Card
                              key={citation.id}
                              className="bg-gray-50 dark:bg-gray-900 border-l-4 border-l-blue-500"
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">
                                      {citation.document}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {getTypeLabel(citation.type)}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-3">
                                  <span>Page {citation.page}</span>
                                  {citation.lineNumber && (
                                    <>
                                      <span>•</span>
                                      <span>Line {citation.lineNumber}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span>
                                    Confidence: {citation.confidence}%
                                  </span>
                                </div>

                                <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                  <p className="text-sm italic text-gray-700 dark:text-gray-300">
                                    "{citation.excerpt}"
                                  </p>
                                </div>

                                <div className="mt-2 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Jump to source
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    View document
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
