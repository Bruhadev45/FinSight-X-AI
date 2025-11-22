import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usageTracking, organizationMembers, organizations } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/ai/usage - Get AI usage statistics
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

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    // Get current period (YYYY-MM format)
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get usage tracking
    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.organizationId, organizationId),
          eq(usageTracking.period, period)
        )
      );

    // Calculate AI-specific usage
    const aiUsage = {
      // AI Analysis
      multiAgentAnalysis: usage?.apiCallsMade || 0,
      documentAnalysis: usage?.documentsUploaded || 0,
      chatInteractions: usage?.apiCallsMade || 0,

      // Limits based on plan
      limits: getAILimits(org.plan),

      // Current period
      period,
      periodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),

      // Plan info
      plan: org.plan,
      status: org.status,
    };

    return NextResponse.json({
      success: true,
      usage: aiUsage,
    });
  } catch (error) {
    console.error('Get AI usage error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/ai/usage - Track AI usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, usageType, count = 1 } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId || !usageType) {
      return NextResponse.json(
        { success: false, error: 'organizationId and usageType required' },
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

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    // Check AI limits
    const limits = getAILimits(org.plan);
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get current usage
    const [currentUsage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.organizationId, organizationId),
          eq(usageTracking.period, period)
        )
      );

    // Check if limit exceeded
    const currentApiCalls = currentUsage?.apiCallsMade || 0;
    if (limits.aiAnalysisPerMonth !== -1 && currentApiCalls >= limits.aiAnalysisPerMonth) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI usage limit exceeded for your plan',
          limit: limits.aiAnalysisPerMonth,
          current: currentApiCalls,
        },
        { status: 429 }
      );
    }

    // Update usage tracking
    if (currentUsage) {
      await db
        .update(usageTracking)
        .set({
          apiCallsMade: sql`${usageTracking.apiCallsMade} + ${count}`,
          updatedAt: new Date(),
        })
        .where(eq(usageTracking.id, currentUsage.id));
    } else {
      await db.insert(usageTracking).values({
        organizationId,
        period,
        apiCallsMade: count,
        documentsUploaded: 0,
        storageUsedMb: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      usage: {
        current: currentApiCalls + count,
        limit: limits.aiAnalysisPerMonth,
        remaining: limits.aiAnalysisPerMonth === -1 ? -1 : limits.aiAnalysisPerMonth - (currentApiCalls + count),
      },
    });
  } catch (error) {
    console.error('Track AI usage error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

function getAILimits(plan: string) {
  const limits: Record<string, any> = {
    individual: {
      aiAnalysisPerMonth: 50,
      chatInteractions: 100,
      multiAgentAnalysis: 10,
      documentAnalysis: 50,
    },
    professional: {
      aiAnalysisPerMonth: 500,
      chatInteractions: 1000,
      multiAgentAnalysis: 100,
      documentAnalysis: 500,
    },
    business: {
      aiAnalysisPerMonth: -1, // Unlimited
      chatInteractions: -1,
      multiAgentAnalysis: -1,
      documentAnalysis: -1,
    },
    enterprise: {
      aiAnalysisPerMonth: -1, // Unlimited
      chatInteractions: -1,
      multiAgentAnalysis: -1,
      documentAnalysis: -1,
    },
  };

  return limits[plan] || limits.individual;
}
