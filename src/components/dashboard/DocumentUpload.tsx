"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Loader2, Brain, Shield, Search, AlertCircle, FileCheck, ChevronDown, ChevronUp, Trash2, Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { renderSafe, renderArraySafe } from "@/lib/utils/renderSafe";

interface AgentResult {
  agentType: string;
  findings: any[];
  confidence: number;
  processingTime: number;
  metadata?: any;
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
    keyFindings: string[];
    fraudIndicators: string[];
    recommendations: string[];
    agentResults: AgentResult[];
  };
  documentId?: number;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const agentIcons = {
  parser: FileText,
  validator: FileCheck,
  analyzer: Search,
  compliance: Shield,
  anomaly: AlertCircle,
  fraud: AlertTriangle,
  risk: AlertCircle,
};

const agentNames: Record<string, string> = {
  parser: "Document Parser",
  analyzer: "Financial Analyzer",
  compliance: "Compliance Monitor",
  anomaly: "Anomaly Detector",
  fraud: "Fraud Analyzer",
  risk: "Risk Assessor",
  validator: "Data Validator",
};

type AnalysisMode = "quick" | "deep" | "batch";

export function DocumentUpload() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("quick");
  const [showCompleted, setShowCompleted] = useState(true);
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());

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

  const clearCompletedFiles = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "completed"));
    toast.success("Completed files cleared");
  };

  const deleteFile = async (index: number, fileData: UploadedFile) => {
    if (fileData.documentId) {
      try {
        const token = localStorage.getItem("bearer_token");
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(`/api/documents?id=${fileData.documentId}`, {
          method: "DELETE",
          headers,
        });
        
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete file from database");
      }
    }
    
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFileExpansion = (index: number) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const processFiles = async (fileList: File[]) => {
    const oversizedFiles = fileList.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(", ");
      toast.error(`⚠️ Files too large: ${fileList}. Maximum size is 100MB per file.`, {
        duration: 6000,
      });
      return;
    }

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
    }));

    setFiles((prev) => [...prev, ...newFiles]);

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
      const analysisDepth = analysisMode === "quick" ? "standard" : "comprehensive";
      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "uploading", progress: 10 };
        return updated;
      });

      const saveDocResponse = await fetch("/api/documents", {
        method: "POST",
        headers,
        body: JSON.stringify({
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.file.type,
          fileSize: uploadedFile.file.size,
          userId: null,
        }),
      });

      if (!saveDocResponse.ok) {
        const errorData = await saveDocResponse.json().catch(() => ({}));
        throw new Error(`Failed to save document: ${errorData.error || saveDocResponse.statusText}`);
      }

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

        const ocrHeaders: HeadersInit = {};
        if (token) {
          ocrHeaders["Authorization"] = `Bearer ${token}`;
        }

        const ocrResponse = await fetch("/api/ocr", {
          method: "POST",
          headers: ocrHeaders,
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

      const isFinanceRelated = validateFinanceDocument(fileContent, uploadedFile.file.name);
      
      if (!isFinanceRelated) {
        const deleteHeaders: HeadersInit = {};
        if (token) {
          deleteHeaders["Authorization"] = `Bearer ${token}`;
        }

        await fetch(`/api/documents?id=${documentId}`, {
          method: "DELETE",
          headers: deleteHeaders,
        }).catch(err => console.error("Failed to delete irrelevant document:", err));

        setFiles((prev) => prev.filter((_, i) => i !== index));
        
        toast.error(`🚫 Irrelevant Document: "${uploadedFile.file.name}" is not a financial document and has been removed`, {
          duration: 5000,
        });
        
        return;
      }

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], progress: 60 };
        return updated;
      });

      const analyzeResponse = await fetch("/api/multi-agent-analysis", {
        method: "POST",
        headers,
        body: JSON.stringify({
          fileName: uploadedFile.file.name,
          fileContent,
          fileType: uploadedFile.file.type,
        }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json().catch(() => ({}));
        throw new Error(`Failed to analyze document: ${errorData.error || analyzeResponse.statusText}`);
      }

      const analysisResult = await analyzeResponse.json();
      
      const complianceAgent = analysisResult.agentResults?.find((a: any) => a.agentType === "compliance");
      const complianceStatus = complianceAgent?.findings?.some((f: any) => f.status === "compliant") ? "Pass" : "Review Required";
      
      const analysis = {
        risk: analysisResult.overallRisk || "low",
        anomalies: analysisResult.keyFindings?.length || 0,
        compliance: complianceStatus,
        summary: analysisResult.keyFindings?.[0] || "Analysis completed successfully",
        keyFindings: renderArraySafe(analysisResult.keyFindings || []),
        fraudIndicators: renderArraySafe(analysisResult.agentResults?.find((a: any) => a.agentType === "fraud")?.findings || []),
        recommendations: renderArraySafe(analysisResult.recommendations || []),
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
          headers,
          body: JSON.stringify({
            status: "completed",
            riskLevel: analysis.risk,
            anomalyCount: analysis.anomalies,
            complianceStatus: analysis.compliance,
            summary: analysis.summary,
          }),
        }).catch(err => console.error("Failed to update document:", err)),

        ...analysis.agentResults.filter(agentResult => agentResult != null && agentResult.agentType != null).map(agentResult => {
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
            headers,
            body: JSON.stringify({
              documentId,
              analysisType,
              keyFindings: findingsArray.slice(0, 10),
              fraudIndicators: agentResult.agentType === "fraud" ? findingsArray : [],
              confidenceScore: agentResult.confidence || 0.85,
            }),
          }).catch(err => console.error("Failed to save analysis:", err));
        }),

        ...analysis.agentResults.filter(agentResult => agentResult != null && agentResult.agentType != null).map(agentResult => {
          const agentNameMap: Record<string, string> = {
            'parser': 'parser',
            'analyzer': 'validator',
            'anomaly': 'anomaly_detector',
            'fraud': 'fraud_pattern',
            'compliance': 'compliance'
          };
          
          const agentName = agentNameMap[agentResult.agentType] || 'parser';
          
          return fetch("/api/ai-agent-logs", {
            method: "POST",
            headers,
            body: JSON.stringify({
              agentName,
              documentId,
              taskType: agentNames[agentResult.agentType] || agentResult.agentType,
              status: "completed",
              processingTimeMs: agentResult.processingTime || 0,
              resultSummary: `Confidence: ${((agentResult.confidence || 0) * 100).toFixed(1)}%`,
            }),
          }).catch(err => console.error("Failed to log agent activity:", err));
        }),

        analysis.risk === "high" ? fetch("/api/alerts", {
          method: "POST",
          headers,
          body: JSON.stringify({
            alertType: "fraud",
            severity: "high",
            title: `High Risk Document: ${uploadedFile.file.name}`,
            description: analysis.summary,
            sourceDocumentId: documentId,
          }),
        }).catch(err => console.error("Failed to create alert:", err)) : Promise.resolve(),
      ]);

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: "completed",
          progress: 100,
          analysis,
          documentId,
        };
        return updated;
      });

      setExpandedFiles(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
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
    } catch (error: any) {
      console.error("Upload error details:", error);
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "error", progress: 0 };
        return updated;
      });
      
      const errorMessage = error?.message || "Unknown error occurred";
      toast.error(`Failed to process ${uploadedFile.file.name}: ${errorMessage}`, {
        duration: 6000,
      });
    }
  };

  const validateFinanceDocument = (content: string, fileName: string): boolean => {
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    const financeKeywords = [
      'balance sheet', 'income statement', 'cash flow', 'profit and loss', 'p&l',
      'financial statement', 'annual report', 'quarterly report',
      'revenue', 'expenses', 'assets', 'liabilities', 'equity', 'depreciation',
      'amortization', 'accounts payable', 'accounts receivable', 'retained earnings',
      'ebitda', 'gross profit', 'net income', 'operating income', 'roi', 'eps',
      'earnings per share', 'dividend', 'capital', 'investment',
      'transaction', 'invoice', 'receipt', 'payment', 'bank statement',
      'credit', 'debit', 'interest', 'loan', 'mortgage',
      'tax', 'irs', 'audit', 'compliance', 'gaap', 'ifrs', 'fasb',
      'sec filing', '10-k', '10-q', 'fiscal year',
      '$', '€', '£', '¥', 'usd', 'eur', 'gbp',
      'liquidity', 'solvency', 'profitability', 'leverage',
      'budget', 'forecast', 'projection', 'variance analysis',
      'financial', 'finance', 'accounting', 'fiscal', 'monetary'
    ];
    
    const nonFinanceKeywords = [
      'recipe', 'cooking', 'novel', 'story', 'poem', 'lyrics',
      'vacation', 'travel itinerary', 'shopping list', 'to-do list',
      'medical history', 'prescription', 'diagnosis',
      'resume', 'curriculum vitae', 'cover letter',
      'research paper', 'thesis', 'dissertation',
      'user manual', 'instruction manual', 'how-to guide'
    ];
    
    const hasNonFinanceContent = nonFinanceKeywords.some(keyword => 
      lowerContent.includes(keyword) || lowerFileName.includes(keyword)
    );
    
    if (hasNonFinanceContent) {
      return false;
    }
    
    const financeKeywordCount = financeKeywords.filter(keyword => 
      lowerContent.includes(keyword) || lowerFileName.includes(keyword)
    ).length;
    
    const minKeywords = content.length < 500 ? 1 : 2;
    
    const hasFinancialNumbers = /(\$|€|£|¥)\s*[\d,]+\.?\d*/.test(content) ||
                                /\d+\.\d{2}/.test(content) ||
                                /\d{1,3}(,\d{3})*/.test(content);
    
    return financeKeywordCount >= minKeywords || 
           (hasFinancialNumbers && financeKeywordCount >= 1);
  };

  const completedCount = files.filter((f) => f.status === "completed").length;
  const processingCount = files.filter((f) => f.status === "uploading" || f.status === "analyzing").length;

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Multi-Agent Document Analysis with OCR
        </CardTitle>
        <CardDescription>
          Upload documents for analysis by 5 specialized AI agents • OCR-enabled for image-based PDFs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Mode Selection */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <Label className="text-sm font-semibold mb-3 block">Analysis Mode</Label>
          <RadioGroup value={analysisMode} onValueChange={(v) => setAnalysisMode(v as AnalysisMode)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quick" id="quick" />
              <Label htmlFor="quick" className="cursor-pointer">
                <span className="font-medium">⚡ Quick Analysis</span>
                <span className="text-xs text-gray-500 block">Single document • Standard depth • Fastest</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deep" id="deep" />
              <Label htmlFor="deep" className="cursor-pointer">
                <span className="font-medium">🔍 Deep Analysis</span>
                <span className="text-xs text-gray-500 block">Single document • Comprehensive scan • Most detailed</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="batch" id="batch" />
              <Label htmlFor="batch" className="cursor-pointer">
                <span className="font-medium">📦 Batch Processing</span>
                <span className="text-xs text-gray-500 block">Multiple documents • Parallel processing • Fastest for bulk uploads</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* File Size Info Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold">📏 File Size Limit: 100MB per file</p>
              <p className="text-xs mt-1">
                Browser memory constraints limit uploads to 100MB. For larger files, consider splitting them or uploading via API.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-lg font-medium mb-2">Drag & drop files here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label htmlFor="file-upload">
            <Button asChild variant="outline">
              <span>Browse Files</span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.txt,image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, CSV, XLSX, TXT, Images (PNG, JPG)</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
            ✨ OCR-Powered: Extracts text from image-based PDFs and scanned documents
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            5 AI Agents: Parser • Validator • Anomaly Detector • Fraud Analyzer • Compliance Monitor
          </p>
        </div>

        {/* Status Summary */}
        {files.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">{files.length} Total</span>
              {processingCount > 0 && (
                <span className="text-blue-600">⏳ {processingCount} Processing</span>
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
          <div className="space-y-4">
            {files.map((fileData, index) => {
              if (!showCompleted && fileData.status === "completed") return null;

              const isExpanded = expandedFiles.has(index);
              const firstAgentType = fileData.analysis?.agentResults?.[0]?.agentType;
              const AgentIcon = (firstAgentType && agentIcons[firstAgentType as keyof typeof agentIcons]) || Brain;

              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{fileData.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(fileData.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          {fileData.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(index, fileData)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          {fileData.status === "uploading" && (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              <span className="text-sm text-blue-600">Uploading...</span>
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
                              <span className="text-sm text-green-600">
                                Analysis Complete
                              </span>
                            </div>
                          )}
                          {fileData.status === "error" && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600">Upload Failed</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {(fileData.status === "uploading" || fileData.status === "analyzing") && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${fileData.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Analysis Results */}
                        {fileData.status === "completed" && fileData.analysis && (
                          <div className="space-y-3">
                            {/* Quick Summary Badges */}
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant={
                                  fileData.analysis.risk === "high"
                                    ? "destructive"
                                    : fileData.analysis.risk === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-sm px-3 py-1"
                              >
                                🎯 Risk: {fileData.analysis.risk.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-sm px-3 py-1">
                                📊 {fileData.analysis.anomalies} Findings
                              </Badge>
                              <Badge
                                variant={
                                  fileData.analysis.compliance === "Pass"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-sm px-3 py-1"
                              >
                                {fileData.analysis.compliance === "Pass" ? "✅" : "⚠️"} {fileData.analysis.compliance}
                              </Badge>
                              <Badge variant="outline" className="text-sm px-3 py-1">
                                🤖 {fileData.analysis.agentResults?.length || 5} Agents
                              </Badge>
                            </div>

                            {/* Summary Text */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                📊 Analysis Summary
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                {renderSafe(fileData.analysis.summary)}
                              </p>
                            </div>

                            {/* Preview of Key Findings */}
                            {fileData.analysis.keyFindings && fileData.analysis.keyFindings.length > 0 && (
                              <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-300 dark:border-green-700">
                                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Key Findings Preview ({fileData.analysis.keyFindings.length} total)
                                </h4>
                                <ul className="space-y-1.5">
                                  {fileData.analysis.keyFindings.slice(0, 3).map((finding, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                                      <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                                      <span className="line-clamp-2">{renderSafe(finding)}</span>
                                    </li>
                                  ))}
                                </ul>
                                {fileData.analysis.keyFindings.length > 3 && (
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                    + {fileData.analysis.keyFindings.length - 3} more findings
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Preview of Fraud Indicators */}
                            {fileData.analysis.fraudIndicators && fileData.analysis.fraudIndicators.length > 0 && (
                              <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-300 dark:border-red-700">
                                <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  ⚠️ Fraud Indicators ({fileData.analysis.fraudIndicators.length})
                                </h4>
                                <ul className="space-y-1.5">
                                  {fileData.analysis.fraudIndicators.slice(0, 2).map((indicator, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                                      <span className="text-red-600 dark:text-red-400 font-bold mt-0.5 flex-shrink-0">⚠</span>
                                      <span className="line-clamp-2">{renderSafe(indicator)}</span>
                                    </li>
                                  ))}
                                </ul>
                                {fileData.analysis.fraudIndicators.length > 2 && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                                    + {fileData.analysis.fraudIndicators.length - 2} more indicators
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Expandable Full Details */}
                            <Collapsible open={isExpanded} onOpenChange={() => toggleFileExpansion(index)}>
                              <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full gap-2">
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4" />
                                      Hide Full Detailed Analysis
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4" />
                                      View Full Detailed Analysis
                                    </>
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent className="mt-3 space-y-4">
                                {/* All Key Findings */}
                                {fileData.analysis.keyFindings && fileData.analysis.keyFindings.length > 0 && (
                                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4" />
                                      All Key Findings ({fileData.analysis.keyFindings.length})
                                    </h4>
                                    <ul className="space-y-2">
                                      {fileData.analysis.keyFindings.map((finding, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                                          <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                                          <span>{renderSafe(finding)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* All Fraud Indicators */}
                                {fileData.analysis.fraudIndicators && fileData.analysis.fraudIndicators.length > 0 && (
                                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                    <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      All Fraud Indicators ({fileData.analysis.fraudIndicators.length})
                                    </h4>
                                    <ul className="space-y-2">
                                      {fileData.analysis.fraudIndicators.map((indicator, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                                          <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">⚠</span>
                                          <span>{renderSafe(indicator)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Agent Results Breakdown */}
                                {fileData.analysis.agentResults && fileData.analysis.agentResults.length > 0 && (
                                  <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                                      <Brain className="h-4 w-4" />
                                      AI Agent Results ({fileData.analysis.agentResults.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {fileData.analysis.agentResults.filter(agent => agent != null).map((agent, idx) => {
                                        const Icon = (agent.agentType && agentIcons[agent.agentType as keyof typeof agentIcons]) || Brain;
                                        const agentDisplayName = agent.agentType ? (agentNames[agent.agentType] || agent.agentType) : "Unknown Agent";
                                        return (
                                          <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded border">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                              <span className="text-xs font-semibold">
                                                {agentDisplayName}
                                              </span>
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                              <p>Confidence: {((agent.confidence || 0) * 100).toFixed(1)}%</p>
                                              <p>Time: {agent.processingTime || 0}ms</p>
                                              <p>Findings: {agent.findings?.length || 0}</p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Recommendations */}
                                {fileData.analysis.recommendations && fileData.analysis.recommendations.length > 0 && (
                                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                      <TrendingUp className="h-4 w-4" />
                                      Recommendations ({fileData.analysis.recommendations.length})
                                    </h4>
                                    <ul className="space-y-2">
                                      {fileData.analysis.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                                          <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">💡</span>
                                          <span>{renderSafe(rec)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="flex-1 gap-2"
                                    onClick={() => {
                                      if (fileData.documentId) {
                                        router.push(`/dashboard/document/${fileData.documentId}`);
                                      }
                                    }}
                                  >
                                    <FileText className="h-4 w-4" />
                                    View Full Report
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const content = `# ${fileData.file.name} - Analysis Report

## Summary
${renderSafe(fileData.analysis?.summary) || "N/A"}

## Risk Assessment
- **Risk Level**: ${fileData.analysis?.risk?.toUpperCase() || "N/A"}
- **Compliance**: ${fileData.analysis?.compliance || "N/A"}
- **Anomalies Detected**: ${fileData.analysis?.anomalies || 0}

## Key Findings
${fileData.analysis?.keyFindings?.map((f, i) => `${i + 1}. ${renderSafe(f)}`).join('\n') || "None"}

## Fraud Indicators
${fileData.analysis?.fraudIndicators?.map((f, i) => `${i + 1}. ${renderSafe(f)}`).join('\n') || "None detected"}

## Recommendations
${fileData.analysis?.recommendations?.map((r, i) => `${i + 1}. ${renderSafe(r)}`).join('\n') || "None"}

## AI Agent Results
${fileData.analysis?.agentResults?.filter(a => a != null).map(a => `- **${a.agentType ? (agentNames[a.agentType] || a.agentType) : "Unknown"}**: ${((a.confidence || 0) * 100).toFixed(1)}% confidence, ${a.findings?.length || 0} findings`).join('\n') || "N/A"}

---
Generated: ${new Date().toLocaleString()}
`;
                                      const blob = new Blob([content], { type: "text/markdown" });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = `${fileData.file.name.replace(/\.[^/.]+$/, "")}_analysis.md`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                      toast.success("Analysis report downloaded!");
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}
                      </div>
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
}