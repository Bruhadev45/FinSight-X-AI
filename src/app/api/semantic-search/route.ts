// Semantic Financial Search API
import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/lib/services/langchain-rag";

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const result = await ragService.queryFinancialDocuments(query, filters);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Search failed" },
      { status: 500 }
    );
  }
}
