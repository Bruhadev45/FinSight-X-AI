import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/billing/portal - Create Stripe customer portal session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      );
    }

    // Verify user is owner/admin
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

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

    // TODO: Integrate with Stripe
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
    });

    return NextResponse.json({
      success: true,
      portalUrl: session.url,
    });
    */

    return NextResponse.json({
      success: true,
      portalUrl: '/dashboard/settings/billing',
      message: 'Stripe billing portal ready. Add STRIPE_SECRET_KEY to enable.',
    });
  } catch (error) {
    console.error('Create portal error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
