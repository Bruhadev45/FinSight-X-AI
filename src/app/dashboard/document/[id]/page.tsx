"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Building,
  Calendar,
  TrendingUp,
  Shield,
  Brain,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentData {
  document: any;
  analyses: any[];
  metrics: any[];
  complianceChecks: any[];
  aiLogs: any[];
  versions: any[];
}

// Helper function to parse and display content
const parseContent = (value: any): string => {
  if (!value) return "";
  
  if (typeof value === "string") {
    // Try to parse if it looks like JSON
    if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        return formatParsedContent(parsed);
      } catch {
        return value;
      }
    }
    return value;
  }
  if (typeof value === "object" && value !== null) {
    return formatParsedContent(value);
  }
  return String(value);
};

const formatParsedContent = (obj: any): string => {
  if (typeof obj === "string") return obj;
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "boolean") return obj ? "Yes" : "No";
  if (!obj) return "";
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => formatParsedContent(item)).filter(Boolean).join("; ");
  }
  
  // Handle common field names with natural language
  if (obj.metric) return `${obj.metric}: ${obj.value || ""} (${obj.trend || ""})`;
  if (obj.standard) return `${obj.standard}: ${obj.requirement || ""} - ${obj.status || ""}`;
  if (obj.finding) return obj.finding;
  if (obj.description) return obj.description;
  if (obj.message) return obj.message;
  if (obj.indicator) return obj.indicator;
  if (obj.issue) return obj.issue;
  if (obj.concern) return obj.concern;
  if (obj.title && obj.description) return `${obj.title}: ${obj.description}`;
  if (obj.title) return obj.title;
  if (obj.name && obj.value) return `${obj.name}: ${obj.value}`;
  if (obj.name) return obj.name;
  if (obj.content) return obj.content;
  if (obj.text) return obj.text;
  
  // For objects with meaningful key-value pairs, create readable text
  const keys = Object.keys(obj).filter(k => {
    const val = obj[k];
    return val && typeof val !== 'object' && k !== 'id' && k !== 'createdAt' && k !== 'updatedAt';
  });
  
  if (keys.length > 0) {
    return keys.map(k => {
      const key = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `${key}: ${obj[k]}`;
    }).join(", ");
  }
  
  // Last resort: just extract all string values
  const values = Object.values(obj).filter(v => typeof v === 'string' || typeof v === 'number');
  if (values.length > 0) {
    return values.join(", ");
  }
  
  return "";
};

// Helper to convert array/object to readable list items
const renderContentList = (content: any): string[] => {
  if (!content) return [];
  
  // If it's already an array of strings
  if (Array.isArray(content)) {
    return content.map(item => parseContent(item)).filter(Boolean);
  }
  
  // If it's an object, convert to array of strings
  if (typeof content === 'object') {
    const values = Object.values(content).map(v => parseContent(v)).filter(Boolean);
    return values.length > 0 ? values : [parseContent(content)];
  }
  
  // Single value
  const parsed = parseContent(content);
  return parsed ? [parsed] : [];
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/documents/${params.id}/analysis`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch document");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error("Failed to load document details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchDocument();
    }
  }, [params.id]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}/download`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data?.document?.fileName || "document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Document downloaded");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download document");
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "passed":
        return "text-green-600 dark:text-green-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Document Not Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {error || "The requested document could not be found."}
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const doc = data.document;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Document Overview */}
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">{doc.fileName}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getRiskLevelColor(doc.riskLevel)}>
                      {doc.riskLevel || "Unknown"} Risk
                    </Badge>
                    <Badge variant="outline">{doc.status}</Badge>
                    <Badge variant="outline">{doc.fileType}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Upload Date</p>
                  <p className="font-medium">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Anomalies</p>
                  <p className="font-medium">{doc.anomalyCount || 0} detected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Compliance</p>
                  <p className="font-medium">{doc.complianceStatus || "N/A"}</p>
                </div>
              </div>
            </div>
            {doc.summary && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300">{doc.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {data.analyses && data.analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.analyses.map((analysis) => {
                const findings = renderContentList(analysis.keyFindings);
                const frauds = renderContentList(analysis.fraudIndicators);
                
                return (
                  <div
                    key={analysis.id}
                    className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg capitalize">{analysis.analysisType}</h4>
                      {analysis.confidenceScore && (
                        <Badge variant="secondary">
                          {Math.round(analysis.confidenceScore * 100)}% Confidence
                        </Badge>
                      )}
                    </div>
                    
                    {findings.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          Key Findings:
                        </p>
                        <ul className="space-y-2 list-none">
                          {findings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded border">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {frauds.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">
                          Fraud Indicators:
                        </p>
                        <ul className="space-y-2 list-none">
                          {frauds.map((indicator, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                              <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                              <span>{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t">
                      Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Metrics */}
          {data.metrics && data.metrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Financial Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.metrics.map((metric) => (
                  <div key={metric.id} className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="h-4 w-4 text-slate-500" />
                      <p className="font-semibold">{metric.companyName}</p>
                      <Badge variant="outline">
                        FY {metric.fiscalYear}
                        {metric.fiscalQuarter && ` Q${metric.fiscalQuarter}`}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {metric.revenue && (
                        <div>
                          <p className="text-slate-500">Revenue</p>
                          <p className="font-medium">
                            ${(metric.revenue / 1000000).toFixed(2)}M
                          </p>
                        </div>
                      )}
                      {metric.netIncome && (
                        <div>
                          <p className="text-slate-500">Net Income</p>
                          <p className="font-medium">
                            ${(metric.netIncome / 1000000).toFixed(2)}M
                          </p>
                        </div>
                      )}
                      {metric.totalAssets && (
                        <div>
                          <p className="text-slate-500">Total Assets</p>
                          <p className="font-medium">
                            ${(metric.totalAssets / 1000000).toFixed(2)}M
                          </p>
                        </div>
                      )}
                      {metric.equity && (
                        <div>
                          <p className="text-slate-500">Equity</p>
                          <p className="font-medium">
                            ${(metric.equity / 1000000).toFixed(2)}M
                          </p>
                        </div>
                      )}
                      {metric.debtToEquityRatio && (
                        <div>
                          <p className="text-slate-500">D/E Ratio</p>
                          <p className="font-medium">{metric.debtToEquityRatio.toFixed(2)}</p>
                        </div>
                      )}
                      {metric.roe && (
                        <div>
                          <p className="text-slate-500">ROE</p>
                          <p className="font-medium">{(metric.roe * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Compliance Checks */}
          {data.complianceChecks && data.complianceChecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Compliance Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.complianceChecks.map((check) => (
                  <div
                    key={check.id}
                    className="p-3 border rounded-lg flex items-start gap-3"
                  >
                    {check.result === "passed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{check.checkName}</p>
                        <Badge variant="outline" className="text-xs">
                          {check.standardType}
                        </Badge>
                      </div>
                      {check.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {check.details}
                        </p>
                      )}
                      {check.recommendation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          💡 {check.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Agent Logs */}
        {data.aiLogs && data.aiLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                AI Agent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.aiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-sm">{log.agentName}</p>
                        <p className="text-xs text-slate-500">{log.taskType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {log.processingTimeMs && (
                        <span className="text-xs text-slate-500">
                          {log.processingTimeMs}ms
                        </span>
                      )}
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "secondary"
                            : log.status === "failed"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}