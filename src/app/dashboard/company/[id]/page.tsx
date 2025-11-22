"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { CompanyDocumentUpload } from "@/components/dashboard/CompanyDocumentUpload";
import { CompanyAlertsPanel } from "@/components/dashboard/CompanyAlertsPanel";
import { DocumentManagementPanel } from "@/components/dashboard/DocumentManagementPanel";
import { AnalyticsChartsPanel } from "@/components/dashboard/AnalyticsChartsPanel";
import { AlertRulesPanel } from "@/components/dashboard/AlertRulesPanel";
import { PredictiveInsightsPanel } from "@/components/dashboard/PredictiveInsightsPanel";
import { DocumentAnnotationsPanel } from "@/components/dashboard/DocumentAnnotationsPanel";
import { ArrowLeft, Building2, FileText, AlertTriangle, TrendingUp, Activity, Loader2, Calendar, Download, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: number;
  name: string;
  industry: string;
  tickerSymbol: string | null;
  country: string;
  lastAnalyzed: string | null;
  totalDocuments: number;
  avgRiskScore: number | null;
}

interface CompanyStats {
  totalDocuments: number;
  documentsByStatus: Record<string, number>;
  documentsByRisk: Record<string, number>;
  totalAlerts: number;
  alertsBySeverity: Record<string, number>;
  recentDocuments: any[];
  recentAlerts: any[];
}

type TimeSegment = "daily" | "weekly" | "monthly";

export default function CompanyDashboard() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSegment, setTimeSegment] = useState<TimeSegment>("weekly");
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId, timeSegment]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);

      // Fetch company details
      const companyRes = await fetch(`/api/companies?id=${companyId}`);
      if (!companyRes.ok) throw new Error("Company not found");
      const companyData = await companyRes.json();
      setCompany(companyData);

      // Fetch company-specific stats with time segment
      const statsRes = await fetch(`/api/dashboard/stats?companyId=${companyId}&timeSegment=${timeSegment}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        setStats({
          totalDocuments: companyData.totalDocuments || 0,
          documentsByStatus: { completed: 0, processing: 0, failed: 0 },
          documentsByRisk: { high: 0, medium: 0, low: 0 },
          totalAlerts: 0,
          alertsBySeverity: { critical: 0, high: 0, medium: 0 },
          recentDocuments: [],
          recentAlerts: [],
        });
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      toast.info("Generating comprehensive report...");

      // First, fetch all necessary data for the report
      const [documentsRes, alertsRes, analysisRes] = await Promise.all([
        fetch(`/api/documents?companyId=${companyId}`),
        fetch(`/api/alerts?companyId=${companyId}`),
        fetch(`/api/document-analysis/by-company?companyId=${companyId}`)
      ]);

      const documents = documentsRes.ok ? await documentsRes.json() : [];
      const alerts = alertsRes.ok ? await alertsRes.json() : [];
      const analysisData = analysisRes.ok ? await analysisRes.json() : [];

      // Prepare report data based on company and stats
      const reportData = {
        company: {
          name: company?.name,
          industry: company?.industry,
          country: company?.country,
          tickerSymbol: company?.tickerSymbol,
        },
        period: timeSegment,
        documents: documents.slice(0, 20), // Latest 20 documents
        alerts: alerts.slice(0, 20), // Latest 20 alerts
        stats: {
          totalDocuments: stats?.totalDocuments || 0,
          totalAlerts: stats?.totalAlerts || 0,
          avgRiskScore: company?.avgRiskScore,
          documentsByStatus: stats?.documentsByStatus || {},
          alertsBySeverity: stats?.alertsBySeverity || {},
        },
        analysis: analysisData.slice(0, 10),
        complianceChecks: analysisData.filter((a: any) => a.analysisType === 'compliance'),
        fraudFindings: analysisData.filter((a: any) => a.analysisType === 'fraud'),
        keyMetrics: [
          { label: "Total Documents", value: stats?.totalDocuments || 0 },
          { label: "Risk Score", value: company?.avgRiskScore ? `${company.avgRiskScore.toFixed(1)}%` : "N/A" },
          { label: "Total Alerts", value: stats?.totalAlerts || 0 },
          { label: "Compliance Rate", value: `${Math.round((stats?.documentsByStatus?.completed || 0) / (stats?.totalDocuments || 1) * 100)}%` }
        ],
        executiveSummary: `${company?.name} - ${timeSegment} Analysis Report`,
        strategicInsights: [
          `Total documents analyzed: ${stats?.totalDocuments || 0}`,
          `Risk level: ${company?.avgRiskScore ? (company.avgRiskScore >= 70 ? 'High' : company.avgRiskScore >= 40 ? 'Medium' : 'Low') : 'Unknown'}`,
          `Active alerts: ${stats?.totalAlerts || 0}`,
        ]
      };

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: parseInt(companyId),
          reportType: "comprehensive",
          data: reportData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      const data = await response.json();
      
      // Create downloadable report (use the markdown content from API)
      const reportContent = data.content || `# Company Report\n\nReport generated successfully.\n\nCompany: ${company?.name || 'Unknown'}\nDate: ${new Date().toLocaleString()}`;
      const fileExtension = data.format === 'markdown' ? 'md' : 'txt';
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${company?.name.replace(/\s+/g, "_")}_Report_${timeSegment}_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Report generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const getRiskColor = (risk: number | null) => {
    if (!risk) return "text-gray-500";
    if (risk >= 70) return "text-red-600 dark:text-red-400";
    if (risk >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getTimeSegmentLabel = () => {
    const now = new Date();
    switch (timeSegment) {
      case "daily":
        return now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      case "weekly":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      case "monthly":
        return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Company Not Found</h2>
            <p className="text-gray-500 mb-4">The company you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {company.industry} • {company.country}
              </p>
            </div>
            {company.tickerSymbol && (
              <Badge variant="outline" className="font-mono">
                {company.tickerSymbol}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Time Segment Filter */}
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-sm">Time Period:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{getTimeSegmentLabel()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={timeSegment === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeSegment("daily")}
                >
                  Daily
                </Button>
                <Button
                  variant={timeSegment === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeSegment("weekly")}
                >
                  Weekly
                </Button>
                <Button
                  variant={timeSegment === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeSegment("monthly")}
                >
                  Monthly
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {stats?.totalDocuments || 0}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-500">Documents</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {stats?.totalAlerts || 0}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-500">Alerts</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${
            !company.avgRiskScore ? "from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950" :
            company.avgRiskScore >= 70 ? "from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800" :
            company.avgRiskScore >= 40 ? "from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800" :
            "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800"
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${getRiskColor(company.avgRiskScore)}`}>
                    {company.avgRiskScore ? `${company.avgRiskScore.toFixed(1)}%` : "N/A"}
                  </div>
                  <div className={`text-sm ${getRiskColor(company.avgRiskScore)}`}>Risk Score</div>
                </div>
                <TrendingUp className={`h-8 w-8 opacity-50 ${getRiskColor(company.avgRiskScore)}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {company.lastAnalyzed 
                      ? new Date(company.lastAnalyzed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : "Never"
                    }
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-500">Last Analyzed</div>
                </div>
                <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictive Insights - NEW */}
        <PredictiveInsightsPanel companyId={companyId} timeSegment={timeSegment} />

        {/* Analytics Charts - NEW */}
        <AnalyticsChartsPanel companyId={companyId} timeSegment={timeSegment} />

        {/* Alert System */}
        <CompanyAlertsPanel companyId={companyId} companyName={company.name} />

        {/* Alert Rules - NEW */}
        <AlertRulesPanel companyId={companyId} />

        {/* Upload Section with AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompanyDocumentUpload 
            companyId={companyId} 
            companyName={company.name}
            onUploadComplete={fetchCompanyData}
          />
          <ChatInterface companyId={companyId} companyName={company.name} />
        </div>

        {/* Document Management Panel */}
        <DocumentManagementPanel
          companyId={companyId}
          companyName={company.name}
          onRefresh={fetchCompanyData}
        />

        {/* Document Annotations - NEW */}
        <DocumentAnnotationsPanel companyId={companyId} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentDocuments.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        doc.riskLevel === "high" ? "destructive" :
                        doc.riskLevel === "medium" ? "default" : "secondary"
                      }>
                        {doc.riskLevel || "pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No documents yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentAlerts && stats.recentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        alert.severity === "critical" ? "text-red-600" :
                        alert.severity === "high" ? "text-orange-500" :
                        "text-yellow-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-gray-500">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No alerts</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reports Summary */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Available Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Financial Overview</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Comprehensive financial metrics and analysis
                </p>
                <Button size="sm" variant="outline" onClick={handleGenerateReport}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Risk Assessment</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Detailed risk analysis and recommendations
                </p>
                <Button size="sm" variant="outline" onClick={handleGenerateReport}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Compliance Report</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Compliance status and regulatory insights
                </p>
                <Button size="sm" variant="outline" onClick={handleGenerateReport}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}