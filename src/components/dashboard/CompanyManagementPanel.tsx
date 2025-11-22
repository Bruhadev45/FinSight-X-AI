"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, ArrowRight, Loader2, TrendingUp, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Company {
  id: number;
  name: string;
  industry: string;
  tickerSymbol: string | null;
  country: string;
  lastAnalyzed: string | null;
  totalDocuments: number;
  avgRiskScore: number | null;
}

export const CompanyManagementPanel = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    tickerSymbol: "",
    country: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/companies?limit=50");
      if (!response.ok) throw new Error("Failed to fetch companies");
      
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.industry.trim() || !formData.country.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          industry: formData.industry.trim(),
          tickerSymbol: formData.tickerSymbol.trim() || null,
          country: formData.country.trim(),
          totalDocuments: 0,
          avgRiskScore: null,
          lastAnalyzed: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create company");
      
      const newCompany = await response.json();
      toast.success(`Company "${newCompany.name}" created successfully!`);
      
      // Reset form
      setFormData({ name: "", industry: "", tickerSymbol: "", country: "" });
      setShowCreateForm(false);
      
      // Refresh list
      await fetchCompanies();
      
      // Navigate to new company dashboard
      router.push(`/dashboard/company/${newCompany.id}`);
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error("Failed to create company");
    } finally {
      setCreating(false);
    }
  };

  const handleViewDashboard = (companyId: number) => {
    router.push(`/dashboard/company/${companyId}`);
  };

  const getRiskColor = (risk: number | null) => {
    if (!risk) return "secondary";
    if (risk >= 70) return "destructive";
    if (risk >= 40) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Company Management
              </CardTitle>
              <CardDescription>Create and manage company dashboards</CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Company
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <CardTitle className="text-lg">Create New Company</CardTitle>
            <CardDescription>Set up a new company dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Finance"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    placeholder="e.g., ACME"
                    value={formData.tickerSymbol}
                    onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Company</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Companies</CardTitle>
          <CardDescription>
            {companies.length} {companies.length === 1 ? "company" : "companies"} tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No companies yet</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Company
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-indigo-300 dark:hover:border-indigo-700"
                  onClick={() => handleViewDashboard(company.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate mb-1">{company.name}</h3>
                        <p className="text-sm text-gray-500">{company.industry}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {company.tickerSymbol && (
                        <Badge variant="outline" className="font-mono">
                          {company.tickerSymbol}
                        </Badge>
                      )}
                      <Badge variant="secondary">{company.country}</Badge>
                      {company.avgRiskScore !== null && (
                        <Badge variant={getRiskColor(company.avgRiskScore)}>
                          Risk: {company.avgRiskScore.toFixed(1)}%
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{company.totalDocuments} docs</span>
                      </div>
                      {company.lastAnalyzed && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>
                            {new Date(company.lastAnalyzed).toLocaleDateString()}
                          </span>
                        </div>
                      )}
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
