import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/invitations/accept - Accept team invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    // Get invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token));

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Invitation expired' },
        { status: 400 }
      );
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Invitation already accepted' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existing = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, invitation.organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already a member of this organization' },
        { status: 400 }
      );
    }

    // Add user as member
    await db.insert(organizationMembers).values({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      joinedAt: new Date(),
      createdAt: new Date(),
    });

    // Update invitation status
    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id));

    return NextResponse.json({
      success: true,
      organizationId: invitation.organizationId,
      message: 'Invitation accepted',
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
