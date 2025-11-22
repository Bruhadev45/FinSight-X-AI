import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

const VALID_ALERT_TYPES = ['threshold_breach', 'anomaly', 'compliance', 'fraud', 'covenant_breach'];
const VALID_SEVERITIES = ['high', 'medium', 'low'];
const VALID_STATUSES = ['unread', 'acknowledged', 'resolved'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single alert by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const alert = await db.select()
        .from(alerts)
        .where(eq(alerts.id, parseInt(id)))
        .limit(1);

      if (alert.length === 0) {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      }

      return NextResponse.json(alert[0], { status: 200 });
    }

    // List alerts with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('userId');
    const alertType = searchParams.get('alertType');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const sourceDocumentId = searchParams.get('sourceDocumentId');
    const sortField = searchParams.get('sort') ?? 'triggeredAt';
    const order = searchParams.get('order') ?? 'desc';

    // Build conditions array
    const conditions = [];

    if (userId) {
      conditions.push(eq(alerts.userId, userId));
    }

    if (alertType) {
      if (!VALID_ALERT_TYPES.includes(alertType)) {
        return NextResponse.json({
          error: `Invalid alert type. Must be one of: ${VALID_ALERT_TYPES.join(', ')}`,
          code: "INVALID_ALERT_TYPE"
        }, { status: 400 });
      }
      conditions.push(eq(alerts.alertType, alertType));
    }

    if (severity) {
      if (!VALID_SEVERITIES.includes(severity)) {
        return NextResponse.json({
          error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`,
          code: "INVALID_SEVERITY"
        }, { status: 400 });
      }
      conditions.push(eq(alerts.severity, severity));
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS"
        }, { status: 400 });
      }
      conditions.push(eq(alerts.status, status));
    }

    if (sourceDocumentId) {
      if (isNaN(parseInt(sourceDocumentId))) {
        return NextResponse.json({
          error: "Valid source document ID is required",
          code: "INVALID_SOURCE_DOCUMENT_ID"
        }, { status: 400 });
      }
      conditions.push(eq(alerts.sourceDocumentId, parseInt(sourceDocumentId)));
    }

    // Apply sorting
    const sortColumn = sortField === 'triggeredAt' ? alerts.triggeredAt :
                      sortField === 'severity' ? alerts.severity :
                      sortField === 'status' ? alerts.status :
                      alerts.triggeredAt;

    const orderFn = order === 'asc' ? asc : desc;

    const baseQuery = db.select().from(alerts);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(orderFn(sortColumn))
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
    const { alertType, severity, title, description, userId, sourceDocumentId, status } = body;

    // Validate required fields
    if (!alertType) {
      return NextResponse.json({ 
        error: "Alert type is required",
        code: "MISSING_ALERT_TYPE" 
      }, { status: 400 });
    }

    if (!VALID_ALERT_TYPES.includes(alertType)) {
      return NextResponse.json({ 
        error: `Invalid alert type. Must be one of: ${VALID_ALERT_TYPES.join(', ')}`,
        code: "INVALID_ALERT_TYPE" 
      }, { status: 400 });
    }

    if (!severity) {
      return NextResponse.json({ 
        error: "Severity is required",
        code: "MISSING_SEVERITY" 
      }, { status: 400 });
    }

    if (!VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ 
        error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`,
        code: "INVALID_SEVERITY" 
      }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!description || description.trim() === '') {
      return NextResponse.json({ 
        error: "Description is required",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate sourceDocumentId if provided
    if (sourceDocumentId && isNaN(parseInt(sourceDocumentId))) {
      return NextResponse.json({ 
        error: "Valid source document ID is required",
        code: "INVALID_SOURCE_DOCUMENT_ID" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      alertType: alertType.trim(),
      severity: severity.trim(),
      title: title.trim(),
      description: description.trim(),
      userId: userId ? userId.trim() : null,
      sourceDocumentId: sourceDocumentId ? parseInt(sourceDocumentId) : null,
      status: status ? status.trim() : 'unread',
      triggeredAt: new Date().toISOString(),
      acknowledgedAt: null,
      resolvedAt: null,
    };

    const newAlert = await db.insert(alerts)
      .values(insertData)
      .returning();

    return NextResponse.json(newAlert[0], { status: 201 });
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

    // Check if alert exists
    const existingAlert = await db.select()
      .from(alerts)
      .where(eq(alerts.id, parseInt(id)))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and process updatable fields
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = body.status.trim();

      // Auto-set timestamps based on status
      if (body.status === 'acknowledged' && !existingAlert[0].acknowledgedAt) {
        updates.acknowledgedAt = new Date().toISOString();
      }
      if (body.status === 'resolved' && !existingAlert[0].resolvedAt) {
        updates.resolvedAt = new Date().toISOString();
      }
    }

    if (body.acknowledgedAt !== undefined) {
      updates.acknowledgedAt = body.acknowledgedAt;
    }

    if (body.resolvedAt !== undefined) {
      updates.resolvedAt = body.resolvedAt;
    }

    if (body.alertType !== undefined) {
      if (!VALID_ALERT_TYPES.includes(body.alertType)) {
        return NextResponse.json({ 
          error: `Invalid alert type. Must be one of: ${VALID_ALERT_TYPES.join(', ')}`,
          code: "INVALID_ALERT_TYPE" 
        }, { status: 400 });
      }
      updates.alertType = body.alertType.trim();
    }

    if (body.severity !== undefined) {
      if (!VALID_SEVERITIES.includes(body.severity)) {
        return NextResponse.json({ 
          error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`,
          code: "INVALID_SEVERITY" 
        }, { status: 400 });
      }
      updates.severity = body.severity.trim();
    }

    if (body.title !== undefined) {
      if (body.title.trim() === '') {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "EMPTY_TITLE" 
        }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (body.description.trim() === '') {
        return NextResponse.json({ 
          error: "Description cannot be empty",
          code: "EMPTY_DESCRIPTION" 
        }, { status: 400 });
      }
      updates.description = body.description.trim();
    }

    if (body.userId !== undefined) {
      updates.userId = body.userId ? body.userId.trim() : null;
    }

    if (body.sourceDocumentId !== undefined) {
      if (body.sourceDocumentId && isNaN(parseInt(body.sourceDocumentId))) {
        return NextResponse.json({ 
          error: "Valid source document ID is required",
          code: "INVALID_SOURCE_DOCUMENT_ID" 
        }, { status: 400 });
      }
      updates.sourceDocumentId = body.sourceDocumentId ? parseInt(body.sourceDocumentId) : null;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    const updated = await db.update(alerts)
      .set(updates)
      .where(eq(alerts.id, parseInt(id)))
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

    // Check if alert exists
    const existingAlert = await db.select()
      .from(alerts)
      .where(eq(alerts.id, parseInt(id)))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const deleted = await db.delete(alerts)
      .where(eq(alerts.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Alert deleted successfully',
      alert: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}