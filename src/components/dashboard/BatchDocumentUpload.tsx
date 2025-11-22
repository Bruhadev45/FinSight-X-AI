"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentStatus {
  id: string;
  file: File;
  status: "pending" | "uploading" | "analyzing" | "complete" | "error";
  progress: number;
  error?: string;
  results?: {
    riskLevel?: string;
    insights?: string[];
    entities?: string[];
  };
}

export function BatchDocumentUpload() {
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments: DocumentStatus[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "pending" as const,
      progress: 0,
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(`${acceptedFiles.length} document(s) added to queue`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
    },
    maxSize: 10485760, // 10MB
  });

  const processDocuments = async () => {
    setIsProcessing(true);

    for (const doc of documents.filter((d) => d.status === "pending")) {
      try {
        // Update status to uploading
        updateDocumentStatus(doc.id, { status: "uploading", progress: 30 });
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simulate upload
        const formData = new FormData();
        formData.append("file", doc.file);

        updateDocumentStatus(doc.id, { status: "analyzing", progress: 60 });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock API call for multi-agent analysis
        const analysisResults = await mockMultiAgentAnalysis(doc.file);

        updateDocumentStatus(doc.id, {
          status: "complete",
          progress: 100,
          results: analysisResults,
        });

        toast.success(`${doc.file.name} analyzed successfully`);
      } catch (error) {
        updateDocumentStatus(doc.id, {
          status: "error",
          progress: 0,
          error: "Analysis failed. Please try again.",
        });
        toast.error(`Failed to analyze ${doc.file.name}`);
      }
    }

    setIsProcessing(false);
    toast.success("Batch processing complete!");
  };

  const updateDocumentStatus = (
    id: string,
    updates: Partial<DocumentStatus>
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const clearCompleted = () => {
    setDocuments((prev) =>
      prev.filter((doc) => doc.status !== "complete" && doc.status !== "error")
    );
  };

  const exportResults = () => {
    const results = documents
      .filter((doc) => doc.status === "complete")
      .map((doc) => ({
        fileName: doc.file.name,
        riskLevel: doc.results?.riskLevel,
        insights: doc.results?.insights,
        entities: doc.results?.entities,
      }));

    const dataStr = JSON.stringify(results, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `batch-analysis-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Results exported successfully");
  };

  const getOverallProgress = () => {
    if (documents.length === 0) return 0;
    const total = documents.reduce((acc, doc) => acc + doc.progress, 0);
    return Math.round(total / documents.length);
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      processing: 0,
      complete: 0,
      error: 0,
    };

    documents.forEach((doc) => {
      if (doc.status === "pending") counts.pending++;
      else if (doc.status === "uploading" || doc.status === "analyzing")
        counts.processing++;
      else if (doc.status === "complete") counts.complete++;
      else if (doc.status === "error") counts.error++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Batch Document Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompleted}
              disabled={statusCounts.complete === 0 && statusCounts.error === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Completed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              disabled={statusCounts.complete === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium">Drop documents here...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                Drop 10-50 documents here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, XLSX, CSV, TXT (Max 10MB each)
              </p>
            </>
          )}
        </div>

        {/* Summary Stats */}
        {documents.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{documents.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {statusCounts.processing}
                </div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {statusCounts.complete}
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {statusCounts.error}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overall Progress */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Processing: {statusCounts.processing + statusCounts.complete}/
                {documents.length} documents
              </span>
              <span className="text-muted-foreground">
                {getOverallProgress()}%
              </span>
            </div>
            <Progress value={getOverallProgress()} className="h-2" />
          </div>
        )}

        {/* Document List */}
        {documents.length > 0 && (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-1">
                      {doc.status === "complete" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {doc.status === "error" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {(doc.status === "uploading" ||
                        doc.status === "analyzing") && (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      )}
                      {doc.status === "pending" && (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {doc.file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              doc.status === "complete"
                                ? "default"
                                : doc.status === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {doc.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>

                      {doc.status !== "pending" && doc.status !== "error" && (
                        <Progress value={doc.progress} className="h-1 mb-2" />
                      )}

                      {doc.error && (
                        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{doc.error}</span>
                        </div>
                      )}

                      {doc.results && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Risk Level:</span>
                            <Badge
                              variant={
                                doc.results.riskLevel === "high"
                                  ? "destructive"
                                  : doc.results.riskLevel === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {doc.results.riskLevel}
                            </Badge>
                          </div>
                          {doc.results.insights && (
                            <div>
                              <span className="font-medium">Insights:</span>
                              <ul className="ml-4 mt-1 list-disc">
                                {doc.results.insights
                                  .slice(0, 2)
                                  .map((insight, i) => (
                                    <li key={i}>{insight}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        {documents.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={processDocuments}
              disabled={
                isProcessing ||
                documents.filter((d) => d.status === "pending").length === 0
              }
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing {statusCounts.processing} document(s)...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Analyze {statusCounts.pending} Document(s)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock multi-agent analysis function
async function mockMultiAgentAnalysis(file: File) {
  // Simulate AI analysis
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const riskLevels = ["low", "medium", "high"];
  const insights = [
    "Revenue increased by 25% YoY",
    "Debt ratio within acceptable range",
    "Strong cash flow position",
    "No unusual transactions detected",
    "Compliance with IFRS standards",
  ];
  const entities = ["TechCorp Inc.", "Q4 2024", "$10M Revenue", "John Doe - CEO"];

  return {
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    insights: insights.slice(0, Math.floor(Math.random() * 3) + 2),
    entities: entities.slice(0, Math.floor(Math.random() * 3) + 2),
  };
}
