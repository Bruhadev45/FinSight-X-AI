"use client";

import { CompanyManagementPanel } from "@/components/dashboard/CompanyManagementPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="gap-2 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Manage all your companies and their dashboards</p>
        </div>
        
        <CompanyManagementPanel />
      </div>
    </div>
  );
}
