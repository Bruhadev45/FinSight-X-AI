"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: string;
  riskLevel: string | null;
  anomalyCount: number;
  complianceStatus: string | null;
  summary: string | null;
  createdAt: string;
}

export const HistoryPanel = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    flagged: 0,
    anomalies: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents?limit=50");
      if (!response.ok) throw new Error("Failed to fetch documents");
      
      const data: Document[] = await response.json();
      setDocuments(data);

      // Calculate stats
      const newStats = {
        total: data.length,
        completed: data.filter(d => d.status === "completed").length,
        flagged: data.filter(d => d.riskLevel === "high" || d.riskLevel === "medium").length,
        anomalies: data.reduce((sum, d) => sum + (d.anomalyCount || 0), 0),
      };
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load document history");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
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
    switch (status) {
      case "completed":
        return "secondary";
      case "processing":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleViewDetails = (documentId: number) => {
    router.push(`/dashboard/document/${documentId}`);
  };

  const handleDownloadPDF = async (docId: number, fileName: string) => {
    try {
      setDownloadingId(docId);
      toast.loading(`Generating PDF for ${fileName}...`);

      const response = await fetch(`/api/documents/${docId}/download`);
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.dismiss();
      toast.error("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Document History & Analysis
        </CardTitle>
        <CardDescription>Track all analyzed documents and their findings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                {stats.total}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Docs</div>
            </CardContent>
          </Card>
          <Card className="bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.completed}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats.flagged}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500">Flagged</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {stats.anomalies}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-500">Anomalies</div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <p>No documents analyzed yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{doc.fileName}</h4>
                          <p className="text-xs text-gray-500">
                            {(doc.fileSize / 1024).toFixed(2)} KB • {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(doc.id)}
                            title="View document details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownloadPDF(doc.id, doc.fileName)}
                            disabled={downloadingId === doc.id}
                            title="Download PDF"
                          >
                            {downloadingId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant={getStatusColor(doc.status)}>{doc.status}</Badge>
                        {doc.riskLevel && (
                          <Badge variant={getRiskColor(doc.riskLevel)}>
                            Risk: {doc.riskLevel}
                          </Badge>
                        )}
                        {doc.complianceStatus && (
                          <Badge
                            variant={
                              doc.complianceStatus === "Pass" ? "secondary" : "destructive"
                            }
                          >
                            {doc.complianceStatus}
                          </Badge>
                        )}
                        {doc.anomalyCount > 0 && (
                          <Badge variant="outline">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {doc.anomalyCount} Anomalies
                          </Badge>
                        )}
                      </div>

                      {doc.summary && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {doc.summary}
                        </p>
                      )}
                    </div>
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