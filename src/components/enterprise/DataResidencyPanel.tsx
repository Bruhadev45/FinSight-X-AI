"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, MapPin, Lock, Server } from "lucide-react";
import { toast } from "sonner";

interface ResidencyPolicy {
  id: string;
  tenantName: string;
  region: string;
  storageLocation: string;
  complianceFramework: string[];
  enforced: boolean;
  documentCount: number;
  lastAudit: string;
}

const residencyPolicies: ResidencyPolicy[] = [
  {
    id: "1",
    tenantName: "ACME Corp EU",
    region: "EU",
    storageLocation: "Frankfurt, Germany (eu-central-1)",
    complianceFramework: ["GDPR", "EU Data Protection Directive", "ePrivacy"],
    enforced: true,
    documentCount: 2456,
    lastAudit: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: "2",
    tenantName: "TechStart USA",
    region: "US",
    storageLocation: "Virginia, USA (us-east-1)",
    complianceFramework: ["SOC 2 Type II", "CCPA", "HIPAA"],
    enforced: true,
    documentCount: 1834,
    lastAudit: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "3",
    tenantName: "Finance India Ltd",
    region: "India",
    storageLocation: "Mumbai, India (ap-south-1)",
    complianceFramework: ["RBI Guidelines", "IT Act 2000", "DPDP Act 2023"],
    enforced: true,
    documentCount: 987,
    lastAudit: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: "4",
    tenantName: "Global Enterprises",
    region: "Global",
    storageLocation: "Multi-Region (US, EU, Asia)",
    complianceFramework: ["ISO 27001", "SOC 2", "GDPR"],
    enforced: false,
    documentCount: 3421,
    lastAudit: new Date(Date.now() - 86400000 * 21).toISOString()
  }
];

const regionInfo = {
  "EU": {
    icon: "🇪🇺",
    locations: ["Frankfurt, Germany", "Paris, France", "Dublin, Ireland"],
    frameworks: ["GDPR", "EU Data Protection", "ePrivacy"],
    color: "blue"
  },
  "US": {
    icon: "🇺🇸",
    locations: ["Virginia", "Oregon", "California"],
    frameworks: ["SOC 2", "CCPA", "HIPAA", "FedRAMP"],
    color: "purple"
  },
  "India": {
    icon: "🇮🇳",
    locations: ["Mumbai", "Hyderabad"],
    frameworks: ["RBI Guidelines", "IT Act", "DPDP Act"],
    color: "orange"
  },
  "Global": {
    icon: "🌍",
    locations: ["Multi-Region Deployment"],
    frameworks: ["ISO 27001", "SOC 2"],
    color: "green"
  }
};

export const DataResidencyPanel = () => {
  const [policies, setPolicies] = useState(residencyPolicies);
  const [selectedRegion, setSelectedRegion] = useState<string | null>("EU");

  const toggleEnforcement = (policyId: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, enforced: !p.enforced } : p
    ));
    const policy = policies.find(p => p.id === policyId);
    toast.success(`Data residency enforcement ${policy?.enforced ? 'disabled' : 'enabled'} for ${policy?.tenantName}`);
  };

  const runComplianceAudit = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    toast.info(`Running compliance audit for ${policy?.tenantName}...`);
    
    setTimeout(() => {
      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, lastAudit: new Date().toISOString() } : p
      ));
      toast.success(`Audit completed! All data confirmed in ${policy?.region} region.`);
    }, 3000);
  };

  const enforcedCount = policies.filter(p => p.enforced).length;
  const totalDocuments = policies.reduce((sum, p) => sum + p.documentCount, 0);

  return (
    <div className="space-y-6">
      <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-white to-teal-50 dark:from-slate-900 dark:to-teal-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                Data Residency Controls
              </CardTitle>
              <CardDescription>
                Tenant-specific data location policies and compliance enforcement
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              Add New Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {policies.length}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Active Policies</div>
                  </div>
                  <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {enforcedCount}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Enforced</div>
                  </div>
                  <Lock className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {totalDocuments.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-500">Documents Protected</div>
                  </div>
                  <Server className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Region Selector */}
          <div>
            <h3 className="font-semibold mb-3">Data Centers by Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {Object.entries(regionInfo).map(([region, info]) => (
                <Card
                  key={region}
                  className={`cursor-pointer transition-all ${
                    selectedRegion === region ? 'ring-2 ring-teal-500' : ''
                  }`}
                  onClick={() => setSelectedRegion(region)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{info.icon}</div>
                      <h4 className="font-semibold text-sm mb-1">{region}</h4>
                      <p className="text-xs text-gray-500">
                        {info.locations.length} location{info.locations.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tenant Policies */}
          <div>
            <h3 className="font-semibold mb-3">Tenant Residency Policies</h3>
            <div className="space-y-3">
              {policies.map((policy) => {
                const region = regionInfo[policy.region as keyof typeof regionInfo];
                
                return (
                  <Card key={policy.id} className="bg-white/50 dark:bg-slate-900/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-3xl">{region.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{policy.tenantName}</h4>
                              <Badge variant={policy.enforced ? "default" : "secondary"}>
                                {policy.enforced ? "🔒 Enforced" : "⚪ Not Enforced"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Region</p>
                                <p className="text-sm font-medium">{policy.region}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Storage Location</p>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <p className="text-sm">{policy.storageLocation}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Compliance Frameworks</p>
                              <div className="flex flex-wrap gap-1">
                                {policy.complianceFramework.map((framework, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {framework}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📄 {policy.documentCount.toLocaleString()} documents</span>
                              <span>
                                Last audit: {new Date(policy.lastAudit).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={policy.enforced ? "destructive" : "default"}
                          onClick={() => toggleEnforcement(policy.id)}
                        >
                          {policy.enforced ? "Disable Enforcement" : "Enable Enforcement"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runComplianceAudit(policy.id)}
                        >
                          Run Audit
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Compliance Info */}
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">🛡️ Data Sovereignty & Compliance</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Data residency enforcement ensures compliance with regional data protection laws</p>
                <p>• All data is encrypted at rest and in transit within designated regions</p>
                <p>• Regular compliance audits verify data location and access controls</p>
                <p>• Tenant-specific policies allow for flexible multi-region deployments</p>
                <p>• Automatic data routing based on tenant configuration</p>
                <p>• Support for data sovereignty requirements in 150+ countries</p>
                <p>• Real-time monitoring and alerting for policy violations</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Center Map Info */}
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">🗺️ Global Data Center Locations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(regionInfo).filter(([key]) => key !== "Global").map(([region, info]) => (
                  <div key={region} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{info.icon}</span>
                      <h5 className="font-semibold">{region}</h5>
                    </div>
                    <div className="space-y-1 text-sm">
                      {info.locations.map((location, i) => (
                        <div key={i} className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Server className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
