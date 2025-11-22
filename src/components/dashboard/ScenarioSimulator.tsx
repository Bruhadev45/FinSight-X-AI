"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export const ScenarioSimulator = () => {
    const [revenueGrowth, setRevenueGrowth] = useState(5);
    const [costIncrease, setCostIncrease] = useState(2);
    const [marketShare, setMarketShare] = useState(15);

    // Generate mock projection data based on inputs
    const generateData = () => {
        const baseRevenue = 100;
        const baseCost = 70;
        const data = [];

        for (let year = 2024; year <= 2029; year++) {
            const yearIndex = year - 2024;
            const projectedRevenue = baseRevenue * Math.pow(1 + revenueGrowth / 100, yearIndex);
            const projectedCost = baseCost * Math.pow(1 + costIncrease / 100, yearIndex);
            const projectedProfit = projectedRevenue - projectedCost;

            data.push({
                year,
                revenue: Math.round(projectedRevenue),
                cost: Math.round(projectedCost),
                profit: Math.round(projectedProfit),
            });
        }
        return data;
    };

    const data = generateData();
    const finalProfit = data[data.length - 1].profit;
    const initialProfit = data[0].profit;
    const profitGrowth = ((finalProfit - initialProfit) / initialProfit) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Scenario Variables
                    </CardTitle>
                    <CardDescription>Adjust key drivers to forecast outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Revenue Growth (YoY)</label>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                {revenueGrowth}%
                            </Badge>
                        </div>
                        <Slider
                            value={[revenueGrowth]}
                            min={-10}
                            max={30}
                            step={1}
                            onValueChange={(val) => setRevenueGrowth(val[0])}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-slate-500">Base case: 5% | Bull case: 15%</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Operating Cost Increase</label>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                                {costIncrease}%
                            </Badge>
                        </div>
                        <Slider
                            value={[costIncrease]}
                            min={0}
                            max={20}
                            step={0.5}
                            onValueChange={(val) => setCostIncrease(val[0])}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-slate-500">Inflation adjustment: 2-3%</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Market Share</label>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                                {marketShare}%
                            </Badge>
                        </div>
                        <Slider
                            value={[marketShare]}
                            min={5}
                            max={50}
                            step={1}
                            onValueChange={(val) => setMarketShare(val[0])}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <Button className="w-full" variant="outline" onClick={() => {
                            setRevenueGrowth(5);
                            setCostIncrease(2);
                            setMarketShare(15);
                        }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset to Baseline
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Visualization Panel */}
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Financial Projection (5 Years)</CardTitle>
                            <CardDescription>Projected Revenue vs. Cost vs. Profit</CardDescription>
                        </div>
                        <div className={`text-right ${profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="text-2xl font-bold">
                                {profitGrowth >= 0 ? '+' : ''}{Math.round(profitGrowth)}%
                            </div>
                            <div className="text-xs text-slate-500">Net Profit Growth</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Revenue"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                    name="Net Profit"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cost"
                                    stroke="#ef4444"
                                    fill="transparent"
                                    strokeDasharray="5 5"
                                    name="Costs"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">AI Insight</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Based on historical volatility, a revenue growth of {revenueGrowth}% is {revenueGrowth > 15 ? "optimistic" : "conservative"}.
                                Consider hedging against cost increases above 4%.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
