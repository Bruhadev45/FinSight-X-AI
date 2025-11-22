"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Plus, Trash2, Edit2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface AlertRule {
  id: number;
  ruleName: string;
  metricType: string;
  thresholdValue: number;
  comparisonOperator: string;
  enabled: boolean;
  notificationChannels: string | null;
  createdAt: string;
}

interface AlertRulesPanelProps {
  companyId: string;
}

export const AlertRulesPanel = ({ companyId }: AlertRulesPanelProps) => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState({
    ruleName: "",
    metricType: "debt_to_equity",
    thresholdValue: 2.0,
    comparisonOperator: ">",
    enabled: true,
    notificationChannels: ["push"]
  });

  useEffect(() => {
    fetchRules();
  }, [companyId]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/alert-rules?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Error fetching alert rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body = {
        ...formData,
        notificationChannels: formData.notificationChannels,
        ...(editingRule && { id: editingRule.id })
      };

      const url = editingRule ? `/api/alert-rules?id=${editingRule.id}` : "/api/alert-rules";
      const method = editingRule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save rule");
      }

      toast.success(editingRule ? "Rule updated successfully" : "Rule created successfully");
      setDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save rule");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this alert rule?")) return;

    try {
      const response = await fetch(`/api/alert-rules?id=${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete rule");

      toast.success("Rule deleted successfully");
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    }
  };

  const handleToggle = async (rule: AlertRule) => {
    try {
      const response = await fetch(`/api/alert-rules?id=${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: !rule.enabled
        })
      });

      if (!response.ok) throw new Error("Failed to update rule");

      toast.success(`Rule ${!rule.enabled ? "enabled" : "disabled"}`);
      fetchRules();
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast.error("Failed to update rule");
    }
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      ruleName: rule.ruleName,
      metricType: rule.metricType,
      thresholdValue: rule.thresholdValue,
      comparisonOperator: rule.comparisonOperator,
      enabled: rule.enabled,
      notificationChannels: rule.notificationChannels ? JSON.parse(rule.notificationChannels) : ["push"]
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      ruleName: "",
      metricType: "debt_to_equity",
      thresholdValue: 2.0,
      comparisonOperator: ">",
      enabled: true,
      notificationChannels: ["push"]
    });
  };

  const getMetricLabel = (metricType: string) => {
    const labels: Record<string, string> = {
      debt_to_equity: "Debt to Equity Ratio",
      revenue_change: "Revenue Change",
      compliance_score: "Compliance Score"
    };
    return labels[metricType] || metricType;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Automated Alert Rules
            <Badge variant="outline">{rules.length} rules</Badge>
          </CardTitle>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRule ? "Edit Alert Rule" : "Create Alert Rule"}</DialogTitle>
                <DialogDescription>
                  Configure automated alerts based on financial metrics
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    value={formData.ruleName}
                    onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                    placeholder="High Debt Ratio Alert"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="metricType">Metric Type</Label>
                  <Select
                    value={formData.metricType}
                    onValueChange={(value) => setFormData({ ...formData, metricType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debt_to_equity">Debt to Equity Ratio</SelectItem>
                      <SelectItem value="revenue_change">Revenue Change</SelectItem>
                      <SelectItem value="compliance_score">Compliance Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="comparisonOperator">Operator</Label>
                    <Select
                      value={formData.comparisonOperator}
                      onValueChange={(value) => setFormData({ ...formData, comparisonOperator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">Greater Than (&gt;)</SelectItem>
                        <SelectItem value="<">Less Than (&lt;)</SelectItem>
                        <SelectItem value=">=">Greater or Equal (≥)</SelectItem>
                        <SelectItem value="<=">Less or Equal (≤)</SelectItem>
                        <SelectItem value="==">Equal (=)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="thresholdValue">Threshold</Label>
                    <Input
                      id="thresholdValue"
                      type="number"
                      step="0.1"
                      value={formData.thresholdValue}
                      onChange={(e) => setFormData({ ...formData, thresholdValue: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">Enable Rule</Label>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRule ? "Update Rule" : "Create Rule"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No alert rules configured</p>
            <p className="text-xs text-gray-400 mt-1">Create rules to automate alert generation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{rule.ruleName}</h4>
                    {rule.enabled ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {getMetricLabel(rule.metricType)} {rule.comparisonOperator} {rule.thresholdValue}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(rule.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(rule)}
                    title={rule.enabled ? "Disable rule" : "Enable rule"}
                  >
                    <Switch checked={rule.enabled} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};