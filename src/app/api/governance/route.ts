// Governance, Compliance & Ethics API
import { NextRequest, NextResponse } from "next/server";
import { governanceService } from "@/lib/services/governance";

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case "logAuditTrail":
        const trail = await governanceService.logAuditTrail(
          params.action,
          params.userId,
          params.resourceType,
          params.resourceId,
          params.changes,
          request
        );
        return NextResponse.json({ success: true, trail });

      case "trackDataLineage":
        const lineage = await governanceService.trackDataLineage(
          params.dataId,
          params.sourceType,
          params.source,
          params.transformations
        );
        return NextResponse.json({ success: true, lineage });

      case "monitorBias":
        const biasMetrics = await governanceService.monitorBias(
          params.predictions,
          params.sensitiveAttribute
        );
        return NextResponse.json({ success: true, biasMetrics });

      case "maskSensitiveData":
        const maskedData = await governanceService.maskSensitiveData(
          params.data,
          params.sensitiveFields
        );
        return NextResponse.json({ success: true, maskedData });

      case "generateComplianceDashboard":
        const dashboard = await governanceService.generateComplianceDashboard(
          params.auditTrails || []
        );
        return NextResponse.json({ success: true, dashboard });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Governance error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Governance operation failed" },
      { status: 500 }
    );
  }
}
