import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alertRules } from '@/db/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const alertRule = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.id, parseInt(id)))
        .limit(1);

      if (alertRule.length === 0) {
        return NextResponse.json(
          { error: 'Alert rule not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(alertRule[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('userId');
    const metricType = searchParams.get('metricType');
    const enabledParam = searchParams.get('enabled');

    // Build filter conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(alertRules.userId, userId));
    }

    if (metricType) {
      const validMetricTypes = ['debt_to_equity', 'revenue_change', 'compliance_score'];
      if (!validMetricTypes.includes(metricType)) {
        return NextResponse.json(
          {
            error: 'Invalid metricType. Must be one of: debt_to_equity, revenue_change, compliance_score',
            code: 'INVALID_METRIC_TYPE',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(alertRules.metricType, metricType));
    }

    if (enabledParam !== null && enabledParam !== undefined) {
      const enabled = enabledParam === 'true';
      conditions.push(eq(alertRules.enabled, enabled));
    }

    const baseQuery = db.select().from(alertRules);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(alertRules.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleName, metricType, thresholdValue, comparisonOperator, userId, notificationChannels, enabled } = body;

    // Validate required fields
    if (!ruleName || ruleName.trim() === '') {
      return NextResponse.json(
        { error: 'ruleName is required', code: 'MISSING_RULE_NAME' },
        { status: 400 }
      );
    }

    if (!metricType || metricType.trim() === '') {
      return NextResponse.json(
        { error: 'metricType is required', code: 'MISSING_METRIC_TYPE' },
        { status: 400 }
      );
    }

    // Validate metricType values
    const validMetricTypes = ['debt_to_equity', 'revenue_change', 'compliance_score'];
    if (!validMetricTypes.includes(metricType)) {
      return NextResponse.json(
        {
          error: 'Invalid metricType. Must be one of: debt_to_equity, revenue_change, compliance_score',
          code: 'INVALID_METRIC_TYPE',
        },
        { status: 400 }
      );
    }

    if (thresholdValue === undefined || thresholdValue === null) {
      return NextResponse.json(
        { error: 'thresholdValue is required', code: 'MISSING_THRESHOLD_VALUE' },
        { status: 400 }
      );
    }

    if (typeof thresholdValue !== 'number') {
      return NextResponse.json(
        { error: 'thresholdValue must be a number', code: 'INVALID_THRESHOLD_VALUE' },
        { status: 400 }
      );
    }

    if (!comparisonOperator || comparisonOperator.trim() === '') {
      return NextResponse.json(
        { error: 'comparisonOperator is required', code: 'MISSING_COMPARISON_OPERATOR' },
        { status: 400 }
      );
    }

    // Validate comparisonOperator values
    const validOperators = ['>', '<', '>=', '<=', '=='];
    if (!validOperators.includes(comparisonOperator)) {
      return NextResponse.json(
        {
          error: 'Invalid comparisonOperator. Must be one of: >, <, >=, <=, ==',
          code: 'INVALID_COMPARISON_OPERATOR',
        },
        { status: 400 }
      );
    }

    // Validate notificationChannels if provided
    if (notificationChannels !== undefined && notificationChannels !== null) {
      if (!Array.isArray(notificationChannels)) {
        return NextResponse.json(
          { error: 'notificationChannels must be an array', code: 'INVALID_NOTIFICATION_CHANNELS' },
          { status: 400 }
        );
      }

      const validChannels = ['push', 'sms', 'email'];
      const invalidChannels = notificationChannels.filter((ch: string) => !validChannels.includes(ch));
      if (invalidChannels.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid notification channels: ${invalidChannels.join(', ')}. Must be one of: push, sms, email`,
            code: 'INVALID_NOTIFICATION_CHANNELS',
          },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      ruleName: ruleName.trim(),
      metricType: metricType.trim(),
      thresholdValue,
      comparisonOperator: comparisonOperator.trim(),
      enabled: enabled !== undefined ? enabled : true,
      createdAt: new Date().toISOString(),
    };

    if (userId !== undefined && userId !== null) {
      insertData.userId = userId.trim();
    }

    if (notificationChannels !== undefined && notificationChannels !== null) {
      insertData.notificationChannels = JSON.stringify(notificationChannels);
    }

    const newAlertRule = await db.insert(alertRules).values(insertData).returning();

    return NextResponse.json(newAlertRule[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Alert rule not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { ruleName, metricType, thresholdValue, comparisonOperator, userId, notificationChannels, enabled } = body;

    const updates: any = {};

    if (ruleName !== undefined) {
      if (ruleName.trim() === '') {
        return NextResponse.json(
          { error: 'ruleName cannot be empty', code: 'INVALID_RULE_NAME' },
          { status: 400 }
        );
      }
      updates.ruleName = ruleName.trim();
    }

    if (metricType !== undefined) {
      const validMetricTypes = ['debt_to_equity', 'revenue_change', 'compliance_score'];
      if (!validMetricTypes.includes(metricType)) {
        return NextResponse.json(
          {
            error: 'Invalid metricType. Must be one of: debt_to_equity, revenue_change, compliance_score',
            code: 'INVALID_METRIC_TYPE',
          },
          { status: 400 }
        );
      }
      updates.metricType = metricType.trim();
    }

    if (thresholdValue !== undefined) {
      if (typeof thresholdValue !== 'number') {
        return NextResponse.json(
          { error: 'thresholdValue must be a number', code: 'INVALID_THRESHOLD_VALUE' },
          { status: 400 }
        );
      }
      updates.thresholdValue = thresholdValue;
    }

    if (comparisonOperator !== undefined) {
      const validOperators = ['>', '<', '>=', '<=', '=='];
      if (!validOperators.includes(comparisonOperator)) {
        return NextResponse.json(
          {
            error: 'Invalid comparisonOperator. Must be one of: >, <, >=, <=, ==',
            code: 'INVALID_COMPARISON_OPERATOR',
          },
          { status: 400 }
        );
      }
      updates.comparisonOperator = comparisonOperator.trim();
    }

    if (userId !== undefined) {
      updates.userId = userId !== null ? userId.trim() : null;
    }

    if (notificationChannels !== undefined) {
      if (notificationChannels !== null) {
        if (!Array.isArray(notificationChannels)) {
          return NextResponse.json(
            { error: 'notificationChannels must be an array', code: 'INVALID_NOTIFICATION_CHANNELS' },
            { status: 400 }
          );
        }

        const validChannels = ['push', 'sms', 'email'];
        const invalidChannels = notificationChannels.filter((ch: string) => !validChannels.includes(ch));
        if (invalidChannels.length > 0) {
          return NextResponse.json(
            {
              error: `Invalid notification channels: ${invalidChannels.join(', ')}. Must be one of: push, sms, email`,
              code: 'INVALID_NOTIFICATION_CHANNELS',
            },
            { status: 400 }
          );
        }

        updates.notificationChannels = JSON.stringify(notificationChannels);
      } else {
        updates.notificationChannels = null;
      }
    }

    if (enabled !== undefined) {
      updates.enabled = enabled;
    }

    const updated = await db
      .update(alertRules)
      .set(updates)
      .where(eq(alertRules.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Alert rule not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(alertRules)
      .where(eq(alertRules.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Alert rule deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}