"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Construction } from "lucide-react";

export const CompanyDatabasePanel = () => {
  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Company Database
              </CardTitle>
              <CardDescription>Comprehensive financial database and analytics</CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700">
              Coming Soon
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Construction className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-6" />
            <h3 className="text-xl font-bold mb-2">Under Development</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              We're building a comprehensive company database with advanced search, 
              filtering, and analytics capabilities. This feature will include:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span>Real-time company financial data aggregation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span>Industry benchmarking and peer comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span>Advanced filtering by sector, size, and metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span>Historical trend analysis and forecasting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span>Custom watchlists and alerts</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
