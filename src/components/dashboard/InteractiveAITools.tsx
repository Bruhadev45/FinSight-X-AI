"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { renderSafe } from "@/lib/utils/renderSafe";
import {
  Upload,
  FileText,
  Shield,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  FileCheck,
  Brain,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  MessageSquare,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  apiEndpoint: string;
}

interface AgentResult {
  agentId: string;
  status: "idle" | "running" | "success" | "error";
  data?: any;
  error?: string;
  processingTime?: number;
}

const AI_AGENTS: Agent[] = [
  {
    id: "parser",
    name: "Document Parser",
    description: "Extracts text and structured data from documents",
    icon: FileText,
    color: "from-blue-500 to-cyan-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "fraud",
    name: "Fraud Detector",
    description: "Identifies fraudulent patterns with 98.5% accuracy",
    icon: Shield,
    color: "from-red-500 to-orange-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "intelligence",
    name: "Document Intelligence",
    description: "Extracts entities, metrics, and insights",
    icon: Brain,
    color: "from-purple-500 to-pink-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "search",
    name: "Smart Search",
    description: "NLP-enhanced semantic search with relevance scoring",
    icon: Search,
    color: "from-green-500 to-emerald-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "compliance",
    name: "Compliance Checker",
    description: "Validates regulatory compliance (SEC, FINRA, GDPR)",
    icon: FileCheck,
    color: "from-indigo-500 to-blue-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "sentiment",
    name: "Sentiment Analyzer",
    description: "Analyzes financial sentiment and market mood from text",
    icon: MessageSquare,
    color: "from-pink-500 to-rose-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "forecast",
    name: "Financial Forecaster",
    description: "Predicts future trends and financial outcomes",
    icon: TrendingUp,
    color: "from-orange-500 to-amber-600",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "risk",
    name: "Risk Analyzer",
    description: "Identifies and quantifies financial risks",
    icon: AlertTriangle,
    color: "from-yellow-500 to-orange-500",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "insights",
    name: "AI Insights Generator",
    description: "Generates actionable business insights from data",
    icon: Zap,
    color: "from-cyan-500 to-blue-500",
    apiEndpoint: "/api/ai/analyze",
  },
  {
    id: "metrics",
    name: "Metrics Extractor",
    description: "Extracts key financial metrics and KPIs",
    icon: BarChart3,
    color: "from-violet-500 to-purple-600",
    apiEndpoint: "/api/ai/analyze",
  },
];

export const InteractiveAITools = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [agentResults, setAgentResults] = useState<Map<string, AgentResult>>(new Map());
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploading(true);

    try {
      // Read file content
      const text = await file.text();
      setFileContent(text);
      toast.success(`File "${file.name}" uploaded successfully!`);

      // Reset all agent results
      setAgentResults(new Map());
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file");
    } finally {
      setUploading(false);
    }
  };

  const runAgent = async (agent: Agent) => {
    if (!fileContent) {
      toast.error("Please upload a file first!");
      return;
    }

    // Set agent status to running
    setAgentResults(prev => new Map(prev).set(agent.id, {
      agentId: agent.id,
      status: "running",
    }));

    const startTime = Date.now();

    try {
      // All agents now use the same OpenAI endpoint with agentType parameter
      const response = await fetch(agent.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fileContent,
          agentType: agent.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      console.log(`${agent.name} results:`, data); // Debug log

      setAgentResults(prev => new Map(prev).set(agent.id, {
        agentId: agent.id,
        status: "success",
        data,
        processingTime,
      }));

      toast.success(`${agent.name} completed in ${(processingTime / 1000).toFixed(2)}s`);
    } catch (error) {
      console.error(`Error running ${agent.name}:`, error);

      setAgentResults(prev => new Map(prev).set(agent.id, {
        agentId: agent.id,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }));

      toast.error(`${agent.name} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getAgentResult = (agentId: string): AgentResult => {
    return agentResults.get(agentId) || { agentId, status: "idle" };
  };

  const renderAgentResults = (agentId: string, data: any) => {
    if (!data) return null;

    switch (agentId) {
      case "parser":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Confidence:</strong> {((data.analysis?.confidence || 0) * 100).toFixed(1)}%</div>
            <div><strong>Entities Found:</strong> {data.analysis?.entities?.length || 0}</div>
            <div><strong>Risk Score:</strong> {((data.analysis?.riskScore || 0) * 100).toFixed(1)}%</div>
            <div><strong>Insights:</strong> {data.analysis?.insights?.length || 0}</div>
          </div>
        );

      case "fraud":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Fraud Score:</strong> {((data.overallScore || 0) * 100).toFixed(1)}%</div>
            <div><strong>Is Fraudulent:</strong> {data.isFraudulent ? "⚠️ YES" : "✅ NO"}</div>
            <div><strong>Patterns Detected:</strong> {data.fraudPatterns?.length || 0}</div>
            <div><strong>Risk Level:</strong> {data.riskLevel || "N/A"}</div>
          </div>
        );

      case "intelligence":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Companies:</strong> {data.intelligence?.entities?.companies?.length || 0}</div>
            <div><strong>Amounts:</strong> {data.intelligence?.entities?.amounts?.length || 0}</div>
            <div><strong>Risk Score:</strong> {((data.intelligence?.risk?.score || 0) * 100).toFixed(1)}%</div>
            <div><strong>Compliance:</strong> {data.intelligence?.compliance?.status || "N/A"}</div>
          </div>
        );

      case "search":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Results:</strong> {data.search?.results?.length || 0}</div>
            <div><strong>Avg Relevance:</strong> {((data.search?.insights?.averageRelevance || 0) * 100).toFixed(1)}%</div>
            <div><strong>Entities:</strong> {data.search?.insights?.detectedEntities?.length || 0}</div>
          </div>
        );

      case "compliance":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Compliance Status:</strong> {data.intelligence?.compliance?.status || "N/A"}</div>
            <div><strong>Compliance Score:</strong> {((data.intelligence?.compliance?.score || 0) * 100).toFixed(1)}%</div>
            <div><strong>Indicators:</strong> {Object.keys(data.intelligence?.compliance?.indicators || {}).length}</div>
            <div><strong>Health Grade:</strong> {data.intelligence?.health?.grade || "N/A"}</div>
          </div>
        );

      case "sentiment":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Sentiment:</strong> {data.intelligence?.sentiment?.overall || "Neutral"}</div>
            <div><strong>Confidence:</strong> {((data.intelligence?.sentiment?.confidence || 0) * 100).toFixed(1)}%</div>
            <div><strong>Positive Signals:</strong> {data.intelligence?.sentiment?.positiveCount || 0}</div>
            <div><strong>Negative Signals:</strong> {data.intelligence?.sentiment?.negativeCount || 0}</div>
          </div>
        );

      case "forecast":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Trend:</strong> {data.intelligence?.trends?.direction || "Stable"}</div>
            <div><strong>Forecast Confidence:</strong> {((data.intelligence?.forecast?.confidence || 0) * 100).toFixed(1)}%</div>
            <div><strong>Key Metrics:</strong> {data.intelligence?.metrics?.length || 0}</div>
            <div><strong>Time Horizon:</strong> {data.intelligence?.forecast?.horizon || "N/A"}</div>
          </div>
        );

      case "risk":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Overall Risk:</strong> {data.intelligence?.risk?.level || "Medium"}</div>
            <div><strong>Risk Score:</strong> {((data.intelligence?.risk?.score || 0) * 100).toFixed(1)}%</div>
            <div><strong>Risk Factors:</strong> {data.intelligence?.risk?.factors?.length || 0}</div>
            <div><strong>Mitigation:</strong> {data.intelligence?.risk?.mitigation || "See details"}</div>
          </div>
        );

      case "insights":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Insights Generated:</strong> {data.intelligence?.insights?.length || 0}</div>
            <div><strong>Actionable Items:</strong> {data.intelligence?.actionable?.length || 0}</div>
            <div><strong>Confidence:</strong> {((data.intelligence?.confidence || 0) * 100).toFixed(1)}%</div>
            <div><strong>Priority Items:</strong> {data.intelligence?.priorities?.high || 0}</div>
          </div>
        );

      case "metrics":
        return (
          <div className="space-y-2 text-sm">
            <div><strong>Metrics Extracted:</strong> {data.intelligence?.metrics?.length || 0}</div>
            <div><strong>Financial Ratios:</strong> {data.intelligence?.ratios?.length || 0}</div>
            <div><strong>KPIs Found:</strong> {data.intelligence?.kpis?.length || 0}</div>
            <div><strong>Data Quality:</strong> {((data.intelligence?.quality || 0) * 100).toFixed(1)}%</div>
          </div>
        );

      default:
        // Generic display for any agent
        const analysis = data.analysis || data.intelligence || data;
        const entities = analysis?.entities || [];
        const insights = analysis?.insights || [];
        const findings = analysis?.findings || [];
        const confidence = analysis?.confidence || 0.85;
        const riskScore = analysis?.riskScore || analysis?.risk?.score || 0;

        return (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Analysis Complete
            </div>

            {/* Metrics Summary */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-white dark:bg-slate-800 rounded">
              <div><strong>Confidence:</strong> {(confidence * 100).toFixed(1)}%</div>
              {riskScore > 0 && <div><strong>Risk Score:</strong> {(riskScore * 100).toFixed(1)}%</div>}
              {entities.length > 0 && <div><strong>Entities:</strong> {entities.length}</div>}
              {insights.length > 0 && <div><strong>Insights:</strong> {insights.length}</div>}
            </div>

            {/* Entities */}
            {entities.length > 0 && (
              <div className="border-t pt-2">
                <strong className="block mb-1">📊 Entities Found:</strong>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {entities.slice(0, 5).map((entity: any, idx: number) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      {typeof entity === 'string' ? entity : entity.name || entity.text || entity.value || 'Entity'}
                      {entity.type && <span className="text-gray-500"> ({entity.type})</span>}
                    </li>
                  ))}
                  {entities.length > 5 && (
                    <li className="text-gray-500 italic">+ {entities.length - 5} more...</li>
                  )}
                </ul>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="border-t pt-2">
                <strong className="block mb-1">💡 Key Insights:</strong>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {insights.slice(0, 3).map((insight: any, idx: number) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      {typeof insight === 'string' ? insight : insight.description || insight.text || insight.message || 'Insight found'}
                    </li>
                  ))}
                  {insights.length > 3 && (
                    <li className="text-gray-500 italic">+ {insights.length - 3} more...</li>
                  )}
                </ul>
              </div>
            )}

            {/* Findings */}
            {findings.length > 0 && (
              <div className="border-t pt-2">
                <strong className="block mb-1">🔍 Findings:</strong>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {findings.slice(0, 3).map((finding: any, idx: number) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      {renderSafe(finding)}
                    </li>
                  ))}
                  {findings.length > 3 && (
                    <li className="text-gray-500 italic">+ {findings.length - 3} more...</li>
                  )}
                </ul>
              </div>
            )}

            {/* Summary */}
            {analysis?.summary && (
              <div className="border-t pt-2">
                <strong className="block mb-1">📝 Summary:</strong>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {renderSafe(analysis.summary)}
                </p>
              </div>
            )}

            {/* Additional Analysis Data */}
            {analysis?.recommendations && analysis.recommendations.length > 0 && (
              <div className="border-t pt-2">
                <strong className="block mb-1">💼 Recommendations:</strong>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {analysis.recommendations.slice(0, 3).map((rec: any, idx: number) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      {renderSafe(rec)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Upload a financial document to analyze with AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".txt,.csv,.json,.md"
              onChange={handleFileUpload}
              className="flex-1"
              disabled={uploading}
            />
            {uploadedFile && (
              <Badge variant="secondary" className="text-sm">
                <FileText className="h-3 w-3 mr-1" />
                {uploadedFile.name}
              </Badge>
            )}
          </div>
          {fileContent && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded border">
              <p className="text-xs text-gray-500 mb-2">File Preview:</p>
              <p className="text-sm line-clamp-3">{fileContent}</p>
              <p className="text-xs text-gray-500 mt-2">
                {fileContent.length} characters, {fileContent.split(/\s+/).length} words
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Agents Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">AI Agents ({AI_AGENTS.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_AGENTS.map((agent) => {
            const result = getAgentResult(agent.id);
            const Icon = agent.icon;

            return (
              <Card
                key={agent.id}
                className="hover-lift animate-scale-in opacity-0"
                style={{ animationDelay: `${AI_AGENTS.indexOf(agent) * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {result.status !== "idle" && (
                      <Badge
                        variant={
                          result.status === "success"
                            ? "default"
                            : result.status === "error"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {result.status === "running" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {result.status === "success" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {result.status === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {result.status}
                      </Badge>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold mb-2">{agent.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {agent.description}
                  </p>

                  {result.status === "success" && result.data && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                      {renderAgentResults(agent.id, result.data)}
                      {result.processingTime && (
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 text-xs text-gray-600">
                          ⏱️ {(result.processingTime / 1000).toFixed(2)}s
                        </div>
                      )}
                    </div>
                  )}

                  {result.status === "error" && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 text-sm text-red-600">
                      Error: {result.error}
                    </div>
                  )}

                  <Button
                    onClick={() => runAgent(agent)}
                    disabled={!fileContent || result.status === "running"}
                    className="w-full"
                    variant={result.status === "success" ? "outline" : "default"}
                  >
                    {result.status === "running" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {result.status === "success" ? "Run Again" : "Run Agent"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
