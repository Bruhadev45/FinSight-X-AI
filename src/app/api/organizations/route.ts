import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/organizations - List user's organizations
export async function GET(request: NextRequest) {
  try {
    // TODO: Get from auth session
    const userId = 'user_1'; // Placeholder

    // Get organizations where user is a member
    const userOrgs = await db
      .select({
        org: organizations,
        membership: organizationMembers,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizations.id, organizationMembers.organizationId)
      )
      .where(eq(organizationMembers.userId, userId));

    // If no organizations found, return dummy data
    if (userOrgs.length === 0) {
      return NextResponse.json({
        success: true,
        organizations: [
          {
            id: 1,
            name: 'Acme Financial Corp',
            slug: 'acme-financial-corp',
            plan: 'enterprise',
            status: 'active',
            maxUsers: 999999,
            maxDocuments: 999999,
            billingEmail: 'billing@acmefinancial.com',
            memberCount: 12,
            currentDocumentCount: 234,
            role: 'owner',
            joinedAt: new Date('2024-01-15'),
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date(),
          }
        ],
      });
    }

    return NextResponse.json({
      success: true,
      organizations: userOrgs.map(({ org, membership }) => ({
        ...org,
        role: membership.role,
        joinedAt: membership.joinedAt,
      })),
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, plan = 'individual' } = body;

    // TODO: Get from auth session
    const userId = 'user_1';

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Organization name required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Set limits based on plan
    const planLimits: Record<string, { maxUsers: number; maxDocuments: number }> = {
      individual: { maxUsers: 1, maxDocuments: 10 },
      professional: { maxUsers: 5, maxDocuments: 100 },
      business: { maxUsers: 999999, maxDocuments: 999999 },
      enterprise: { maxUsers: 999999, maxDocuments: 999999 },
    };

    const limits = planLimits[plan] || planLimits.individual;

    // Create organization
    const [org] = await db
      .insert(organizations)
      .values({
        name,
        slug: slug + '-' + Date.now(), // Make unique
        plan,
        maxUsers: limits.maxUsers,
        maxDocuments: limits.maxDocuments,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Add creator as owner
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId,
      role: 'owner',
      invitedBy: userId,
      joinedAt: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      organization: org,
    });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
