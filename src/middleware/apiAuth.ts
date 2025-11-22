// API Key Authentication Middleware
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { apiKeys, organizations } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface ApiContext {
  organizationId: number;
  userId: string;
  apiKeyId: number;
  permissions: any;
}

export async function authenticateApiKey(request: NextRequest): Promise<ApiContext | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const key = authHeader.substring(7); // Remove 'Bearer '

    if (!key.startsWith('fs_')) {
      return null;
    }

    // Find API key
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.key, key),
          isNull(apiKeys.revokedAt)
        )
      );

    if (!apiKey) {
      return null;
    }

    // Check if expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return null;
    }

    // Check organization status
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, apiKey.organizationId));

    if (!org || org.status !== 'active') {
      return null;
    }

    // Check if plan allows API access
    if (!['business', 'enterprise'].includes(org.plan)) {
      return null;
    }

    // Update last used
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    return {
      organizationId: apiKey.organizationId,
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
      permissions: typeof apiKey.permissions === 'string'
        ? JSON.parse(apiKey.permissions)
        : apiKey.permissions,
    };
  } catch (error) {
    console.error('API auth error:', error);
    return null;
  }
}

export function hasPermission(context: ApiContext, permission: string): boolean {
  if (!context.permissions) return false;

  // Check if has specific permission
  const [resource, action] = permission.split(':');

  if (context.permissions[resource] === '*') return true;
  if (Array.isArray(context.permissions[resource]) &&
      context.permissions[resource].includes(action)) return true;

  return false;
}
