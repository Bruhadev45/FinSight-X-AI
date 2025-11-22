import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies, benchmarks } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;

    // Validate company ID
    if (!companyId || isNaN(parseInt(companyId))) {
      return NextResponse.json(
        {
          error: "Valid company ID is required",
          code: "INVALID_COMPANY_ID"
        },
        { status: 400 }
      );
    }

    const parsedCompanyId = parseInt(companyId);

    // Check if company exists
    const company = await db.select()
      .from(companies)
      .where(eq(companies.id, parsedCompanyId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json(
        {
          error: "Company not found",
          code: "COMPANY_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const metricName = searchParams.get('metricName');
    const period = searchParams.get('period');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build query conditions
    const conditions = [eq(benchmarks.companyId, parsedCompanyId)];

    if (metricName) {
      conditions.push(eq(benchmarks.metricName, metricName));
    }

    if (period) {
      conditions.push(eq(benchmarks.period, period));
    }

    // Fetch benchmarks with filters
    const benchmarkResults = await db.select()
      .from(benchmarks)
      .where(and(...conditions))
      .orderBy(desc(benchmarks.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count of benchmarks for this company
    const totalCountResult = await db.select({
      count: sql<number>`count(*)`
    })
      .from(benchmarks)
      .where(and(...conditions));

    const totalBenchmarks = totalCountResult[0]?.count ?? 0;

    // Return response
    return NextResponse.json({
      company: company[0],
      benchmarks: benchmarkResults,
      totalBenchmarks: totalBenchmarks
    }, { status: 200 });

  } catch (error) {
    console.error('GET company benchmarks error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}