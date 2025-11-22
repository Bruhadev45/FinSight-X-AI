import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileContent, fileType } = await request.json();

    if (!fileContent) {
      return NextResponse.json(
        { error: "File content is required" },
        { status: 400 }
      );
    }

    // Use OpenAI to analyze the document
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a financial analysis AI agent specialized in detecting fraud, anomalies, and compliance issues in financial documents. Analyze the provided document and return a JSON response with:
- risk_level: "low", "medium", or "high"
- anomaly_count: number of anomalies detected (0-10)
- compliance_status: "Pass", "Review", or "Failed"
- summary: brief 1-2 sentence summary of findings
- key_findings: array of 2-4 specific findings
- fraud_indicators: array of potential fraud patterns detected (if any)

Be thorough but concise. Focus on actual financial red flags.`,
        },
        {
          role: "user",
          content: `Analyze this financial document (${fileName}):\n\n${fileContent.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      success: true,
      analysis: {
        risk: analysis.risk_level || "low",
        anomalies: analysis.anomaly_count || 0,
        compliance: analysis.compliance_status || "Pass",
        summary: analysis.summary || "Analysis completed successfully",
        keyFindings: analysis.key_findings || [],
        fraudIndicators: analysis.fraud_indicators || [],
      },
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to analyze document" },
      { status: 500 }
    );
  }
}
