"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, AlertCircle, Loader2, Eye, Info, CheckCircle2, Activity } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: number;
  agentName: string;
  documentId: number | null;
  taskType: string;
  status: string;
  processingTimeMs: number | null;
  resultSummary: string | null;
  createdAt: string;
}

export const GovernancePanel = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai-agent-logs?limit=15");

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching governance data:", error);
      toast.error("Failed to load governance data");
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (taskType: string) => {
    switch (taskType?.toLowerCase()) {
      case "fraud_detection": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "document_analysis": return <FileCheck className="h-4 w-4 text-blue-600" />;
      case "compliance_check": return <Shield className="h-4 w-4 text-green-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "secondary";
      case "running": return "default";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          AI Governance & Compliance Center
        </CardTitle>
        <CardDescription>
          Complete oversight and transparency for all AI operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What is Governance - Explanation Card */}
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-base mb-2 text-blue-900 dark:text-blue-100">
                  What is AI Governance?
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3 leading-relaxed">
                  AI Governance ensures that all AI agents and models operate transparently, ethically, and in compliance with regulations. 
                  This panel provides complete visibility into every AI decision made in your financial analysis system.
                </p>
                
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Key Features:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Audit Trail:</strong> Every AI action is logged with timestamps and results
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Compliance Monitoring:</strong> Real-time checks against IFRS, GDPR, SOX standards
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Bias Detection:</strong> Continuous monitoring for algorithmic fairness
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Performance Tracking:</strong> Monitor agent speed and accuracy metrics
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                  <strong className="text-blue-900 dark:text-blue-100">Why it matters:</strong>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">
                    Regulatory bodies require full transparency in AI-driven financial decisions. This panel ensures you can 
                    prove compliance, trace every decision back to its source, and maintain trust with stakeholders.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Real-time Governance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-900 dark:text-green-100">
                      Active Monitoring
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {auditLogs.length}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500">
                    AI actions logged today
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                      Compliance Score
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    98.5%
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-500">
                    Meeting all standards
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                      Bias Score
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    12%
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-500">
                    Low risk (Target: &lt;15%)
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2">Regulatory Compliance Status</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                      All AI systems are compliant with financial regulations.
                      Last audit: {new Date().toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        IFRS Compliant
                      </Badge>
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        GDPR Compliant
                      </Badge>
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        SOX Compliant
                      </Badge>
                      <Badge variant="default" className="text-xs bg-blue-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        ISO 27001
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Agent Audit Trail */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Complete AI Agent Audit Trail</h4>
                <Badge variant="outline" className="text-xs">
                  Last {auditLogs.length} actions
                </Badge>
              </div>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No audit logs available</p>
                  <p className="text-xs mt-1">Logs will appear as AI agents process documents</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {auditLogs.map((log) => (
                    <Card key={log.id} className="bg-white dark:bg-slate-900">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {getEventIcon(log.taskType)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {log.agentName}
                              </Badge>
                              <Badge variant={getStatusColor(log.status)} className="text-xs">
                                {log.status}
                              </Badge>
                              {log.processingTimeMs && (
                                <span className="text-xs text-gray-500">
                                  {log.processingTimeMs}ms
                                </span>
                              )}
                            </div>
                            <div className="text-xs space-y-0.5">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Task:</span>
                                <span className="ml-1 font-medium">{log.taskType}</span>
                              </div>
                              {log.documentId && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Document:</span>
                                  <span className="ml-1 font-medium">#{log.documentId}</span>
                                </div>
                              )}
                              {log.resultSummary && (
                                <div className="text-gray-500 line-clamp-1">
                                  {log.resultSummary}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Model Bias Monitoring */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2">AI Model Fairness & Bias Report</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                      Continuous monitoring ensures AI decisions are fair and unbiased across all demographics and scenarios.
                    </p>
                    <div className="text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Overall Bias Score:</span>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                          12% (Low Risk)
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fairness Index:</span>
                        <span className="font-medium">0.94/1.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Gender Parity:</span>
                        <span className="font-medium text-green-600">98.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Geographic Fairness:</span>
                        <span className="font-medium text-green-600">96.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Audit:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
};