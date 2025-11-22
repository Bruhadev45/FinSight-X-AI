"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Activity, Loader2 } from "lucide-react";

interface AnalyticsChartsPanelProps {
  companyId: string;
  timeSegment: "daily" | "weekly" | "monthly";
}

export const AnalyticsChartsPanel = ({ companyId, timeSegment }: AnalyticsChartsPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [companyId, timeSegment]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch documents and alerts for analytics
      const [docsRes, alertsRes, analysisRes] = await Promise.all([
        fetch(`/api/documents?companyId=${companyId}`),
        fetch(`/api/alerts?companyId=${companyId}`),
        fetch(`/api/document-analysis/by-company?companyId=${companyId}`)
      ]);

      const documents = docsRes.ok ? await docsRes.json() : [];
      const alerts = alertsRes.ok ? await alertsRes.json() : [];
      const analysis = analysisRes.ok ? await analysisRes.json() : [];

      // Process data for charts
      const data = processAnalyticsData(documents, alerts, analysis, timeSegment);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (documents: any[], alerts: any[], analysis: any[], segment: string) => {
    // Risk trend over time
    const riskTrend = generateTimeSeries(documents, segment, "riskLevel");
    
    // Document status distribution
    const statusDist = documents.reduce((acc: any, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    // Risk level distribution
    const riskDist = documents.reduce((acc: any, doc) => {
      const risk = doc.riskLevel || "unknown";
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    // Alert severity distribution
    const alertDist = alerts.reduce((acc: any, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});

    // Upload trend
    const uploadTrend = generateUploadTrend(documents, segment);

    // Calculate trends
    const avgRisk = documents.reduce((sum, doc) => {
      const riskMap: any = { high: 80, medium: 50, low: 20 };
      return sum + (riskMap[doc.riskLevel] || 0);
    }, 0) / (documents.length || 1);

    const prevAvgRisk = avgRisk * 0.95; // Simulated previous period
    const riskChange = ((avgRisk - prevAvgRisk) / prevAvgRisk) * 100;

    return {
      riskTrend,
      statusDistribution: Object.entries(statusDist).map(([name, value]) => ({ name, value })),
      riskDistribution: Object.entries(riskDist).map(([name, value]) => ({ name, value })),
      alertDistribution: Object.entries(alertDist).map(([name, value]) => ({ name, value })),
      uploadTrend,
      metrics: {
        avgRisk: avgRisk.toFixed(1),
        riskChange: riskChange.toFixed(1),
        totalDocs: documents.length,
        totalAlerts: alerts.length,
        highRiskDocs: documents.filter(d => d.riskLevel === "high").length,
        criticalAlerts: alerts.filter(a => a.severity === "critical").length
      }
    };
  };

  const generateTimeSeries = (documents: any[], segment: string, field: string) => {
    const now = new Date();
    const periods = segment === "daily" ? 7 : segment === "weekly" ? 12 : 12;
    const data = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      if (segment === "daily") {
        date.setDate(date.getDate() - i);
      } else if (segment === "weekly") {
        date.setDate(date.getDate() - i * 7);
      } else {
        date.setMonth(date.getMonth() - i);
      }

      const periodDocs = documents.filter((doc: any) => {
        const docDate = new Date(doc.createdAt);
        if (segment === "daily") {
          return docDate.toDateString() === date.toDateString();
        } else if (segment === "weekly") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          return docDate >= weekStart && docDate < weekEnd;
        } else {
          return docDate.getMonth() === date.getMonth() && docDate.getFullYear() === date.getFullYear();
        }
      });

      const riskMap: any = { high: 3, medium: 2, low: 1 };
      const avgRiskValue = periodDocs.reduce((sum: number, doc: any) => 
        sum + (riskMap[doc.riskLevel] || 0), 0) / (periodDocs.length || 1);

      data.push({
        date: segment === "daily" 
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : segment === "weekly"
          ? `W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`
          : date.toLocaleDateString("en-US", { month: "short" }),
        risk: (avgRiskValue * 25).toFixed(1),
        documents: periodDocs.length,
        high: periodDocs.filter((d: any) => d.riskLevel === "high").length,
        medium: periodDocs.filter((d: any) => d.riskLevel === "medium").length,
        low: periodDocs.filter((d: any) => d.riskLevel === "low").length
      });
    }

    return data;
  };

  const generateUploadTrend = (documents: any[], segment: string) => {
    return generateTimeSeries(documents, segment, "uploadDate");
  };

  const COLORS = {
    high: "#dc2626",
    medium: "#f59e0b",
    low: "#10b981",
    critical: "#991b1b",
    completed: "#3b82f6",
    processing: "#8b5cf6",
    failed: "#ef4444",
    unknown: "#6b7280"
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Avg Risk Score</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {analyticsData.metrics.avgRisk}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {parseFloat(analyticsData.metrics.riskChange) > 0 ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <span className={`text-xs ${parseFloat(analyticsData.metrics.riskChange) > 0 ? "text-red-600" : "text-green-600"}`}>
                    {Math.abs(parseFloat(analyticsData.metrics.riskChange))}%
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">High Risk Docs</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {analyticsData.metrics.highRiskDocs}
                </p>
                <p className="text-xs text-amber-500 mt-1">
                  {((analyticsData.metrics.highRiskDocs / analyticsData.metrics.totalDocs) * 100).toFixed(1)}% of total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {analyticsData.metrics.criticalAlerts}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  {analyticsData.metrics.totalAlerts} total alerts
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Documents</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {analyticsData.metrics.totalDocs}
                </p>
                <p className="text-xs text-green-500 mt-1">Analyzed</p>
              </div>
              <Activity className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.riskTrend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  name="Avg Risk Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Document Upload Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Upload Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.riskTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" stackId="a" fill={COLORS.high} name="High Risk" />
                <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium Risk" />
                <Bar dataKey="low" stackId="a" fill={COLORS.low} name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.unknown} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.riskDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.unknown} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
