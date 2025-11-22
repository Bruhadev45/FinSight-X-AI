import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys, organizationMembers } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import crypto from 'crypto';

// GET /api/api-keys?organizationId=xxx - List API keys
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
      return NextResponse.json({
        success: true,
        apiKeys: [
          {
            id: 1,
            name: 'Production API Key',
            keyPrefix: 'fs_prod_***',
            permissions: JSON.stringify({ read: true, write: true, delete: false }),
            lastUsedAt: new Date('2025-11-15T10:30:00Z'),
            expiresAt: null,
            createdAt: new Date('2024-01-20'),
          },
          {
            id: 2,
            name: 'Development API Key',
            keyPrefix: 'fs_dev_****',
            permissions: JSON.stringify({ read: true, write: true, delete: false }),
            lastUsedAt: new Date('2025-11-14T15:45:00Z'),
            expiresAt: null,
            createdAt: new Date('2024-03-15'),
          },
          {
            id: 3,
            name: 'CI/CD Pipeline Key',
            keyPrefix: 'fs_cicd_**',
            permissions: JSON.stringify({ read: true, write: false, delete: false }),
            lastUsedAt: new Date('2025-11-16T08:20:00Z'),
            expiresAt: null,
            createdAt: new Date('2024-05-10'),
          },
        ],
      });
    }

    // Get API keys (only non-revoked)
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        permissions: apiKeys.permissions,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.organizationId, organizationId),
          isNull(apiKeys.revokedAt)
        )
      );

    return NextResponse.json({
      success: true,
      apiKeys: keys,
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, permissions = {} } = body;
    const userId = 'user_1'; // TODO: From auth

    if (!organizationId || !name) {
      return NextResponse.json(
        { success: false, error: 'organizationId and name required' },
        { status: 400 }
      );
    }

    // Verify user is admin/owner
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
        { success: false, error: 'Permission denied. Only owners/admins can create API keys.' },
        { status: 403 }
      );
    }

    // Generate API key
    const key = 'fs_' + crypto.randomBytes(32).toString('hex');
    const keyPrefix = key.substring(0, 11); // First 11 chars for display

    // Create API key
    const [newKey] = await db
      .insert(apiKeys)
      .values({
        organizationId,
        userId,
        name,
        key,
        keyPrefix,
        permissions: JSON.stringify(permissions),
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key, // Only shown once!
        keyPrefix: newKey.keyPrefix,
        permissions: newKey.permissions,
        createdAt: newKey.createdAt,
      },
      message: 'Save this key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys?id=xxx - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = parseInt(searchParams.get('id') || '0');
    const userId = 'user_1'; // TODO: From auth

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'Key ID required' },
        { status: 400 }
      );
    }

    // Get the key
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, keyId));

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    // Verify permission
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, key.organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Revoke key (soft delete)
    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, keyId));

    return NextResponse.json({
      success: true,
      message: 'API key revoked',
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
