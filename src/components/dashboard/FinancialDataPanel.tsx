"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, DollarSign, Search, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

interface FinancialMetric {
  id: number;
  companyName: string;
  fiscalYear: number;
  fiscalQuarter: string | null;
  revenue: number | null;
  ebitda: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  equity: number | null;
  debtToEquityRatio: number | null;
  roe: number | null;
  currentRatio: number | null;
}

export const FinancialDataPanel = () => {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/financial-metrics?limit=50");
      if (!response.ok) throw new Error("Failed to fetch financial data");
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = metrics.filter((metric) =>
    metric.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatRatio = (value: number | null) => {
    if (value === null) return "N/A";
    return value.toFixed(2);
  };

  // Calculate aggregate stats
  const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const avgROE = metrics.filter(m => m.roe).reduce((sum, m) => sum + (m.roe || 0), 0) / metrics.filter(m => m.roe).length || 0;
  const uniqueCompanies = new Set(metrics.map(m => m.companyName)).size;

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Financial Data Files
          </CardTitle>
          <CardDescription>All extracted financial metrics and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {uniqueCompanies}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Companies</div>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Total Revenue</div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {avgROE.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-500">Avg ROE</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Financial Data List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredMetrics.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No financial data matches your search" : "No financial data available yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMetrics.map((metric) => (
                <Card key={metric.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{metric.companyName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">FY {metric.fiscalYear}</Badge>
                          {metric.fiscalQuarter && (
                            <Badge variant="secondary">{metric.fiscalQuarter}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Revenue</div>
                        <div className="font-semibold">{formatCurrency(metric.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">EBITDA</div>
                        <div className="font-semibold">{formatCurrency(metric.ebitda)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Net Income</div>
                        <div className="font-semibold">{formatCurrency(metric.netIncome)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Total Assets</div>
                        <div className="font-semibold">{formatCurrency(metric.totalAssets)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Debt/Equity</div>
                        <div className="font-semibold">{formatRatio(metric.debtToEquityRatio)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">ROE</div>
                        <div className="font-semibold">
                          {metric.roe !== null ? `${metric.roe.toFixed(1)}%` : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Current Ratio</div>
                        <div className="font-semibold">{formatRatio(metric.currentRatio)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Equity</div>
                        <div className="font-semibold">{formatCurrency(metric.equity)}</div>
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
