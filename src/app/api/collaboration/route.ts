// Collaboration & Human-in-the-Loop API
import { NextRequest, NextResponse } from "next/server";
import { collaborationService } from "@/lib/services/collaboration";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get annotations for a document
    if (documentId) {
      const annotations = await collaborationService.getAnnotations(
        documentId
      );
      return NextResponse.json({ success: true, annotations });
    }

    // Get approval queue
    const queue = await collaborationService.getApprovalQueue(
      (type as "fraud_detection" | "compliance_issue" | "risk_alert" | undefined) || undefined,
      (status as "pending" | "approved" | "rejected" | undefined) || undefined
    );
    
    return NextResponse.json({ 
      success: true, 
      queue: queue.slice(0, limit),
      total: queue.length
    });
  } catch (error) {
    console.error("Collaboration GET error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to retrieve collaboration data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case "addAnnotation":
        const annotation = await collaborationService.addAnnotation(params);
        return NextResponse.json({ success: true, annotation });

      case "getAnnotations":
        const annotations = await collaborationService.getAnnotations(
          params.documentId
        );
        return NextResponse.json({ success: true, annotations });

      case "resolveAnnotation":
        await collaborationService.resolveAnnotation(params.annotationId);
        return NextResponse.json({ success: true, resolved: true });

      case "addToApprovalQueue":
        const queueItem = await collaborationService.addToApprovalQueue(params);
        return NextResponse.json({ success: true, item: queueItem });

      case "getApprovalQueue":
        const queue = await collaborationService.getApprovalQueue(
          params.type,
          params.status
        );
        return NextResponse.json({ success: true, queue });

      case "approveItem":
        await collaborationService.approveItem(
          params.itemId,
          params.reviewedBy,
          params.comments
        );
        return NextResponse.json({ success: true, approved: true });

      case "rejectItem":
        await collaborationService.rejectItem(
          params.itemId,
          params.reviewedBy,
          params.comments
        );
        return NextResponse.json({ success: true, rejected: true });

      case "submitFeedback":
        const feedbackResult = await collaborationService.submitFeedback(
          params.findingId,
          params.feedback,
          params.userId,
          params.details
        );
        return NextResponse.json({ success: true, feedback: feedbackResult });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Collaboration error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Collaboration operation failed" },
      { status: 500 }
    );
  }
}