import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizationMembers, user, organizations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/organizations/[id]/members - List team members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = parseInt(id);
    const userId = 'user_1'; // TODO: From auth

    // Verify user has access
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, userId)
        )
      );

    // Return dummy data if no membership found (for demo purposes)
    if (!membership) {
      return NextResponse.json({
        success: true,
        members: [
          {
            id: 1,
            userId: 'user_1',
            name: 'John Smith',
            email: 'john.smith@acmefinancial.com',
            image: null,
            role: 'owner',
            joinedAt: new Date('2024-01-15'),
            invitedBy: 'user_1',
          },
          {
            id: 2,
            userId: 'user_2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@acmefinancial.com',
            image: null,
            role: 'admin',
            joinedAt: new Date('2024-02-01'),
            invitedBy: 'user_1',
          },
          {
            id: 3,
            userId: 'user_3',
            name: 'Michael Chen',
            email: 'michael.chen@acmefinancial.com',
            image: null,
            role: 'member',
            joinedAt: new Date('2024-02-15'),
            invitedBy: 'user_1',
          },
          {
            id: 4,
            userId: 'user_4',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@acmefinancial.com',
            image: null,
            role: 'member',
            joinedAt: new Date('2024-03-01'),
            invitedBy: 'user_2',
          },
          {
            id: 5,
            userId: 'user_5',
            name: 'David Kim',
            email: 'david.kim@acmefinancial.com',
            image: null,
            role: 'viewer',
            joinedAt: new Date('2024-03-10'),
            invitedBy: 'user_2',
          },
        ],
      });
    }

    // Get all members with user details
    const members = await db
      .select({
        membership: organizationMembers,
        user: user,
      })
      .from(organizationMembers)
      .innerJoin(user, eq(organizationMembers.userId, user.id))
      .where(eq(organizationMembers.organizationId, orgId));

    return NextResponse.json({
      success: true,
      members: members.map(({ membership, user }) => ({
        id: membership.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: membership.role,
        joinedAt: membership.joinedAt,
        invitedBy: membership.invitedBy,
      })),
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/members?userId=xxx - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const currentUserId = 'user_1'; // TODO: From auth

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
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

    // Check target user role
    const [targetMembership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, targetUserId)
        )
      );

    if (!targetMembership) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Can't remove the owner
    if (targetMembership.role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove organization owner' },
        { status: 400 }
      );
    }

    // Admins can't remove other admins (only owner can)
    if (currentMembership.role === 'admin' && targetMembership.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only owner can remove admins' },
        { status: 403 }
      );
    }

    // Remove member
    await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, targetUserId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Member removed',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
