import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { benchmarks, companies } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single benchmark by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const benchmark = await db.select()
        .from(benchmarks)
        .where(eq(benchmarks.id, parseInt(id)))
        .limit(1);

      if (benchmark.length === 0) {
        return NextResponse.json({ 
          error: 'Benchmark not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(benchmark[0], { status: 200 });
    }

    // List benchmarks with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const companyId = searchParams.get('companyId');
    const peerCompanyId = searchParams.get('peerCompanyId');
    const metricName = searchParams.get('metricName');
    const period = searchParams.get('period');
    const sort = searchParams.get('sort') ?? 'createdAt';
    const order = searchParams.get('order') ?? 'desc';

    // Build filter conditions
    const conditions = [];

    if (companyId) {
      const companyIdNum = parseInt(companyId);
      if (!isNaN(companyIdNum)) {
        conditions.push(eq(benchmarks.companyId, companyIdNum));
      }
    }

    if (peerCompanyId) {
      const peerCompanyIdNum = parseInt(peerCompanyId);
      if (!isNaN(peerCompanyIdNum)) {
        conditions.push(eq(benchmarks.peerCompanyId, peerCompanyIdNum));
      }
    }

    if (metricName) {
      conditions.push(eq(benchmarks.metricName, metricName));
    }

    if (period) {
      conditions.push(eq(benchmarks.period, period));
    }

    // Apply sorting
    const sortColumn = sort === 'id' ? benchmarks.id :
                      sort === 'companyId' ? benchmarks.companyId :
                      sort === 'metricName' ? benchmarks.metricName :
                      sort === 'variancePercentage' ? benchmarks.variancePercentage :
                      sort === 'period' ? benchmarks.period :
                      benchmarks.createdAt;

    const orderFn = order === 'asc' ? asc : desc;

    // Apply pagination
    const baseQuery = db.select().from(benchmarks);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyId, 
      peerCompanyId, 
      metricName, 
      companyValue, 
      peerValue, 
      variancePercentage, 
      period 
    } = body;

    // Validate required fields
    if (!companyId) {
      return NextResponse.json({ 
        error: "Company ID is required",
        code: "MISSING_COMPANY_ID" 
      }, { status: 400 });
    }

    if (!peerCompanyId) {
      return NextResponse.json({ 
        error: "Peer Company ID is required",
        code: "MISSING_PEER_COMPANY_ID" 
      }, { status: 400 });
    }

    if (!metricName || metricName.trim() === '') {
      return NextResponse.json({ 
        error: "Metric name is required",
        code: "MISSING_METRIC_NAME" 
      }, { status: 400 });
    }

    if (companyValue === undefined || companyValue === null) {
      return NextResponse.json({ 
        error: "Company value is required",
        code: "MISSING_COMPANY_VALUE" 
      }, { status: 400 });
    }

    if (peerValue === undefined || peerValue === null) {
      return NextResponse.json({ 
        error: "Peer value is required",
        code: "MISSING_PEER_VALUE" 
      }, { status: 400 });
    }

    if (variancePercentage === undefined || variancePercentage === null) {
      return NextResponse.json({ 
        error: "Variance percentage is required",
        code: "MISSING_VARIANCE_PERCENTAGE" 
      }, { status: 400 });
    }

    if (!period || period.trim() === '') {
      return NextResponse.json({ 
        error: "Period is required",
        code: "MISSING_PERIOD" 
      }, { status: 400 });
    }

    // Validate numeric fields
    const companyIdNum = parseInt(companyId);
    const peerCompanyIdNum = parseInt(peerCompanyId);

    if (isNaN(companyIdNum)) {
      return NextResponse.json({ 
        error: "Company ID must be a valid number",
        code: "INVALID_COMPANY_ID" 
      }, { status: 400 });
    }

    if (isNaN(peerCompanyIdNum)) {
      return NextResponse.json({ 
        error: "Peer Company ID must be a valid number",
        code: "INVALID_PEER_COMPANY_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseFloat(companyValue))) {
      return NextResponse.json({ 
        error: "Company value must be a valid number",
        code: "INVALID_COMPANY_VALUE" 
      }, { status: 400 });
    }

    if (isNaN(parseFloat(peerValue))) {
      return NextResponse.json({ 
        error: "Peer value must be a valid number",
        code: "INVALID_PEER_VALUE" 
      }, { status: 400 });
    }

    if (isNaN(parseFloat(variancePercentage))) {
      return NextResponse.json({ 
        error: "Variance percentage must be a valid number",
        code: "INVALID_VARIANCE_PERCENTAGE" 
      }, { status: 400 });
    }

    // Verify company exists
    const companyExists = await db.select()
      .from(companies)
      .where(eq(companies.id, companyIdNum))
      .limit(1);

    if (companyExists.length === 0) {
      return NextResponse.json({ 
        error: "Company not found",
        code: "COMPANY_NOT_FOUND" 
      }, { status: 400 });
    }

    // Create new benchmark
    const newBenchmark = await db.insert(benchmarks)
      .values({
        companyId: companyIdNum,
        peerCompanyId: peerCompanyIdNum,
        metricName: metricName.trim(),
        companyValue: parseFloat(companyValue),
        peerValue: parseFloat(peerValue),
        variancePercentage: parseFloat(variancePercentage),
        period: period.trim(),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBenchmark[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const benchmarkId = parseInt(id);

    // Check if benchmark exists
    const existing = await db.select()
      .from(benchmarks)
      .where(eq(benchmarks.id, benchmarkId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Benchmark not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add optional fields
    if (body.companyId !== undefined) {
      const companyIdNum = parseInt(body.companyId);
      if (isNaN(companyIdNum)) {
        return NextResponse.json({ 
          error: "Company ID must be a valid number",
          code: "INVALID_COMPANY_ID" 
        }, { status: 400 });
      }

      // Verify company exists
      const companyExists = await db.select()
        .from(companies)
        .where(eq(companies.id, companyIdNum))
        .limit(1);

      if (companyExists.length === 0) {
        return NextResponse.json({ 
          error: "Company not found",
          code: "COMPANY_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.companyId = companyIdNum;
    }

    if (body.peerCompanyId !== undefined) {
      const peerCompanyIdNum = parseInt(body.peerCompanyId);
      if (isNaN(peerCompanyIdNum)) {
        return NextResponse.json({ 
          error: "Peer Company ID must be a valid number",
          code: "INVALID_PEER_COMPANY_ID" 
        }, { status: 400 });
      }
      updates.peerCompanyId = peerCompanyIdNum;
    }

    if (body.metricName !== undefined) {
      if (typeof body.metricName !== 'string' || body.metricName.trim() === '') {
        return NextResponse.json({ 
          error: "Metric name must be a non-empty string",
          code: "INVALID_METRIC_NAME" 
        }, { status: 400 });
      }
      updates.metricName = body.metricName.trim();
    }

    if (body.companyValue !== undefined) {
      if (isNaN(parseFloat(body.companyValue))) {
        return NextResponse.json({ 
          error: "Company value must be a valid number",
          code: "INVALID_COMPANY_VALUE" 
        }, { status: 400 });
      }
      updates.companyValue = parseFloat(body.companyValue);
    }

    if (body.peerValue !== undefined) {
      if (isNaN(parseFloat(body.peerValue))) {
        return NextResponse.json({ 
          error: "Peer value must be a valid number",
          code: "INVALID_PEER_VALUE" 
        }, { status: 400 });
      }
      updates.peerValue = parseFloat(body.peerValue);
    }

    if (body.variancePercentage !== undefined) {
      if (isNaN(parseFloat(body.variancePercentage))) {
        return NextResponse.json({ 
          error: "Variance percentage must be a valid number",
          code: "INVALID_VARIANCE_PERCENTAGE" 
        }, { status: 400 });
      }
      updates.variancePercentage = parseFloat(body.variancePercentage);
    }

    if (body.period !== undefined) {
      if (typeof body.period !== 'string' || body.period.trim() === '') {
        return NextResponse.json({ 
          error: "Period must be a non-empty string",
          code: "INVALID_PERIOD" 
        }, { status: 400 });
      }
      updates.period = body.period.trim();
    }

    // Remove updatedAt as it's not in the schema
    delete updates.updatedAt;

    // Update benchmark
    const updated = await db.update(benchmarks)
      .set(updates)
      .where(eq(benchmarks.id, benchmarkId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update benchmark',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const benchmarkId = parseInt(id);

    // Check if benchmark exists
    const existing = await db.select()
      .from(benchmarks)
      .where(eq(benchmarks.id, benchmarkId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Benchmark not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete benchmark
    const deleted = await db.delete(benchmarks)
      .where(eq(benchmarks.id, benchmarkId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete benchmark',
        code: "DELETE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Benchmark deleted successfully',
      benchmark: deleted[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}