import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents, alerts, companies } from '@/db/schema';
import { eq, desc, and, sql, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const timeSegment = searchParams.get('timeSegment') || 'weekly';

    // Calculate time filter based on segment
    const now = new Date();
    let timeFilter: Date;
    
    switch (timeSegment) {
      case 'daily':
        timeFilter = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        timeFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        timeFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        timeFilter = new Date(now.setDate(now.getDate() - 7));
    }

    // Build base conditions for filtering
    const docConditions = [];
    if (companyId) {
      docConditions.push(eq(documents.companyId, parseInt(companyId)));
    }
    docConditions.push(gte(documents.createdAt, timeFilter.toISOString()));

    const alertConditions = [];
    if (companyId) {
      alertConditions.push(eq(alerts.companyId, parseInt(companyId)));
    }
    alertConditions.push(gte(alerts.triggeredAt, timeFilter.toISOString()));

    // Get total documents count
    const totalDocumentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(docConditions.length > 0 ? and(...docConditions) : undefined);
    const totalDocuments = totalDocumentsResult[0]?.count || 0;

    // Get documents grouped by status
    const documentsByStatusResult = await db
      .select({
        status: documents.status,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(docConditions.length > 0 ? and(...docConditions) : undefined)
      .groupBy(documents.status);

    const documentsByStatus = documentsByStatusResult.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // Ensure all statuses are present
    const allStatuses = ['processing', 'completed', 'failed'];
    allStatuses.forEach(status => {
      if (!(status in documentsByStatus)) {
        documentsByStatus[status] = 0;
      }
    });

    // Get documents grouped by risk level
    const riskConditions = [...docConditions, sql`${documents.riskLevel} IS NOT NULL`];
    const documentsByRiskResult = await db
      .select({
        riskLevel: documents.riskLevel,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(and(...riskConditions))
      .groupBy(documents.riskLevel);

    const documentsByRisk = documentsByRiskResult.reduce((acc, row) => {
      if (row.riskLevel) {
        acc[row.riskLevel] = row.count;
      }
      return acc;
    }, {} as Record<string, number>);

    // Ensure all risk levels are present
    const allRiskLevels = ['low', 'medium', 'high'];
    allRiskLevels.forEach(level => {
      if (!(level in documentsByRisk)) {
        documentsByRisk[level] = 0;
      }
    });

    // Get total alerts count
    const totalAlertsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(alertConditions.length > 0 ? and(...alertConditions) : undefined);
    const totalAlerts = totalAlertsResult[0]?.count || 0;

    // Get alerts grouped by severity
    const alertsBySeverityResult = await db
      .select({
        severity: alerts.severity,
        count: sql<number>`count(*)`
      })
      .from(alerts)
      .where(alertConditions.length > 0 ? and(...alertConditions) : undefined)
      .groupBy(alerts.severity);

    const alertsBySeverity = alertsBySeverityResult.reduce((acc, row) => {
      acc[row.severity] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // Ensure all severities are present
    const allSeverities = ['low', 'medium', 'high', 'critical'];
    allSeverities.forEach(severity => {
      if (!(severity in alertsBySeverity)) {
        alertsBySeverity[severity] = 0;
      }
    });

    // Get unread alerts count
    const unreadConditions = [...alertConditions, eq(alerts.status, 'unread')];
    const unreadAlertsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(and(...unreadConditions));
    const unreadAlerts = unreadAlertsResult[0]?.count || 0;

    // Get total companies count (only if not company-specific)
    let totalCompanies = 0;
    let avgDocumentsPerCompany = 0;
    
    if (!companyId) {
      const totalCompaniesResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(companies);
      totalCompanies = totalCompaniesResult[0]?.count || 0;

      if (totalCompanies > 0) {
        avgDocumentsPerCompany = Math.round((totalDocuments / totalCompanies) * 100) / 100;
      }
    }

    // Get recent documents
    const recentDocuments = await db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        fileType: documents.fileType,
        status: documents.status,
        riskLevel: documents.riskLevel,
        uploadedAt: documents.uploadDate,
        createdAt: documents.createdAt
      })
      .from(documents)
      .where(docConditions.length > 0 ? and(...docConditions) : undefined)
      .orderBy(desc(documents.createdAt))
      .limit(10);

    // Get recent alerts
    const recentAlerts = await db
      .select({
        id: alerts.id,
        alertType: alerts.alertType,
        severity: alerts.severity,
        title: alerts.title,
        description: alerts.description,
        sourceDocumentId: alerts.sourceDocumentId,
        status: alerts.status,
        triggeredAt: alerts.triggeredAt
      })
      .from(alerts)
      .where(alertConditions.length > 0 ? and(...alertConditions) : undefined)
      .orderBy(desc(alerts.triggeredAt))
      .limit(10);

    return NextResponse.json({
      totalDocuments,
      documentsByStatus,
      documentsByRisk,
      totalAlerts,
      alertsBySeverity,
      unreadAlerts,
      totalCompanies,
      avgDocumentsPerCompany,
      recentDocuments,
      recentAlerts,
      timeSegment,
      timeFilter: timeFilter.toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('GET dashboard stats error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}