import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single company by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const company = await db.select()
        .from(companies)
        .where(eq(companies.id, parseInt(id)))
        .limit(1);

      if (company.length === 0) {
        return NextResponse.json({ 
          error: 'Company not found',
          code: 'COMPANY_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(company[0], { status: 200 });
    }

    // List companies with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const country = searchParams.get('country');

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(like(companies.name, `%${search}%`));
    }

    if (industry) {
      conditions.push(eq(companies.industry, industry));
    }

    if (country) {
      conditions.push(eq(companies.country, country));
    }

    const baseQuery = db.select().from(companies);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(companies.id))
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
    const { name, industry, tickerSymbol, country, lastAnalyzed, totalDocuments, avgRiskScore } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Company name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!industry || !industry.trim()) {
      return NextResponse.json({ 
        error: "Industry is required",
        code: "MISSING_INDUSTRY" 
      }, { status: 400 });
    }

    if (!country || !country.trim()) {
      return NextResponse.json({ 
        error: "Country is required",
        code: "MISSING_COUNTRY" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults
    const insertData: any = {
      name: name.trim(),
      industry: industry.trim(),
      country: country.trim(),
      totalDocuments: totalDocuments ?? 0,
    };

    // Add optional fields if provided
    if (tickerSymbol) {
      insertData.tickerSymbol = tickerSymbol.trim();
    }

    if (lastAnalyzed) {
      insertData.lastAnalyzed = lastAnalyzed;
    }

    if (avgRiskScore !== undefined && avgRiskScore !== null) {
      insertData.avgRiskScore = avgRiskScore;
    }

    const newCompany = await db.insert(companies)
      .values(insertData)
      .returning();

    return NextResponse.json(newCompany[0], { status: 201 });

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

    // Check if company exists
    const existing = await db.select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Company not found',
        code: 'COMPANY_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { name, industry, tickerSymbol, country, lastAnalyzed, totalDocuments, avgRiskScore } = body;

    // Validate if required fields are being updated
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({ 
        error: "Company name cannot be empty",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (industry !== undefined && (!industry || !industry.trim())) {
      return NextResponse.json({ 
        error: "Industry cannot be empty",
        code: "INVALID_INDUSTRY" 
      }, { status: 400 });
    }

    if (country !== undefined && (!country || !country.trim())) {
      return NextResponse.json({ 
        error: "Country cannot be empty",
        code: "INVALID_COUNTRY" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (industry !== undefined) {
      updateData.industry = industry.trim();
    }

    if (country !== undefined) {
      updateData.country = country.trim();
    }

    if (tickerSymbol !== undefined) {
      updateData.tickerSymbol = tickerSymbol ? tickerSymbol.trim() : null;
    }

    if (lastAnalyzed !== undefined) {
      updateData.lastAnalyzed = lastAnalyzed;
    }

    if (totalDocuments !== undefined) {
      updateData.totalDocuments = totalDocuments;
    }

    if (avgRiskScore !== undefined) {
      updateData.avgRiskScore = avgRiskScore;
    }

    const updated = await db.update(companies)
      .set(updateData)
      .where(eq(companies.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if company exists
    const existing = await db.select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Company not found',
        code: 'COMPANY_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(companies)
      .where(eq(companies.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Company deleted successfully',
      company: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}