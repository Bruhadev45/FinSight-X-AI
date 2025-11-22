"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  CheckSquare, 
  Square,
  Loader2,
  GitCompare,
  Calendar,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface DocumentManagementPanelProps {
  companyId: string;
  companyName: string;
  onRefresh?: () => void;
}

export const DocumentManagementPanel = ({ companyId, companyName, onRefresh }: DocumentManagementPanelProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [deleting, setDeleting] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [companyId]);

  useEffect(() => {
    applyFilters();
  }, [documents, searchQuery, filterRisk, filterStatus, sortBy]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?companyId=${companyId}&limit=100`);
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

  const applyFilters = () => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Risk filter
    if (filterRisk !== "all") {
      filtered = filtered.filter((doc) => doc.riskLevel === filterRisk);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((doc) => doc.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return a.fileName.localeCompare(b.fileName);
        case "name-desc":
          return b.fileName.localeCompare(a.fileName);
        case "risk-high":
          const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (riskOrder[b.riskLevel || ""] || 0) - (riskOrder[a.riskLevel || ""] || 0);
        default:
          return 0;
      }
    });

    setFilteredDocs(filtered);
  };

  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocs.map((d) => d.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocs(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.size === 0) {
      toast.error("No documents selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedDocs.size} document(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const deletePromises = Array.from(selectedDocs).map((id) =>
        fetch(`/api/documents?id=${id}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);

      toast.success(`${selectedDocs.size} document(s) deleted successfully`);
      setSelectedDocs(new Set());
      await fetchDocuments();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete some documents");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDownload = () => {
    if (selectedDocs.size === 0) {
      toast.error("No documents selected");
      return;
    }

    const selectedDocuments = filteredDocs.filter((d) => selectedDocs.has(d.id));
    const reportContent = selectedDocuments
      .map(
        (doc) =>
          `Document: ${doc.fileName}\nUploaded: ${new Date(doc.uploadDate).toLocaleString()}\nRisk: ${doc.riskLevel || "N/A"}\nStatus: ${doc.status}\nSummary: ${doc.summary || "N/A"}\n\n---\n\n`
      )
      .join("");

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName}_Documents_Report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Report downloaded");
  };

  const handleCompare = () => {
    if (selectedDocs.size < 2) {
      toast.error("Please select at least 2 documents to compare");
      return;
    }
    if (selectedDocs.size > 5) {
      toast.error("You can compare up to 5 documents at once");
      return;
    }
    setCompareMode(true);
  };

  const getComparisonData = () => {
    return filteredDocs.filter((d) => selectedDocs.has(d.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Document Management
              <Badge variant="outline">{documents.length} total</Badge>
            </CardTitle>
            <Button onClick={fetchDocuments} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="risk-high">Risk High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedDocs.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <span className="text-sm font-medium">
                {selectedDocs.size} document(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompare}
                  disabled={selectedDocs.size < 2 || selectedDocs.size > 5}
                >
                  <GitCompare className="h-4 w-4 mr-1" />
                  Compare
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Document List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {/* Select All Header */}
            {filteredDocs.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleSelectAll}
                >
                  {selectedDocs.size === filteredDocs.length ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Select All ({filteredDocs.length})
                </span>
              </div>
            )}

            {filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No documents found</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:border-indigo-300 dark:hover:border-indigo-700 ${
                    selectedDocs.has(doc.id)
                      ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => toggleSelect(doc.id)}
                  >
                    {selectedDocs.has(doc.id) ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>

                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.fileSize / 1024).toFixed(2)} KB •{" "}
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          doc.riskLevel === "high"
                            ? "destructive"
                            : doc.riskLevel === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {doc.riskLevel || "N/A"}
                      </Badge>
                      <Badge variant="outline">{doc.status}</Badge>
                      {doc.complianceStatus && (
                        <Badge variant={doc.complianceStatus === "Pass" ? "secondary" : "destructive"}>
                          {doc.complianceStatus}
                        </Badge>
                      )}
                      {doc.anomalyCount > 0 && (
                        <Badge variant="outline">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {doc.anomalyCount} issues
                        </Badge>
                      )}
                    </div>

                    {doc.summary && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {doc.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Dialog */}
      <Dialog open={compareMode} onOpenChange={setCompareMode}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Comparison</DialogTitle>
            <DialogDescription>
              Comparing {selectedDocs.size} documents side by side
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {getComparisonData().map((doc) => (
              <Card key={doc.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Risk Level</p>
                    <Badge
                      variant={
                        doc.riskLevel === "high"
                          ? "destructive"
                          : doc.riskLevel === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {doc.riskLevel || "N/A"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Compliance</p>
                    <Badge
                      variant={doc.complianceStatus === "Pass" ? "secondary" : "destructive"}
                    >
                      {doc.complianceStatus || "N/A"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Anomalies</p>
                    <p className="text-sm">{doc.anomalyCount}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">File Size</p>
                    <p className="text-sm">{(doc.fileSize / 1024).toFixed(2)} KB</p>
                  </div>

                  {doc.summary && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Summary</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {doc.summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};