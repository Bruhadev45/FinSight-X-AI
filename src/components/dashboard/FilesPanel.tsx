"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Download, Eye, Filter, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: string;
  riskLevel: string | null;
  companyName?: string;
}

export const FilesPanel = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents?limit=100");
      if (!response.ok) throw new Error("Failed to fetch documents");
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (docId: number, fileName: string) => {
    try {
      setDownloadingId(docId);
      toast.loading(`Generating PDF for ${fileName}...`);

      const response = await fetch(`/api/documents/${docId}/download`);
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
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

  const handleViewDocument = (docId: number) => {
    router.push(`/dashboard/document/${docId}`);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    const matchesRisk = filterRisk === "all" || doc.riskLevel === filterRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            All Files
          </CardTitle>
          <CardDescription>Browse and manage all uploaded documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-900"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-900"
              >
                <option value="all">All Risk</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-2xl font-bold">{documents.length}</div>
                <div className="text-xs text-gray-500">Total Files</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950">
              <CardContent className="pt-4 pb-3">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {documents.filter(d => d.status === "completed").length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4 pb-3">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {documents.filter(d => d.status === "processing").length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">Processing</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950">
              <CardContent className="pt-4 pb-3">
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {documents.filter(d => d.riskLevel === "high").length}
                </div>
                <div className="text-xs text-red-600 dark:text-red-500">High Risk</div>
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" || filterRisk !== "all"
                  ? "No files match your filters"
                  : "No files uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">{doc.fileName}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{doc.fileType.toUpperCase()}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === "completed" ? "secondary" : doc.status === "processing" ? "default" : "destructive"}>
                          {doc.status}
                        </Badge>
                        {doc.riskLevel && (
                          <Badge variant={getRiskColor(doc.riskLevel)}>
                            {doc.riskLevel}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDocument(doc.id)}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};