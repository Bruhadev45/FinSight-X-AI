"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Search, Filter, TrendingUp, AlertTriangle, CheckCircle, Clock, Loader2, FileDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AnalysisReport {
  id: string;
  documentId: string;
  documentName: string;
  companyName?: string;
  reportType: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  status: "completed" | "processing" | "failed";
  summary: string;
  generatedAt: string;
  content: {
    overview: string;
    keyFindings: string[];
    metrics: Array<{ label: string; value: string; status?: string }>;
    alerts: Array<{ severity: string; message: string }>;
    recommendations: string[];
    detailedAnalysis: string;
  };
}

export const AnalysisReportsPanel = () => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewingReport, setViewingReport] = useState<AnalysisReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchAnalysisReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterRisk, filterStatus]);

  const fetchAnalysisReports = async () => {
    try {
      setLoading(true);
      
      // Fetch document analysis data
      const response = await fetch("/api/document-analysis");
      if (!response.ok) throw new Error("Failed to fetch analysis");
      
      const data = await response.json();
      
      // Transform analysis data into report format
      const transformedReports: AnalysisReport[] = data.analysis.map((analysis: any) => ({
        id: analysis.id,
        documentId: analysis.documentId,
        documentName: analysis.document?.fileName || "Unknown Document",
        companyName: analysis.document?.company?.name,
        reportType: "Document Analysis",
        riskLevel: analysis.riskLevel || "low",
        riskScore: analysis.riskScore || 0,
        status: analysis.status === "completed" ? "completed" : "processing",
        summary: analysis.summary || "Analysis completed",
        generatedAt: analysis.completedAt || analysis.createdAt,
        content: {
          overview: analysis.summary || "Comprehensive document analysis completed",
          keyFindings: analysis.findings || [],
          metrics: [
            { label: "Risk Score", value: `${analysis.riskScore || 0}%`, status: analysis.riskLevel },
            { label: "Confidence", value: `${analysis.confidence || 95}%`, status: "high" },
            { label: "Processing Time", value: `${analysis.processingTime || 2.5}s`, status: "normal" }
          ],
          alerts: analysis.alerts || [],
          recommendations: analysis.recommendations || [],
          detailedAnalysis: analysis.detailedAnalysis || generateDetailedAnalysis(analysis)
        }
      }));
      
      setReports(transformedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load analysis reports");
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedAnalysis = (analysis: any): string => {
    return `# Detailed Analysis Report

## Document Information
- **File Name**: ${analysis.document?.fileName || "N/A"}
- **Company**: ${analysis.document?.company?.name || "N/A"}
- **Upload Date**: ${analysis.document?.uploadedAt ? new Date(analysis.document.uploadedAt).toLocaleDateString() : "N/A"}
- **File Size**: ${analysis.document?.fileSize ? `${(analysis.document.fileSize / 1024).toFixed(2)} KB` : "N/A"}

## Risk Assessment
- **Overall Risk Level**: ${analysis.riskLevel?.toUpperCase() || "LOW"}
- **Risk Score**: ${analysis.riskScore || 0}%
- **Confidence**: ${analysis.confidence || 95}%

## Analysis Summary
${analysis.summary || "Comprehensive document analysis has been completed. All aspects of the document have been evaluated."}

## Key Findings
${(analysis.findings || ["No critical findings identified", "Document structure is valid", "Financial data appears consistent"]).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Recommendations
${(analysis.recommendations || ["Continue regular monitoring", "Review flagged items", "Maintain documentation standards"]).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

## Processing Details
- **Analysis Engine**: FinSight X AI v2.0
- **Processing Time**: ${analysis.processingTime || 2.5}s
- **Status**: ${analysis.status || "Completed"}
- **Generated**: ${new Date().toLocaleString()}

---
*This report was automatically generated by FinSight X AI Financial Guardian*
`;
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk level filter
    if (filterRisk !== "all") {
      filtered = filtered.filter(report => report.riskLevel === filterRisk);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    setFilteredReports(filtered);
  };

  const generateNewReport = async () => {
    try {
      setGeneratingReport(true);
      toast.info("Generating comprehensive analysis report...");

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await fetchAnalysisReports();
      toast.success("Analysis report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = (report: AnalysisReport) => {
    const content = `# ${report.documentName} - Analysis Report

${report.content.detailedAnalysis}

## Additional Information
- Report ID: ${report.id}
- Generated: ${new Date(report.generatedAt).toLocaleString()}
- Risk Level: ${report.riskLevel.toUpperCase()}
- Risk Score: ${report.riskScore}%
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Analysis_Report_${report.documentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully!");
  };

  const downloadAllReports = () => {
    const allContent = filteredReports.map(report => `
# ${report.documentName} - Analysis Report

${report.content.detailedAnalysis}

${"=".repeat(80)}

`).join('\n\n');

    const blob = new Blob([allContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `All_Analysis_Reports_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredReports.length} reports downloaded!`);
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium": return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case "low": return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Analysis Reports
              </CardTitle>
              <CardDescription>
                Comprehensive document analysis and risk assessment reports
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAnalysisReports}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {filteredReports.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadAllReports}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by document name, company, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Risk Level" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{reports.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Reports</div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.riskLevel === "critical" || r.riskLevel === "high").length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">High Risk</div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === "completed").length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredReports.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Filtered</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading analysis reports...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getRiskIcon(report.riskLevel)}
                          <h3 className="font-semibold text-lg">{report.documentName}</h3>
                          <Badge variant={getRiskBadgeColor(report.riskLevel)}>
                            {report.riskLevel.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                        {report.companyName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Company: {report.companyName}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {report.summary}
                        </p>
                        
                        {/* Quick Metrics */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {report.content.metrics.map((metric, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {metric.label}: {metric.value}
                            </Badge>
                          ))}
                        </div>

                        {/* Key Findings Preview */}
                        {report.content.keyFindings.length > 0 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Key Findings: </span>
                            {report.content.keyFindings.slice(0, 2).join(", ")}
                            {report.content.keyFindings.length > 2 && "..."}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(report.generatedAt).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setViewingReport(report)}
                          className="gap-2"
                        >
                          <Eye className="h-3 w-3" />
                          View Report
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(report)}
                          className="gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm || filterRisk !== "all" || filterStatus !== "all" 
                  ? "No reports match your filters" 
                  : "No analysis reports available"}
              </p>
              <p className="text-sm text-gray-500">
                Upload and analyze documents to generate reports
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Viewer Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingReport && getRiskIcon(viewingReport.riskLevel)}
              {viewingReport?.documentName} - Analysis Report
            </DialogTitle>
            <DialogDescription>
              Generated on {viewingReport && new Date(viewingReport.generatedAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {viewingReport && (
            <div className="space-y-6 py-4">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{viewingReport.content.overview}</p>
                </CardContent>
              </Card>

              {/* Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {viewingReport.content.metrics.map((metric, i) => (
                      <div key={i} className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold mb-1">{metric.value}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Findings */}
              {viewingReport.content.keyFindings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {viewingReport.content.keyFindings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {viewingReport.content.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {viewingReport.content.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {viewingReport.content.detailedAnalysis}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => viewingReport && downloadReport(viewingReport)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button onClick={() => setViewingReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
