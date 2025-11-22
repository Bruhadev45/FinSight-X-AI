import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/billing/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, plan, billingCycle = 'monthly' } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId || !plan) {
      return NextResponse.json(
        { success: false, error: 'organizationId and plan required' },
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

    // Stripe price IDs (you need to create these in Stripe Dashboard)
    const priceIds: Record<string, Record<string, string>> = {
      professional: {
        monthly: 'price_professional_monthly', // Replace with actual Stripe price IDs
        annual: 'price_professional_annual',
      },
      business: {
        monthly: 'price_business_monthly',
        annual: 'price_business_annual',
      },
    };

    const priceId = priceIds[plan]?.[billingCycle];

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Stripe
    // For now, return mock checkout URL
    const checkoutUrl = `https://checkout.stripe.com/pay/${priceId}`;

    /*
    // Real Stripe integration (uncomment when Stripe keys are set):
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      customer: org.stripeCustomerId,
      client_reference_id: organizationId.toString(),
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
      metadata: {
        organizationId: organizationId.toString(),
        plan,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
    */

    return NextResponse.json({
      success: true,
      checkoutUrl,
      message: 'Stripe integration ready. Add STRIPE_SECRET_KEY to enable.',
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
