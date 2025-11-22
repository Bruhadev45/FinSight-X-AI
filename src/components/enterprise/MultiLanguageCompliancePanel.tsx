"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface LanguageModel {
  code: string;
  name: string;
  flag: string;
  documentsSupported: number;
  complianceRules: string[];
  status: "active" | "inactive";
}

const languages: LanguageModel[] = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    documentsSupported: 1247,
    complianceRules: ["SEC", "IFRS", "SOX", "GDPR"],
    status: "active"
  },
  {
    code: "es",
    name: "Spanish",
    flag: "🇪🇸",
    documentsSupported: 342,
    complianceRules: ["CNMV", "IFRS", "EU Directives"],
    status: "active"
  },
  {
    code: "zh",
    name: "Chinese (Simplified)",
    flag: "🇨🇳",
    documentsSupported: 156,
    complianceRules: ["CSRC", "China GAAP", "PBOC"],
    status: "active"
  },
  {
    code: "de",
    name: "German",
    flag: "🇩🇪",
    documentsSupported: 89,
    complianceRules: ["BaFin", "HGB", "GDPR"],
    status: "active"
  },
  {
    code: "fr",
    name: "French",
    flag: "🇫🇷",
    documentsSupported: 67,
    complianceRules: ["AMF", "IFRS", "EU Directives"],
    status: "active"
  },
  {
    code: "ja",
    name: "Japanese",
    flag: "🇯🇵",
    documentsSupported: 45,
    complianceRules: ["FSA", "J-GAAP", "JICPA"],
    status: "inactive"
  }
];

interface Translation {
  id: string;
  originalDoc: string;
  sourceLang: string;
  targetLang: string;
  status: "completed" | "processing" | "failed";
  complianceCheck: "passed" | "warning" | "failed";
  timestamp: string;
}

const mockTranslations: Translation[] = [
  {
    id: "1",
    originalDoc: "Annual Report 2024 - ABC Corp",
    sourceLang: "en",
    targetLang: "es",
    status: "completed",
    complianceCheck: "passed",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "2",
    originalDoc: "Financial Statement Q4 - XYZ Ltd",
    sourceLang: "zh",
    targetLang: "en",
    status: "completed",
    complianceCheck: "warning",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "3",
    originalDoc: "Compliance Report - DEF Inc",
    sourceLang: "de",
    targetLang: "en",
    status: "processing",
    complianceCheck: "passed",
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export const MultiLanguageCompliancePanel = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [translations, setTranslations] = useState<Translation[]>(mockTranslations);

  const analyzeDocument = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    toast.info(`Analyzing ${lang?.name} document with compliance rules...`);
    
    setTimeout(() => {
      toast.success(`Analysis complete! Document complies with ${lang?.complianceRules.join(", ")}`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Multi-Language Compliance Model
              </CardTitle>
              <CardDescription>
                Multilingual clause detection with simultaneous translation and analysis
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Languages className="h-4 w-4" />
              Configure Languages
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Support Grid */}
          <div>
            <h3 className="font-semibold mb-3">Supported Languages & Compliance Frameworks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <Card 
                  key={lang.code} 
                  className={`bg-white/50 dark:bg-slate-900/50 cursor-pointer transition-all ${
                    selectedLanguage === lang.code ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{lang.flag}</span>
                        <div>
                          <h4 className="font-semibold text-sm">{lang.name}</h4>
                          <p className="text-xs text-gray-500">{lang.code.toUpperCase()}</p>
                        </div>
                      </div>
                      <Badge variant={lang.status === "active" ? "default" : "secondary"}>
                        {lang.status === "active" ? "🟢 Active" : "⚪ Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Documents:</span>
                        <span className="font-semibold">{lang.documentsSupported}</span>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Compliance Rules:</p>
                        <div className="flex flex-wrap gap-1">
                          {lang.complianceRules.map((rule, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {rule}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {lang.status === "active" && (
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          analyzeDocument(lang.code);
                        }}
                      >
                        Analyze Document
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Translation Activity */}
          <div>
            <h3 className="font-semibold mb-3">Recent Translation & Analysis Activity</h3>
            <div className="space-y-2">
              {translations.map((translation) => {
                const sourceLang = languages.find(l => l.code === translation.sourceLang);
                const targetLang = languages.find(l => l.code === translation.targetLang);
                
                return (
                  <Card key={translation.id} className="bg-white/50 dark:bg-slate-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-emerald-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-sm">{translation.originalDoc}</h4>
                              <Badge variant={
                                translation.status === "completed" ? "secondary" :
                                translation.status === "processing" ? "default" : "destructive"
                              }>
                                {translation.status === "completed" ? "✅ Completed" :
                                 translation.status === "processing" ? "⏳ Processing" : "❌ Failed"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{sourceLang?.flag}</span>
                                <span className="text-gray-600 dark:text-gray-400">{sourceLang?.name}</span>
                              </div>
                              <span className="text-gray-400">→</span>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{targetLang?.flag}</span>
                                <span className="text-gray-600 dark:text-gray-400">{targetLang?.name}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                {translation.complianceCheck === "passed" ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : translation.complianceCheck === "warning" ? (
                                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                )}
                                <span>Compliance: {translation.complianceCheck}</span>
                              </div>
                              <span>{new Date(translation.timestamp).toLocaleString()}</span>
                            </div>

                            {translation.complianceCheck === "warning" && (
                              <div className="mt-2 bg-yellow-50 dark:bg-yellow-950 p-2 rounded text-xs text-yellow-700 dark:text-yellow-400">
                                ⚠️ Minor compliance discrepancies detected. Review recommended for regional filing requirements.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                  {languages.filter(l => l.status === "active").length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-500">Active Languages</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                  {languages.reduce((sum, l) => sum + l.documentsSupported, 0)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-500">Total Documents</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                  {translations.filter(t => t.status === "completed").length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-500">Translations Done</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-1">
                  98.5%
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-500">Accuracy Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Info */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">🌍 Multi-Language Capabilities</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Automatic language detection and classification</p>
                <p>• Simultaneous translation and compliance analysis</p>
                <p>• Region-specific regulatory framework mapping</p>
                <p>• Cross-language clause matching and validation</p>
                <p>• Support for 50+ global compliance standards</p>
                <p>• Real-time translation with context preservation</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
