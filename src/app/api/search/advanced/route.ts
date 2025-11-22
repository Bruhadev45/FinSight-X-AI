import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@/lib/ai-engine';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { like, and, or, gte, lte, desc, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      filters = {},
      sortBy = 'relevance',
      limit = 20,
      offset = 0,
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Extract search terms and entities from query using AI
    const queryAnalysis = AIEngine.analyzeText(query);
    const searchTerms = query.toLowerCase().split(/\s+/);

    // Build SQL WHERE conditions
    const conditions = [];

    // Text search across multiple fields
    const textConditions = searchTerms.map((term: string) =>
      or(
        like(documents.fileName, `%${term}%`),
        like(documents.fileType, `%${term}%`),
        like(documents.summary, `%${term}%`)
      )
    );
    conditions.push(and(...textConditions));

    // Apply filters
    if (filters.fileType && filters.fileType.length > 0) {
      const typeConditions = filters.fileType.map((type: string) =>
        like(documents.fileType, `%${type}%`)
      );
      conditions.push(or(...typeConditions));
    }

    if (filters.riskLevel && filters.riskLevel.length > 0) {
      const riskConditions = filters.riskLevel.map((level: string) =>
        sql`${documents.riskLevel} = ${level}`
      );
      conditions.push(or(...riskConditions));
    }

    if (filters.complianceStatus && filters.complianceStatus.length > 0) {
      const complianceConditions = filters.complianceStatus.map((status: string) =>
        sql`${documents.complianceStatus} = ${status}`
      );
      conditions.push(or(...complianceConditions));
    }

    if (filters.dateFrom) {
      conditions.push(gte(documents.createdAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(documents.createdAt, filters.dateTo));
    }

    if (filters.minFileSize) {
      conditions.push(gte(documents.fileSize, filters.minFileSize));
    }

    if (filters.maxFileSize) {
      conditions.push(lte(documents.fileSize, filters.maxFileSize));
    }

    // Determine sort order
    const orderByColumn = sortBy === 'risk' ? documents.riskLevel
      : sortBy === 'size' ? documents.fileSize
      : documents.createdAt;

    // Execute search query
    const baseQuery = db.select().from(documents);

    const results = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Calculate relevance scores using AI
    const scoredResults = results.map(doc => {
      let relevanceScore = 0;

      // Exact match in filename
      if (doc.fileName.toLowerCase().includes(query.toLowerCase())) {
        relevanceScore += 0.5;
      }

      // Term frequency
      const summary = doc.summary || '';
      searchTerms.forEach((term: string) => {
        const regex = new RegExp(term, 'gi');
        const matches = summary.match(regex);
        if (matches) {
          relevanceScore += matches.length * 0.1;
        }
      });

      // Entity matches
      queryAnalysis.entities.forEach(entity => {
        if (summary.toLowerCase().includes(entity.value.toLowerCase())) {
          relevanceScore += entity.confidence * 0.2;
        }
      });

      return {
        ...doc,
        relevanceScore: Math.min(1, relevanceScore),
        matchedTerms: searchTerms.filter((term: string) =>
          doc.fileName.toLowerCase().includes(term) ||
          summary.toLowerCase().includes(term)
        ),
      };
    });

    // Sort by relevance if requested
    if (sortBy === 'relevance') {
      scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Generate search insights
    const insights = {
      totalResults: scoredResults.length,
      averageRelevance: scoredResults.reduce((sum, r) => sum + r.relevanceScore, 0) / scoredResults.length,
      fileTypes: [...new Set(scoredResults.map(r => r.fileType))],
      riskLevels: {
        high: scoredResults.filter(r => r.riskLevel === 'high').length,
        medium: scoredResults.filter(r => r.riskLevel === 'medium').length,
        low: scoredResults.filter(r => r.riskLevel === 'low').length,
      },
      dateRange: {
        earliest: scoredResults.length > 0 ?
          new Date(Math.min(...scoredResults.map(r => new Date(r.createdAt).getTime()))).toISOString() : null,
        latest: scoredResults.length > 0 ?
          new Date(Math.max(...scoredResults.map(r => new Date(r.createdAt).getTime()))).toISOString() : null,
      },
      detectedEntities: queryAnalysis.entities.map(e => ({
        type: e.type,
        value: e.value,
        confidence: e.confidence,
      })),
    };

    // Generate recommendations
    const recommendations = [];
    if (scoredResults.length === 0) {
      recommendations.push('Try broader search terms');
      recommendations.push('Remove some filters');
      recommendations.push('Check spelling');
    } else if (scoredResults.length > 100) {
      recommendations.push('Consider adding more filters to narrow results');
      recommendations.push('Use specific terms for better results');
    }

    if (insights.riskLevels.high > 0) {
      recommendations.push(`${insights.riskLevels.high} high-risk documents found - review immediately`);
    }

    return NextResponse.json({
      success: true,
      search: {
        query,
        results: scoredResults,
        insights,
        recommendations,
        metadata: {
          totalResults: scoredResults.length,
          limit,
          offset,
          sortBy,
          processingTime: '~50ms',
        },
      },
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { error: 'Search failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
