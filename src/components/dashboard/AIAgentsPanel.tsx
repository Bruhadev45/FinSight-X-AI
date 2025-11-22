"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AgentLog {
  id: number;
  agentName: string;
  documentId: number | null;
  taskType: string;
  status: string;
  processingTimeMs: number | null;
  resultSummary: string | null;
  createdAt: string;
}

const agentIcons = {
  "parser": "📄",
  "validator": "✅",
  "anomaly_detector": "🔍",
  "fraud_pattern": "🚨",
  "compliance": "🛡️",
};

const agentNames = {
  "parser": "Document Parser",
  "validator": "Data Validator",
  "anomaly_detector": "Anomaly Detector",
  "fraud_pattern": "Fraud Pattern Analyzer",
  "compliance": "Compliance Monitor",
};

export const AIAgentsPanel = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    parser: { total: 0, completed: 0, active: 0 },
    validator: { total: 0, completed: 0, active: 0 },
    anomaly_detector: { total: 0, completed: 0, active: 0 },
    fraud_pattern: { total: 0, completed: 0, active: 0 },
    compliance: { total: 0, completed: 0, active: 0 },
  });

  useEffect(() => {
    fetchAgentLogs();
    const interval = setInterval(fetchAgentLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgentLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai-agent-logs?limit=50");
      if (!response.ok) throw new Error("Failed to fetch agent logs");
      
      const data: AgentLog[] = await response.json();
      setLogs(data);

      // Calculate stats
      const newStats: any = {
        parser: { total: 0, completed: 0, active: 0 },
        validator: { total: 0, completed: 0, active: 0 },
        anomaly_detector: { total: 0, completed: 0, active: 0 },
        fraud_pattern: { total: 0, completed: 0, active: 0 },
        compliance: { total: 0, completed: 0, active: 0 },
      };

      data.forEach((log) => {
        const agent = log.agentName.toLowerCase().replace(" ", "_");
        if (newStats[agent]) {
          newStats[agent].total++;
          if (log.status === "completed") newStats[agent].completed++;
          if (log.status === "running") newStats[agent].active++;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching agent logs:", error);
      toast.error("Failed to load agent activity");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "running":
        return "bg-blue-500 animate-pulse";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          AI Agents Activity
        </CardTitle>
        <CardDescription>Real-time agent performance and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(agentNames).map(([key, name]) => {
            const agentKey = key as keyof typeof stats;
            const agentStats = stats[agentKey];
            const icon = agentIcons[agentKey as keyof typeof agentIcons];

            return (
              <Card key={key} className="bg-white/50 dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{icon}</span>
                    <Badge variant={agentStats.active > 0 ? "default" : "secondary"}>
                      {agentStats.active > 0 ? "Active" : "Idle"}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">{name}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Tasks:</span>
                      <span className="font-semibold">{agentStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                      <span className="font-semibold text-green-600">{agentStats.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Running:</span>
                      <span className="font-semibold text-blue-600">{agentStats.active}</span>
                    </div>
                  </div>
                  {agentStats.total > 0 && (
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(agentStats.completed / agentStats.total) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity Log */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p>No agent activity yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {logs.slice(0, 20).map((log) => {
                const agentKey = log.agentName.toLowerCase().replace(" ", "_") as keyof typeof agentIcons;
                const icon = agentIcons[agentKey] || "🤖";

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border"
                  >
                    <span className="text-xl">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {agentNames[agentKey as keyof typeof agentNames] || log.agentName}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                        <Badge variant="outline" className="text-xs">
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {log.taskType}
                      </p>
                      {log.resultSummary && (
                        <p className="text-xs text-gray-500">{log.resultSummary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        {log.processingTimeMs && (
                          <span>⏱️ {(log.processingTimeMs / 1000).toFixed(2)}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};