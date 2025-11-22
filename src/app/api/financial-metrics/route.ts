import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { financialMetrics, documents } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(financialMetrics)
        .where(eq(financialMetrics.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Financial metric not found',
          code: 'METRIC_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const documentId = searchParams.get('documentId');
    const companyName = searchParams.get('companyName');
    const fiscalYear = searchParams.get('fiscalYear');
    const fiscalQuarter = searchParams.get('fiscalQuarter');

    // Build filter conditions
    const conditions = [];

    if (documentId) {
      const docIdNum = parseInt(documentId);
      if (!isNaN(docIdNum)) {
        conditions.push(eq(financialMetrics.documentId, docIdNum));
      }
    }

    if (companyName) {
      conditions.push(like(financialMetrics.companyName, `%${companyName}%`));
    }

    if (fiscalYear) {
      const yearNum = parseInt(fiscalYear);
      if (!isNaN(yearNum)) {
        conditions.push(eq(financialMetrics.fiscalYear, yearNum));
      }
    }

    if (fiscalQuarter) {
      conditions.push(eq(financialMetrics.fiscalQuarter, fiscalQuarter));
    }

    const baseQuery = db.select().from(financialMetrics);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(financialMetrics.extractedAt))
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

    // Validate required fields
    if (!body.documentId) {
      return NextResponse.json({ 
        error: "documentId is required",
        code: "MISSING_DOCUMENT_ID" 
      }, { status: 400 });
    }

    if (!body.companyName || body.companyName.trim() === '') {
      return NextResponse.json({ 
        error: "companyName is required",
        code: "MISSING_COMPANY_NAME" 
      }, { status: 400 });
    }

    if (!body.fiscalYear) {
      return NextResponse.json({ 
        error: "fiscalYear is required",
        code: "MISSING_FISCAL_YEAR" 
      }, { status: 400 });
    }

    // Validate documentId is a valid number
    const documentId = parseInt(body.documentId);
    if (isNaN(documentId)) {
      return NextResponse.json({ 
        error: "documentId must be a valid number",
        code: "INVALID_DOCUMENT_ID" 
      }, { status: 400 });
    }

    // Validate fiscalYear is a valid number
    const fiscalYear = parseInt(body.fiscalYear);
    if (isNaN(fiscalYear)) {
      return NextResponse.json({ 
        error: "fiscalYear must be a valid number",
        code: "INVALID_FISCAL_YEAR" 
      }, { status: 400 });
    }

    // Check if documentId exists
    const existingDocument = await db.select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json({ 
        error: "Referenced document does not exist",
        code: "DOCUMENT_NOT_FOUND" 
      }, { status: 400 });
    }

    // Parse numeric fields safely
    const parseOptionalNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Prepare insert data
    const insertData = {
      documentId,
      companyName: body.companyName.trim(),
      fiscalYear,
      fiscalQuarter: body.fiscalQuarter?.trim() || null,
      revenue: parseOptionalNumber(body.revenue),
      ebitda: parseOptionalNumber(body.ebitda),
      netIncome: parseOptionalNumber(body.netIncome),
      totalAssets: parseOptionalNumber(body.totalAssets),
      totalLiabilities: parseOptionalNumber(body.totalLiabilities),
      equity: parseOptionalNumber(body.equity),
      debtToEquityRatio: parseOptionalNumber(body.debtToEquityRatio),
      roe: parseOptionalNumber(body.roe),
      currentRatio: parseOptionalNumber(body.currentRatio),
      extractedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(financialMetrics)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const metricId = parseInt(id);

    // Check if record exists
    const existingRecord = await db.select()
      .from(financialMetrics)
      .where(eq(financialMetrics.id, metricId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Financial metric not found',
        code: 'METRIC_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();

    // Validate documentId if provided
    if (body.documentId !== undefined) {
      const documentId = parseInt(body.documentId);
      if (isNaN(documentId)) {
        return NextResponse.json({ 
          error: "documentId must be a valid number",
          code: "INVALID_DOCUMENT_ID" 
        }, { status: 400 });
      }

      // Check if documentId exists
      const existingDocument = await db.select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (existingDocument.length === 0) {
        return NextResponse.json({ 
          error: "Referenced document does not exist",
          code: "DOCUMENT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate fiscalYear if provided
    if (body.fiscalYear !== undefined) {
      const fiscalYear = parseInt(body.fiscalYear);
      if (isNaN(fiscalYear)) {
        return NextResponse.json({ 
          error: "fiscalYear must be a valid number",
          code: "INVALID_FISCAL_YEAR" 
        }, { status: 400 });
      }
    }

    // Parse numeric fields safely
    const parseOptionalNumber = (value: any): number | null | undefined => {
      if (value === undefined) return undefined;
      if (value === null || value === '') return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Prepare update data
    const updateData: any = {};

    if (body.documentId !== undefined) {
      updateData.documentId = parseInt(body.documentId);
    }
    if (body.companyName !== undefined) {
      if (body.companyName.trim() === '') {
        return NextResponse.json({ 
          error: "companyName cannot be empty",
          code: "INVALID_COMPANY_NAME" 
        }, { status: 400 });
      }
      updateData.companyName = body.companyName.trim();
    }
    if (body.fiscalYear !== undefined) {
      updateData.fiscalYear = parseInt(body.fiscalYear);
    }
    if (body.fiscalQuarter !== undefined) {
      updateData.fiscalQuarter = body.fiscalQuarter?.trim() || null;
    }
    if (body.revenue !== undefined) {
      updateData.revenue = parseOptionalNumber(body.revenue);
    }
    if (body.ebitda !== undefined) {
      updateData.ebitda = parseOptionalNumber(body.ebitda);
    }
    if (body.netIncome !== undefined) {
      updateData.netIncome = parseOptionalNumber(body.netIncome);
    }
    if (body.totalAssets !== undefined) {
      updateData.totalAssets = parseOptionalNumber(body.totalAssets);
    }
    if (body.totalLiabilities !== undefined) {
      updateData.totalLiabilities = parseOptionalNumber(body.totalLiabilities);
    }
    if (body.equity !== undefined) {
      updateData.equity = parseOptionalNumber(body.equity);
    }
    if (body.debtToEquityRatio !== undefined) {
      updateData.debtToEquityRatio = parseOptionalNumber(body.debtToEquityRatio);
    }
    if (body.roe !== undefined) {
      updateData.roe = parseOptionalNumber(body.roe);
    }
    if (body.currentRatio !== undefined) {
      updateData.currentRatio = parseOptionalNumber(body.currentRatio);
    }

    const updated = await db.update(financialMetrics)
      .set(updateData)
      .where(eq(financialMetrics.id, metricId))
      .returning();

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const metricId = parseInt(id);

    // Check if record exists
    const existingRecord = await db.select()
      .from(financialMetrics)
      .where(eq(financialMetrics.id, metricId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Financial metric not found',
        code: 'METRIC_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(financialMetrics)
      .where(eq(financialMetrics.id, metricId))
      .returning();

    return NextResponse.json({ 
      message: 'Financial metric deleted successfully',
      deletedRecord: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}