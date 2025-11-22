import { NextRequest, NextResponse } from "next/server";
import { governanceService } from "@/lib/services/governance";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "15");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    const auditLogs = governanceService.getAuditLogs(
      userId || undefined,
      action || undefined
    );

    // Convert to the format expected by the frontend
    const formattedLogs = auditLogs.slice(0, limit).map(log => ({
      id: Math.floor(Math.random() * 100000), // Generate numeric ID
      eventType: log.action,
      userId: log.userId,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      details: log.changes,
      timestamp: log.timestamp.toISOString(),
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to retrieve audit logs" },
      { status: 500 }
    );
  }
}