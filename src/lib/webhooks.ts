import { db } from '@/db';
import { webhooks, webhookDeliveries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  organizationId: number;
  timestamp: string;
  data: any;
}

export async function triggerWebhook(
  organizationId: number,
  event: string,
  data: any
): Promise<void> {
  try {
    // Get active webhooks for this organization
    const activeWebhooks = await db
      .select()
      .from(webhooks)
      .where(
        and(
          eq(webhooks.organizationId, organizationId),
          eq(webhooks.isActive, true)
        )
      );

    if (activeWebhooks.length === 0) {
      return; // No webhooks configured
    }

    const payload: WebhookPayload = {
      event,
      organizationId,
      timestamp: new Date().toISOString(),
      data,
    };

    // Trigger each webhook that listens to this event
    for (const webhook of activeWebhooks) {
      const webhookEvents = typeof webhook.events === 'string'
        ? JSON.parse(webhook.events)
        : webhook.events;

      if (!webhookEvents.includes(event)) {
        continue; // This webhook doesn't listen to this event
      }

      // Send webhook asynchronously
      sendWebhook(webhook, payload).catch((error) => {
        console.error(`Webhook delivery failed (ID: ${webhook.id}):`, error);
      });
    }
  } catch (error) {
    console.error('Trigger webhook error:', error);
  }
}

async function sendWebhook(webhook: any, payload: WebhookPayload): Promise<void> {
  const deliveryId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Generate signature
    const signature = generateSignature(payload, webhook.secret);

    // Send HTTP request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': deliveryId,
        'X-Webhook-Event': payload.event,
      },
      body: JSON.stringify(payload),
    });

    const responseTime = Date.now() - startTime;
    const responseBody = await response.text();

    // Log delivery
    await db.insert(webhookDeliveries).values({
      webhookId: webhook.id,
      event: payload.event,
      payload: JSON.stringify(payload),
      status: response.ok ? 'success' : 'failed',
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000), // Truncate
      responseTime,
      deliveredAt: new Date(),
    });

    // Update webhook last delivery time
    await db
      .update(webhooks)
      .set({ lastDeliveredAt: new Date() })
      .where(eq(webhooks.id, webhook.id));
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Log failed delivery
    await db.insert(webhookDeliveries).values({
      webhookId: webhook.id,
      event: payload.event,
      payload: JSON.stringify(payload),
      status: 'failed',
      statusCode: 0,
      responseBody: error.message,
      responseTime,
      deliveredAt: new Date(),
    });
  }
}

function generateSignature(payload: any, secret: string): string {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

// Webhook event types
export const WebhookEvents = {
  // AI Analysis Events
  AI_ANALYSIS_STARTED: 'ai.analysis.started',
  AI_ANALYSIS_COMPLETED: 'ai.analysis.completed',
  AI_ANALYSIS_FAILED: 'ai.analysis.failed',

  // Document Events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_ANALYZED: 'document.analyzed',
  DOCUMENT_DELETED: 'document.deleted',

  // Alert Events
  ALERT_TRIGGERED: 'alert.triggered',
  ALERT_RESOLVED: 'alert.resolved',

  // Organization Events
  MEMBER_ADDED: 'organization.member_added',
  MEMBER_REMOVED: 'organization.member_removed',
  PLAN_UPGRADED: 'organization.plan_upgraded',

  // Usage Events
  USAGE_LIMIT_WARNING: 'usage.limit_warning',
  USAGE_LIMIT_EXCEEDED: 'usage.limit_exceeded',
};

// Helper to get available events
export function getAvailableEvents(plan: string): string[] {
  const baseEvents = [
    WebhookEvents.DOCUMENT_UPLOADED,
    WebhookEvents.DOCUMENT_ANALYZED,
    WebhookEvents.ALERT_TRIGGERED,
  ];

  if (['business', 'enterprise'].includes(plan)) {
    return [
      ...baseEvents,
      WebhookEvents.AI_ANALYSIS_STARTED,
      WebhookEvents.AI_ANALYSIS_COMPLETED,
      WebhookEvents.AI_ANALYSIS_FAILED,
      WebhookEvents.DOCUMENT_DELETED,
      WebhookEvents.ALERT_RESOLVED,
      WebhookEvents.MEMBER_ADDED,
      WebhookEvents.MEMBER_REMOVED,
      WebhookEvents.PLAN_UPGRADED,
      WebhookEvents.USAGE_LIMIT_WARNING,
      WebhookEvents.USAGE_LIMIT_EXCEEDED,
    ];
  }

  return baseEvents;
}
