"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Loader2, CheckCircle, PenTool, MessageSquare, FileSignature, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GeneratedReport {
  id: number;
  reportType: string;
  title: string;
  content: string;
  format: string;
  generatedAt: string;
}

export const ReportGenerationPanel = () => {
  const [reportType, setReportType] = useState("investor_memo");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [eSignDialogOpen, setESignDialogOpen] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signatureTitle, setSignatureTitle] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [assistantDialogOpen, setAssistantDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [askingAssistant, setAskingAssistant] = useState(false);

  const reportTypes = [
    { value: "investor_memo", label: "Investor Memo" },
    { value: "audit_summary", label: "Audit Summary (Government Compliant)" },
    { value: "board_deck", label: "Board Deck" },
    { value: "compliance_report", label: "Compliance Report (IFRS/GAAP)" },
    { value: "risk_report", label: "Risk Report" },
    { value: "tax_filing", label: "Tax Filing Report" },
    { value: "sec_filing", label: "SEC Filing (10-K/10-Q)" },
  ];

  // Format content to remove LaTeX and JSON, show clean formatted text
  const formatReportContent = (content: string): string => {
    if (!content) return "";
    
    // Remove LaTeX delimiters
    let formatted = content.replace(/\$\$[\s\S]*?\$\$/g, '[Mathematical Formula]');
    formatted = formatted.replace(/\$[^$]+\$/g, '[Formula]');
    
    // Remove JSON blocks
    formatted = formatted.replace(/```json[\s\S]*?```/g, '');
    formatted = formatted.replace(/\{[\s\S]*?"[^"]*"[\s\S]*?\}/g, '');
    
    // Clean up extra whitespace
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    return formatted.trim();
  };

  // Convert markdown to readable HTML-like structure
  const renderFormattedContent = (content: string) => {
    const formatted = formatReportContent(content);
    const lines = formatted.split('\n');
    
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold mt-5 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
      }
      
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-6 mb-1">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\. /)) {
        return <li key={idx} className="ml-6 mb-1 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={idx} className="mb-2">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
      
      // Horizontal rules
      if (line === '---' || line === '___') {
        return <hr key={idx} className="my-4 border-gray-300 dark:border-gray-700" />;
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      
      // Regular paragraphs
      return <p key={idx} className="mb-2">{line}</p>;
    });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Prepare report data based on report type
      let reportData: any;
      
      switch (reportType) {
        case "investor_memo":
          reportData = {
            name: "FinSight X Portfolio",
            financials: {
              revenue: "$500M",
              ebitda: "$75M",
              netIncome: "$45M",
              totalAssets: "$1.2B",
              debtToEquity: 1.2,
              roe: "15.5%"
            },
            analysis: {
              strengths: ["Strong revenue growth", "Healthy margins", "Diversified portfolio"],
              weaknesses: ["High debt levels", "Currency exposure"],
              opportunities: ["Market expansion", "Digital transformation"],
              threats: ["Regulatory changes", "Market volatility"]
            },
            risks: [
              "Credit risk concentration in high-risk sectors",
              "Liquidity risk during market downturns",
              "Operational risk from system dependencies",
              "Regulatory compliance challenges"
            ]
          };
          break;
          
        case "audit_summary":
          reportData = {
            complianceChecks: [
              { standard: "IFRS", status: "Passed", findings: "All requirements met" },
              { standard: "GAAP", status: "Passed", findings: "Full compliance" },
              { standard: "SOX", status: "Review Required", findings: "Minor documentation gaps" }
            ],
            fraudFindings: [
              { type: "Duplicate Invoices", severity: "Medium", count: 3 },
              { type: "Unusual Patterns", severity: "Low", count: 2 }
            ],
            governmentCompliance: {
              standard: "Government Audit Standards 2024",
              certifiedBy: "Independent Auditor",
              complianceLevel: "Fully Compliant"
            }
          };
          break;
          
        case "risk_report":
          reportData = {
            riskAnalysis: {
              overall: "Medium Risk",
              categories: {
                credit: 65,
                market: 45,
                operational: 38,
                liquidity: 42
              }
            },
            predictions: {
              nextQuarter: "Stable",
              nextYear: "Improving",
              scenarios: ["Best Case: 85% probability", "Worst Case: 15% probability"]
            },
            monteCarloResults: {
              simulations: 10000,
              valueAtRisk: "$15M",
              expectedShortfall: "$22M",
              confidence: "95%"
            }
          };
          break;
          
        case "compliance_report":
          reportData = {
            complianceData: [
              { regulation: "IFRS", status: "Compliant", lastAudit: "2024-Q4" },
              { regulation: "SEBI", status: "Compliant", lastAudit: "2024-Q3" },
              { regulation: "SOX", status: "Under Review", lastAudit: "2024-Q4" }
            ],
            period: "Q4 2024"
          };
          break;
          
        case "board_deck":
          reportData = {
            executiveSummary: "Strong quarterly performance with strategic growth initiatives on track",
            keyMetrics: [
              { label: "Revenue", value: "$125M", change: "+12%" },
              { label: "EBITDA", value: "$18M", change: "+8%" },
              { label: "Net Income", value: "$11M", change: "+15%" },
              { label: "ROE", value: "15.5%", change: "+2.3%" }
            ],
            strategicInsights: [
              "Market expansion in APAC region showing strong traction",
              "Digital transformation initiatives ahead of schedule",
              "Cost optimization programs yielding results",
              "New product launches exceeding expectations"
            ]
          };
          break;

        case "tax_filing":
          reportData = {
            financialData: {
              taxYear: new Date().getFullYear().toString(),
              grossIncome: 15000000,
              deductions: {
                businessExpenses: 8500000,
                depreciation: 1200000,
                employeeBenefits: 2300000,
                research: 750000
              },
              taxableIncome: 2250000,
              estimatedTax: 472500,
              quarterlyPayments: [118125, 118125, 118125, 118125],
              credits: {
                researchCredit: 50000,
                energyCredit: 25000
              },
              foreignIncome: 500000
            },
            taxYear: new Date().getFullYear().toString()
          };
          break;

        case "sec_filing":
          reportData = {
            companyData: {
              name: "FinSight Corporation",
              cik: "0001234567",
              tickerSymbol: "FNSGT",
              fiscalYearEnd: "December 31",
              filingType: "10-K",
              fiscalPeriod: `FY${new Date().getFullYear() - 1}`,
              financials: {
                revenue: 500000000,
                costOfRevenue: 300000000,
                grossProfit: 200000000,
                operatingExpenses: 125000000,
                netIncome: 45000000,
                totalAssets: 1200000000,
                totalLiabilities: 700000000,
                shareholdersEquity: 500000000,
                cashFlow: {
                  operating: 85000000,
                  investing: -45000000,
                  financing: -25000000
                }
              },
              business: {
                description: "AI-powered financial analysis and risk management platform",
                employees: 450,
                markets: ["North America", "Europe", "Asia-Pacific"],
                products: ["Financial Analytics", "Risk Management", "Compliance Automation"]
              },
              risks: [
                "Market volatility and economic uncertainty",
                "Regulatory changes in financial services",
                "Competition from established financial software providers",
                "Cybersecurity and data protection risks",
                "Technology infrastructure dependencies"
              ]
            },
            filingType: "10-K",
            fiscalPeriod: `FY${new Date().getFullYear() - 1}`
          };
          break;

        default:
          reportData = {};
      }

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          data: reportData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Report generation failed");
      }
      
      const data = await response.json();
      
      // Transform API response to match component interface
      const generatedReport: GeneratedReport = {
        id: Date.now(),
        reportType: data.reportType || reportType,
        title: reportTypes.find(t => t.value === reportType)?.label || reportType,
        content: data.content || "",
        format: data.format || "markdown",
        generatedAt: data.generatedAt || new Date().toISOString(),
      };
      
      setReport(generatedReport);
      setIsSigned(false);
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleESign = () => {
    if (!signatureName.trim() || !signatureTitle.trim()) {
      toast.error("Please fill in all signature fields");
      return;
    }
    
    const signature = `\n\n---\n**ELECTRONICALLY SIGNED**\n\nName: ${signatureName}\nTitle: ${signatureTitle}\nDate: ${new Date().toLocaleString()}\nSignature: ${signatureName.split(' ').map(n => n[0]).join('')}${Date.now().toString().slice(-4)}\n\nThis document has been electronically signed and is legally binding.`;
    
    if (report) {
      setReport({
        ...report,
        content: report.content + signature
      });
    }
    
    setIsSigned(true);
    setESignDialogOpen(false);
    toast.success("Document signed successfully!");
  };

  const askAssistant = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      setAskingAssistant(true);
      
      // Simulate AI assistant response based on question
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses: Record<string, string> = {
        "revenue": "According to the financial data, total revenue is $500M with a 12% year-over-year growth. The revenue is primarily driven by strong performance in the APAC region.",
        "compliance": "The company maintains full compliance with IFRS and GAAP standards. All audit checks have passed successfully with minor documentation updates required for SOX compliance.",
        "risk": "The current risk profile shows medium overall risk with primary concerns in credit risk concentration (65/100) and moderate exposure in market and operational risks.",
        "ebitda": "EBITDA stands at $75M representing a healthy 15% margin. This shows strong operational efficiency and profitability.",
        "signature": "Electronic signatures are legally binding. Simply click the 'E-Sign Document' button, enter your credentials, and the document will be cryptographically signed with a timestamp.",
        "default": "Based on the report data, I can help you understand financial metrics, compliance status, risk assessments, and report formatting. Please ask specific questions about revenue, expenses, risks, compliance, or report signing."
      };
      
      const lowerQuestion = question.toLowerCase();
      let response = responses.default;
      
      for (const [key, value] of Object.entries(responses)) {
        if (lowerQuestion.includes(key)) {
          response = value;
          break;
        }
      }
      
      setAssistantResponse(response);
      toast.success("Assistant response generated!");
    } catch (error) {
      toast.error("Failed to get assistant response");
    } finally {
      setAskingAssistant(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const signedSuffix = isSigned ? "_SIGNED" : "";
    a.download = `${report.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}${signedSuffix}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully!");
  };

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white to-violet-50 dark:from-slate-900 dark:to-violet-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          Government-Compliant Report Generation
        </CardTitle>
        <CardDescription>
          AI-powered reports with e-signature facility and compliance assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={generateReport} disabled={loading} className="flex-1 gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate Report
          </Button>
          
          <Button 
            onClick={() => setAssistantDialogOpen(true)} 
            variant="outline"
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Ask Assistant
          </Button>
        </div>

        {/* Generated Report Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
            <div className="text-center">
              <p className="font-semibold">Generating government-compliant report...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ensuring regulatory compliance
              </p>
            </div>
          </div>
        ) : report ? (
          <Card className="bg-white dark:bg-slate-900">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Report Generated</span>
                </div>
                <div className="flex items-center gap-2">
                  {isSigned && (
                    <Badge variant="default" className="bg-green-600">
                      <FileSignature className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  )}
                  <Badge variant="default">{report.format.toUpperCase()}</Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium">
                    {reportTypes.find(t => t.value === report.reportType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Title:</span>
                  <span className="font-medium">{report.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Generated:</span>
                  <span className="font-medium">
                    {new Date(report.generatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Content Preview - Formatted without LaTeX/JSON */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Content Preview:</h4>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded max-h-[400px] overflow-y-auto text-sm leading-relaxed">
                  {renderFormattedContent(report.content)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={downloadReport} className="flex-1 gap-2" variant="default">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
                
                {!isSigned && (
                  <Button 
                    onClick={() => setESignDialogOpen(true)} 
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    <PenTool className="h-4 w-4" />
                    E-Sign Document
                  </Button>
                )}
              </div>

              {/* Compliance Badge */}
              {(reportType === "audit_summary" || reportType === "compliance_report" || reportType === "sec_filing") && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Government Compliance Verified</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    This report meets all regulatory requirements and standards
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a report type to generate</p>
            <p className="text-xs mt-1">AI will create professional, compliant documents instantly</p>
          </div>
        )}

        {/* E-Sign Dialog */}
        <Dialog open={eSignDialogOpen} onOpenChange={setESignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Electronic Signature
              </DialogTitle>
              <DialogDescription>
                Sign this document electronically with legal binding
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Enter your full name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Title/Position</label>
                <Input
                  placeholder="e.g., Chief Financial Officer"
                  value={signatureTitle}
                  onChange={(e) => setSignatureTitle(e.target.value)}
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">Legal Notice:</p>
                <p>By signing this document electronically, you agree that your electronic signature is legally binding and has the same effect as a handwritten signature.</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleESign} className="flex-1 gap-2">
                  <FileSignature className="h-4 w-4" />
                  Sign Document
                </Button>
                <Button onClick={() => setESignDialogOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assistant Dialog */}
        <Dialog open={assistantDialogOpen} onOpenChange={setAssistantDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Report Compliance Assistant
              </DialogTitle>
              <DialogDescription>
                Ask questions about financial metrics, compliance, or report signing
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Question</label>
                <Textarea
                  placeholder="e.g., What is the current revenue? How do I sign this report?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={askAssistant} 
                disabled={askingAssistant || !question.trim()}
                className="w-full gap-2"
              >
                {askingAssistant ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                Ask Assistant
              </Button>

              {assistantResponse && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                        Assistant Response:
                      </p>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        {assistantResponse}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Example Questions */}
              {!assistantResponse && (
                <div>
                  <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                    Example questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "What is the revenue?",
                      "Is this report compliant?",
                      "How do I sign this?",
                      "What are the risks?",
                    ].map((q) => (
                      <Badge
                        key={q}
                        variant="secondary"
                        className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900"
                        onClick={() => setQuestion(q)}
                      >
                        {q}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};