import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents, companies, reports, searchQueries } from '@/db/schema';
import { like, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, limit } = body;

    // Validate required query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Search query is required and must be a non-empty string',
          code: 'INVALID_QUERY' 
        },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const searchLimit = Math.min(parseInt(limit as string) || 10, 50);
    const searchPattern = `%${trimmedQuery}%`;

    // Search documents table
    const documentResults = await db
      .select()
      .from(documents)
      .where(
        or(
          like(documents.fileName, searchPattern),
          like(documents.summary, searchPattern)
        )
      )
      .limit(searchLimit);

    // Search companies table
    const companyResults = await db
      .select()
      .from(companies)
      .where(
        or(
          like(companies.name, searchPattern),
          like(companies.industry, searchPattern)
        )
      )
      .limit(searchLimit);

    // Search reports table
    const reportResults = await db
      .select()
      .from(reports)
      .where(
        or(
          like(reports.title, searchPattern),
          like(reports.content, searchPattern)
        )
      )
      .limit(searchLimit);

    // Limit content field to first 500 characters in report results
    const processedReportResults = reportResults.map(report => ({
      ...report,
      content: report.content.length > 500 
        ? report.content.substring(0, 500) + '...' 
        : report.content
    }));

    // Extract document IDs from results
    const relevantDocumentIds = documentResults.map(doc => doc.id);

    // Calculate total results count
    const totalResultsCount = 
      documentResults.length + 
      companyResults.length + 
      reportResults.length;

    // Log search query to database
    await db.insert(searchQueries).values({
      queryText: trimmedQuery,
      resultsCount: totalResultsCount,
      relevantDocuments: JSON.stringify(relevantDocumentIds),
      userId: userId || null,
      executedAt: new Date().toISOString()
    });

    // Return search results
    return NextResponse.json({
      query: trimmedQuery,
      resultsCount: totalResultsCount,
      results: {
        documents: documentResults,
        companies: companyResults,
        reports: processedReportResults
      },
      relevantDocuments: relevantDocumentIds
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}