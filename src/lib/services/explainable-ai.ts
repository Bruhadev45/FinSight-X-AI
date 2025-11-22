// Explainable AI & Trust Layer
import OpenAI from "openai";
import { ExplainableResult, Citation, ExplanationChain } from "@/lib/types/enterprise";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ExplainableAIService {
  async explainFinding(
    finding: string,
    context: string,
    documentSources: Array<{
      documentId: string;
      source: string;
      content: string;
      pageNumber: number;
    }>
  ): Promise<ExplainableResult> {
    const prompt = `You are an explainable AI system for financial analysis. 

Finding: ${finding}
Context: ${context}

Available Documents:
${documentSources.map((doc, i) => `[${i}] ${doc.source} (Page ${doc.pageNumber}): ${doc.content.substring(0, 200)}...`).join("\n")}

Provide a detailed explanation with:
1. Step-by-step reasoning chain
2. Specific citations from documents (reference by index)
3. Confidence level assessment
4. Key evidence supporting the conclusion

Return JSON with structure:
{
  "conclusion": "final conclusion",
  "confidence": "high" | "medium" | "low",
  "reasoningSteps": [
    {
      "step": 1,
      "reasoning": "explanation",
      "documentReferences": [0, 1],
      "confidence": 0.95
    }
  ],
  "keyCitations": [
    {
      "documentIndex": 0,
      "quote": "relevant quote",
      "relevance": 0.98
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an explainable AI for financial analysis. Always provide clear reasoning chains and cite sources.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const response = JSON.parse(completion.choices[0].message.content || "{}");

    // Map citations to full objects
    const citations: Citation[] = response.keyCitations?.map((cite: any) => ({
      source: documentSources[cite.documentIndex]?.source || "Unknown",
      documentId: documentSources[cite.documentIndex]?.documentId || "unknown",
      pageNumber: documentSources[cite.documentIndex]?.pageNumber || 0,
      paragraph: cite.quote,
      relevanceScore: cite.relevance,
    })) || [];

    // Map reasoning steps
    const reasoningChain: ExplanationChain[] = response.reasoningSteps?.map((step: any) => ({
      step: step.step,
      reasoning: step.reasoning,
      evidence: step.documentReferences?.map((idx: number) => ({
        source: documentSources[idx]?.source || "Unknown",
        documentId: documentSources[idx]?.documentId || "unknown",
        pageNumber: documentSources[idx]?.pageNumber || 0,
        paragraph: documentSources[idx]?.content.substring(0, 200),
        relevanceScore: step.confidence,
      })) || [],
      confidence: step.confidence,
    })) || [];

    return {
      conclusion: response.conclusion || finding,
      confidence: response.confidence || "medium",
      citations,
      reasoningChain,
      modelVersion: "gpt-4o-mini",
      timestamp: new Date(),
    };
  }

  async generateSourceCitation(
    claim: string,
    documentContent: string,
    documentId: string,
    source: string
  ): Promise<Citation | null> {
    // Find the most relevant paragraph in the document that supports the claim
    const paragraphs = documentContent.split("\n\n").filter((p) => p.trim().length > 50);

    if (paragraphs.length === 0) return null;

    // Simple relevance scoring (in production, use embeddings)
    const claimWords = claim.toLowerCase().split(" ");
    const scores = paragraphs.map((para) => {
      const paraLower = para.toLowerCase();
      return claimWords.filter((word) => paraLower.includes(word)).length;
    });

    const maxScore = Math.max(...scores);
    if (maxScore === 0) return null;

    const bestParaIndex = scores.indexOf(maxScore);

    return {
      source,
      documentId,
      pageNumber: Math.floor(bestParaIndex / 3) + 1, // Approximate page
      paragraph: paragraphs[bestParaIndex],
      relevanceScore: maxScore / claimWords.length,
    };
  }

  calculateConfidenceScore(
    modelPrediction: number,
    dataQuality: number,
    sourceReliability: number
  ): { score: number; level: "high" | "medium" | "low" } {
    const score = modelPrediction * 0.5 + dataQuality * 0.3 + sourceReliability * 0.2;

    let level: "high" | "medium" | "low";
    if (score >= 0.8) level = "high";
    else if (score >= 0.5) level = "medium";
    else level = "low";

    return { score, level };
  }
}

export const explainableAI = new ExplainableAIService();
