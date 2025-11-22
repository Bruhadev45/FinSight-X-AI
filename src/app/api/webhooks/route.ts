import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { webhooks, webhookDeliveries, organizationMembers, organizations } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

// GET /api/webhooks - List webhooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = parseInt(searchParams.get('organizationId') || '0');
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      );
    }

    // Verify access
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check plan supports webhooks
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!['business', 'enterprise'].includes(org.plan)) {
      return NextResponse.json(
        { success: false, error: 'Webhooks require Business or Enterprise plan' },
        { status: 403 }
      );
    }

    // Get webhooks
    const webhooksList = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.organizationId, organizationId))
      .orderBy(desc(webhooks.createdAt));

    return NextResponse.json({
      success: true,
      webhooks: webhooksList,
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, url, events, description } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'organizationId, url, and events required' },
        { status: 400 }
      );
    }

    // Verify access
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check plan supports webhooks
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!['business', 'enterprise'].includes(org.plan)) {
      return NextResponse.json(
        { success: false, error: 'Webhooks require Business or Enterprise plan' },
        { status: 403 }
      );
    }

    // Generate secret for webhook signatures
    const secret = crypto.randomBytes(32).toString('hex');

    // Create webhook
    const [webhook] = await db
      .insert(webhooks)
      .values({
        organizationId,
        url,
        events: JSON.stringify(events),
        secret,
        description: description || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      webhook: {
        ...webhook,
        events: typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events,
      },
      message: 'Webhook created successfully. Save the secret for signature verification.',
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks - Delete webhook
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = parseInt(searchParams.get('id') || '0');
    const userId = 'user_1'; // TODO: From auth

    if (!webhookId) {
      return NextResponse.json(
        { success: false, error: 'Webhook id required' },
        { status: 400 }
      );
    }

    // Get webhook
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (!webhook) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Verify access
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, webhook.organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Delete webhook
    await db.delete(webhooks).where(eq(webhooks.id, webhookId));

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
