"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertTriangle, FileText, BarChart3, Shield, Eye, RefreshCw, Clock, Activity, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Role = "cfo" | "risk" | "auditor";

interface KPI {
  label: string;
  value: string;
  trend?: string;
}

interface Widget {
  name: string;
  count: number;
}

interface RoleViewData {
  role: Role;
  kpis: KPI[];
  widgets: Widget[];
  recentActivity?: any[];
  recentAlerts?: any[];
  recentDocuments?: any[];
  complianceChecks?: any[];
  companiesCount?: number;
  documentsCount?: number;
  totalAlerts?: number;
  criticalCount?: number;
  totalDocuments?: number;
  findingsCount?: number;
}

interface RoleView {
  id: Role;
  name: string;
  icon: any;
  description: string;
  color: string;
}

const roleViews: RoleView[] = [
  {
    id: "cfo",
    name: "CFO View",
    icon: TrendingUp,
    description: "High-level KPIs, forecasts, and strategic insights",
    color: "blue"
  },
  {
    id: "risk",
    name: "Risk Officer View",
    icon: AlertTriangle,
    description: "Alerts, violations, and risk metrics",
    color: "red"
  },
  {
    id: "auditor",
    name: "Auditor View",
    icon: FileText,
    description: "Document traces, citations, and audit trails",
    color: "purple"
  }
];

export const RoleBasedViewsPanel = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("cfo");
  const [roleData, setRoleData] = useState<RoleViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const currentView = roleViews.find(v => v.id === selectedRole)!;

  const fetchRoleData = async (role: Role) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/role-views?role=${role}`);
      if (!response.ok) {
        throw new Error("Failed to fetch role data");
      }
      const data = await response.json();
      setRoleData(data);
      setLastUpdated(new Date());
      toast.success(`${currentView.name} data updated`);
    } catch (error) {
      console.error("Error fetching role data:", error);
      toast.error("Failed to load role data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleData(selectedRole);
  }, [selectedRole]);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
  };

  const handleRefresh = () => {
    fetchRoleData(selectedRole);
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "red": return "bg-red-500";
      case "yellow": return "bg-yellow-500";
      case "green": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "processing": return <Activity className="h-4 w-4 text-blue-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Role-Based Analytics Views
              </CardTitle>
              <CardDescription>
                Customized dashboards with real-time data for different organizational roles
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selector */}
          <div className="flex gap-2">
            {roleViews.map((role) => (
              <Button
                key={role.id}
                variant={selectedRole === role.id ? "default" : "outline"}
                onClick={() => handleRoleChange(role.id)}
                className="gap-2"
                disabled={loading}
              >
                <role.icon className="h-4 w-4" />
                {role.name}
              </Button>
            ))}
          </div>

          {loading && !roleData ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-muted-foreground">Loading {currentView.name}...</p>
              </div>
            </div>
          ) : roleData ? (
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${currentView.color}-500 to-${currentView.color}-600 flex items-center justify-center`}>
                    <currentView.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{currentView.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentView.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Activity className="h-3 w-3" />
                    Live Data
                  </Badge>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {roleData.kpis.map((kpi, i) => (
                    <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {kpi.label}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-2xl font-bold">{kpi.value}</div>
                          {kpi.trend && (
                            <Badge 
                              variant={kpi.trend.startsWith("+") ? "default" : kpi.trend.startsWith("-") ? "destructive" : "secondary"} 
                              className="text-xs"
                            >
                              {kpi.trend}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Widgets */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Dashboard Widgets
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roleData.widgets.map((widget, i) => (
                      <Card key={i} className="bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">{widget.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {widget.count}
                              </Badge>
                              <Badge variant="outline" className="text-xs">Active</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Role-Specific Content */}
                {selectedRole === "cfo" && roleData.recentActivity && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        CFO Executive Dashboard
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Total Companies</div>
                            <div className="text-2xl font-bold">{roleData.companiesCount || 0}</div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Documents Analyzed</div>
                            <div className="text-2xl font-bold">{roleData.documentsCount || 0}</div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p>• Strategic financial overview across all companies</p>
                          <p>• Revenue forecasting and predictive analytics</p>
                          <p>• Investment performance and ROI tracking</p>
                          <p>• Board-ready financial reports and presentations</p>
                          <p>• Budget vs. actual variance analysis</p>
                        </div>
                        {roleData.recentActivity.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-semibold mb-2">Recent Financial Metrics</h5>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {roleData.recentActivity.map((activity, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded p-2 text-xs">
                                  <div className="font-medium">{activity.description}</div>
                                  <div className="text-muted-foreground">
                                    {formatTimestamp(activity.timestamp)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedRole === "risk" && roleData.recentAlerts && (
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Risk Management Center
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Total Alerts</div>
                            <div className="text-2xl font-bold text-red-600">{roleData.totalAlerts || 0}</div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Critical Alerts</div>
                            <div className="text-2xl font-bold text-red-600">{roleData.criticalCount || 0}</div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <p>• Real-time risk score monitoring and alerts</p>
                          <p>• Fraud detection patterns and anomalies</p>
                          <p>• Compliance violation tracking and remediation</p>
                          <p>• Risk heat maps by company and category</p>
                          <p>• Automated risk assessment workflows</p>
                        </div>
                        {roleData.recentAlerts.length > 0 ? (
                          <div>
                            <h5 className="text-sm font-semibold mb-2">Recent Alerts</h5>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {roleData.recentAlerts.map((alert, i) => (
                                <Card key={i} className="bg-white dark:bg-slate-900">
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-3">
                                      <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(alert.severity)}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="text-xs">
                                            {alert.type}
                                          </Badge>
                                          <Badge 
                                            variant={alert.status === "pending" ? "destructive" : "secondary"}
                                            className="text-xs"
                                          >
                                            {alert.status}
                                          </Badge>
                                        </div>
                                        <p className="text-xs font-medium mb-1">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatTimestamp(alert.timestamp)}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No recent alerts
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedRole === "auditor" && roleData.recentDocuments && (
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Audit & Compliance Hub
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Total Documents</div>
                            <div className="text-2xl font-bold">{roleData.totalDocuments || 0}</div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Audit Findings</div>
                            <div className="text-2xl font-bold text-purple-600">{roleData.findingsCount || 0}</div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <p>• Complete document audit trail with timestamps</p>
                          <p>• Source citations and evidence tracking</p>
                          <p>• Compliance framework verification (SOX, IFRS, GDPR)</p>
                          <p>• Version control and change history</p>
                          <p>• Audit findings documentation and reporting</p>
                        </div>
                        {roleData.recentDocuments.length > 0 ? (
                          <div>
                            <h5 className="text-sm font-semibold mb-2">Recent Documents</h5>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {roleData.recentDocuments.map((doc, i) => (
                                <Card key={i} className="bg-white dark:bg-slate-900">
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-3">
                                      {getStatusIcon(doc.status)}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium mb-1 truncate">{doc.name}</p>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {doc.status}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {formatTimestamp(doc.uploadedAt)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No documents available
                          </div>
                        )}

                        {roleData.complianceChecks && roleData.complianceChecks.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-semibold mb-2">Compliance Checks</h5>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {roleData.complianceChecks.map((check, i) => (
                                <Card key={i} className="bg-white dark:bg-slate-900">
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-3">
                                      {getStatusIcon(check.status)}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="text-xs">
                                            Score: {check.score}%
                                          </Badge>
                                          <Badge 
                                            variant={check.status === "passed" ? "default" : "destructive"}
                                            className="text-xs"
                                          >
                                            {check.status}
                                          </Badge>
                                        </div>
                                        {check.details && (
                                          <p className="text-xs text-muted-foreground">
                                            {check.details}
                                          </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {formatTimestamp(check.timestamp)}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Permissions Info */}
                <Card className="mt-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Role Permissions & Data Access</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          This view is configured with role-specific permissions and data access controls.
                          Only authorized users can access sensitive financial data and compliance reports.
                          All data is fetched in real-time from your database.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};