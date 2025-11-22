"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  FileText,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AIUsage {
  multiAgentAnalysis: number;
  documentAnalysis: number;
  chatInteractions: number;
  limits: {
    aiAnalysisPerMonth: number;
    chatInteractions: number;
    multiAgentAnalysis: number;
    documentAnalysis: number;
  };
  period: string;
  periodStart: string;
  periodEnd: string;
  plan: string;
  status: string;
}

interface AILog {
  id: number;
  agentType: string;
  status: string;
  processingTime: number;
  tokensUsed: number;
  createdAt: string;
}

export default function AIAnalyticsPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get organization
      const orgResponse = await fetch('/api/organizations');
      const orgData = await orgResponse.json();

      if (orgData.success && orgData.organizations.length > 0) {
        const org = orgData.organizations[0];
        setOrganization(org);

        // Get AI usage
        const usageResponse = await fetch(`/api/ai/usage?organizationId=${org.id}`);
        const usageData = await usageResponse.json();

        if (usageData.success) {
          setUsage(usageData.usage);
        }

        // Get AI logs
        const logsResponse = await fetch(`/api/ai-agent-logs?limit=50`);
        const logsData = await logsResponse.json();

        if (logsData.success) {
          setLogs(logsData.logs || []);
        }
      }
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.round((used / limit) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateStats = () => {
    if (!logs.length) return { avgTime: 0, avgTokens: 0, successRate: 0 };

    const completed = logs.filter(l => l.status === 'completed');
    const avgTime = completed.length > 0
      ? completed.reduce((sum, l) => sum + (l.processingTime || 0), 0) / completed.length
      : 0;
    const avgTokens = completed.length > 0
      ? completed.reduce((sum, l) => sum + (l.tokensUsed || 0), 0) / completed.length
      : 0;
    const successRate = logs.length > 0
      ? (completed.length / logs.length) * 100
      : 0;

    return { avgTime, avgTokens, successRate };
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="p-6">Loading AI analytics...</div>;
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an organization to access AI analytics
            </p>
            <Button>Create Organization</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          AI Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor your AI usage, performance metrics, and insights
        </p>
      </div>

      {/* AI Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Multi-Agent Analysis</p>
                <p className="text-2xl font-bold">
                  {usage?.multiAgentAnalysis || 0}
                </p>
                {usage && usage.limits.multiAgentAnalysis !== -1 && (
                  <p className="text-xs text-muted-foreground">
                    of {usage.limits.multiAgentAnalysis}
                  </p>
                )}
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            {usage && usage.limits.multiAgentAnalysis !== -1 && (
              <Progress
                value={getUsagePercentage(usage.multiAgentAnalysis, usage.limits.multiAgentAnalysis)}
                className="mt-4 h-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Document Analysis</p>
                <p className="text-2xl font-bold">
                  {usage?.documentAnalysis || 0}
                </p>
                {usage && usage.limits.documentAnalysis !== -1 && (
                  <p className="text-xs text-muted-foreground">
                    of {usage.limits.documentAnalysis}
                  </p>
                )}
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            {usage && usage.limits.documentAnalysis !== -1 && (
              <Progress
                value={getUsagePercentage(usage.documentAnalysis, usage.limits.documentAnalysis)}
                className="mt-4 h-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chat Interactions</p>
                <p className="text-2xl font-bold">
                  {usage?.chatInteractions || 0}
                </p>
                {usage && usage.limits.chatInteractions !== -1 && (
                  <p className="text-xs text-muted-foreground">
                    of {usage.limits.chatInteractions}
                  </p>
                )}
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            {usage && usage.limits.chatInteractions !== -1 && (
              <Progress
                value={getUsagePercentage(usage.chatInteractions, usage.limits.chatInteractions)}
                className="mt-4 h-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total AI Calls</p>
                <p className="text-2xl font-bold">
                  {(usage?.multiAgentAnalysis || 0) + (usage?.documentAnalysis || 0) + (usage?.chatInteractions || 0)}
                </p>
                <p className="text-xs text-muted-foreground">this period</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.avgTime.toFixed(2)}s
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Per AI operation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Avg Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round(stats.avgTokens).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Per analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.successRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Period Info */}
      {usage && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Current Billing Period
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-600">
                  {usage.plan.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {usage.limits.aiAnalysisPerMonth === -1 ? 'Unlimited AI' : `${usage.limits.aiAnalysisPerMonth} AI calls/month`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent AI Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent AI Activity (Last 50 operations)
          </CardTitle>
          <CardDescription>Detailed logs of AI operations</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No AI Activity Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start using AI features to see activity logs here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent Type</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Tokens Used</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="capitalize">{log.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.agentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.processingTime ? `${log.processingTime.toFixed(2)}s` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {log.tokensUsed ? log.tokensUsed.toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Warnings */}
      {usage && usage.limits.aiAnalysisPerMonth !== -1 && (
        <>
          {getUsagePercentage(usage.multiAgentAnalysis + usage.documentAnalysis + usage.chatInteractions, usage.limits.aiAnalysisPerMonth) >= 80 && (
            <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Approaching AI Usage Limit
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You've used {getUsagePercentage(usage.multiAgentAnalysis + usage.documentAnalysis + usage.chatInteractions, usage.limits.aiAnalysisPerMonth)}% of your monthly AI quota. Consider upgrading to Business or Enterprise for unlimited AI usage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
