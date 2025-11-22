import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, organizationMembers, organizations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// POST /api/organizations/[id]/members/invite - Send invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgIdStr } = await params;
    const orgId = parseInt(orgIdStr);
    const body = await request.json();
    const { email, role = 'member' } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    // Verify user has permission to invite
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

    // Get organization details
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

    // Check member limit
    const currentMembers = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));

    if (currentMembers.length >= (org.maxUsers ?? 5)) {
      return NextResponse.json(
        { success: false, error: 'Member limit reached. Please upgrade your plan.' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const [invitation] = await db
      .insert(invitations)
      .values({
        organizationId: orgId,
        email,
        role,
        invitedBy: userId,
        token,
        expiresAt,
        createdAt: new Date(),
      })
      .returning();

    // TODO: Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    console.log('Invitation URL:', invitationUrl);

    return NextResponse.json({
      success: true,
      invitation: {
        ...invitation,
        invitationUrl, // For now, return URL (later send via email)
      },
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id]/members/invite - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgIdStr } = await params;
    const orgId = parseInt(orgIdStr);
    const body = await request.json();
    const { userId: targetUserId, role } = body;
    const currentUserId = 'user_1'; // TODO: From auth

    if (!targetUserId || !role) {
      return NextResponse.json(
        { success: false, error: 'userId and role required' },
        { status: 400 }
      );
    }

    // Check if current user is owner/admin
    const [currentMembership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, currentUserId)
        )
      );

    if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Only owner can create/remove admins
    if (role === 'admin' && currentMembership.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only owner can manage admin roles' },
        { status: 403 }
      );
    }

    // Update role
    const [updated] = await db
      .update(organizationMembers)
      .set({ role })
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, targetUserId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (error) {
    console.error('Update member role error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
