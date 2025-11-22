// Time-Series Forecasting & Predictive Analytics API
import { NextRequest, NextResponse } from "next/server";
import { forecastingService } from "@/lib/services/forecasting";
import { db } from '@/db';
import { forecastData, companies } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_FORECAST_TYPES = ['revenue', 'risk_score', 'cash_flow', 'profitability'] as const;
const VALID_METHODOLOGIES = ['time_series', 'regression', 'monte_carlo', 'arima'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(forecastData)
        .where(eq(forecastData.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Forecast not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const companyId = searchParams.get('companyId');
    const forecastType = searchParams.get('forecastType');
    const period = searchParams.get('period');

    const conditions = [];

    if (companyId) {
      if (isNaN(parseInt(companyId))) {
        return NextResponse.json(
          { error: 'Valid company ID is required', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(forecastData.companyId, parseInt(companyId)));
    }

    if (forecastType) {
      if (!VALID_FORECAST_TYPES.includes(forecastType as any)) {
        return NextResponse.json(
          {
            error: `Invalid forecastType. Must be one of: ${VALID_FORECAST_TYPES.join(', ')}`,
            code: 'INVALID_FORECAST_TYPE',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(forecastData.forecastType, forecastType));
    }

    if (period) {
      conditions.push(eq(forecastData.period, period));
    }

    const baseQuery = db.select().from(forecastData);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(forecastData.forecastDate))
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
    const {
      companyId,
      forecastType,
      period,
      lowEstimate,
      midEstimate,
      highEstimate,
      confidence,
      methodology,
      forecastDate,
      timeSeries,
      horizon,
      method,
    } = body;

    // If timeSeries data is provided, use forecasting service
    if (timeSeries && Array.isArray(timeSeries)) {
      if (timeSeries.length < 60) {
        return NextResponse.json(
          { error: "Minimum 60 data points required" },
          { status: 400 }
        );
      }

      const forecastResult = await forecastingService.forecast(
        timeSeries,
        horizon || 10,
        30
      );

      const anomalies = forecastingService.detectAnomalies(timeSeries, 3);

      const currentPrice = timeSeries[timeSeries.length - 1];
      const returns = timeSeries
        .slice(1)
        .map((p, i) => (p - timeSeries[i]) / timeSeries[i]);
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const returnStd = Math.sqrt(
        returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
          returns.length
      );

      const monteCarloResult = forecastingService.monteCarloSimulation(
        currentPrice,
        avgReturn,
        returnStd,
        1000,
        30
      );

      return NextResponse.json({
        success: true,
        forecast: forecastResult,
        anomalies: {
          detected: anomalies.anomalies.slice(-10),
          method: anomalies.method,
          totalFound: anomalies.anomalies.length,
        },
        monteCarloAnalysis: {
          simulations: monteCarloResult.simulations,
          statistics: monteCarloResult.statistics,
          samplePaths: monteCarloResult.paths.slice(0, 5),
        },
        metadata: {
          trainedOn: timeSeries.length,
          forecastHorizon: horizon || 10,
          confidence: 0.95,
        },
      });
    }

    // Otherwise, store forecast data
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required', code: 'MISSING_COMPANY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(companyId))) {
      return NextResponse.json(
        { error: 'companyId must be a valid integer', code: 'INVALID_COMPANY_ID' },
        { status: 400 }
      );
    }

    const companyExists = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parseInt(companyId)))
      .limit(1);

    if (companyExists.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!forecastType) {
      return NextResponse.json(
        { error: 'forecastType is required', code: 'MISSING_FORECAST_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_FORECAST_TYPES.includes(forecastType)) {
      return NextResponse.json(
        {
          error: `Invalid forecastType. Must be one of: ${VALID_FORECAST_TYPES.join(', ')}`,
          code: 'INVALID_FORECAST_TYPE',
        },
        { status: 400 }
      );
    }

    if (!period || period.trim() === '') {
      return NextResponse.json(
        { error: 'period is required', code: 'MISSING_PERIOD' },
        { status: 400 }
      );
    }

    if (lowEstimate === undefined || lowEstimate === null || isNaN(parseFloat(lowEstimate))) {
      return NextResponse.json(
        { error: 'lowEstimate is required and must be a number', code: 'INVALID_LOW_ESTIMATE' },
        { status: 400 }
      );
    }

    if (midEstimate === undefined || midEstimate === null || isNaN(parseFloat(midEstimate))) {
      return NextResponse.json(
        { error: 'midEstimate is required and must be a number', code: 'INVALID_MID_ESTIMATE' },
        { status: 400 }
      );
    }

    if (highEstimate === undefined || highEstimate === null || isNaN(parseFloat(highEstimate))) {
      return NextResponse.json(
        { error: 'highEstimate is required and must be a number', code: 'INVALID_HIGH_ESTIMATE' },
        { status: 400 }
      );
    }

    const low = parseFloat(lowEstimate);
    const mid = parseFloat(midEstimate);
    const high = parseFloat(highEstimate);

    if (!(low <= mid && mid <= high)) {
      return NextResponse.json(
        { 
          error: 'Estimates must satisfy: lowEstimate <= midEstimate <= highEstimate',
          code: 'INVALID_ESTIMATE_ORDER' 
        },
        { status: 400 }
      );
    }

    if (confidence === undefined || confidence === null || isNaN(parseFloat(confidence))) {
      return NextResponse.json(
        { error: 'confidence is required and must be a number', code: 'INVALID_CONFIDENCE' },
        { status: 400 }
      );
    }

    const conf = parseFloat(confidence);
    if (conf < 0 || conf > 1) {
      return NextResponse.json(
        { error: 'confidence must be between 0.0 and 1.0', code: 'CONFIDENCE_OUT_OF_RANGE' },
        { status: 400 }
      );
    }

    if (!methodology) {
      return NextResponse.json(
        { error: 'methodology is required', code: 'MISSING_METHODOLOGY' },
        { status: 400 }
      );
    }

    if (!VALID_METHODOLOGIES.includes(methodology)) {
      return NextResponse.json(
        {
          error: `Invalid methodology. Must be one of: ${VALID_METHODOLOGIES.join(', ')}`,
          code: 'INVALID_METHODOLOGY',
        },
        { status: 400 }
      );
    }

    if (!forecastDate) {
      return NextResponse.json(
        { error: 'forecastDate is required', code: 'MISSING_FORECAST_DATE' },
        { status: 400 }
      );
    }

    const newForecast = await db
      .insert(forecastData)
      .values({
        companyId: parseInt(companyId),
        forecastType,
        period: period.trim(),
        lowEstimate: low,
        midEstimate: mid,
        highEstimate: high,
        confidence: conf,
        methodology,
        forecastDate,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newForecast[0], { status: 201 });
  } catch (error) {
    console.error("Forecast error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Forecast failed" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(forecastData)
      .where(eq(forecastData.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Forecast not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.companyId !== undefined) {
      if (isNaN(parseInt(body.companyId))) {
        return NextResponse.json(
          { error: 'companyId must be a valid integer', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }

      const companyExists = await db
        .select()
        .from(companies)
        .where(eq(companies.id, parseInt(body.companyId)))
        .limit(1);

      if (companyExists.length === 0) {
        return NextResponse.json(
          { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
          { status: 404 }
        );
      }

      updates.companyId = parseInt(body.companyId);
    }

    if (body.forecastType !== undefined) {
      if (!VALID_FORECAST_TYPES.includes(body.forecastType)) {
        return NextResponse.json(
          {
            error: `Invalid forecastType. Must be one of: ${VALID_FORECAST_TYPES.join(', ')}`,
            code: 'INVALID_FORECAST_TYPE',
          },
          { status: 400 }
        );
      }
      updates.forecastType = body.forecastType;
    }

    if (body.methodology !== undefined) {
      if (!VALID_METHODOLOGIES.includes(body.methodology)) {
        return NextResponse.json(
          {
            error: `Invalid methodology. Must be one of: ${VALID_METHODOLOGIES.join(', ')}`,
            code: 'INVALID_METHODOLOGY',
          },
          { status: 400 }
        );
      }
      updates.methodology = body.methodology;
    }

    if (body.period !== undefined) updates.period = body.period.trim();
    if (body.lowEstimate !== undefined) updates.lowEstimate = parseFloat(body.lowEstimate);
    if (body.midEstimate !== undefined) updates.midEstimate = parseFloat(body.midEstimate);
    if (body.highEstimate !== undefined) updates.highEstimate = parseFloat(body.highEstimate);

    if (body.confidence !== undefined) {
      const conf = parseFloat(body.confidence);
      if (conf < 0 || conf > 1) {
        return NextResponse.json(
          { error: 'confidence must be between 0.0 and 1.0', code: 'CONFIDENCE_OUT_OF_RANGE' },
          { status: 400 }
        );
      }
      updates.confidence = conf;
    }

    if (body.forecastDate !== undefined) updates.forecastDate = body.forecastDate;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(forecastData)
      .set(updates)
      .where(eq(forecastData.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(forecastData)
      .where(eq(forecastData.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Forecast not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(forecastData)
      .where(eq(forecastData.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Forecast deleted successfully',
        forecast: deleted[0],
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