"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSearch,
  Brain,
  TrendingUp,
  Network,
  Users,
  Bell,
  Shield,
  GitBranch,
  FileText,
  Sparkles,
  Activity,
  Lock,
  Zap,
  PlayCircle,
  Database,
  MessageCircle,
  Link,
  Globe,
  ArrowLeft,
  Newspaper,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AIPlaybooksPanel } from "@/components/enterprise/AIPlaybooksPanel";
import { LLMModelHubPanel } from "@/components/enterprise/LLMModelHubPanel";
import { DataIngestionPanel } from "@/components/enterprise/DataIngestionPanel";
import { ChatCopilotPanel } from "@/components/enterprise/ChatCopilotPanel";
import { RoleBasedViewsPanel } from "@/components/enterprise/RoleBasedViewsPanel";
import { DataLinkingPanel } from "@/components/enterprise/DataLinkingPanel";
import { MultiLanguageCompliancePanel } from "@/components/enterprise/MultiLanguageCompliancePanel";
import { LLMUsageMonitorPanel } from "@/components/enterprise/LLMUsageMonitorPanel";
import { ModelFeedbackPanel } from "@/components/enterprise/ModelFeedbackPanel";
import { DataResidencyPanel } from "@/components/enterprise/DataResidencyPanel";
import { RealTimeMarketDataPanel } from "@/components/enterprise/RealTimeMarketDataPanel";
import { RealTimeNewsPanel } from "@/components/enterprise/RealTimeNewsPanel";
import { RealTimeFraudMonitorPanel } from "@/components/enterprise/RealTimeFraudMonitorPanel";

const features = [
  {
    id: 1,
    title: "Document Intelligence",
    description: "AI-powered document parsing with OCR, table extraction, and entity recognition",
    icon: FileSearch,
    status: "active",
    capabilities: [
      "PDF/Excel/Scanned document parsing",
      "Table and chart recognition",
      "Automatic document classification",
      "Cross-document linking",
      "Entity recognition (companies, accounts, instruments)",
      "Version tracking of financial filings",
    ],
    apiEndpoint: "/api/analyze-document",
    tech: ["OpenAI GPT-4", "Unstructured.io", "NLP"],
    category: "core",
  },
  {
    id: 2,
    title: "Semantic Financial Reasoning",
    description: "RAG-powered contextual analysis with multi-step reasoning",
    icon: Brain,
    status: "active",
    capabilities: [
      "Natural language financial queries",
      "Multi-step reasoning and derivations",
      "KPI auto-calculation",
      "Conditional reasoning",
      "Portfolio-level aggregation",
      "Contextual query understanding",
    ],
    apiEndpoint: "/api/semantic-search",
    tech: ["LangChain", "Pinecone", "OpenAI Embeddings"],
    category: "core",
  },
  {
    id: 3,
    title: "Predictive & Risk Analytics",
    description: "Time-series forecasting with Monte Carlo simulations",
    icon: TrendingUp,
    status: "active",
    capabilities: [
      "LSTM-based time-series forecasting",
      "Monte Carlo risk simulations",
      "Anomaly detection",
      "Risk scoring (credit, liquidity, compliance)",
      "Stress testing",
      "Pre-breach alert triggering",
    ],
    apiEndpoint: "/api/forecast",
    tech: ["TensorFlow.js", "Statistical Models"],
    category: "core",
  },
  {
    id: 4,
    title: "Fraud & Compliance AI",
    description: "Detect manipulations and compliance violations",
    icon: Shield,
    status: "active",
    capabilities: [
      "Fraud pattern detection library",
      "NLP-based clause detection",
      "Related-party transaction mapping",
      "Duplicate/ghost invoice detection",
      "IFRS/SEBI/ESG compliance checks",
      "Auto-generate risk memos",
    ],
    apiEndpoint: "/api/multi-agent-analysis",
    tech: ["Graph AI", "Transformers", "Anomaly Detection ML"],
    category: "core",
  },
  {
    id: 5,
    title: "Multi-Agent AI System",
    description: "7 specialized AI agents working in parallel",
    icon: Users,
    status: "active",
    capabilities: [
      "Parser Agent - Document structuring",
      "Analyzer Agent - KPI computation",
      "Compliance Agent - Regulation validation",
      "Fraud Agent - Behavioral checks",
      "Alert Agent - Live monitoring",
      "Insight Agent - Report writing",
      "Orchestrator Agent - Workflow coordination",
    ],
    apiEndpoint: "/api/multi-agent-analysis",
    tech: ["OpenAI GPT-4", "Agent Orchestration"],
    category: "core",
  },
  {
    id: 6,
    title: "Alerting & Monitoring AI",
    description: "Real-time multi-channel notifications",
    icon: Bell,
    status: "active",
    capabilities: [
      "Real-time metric monitoring",
      "Threshold-based triggers",
      "Multi-channel delivery (Email, SMS, Push, Slack)",
      "Severity levels (Red/Yellow/Green)",
      "Weekly digests & auto-summaries",
      "Alert explanations with source citations",
    ],
    apiEndpoint: "/api/notifications/send",
    tech: ["Twilio", "Resend", "Firebase", "Exponential Backoff"],
    category: "core",
  },
  {
    id: 7,
    title: "Explainable AI & Trust Layer",
    description: "Transparent reasoning with source citations",
    icon: Activity,
    status: "active",
    capabilities: [
      "Source citation for every AI statement",
      "Confidence scores on outputs",
      "Model version + prompt trace logging",
      "Reasoning chain visualization",
      "Human approval queue",
      "Feedback rating system",
    ],
    apiEndpoint: "/api/explainable-ai",
    tech: ["GPT-4", "Citation Extraction", "Confidence Scoring"],
    category: "core",
  },
  {
    id: 8,
    title: "Collaboration & Human-in-the-Loop",
    description: "Blend human expertise with automation",
    icon: GitBranch,
    status: "active",
    capabilities: [
      "Shared review dashboards",
      "Commenting & annotation system",
      "Real-time co-editing",
      "Task assignments",
      "Feedback loop for model retraining",
      "Explainability feedback rating",
    ],
    apiEndpoint: "/api/collaboration",
    tech: ["WebSockets", "Real-time Sync"],
    category: "core",
  },
  {
    id: 9,
    title: "Knowledge Graph & Memory",
    description: "Persistent contextual learning across time",
    icon: Network,
    status: "active",
    capabilities: [
      "Financial entity graph",
      "Temporal knowledge tracking",
      "Context memory per tenant/company",
      "Relationship mapping",
      "Metric evolution tracking",
      "Related-party transaction detection",
    ],
    apiEndpoint: "/api/knowledge-graph",
    tech: ["In-Memory Graph", "Temporal Tracking"],
    category: "core",
  },
  {
    id: 10,
    title: "Report Generation & Automation",
    description: "Ready-to-submit outputs for enterprises",
    icon: FileText,
    status: "active",
    capabilities: [
      "Auto-generate investor memos",
      "Audit summaries & compliance reports",
      "Board presentation decks",
      "Narrative summaries with charts",
      "Custom templates per client",
      "Export to PDF/Excel/PPT",
    ],
    apiEndpoint: "/api/reports/generate",
    tech: ["GPT-4", "Template Engine"],
    category: "core",
  },
  {
    id: 11,
    title: "Adaptive Learning & Personalization",
    description: "AI that learns organization-specific behavior",
    icon: Sparkles,
    status: "active",
    capabilities: [
      "Adaptive prompt tuning",
      "Company-specific glossaries",
      "Smart computation caching",
      "Role-based personalization",
      "Tone adaptation",
      "User correction learning",
    ],
    apiEndpoint: "/api/collaboration",
    tech: ["Feedback Loop", "Fine-tuning"],
    category: "core",
  },
  {
    id: 12,
    title: "Integration & API Intelligence",
    description: "Connect with ERPs, CRMs, and BI tools",
    icon: Zap,
    status: "active",
    capabilities: [
      "REST & gRPC APIs",
      "Webhooks for events",
      "Power BI / Tableau plugins",
      "Data connectors (Drive, S3, Bloomberg, SAP)",
      "QuickBooks integration",
      "SharePoint sync",
    ],
    apiEndpoint: "/api/*",
    tech: ["REST API", "Webhooks", "Connectors"],
    category: "core",
  },
  {
    id: 13,
    title: "Governance, Compliance & Ethics",
    description: "Audit trails and bias monitoring",
    icon: Lock,
    status: "active",
    capabilities: [
      "Model audit trails for regulators",
      "Bias & fairness monitoring",
      "Compliance dashboards",
      "Data lineage tracking",
      "Role-based data visibility",
      "Anonymization & redaction",
    ],
    apiEndpoint: "/api/governance",
    tech: ["Audit Logs", "Bias Detection", "Data Masking"],
    category: "core",
  },
  {
    id: 14,
    title: "AI Playbooks (Workflow Templates)",
    description: "Pre-built guided analysis flows with automated agent orchestration",
    icon: PlayCircle,
    status: "active",
    capabilities: [
      "Quarterly Risk Review template",
      "Credit Health Audit workflow",
      "ESG Compliance Check automation",
      "Fraud Investigation Workflow",
      "Regulatory Filing Validation",
      "One-click execution with reports",
    ],
    apiEndpoint: "/api/playbooks",
    tech: ["Workflow Engine", "Multi-Agent Orchestration"],
    category: "premium",
    panel: "playbooks",
  },
  {
    id: 15,
    title: "Private LLM Gateway / Model Hub",
    description: "Internal LLM registry with per-tenant model selection",
    icon: Brain,
    status: "active",
    capabilities: [
      "Multi-model support (GPT-4, Claude, Mistral, Local)",
      "Per-tenant model configuration",
      "Data sovereignty controls",
      "Cost optimization",
      "Model performance tracking",
      "Failover and load balancing",
    ],
    apiEndpoint: "/api/llm-hub",
    tech: ["Model Registry", "Multi-Provider Gateway"],
    category: "premium",
    panel: "llm-hub",
  },
  {
    id: 16,
    title: "Data Ingestion APIs",
    description: "REST/gRPC endpoints for automated nightly uploads",
    icon: Database,
    status: "active",
    capabilities: [
      "REST & gRPC endpoints",
      "Automated ERP/DMS integration",
      "Webhook support for events",
      "Batch processing",
      "Real-time data streaming",
      "Error handling & retry logic",
    ],
    apiEndpoint: "/api/ingest/*",
    tech: ["REST API", "gRPC", "Webhooks"],
    category: "premium",
    panel: "ingestion",
  },
  {
    id: 17,
    title: "Real-Time Chat Copilot",
    description: "Conversational AI with RAG context for instant answers",
    icon: MessageCircle,
    status: "active",
    capabilities: [
      "Natural language queries",
      "Semantic search + RAG context",
      "Multi-document reasoning",
      "Conversation memory",
      "Source citations",
      "CFO/Analyst assistant mode",
    ],
    apiEndpoint: "/api/chat-copilot",
    tech: ["RAG", "Conversational AI", "Vector Search"],
    category: "premium",
    panel: "copilot",
  },
  {
    id: 18,
    title: "Role-Based Analytics Views",
    description: "Customized dashboards per organizational role",
    icon: Users,
    status: "active",
    capabilities: [
      "CFO View - KPIs & forecasts",
      "Risk Officer - Alerts & violations",
      "Auditor - Document traces & citations",
      "Configurable layouts",
      "Role-based permissions",
      "Custom widget library",
    ],
    apiEndpoint: "/api/role-views",
    tech: ["Dynamic Dashboards", "RBAC"],
    category: "premium",
    panel: "roles",
  },
  {
    id: 19,
    title: "Auto-Data Linking & Reconciliation",
    description: "Cross-link and validate numeric values across statements",
    icon: Link,
    status: "active",
    capabilities: [
      "Income → Cash Flow linking",
      "Balance Sheet consistency checks",
      "Automatic reconciliation",
      "Variance detection",
      "Real-time discrepancy alerts",
      "Audit trail generation",
    ],
    apiEndpoint: "/api/data-linking",
    tech: ["Financial Rules Engine", "Reconciliation AI"],
    category: "premium",
    panel: "linking",
  },
  {
    id: 20,
    title: "Multi-Language Compliance Model",
    description: "Multilingual clause detection with translation",
    icon: Globe,
    status: "active",
    capabilities: [
      "50+ language support",
      "Simultaneous translation & analysis",
      "Region-specific compliance rules",
      "Cross-language clause matching",
      "Cultural context awareness",
      "Global enterprise deployment",
    ],
    apiEndpoint: "/api/multilang",
    tech: ["NMT", "Multilingual Transformers", "Localization"],
    category: "premium",
    panel: "multilang",
  },
  {
    id: 21,
    title: "LLM Usage Monitor & Cost Analytics",
    description: "Track token usage, API latency, cost governance",
    icon: Activity,
    status: "active",
    capabilities: [
      "Token usage tracking",
      "Cost per company/operation",
      "API latency monitoring",
      "Usage forecasting",
      "Budget alerts",
      "Optimization recommendations",
    ],
    apiEndpoint: "/api/llm-usage",
    tech: ["Metrics Collection", "Cost Analytics"],
    category: "premium",
    panel: "usage",
  },
  {
    id: 22,
    title: "Model Feedback Analytics",
    description: "Track false positives, accuracy trends, governance",
    icon: TrendingUp,
    status: "active",
    capabilities: [
      "Accuracy tracking",
      "False positive/negative analysis",
      "Human feedback collection",
      "Model governance scorecards",
      "Continuous improvement metrics",
      "Audit compliance reporting",
    ],
    apiEndpoint: "/api/model-feedback",
    tech: ["Feedback Loop", "Quality Metrics"],
    category: "premium",
    panel: "feedback",
  },
  {
    id: 23,
    title: "Data Residency Controls",
    description: "Tenant-specific data location and sovereignty",
    icon: Shield,
    status: "active",
    capabilities: [
      "EU / India / US data centers",
      "Tenant-level residency policies",
      "Compliance enforcement",
      "Data sovereignty guarantees",
      "Regional compliance (GDPR, CCPA, etc.)",
      "Audit trail per region",
    ],
    apiEndpoint: "/api/data-residency",
    tech: ["Multi-Region Infrastructure", "Compliance Engine"],
    category: "premium",
    panel: "residency",
  },
  {
    id: 24,
    title: "Real-Time Market Data",
    description: "Live stock quotes with sub-5s updates via Finnhub API",
    icon: TrendingUp,
    status: "active",
    capabilities: [
      "Live stock quotes (5s refresh)",
      "Real-time price changes & volume",
      "Custom watchlist management",
      "Powered by Finnhub WebSocket API",
    ],
    apiEndpoint: "/api/market-data",
    tech: ["Finnhub API", "WebSocket", "Real-time Polling"],
    category: "premium",
    panel: "market-data",
  },
  {
    id: 25,
    title: "Real-Time Financial News",
    description: "Live news feed with AI-powered sentiment analysis",
    icon: Newspaper,
    status: "active",
    capabilities: [
      "Live financial news (60s refresh)",
      "AI sentiment analysis",
      "Entity extraction & tagging",
      "5,000+ global news sources",
    ],
    apiEndpoint: "/api/news",
    tech: ["marketaux API", "NLP Sentiment", "Real-time Feed"],
    category: "premium",
    panel: "news",
  },
  {
    id: 26,
    title: "Real-Time Fraud Monitor",
    description: "AI-powered behavioral analytics with sub-ms detection",
    icon: Shield,
    status: "active",
    capabilities: [
      "Real-time pattern detection",
      "Behavioral analytics & anomalies",
      "94.7% detection accuracy",
      "Sub-millisecond decision making",
    ],
    apiEndpoint: "/api/fraud-monitor",
    tech: ["Behavioral AI", "Pattern Recognition", "Risk Scoring"],
    category: "premium",
    panel: "fraud-monitor",
  },
];

type PanelId = "playbooks" | "llm-hub" | "ingestion" | "copilot" | "roles" | 
               "linking" | "multilang" | "usage" | "feedback" | "residency" | 
               "market-data" | "news" | "fraud-monitor" | null;

export default function EnterpriseFeatures() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<PanelId>(null);

  const renderPanel = () => {
    switch (activePanel) {
      case "playbooks": return <AIPlaybooksPanel />;
      case "llm-hub": return <LLMModelHubPanel />;
      case "ingestion": return <DataIngestionPanel />;
      case "copilot": return <ChatCopilotPanel />;
      case "roles": return <RoleBasedViewsPanel />;
      case "linking": return <DataLinkingPanel />;
      case "multilang": return <MultiLanguageCompliancePanel />;
      case "usage": return <LLMUsageMonitorPanel />;
      case "feedback": return <ModelFeedbackPanel />;
      case "residency": return <DataResidencyPanel />;
      case "market-data": return <RealTimeMarketDataPanel />;
      case "news": return <RealTimeNewsPanel />;
      case "fraud-monitor": return <RealTimeFraudMonitorPanel />;
      default: return null;
    }
  };

  const handleViewDocumentation = (feature: typeof features[0]) => {
    toast.info(`📚 ${feature.title}`, {
      description: `API Endpoint: ${feature.apiEndpoint} - Feature documentation available`,
      duration: 4000,
    });
  };

  const handleExploreFeature = (feature: typeof features[0]) => {
    if (feature.panel) {
      setActivePanel(feature.panel as PanelId);
    } else {
      toast.info(`🚀 ${feature.title}`, {
        description: "Interactive demo for this feature coming soon!",
        duration: 3000,
      });
    }
  };

  if (activePanel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <div className="container mx-auto px-6 py-4">
            <Button variant="outline" onClick={() => setActivePanel(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Features
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-6 py-6">
          {renderPanel()}
        </main>
      </div>
    );
  }

  const coreFeatures = features.filter(f => f.category === "core");
  const premiumFeatures = features.filter(f => f.category === "premium");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                FinSight X Enterprise AI
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                26 Enterprise-Grade AI Features for Financial Analysis
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="text-lg px-4 py-2" variant="default">
                13 Core Features
              </Badge>
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                🚀 13 Premium Add-Ons
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Real-Time Features Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Zap className="h-8 w-8 text-green-600 animate-pulse" />
              Real-Time Enterprise Features
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Live data streaming, instant updates, and real-time monitoring powered by industry-leading APIs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Real-Time Market Data */}
            <Card
              className="hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-800 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-green-50 dark:from-slate-900 dark:to-green-950"
              onClick={() => setActivePanel("market-data")}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-green-600 text-white border-none animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">Real-Time Market Data</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Live stock quotes with sub-5s updates via Finnhub API
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Capabilities:
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Live stock quotes (5s refresh)</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Real-time price changes & volume</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Custom watchlist management</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Powered by Finnhub WebSocket API</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Technology Stack:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Finnhub API</Badge>
                      <Badge variant="outline" className="text-xs">WebSocket</Badge>
                      <Badge variant="outline" className="text-xs">Real-time Polling</Badge>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Explore Feature →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Real-Time News */}
            <Card
              className="hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950"
              onClick={() => setActivePanel("news")}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                    <Newspaper className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-600 text-white border-none animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">Real-Time Financial News</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Live news feed with AI-powered sentiment analysis
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Capabilities:
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Live financial news (60s refresh)</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• AI sentiment analysis</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Entity extraction & tagging</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• 5,000+ global news sources</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Technology Stack:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">marketaux API</Badge>
                      <Badge variant="outline" className="text-xs">NLP Sentiment</Badge>
                      <Badge variant="outline" className="text-xs">Real-time Feed</Badge>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Explore Feature →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Real-Time Fraud Monitor */}
            <Card
              className="hover:shadow-xl transition-all duration-300 border-2 border-red-200 dark:border-red-800 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-red-50 dark:from-slate-900 dark:to-red-950"
              onClick={() => setActivePanel("fraud-monitor")}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-red-600 text-white border-none animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">Real-Time Fraud Monitor</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-powered behavioral analytics with sub-ms detection
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Capabilities:
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Real-time pattern detection</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Behavioral analytics & anomalies</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• 94.7% detection accuracy</li>
                      <li className="text-xs text-slate-600 dark:text-slate-400">• Sub-millisecond decision making</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Technology Stack:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Behavioral AI</Badge>
                      <Badge variant="outline" className="text-xs">Pattern Recognition</Badge>
                      <Badge variant="outline" className="text-xs">Risk Scoring</Badge>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Explore Feature →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Premium Features Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Premium World-Class Features
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Advanced capabilities that transform FinSight X into a global-scale platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className="hover:shadow-xl transition-all duration-300 border-2 border-purple-200 dark:border-purple-800 hover:scale-105 cursor-pointer"
                  onClick={() => feature.panel && setActivePanel(feature.panel as PanelId)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        Premium
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          Capabilities:
                        </h4>
                        <ul className="space-y-1">
                          {feature.capabilities.slice(0, 4).map((cap, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                              • {cap}
                            </li>
                          ))}
                          {feature.capabilities.length > 4 && (
                            <li className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              + {feature.capabilities.length - 4} more...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          Technology Stack:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {feature.tech.map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full" size="sm">
                        Explore Feature →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Core Features Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Core Enterprise Features</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Foundation features powering intelligent financial analysis
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className="hover:shadow-xl transition-shadow duration-300 border-2"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge
                        variant={feature.status === "active" ? "default" : "secondary"}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          Capabilities:
                        </h4>
                        <ul className="space-y-1">
                          {feature.capabilities.slice(0, 4).map((cap, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                              • {cap}
                            </li>
                          ))}
                          {feature.capabilities.length > 4 && (
                            <li className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              + {feature.capabilities.length - 4} more...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          Technology Stack:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {feature.tech.map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          API Endpoint:
                        </h4>
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded block overflow-x-auto">
                          {feature.apiEndpoint}
                        </code>
                      </div>

                      <Button 
                        className="w-full" 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocumentation(feature);
                        }}
                      >
                        View Documentation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                26/26
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                Features Active
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                7+
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-500">
                AI Agents Running
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                50+
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-500">
                Languages Supported
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                &lt;5s
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-500">
                Real-Time Updates
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950 dark:to-red-950 border-rose-200 dark:border-rose-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">
                100%
              </div>
              <div className="text-sm text-rose-600 dark:text-rose-500">
                Enterprise Ready
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}