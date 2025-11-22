import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportTickets, ticketMessages, organizationMembers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/support/tickets - List support tickets
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

    // Get tickets for organization
    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.organizationId, organizationId))
      .orderBy(desc(supportTickets.createdAt));

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/support/tickets - Create support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, subject, description, priority = 'normal', category, phoneNumber } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: 'subject and description required' },
        { status: 400 }
      );
    }

    // Verify access if organizationId provided
    if (organizationId) {
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
    }

    // Create ticket
    const [ticket] = await db
      .insert(supportTickets)
      .values({
        organizationId: organizationId || null,
        userId,
        subject,
        description,
        priority,
        category: category || null,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create first message
    await db.insert(ticketMessages).values({
      ticketId: ticket.id,
      userId,
      message: description,
      isInternal: false,
      createdAt: new Date(),
    });

    // Send SMS confirmation if phone number provided
    if (phoneNumber) {
      try {
        const smsResponse = await fetch(`${request.nextUrl.origin}/api/support/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            ticketId: ticket.id,
            subject,
          }),
        });

        if (!smsResponse.ok) {
          console.error('SMS sending failed, but ticket was created');
        }
      } catch (smsError) {
        console.error('SMS error:', smsError);
        // Don't fail the ticket creation if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
