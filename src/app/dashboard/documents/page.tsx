"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { FilesPanel } from "@/components/dashboard/FilesPanel";
import { SemanticSearchPanel } from "@/components/dashboard/SemanticSearchPanel";
import { FraudDetectionPanel } from "@/components/dashboard/FraudDetectionPanel";
import { DocumentIntelligencePanel } from "@/components/dashboard/DocumentIntelligencePanel";
import {
  ArrowLeft,
  Upload,
  FileText,
  Search,
  Shield,
  Brain,
  TrendingUp,
  AlertTriangle,
  FileSearch,
  GitCompare,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface DocumentStats {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    processed: number;
    failed: number;
  };
  byRisk: {
    low: number;
    medium: number;
    high: number;
  };
  byCompliance: {
    passed: number;
    needs_review: number;
    failed: number;
  };
  recentDocuments: any[];
}

export default function DocumentsPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"overview" | "upload" | "search" | "fraud" | "intelligence" | "files">("overview");
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentStats();
    const interval = setInterval(fetchDocumentStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDocumentStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();

        const docsResponse = await fetch("/api/documents?limit=10&sort=createdAt&order=desc");
        const docsData = await docsResponse.json();

        setStats({
          total: data.totalDocuments || 0,
          byStatus: {
            pending: data.documentsByStatus?.pending || 0,
            processing: data.documentsByStatus?.processing || 0,
            processed: data.documentsByStatus?.processed || 0,
            failed: data.documentsByStatus?.failed || 0,
          },
          byRisk: {
            low: data.documentsByRisk?.low || 0,
            medium: data.documentsByRisk?.medium || 0,
            high: data.documentsByRisk?.high || 0,
          },
          byCompliance: {
            passed: data.documentsByCompliance?.passed || 0,
            needs_review: data.documentsByCompliance?.needs_review || 0,
            failed: data.documentsByCompliance?.failed || 0,
          },
          recentDocuments: docsData.documents || [],
        });
      }
    } catch (error) {
      console.error("Error fetching document stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: "upload",
      title: "Document Upload",
      description: "Upload and process financial documents with AI",
      icon: Upload,
      color: "from-blue-500 to-cyan-600",
      badge: "Core",
    },
    {
      id: "intelligence",
      title: "Document Intelligence",
      description: "Extract entities, metrics, and insights",
      icon: Brain,
      color: "from-purple-500 to-pink-600",
      badge: "AI",
    },
    {
      id: "search",
      title: "Advanced Search",
      description: "NLP-enhanced semantic search",
      icon: Search,
      color: "from-green-500 to-emerald-600",
      badge: "AI",
    },
    {
      id: "fraud",
      title: "Fraud Detection",
      description: "98.5% accuracy multi-pattern fraud detection",
      icon: Shield,
      color: "from-red-500 to-orange-600",
      badge: "Security",
    },
    {
      id: "files",
      title: "File Management",
      description: "Browse, organize, and manage all documents",
      icon: FileText,
      color: "from-indigo-500 to-blue-600",
      badge: "Core",
    },
  ];

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
            <Logo size={36} />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Document Intelligence</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered document analysis & management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/advanced-features")}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Advanced Features
            </Button>
            <Button
              variant="default"
              onClick={() => setActiveView("upload")}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Overview Section */}
        {activeView === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Documents */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {stats?.total || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-500">Total Documents</div>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              {/* Processed Documents */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {stats?.byStatus.processed || 0}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-500">Processed</div>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              {/* High Risk Documents */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {stats?.byRisk.high || 0}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-500">High Risk</div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Passed */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {stats?.byCompliance.passed || 0}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-500">Compliant</div>
                    </div>
                    <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processing Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Pending</div>
                      <div className="text-2xl font-bold text-blue-600">{stats?.byStatus.pending || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium">Processing</div>
                      <div className="text-2xl font-bold text-orange-600">{stats?.byStatus.processing || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">Processed</div>
                      <div className="text-2xl font-bold text-green-600">{stats?.byStatus.processed || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium">Failed</div>
                      <div className="text-2xl font-bold text-red-600">{stats?.byStatus.failed || 0}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Document Intelligence Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <Card
                    key={feature.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-indigo-300 dark:hover:border-indigo-700"
                    onClick={() => setActiveView(feature.id as any)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary">{feature.badge}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <Button variant="ghost" size="sm" className="gap-1 w-full">
                        Open Feature →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm font-medium">High Risk</span>
                        </div>
                        <span className="text-sm font-bold">{stats?.byRisk.high || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats?.total ? ((stats.byRisk.high / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm font-medium">Medium Risk</span>
                        </div>
                        <span className="text-sm font-bold">{stats?.byRisk.medium || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats?.total ? ((stats.byRisk.medium / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm font-medium">Low Risk</span>
                        </div>
                        <span className="text-sm font-bold">{stats?.byRisk.low || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats?.total ? ((stats.byRisk.low / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm font-medium">Passed</span>
                        </div>
                        <span className="text-sm font-bold">{stats?.byCompliance.passed || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats?.total ? ((stats.byCompliance.passed / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm font-medium">Needs Review</span>
                        </div>
                        <span className="text-sm font-bold">{stats?.byCompliance.needs_review || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats?.total ? ((stats.byCompliance.needs_review / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm font-medium">Failed</span>
                        </div>
                        <span className="text-sm font-bold">{stats?.byCompliance.failed || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats?.total ? ((stats.byCompliance.failed / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
                    stats.recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.fileName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500">
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {doc.fileType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={
                            doc.status === "processed" ? "default" :
                            doc.status === "processing" ? "secondary" :
                            doc.status === "failed" ? "destructive" : "outline"
                          }>
                            {doc.status}
                          </Badge>
                          <Badge variant={
                            doc.riskLevel === "high" ? "destructive" :
                            doc.riskLevel === "medium" ? "default" : "secondary"
                          }>
                            {doc.riskLevel || "pending"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No documents yet. Upload your first document to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Upload View */}
        {activeView === "upload" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setActiveView("overview")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <DocumentUpload />
          </div>
        )}

        {/* Search View */}
        {activeView === "search" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setActiveView("overview")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <SemanticSearchPanel />
          </div>
        )}

        {/* Fraud Detection View */}
        {activeView === "fraud" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setActiveView("overview")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <FraudDetectionPanel />
          </div>
        )}

        {/* Document Intelligence View */}
        {activeView === "intelligence" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setActiveView("overview")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <DocumentIntelligencePanel />
          </div>
        )}

        {/* Files View */}
        {activeView === "files" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setActiveView("overview")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <FilesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
