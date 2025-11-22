"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft
} from 'lucide-react';
import { AddStockDialog } from '@/components/dashboard/AddStockDialog';
import { Badge } from '@/components/ui/badge';

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addStockOpen, setAddStockOpen] = useState(false);

  const fetchPortfolios = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/portfolio?userId=user_1');
      const data = await response.json();
      if (data.success) {
        setPortfolios(data.portfolios);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPortfolios, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const portfolio = portfolios[0];

  if (!portfolio) {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Portfolio Tracker</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No portfolio found</p>
            <Button>Create Portfolio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back to Dashboard Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{portfolio.name}</h1>
          <p className="text-muted-foreground">{portfolio.description}</p>
        </div>
        <Button onClick={fetchPortfolios} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Portfolio market value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {portfolio.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolio.totalGainLoss)}
            </div>
            <p className={`text-xs mt-1 ${portfolio.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(portfolio.totalGainLossPercent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active positions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Holdings</CardTitle>
            <Button size="sm" onClick={() => setAddStockOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.holdings.map((holding: any) => (
              <div
                key={holding.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{holding.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{holding.companyName}</p>
                    </div>
                    {holding.changePercent && (
                      <Badge variant={holding.changePercent >= 0 ? "default" : "destructive"} className="ml-2">
                        {holding.changePercent >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(holding.changePercent).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Shares</p>
                      <p className="font-medium">{holding.shares}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Cost</p>
                      <p className="font-medium">{formatCurrency(holding.avgCostPerShare)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Price</p>
                      <p className="font-medium">{formatCurrency(holding.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-medium">{formatCurrency(holding.currentValue)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-xl font-bold ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(holding.gainLoss)}
                  </div>
                  <p className={`text-sm ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(holding.gainLossPercent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best Performer</span>
                <span className="font-semibold">
                  {portfolio.holdings.reduce((best: any, h: any) =>
                    h.gainLossPercent > best.gainLossPercent ? h : best
                  ).symbol} (+{portfolio.holdings.reduce((best: any, h: any) =>
                    h.gainLossPercent > best.gainLossPercent ? h : best
                  ).gainLossPercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost Basis</span>
                <span className="font-semibold">{formatCurrency(portfolio.holdings.reduce((sum: number, h: any) => sum + h.totalCost, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-semibold">{formatCurrency(portfolio.totalValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diversification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.holdings.map((holding: any) => {
                const percentage = (holding.currentValue / portfolio.totalValue) * 100;
                return (
                  <div key={holding.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{holding.symbol}</span>
                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddStockDialog
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        onSuccess={fetchPortfolios}
      />
    </div>
  );
}
