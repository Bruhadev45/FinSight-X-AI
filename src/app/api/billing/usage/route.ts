import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers, usageTracking, documents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/billing/usage?organizationId=xxx - Get current usage
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

    // Return dummy data if no membership (for demo purposes)
    if (!membership) {
      const now = new Date();
      const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return NextResponse.json({
        success: true,
        usage: {
          documentsUsed: 234,
          documentsLimit: 999999,
          documentsPercentage: 0.02,
          teamSize: 5,
          teamLimit: 999999,
          teamPercentage: 0.001,
          apiCalls: 12847,
          storageUsedMb: 1450,
          aiCreditsUsed: 3250,
          plan: 'enterprise',
          status: 'active',
          period: now.toISOString().slice(0, 7),
          billingPeriodStart: billingPeriodStart.toISOString(),
          billingPeriodEnd: billingPeriodEnd.toISOString(),
        },
      });
    }

    // Get organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get current period usage
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.organizationId, organizationId),
          eq(usageTracking.period, currentPeriod)
        )
      );

    // Count total documents
    const totalDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId)); // TODO: Filter by org when documents have orgId

    // Get team size
    const teamMembers = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));

    const usageData = {
      documentsUsed: usage?.documentsUploaded || org.currentDocumentCount || 0,
      documentsLimit: org.maxDocuments,
      documentsPercentage: (org.maxDocuments ?? 0) > 0
        ? Math.round(((usage?.documentsUploaded || org.currentDocumentCount || 0) / (org.maxDocuments ?? 1)) * 100)
        : 0,

      teamSize: teamMembers.length,
      teamLimit: org.maxUsers,
      teamPercentage: (org.maxUsers ?? 0) > 0
        ? Math.round((teamMembers.length / (org.maxUsers ?? 1)) * 100)
        : 0,

      apiCalls: usage?.apiCallsMade || 0,
      storageUsedMb: usage?.storageUsedMb || 0,
      aiCreditsUsed: usage?.aiCreditsUsed || 0,

      plan: org.plan,
      status: org.status,
      period: currentPeriod,
    };

    return NextResponse.json({
      success: true,
      usage: usageData,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
