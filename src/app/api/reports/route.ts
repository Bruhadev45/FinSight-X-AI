import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_REPORT_TYPES = ['investor_memo', 'credit_analysis', 'management_summary'];
const VALID_FORMATS = ['pdf', 'presentation', 'markdown'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single report by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        }, { status: 400 });
      }

      const report = await db.select()
        .from(reports)
        .where(eq(reports.id, parseInt(id)))
        .limit(1);

      if (report.length === 0) {
        return NextResponse.json({
          error: 'Report not found',
          code: 'REPORT_NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(report[0], { status: 200 });
    }

    // List reports with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('userId');
    const reportType = searchParams.get('reportType');
    const format = searchParams.get('format');

    // Validate filters
    if (reportType && !VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json({
        error: `Invalid reportType. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`,
        code: 'INVALID_REPORT_TYPE'
      }, { status: 400 });
    }

    if (format && !VALID_FORMATS.includes(format)) {
      return NextResponse.json({
        error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}`,
        code: 'INVALID_FORMAT'
      }, { status: 400 });
    }

    // Build query with filters
    const conditions = [];
    if (userId) {
      conditions.push(eq(reports.userId, userId));
    }
    if (reportType) {
      conditions.push(eq(reports.reportType, reportType));
    }
    if (format) {
      conditions.push(eq(reports.format, format));
    }

    const baseQuery = db.select().from(reports);
    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(reports.generatedAt))
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
    const { reportType, title, content, format, userId, sourceDocuments, citations } = body;

    // Validate required fields
    if (!reportType) {
      return NextResponse.json({
        error: 'reportType is required',
        code: 'MISSING_REPORT_TYPE'
      }, { status: 400 });
    }

    if (!VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json({
        error: `Invalid reportType. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`,
        code: 'INVALID_REPORT_TYPE'
      }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({
        error: 'title is required',
        code: 'MISSING_TITLE'
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({
        error: 'content is required',
        code: 'MISSING_CONTENT'
      }, { status: 400 });
    }

    if (!format) {
      return NextResponse.json({
        error: 'format is required',
        code: 'MISSING_FORMAT'
      }, { status: 400 });
    }

    if (!VALID_FORMATS.includes(format)) {
      return NextResponse.json({
        error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}`,
        code: 'INVALID_FORMAT'
      }, { status: 400 });
    }

    // Validate JSON arrays if provided
    if (sourceDocuments !== undefined && sourceDocuments !== null) {
      if (!Array.isArray(sourceDocuments)) {
        return NextResponse.json({
          error: 'sourceDocuments must be an array',
          code: 'INVALID_SOURCE_DOCUMENTS'
        }, { status: 400 });
      }
    }

    if (citations !== undefined && citations !== null) {
      if (!Array.isArray(citations)) {
        return NextResponse.json({
          error: 'citations must be an array',
          code: 'INVALID_CITATIONS'
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const insertData: any = {
      reportType: reportType.trim(),
      title: title.trim(),
      content: content.trim(),
      format: format.trim(),
      generatedAt: new Date().toISOString(),
    };

    if (userId) {
      insertData.userId = userId.trim();
    }

    if (sourceDocuments !== undefined && sourceDocuments !== null) {
      insertData.sourceDocuments = sourceDocuments;
    }

    if (citations !== undefined && citations !== null) {
      insertData.citations = citations;
    }

    const newReport = await db.insert(reports)
      .values(insertData)
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });
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
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { reportType, title, content, format, userId, sourceDocuments, citations } = body;

    // Check if report exists
    const existingReport = await db.select()
      .from(reports)
      .where(eq(reports.id, parseInt(id)))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json({
        error: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      }, { status: 404 });
    }

    // Validate reportType if provided
    if (reportType && !VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json({
        error: `Invalid reportType. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`,
        code: 'INVALID_REPORT_TYPE'
      }, { status: 400 });
    }

    // Validate format if provided
    if (format && !VALID_FORMATS.includes(format)) {
      return NextResponse.json({
        error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}`,
        code: 'INVALID_FORMAT'
      }, { status: 400 });
    }

    // Validate JSON arrays if provided
    if (sourceDocuments !== undefined && sourceDocuments !== null) {
      if (!Array.isArray(sourceDocuments)) {
        return NextResponse.json({
          error: 'sourceDocuments must be an array',
          code: 'INVALID_SOURCE_DOCUMENTS'
        }, { status: 400 });
      }
    }

    if (citations !== undefined && citations !== null) {
      if (!Array.isArray(citations)) {
        return NextResponse.json({
          error: 'citations must be an array',
          code: 'INVALID_CITATIONS'
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (reportType !== undefined) {
      updateData.reportType = reportType.trim();
    }
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (content !== undefined) {
      updateData.content = content.trim();
    }
    if (format !== undefined) {
      updateData.format = format.trim();
    }
    if (userId !== undefined) {
      updateData.userId = userId ? userId.trim() : null;
    }
    if (sourceDocuments !== undefined) {
      updateData.sourceDocuments = sourceDocuments;
    }
    if (citations !== undefined) {
      updateData.citations = citations;
    }

    const updated = await db.update(reports)
      .set(updateData)
      .where(eq(reports.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Failed to update report',
        code: 'UPDATE_FAILED'
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
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // Check if report exists
    const existingReport = await db.select()
      .from(reports)
      .where(eq(reports.id, parseInt(id)))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json({
        error: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(reports)
      .where(eq(reports.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({
        error: 'Failed to delete report',
        code: 'DELETE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Report deleted successfully',
      deletedReport: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}