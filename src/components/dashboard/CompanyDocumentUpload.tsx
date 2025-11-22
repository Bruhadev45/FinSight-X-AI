"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, Loader2, Brain, ChevronDown, ChevronUp, AlertTriangle, Shield, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { renderSafe } from "@/lib/utils/renderSafe";

interface AgentResult {
  agentType: string;
  findings: any[];
  confidence: number;
  processingTime: number;
}

interface UploadedFile {
  file: File;
  status: "uploading" | "analyzing" | "completed" | "error";
  progress: number;
  analysis?: {
    risk: string;
    anomalies: number;
    compliance: string;
    summary: string;
    agentResults: AgentResult[];
  };
  documentId?: number;
  showDetails?: boolean;
}

const agentNames: Record<string, string> = {
  parser: "Document Parser",
  analyzer: "Financial Analyzer",
  compliance: "Compliance Monitor",
  anomaly: "Anomaly Detector",
  fraud: "Fraud Analyzer",
  risk: "Risk Assessor",
  validator: "Data Validator",
};

const agentIcons: Record<string, any> = {
  parser: FileText,
  analyzer: TrendingUp,
  compliance: Shield,
  anomaly: AlertTriangle,
  fraud: AlertTriangle,
  risk: TrendingUp,
  validator: CheckCircle,
};

type AnalysisMode = "quick" | "deep" | "batch";

interface CompanyDocumentUploadProps {
  companyId: string;
  companyName: string;
  onUploadComplete?: () => void;
}

export const CompanyDocumentUpload = ({ companyId, companyName, onUploadComplete }: CompanyDocumentUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<number>>(new Set());
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("quick");
  const [showCompleted, setShowCompleted] = useState(true);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const toggleDetails = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], showDetails: !updated[index].showDetails };
      return updated;
    });
  };

  const clearCompletedFiles = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "completed"));
    toast.success("Completed files cleared");
  };

  const handleDeleteFile = async (index: number, documentId?: number) => {
    if (!documentId) {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("File removed");
      return;
    }

    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingFiles((prev) => new Set(prev).add(index));

      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }

      setFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("Document deleted successfully");

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete document");
    } finally {
      setDeletingFiles((prev) => {
        const updated = new Set(prev);
        updated.delete(index);
        return updated;
      });
    }
  };

  const processFiles = async (fileList: File[]) => {
    const validFiles = fileList.filter((file) => {
      const validTypes = [
        "application/pdf",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      toast.error("Please upload valid financial documents (PDF, CSV, XLSX, TXT)");
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      file,
      status: "uploading",
      progress: 0,
      showDetails: false,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Process based on mode
    if (analysisMode === "batch" && validFiles.length > 1) {
      toast.info(`📦 Batch mode: Processing ${validFiles.length} files...`);
      await Promise.all(
        newFiles.map((_, i) => uploadAndAnalyzeFile(files.length + i, newFiles[i]))
      );
      toast.success(`✅ Batch analysis complete for ${validFiles.length} files!`);
    } else {
      for (let i = 0; i < newFiles.length; i++) {
        await uploadAndAnalyzeFile(files.length + i, newFiles[i]);
      }
    }
  };

  const uploadAndAnalyzeFile = async (index: number, uploadedFile: UploadedFile) => {
    try {
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "uploading", progress: 10 };
        return updated;
      });

      const saveDocResponse = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.file.type,
          fileSize: uploadedFile.file.size,
          userId: null,
          companyId: parseInt(companyId),
        }),
      });

      if (!saveDocResponse.ok) throw new Error("Failed to save document");

      const savedDoc = await saveDocResponse.json();
      const documentId = savedDoc.id;

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "analyzing", progress: 30, documentId };
        return updated;
      });

      let fileContent = "";
      
      if (
        uploadedFile.file.type === "application/pdf" ||
        uploadedFile.file.type.startsWith("image/")
      ) {
        const ocrFormData = new FormData();
        ocrFormData.append("file", uploadedFile.file);

        const ocrResponse = await fetch("/api/ocr", {
          method: "POST",
          body: ocrFormData,
        });

        if (ocrResponse.ok) {
          const ocrResult = await ocrResponse.json();
          fileContent = ocrResult.text || "";
          
          if (fileContent.length > 0 && analysisMode !== "batch") {
            toast.success(`✅ OCR extracted ${fileContent.length} characters`);
          }
        } else {
          console.warn("OCR failed, falling back to text extraction");
          fileContent = await uploadedFile.file.text();
        }
      } else {
        fileContent = await uploadedFile.file.text();
      }

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], progress: 60 };
        return updated;
      });

      const analyzeResponse = await fetch("/api/multi-agent-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadedFile.file.name,
          fileContent,
          fileType: uploadedFile.file.type,
        }),
      });

      if (!analyzeResponse.ok) throw new Error("Failed to analyze document");

      const analysisResult = await analyzeResponse.json();
      
      const complianceAgent = analysisResult.agentResults?.find((a: any) => a.agentType === "compliance");
      const complianceStatus = complianceAgent?.findings?.some((f: any) => f.status === "compliant") ? "Pass" : "Review Required";
      
      const analysis = {
        risk: analysisResult.overallRisk || "low",
        anomalies: analysisResult.keyFindings?.length || 0,
        compliance: complianceStatus,
        summary: analysisResult.keyFindings?.[0] || "Analysis completed successfully",
        agentResults: analysisResult.agentResults || []
      };

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], progress: 90 };
        return updated;
      });

      await Promise.all([
        fetch(`/api/documents?id=${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            riskLevel: analysis.risk,
            anomalyCount: analysis.anomalies,
            complianceStatus: analysis.compliance,
            summary: analysis.summary,
          }),
        }),

        ...analysis.agentResults.map(agentResult => {
          const analysisTypeMap: Record<string, string> = {
            'parser': 'risk',
            'analyzer': 'compliance',
            'anomaly': 'risk',
            'fraud': 'fraud',
            'compliance': 'compliance'
          };
          
          const analysisType = analysisTypeMap[agentResult.agentType] || 'risk';
          
          const findingsArray = agentResult.findings?.map((f: any) =>
            typeof f === 'string' ? f : (f.description || f.content || f.message || 'Finding detected')
          ) || [];
          
          return fetch("/api/document-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentId,
              analysisType,
              keyFindings: findingsArray.slice(0, 10),
              fraudIndicators: agentResult.agentType === "fraud" ? findingsArray : [],
              confidenceScore: agentResult.confidence || 0.85,
            }),
          });
        }),

        analysis.risk === "high" ? fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alertType: "fraud",
            severity: "high",
            title: `High Risk Document: ${uploadedFile.file.name}`,
            description: analysis.summary,
            sourceDocumentId: documentId,
            companyId: parseInt(companyId),
          }),
        }) : Promise.resolve(),
      ]);

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: "completed",
          progress: 100,
          analysis,
          documentId,
          showDetails: false,
        };
        return updated;
      });

      if (analysisMode !== "batch") {
        if (analysis.risk === "high") {
          toast.error(`🚨 High risk detected in ${uploadedFile.file.name}`);
        } else if (analysis.risk === "medium") {
          toast.warning(`⚠️ Medium risk detected in ${uploadedFile.file.name}`);
        } else {
          toast.success(`✅ ${uploadedFile.file.name} analyzed successfully`);
        }
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "error", progress: 0 };
        return updated;
      });
      toast.error(`Failed to process ${uploadedFile.file.name}`);
    }
  };

  const completedCount = files.filter((f) => f.status === "completed").length;
  const processingCount = files.filter((f) => f.status === "uploading" || f.status === "analyzing").length;

  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Upload Documents for {companyName}
        </CardTitle>
        <CardDescription>AI-powered OCR analysis for company documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Mode Selection */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <Label className="text-sm font-semibold mb-3 block">Analysis Mode</Label>
          <RadioGroup value={analysisMode} onValueChange={(v) => setAnalysisMode(v as AnalysisMode)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quick" id="company-quick" />
              <Label htmlFor="company-quick" className="cursor-pointer">
                <span className="font-medium">⚡ Quick Analysis</span>
                <span className="text-xs text-gray-500 block">Single document • Standard depth • Fastest</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deep" id="company-deep" />
              <Label htmlFor="company-deep" className="cursor-pointer">
                <span className="font-medium">🔍 Deep Analysis</span>
                <span className="text-xs text-gray-500 block">Single document • Comprehensive scan • Most detailed</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="batch" id="company-batch" />
              <Label htmlFor="company-batch" className="cursor-pointer">
                <span className="font-medium">📦 Batch Processing</span>
                <span className="text-xs text-gray-500 block">Multiple documents • Parallel processing • Fastest for bulk uploads</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-gray-300 dark:border-gray-700 hover:border-indigo-400"
          }`}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium mb-2">Drag & drop files here</p>
          <p className="text-xs text-gray-500 mb-3">or</p>
          <label htmlFor="company-file-upload">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <span>Select Files</span>
            </Button>
          </label>
          <input
            id="company-file-upload"
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.txt,image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-3">Supported: PDF, CSV, XLSX, TXT, Images</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
            ✨ OCR-enabled for image-based PDFs and scanned documents
          </p>
        </div>

        {/* Status Summary */}
        {files.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">{files.length} Total</span>
              {processingCount > 0 && (
                <span className="text-indigo-600">⏳ {processingCount} Processing</span>
              )}
              {completedCount > 0 && (
                <span className="text-green-600">✅ {completedCount} Completed</span>
              )}
            </div>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {showCompleted ? "Hide" : "Show"} Completed
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCompletedFiles}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Completed
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {files.map((fileData, index) => {
              // Hide completed files if showCompleted is false
              if (!showCompleted && fileData.status === "completed") return null;

              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{fileData.file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(fileData.file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                              onClick={() => handleDeleteFile(index, fileData.documentId)}
                              disabled={deletingFiles.has(index)}
                            >
                              {deletingFiles.has(index) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {fileData.status === "uploading" && (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                              <span className="text-sm text-indigo-600">Uploading...</span>
                            </div>
                          )}
                          {fileData.status === "analyzing" && (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                              <span className="text-sm text-purple-600">
                                {analysisMode === "batch" ? "⚡ Batch Analysis..." : "OCR + AI Analysis..."}
                              </span>
                            </div>
                          )}
                          {fileData.status === "completed" && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Analysis Complete</span>
                            </div>
                          )}
                          {fileData.status === "error" && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600">Failed</span>
                            </div>
                          )}

                          {(fileData.status === "uploading" || fileData.status === "analyzing") && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${fileData.progress}%` }}
                              />
                            </div>
                          )}

                          {fileData.status === "completed" && fileData.analysis && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant={
                                    fileData.analysis.risk === "high"
                                      ? "destructive"
                                      : fileData.analysis.risk === "medium"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  Risk: {fileData.analysis.risk.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {fileData.analysis.anomalies} Findings
                                </Badge>
                                <Badge variant={fileData.analysis.compliance === "Pass" ? "secondary" : "destructive"}>
                                  {fileData.analysis.compliance}
                                </Badge>
                                <Badge variant="outline">
                                  {fileData.analysis.agentResults?.length || 5} Agents
                                </Badge>
                              </div>

                              {/* Toggle Details Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleDetails(index)}
                                className="w-full justify-between"
                              >
                                <span className="text-xs">View Detailed Analysis</span>
                                {fileData.showDetails ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detailed Analysis Results */}
                      {fileData.status === "completed" && fileData.analysis && fileData.showDetails && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Summary</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {fileData.analysis.summary}
                            </p>
                          </div>

                          {fileData.analysis.agentResults.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                AI Agent Analysis Results
                              </h4>
                              <div className="space-y-2">
                                {fileData.analysis.agentResults.map((agent, agentIdx) => {
                                  const AgentIcon = agentIcons[agent.agentType] || Brain;
                                  return (
                                    <div
                                      key={agentIdx}
                                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <AgentIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                          <span className="text-xs font-medium">
                                            {agentNames[agent.agentType] || agent.agentType}
                                          </span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {(agent.confidence * 100).toFixed(0)}% confident
                                        </Badge>
                                      </div>
                                      {agent.findings && agent.findings.length > 0 && (
                                        <ul className="space-y-1 ml-6">
                                          {agent.findings.slice(0, 3).map((finding: any, findingIdx: number) => (
                                            <li key={findingIdx} className="text-xs text-gray-600 dark:text-gray-400 list-disc">
                                              {renderSafe(finding)}
                                            </li>
                                          ))}
                                          {agent.findings.length > 3 && (
                                            <li className="text-xs text-gray-500 italic">
                                              + {agent.findings.length - 3} more findings...
                                            </li>
                                          )}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Action for completed uploads */}
        {completedCount > 0 && processingCount === 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">✅ All files processed successfully!</p>
                <p className="text-sm text-green-600 dark:text-green-400">Ready to upload more documents</p>
              </div>
              <Button onClick={clearCompletedFiles} variant="outline" className="border-green-300">
                Upload More Files
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};