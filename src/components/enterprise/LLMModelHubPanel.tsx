"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Server, Globe, Shield, DollarSign, Zap, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  capabilities: string[];
  costPerMToken: number;
  status: "active" | "inactive";
  dataResidency: string[];
  latency: string;
  contextWindow: string;
}

const defaultModels: LLMModel[] = [
  {
    id: "1",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    modelId: "gpt-4-turbo-preview",
    capabilities: ["Analysis", "Summarization", "Code Generation", "Complex Reasoning"],
    costPerMToken: 10.0,
    status: "active",
    dataResidency: ["US", "EU"],
    latency: "~2s",
    contextWindow: "128K tokens"
  },
  {
    id: "2",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    modelId: "claude-3-5-sonnet-20241022",
    capabilities: ["Analysis", "Financial Reasoning", "Document Review", "Compliance"],
    costPerMToken: 3.0,
    status: "active",
    dataResidency: ["US", "EU"],
    latency: "~1.5s",
    contextWindow: "200K tokens"
  },
  {
    id: "3",
    name: "Mistral Large",
    provider: "Mistral AI",
    modelId: "mistral-large-latest",
    capabilities: ["Multilingual", "Code", "Analysis", "Reasoning"],
    costPerMToken: 4.0,
    status: "active",
    dataResidency: ["EU", "US"],
    latency: "~1.8s",
    contextWindow: "128K tokens"
  },
  {
    id: "4",
    name: "Llama 3.1 70B (Local)",
    provider: "Meta (Self-Hosted)",
    modelId: "llama-3.1-70b-instruct",
    capabilities: ["On-Premise", "Data Sovereignty", "Cost-Effective"],
    costPerMToken: 0.0,
    status: "active",
    dataResidency: ["India", "EU", "US", "Custom"],
    latency: "~3s",
    contextWindow: "128K tokens"
  },
  {
    id: "5",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    modelId: "gemini-1.5-pro",
    capabilities: ["Multimodal", "Long Context", "Analysis", "Reasoning"],
    costPerMToken: 3.5,
    status: "inactive",
    dataResidency: ["US", "EU", "Asia"],
    latency: "~2.2s",
    contextWindow: "2M tokens"
  }
];

const providerLogos: Record<string, string> = {
  "OpenAI": "🤖",
  "Anthropic": "🧠",
  "Mistral AI": "🌪️",
  "Meta (Self-Hosted)": "🏠",
  "Google": "🔍"
};

export const LLMModelHubPanel = () => {
  const [models, setModels] = useState<LLMModel[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState<string | null>("1");

  const toggleModelStatus = (modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m
    ));
    toast.success("Model status updated");
  };

  const setAsDefault = (modelId: string) => {
    setSelectedModel(modelId);
    const model = models.find(m => m.id === modelId);
    toast.success(`${model?.name} set as default model`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Private LLM Model Hub
              </CardTitle>
              <CardDescription>
                Manage and configure AI models with data sovereignty controls
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Custom Model
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Registry */}
          <div className="space-y-3">
            {models.map((model) => (
              <Card key={model.id} className={`bg-white/50 dark:bg-slate-900/50 ${selectedModel === model.id ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{providerLogos[model.provider]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{model.name}</h3>
                          <Badge variant={model.status === "active" ? "default" : "secondary"}>
                            {model.status === "active" ? "🟢 Active" : "⚪ Inactive"}
                          </Badge>
                          {selectedModel === model.id && (
                            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-950">
                              ⭐ Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="font-medium">Provider:</span> {model.provider} • 
                          <span className="font-medium ml-2">Model ID:</span> {model.modelId}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-xs text-gray-500">Cost</div>
                              <div className="text-sm font-semibold">
                                {model.costPerMToken === 0 ? "Free" : `$${model.costPerMToken}/M`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <div>
                              <div className="text-xs text-gray-500">Latency</div>
                              <div className="text-sm font-semibold">{model.latency}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-purple-600" />
                            <div>
                              <div className="text-xs text-gray-500">Context</div>
                              <div className="text-sm font-semibold">{model.contextWindow}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-gray-500">Regions</div>
                              <div className="text-sm font-semibold">{model.dataResidency.length}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Capabilities:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities.map((cap, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            <Shield className="h-3 w-3 inline mr-1" />
                            Data Residency:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {model.dataResidency.map((region, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setAsDefault(model.id)}
                      disabled={selectedModel === model.id}
                      variant={selectedModel === model.id ? "secondary" : "default"}
                    >
                      {selectedModel === model.id ? "Default Model" : "Set as Default"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleModelStatus(model.id)}
                    >
                      {model.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tenant Configuration */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Tenant Model Selection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure per-tenant model preferences for data-sovereignty clients
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">US Clients</div>
                  <div className="font-semibold text-sm">GPT-4 Turbo</div>
                  <div className="text-xs text-gray-500">OpenAI (US)</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">EU Clients</div>
                  <div className="font-semibold text-sm">Mistral Large</div>
                  <div className="text-xs text-gray-500">Mistral AI (EU)</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">India Clients</div>
                  <div className="font-semibold text-sm">Llama 3.1 70B</div>
                  <div className="text-xs text-gray-500">Self-Hosted (India)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
