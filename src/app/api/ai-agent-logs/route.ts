import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgentLogs, documents } from '@/db/schema';
import { eq, and, desc, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(aiAgentLogs)
        .where(eq(aiAgentLogs.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'AI agent log not found' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const agentName = searchParams.get('agentName');
    const documentId = searchParams.get('documentId');
    const taskType = searchParams.get('taskType');
    const status = searchParams.get('status');

    // Build filter conditions
    const conditions = [];

    if (agentName) {
      conditions.push(eq(aiAgentLogs.agentName, agentName));
    }

    if (documentId && !isNaN(parseInt(documentId))) {
      conditions.push(eq(aiAgentLogs.documentId, parseInt(documentId)));
    }

    if (taskType) {
      conditions.push(eq(aiAgentLogs.taskType, taskType));
    }

    if (status) {
      conditions.push(eq(aiAgentLogs.status, status));
    }

    const baseQuery = db.select().from(aiAgentLogs);

    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(aiAgentLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentName, documentId, taskType, status, processingTimeMs, resultSummary } = body;

    // Validate required fields
    if (!agentName) {
      return NextResponse.json({ 
        error: "agentName is required",
        code: "MISSING_AGENT_NAME" 
      }, { status: 400 });
    }

    if (!taskType) {
      return NextResponse.json({ 
        error: "taskType is required",
        code: "MISSING_TASK_TYPE" 
      }, { status: 400 });
    }

    // Validate agentName enum
    const validAgentNames = ['parser', 'validator', 'anomaly_detector', 'fraud_pattern', 'compliance'];
    if (!validAgentNames.includes(agentName)) {
      return NextResponse.json({ 
        error: `agentName must be one of: ${validAgentNames.join(', ')}`,
        code: "INVALID_AGENT_NAME" 
      }, { status: 400 });
    }

    // Validate documentId if provided
    if (documentId !== null && documentId !== undefined) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json({ 
          error: "documentId must be a valid integer",
          code: "INVALID_DOCUMENT_ID" 
        }, { status: 400 });
      }

      // Check if document exists
      const documentExists = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(documentId)))
        .limit(1);

      if (documentExists.length === 0) {
        return NextResponse.json({ 
          error: "Referenced document does not exist",
          code: "DOCUMENT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['running', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: `status must be one of: ${validStatuses.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
    }

    // Validate processingTimeMs if provided
    if (processingTimeMs !== null && processingTimeMs !== undefined && isNaN(parseInt(processingTimeMs))) {
      return NextResponse.json({ 
        error: "processingTimeMs must be a valid integer",
        code: "INVALID_PROCESSING_TIME" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: any = {
      agentName: agentName.trim(),
      taskType: taskType.trim(),
      status: status?.trim() || 'running',
      createdAt: new Date().toISOString(),
    };

    // Add optional fields
    if (documentId !== null && documentId !== undefined) {
      insertData.documentId = parseInt(documentId);
    }

    if (processingTimeMs !== null && processingTimeMs !== undefined) {
      insertData.processingTimeMs = parseInt(processingTimeMs);
    }

    if (resultSummary !== null && resultSummary !== undefined) {
      insertData.resultSummary = resultSummary.trim();
    }

    const newRecord = await db.insert(aiAgentLogs)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(aiAgentLogs)
      .where(eq(aiAgentLogs.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'AI agent log not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { agentName, documentId, taskType, status, processingTimeMs, resultSummary } = body;

    // Validate agentName if provided
    if (agentName) {
      const validAgentNames = ['parser', 'validator', 'anomaly_detector', 'fraud_pattern', 'compliance'];
      if (!validAgentNames.includes(agentName)) {
        return NextResponse.json({ 
          error: `agentName must be one of: ${validAgentNames.join(', ')}`,
          code: "INVALID_AGENT_NAME" 
        }, { status: 400 });
      }
    }

    // Validate documentId if provided
    if (documentId !== null && documentId !== undefined) {
      if (isNaN(parseInt(documentId))) {
        return NextResponse.json({ 
          error: "documentId must be a valid integer",
          code: "INVALID_DOCUMENT_ID" 
        }, { status: 400 });
      }

      // Check if document exists
      const documentExists = await db.select()
        .from(documents)
        .where(eq(documents.id, parseInt(documentId)))
        .limit(1);

      if (documentExists.length === 0) {
        return NextResponse.json({ 
          error: "Referenced document does not exist",
          code: "DOCUMENT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['running', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: `status must be one of: ${validStatuses.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
    }

    // Validate processingTimeMs if provided
    if (processingTimeMs !== null && processingTimeMs !== undefined && isNaN(parseInt(processingTimeMs))) {
      return NextResponse.json({ 
        error: "processingTimeMs must be a valid integer",
        code: "INVALID_PROCESSING_TIME" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};

    if (agentName !== undefined) {
      updateData.agentName = agentName.trim();
    }

    if (documentId !== undefined) {
      updateData.documentId = documentId === null ? null : parseInt(documentId);
    }

    if (taskType !== undefined) {
      updateData.taskType = taskType.trim();
    }

    if (status !== undefined) {
      updateData.status = status.trim();
    }

    if (processingTimeMs !== undefined) {
      updateData.processingTimeMs = processingTimeMs === null ? null : parseInt(processingTimeMs);
    }

    if (resultSummary !== undefined) {
      updateData.resultSummary = resultSummary === null ? null : resultSummary.trim();
    }

    const updated = await db.update(aiAgentLogs)
      .set(updateData)
      .where(eq(aiAgentLogs.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(aiAgentLogs)
      .where(eq(aiAgentLogs.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'AI agent log not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(aiAgentLogs)
      .where(eq(aiAgentLogs.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'AI agent log deleted successfully',
      deletedRecord: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}