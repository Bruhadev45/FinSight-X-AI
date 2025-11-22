import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_CHANNELS = ['email', 'sms', 'push', 'slack'] as const;
const VALID_TYPES = ['alert', 'report_ready', 'analysis_complete', 'threshold_breach'] as const;
const VALID_STATUSES = ['sent', 'pending', 'failed'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const notification = await db.select()
        .from(notifications)
        .where(eq(notifications.id, parseInt(id)))
        .limit(1);

      if (notification.length === 0) {
        return NextResponse.json({ 
          error: 'Notification not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(notification[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userIdFilter = searchParams.get('userId');
    const channelFilter = searchParams.get('channel');
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');

    const conditions = [];

    if (userIdFilter) {
      conditions.push(eq(notifications.userId, userIdFilter));
    }

    if (channelFilter) {
      conditions.push(eq(notifications.channel, channelFilter));
    }

    if (typeFilter) {
      conditions.push(eq(notifications.type, typeFilter));
    }

    if (statusFilter) {
      conditions.push(eq(notifications.status, statusFilter));
    }

    const baseQuery = db.select().from(notifications);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(notifications.createdAt))
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
    const { channel, type, title, message, userId, documentId, alertId, status } = body;

    if (!channel) {
      return NextResponse.json({ 
        error: "Channel is required",
        code: "MISSING_CHANNEL" 
      }, { status: 400 });
    }

    if (!VALID_CHANNELS.includes(channel)) {
      return NextResponse.json({ 
        error: `Channel must be one of: ${VALID_CHANNELS.join(', ')}`,
        code: "INVALID_CHANNEL" 
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ 
        error: "Type is required",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ 
        error: `Type must be one of: ${VALID_TYPES.join(', ')}`,
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!message || message.trim() === '') {
      return NextResponse.json({ 
        error: "Message is required",
        code: "MISSING_MESSAGE" 
      }, { status: 400 });
    }

    const notificationStatus = status || 'pending';

    if (!VALID_STATUSES.includes(notificationStatus)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const sentAt = notificationStatus === 'sent' ? now : null;

    const insertData: any = {
      channel: channel.trim(),
      type: type.trim(),
      title: title.trim(),
      message: message.trim(),
      status: notificationStatus,
      createdAt: now,
      sentAt: sentAt
    };

    if (userId) {
      insertData.userId = userId.trim();
    }

    if (documentId !== undefined && documentId !== null) {
      if (isNaN(parseInt(documentId.toString()))) {
        return NextResponse.json({ 
          error: "Document ID must be a valid integer",
          code: "INVALID_DOCUMENT_ID" 
        }, { status: 400 });
      }
      insertData.documentId = parseInt(documentId.toString());
    }

    if (alertId !== undefined && alertId !== null) {
      if (isNaN(parseInt(alertId.toString()))) {
        return NextResponse.json({ 
          error: "Alert ID must be a valid integer",
          code: "INVALID_ALERT_ID" 
        }, { status: 400 });
      }
      insertData.alertId = parseInt(alertId.toString());
    }

    const newNotification = await db.insert(notifications)
      .values(insertData)
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
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

    const existing = await db.select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { status, title, message, sentAt } = body;

    const updates: any = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ 
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;

      if (status === 'sent' && !existing[0].sentAt && !sentAt) {
        updates.sentAt = new Date().toISOString();
      }
    }

    if (title !== undefined) {
      if (title.trim() === '') {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (message !== undefined) {
      if (message.trim() === '') {
        return NextResponse.json({ 
          error: "Message cannot be empty",
          code: "INVALID_MESSAGE" 
        }, { status: 400 });
      }
      updates.message = message.trim();
    }

    if (sentAt !== undefined) {
      updates.sentAt = sentAt;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await db.update(notifications)
      .set(updates)
      .where(eq(notifications.id, parseInt(id)))
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

    const existing = await db.select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Notification deleted successfully',
      notification: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}