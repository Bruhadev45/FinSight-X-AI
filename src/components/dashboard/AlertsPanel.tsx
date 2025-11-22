"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Bell, Check, X, Plus, Loader2, Clock, Calendar, Radio } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

interface Alert {
  id: number;
  alertType: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  triggeredAt: string;
}

interface AlertRule {
  id: number;
  ruleName: string;
  metricType: string;
  thresholdValue: number;
  comparisonOperator: string;
  enabled: boolean;
  frequency?: string;
  notificationChannels: string[];
}

export const AlertsPanel = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleName: "",
    metricType: "revenue_drop",
    thresholdValue: 10,
    comparisonOperator: "greater_than",
    frequency: "daily",
    notificationChannels: ["email"],
  });

  // Use real-time alerts hook
  const { alerts, unreadCount, isLoading: alertsLoading, markAsRead, markAllAsRead, refetch } = useRealtimeAlerts({
    pollInterval: 5000,
    enableToasts: false, // Disable toasts in this panel since they're enabled in dashboard
    enableSound: false,
  });

  useEffect(() => {
    fetchAlertRules();
  }, []);

  // Filter alerts based on selected filter
  const filteredAlerts = filter === "all" 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  const fetchAlertRules = async () => {
    try {
      const response = await fetch("/api/alert-rules?limit=10");
      if (response.ok) {
        const data = await response.json();
        setAlertRules(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching alert rules:", error);
    }
  };

  const createAlertRule = async () => {
    if (!newRule.ruleName.trim()) {
      toast.error("Please enter a rule name");
      return;
    }

    try {
      const response = await fetch("/api/alert-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRule,
          enabled: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to create alert rule");

      toast.success("Alert rule created successfully");
      setShowCreateRule(false);
      setNewRule({
        ruleName: "",
        metricType: "revenue_drop",
        thresholdValue: 10,
        comparisonOperator: "greater_than",
        frequency: "daily",
        notificationChannels: ["email"],
      });
      fetchAlertRules();
    } catch (error) {
      console.error("Error creating alert rule:", error);
      toast.error("Failed to create alert rule");
    }
  };

  const acknowledgeAlert = async (id: number) => {
    await markAsRead(id);
    refetch();
  };

  const resolveAlert = async (id: number) => {
    try {
      await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: id }),
      });
      toast.success("Alert resolved");
      refetch();
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to resolve alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency?.toLowerCase()) {
      case "daily": return <Clock className="h-3 w-3" />;
      case "weekly": return <Calendar className="h-3 w-3" />;
      case "monthly": return <Calendar className="h-3 w-3" />;
      case "high-risk-only": return <AlertTriangle className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <Radio className="h-3 w-3 text-green-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Real-Time Alerts
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live monitoring • Auto-refresh every 5s
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  className="h-8"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No alerts to display</p>
              <p className="text-xs mt-1">
                {filter === "all" 
                  ? "Your system is running smoothly" 
                  : `No ${filter} severity alerts`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="bg-white dark:bg-slate-900 border-l-4 border-l-transparent hover:border-l-orange-500 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        alert.severity === "critical" ? "text-red-600 animate-pulse" :
                        alert.severity === "high" ? "text-orange-500" :
                        alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {alert.description}
                            </p>
                          </div>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(alert.triggeredAt).toLocaleString()}
                          </span>
                          {alert.status === "unread" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="h-7 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => resolveAlert(alert.id)}
                                className="h-7 text-xs"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          )}
                          {alert.status !== "unread" && (
                            <Badge variant="secondary">
                              {alert.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Alert Rules & Frequency</CardTitle>
              <CardDescription>Configure alert triggers and notification schedules</CardDescription>
            </div>
            <Button onClick={() => setShowCreateRule(!showCreateRule)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreateRule && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-sm">Create Alert Rule</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ruleName" className="text-xs">Rule Name</Label>
                    <Input
                      id="ruleName"
                      placeholder="e.g., High Risk Detection"
                      value={newRule.ruleName}
                      onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="metricType" className="text-xs">Metric Type</Label>
                    <Select value={newRule.metricType} onValueChange={(v) => setNewRule({ ...newRule, metricType: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue_drop">Revenue Drop</SelectItem>
                        <SelectItem value="risk_score">Risk Score</SelectItem>
                        <SelectItem value="compliance_issue">Compliance Issue</SelectItem>
                        <SelectItem value="fraud_detected">Fraud Detected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="threshold" className="text-xs">Threshold Value</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={newRule.thresholdValue}
                      onChange={(e) => setNewRule({ ...newRule, thresholdValue: parseFloat(e.target.value) })}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency" className="text-xs">Alert Frequency</Label>
                    <Select value={newRule.frequency} onValueChange={(v) => setNewRule({ ...newRule, frequency: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="high-risk-only">High Risk Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={createAlertRule} size="sm" className="h-8">
                    Create Rule
                  </Button>
                  <Button onClick={() => setShowCreateRule(false)} size="sm" variant="outline" className="h-8">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {alertRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alert rules configured</p>
              <p className="text-xs mt-1">Create rules to automate alert notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertRules.map((rule) => (
                <Card key={rule.id} className="bg-white dark:bg-slate-900">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{rule.ruleName}</h4>
                          {rule.enabled && <Badge variant="default" className="text-xs">Active</Badge>}
                          {!rule.enabled && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>{rule.metricType}</span>
                          <span>{rule.comparisonOperator} {rule.thresholdValue}</span>
                          {rule.frequency && (
                            <div className="flex items-center gap-1">
                              {getFrequencyIcon(rule.frequency)}
                              <span className="capitalize">{rule.frequency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};