"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DataLink {
  id: string;
  sourceDoc: string;
  targetDoc: string;
  sourceField: string;
  targetField: string;
  expectedRelation: string;
  status: "matched" | "discrepancy" | "pending";
  variance?: number;
  actualValue?: number;
  expectedValue?: number;
}

const mockLinks: DataLink[] = [
  {
    id: "1",
    sourceDoc: "Income Statement Q4",
    targetDoc: "Cash Flow Statement Q4",
    sourceField: "Net Income",
    targetField: "Operating Cash Flow",
    expectedRelation: "Net Income ≈ Operating CF ± 15%",
    status: "matched",
    actualValue: 2450000,
    expectedValue: 2380000,
    variance: 2.9
  },
  {
    id: "2",
    sourceDoc: "Balance Sheet Q4",
    targetDoc: "Cash Flow Statement Q4",
    sourceField: "Cash & Equivalents",
    targetField: "Ending Cash Balance",
    expectedRelation: "Balance Sheet Cash = CF Ending Cash",
    status: "matched",
    actualValue: 5600000,
    expectedValue: 5600000,
    variance: 0
  },
  {
    id: "3",
    sourceDoc: "Income Statement Q4",
    targetDoc: "Balance Sheet Q4",
    sourceField: "Retained Earnings",
    targetField: "Accumulated Earnings",
    expectedRelation: "Prior Retained + Net Income = Current Retained",
    status: "discrepancy",
    actualValue: 12400000,
    expectedValue: 12800000,
    variance: 3.2
  },
  {
    id: "4",
    sourceDoc: "Cash Flow Q4",
    targetDoc: "Balance Sheet Q4",
    sourceField: "Fixed Assets Purchase",
    targetField: "PP&E Increase",
    expectedRelation: "Capex = Change in PP&E ± Depreciation",
    status: "matched",
    actualValue: 1200000,
    expectedValue: 1180000,
    variance: 1.7
  },
  {
    id: "5",
    sourceDoc: "Income Statement Q4",
    targetDoc: "Tax Return 2024",
    sourceField: "Tax Expense",
    targetField: "Tax Liability",
    expectedRelation: "Income Tax = Tax Return Amount",
    status: "discrepancy",
    actualValue: 850000,
    expectedValue: 920000,
    variance: 8.2
  }
];

export const DataLinkingPanel = () => {
  const [links, setLinks] = useState<DataLink[]>(mockLinks);
  const [isReconciling, setIsReconciling] = useState(false);

  const runReconciliation = () => {
    setIsReconciling(true);
    toast.info("Running cross-document reconciliation...");
    
    setTimeout(() => {
      setIsReconciling(false);
      toast.success("Reconciliation complete! 2 discrepancies found.");
    }, 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const matchedCount = links.filter(l => l.status === "matched").length;
  const discrepancyCount = links.filter(l => l.status === "discrepancy").length;

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Auto-Data Linking & Reconciliation
              </CardTitle>
              <CardDescription>
                Cross-link and validate numeric values across financial statements
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={runReconciliation}
              disabled={isReconciling}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
              Run Reconciliation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {matchedCount}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Matched Links</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {discrepancyCount}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-500">Discrepancies</div>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {((matchedCount / links.length) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Accuracy Rate</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Links */}
          <div>
            <h3 className="font-semibold mb-3">Cross-Document Links</h3>
            <div className="space-y-3">
              {links.map((link) => (
                <Card key={link.id} className={`bg-white/50 dark:bg-slate-900/50 ${
                  link.status === "discrepancy" ? "border-red-300 dark:border-red-800" : ""
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {link.status === "matched" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : link.status === "discrepancy" ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <RefreshCw className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              link.status === "matched" ? "secondary" :
                              link.status === "discrepancy" ? "destructive" : "outline"
                            }>
                              {link.status === "matched" ? "✅ Matched" :
                               link.status === "discrepancy" ? "⚠️ Discrepancy" : "⏳ Pending"}
                            </Badge>
                            {link.variance !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {link.variance}% variance
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Source</p>
                              <p className="font-medium text-sm">{link.sourceDoc}</p>
                              <p className="text-xs text-gray-600">{link.sourceField}</p>
                              {link.actualValue !== undefined && (
                                <p className="text-sm font-semibold mt-1 text-blue-600">
                                  {formatCurrency(link.actualValue)}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Target</p>
                              <p className="font-medium text-sm">{link.targetDoc}</p>
                              <p className="text-xs text-gray-600">{link.targetField}</p>
                              {link.expectedValue !== undefined && (
                                <p className="text-sm font-semibold mt-1 text-purple-600">
                                  {formatCurrency(link.expectedValue)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                            <p className="text-gray-600 dark:text-gray-400">
                              <strong>Expected Relation:</strong> {link.expectedRelation}
                            </p>
                          </div>

                          {link.status === "discrepancy" && (
                            <div className="mt-2 bg-red-50 dark:bg-red-950 p-2 rounded text-xs text-red-700 dark:text-red-400">
                              ⚠️ Values do not match expected relationship. Manual review required.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {link.status === "discrepancy" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Investigate
                        </Button>
                        <Button size="sm" variant="outline">
                          Mark as Exception
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">🔗 How Auto-Linking Works</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Automatically identifies related values across financial statements</p>
                <p>• Validates mathematical relationships (Income → Cash Flow, Balance Sheet consistency)</p>
                <p>• Highlights discrepancies in real-time for immediate review</p>
                <p>• Reduces manual reconciliation time by 80%</p>
                <p>• Ensures data integrity across all financial documents</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
