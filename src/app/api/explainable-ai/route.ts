// Explainable AI & Trust Layer API
import { NextRequest, NextResponse } from "next/server";
import { explainableAI as explainableAIService } from "@/lib/services/explainable-ai";
import { db } from '@/db';
import { explainableAI, documents, aiAgentLogs, alerts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(explainableAI)
        .where(eq(explainableAI.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Explanation not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const documentId = searchParams.get('documentId');
    const aiAgentLogId = searchParams.get('aiAgentLogId');
    const alertId = searchParams.get('alertId');
    const modelVersion = searchParams.get('modelVersion');

    const conditions = [];

    if (documentId) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json(
          { error: 'Valid document ID is required', code: 'INVALID_DOCUMENT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(explainableAI.documentId, parseInt(documentId)));
    }

    if (aiAgentLogId) {
      if (isNaN(parseInt(aiAgentLogId))) {
        return NextResponse.json(
          { error: 'Valid AI agent log ID is required', code: 'INVALID_AGENT_LOG_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(explainableAI.aiAgentLogId, parseInt(aiAgentLogId)));
    }

    if (alertId) {
      if (isNaN(parseInt(alertId))) {
        return NextResponse.json(
          { error: 'Valid alert ID is required', code: 'INVALID_ALERT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(explainableAI.alertId, parseInt(alertId)));
    }

    if (modelVersion) {
      conditions.push(eq(explainableAI.modelVersion, modelVersion));
    }

    const baseQuery = db.select().from(explainableAI);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(explainableAI.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      finding,
      explanation,
      confidenceScore,
      modelVersion,
      documentId,
      aiAgentLogId,
      alertId,
      citations,
      reasoningChain,
      context,
      documentSources
    } = body;

    // If this is a request to explainableAI service
    if (finding && context && !explanation) {
      const explanationResult = await explainableAIService.explainFinding(
        finding,
        context,
        documentSources || []
      );

      return NextResponse.json({
        success: true,
        conclusion: explanationResult.conclusion,
        confidence: explanationResult.confidence,
        citations: explanationResult.citations,
        reasoningChain: explanationResult.reasoningChain,
        modelVersion: explanationResult.modelVersion,
        timestamp: explanationResult.timestamp,
      });
    }

    // Store explainable AI record
    if (!finding) {
      return NextResponse.json(
        { error: 'finding is required', code: 'MISSING_FINDING' },
        { status: 400 }
      );
    }

    if (!explanation) {
      return NextResponse.json(
        { error: 'explanation is required', code: 'MISSING_EXPLANATION' },
        { status: 400 }
      );
    }

    if (confidenceScore === undefined || confidenceScore === null || isNaN(parseFloat(confidenceScore))) {
      return NextResponse.json(
        { error: 'confidenceScore is required and must be a number', code: 'INVALID_CONFIDENCE_SCORE' },
        { status: 400 }
      );
    }

    const conf = parseFloat(confidenceScore);
    if (conf < 0 || conf > 1) {
      return NextResponse.json(
        { error: 'confidenceScore must be between 0.0 and 1.0', code: 'CONFIDENCE_OUT_OF_RANGE' },
        { status: 400 }
      );
    }

    if (!modelVersion) {
      return NextResponse.json(
        { error: 'modelVersion is required', code: 'MISSING_MODEL_VERSION' },
        { status: 400 }
      );
    }

    if (documentId !== undefined && documentId !== null) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json(
          { error: 'documentId must be a valid integer', code: 'INVALID_DOCUMENT_ID' },
          { status: 400 }
        );
      }

      const docExists = await db
        .select()
        .from(documents)
        .where(eq(documents.id, parseInt(documentId)))
        .limit(1);

      if (docExists.length === 0) {
        return NextResponse.json(
          { error: 'Document not found', code: 'DOCUMENT_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    if (aiAgentLogId !== undefined && aiAgentLogId !== null) {
      if (isNaN(parseInt(aiAgentLogId))) {
        return NextResponse.json(
          { error: 'aiAgentLogId must be a valid integer', code: 'INVALID_AGENT_LOG_ID' },
          { status: 400 }
        );
      }

      const logExists = await db
        .select()
        .from(aiAgentLogs)
        .where(eq(aiAgentLogs.id, parseInt(aiAgentLogId)))
        .limit(1);

      if (logExists.length === 0) {
        return NextResponse.json(
          { error: 'AI agent log not found', code: 'AGENT_LOG_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    if (alertId !== undefined && alertId !== null) {
      if (isNaN(parseInt(alertId))) {
        return NextResponse.json(
          { error: 'alertId must be a valid integer', code: 'INVALID_ALERT_ID' },
          { status: 400 }
        );
      }

      const alertExists = await db
        .select()
        .from(alerts)
        .where(eq(alerts.id, parseInt(alertId)))
        .limit(1);

      if (alertExists.length === 0) {
        return NextResponse.json(
          { error: 'Alert not found', code: 'ALERT_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    if (citations !== undefined && citations !== null && !Array.isArray(citations)) {
      return NextResponse.json(
        { error: 'citations must be an array', code: 'INVALID_CITATIONS' },
        { status: 400 }
      );
    }

    if (reasoningChain !== undefined && reasoningChain !== null && !Array.isArray(reasoningChain)) {
      return NextResponse.json(
        { error: 'reasoningChain must be an array', code: 'INVALID_REASONING_CHAIN' },
        { status: 400 }
      );
    }

    const insertData: any = {
      finding: finding.trim(),
      explanation: explanation.trim(),
      confidenceScore: conf,
      modelVersion: modelVersion.trim(),
      createdAt: new Date().toISOString(),
    };

    if (documentId !== undefined && documentId !== null) {
      insertData.documentId = parseInt(documentId);
    }

    if (aiAgentLogId !== undefined && aiAgentLogId !== null) {
      insertData.aiAgentLogId = parseInt(aiAgentLogId);
    }

    if (alertId !== undefined && alertId !== null) {
      insertData.alertId = parseInt(alertId);
    }

    if (citations !== undefined) {
      insertData.citations = citations;
    }

    if (reasoningChain !== undefined) {
      insertData.reasoningChain = reasoningChain;
    }

    const newRecord = await db
      .insert(explainableAI)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error("Explainable AI error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate explanation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(explainableAI)
      .where(eq(explainableAI.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Explanation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.finding !== undefined) {
      if (body.finding.trim() === '') {
        return NextResponse.json(
          { error: 'finding cannot be empty', code: 'INVALID_FINDING' },
          { status: 400 }
        );
      }
      updates.finding = body.finding.trim();
    }

    if (body.explanation !== undefined) {
      if (body.explanation.trim() === '') {
        return NextResponse.json(
          { error: 'explanation cannot be empty', code: 'INVALID_EXPLANATION' },
          { status: 400 }
        );
      }
      updates.explanation = body.explanation.trim();
    }

    if (body.confidenceScore !== undefined) {
      const conf = parseFloat(body.confidenceScore);
      if (isNaN(conf) || conf < 0 || conf > 1) {
        return NextResponse.json(
          { error: 'confidenceScore must be between 0.0 and 1.0', code: 'CONFIDENCE_OUT_OF_RANGE' },
          { status: 400 }
        );
      }
      updates.confidenceScore = conf;
    }

    if (body.citations !== undefined) {
      if (body.citations !== null && !Array.isArray(body.citations)) {
        return NextResponse.json(
          { error: 'citations must be an array', code: 'INVALID_CITATIONS' },
          { status: 400 }
        );
      }
      updates.citations = body.citations;
    }

    if (body.reasoningChain !== undefined) {
      if (body.reasoningChain !== null && !Array.isArray(body.reasoningChain)) {
        return NextResponse.json(
          { error: 'reasoningChain must be an array', code: 'INVALID_REASONING_CHAIN' },
          { status: 400 }
        );
      }
      updates.reasoningChain = body.reasoningChain;
    }

    if (body.modelVersion !== undefined) {
      if (body.modelVersion.trim() === '') {
        return NextResponse.json(
          { error: 'modelVersion cannot be empty', code: 'INVALID_MODEL_VERSION' },
          { status: 400 }
        );
      }
      updates.modelVersion = body.modelVersion.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(explainableAI)
      .set(updates)
      .where(eq(explainableAI.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(explainableAI)
      .where(eq(explainableAI.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Explanation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(explainableAI)
      .where(eq(explainableAI.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Explanation deleted successfully',
        record: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}