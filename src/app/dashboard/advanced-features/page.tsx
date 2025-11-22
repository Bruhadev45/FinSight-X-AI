"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import {
  Sparkles,
  Upload,
  FileSearch,
  GitCompare,
  FileText,
  Search,
  Zap,
  ArrowLeft,
  Network,
  Headphones,
  Bell,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BatchDocumentUpload } from "@/components/dashboard/BatchDocumentUpload";
import { CitationTracker } from "@/components/dashboard/CitationTracker";
import { DocumentIntelligenceDashboard } from "@/components/dashboard/DocumentIntelligenceDashboard";
import { AdvancedSearch } from "@/components/dashboard/AdvancedSearch";
import { DocumentComparison } from "@/components/dashboard/DocumentComparison";
import { VisualKnowledgeGraph } from "@/components/dashboard/VisualKnowledgeGraph";
import { AudioSummaryPlayer } from "@/components/dashboard/AudioSummaryPlayer";
import { ScenarioSimulator } from "@/components/dashboard/ScenarioSimulator";
import { AlertRulesPanel } from "@/components/dashboard/AlertRulesPanel";

export default function AdvancedFeaturesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("batch-upload");

  const features = [
    {
      id: "batch-upload",
      name: "Batch Document Upload",
      icon: Upload,
      description: "Upload and analyze 10-50 documents simultaneously",
      priority: "critical",
      status: "live",
    },
    {
      id: "citations",
      name: "Citation Tracking",
      icon: FileSearch,
      description: "Every AI insight linked to source documents",
      priority: "critical",
      status: "live",
    },
    {
      id: "intelligence",
      name: "Document Intelligence",
      icon: FileText,
      description: "Auto-extract entities, metrics, and compliance data",
      priority: "high",
      status: "live",
    },
    {
      id: "search",
      name: "Advanced Search",
      icon: Search,
      description: "Natural language search with smart filters",
      priority: "medium",
      status: "live",
    },
    {
      id: "comparison",
      name: "Document Comparison",
      icon: GitCompare,
      description: "Side-by-side comparison with change detection",
      priority: "high",
      status: "live",
    },
    {
      id: "graph",
      name: "Visual Knowledge Graph",
      icon: Network,
      description: "Interactive entity relationship explorer",
      priority: "medium",
      status: "new",
    },
    {
      id: "audio",
      name: "Audio Summaries",
      icon: Headphones,
      description: "Listen to AI-generated report summaries",
      priority: "low",
      status: "new",
    },
    {
      id: "alerts",
      name: "Smart Alerts",
      icon: Bell,
      description: "Automated rule-based monitoring",
      priority: "high",
      status: "new",
    },
    {
      id: "scenario",
      name: "Scenario Simulator",
      icon: TrendingUp,
      description: "Forecast outcomes with adjustable variables",
      priority: "critical",
      status: "new",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Logo size={28} />
                  Advanced Intelligence Features
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade document intelligence platform
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              5 NEW FEATURES
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Banner */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">
                  The Modern Alternative to Enterprise Document Intelligence
                </h2>
                <p className="text-lg text-muted-foreground">
                  Enterprise-grade features at affordable pricing. Built for teams of all sizes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Button
                    key={feature.id}
                    variant={activeTab === feature.id ? "default" : "outline"}
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => setActiveTab(feature.id)}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{feature.name}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getPriorityColor(feature.priority)}`}
                    >
                      {feature.priority}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                &lt;30s
              </div>
              <div className="text-sm text-muted-foreground">
                Time to First Insight
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                1000+
              </div>
              <div className="text-sm text-muted-foreground">
                Documents Processed/Day
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                90%+
              </div>
              <div className="text-sm text-muted-foreground">
                Insight Accuracy
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-2">
                99%
              </div>
              <div className="text-sm text-muted-foreground">
                Cost Effective
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden">
            {features.map((feature) => (
              <TabsTrigger key={feature.id} value={feature.id}>
                {feature.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="batch-upload" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Multi-Document Batch Analysis</h3>
              <p className="text-muted-foreground">
                Upload 10-50 documents at once with real-time progress tracking and cross-document
                pattern detection. Perfect for quarterly reports, due diligence, and portfolio
                analysis.
              </p>
            </div>
            <BatchDocumentUpload />
          </TabsContent>

          <TabsContent value="citations" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Citation & Source Tracking</h3>
              <p className="text-muted-foreground">
                Every AI insight includes clickable citations to source documents with exact page
                numbers, confidence scores, and AI reasoning. Build trust through transparency.
              </p>
            </div>
            <CitationTracker />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Document Intelligence Dashboard</h3>
              <p className="text-muted-foreground">
                Auto-extract companies, people, amounts, dates, and key metrics. Get instant
                document health scores, compliance checklists, and risk assessments.
              </p>
            </div>
            <DocumentIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Advanced Search with Filters</h3>
              <p className="text-muted-foreground">
                Natural language search across all documents with intelligent filters. Save
                searches, set up alerts, and get results ranked by relevance and confidence.
              </p>
            </div>
            <AdvancedSearch />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Smart Document Comparison</h3>
              <p className="text-muted-foreground">
                Compare 2-5 documents side-by-side with AI-powered change detection. Track metric
                evolution, highlight differences, and generate comparison reports.
              </p>
            </div>
            <DocumentComparison />
          </TabsContent>

          <TabsContent value="graph" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Visual Knowledge Graph</h3>
              <p className="text-muted-foreground">
                Explore connections between companies, people, and key topics. Click on nodes to reveal
                relationships and drill down into source documents.
              </p>
            </div>
            <VisualKnowledgeGraph />
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Audio Summaries (Podcast Mode)</h3>
              <p className="text-muted-foreground">
                Turn complex financial reports into concise audio summaries. Perfect for staying updated
                while on the go.
              </p>
            </div>
            <div className="max-w-2xl">
              <AudioSummaryPlayer />
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Smart Alert Builder</h3>
              <p className="text-muted-foreground">
                Create "If-This-Then-That" style rules to monitor financial metrics. Get notified via
                Email, Slack, or SMS when thresholds are breached.
              </p>
            </div>
            <AlertRulesPanel companyId="demo" />
          </TabsContent>

          <TabsContent value="scenario" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">AI Scenario Simulator</h3>
              <p className="text-muted-foreground">
                Forecast future performance by adjusting key variables. See how changes in revenue,
                costs, and market share impact your bottom line in real-time.
              </p>
            </div>
            <ScenarioSimulator />
          </TabsContent>
        </Tabs>

        {/* Command Palette Hint */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Zap className="h-12 w-12 text-blue-600" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Pro Tip: Use Command Palette for Quick Access
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">⌘K</kbd> or{" "}
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Ctrl+K</kbd> to
                  instantly access all features, navigate pages, and run actions.
                </p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">⌘K - Open palette</Badge>
                  <Badge variant="outline">⌘P - Portfolio</Badge>
                  <Badge variant="outline">⌘U - Upload</Badge>
                  <Badge variant="outline">⌘F - Search</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Teaser */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Workflow Automation</h4>
                <p className="text-sm text-muted-foreground">
                  Visual workflow builder with triggers and actions
                </p>
                <Badge variant="secondary" className="mt-2">Month 3</Badge>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Collaborative Workspaces</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time team collaboration with annotations
                </p>
                <Badge variant="secondary" className="mt-2">Month 3</Badge>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Smart Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Pre-built templates for due diligence and compliance
                </p>
                <Badge variant="secondary" className="mt-2">Month 4</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
