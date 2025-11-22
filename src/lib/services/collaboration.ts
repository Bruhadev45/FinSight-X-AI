// Collaboration & Human-in-the-Loop
import { Annotation, ApprovalQueue } from "@/lib/types/enterprise";

export class CollaborationService {
  private annotations: Map<string, Annotation[]> = new Map();
  private approvalQueues: Map<string, ApprovalQueue[]> = new Map();

  // Annotations
  async addAnnotation(annotation: Omit<Annotation, "id" | "createdAt">): Promise<Annotation> {
    const fullAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const docAnnotations = this.annotations.get(annotation.documentId) || [];
    docAnnotations.push(fullAnnotation);
    this.annotations.set(annotation.documentId, docAnnotations);

    return fullAnnotation;
  }

  async getAnnotations(documentId: string): Promise<Annotation[]> {
    return this.annotations.get(documentId) || [];
  }

  async resolveAnnotation(annotationId: string): Promise<void> {
    for (const [docId, annotations] of this.annotations.entries()) {
      const annotation = annotations.find((a) => a.id === annotationId);
      if (annotation) {
        annotation.status = "resolved";
        annotation.resolvedAt = new Date();
        break;
      }
    }
  }

  // Approval Queue
  async addToApprovalQueue(
    item: Omit<ApprovalQueue, "id" | "status">
  ): Promise<ApprovalQueue> {
    const queueItem: ApprovalQueue = {
      ...item,
      id: crypto.randomUUID(),
      status: "pending",
    };

    const typeQueue = this.approvalQueues.get(item.type) || [];
    typeQueue.push(queueItem);
    this.approvalQueues.set(item.type, typeQueue);

    return queueItem;
  }

  async getApprovalQueue(
    type?: ApprovalQueue["type"],
    status?: ApprovalQueue["status"]
  ): Promise<ApprovalQueue[]> {
    let items: ApprovalQueue[] = [];

    if (type) {
      items = this.approvalQueues.get(type) || [];
    } else {
      items = Array.from(this.approvalQueues.values()).flat();
    }

    if (status) {
      items = items.filter((i) => i.status === status);
    }

    return items;
  }

  async approveItem(
    itemId: string,
    reviewedBy: string,
    comments?: string
  ): Promise<void> {
    for (const [type, items] of this.approvalQueues.entries()) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        item.status = "approved";
        item.reviewedBy = reviewedBy;
        item.reviewedAt = new Date();
        item.comments = comments;
        break;
      }
    }
  }

  async rejectItem(
    itemId: string,
    reviewedBy: string,
    comments: string
  ): Promise<void> {
    for (const [type, items] of this.approvalQueues.entries()) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        item.status = "rejected";
        item.reviewedBy = reviewedBy;
        item.reviewedAt = new Date();
        item.comments = comments;
        break;
      }
    }
  }

  // Feedback loop for model retraining
  async submitFeedback(
    findingId: string,
    feedback: "accurate" | "incomplete" | "wrong",
    userId: string,
    details?: string
  ): Promise<{ id: string; recorded: boolean }> {
    // In production, this would:
    // 1. Store feedback in database
    // 2. Queue for model retraining if threshold reached
    // 3. Update model confidence scores

    const feedbackRecord = {
      id: crypto.randomUUID(),
      findingId,
      feedback,
      userId,
      details,
      timestamp: new Date(),
    };

    console.log("[FEEDBACK]", feedbackRecord);

    return {
      id: feedbackRecord.id,
      recorded: true,
    };
  }

  // Real-time collaboration tracking
  async trackActiveUsers(documentId: string): Promise<string[]> {
    // In production, would use WebSockets/Redis for real-time tracking
    // For now, return mock data
    return ["user-1", "user-2"];
  }

  async notifyCollaborators(
    documentId: string,
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    // In production, would broadcast via WebSocket
    console.log("[COLLABORATION EVENT]", {
      documentId,
      userId,
      action,
      details,
      timestamp: new Date(),
    });
  }
}

export const collaborationService = new CollaborationService();
