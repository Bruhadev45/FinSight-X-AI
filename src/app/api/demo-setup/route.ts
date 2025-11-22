import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  organizations,
  organizationMembers,
  usageTracking,
  apiKeys,
  supportTickets,
  ticketMessages,
  aiAgentLogs
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// POST /api/demo-setup - Create demo organization and data
export async function POST(request: NextRequest) {
  try {
    const userId = 'user_1'; // TODO: From auth

    // Check if user already has an organization
    const existingMembers = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .limit(1);

    if (existingMembers.length > 0) {
      // User already has org, return it
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, existingMembers[0].organizationId));

      return NextResponse.json({
        success: true,
        message: 'Organization already exists',
        organization: org,
      });
    }

    // Create new organization
    const slug = `demo-org-${Date.now()}`;
    const [org] = await db
      .insert(organizations)
      .values({
        name: 'Demo Organization',
        slug,
        plan: 'business', // Give Business plan for demo
        status: 'active',
        billingEmail: 'billing@demo-org.com',
        maxUsers: 999999, // Unlimited for Business
        maxDocuments: 999999,
        currentDocumentCount: 15,
        settings: JSON.stringify({
          features: {
            aiAnalytics: true,
            webhooks: true,
            apiAccess: true,
          }
        }),
        metadata: JSON.stringify({
          demo: true,
          createdBy: 'auto-setup'
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Add user as owner
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId,
      role: 'owner',
      permissions: JSON.stringify({
        all: ['read', 'write', 'delete', 'admin'],
      }),
      invitedBy: userId,
      joinedAt: new Date(),
      createdAt: new Date(),
    });

    // Create current usage tracking
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await db.insert(usageTracking).values({
      organizationId: org.id,
      period,
      documentsUploaded: 15,
      apiCallsMade: 127,
      storageUsedMb: 250,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create demo API key
    const apiKey = 'fs_demo_' + crypto.randomBytes(16).toString('hex');
    await db.insert(apiKeys).values({
      organizationId: org.id,
      userId,
      name: 'Demo API Key',
      key: apiKey,
      keyPrefix: apiKey.substring(0, 11),
      permissions: JSON.stringify({
        documents: ['read', 'write'],
        analytics: ['read'],
      }),
      lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    });

    // Create demo AI logs
    const agentTypes = [
      'financial_analyst',
      'risk_assessor',
      'compliance_checker',
      'market_analyzer',
      'document_processor'
    ];

    const statuses = ['completed', 'completed', 'completed', 'completed', 'failed'];

    for (let i = 0; i < 25; i++) {
      const processingTime = Math.random() * 20 + 5; // 5-25 seconds
      const tokensUsed = Math.floor(Math.random() * 3000 + 500); // 500-3500 tokens
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await db.insert(aiAgentLogs).values({
        agentName: agentTypes[Math.floor(Math.random() * agentTypes.length)],
        taskType: 'analysis',
        status,
        processingTimeMs: Math.floor(processingTime * 1000), // Convert to milliseconds
        resultSummary: status === 'completed'
          ? 'Analysis completed successfully'
          : 'Processing failed',
        createdAt: new Date(Date.now() - (25 - i) * 60 * 60 * 1000).toISOString(), // Spread over last 25 hours
      });
    }

    // Create demo support ticket
    const [ticket] = await db.insert(supportTickets).values({
      organizationId: org.id,
      userId,
      subject: 'Welcome to your Demo Organization!',
      description: 'This is a demo support ticket to show how the support system works. You can create real tickets anytime you need help.',
      status: 'open',
      priority: 'normal',
      category: 'technical',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }).returning();

    await db.insert(ticketMessages).values({
      ticketId: ticket.id,
      userId,
      message: 'This is a demo support ticket to show how the support system works. You can create real tickets anytime you need help.',
      isInternal: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      success: true,
      message: 'Demo organization created successfully!',
      organization: org,
      demo: {
        apiKey: apiKey.substring(0, 20) + '...',
        aiLogs: 25,
        supportTickets: 1,
        usageTracking: true,
      },
    });
  } catch (error) {
    console.error('Demo setup error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET /api/demo-setup - Check if demo org exists
export async function GET(request: NextRequest) {
  try {
    const userId = 'user_1'; // TODO: From auth

    const existingMembers = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .limit(1);

    if (existingMembers.length > 0) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, existingMembers[0].organizationId));

      return NextResponse.json({
        success: true,
        exists: true,
        organization: org,
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
    });
  } catch (error) {
    console.error('Demo check error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
