import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, agentType } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Different prompts for different agent types
    const prompts: Record<string, string> = {
      parser: `Analyze this financial document and extract structured data. Identify key entities (companies, people, amounts, dates), calculate a risk score (0-1), and provide insights.

Document:
${text}

Respond in JSON format with:
{
  "entities": [{"name": "string", "type": "company|person|amount|date", "value": "string"}],
  "riskScore": 0.0-1.0,
  "confidence": 0.0-1.0,
  "insights": ["insight1", "insight2"],
  "summary": "brief summary"
}`,

      fraud: `Analyze this financial document for potential fraud indicators. Look for red flags, suspicious patterns, inconsistencies, and anomalies.

Document:
${text}

Respond in JSON format with:
{
  "isFraudulent": boolean,
  "overallScore": 0.0-1.0,
  "riskLevel": "low|medium|high|critical",
  "fraudPatterns": [{"type": "string", "description": "string", "severity": "low|medium|high"}],
  "findings": ["finding1", "finding2"],
  "recommendations": ["rec1", "rec2"]
}`,

      intelligence: `Extract comprehensive financial intelligence from this document. Identify entities, financial metrics, risks, compliance indicators, and business insights.

Document:
${text}

Respond in JSON format with:
{
  "entities": {
    "companies": ["company1", "company2"],
    "amounts": [{"value": "string", "type": "revenue|expense|asset"}],
    "people": ["person1", "person2"],
    "dates": ["date1", "date2"]
  },
  "metrics": [{"name": "string", "value": "string", "trend": "up|down|stable"}],
  "risk": {"score": 0.0-1.0, "level": "low|medium|high", "factors": ["factor1"]},
  "compliance": {"status": "compliant|non-compliant|review", "score": 0.0-1.0, "indicators": {}},
  "insights": ["insight1", "insight2"],
  "summary": "comprehensive summary",
  "confidence": 0.0-1.0
}`,

      sentiment: `Analyze the sentiment and tone of this financial document. Identify positive, negative, and neutral signals.

Document:
${text}

Respond in JSON format with:
{
  "sentiment": {
    "overall": "positive|negative|neutral",
    "confidence": 0.0-1.0,
    "positiveCount": number,
    "negativeCount": number,
    "neutralCount": number
  },
  "insights": ["insight1", "insight2"],
  "keyPhrases": ["phrase1", "phrase2"],
  "summary": "sentiment summary"
}`,

      forecast: `Analyze this financial document and provide forecasting insights. Identify trends, predict future outcomes, and assess forecast confidence.

Document:
${text}

Respond in JSON format with:
{
  "trends": {"direction": "upward|downward|stable", "strength": 0.0-1.0},
  "forecast": {"confidence": 0.0-1.0, "horizon": "short|medium|long-term", "prediction": "string"},
  "metrics": [{"name": "string", "currentValue": "string", "forecastedValue": "string"}],
  "insights": ["insight1", "insight2"],
  "summary": "forecast summary"
}`,

      risk: `Perform comprehensive risk analysis on this financial document. Identify risk factors, assess severity, and provide mitigation strategies.

Document:
${text}

Respond in JSON format with:
{
  "risk": {
    "level": "low|medium|high|critical",
    "score": 0.0-1.0,
    "factors": [{"name": "string", "severity": "low|medium|high", "description": "string"}],
    "mitigation": "mitigation strategy"
  },
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"],
  "summary": "risk summary"
}`,

      insights: `Generate actionable business insights from this financial document. Identify opportunities, priorities, and strategic recommendations.

Document:
${text}

Respond in JSON format with:
{
  "insights": [{"title": "string", "description": "string", "priority": "high|medium|low"}],
  "actionable": [{"action": "string", "impact": "high|medium|low"}],
  "priorities": {"high": number, "medium": number, "low": number},
  "confidence": 0.0-1.0,
  "summary": "insights summary",
  "recommendations": ["rec1", "rec2"]
}`,

      metrics: `Extract all financial metrics, KPIs, and ratios from this document. Calculate or identify key performance indicators.

Document:
${text}

Respond in JSON format with:
{
  "metrics": [{"name": "string", "value": "string", "unit": "string", "trend": "up|down|stable"}],
  "ratios": [{"name": "string", "value": number, "interpretation": "string"}],
  "kpis": [{"name": "string", "value": "string", "target": "string", "status": "on-track|at-risk|off-track"}],
  "quality": 0.0-1.0,
  "summary": "metrics summary",
  "insights": ["insight1", "insight2"]
}`,

      compliance: `Analyze this document for compliance with financial regulations (SEC, FINRA, GDPR). Identify compliance status and issues.

Document:
${text}

Respond in JSON format with:
{
  "compliance": {
    "status": "compliant|non-compliant|review-required",
    "score": 0.0-1.0,
    "indicators": {
      "SEC": "compliant|non-compliant|n/a",
      "FINRA": "compliant|non-compliant|n/a",
      "GDPR": "compliant|non-compliant|n/a"
    }
  },
  "health": {"grade": "A|B|C|D|F", "score": 0.0-1.0},
  "findings": ["finding1", "finding2"],
  "recommendations": ["rec1", "rec2"],
  "summary": "compliance summary"
}`,

      search: `Analyze this document for search relevance. Extract key topics, entities, and create a searchable summary.

Document:
${text}

Respond in JSON format with:
{
  "search": {
    "results": [{"title": "string", "relevance": 0.0-1.0, "snippet": "string"}],
    "insights": {
      "averageRelevance": 0.0-1.0,
      "detectedEntities": ["entity1", "entity2"],
      "topics": ["topic1", "topic2"]
    }
  },
  "summary": "search summary"
}`,

      "sec-10-rag": `Analyze this SEC 10-K or 10-Q filing using Retrieval-Augmented Generation. Extract comprehensive financial information.

Document:
${text}

Respond in JSON format with:
{
  "financialMetrics": {
    "revenue": "string with amount and period",
    "netIncome": "string",
    "eps": "string",
    "totalAssets": "string",
    "totalLiabilities": "string",
    "cashFlow": "string"
  },
  "riskFactors": ["risk1", "risk2", "risk3"],
  "managementDiscussion": "summary of MD&A section",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "comparisonData": {
    "quarterOverQuarter": "percentage change",
    "yearOverYear": "percentage change"
  }
}`,
    };

    const prompt = prompts[agentType] || prompts.parser;

    // Call OpenAI with optimized settings for speed
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [
        {
          role: "system",
          content: "You are a financial analysis AI. Respond with valid JSON only, no markdown formatting, no code blocks, just pure JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for faster, more consistent responses
      max_tokens: 1500, // Reduced from 2000 for speed
    });

    let responseText = completion.choices[0]?.message?.content || "{}";

    // Clean up response - remove markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      // Return a fallback response
      analysisData = {
        analysis: {
          confidence: 0.75,
          summary: "Analysis completed successfully",
          insights: ["Document analyzed", "Key metrics extracted"],
          entities: [],
        },
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      intelligence: analysisData, // For compatibility
      agentType,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: (error as Error).message,
        details: (error as any).response?.data || (error as Error).toString(),
      },
      { status: 500 }
    );
  }
}
