"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { AIAgentsPanel } from "@/components/dashboard/AIAgentsPanel";
import { InteractiveAITools } from "@/components/dashboard/InteractiveAITools";
import { SEC10RAG } from "@/components/dashboard/SEC10RAG";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { DocumentIntelligencePanel } from "@/components/dashboard/DocumentIntelligencePanel";
import { SemanticSearchPanel } from "@/components/dashboard/SemanticSearchPanel";
import { PredictiveAnalyticsPanel } from "@/components/dashboard/PredictiveAnalyticsPanel";
import { FraudDetectionPanel } from "@/components/dashboard/FraudDetectionPanel";
import { ReportGenerationPanel } from "@/components/dashboard/ReportGenerationPanel";
import { ExplainableAIPanel } from "@/components/dashboard/ExplainableAIPanel";
import { CollaborationPanel } from "@/components/dashboard/CollaborationPanel";
import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { NotificationCenterPanel } from "@/components/dashboard/NotificationCenterPanel";
import { FilesPanel } from "@/components/dashboard/FilesPanel";
import { CompanyDatabasePanel } from "@/components/dashboard/CompanyDatabasePanel";
import { FinancialDataPanel } from "@/components/dashboard/FinancialDataPanel";
import { FinancialReportsPanel } from "@/components/dashboard/FinancialReportsPanel";
import { SettingsDialog } from "@/components/dashboard/SettingsDialog";
import { NotificationsPopover } from "@/components/dashboard/NotificationsPopover";
import { Logo } from "@/components/Logo";
import { Shield, Menu, Bell, Settings, TrendingUp, AlertTriangle, FileText, Activity, BarChart3, PieChart, Users, Calendar, Building2, FolderOpen, Database, Sparkles, ArrowUpRight, LifeBuoy, CreditCard, Key, UserPlus, FileSearch, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

interface DashboardStats {
  totalDocuments: number;
  documentsByStatus: Record<string, number>;
  documentsByRisk: Record<string, number>;
  totalAlerts: number;
  alertsBySeverity: Record<string, number>;
  unreadAlerts: number;
  totalCompanies: number;
  avgDocumentsPerCompany: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Real-time alerts hook with toast notifications
  const { unreadCount: realtimeUnreadCount } = useRealtimeAlerts({
    pollInterval: 5000,
    enableToasts: true,
    enableSound: true,
  });

  useEffect(() => {
    initializeApp();
    fetchDashboardData();
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const initializeApp = async () => {
    try {
      // Check if organization exists
      const checkResponse = await fetch('/api/demo-setup');
      const checkData = await checkResponse.json();

      if (!checkData.exists) {
        // Auto-create demo organization
        const setupResponse = await fetch('/api/demo-setup', {
          method: 'POST',
        });
        const setupData = await setupResponse.json();

        if (setupData.success) {
          console.log('Demo organization created automatically');
          // Refresh data after setup
          setTimeout(fetchDashboardData, 1000);
        }
      }
    } catch (error) {
      console.error('Auto-setup error:', error);
    }
  };

  // Listen for navigation events from notification popover
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };
    window.addEventListener("navigate-to-section" as any, handleNavigate);
    return () => window.removeEventListener("navigate-to-section" as any, handleNavigate);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Fetch stats
      const statsResponse = await fetch("/api/dashboard/stats", { headers });
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }

      // Fetch recent documents
      const docsResponse = await fetch("/api/documents?limit=5&sort=createdAt&order=desc", { headers });
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setRecentDocuments(docsData.documents || []);
      }

      // Fetch recent alerts
      const alertsResponse = await fetch("/api/alerts?limit=5&sort=triggeredAt&order=desc", { headers });
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setRecentAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const getHealthPercentage = () => {
    if (!stats) return 98.5;
    const total = stats.totalDocuments;
    const failed = stats.documentsByStatus.failed || 0;
    return total > 0 ? ((total - failed) / total) * 100 : 98.5;
  };

  const navigationItems = [
    // CORE BUSINESS OPERATIONS
    { id: "category-core", isCategory: true, label: "CORE OPERATIONS" },
    { id: "home", label: "Dashboard", icon: BarChart3 },
    { id: "documents", label: "Documents", icon: FileText, description: "Upload & analyze documents" },
    { id: "companies", label: "Companies", icon: Building2, isRoute: true, route: "/dashboard/companies", description: "Track & compare companies" },
    { id: "portfolio", label: "Portfolio", icon: PieChart, isRoute: true, route: "/dashboard/portfolio", description: "Investment tracking" },

    // AI & ANALYTICS
    { id: "category-ai", isCategory: true, label: "AI & ANALYTICS" },
    { id: "ai-tools", label: "AI Tools", icon: Activity, description: "Fraud detection, semantic search" },
    { id: "sec-10-rag", label: "SEC 10 RAG", icon: FileSearch, description: "SEC filings AI analysis" },
    { id: "financial-chatbot", label: "Financial Chatbot", icon: MessageCircle, description: "AI assistant for stocks & data" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Predictive analytics & insights" },
    { id: "advanced-features", label: "Advanced Features", icon: Sparkles, isRoute: true, route: "/dashboard/advanced-features", description: "Batch upload, document comparison" },
    { id: "ai-analytics", label: "AI Analytics", icon: Activity, isRoute: true, route: "/dashboard/ai-analytics", description: "Deep AI insights" },

    // MONITORING & ALERTS
    { id: "category-monitoring", isCategory: true, label: "MONITORING" },
    { id: "alerts", label: "Alerts & Notifications", icon: AlertTriangle, description: "Critical alerts & compliance" },

    // ADMINISTRATION (Enterprise)
    { id: "divider-1", isDivider: true },
    { id: "category-admin", isCategory: true, label: "ADMINISTRATION" },
    { id: "organization", label: "Organization", icon: Building2, isRoute: true, route: "/dashboard/settings/organization" },
    { id: "team", label: "Team", icon: UserPlus, isRoute: true, route: "/dashboard/settings/team" },
    { id: "billing", label: "Billing", icon: CreditCard, isRoute: true, route: "/dashboard/settings/billing" },
    { id: "api-keys", label: "API Keys", icon: Key, isRoute: true, route: "/dashboard/settings/api-keys" },
    { id: "support", label: "Support", icon: LifeBuoy, isRoute: true, route: "/dashboard/support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo size={36} />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">FinSight X AI</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Financial Guardian</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/pricing")}
              className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300"
            >
              <span className="hidden sm:inline">Pricing</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Free Trial
              </Badge>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/companies")}
              className="gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Companies</span>
            </Button>
            <Button
              variant="default"
              onClick={() => router.push("/enterprise-features")}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Enterprise</span>
            </Button>
            <NotificationsPopover unreadCount={realtimeUnreadCount || stats?.unreadAlerts || 0} />
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <div className="flex">
        {/* Sidebar - Fixed Position */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} fixed left-0 top-[4rem] border-r bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden lg:w-64 h-[calc(100vh-4rem)] overflow-y-auto z-40`}>
          <nav className="space-y-1 p-4">
            {navigationItems.map((item, index) => {
              // Category headers
              if (item.isCategory) {
                return (
                  <div key={item.id} className={`${index > 0 ? 'mt-4' : ''} mb-2`}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3">
                      {item.label}
                    </p>
                  </div>
                );
              }

              // Dividers
              if (item.isDivider) {
                return (
                  <div key={item.id} className="py-2">
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                );
              }

              // Navigation items
              return (
                <div key={item.id} className="relative group">
                  <Button
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start text-sm gap-2"
                    onClick={() => {
                      if (item.isRoute && item.route) {
                        router.push(item.route);
                      } else {
                        setActiveSection(item.id);
                      }
                    }}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span className="flex-1 text-left">{item.label}</span>
                    {('badge' in item && item.badge) ? (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        {String(item.badge)}
                      </Badge>
                    ) : null}
                  </Button>
                  {item.description && (
                    <div className="hidden group-hover:block absolute left-full ml-2 top-0 z-50 w-48 p-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-lg">
                      {item.description}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Add margin to account for fixed sidebar */}
        <main className={`flex-1 p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Dashboard Home - Feature Cards */}
          {activeSection === "home" && (
            <>
              {/* NEW: Advanced Document Intelligence Features Banner */}
              <Card
                className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950 cursor-pointer hover:shadow-lg transition-shadow mb-4"
                onClick={() => router.push("/dashboard/advanced-features")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">NEW: Advanced Document Intelligence</h3>
                          <Badge className="bg-pink-500">5 NEW FEATURES</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Batch Upload • Citation Tracking • Document Intelligence • Advanced Search • Document Comparison
                        </p>
                      </div>
                    </div>
                    <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Explore Features →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Team Pricing Banner - B2B Focus */}
              <Card
                className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950 dark:via-blue-950 dark:to-cyan-950 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push("/pricing")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">Scale Your Financial Operations with Team Plans</h3>
                          <Badge className="bg-green-500">14-Day Free Trial</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Professional ($79/mo) for small teams • Business ($399/mo) for growing companies • Enterprise (Custom) for large organizations
                        </p>
                      </div>
                    </div>
                    <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
                      View Pricing →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Features Banner */}
              <Card
                className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push("/enterprise-features")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">🚀 Enterprise-Grade Features</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          AI Playbooks, LLM Hub, Chat Copilot, Multi-Language, Data Residency & more for large organizations
                        </p>
                      </div>
                    </div>
                    <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Explore Enterprise →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {getHealthPercentage().toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-500">System Health</div>
                      </div>
                      <Activity className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {stats?.totalDocuments || 0}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-500">Total Documents</div>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                          {stats?.unreadAlerts || 0}
                        </div>
                        <div className="text-sm text-amber-600 dark:text-amber-500">Active Alerts</div>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                          {stats?.totalCompanies || 0}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-500">Companies Tracked</div>
                      </div>
                      <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Feature Cards */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Portfolio Tracker Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-indigo-300 dark:hover:border-indigo-700"
                    onClick={() => router.push("/dashboard/portfolio")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <PieChart className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-green-500">NEW</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Portfolio Tracker</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Track your investments with real-time stock prices and performance analytics
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">3 Holdings</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Companies Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300 dark:hover:border-blue-700"
                    onClick={() => router.push("/dashboard/companies")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Companies</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Browse and analyze tracked companies with comprehensive data
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stats?.totalCompanies || 0} Companies</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-300 dark:hover:border-green-700"
                    onClick={() => setActiveSection("documents")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Documents</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload, manage, and analyze financial documents with AI
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stats?.totalDocuments || 0} Files</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-300 dark:hover:border-orange-700"
                    onClick={() => setActiveSection("analytics")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Analytics</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Predictive analytics, forecasting, and financial insights
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Multiple Tools</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alerts Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-amber-300 dark:hover:border-amber-700"
                    onClick={() => setActiveSection("alerts")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        {(stats?.unreadAlerts || 0) > 0 && (
                          <Badge variant="destructive">{stats?.unreadAlerts}</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">Alerts & Notifications</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Monitor critical alerts and compliance notifications
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stats?.unreadAlerts || 0} Active</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Tools Card */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-violet-300 dark:hover:border-violet-700"
                    onClick={() => setActiveSection("ai-tools")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">AI Tools</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI agents, semantic search, fraud detection, and more
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">8+ Tools</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Risk Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Risk Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stats?.documentsByRisk?.high || 0}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${stats?.totalDocuments ? ((stats.documentsByRisk?.high || 0) / stats.totalDocuments * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm">Medium Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stats?.documentsByRisk?.medium || 0}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${stats?.totalDocuments ? ((stats.documentsByRisk?.medium || 0) / stats.totalDocuments * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm">Low Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stats?.documentsByRisk?.low || 0}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${stats?.totalDocuments ? ((stats.documentsByRisk?.low || 0) / stats.totalDocuments * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alert Severity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-600" />
                          <span className="text-sm">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stats?.alertsBySeverity?.critical || 0}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${stats?.totalAlerts ? ((stats.alertsBySeverity?.critical || 0) / stats.totalAlerts * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span className="text-sm">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stats?.alertsBySeverity?.high || 0}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${stats?.totalAlerts ? ((stats.alertsBySeverity?.high || 0) / stats.totalAlerts * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stats?.alertsBySeverity?.medium || 0}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${stats?.totalAlerts ? ((stats.alertsBySeverity?.medium || 0) / stats.totalAlerts * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Recent Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentDocuments.length > 0 ? (
                        recentDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              doc.riskLevel === "high" ? "destructive" :
                              doc.riskLevel === "medium" ? "default" : "secondary"
                            }>
                              {doc.riskLevel || "pending"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No documents yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAlerts.length > 0 ? (
                        recentAlerts.map((alert) => (
                          <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                              alert.severity === "critical" ? "text-red-600" :
                              alert.severity === "high" ? "text-orange-500" :
                              alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{alert.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{alert.description}</p>
                            </div>
                            <Badge variant={alert.status === "resolved" ? "secondary" : "destructive"} className="flex-shrink-0">
                              {alert.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No alerts</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Documents Section */}
          {activeSection === "documents" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Document Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DocumentUpload />
                  <ChatInterface />
                </div>
              </div>
              <FilesPanel />
              <FinancialDataPanel />
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics & Insights</h2>
              <PredictiveAnalyticsPanel />
              <FinancialReportsPanel />
              <ReportGenerationPanel />
              <HistoryPanel />
            </div>
          )}

          {/* AI Tools Section */}
          {activeSection === "ai-tools" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">AI-Powered Tools</h2>

              {/* Interactive AI Tools - File Upload & Runnable Agents */}
              <InteractiveAITools />

              {/* AI Tools Navigation Grid */}
              <div>
                <h3 className="text-xl font-bold mb-4 mt-8">Advanced AI Features</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveSection("ai-agents")}>
                    <div className="flex items-center gap-4 mb-3">
                      <Activity className="h-8 w-8 text-indigo-600" />
                      <h3 className="text-xl font-bold">AI Agents</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Multi-agent analysis and automation</p>
                  </Card>
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveSection("doc-intelligence")}>
                    <div className="flex items-center gap-4 mb-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <h3 className="text-xl font-bold">Document Intelligence</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Advanced document analysis</p>
                  </Card>
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveSection("semantic-search")}>
                    <div className="flex items-center gap-4 mb-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <h3 className="text-xl font-bold">Semantic Search</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">AI-powered search and discovery</p>
                  </Card>
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveSection("fraud")}>
                    <div className="flex items-center gap-4 mb-3">
                      <Shield className="h-8 w-8 text-red-600" />
                      <h3 className="text-xl font-bold">Fraud Detection</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">AI fraud and anomaly detection</p>
                  </Card>
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveSection("explainable")}>
                    <div className="flex items-center gap-4 mb-3">
                      <Activity className="h-8 w-8 text-purple-600" />
                      <h3 className="text-xl font-bold">Explainable AI</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Understand AI decision-making</p>
                  </Card>
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveSection("collaboration")}>
                    <div className="flex items-center gap-4 mb-3">
                      <Users className="h-8 w-8 text-orange-600" />
                      <h3 className="text-xl font-bold">Collaboration</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Team collaboration tools</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Sub-sections for AI Tools */}
          {activeSection === "ai-agents" && <AIAgentsPanel />}
          {activeSection === "doc-intelligence" && <DocumentIntelligencePanel />}
          {activeSection === "semantic-search" && <SemanticSearchPanel />}
          {activeSection === "fraud" && <FraudDetectionPanel />}
          {activeSection === "explainable" && <ExplainableAIPanel />}
          {activeSection === "collaboration" && <CollaborationPanel />}

          {/* SEC 10 RAG Section */}
          {activeSection === "sec-10-rag" && <SEC10RAG />}

          {activeSection === "financial-chatbot" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Financial AI Chatbot</h2>
                <p className="text-muted-foreground mb-6">Intelligent assistant with full knowledge of your stocks, portfolio, and financial data</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChatInterface />
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-bold mb-3">Knowledge Base</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Real-time Stock Data</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Portfolio Holdings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Uploaded Documents</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Company Information</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Market Trends</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-bold mb-3">Suggested Questions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          What's my portfolio performance today?
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          Analyze AAPL stock fundamentals
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          Show me high-risk stocks
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          Compare GOOGL vs MSFT
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {activeSection === "alerts" && <AlertsPanel />}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Settings & Configuration</h2>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Governance & Compliance</h3>
                <GovernancePanel />
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <NotificationCenterPanel />
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}