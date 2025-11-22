"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, CheckCircle, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

interface ComplianceCheck {
  id: number;
  documentId: number;
  checkType: string;
  status: string;
  severity: string;
  findings: any;
  recommendation: string;
  createdAt: string;
}

export const FraudDetectionPanel = () => {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchComplianceChecks();
  }, []);

  const fetchComplianceChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compliance-checks?limit=20");
      if (!response.ok) throw new Error("Failed to fetch compliance checks");
      
      const data = await response.json();
      setChecks(data);
    } catch (error) {
      console.error("Error fetching checks:", error);
      toast.error("Failed to load fraud detection data");
    } finally {
      setLoading(false);
    }
  };

  const filteredChecks = checks.filter(check => 
    filter === "all" || check.severity === filter
  );

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "passed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const stats = {
    total: checks.length,
    passed: checks.filter(c => c.status === "passed").length,
    failed: checks.filter(c => c.status === "failed").length,
    warning: checks.filter(c => c.status === "warning").length,
  };

  return (
    <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-white to-red-50 dark:from-slate-900 dark:to-red-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
          Fraud & Compliance Detection
        </CardTitle>
        <CardDescription>
          AI-powered fraud patterns and compliance rule validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Checks</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Passed</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Warnings</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "critical" ? "default" : "outline"}
            onClick={() => setFilter("critical")}
          >
            Critical
          </Button>
          <Button
            size="sm"
            variant={filter === "high" ? "default" : "outline"}
            onClick={() => setFilter("high")}
          >
            High
          </Button>
          <Button
            size="sm"
            variant={filter === "medium" ? "default" : "outline"}
            onClick={() => setFilter("medium")}
          >
            Medium
          </Button>
          <Button
            size="sm"
            variant={filter === "low" ? "default" : "outline"}
            onClick={() => setFilter("low")}
          >
            Low
          </Button>
        </div>

        {/* Checks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredChecks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No compliance checks found</p>
            <p className="text-xs mt-1">Upload documents to run fraud detection</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredChecks.map((check) => (
              <Card key={check.id} className="bg-white dark:bg-slate-900">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <Badge variant="outline">{check.checkType}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(check.severity)}`} />
                      <Badge variant="secondary" className="text-xs">
                        {check.severity}
                      </Badge>
                    </div>
                  </div>

                  {check.findings && Object.keys(check.findings).length > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-slate-800 rounded">
                      <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                        Findings:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(check.findings).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                            <span className="ml-1 font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {check.recommendation}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Doc ID: {check.documentId}</span>
                    <span>{new Date(check.createdAt).toLocaleString()}</span>
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
