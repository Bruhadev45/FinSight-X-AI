import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { featureFlags, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/feature-flags - Get feature flags
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

    // Get feature flags
    const flags = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.enabled, true));

    // Convert to simple object for easy checking
    const flagsObject: Record<string, any> = {};
    flags.forEach((flag) => {
      flagsObject[flag.name] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        rules: flag.rules,
        description: flag.description,
      };
    });

    return NextResponse.json({
      success: true,
      flags: flagsObject,
    });
  } catch (error) {
    console.error('Get feature flags error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/feature-flags - Create/update feature flag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, key, value, description, enabled = true } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId || !key) {
      return NextResponse.json(
        { success: false, error: 'organizationId and key required' },
        { status: 400 }
      );
    }

    // Verify admin access
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
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if flag exists
    const [existingFlag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, key));

    if (existingFlag) {
      // Update existing flag
      await db
        .update(featureFlags)
        .set({
          description: description || existingFlag.description,
          enabled: enabled,
          rules: value || {},
          updatedAt: new Date(),
        })
        .where(eq(featureFlags.id, existingFlag.id));

      return NextResponse.json({
        success: true,
        message: 'Feature flag updated',
      });
    } else {
      // Create new flag
      await db.insert(featureFlags).values({
        name: key,
        description: description || null,
        enabled: enabled,
        rules: value || {},
        rolloutPercentage: 100,
      });

      return NextResponse.json({
        success: true,
        message: 'Feature flag created',
      });
    }
  } catch (error) {
    console.error('Create feature flag error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/feature-flags - Delete feature flag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flagId = parseInt(searchParams.get('id') || '0');
    const userId = 'user_1'; // TODO: From auth

    if (!flagId) {
      return NextResponse.json(
        { success: false, error: 'Flag id required' },
        { status: 400 }
      );
    }

    // Get flag
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, flagId));

    if (!flag) {
      return NextResponse.json(
        { success: false, error: 'Feature flag not found' },
        { status: 404 }
      );
    }

    // Feature flags are global, only admin users can delete
    // In a real app, you'd check if userId is an admin

    // Delete flag
    await db.delete(featureFlags).where(eq(featureFlags.id, flagId));

    return NextResponse.json({
      success: true,
      message: 'Feature flag deleted',
    });
  } catch (error) {
    console.error('Delete feature flag error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
