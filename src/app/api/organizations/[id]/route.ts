import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = parseInt(id);
    // TODO: Get from auth session
    const userId = 'user_1';

    // Check if user has access
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
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
      .where(eq(organizations.id, orgId));

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get member count
    const members = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));

    return NextResponse.json({
      success: true,
      organization: {
        ...org,
        memberCount: members.length,
        userRole: membership.role,
      },
    });
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = parseInt(id);
    const body = await request.json();
    // TODO: Get from auth session
    const userId = 'user_1';

    // Check if user is owner/admin
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Update organization
    const [updated] = await db
      .update(organizations)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId))
      .returning();

    return NextResponse.json({
      success: true,
      organization: updated,
    });
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = parseInt(id);
    // TODO: Get from auth session
    const userId = 'user_1';

    // Check if user is owner
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only owners can delete organizations' },
        { status: 403 }
      );
    }

    // Delete organization (cascade will handle members, etc.)
    await db.delete(organizations).where(eq(organizations.id, orgId));

    return NextResponse.json({
      success: true,
      message: 'Organization deleted',
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
