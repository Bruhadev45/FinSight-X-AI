"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Lightbulb, Link as LinkIcon, CheckCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { OutputDisplay } from "@/components/ui/output-display";

interface ExplanationResult {
  conclusion: string;
  confidence: string;
  citations: {
    source: string;
    documentId: string;
    pageNumber: number;
    paragraph: string;
    relevanceScore: number;
  }[];
  reasoningChain: {
    step: number;
    reasoning: string;
    evidence: any[];
    confidence: number;
  }[];
  modelVersion: string;
}

export const ExplainableAIPanel = () => {
  const [finding, setFinding] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);

  const explainFinding = async () => {
    if (!finding.trim()) {
      toast.error("Please enter a finding or decision to explain");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/explainable-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding: finding,
          context: "Financial document analysis",
          documentSources: []
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get explanation");
      
      const data = await response.json();
      setExplanation(data);
      toast.success("Explanation generated successfully");
    } catch (error) {
      console.error("Explanation error:", error);
      toast.error("Failed to generate explanation");
    } finally {
      setLoading(false);
    }
  };

  const getConfidencePercentage = (confidence: string | number) => {
    if (typeof confidence === 'number') return (confidence * 100).toFixed(0);
    const confidenceMap: Record<string, number> = {
      'high': 90,
      'medium': 70,
      'low': 50
    };
    return confidenceMap[confidence.toLowerCase()] || 75;
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-amber-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Explainable AI
        </CardTitle>
        <CardDescription>
          Understand why AI made specific decisions with source citations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter a finding or decision to explain..."
            value={finding}
            onChange={(e) => setFinding(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && explainFinding()}
          />
          <Button onClick={explainFinding} disabled={loading || !finding.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Explain"}
          </Button>
        </div>

        {/* Example Queries */}
        {!explanation && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
              Try explaining:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "High fraud risk detected in transaction",
                "Compliance violation in audit report",
                "Unusual revenue pattern identified",
                "Credit risk assessment elevated",
              ].map((example) => (
                <Badge
                  key={example}
                  variant="secondary"
                  className="cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900"
                  onClick={() => setFinding(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : explanation ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold">AI Explanation</span>
              </div>
              <Badge variant="default">
                {getConfidencePercentage(explanation.confidence)}% confidence
              </Badge>
            </div>

            {/* Main Explanation */}
            <OutputDisplay
              content={explanation.conclusion}
              type="ai"
              title="Conclusion"
              subtitle={`${getConfidencePercentage(explanation.confidence)}% confidence`}
              badge={`Model: ${explanation.modelVersion}`}
              showCopy={true}
            />

            {/* Reasoning Chain */}
            <Card className="bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3">Reasoning Steps</h4>
                <div className="space-y-2">
                  {explanation.reasoningChain.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {item.reasoning}
                        </p>
                        <div className="text-xs text-gray-500">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Source Citations */}
            <Card className="bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Source Citations
                </h4>
                <div className="space-y-3">
                  {explanation.citations.map((citation, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {citation.source}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Page {citation.pageNumber}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-2">
                        "{citation.paragraph}"
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Relevance:
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 dark:bg-blue-400"
                            style={{ width: `${citation.relevanceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">
                          {(citation.relevanceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Model Info */}
            <div className="text-xs text-gray-500 text-center">
              Model: {explanation.modelVersion}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Enter a finding to see AI explanation</p>
            <p className="text-xs mt-1">Get full transparency on AI reasoning</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};