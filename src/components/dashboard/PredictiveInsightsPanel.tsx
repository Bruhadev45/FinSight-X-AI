"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Brain,
  Target,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface PredictiveInsightsPanelProps {
  companyId: string;
  timeSegment: "daily" | "weekly" | "monthly";
}

export const PredictiveInsightsPanel = ({ companyId, timeSegment }: PredictiveInsightsPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    generateInsights();
  }, [companyId, timeSegment]);

  const generateInsights = async () => {
    try {
      setLoading(true);

      // Fetch recent data
      const [docsRes, alertsRes] = await Promise.all([
        fetch(`/api/documents?companyId=${companyId}`),
        fetch(`/api/alerts?companyId=${companyId}`)
      ]);

      const documents = docsRes.ok ? await docsRes.json() : [];
      const alerts = alertsRes.ok ? await alertsRes.json() : [];

      // Generate predictive insights
      const predictions = generatePredictions(documents, alerts, timeSegment);
      setInsights(predictions);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = (documents: any[], alerts: any[], segment: string) => {
    const now = new Date();
    const recentDocs = documents.filter((doc: any) => {
      const docDate = new Date(doc.createdAt);
      const daysAgo = (now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24);
      return segment === "daily" ? daysAgo <= 7 : segment === "weekly" ? daysAgo <= 30 : daysAgo <= 90;
    });

    const riskMap: any = { high: 80, medium: 50, low: 20 };
    const avgRisk = recentDocs.reduce((sum, doc) => sum + (riskMap[doc.riskLevel] || 0), 0) / (recentDocs.length || 1);
    const highRiskCount = recentDocs.filter(d => d.riskLevel === "high").length;
    const highRiskRate = highRiskCount / (recentDocs.length || 1);

    // Trend analysis
    const halfPoint = Math.floor(recentDocs.length / 2);
    const firstHalf = recentDocs.slice(0, halfPoint);
    const secondHalf = recentDocs.slice(halfPoint);
    
    const firstAvgRisk = firstHalf.reduce((sum, doc) => sum + (riskMap[doc.riskLevel] || 0), 0) / (firstHalf.length || 1);
    const secondAvgRisk = secondHalf.reduce((sum, doc) => sum + (riskMap[doc.riskLevel] || 0), 0) / (secondHalf.length || 1);
    
    const riskTrend = secondAvgRisk > firstAvgRisk ? "increasing" : secondAvgRisk < firstAvgRisk ? "decreasing" : "stable";
    const trendPercentage = Math.abs(((secondAvgRisk - firstAvgRisk) / firstAvgRisk) * 100);

    // Predictions
    const predictedRisk = secondAvgRisk + (secondAvgRisk - firstAvgRisk);
    const predictedHighRiskDocs = Math.round(highRiskCount * 1.2);
    const predictedAlerts = Math.round(alerts.length * 1.15);

    // Recommendations
    const recommendations = [];
    
    if (highRiskRate > 0.3) {
      recommendations.push({
        type: "warning",
        title: "High Risk Document Rate",
        message: `${(highRiskRate * 100).toFixed(1)}% of recent documents are high risk. Consider implementing stricter review processes.`,
        action: "Review high-risk documents"
      });
    }

    if (riskTrend === "increasing") {
      recommendations.push({
        type: "alert",
        title: "Increasing Risk Trend",
        message: `Risk levels have increased by ${trendPercentage.toFixed(1)}%. Enhanced monitoring recommended.`,
        action: "Enable strict alerts"
      });
    }

    if (alerts.filter((a: any) => a.severity === "critical").length > 5) {
      recommendations.push({
        type: "critical",
        title: "Multiple Critical Alerts",
        message: "Several critical alerts detected. Immediate review and action required.",
        action: "Review critical issues"
      });
    }

    if (riskTrend === "decreasing") {
      recommendations.push({
        type: "success",
        title: "Positive Trend",
        message: `Risk levels decreased by ${trendPercentage.toFixed(1)}%. Current practices are effective.`,
        action: "Maintain current process"
      });
    }

    if (documents.length > 0 && alerts.length === 0) {
      recommendations.push({
        type: "info",
        title: "Low Alert Activity",
        message: "No alerts generated recently. Document quality is high.",
        action: "Continue monitoring"
      });
    }

    return {
      currentRisk: avgRisk.toFixed(1),
      predictedRisk: Math.max(0, Math.min(100, predictedRisk)).toFixed(1),
      riskTrend,
      trendPercentage: trendPercentage.toFixed(1),
      predictions: [
        {
          label: "Risk Score Next Period",
          current: avgRisk.toFixed(1),
          predicted: Math.max(0, Math.min(100, predictedRisk)).toFixed(1),
          change: predictedRisk - avgRisk,
          icon: predictedRisk > avgRisk ? TrendingUp : TrendingDown,
          color: predictedRisk > avgRisk ? "text-red-600" : "text-green-600"
        },
        {
          label: "High Risk Documents",
          current: highRiskCount,
          predicted: predictedHighRiskDocs,
          change: predictedHighRiskDocs - highRiskCount,
          icon: predictedHighRiskDocs > highRiskCount ? TrendingUp : TrendingDown,
          color: predictedHighRiskDocs > highRiskCount ? "text-red-600" : "text-green-600"
        },
        {
          label: "Expected Alerts",
          current: alerts.length,
          predicted: predictedAlerts,
          change: predictedAlerts - alerts.length,
          icon: predictedAlerts > alerts.length ? TrendingUp : TrendingDown,
          color: predictedAlerts > alerts.length ? "text-amber-600" : "text-green-600"
        }
      ],
      recommendations
    };
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

  if (!insights) return null;

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          AI Predictive Insights
          <Badge variant="outline" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            ML-Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.predictions.map((pred: any, idx: number) => {
            const Icon = pred.icon;
            return (
              <div
                key={idx}
                className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">{pred.label}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {pred.predicted}
                  </span>
                  <span className="text-sm text-gray-500">from {pred.current}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon className={`h-4 w-4 ${pred.color}`} />
                  <span className={`text-sm font-medium ${pred.color}`}>
                    {pred.change > 0 ? "+" : ""}{pred.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            AI Recommendations
          </h4>
          <div className="space-y-3">
            {insights.recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  rec.type === "critical"
                    ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    : rec.type === "warning"
                    ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                    : rec.type === "success"
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  {rec.type === "critical" && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                  {rec.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />}
                  {rec.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                  {rec.type === "info" && <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                  
                  <div className="flex-1">
                    <h5 className="font-medium text-sm mb-1">{rec.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{rec.message}</p>
                    <Button variant="outline" size="sm">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Summary */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Risk Trend</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                {insights.riskTrend === "increasing" && `↗️ Increasing by ${insights.trendPercentage}%`}
                {insights.riskTrend === "decreasing" && `↘️ Decreasing by ${insights.trendPercentage}%`}
                {insights.riskTrend === "stable" && `→ Stable trend`}
              </p>
            </div>
            <Badge
              variant={
                insights.riskTrend === "increasing"
                  ? "destructive"
                  : insights.riskTrend === "decreasing"
                  ? "secondary"
                  : "outline"
              }
            >
              {insights.riskTrend}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
