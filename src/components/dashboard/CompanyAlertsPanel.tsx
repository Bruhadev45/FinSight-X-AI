"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Bell, Check, X, Plus, Loader2, BellRing, Settings, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

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

interface CompanyAlertsPanelProps {
  companyId: string;
  companyName: string;
}

export const CompanyAlertsPanel = ({ companyId, companyName }: CompanyAlertsPanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newRule, setNewRule] = useState({
    ruleName: "",
    metricType: "revenue_drop",
    thresholdValue: 10,
    comparisonOperator: "greater_than",
    frequency: "daily",
    notificationChannels: ["email"],
  });

  useEffect(() => {
    fetchAlerts();
    fetchAlertRules();
    checkAlertsStatus();
  }, [companyId, filter]);

  const checkAlertsStatus = () => {
    const status = localStorage.getItem(`alerts_enabled_${companyId}`);
    setAlertsEnabled(status === "true");
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const url = filter === "all" 
        ? `/api/alerts?limit=10&companyId=${companyId}`
        : `/api/alerts?severity=${filter}&limit=10&companyId=${companyId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : data.alerts || []);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertRules = async () => {
    try {
      const response = await fetch(`/api/alert-rules?limit=10&companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setAlertRules(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching alert rules:", error);
    }
  };

  const toggleAlerts = async (enabled: boolean) => {
    setAlertsEnabled(enabled);
    localStorage.setItem(`alerts_enabled_${companyId}`, enabled.toString());
    
    if (enabled) {
      toast.success(`Alerts enabled for ${companyName}`);
      // Create a default alert rule if none exist
      if (alertRules.length === 0) {
        await createDefaultRule();
      }
    } else {
      toast.info(`Alerts disabled for ${companyName}`);
    }
  };

  const createDefaultRule = async () => {
    try {
      const response = await fetch("/api/alert-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleName: `${companyName} - High Risk Detection`,
          metricType: "risk_score",
          thresholdValue: 70,
          comparisonOperator: "greater_than",
          frequency: "daily",
          enabled: true,
          notificationChannels: ["email"],
        }),
      });

      if (response.ok) {
        fetchAlertRules();
      }
    } catch (error) {
      console.error("Error creating default rule:", error);
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
      setShowConfigDialog(false);
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

  const toggleRuleStatus = async (ruleId: number, enabled: boolean) => {
    try {
      const response = await fetch(`/api/alert-rules?id=${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        toast.success(`Rule ${enabled ? "enabled" : "disabled"}`);
        fetchAlertRules();
      }
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast.error("Failed to update rule");
    }
  };

  const acknowledgeAlert = async (id: number) => {
    try {
      await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: id }),
      });
      toast.success("Alert acknowledged");
      fetchAlerts();
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      toast.error("Failed to acknowledge alert");
    }
  };

  const resolveAlert = async (id: number) => {
    try {
      await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: id }),
      });
      toast.success("Alert resolved");
      fetchAlerts();
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
      {/* Alert Toggle Card */}
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${alertsEnabled ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}>
                <BellRing className={`h-6 w-6 ${alertsEnabled ? "text-green-600 dark:text-green-400" : "text-gray-400"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Alert System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alertsEnabled 
                    ? `Monitoring ${companyName} for anomalies` 
                    : `Enable alerts to monitor ${companyName}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!alertsEnabled}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Configure Alert Rules</DialogTitle>
                    <DialogDescription>
                      Set up custom alert rules for {companyName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Create New Rule Section */}
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm">Create New Alert Rule</h4>
                        
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
                                <SelectItem value="debt_to_equity">Debt-to-Equity Ratio</SelectItem>
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
                        
                        <Button onClick={createAlertRule} size="sm" className="h-8">
                          <Plus className="h-3 w-3 mr-1" />
                          Create Rule
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Existing Rules */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Active Alert Rules</h4>
                      {alertRules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No alert rules configured</p>
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
                                      <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
                                        {rule.enabled ? "Active" : "Disabled"}
                                      </Badge>
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
                                  <Switch
                                    checked={rule.enabled}
                                    onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setShowConfigDialog(false)} variant="outline">
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Switch
                checked={alertsEnabled}
                onCheckedChange={toggleAlerts}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List - Only show when enabled */}
      {alertsEnabled && (
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Recent alerts for {companyName}</CardDescription>
              </div>
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No alerts to display</p>
                <p className="text-xs mt-1">System is monitoring normally</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="bg-white dark:bg-slate-900">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          alert.severity === "critical" ? "text-red-600" :
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
      )}
    </div>
  );
};
