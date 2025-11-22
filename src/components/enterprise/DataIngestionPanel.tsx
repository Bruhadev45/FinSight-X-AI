"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Webhook, Upload, CheckCircle, XCircle, Clock, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface IngestionLog {
  id: string;
  source: string;
  endpoint: string;
  status: "success" | "failed" | "processing";
  recordsProcessed: number;
  timestamp: string;
  duration: string;
  errorMessage?: string;
}

const mockLogs: IngestionLog[] = [
  {
    id: "1",
    source: "ERP System",
    endpoint: "/api/ingest/erp",
    status: "success",
    recordsProcessed: 1543,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    duration: "2.3s"
  },
  {
    id: "2",
    source: "Document Management System",
    endpoint: "/api/ingest/dms",
    status: "success",
    recordsProcessed: 87,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    duration: "1.8s"
  },
  {
    id: "3",
    source: "Webhook: New Filing",
    endpoint: "/api/webhooks/filing",
    status: "processing",
    recordsProcessed: 12,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    duration: "ongoing"
  },
  {
    id: "4",
    source: "API Upload",
    endpoint: "/api/ingest/manual",
    status: "failed",
    recordsProcessed: 0,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    duration: "0.5s",
    errorMessage: "Authentication failed: Invalid API key"
  }
];

export const DataIngestionPanel = () => {
  const [logs, setLogs] = useState<IngestionLog[]>(mockLogs);
  const [showApiDocs, setShowApiDocs] = useState(false);

  const apiEndpoints = [
    {
      name: "ERP Data Ingestion",
      method: "POST",
      endpoint: "/api/ingest/erp",
      description: "Upload financial data from ERP systems",
      example: `curl -X POST https://api.finsightx.com/api/ingest/erp \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "companyId": "123",
    "data": [...],
    "source": "SAP"
  }'`
    },
    {
      name: "Document Ingestion",
      method: "POST",
      endpoint: "/api/ingest/documents",
      description: "Batch upload documents from DMS",
      example: `curl -X POST https://api.finsightx.com/api/ingest/documents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "files=@document1.pdf" \\
  -F "files=@document2.pdf"`
    },
    {
      name: "Webhook Endpoint",
      method: "POST",
      endpoint: "/api/webhooks/filing",
      description: "Receive real-time notifications for new filings",
      example: `{
  "event": "new_filing",
  "companyId": "456",
  "documentUrl": "https://...",
  "timestamp": "2025-01-15T10:30:00Z"
}`
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const refreshLogs = () => {
    toast.info("Refreshing ingestion logs...");
    // Simulate refresh
    setTimeout(() => {
      toast.success("Logs refreshed");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-white to-green-50 dark:from-slate-900 dark:to-green-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                Data Ingestion APIs
              </CardTitle>
              <CardDescription>
                Automated data pipelines and webhook integration
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshLogs} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => setShowApiDocs(!showApiDocs)}>
                {showApiDocs ? "Hide" : "Show"} API Docs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Documentation */}
          {showApiDocs && (
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">API Endpoints</h3>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, i) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {endpoint.endpoint}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(endpoint.endpoint)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{endpoint.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {endpoint.description}
                      </p>
                      <div className="bg-gray-900 dark:bg-black text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                        <pre>{endpoint.example}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ingestion Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {logs.filter(l => l.status === "success").length}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Successful</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {logs.filter(l => l.status === "processing").length}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Processing</div>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {logs.filter(l => l.status === "failed").length}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-500">Failed</div>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {logs.reduce((sum, l) => sum + l.recordsProcessed, 0)}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-500">Total Records</div>
                  </div>
                  <Database className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingestion Logs */}
          <div>
            <h3 className="font-semibold mb-3">Recent Ingestion Activity</h3>
            <div className="space-y-2">
              {logs.map((log) => (
                <Card key={log.id} className="bg-white/50 dark:bg-slate-900/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {log.source.includes("Webhook") ? (
                            <Webhook className="h-5 w-5 text-purple-600" />
                          ) : log.source.includes("ERP") ? (
                            <Database className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Upload className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{log.source}</h4>
                            <Badge variant={
                              log.status === "success" ? "secondary" :
                              log.status === "processing" ? "default" : "destructive"
                            }>
                              {log.status === "success" ? "✅ Success" :
                               log.status === "processing" ? "⏳ Processing" : "❌ Failed"}
                            </Badge>
                          </div>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {log.endpoint}
                          </code>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>📊 {log.recordsProcessed} records</span>
                            <span>⏱️ {log.duration}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          {log.errorMessage && (
                            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                              Error: {log.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
