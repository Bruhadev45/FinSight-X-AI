"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Building2,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Network,
  Download,
  Eye,
  Brain,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { FormattedText } from "@/components/ui/formatted-text";

interface Entity {
  type: "company" | "person" | "amount" | "date" | "location";
  value: string;
  confidence: number;
  mentions: number;
  context?: string;
}

interface Metric {
  name: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  status?: "good" | "warning" | "bad";
  history: number[]; // For sparkline
}

interface ComplianceCheck {
  name: string;
  status: "passed" | "failed" | "warning";
  details: string;
  severity: "high" | "medium" | "low";
}

export function DocumentIntelligenceDashboard() {
  const [selectedDocument] = useState("Tesla_Q4_2024_Financial_Report.pdf");

  // Mock extracted data
  const documentHealth = 92;

  const aiSummary = `**Executive Summary:**
The Q4 2024 financial report demonstrates robust operational execution with a **25% YoY revenue increase** to $25.17B, driven primarily by vehicle delivery growth and energy storage expansion.

**Key Strengths:**
• **Profitability:** Net income rose to $7.9B, reflecting improved manufacturing efficiencies.
• **Cash Flow:** Free cash flow remains strong at $2.06B, supporting future capital allocation.

**Risk Factors:**
• **Compliance:** Minor warnings noted in ESG disclosures (Scope 3 emissions data gaps).
• **Leverage:** Debt-to-equity ratio slightly increased due to strategic acquisitions, though remains within healthy limits.

**Outlook:**
Operational risks remain low. The company is well-positioned for continued growth, provided supply chain resilience is maintained.`;

  const entities: Entity[] = [
    { type: "company", value: "Tesla, Inc.", confidence: 99, mentions: 142, context: "Issuer of the report" },
    { type: "company", value: "SpaceX", confidence: 95, mentions: 12, context: "Related party transaction" },
    { type: "person", value: "Elon Musk", confidence: 98, mentions: 45, context: "CEO Statement" },
    { type: "person", value: "Vaibhav Taneja", confidence: 96, mentions: 18, context: "CFO Signature" },
    { type: "amount", value: "$25.17B", confidence: 99, mentions: 24, context: "Total Revenue Q4" },
    { type: "amount", value: "$7.9B", confidence: 97, mentions: 8, context: "Net Income" },
    { type: "date", value: "December 31, 2024", confidence: 99, mentions: 42, context: "Period End" },
    { type: "location", value: "Austin, Texas", confidence: 94, mentions: 6, context: "Headquarters" },
  ];

  const metrics: Metric[] = [
    {
      name: "Total Revenue",
      value: "$25.17B",
      change: "+3% YoY",
      trend: "up",
      status: "good",
      history: [21.4, 23.3, 24.3, 25.1, 25.17]
    },
    {
      name: "Gross Margin",
      value: "17.6%",
      change: "-1.2% YoY",
      trend: "down",
      status: "warning",
      history: [23.8, 19.3, 18.2, 17.9, 17.6]
    },
    {
      name: "Operating Margin",
      value: "8.2%",
      change: "+0.6%",
      trend: "up",
      status: "good",
      history: [7.6, 7.8, 7.5, 8.0, 8.2]
    },
    {
      name: "Free Cash Flow",
      value: "$2.06B",
      change: "+15%",
      trend: "up",
      status: "good",
      history: [1.2, 1.4, 1.8, 2.0, 2.06]
    },
  ];

  const complianceChecks: ComplianceCheck[] = [
    {
      name: "GAAP Reconciliation",
      status: "passed",
      details: "Non-GAAP measures properly reconciled",
      severity: "high"
    },
    {
      name: "Risk Factors Disclosure",
      status: "passed",
      details: "Comprehensive update on supply chain risks",
      severity: "high"
    },
    {
      name: "ESG Reporting",
      status: "warning",
      details: "Scope 3 emissions data incomplete",
      severity: "medium"
    },
    {
      name: "Related Party Transactions",
      status: "passed",
      details: "Disclosed in Note 14",
      severity: "high"
    },
  ];

  const riskData = [
    { subject: 'Fraud', A: 15, fullMark: 100 },
    { subject: 'Compliance', A: 25, fullMark: 100 },
    { subject: 'Financial', A: 45, fullMark: 100 },
    { subject: 'Operational', A: 30, fullMark: 100 },
    { subject: 'Legal', A: 20, fullMark: 100 },
    { subject: 'Reputation', A: 35, fullMark: 100 },
  ];

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "company": return Building2;
      case "person": return Users;
      case "amount": return DollarSign;
      case "date": return Calendar;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Document Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered analysis of <span className="font-medium text-foreground">{selectedDocument}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Original
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Cards: Health & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Document Health</h3>
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-bold text-blue-700 dark:text-blue-300">{documentHealth}</span>
                <span className="text-xl text-blue-600/60 mb-1">/100</span>
              </div>
              <Progress value={documentHealth} className="h-2 bg-blue-200 dark:bg-blue-900" />
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-blue-200 text-blue-700">
                High Confidence
              </Badge>
              <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-blue-200 text-blue-700">
                OCR Verified
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary Card */}
        <Card className="lg:col-span-2 border-purple-100 dark:border-purple-900 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormattedText content={aiSummary} className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm" />
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Financials Extracted</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Entities Linked</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>1 Compliance Warning</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="risk">Risk Profile</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className={`flex items-center text-xs ${metric.status === 'good' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {metric.change}
                    </div>
                  </div>
                  <div className="h-16 w-full bg-slate-50 dark:bg-slate-900/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.history.map((val, i) => ({ val, i }))}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.status === 'warning' ? '#f59e0b' : '#3b82f6'} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={metric.status === 'warning' ? '#f59e0b' : '#3b82f6'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="val"
                          stroke={metric.status === 'warning' ? '#f59e0b' : '#3b82f6'}
                          fill={`url(#gradient-${index})`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Radar</CardTitle>
                <CardDescription>Multi-dimensional risk analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Risk Score"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Breakdown</CardTitle>
                <CardDescription>Detailed analysis by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {riskData.map((risk, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{risk.subject}</span>
                      <span className={
                        risk.A > 70 ? "text-red-600 font-bold" :
                          risk.A > 40 ? "text-amber-600 font-bold" : "text-green-600 font-bold"
                      }>
                        {risk.A > 70 ? "High" : risk.A > 40 ? "Medium" : "Low"} ({risk.A}%)
                      </span>
                    </div>
                    <Progress
                      value={risk.A}
                      className={`h-2 ${risk.A > 70 ? "bg-red-100 [&>div]:bg-red-500" :
                        risk.A > 40 ? "bg-amber-100 [&>div]:bg-amber-500" : "bg-green-100 [&>div]:bg-green-500"
                        }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Extracted Entities</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search entities..."
                    className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-background"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {entities.map((entity, i) => {
                    const Icon = getEntityIcon(entity.type);
                    return (
                      <div key={i} className="flex items-start justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${entity.type === 'company' ? 'bg-blue-100 text-blue-700' :
                            entity.type === 'person' ? 'bg-purple-100 text-purple-700' :
                              entity.type === 'amount' ? 'bg-green-100 text-green-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{entity.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Found in: <span className="italic">{entity.context}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {entity.confidence}% Conf.
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {entity.mentions} mentions
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 gap-4">
            {complianceChecks.map((check, i) => (
              <Card key={i} className={`border-l-4 ${check.status === 'passed' ? 'border-l-green-500' :
                check.status === 'warning' ? 'border-l-amber-500' : 'border-l-red-500'
                }`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${check.status === 'passed' ? 'bg-green-100 text-green-600' :
                      check.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {check.status === 'passed' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{check.name}</h4>
                      <p className="text-sm text-muted-foreground">{check.details}</p>
                    </div>
                  </div>
                  <Badge variant={check.severity === 'high' ? 'destructive' : 'secondary'}>
                    {check.severity.toUpperCase()} PRIORITY
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
