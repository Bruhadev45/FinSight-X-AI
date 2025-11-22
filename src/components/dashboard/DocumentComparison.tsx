"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitCompare,
  FileText,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Download,
} from "lucide-react";

interface DocumentChange {
  type: "added" | "removed" | "modified" | "unchanged";
  section: string;
  before?: string;
  after?: string;
  significance: "high" | "medium" | "low";
}

interface MetricChange {
  metric: string;
  before: string;
  after: string;
  change: number;
  trend: "up" | "down" | "neutral";
}

export function DocumentComparison() {
  const [document1, setDocument1] = useState("Q3_2024_Report.pdf");
  const [document2, setDocument2] = useState("Q4_2024_Report.pdf");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");

  // Mock comparison data
  const changes: DocumentChange[] = [
    {
      type: "modified",
      section: "Revenue",
      before: "$8M",
      after: "$10M",
      significance: "high",
    },
    {
      type: "modified",
      section: "Profit Margin",
      before: "22%",
      after: "25%",
      significance: "high",
    },
    {
      type: "modified",
      section: "Employee Count",
      before: "150",
      after: "175",
      significance: "medium",
    },
    {
      type: "added",
      section: "New Product Line",
      after: "AI Analytics Platform launched in Q4",
      significance: "high",
    },
    {
      type: "removed",
      section: "Legacy Service",
      before: "Deprecated consulting service discontinued",
      significance: "low",
    },
    {
      type: "modified",
      section: "Debt Ratio",
      before: "0.50",
      after: "0.45",
      significance: "medium",
    },
  ];

  const metricChanges: MetricChange[] = [
    {
      metric: "Revenue",
      before: "$8M",
      after: "$10M",
      change: 25,
      trend: "up",
    },
    {
      metric: "Profit",
      before: "$1.76M",
      after: "$2.5M",
      change: 42,
      trend: "up",
    },
    {
      metric: "Expenses",
      before: "$6.24M",
      after: "$7.5M",
      change: 20,
      trend: "up",
    },
    {
      metric: "Debt Ratio",
      before: "0.50",
      after: "0.45",
      change: -10,
      trend: "down",
    },
    {
      metric: "ROE",
      before: "16%",
      after: "18%",
      change: 12.5,
      trend: "up",
    },
    {
      metric: "Current Ratio",
      before: "1.6",
      after: "1.8",
      change: 12.5,
      trend: "up",
    },
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-l-4 border-l-green-500";
      case "removed":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-l-4 border-l-red-500";
      case "modified":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-l-4 border-l-blue-500";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "added":
        return Plus;
      case "removed":
        return Minus;
      case "modified":
        return ArrowRight;
      default:
        return FileText;
    }
  };

  const availableDocuments = [
    "Q1_2024_Report.pdf",
    "Q2_2024_Report.pdf",
    "Q3_2024_Report.pdf",
    "Q4_2024_Report.pdf",
    "Annual_2024_Report.pdf",
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Smart Document Comparison
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Compare documents side-by-side with AI-powered change detection
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Compare</label>
            <Select value={document1} onValueChange={setDocument1}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((doc) => (
                  <SelectItem key={doc} value={doc}>
                    {doc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end justify-center">
            <GitCompare className="h-8 w-8 text-muted-foreground" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">With</label>
            <Select value={document2} onValueChange={setDocument2}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((doc) => (
                  <SelectItem key={doc} value={doc}>
                    {doc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "side-by-side" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("side-by-side")}
            >
              Side by Side
            </Button>
            <Button
              variant={viewMode === "unified" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("unified")}
            >
              Unified View
            </Button>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Plus className="h-3 w-3 mr-1" />
              {changes.filter((c) => c.type === "added").length} Added
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <Minus className="h-3 w-3 mr-1" />
              {changes.filter((c) => c.type === "removed").length} Removed
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <ArrowRight className="h-3 w-3 mr-1" />
              {changes.filter((c) => c.type === "modified").length} Modified
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="changes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Changes Tab */}
          <TabsContent value="changes" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {changes.map((change, index) => {
                  const Icon = getChangeIcon(change.type);
                  return (
                    <Card
                      key={index}
                      className={getChangeColor(change.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{change.section}</h4>
                              <Badge
                                variant={
                                  change.significance === "high"
                                    ? "destructive"
                                    : change.significance === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {change.significance}
                              </Badge>
                            </div>

                            {viewMode === "side-by-side" ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {document1}
                                  </div>
                                  {change.before && (
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded text-sm">
                                      {change.before}
                                    </div>
                                  )}
                                  {!change.before && change.type === "added" && (
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-muted-foreground italic">
                                      (Not present)
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {document2}
                                  </div>
                                  {change.after && (
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded text-sm">
                                      {change.after}
                                    </div>
                                  )}
                                  {!change.after && change.type === "removed" && (
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-muted-foreground italic">
                                      (Removed)
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {change.before && (
                                  <div className="flex items-start gap-2">
                                    <Minus className="h-4 w-4 text-red-600 mt-1" />
                                    <div className="flex-1 p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                                      {change.before}
                                    </div>
                                  </div>
                                )}
                                {change.after && (
                                  <div className="flex items-start gap-2">
                                    <Plus className="h-4 w-4 text-green-600 mt-1" />
                                    <div className="flex-1 p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
                                      {change.after}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {metricChanges.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{metric.metric}</h4>
                      <div className="flex items-center gap-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : metric.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span
                          className={`text-sm font-semibold ${
                            metric.change > 0
                              ? "text-green-600"
                              : metric.change < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Before
                        </div>
                        <div className="font-semibold">{metric.before}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          After
                        </div>
                        <div className="font-semibold">{metric.after}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-12 w-12 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Evolution Timeline</h3>
                    <div className="flex items-center gap-8 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Q3 2024
                        </div>
                        <div className="font-medium">September 30</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Q4 2024
                        </div>
                        <div className="font-medium">December 31</div>
                      </div>
                      <div className="ml-auto">
                        <Badge className="bg-blue-600">3 months</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium">Key Changes Over Time</h4>
              {changes
                .filter((c) => c.significance === "high")
                .map((change, index) => {
                  const Icon = getChangeIcon(change.type);
                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium">{change.section}</div>
                            <div className="text-sm text-muted-foreground">
                              {change.type === "added" && "Added in Q4 2024"}
                              {change.type === "removed" && "Removed in Q4 2024"}
                              {change.type === "modified" && "Changed in Q4 2024"}
                            </div>
                          </div>
                          <Badge variant="secondary">High Impact</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
