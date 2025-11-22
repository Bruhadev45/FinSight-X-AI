import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId } = body;

    // Validate alertId is provided
    if (!alertId) {
      return NextResponse.json(
        { 
          error: 'Alert ID is required',
          code: 'MISSING_ALERT_ID'
        },
        { status: 400 }
      );
    }

    // Validate alertId is a valid integer
    const parsedAlertId = parseInt(alertId);
    if (isNaN(parsedAlertId)) {
      return NextResponse.json(
        { 
          error: 'Alert ID must be a valid integer',
          code: 'INVALID_ALERT_ID'
        },
        { status: 400 }
      );
    }

    // Check if alert exists
    const existingAlert = await db.select()
      .from(alerts)
      .where(eq(alerts.id, parsedAlertId))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json(
        { 
          error: 'Alert not found',
          code: 'ALERT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update alert status and acknowledgedAt
    const updatedAlert = await db.update(alerts)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString()
      })
      .where(eq(alerts.id, parsedAlertId))
      .returning();

    return NextResponse.json(updatedAlert[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}