"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Download, 
  Loader2,
  Building2,
  Calendar,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { renderSafe } from "@/lib/utils/renderSafe";

interface FinancialData {
  symbol: string;
  profile: {
    companyName: string;
    sector: string;
    industry: string;
    country: string;
    description: string;
    ceo: string;
    website: string;
    mktCap: number;
    price: number;
  };
  quote: {
    price: number;
    change: number;
    changesPercentage: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    pe: number;
    eps: number;
    volume: number;
  };
  financials: {
    incomeStatements: Array<{
      date: string;
      revenue: number;
      operatingIncome: number;
      netIncome: number;
      eps: number;
      ebitda: number;
      grossProfit: number;
      grossProfitRatio: number;
    }>;
    balanceSheets: Array<{
      date: string;
      totalAssets: number;
      totalLiabilities: number;
      totalEquity: number;
      cashAndCashEquivalents: number;
      totalDebt: number;
    }>;
    cashFlowStatements: Array<{
      date: string;
      operatingCashFlow: number;
      investingCashFlow: number;
      financingCashFlow: number;
      freeCashFlow: number;
    }>;
    ratios: Array<{
      date: string;
      currentRatio: number;
      debtEquityRatio: number;
      returnOnEquity: number;
      returnOnAssets: number;
      netProfitMargin: number;
      priceToBookRatio: number;
      priceEarningsRatio: number;
    }>;
  };
}

export function FinancialReportsPanel() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FinancialData | null>(null);
  const [period, setPeriod] = useState<"annual" | "quarter">("annual");

  const fetchFinancialData = async () => {
    if (!symbol.trim()) {
      toast.error("Please enter a company ticker symbol");
      return;
    }

    try {
      setLoading(true);
      toast.info(`Fetching financial data for ${symbol.toUpperCase()}...`);

      const response = await fetch(
        `/api/financials?symbol=${symbol.toUpperCase()}&action=comprehensive`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch financial data");
      }

      const result = await response.json();
      setData(result);
      toast.success(`Financial data loaded for ${result.profile.companyName}`);
    } catch (error: any) {
      console.error("Error fetching financial data:", error);
      toast.error(error.message || "Failed to fetch financial data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchFinancialData();
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const generateReport = () => {
    if (!data) {
      toast.error("No financial data to generate report");
      return;
    }

    const latestIncome = data.financials.incomeStatements[0];
    const latestBalance = data.financials.balanceSheets[0];
    const latestCashFlow = data.financials.cashFlowStatements[0];
    const latestRatios = data.financials.ratios[0];

    const report = `
# Financial Report: ${data.profile.companyName} (${data.symbol})
Generated: ${new Date().toLocaleDateString()}

## Company Overview
- **Sector:** ${data.profile.sector}
- **Industry:** ${data.profile.industry}
- **Country:** ${data.profile.country}
- **CEO:** ${data.profile.ceo}
- **Website:** ${data.profile.website}

## Current Stock Information
- **Current Price:** ${formatCurrency(data.quote.price)}
- **Change:** ${formatPercentage(data.quote.changesPercentage)}
- **Day Range:** ${formatCurrency(data.quote.dayLow)} - ${formatCurrency(data.quote.dayHigh)}
- **52 Week Range:** ${formatCurrency(data.quote.yearLow)} - ${formatCurrency(data.quote.yearHigh)}
- **Market Cap:** ${formatCurrency(data.quote.marketCap)}
- **P/E Ratio:** ${data.quote.pe?.toFixed(2) || "N/A"}
- **EPS:** ${typeof data.quote.eps === 'number' ? data.quote.eps.toFixed(2) : (data.quote.eps ? renderSafe(data.quote.eps) : "N/A")}
- **Volume:** ${data.quote.volume?.toLocaleString() || "N/A"}

## Income Statement (Latest: ${latestIncome.date})
- **Revenue:** ${formatCurrency(latestIncome.revenue)}
- **Gross Profit:** ${formatCurrency(latestIncome.grossProfit)} (${(latestIncome.grossProfitRatio * 100).toFixed(2)}%)
- **Operating Income:** ${formatCurrency(latestIncome.operatingIncome)}
- **Net Income:** ${formatCurrency(latestIncome.netIncome)}
- **EBITDA:** ${formatCurrency(latestIncome.ebitda)}
- **EPS:** $${typeof latestIncome.eps === 'number' ? latestIncome.eps.toFixed(2) : renderSafe(latestIncome.eps)}

## Balance Sheet (Latest: ${latestBalance.date})
- **Total Assets:** ${formatCurrency(latestBalance.totalAssets)}
- **Total Liabilities:** ${formatCurrency(latestBalance.totalLiabilities)}
- **Total Equity:** ${formatCurrency(latestBalance.totalEquity)}
- **Cash & Equivalents:** ${formatCurrency(latestBalance.cashAndCashEquivalents)}
- **Total Debt:** ${formatCurrency(latestBalance.totalDebt)}

## Cash Flow Statement (Latest: ${latestCashFlow.date})
- **Operating Cash Flow:** ${formatCurrency(latestCashFlow.operatingCashFlow)}
- **Investing Cash Flow:** ${formatCurrency(latestCashFlow.investingCashFlow)}
- **Financing Cash Flow:** ${formatCurrency(latestCashFlow.financingCashFlow)}
- **Free Cash Flow:** ${formatCurrency(latestCashFlow.freeCashFlow)}

## Key Financial Ratios (Latest: ${latestRatios.date})
- **Current Ratio:** ${latestRatios.currentRatio.toFixed(2)}
- **Debt to Equity:** ${latestRatios.debtEquityRatio.toFixed(2)}
- **Return on Equity (ROE):** ${(latestRatios.returnOnEquity * 100).toFixed(2)}%
- **Return on Assets (ROA):** ${(latestRatios.returnOnAssets * 100).toFixed(2)}%
- **Net Profit Margin:** ${(latestRatios.netProfitMargin * 100).toFixed(2)}%
- **Price to Book Ratio:** ${latestRatios.priceToBookRatio.toFixed(2)}
- **P/E Ratio:** ${latestRatios.priceEarningsRatio.toFixed(2)}

## Company Description
${data.profile.description}

---
Report generated by FinSight X AI Financial Guardian
Data source: Financial Modeling Prep
`;

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.symbol}_Financial_Report_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Financial report downloaded successfully!");
  };

  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Real-Time Financial Reports
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Get comprehensive financial data and reports for any publicly traded company
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter stock ticker (e.g., AAPL, MSFT, GOOGL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={fetchFinancialData} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-sm text-gray-500">Loading financial data...</span>
          </div>
        )}

        {!loading && !data && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              Enter a stock ticker symbol to view comprehensive financial reports
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Examples: AAPL (Apple), MSFT (Microsoft), TSLA (Tesla), GOOGL (Google)
            </p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Company Header */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.profile.companyName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono">
                      {data.symbol}
                    </Badge>
                    <Badge variant="secondary">{data.profile.sector}</Badge>
                    <Badge variant="secondary">{data.profile.country}</Badge>
                  </div>
                </div>
                <Button onClick={generateReport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>

              {/* Stock Price */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(data.quote.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
                  <div className="flex items-center gap-1">
                    {data.quote.change >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <p className={`text-xl font-bold ${data.quote.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercentage(data.quote.changesPercentage)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
                  <p className="text-xl font-bold">{formatCurrency(data.quote.marketCap)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</p>
                  <p className="text-xl font-bold">{data.quote.pe?.toFixed(2) || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Financial Statements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Income Statement */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Income Statement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.financials.incomeStatements[0] && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {data.financials.incomeStatements[0].date}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.incomeStatements[0].revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Net Income</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.incomeStatements[0].netIncome)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">EPS</p>
                        <p className="text-lg font-bold">
                          ${typeof data.financials.incomeStatements[0].eps === 'number' ? data.financials.incomeStatements[0].eps.toFixed(2) : renderSafe(data.financials.incomeStatements[0].eps)}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Balance Sheet */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Balance Sheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.financials.balanceSheets[0] && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {data.financials.balanceSheets[0].date}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Assets</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.balanceSheets[0].totalAssets)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Equity</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.balanceSheets[0].totalEquity)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Cash</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.balanceSheets[0].cashAndCashEquivalents)}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Cash Flow */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Cash Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.financials.cashFlowStatements[0] && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {data.financials.cashFlowStatements[0].date}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Operating CF</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.cashFlowStatements[0].operatingCashFlow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Free Cash Flow</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.cashFlowStatements[0].freeCashFlow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Investing CF</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(data.financials.cashFlowStatements[0].investingCashFlow)}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Key Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Key Financial Ratios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.financials.ratios[0] && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current Ratio</p>
                      <p className="text-lg font-bold">{data.financials.ratios[0].currentRatio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Debt to Equity</p>
                      <p className="text-lg font-bold">{data.financials.ratios[0].debtEquityRatio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ROE</p>
                      <p className="text-lg font-bold">{(data.financials.ratios[0].returnOnEquity * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ROA</p>
                      <p className="text-lg font-bold">{(data.financials.ratios[0].returnOnAssets * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Net Profit Margin</p>
                      <p className="text-lg font-bold">{(data.financials.ratios[0].netProfitMargin * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">P/B Ratio</p>
                      <p className="text-lg font-bold">{data.financials.ratios[0].priceToBookRatio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">P/E Ratio</p>
                      <p className="text-lg font-bold">{data.financials.ratios[0].priceEarningsRatio.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Company Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">{data.profile.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">CEO: {data.profile.ceo}</Badge>
                  <Badge variant="outline">Industry: {data.profile.industry}</Badge>
                  <a href={data.profile.website} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900">
                      🌐 {data.profile.website}
                    </Badge>
                  </a>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
