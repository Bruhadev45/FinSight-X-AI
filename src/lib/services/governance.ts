// Governance, Compliance & Ethics
import { AuditTrail, DataLineage, BiasMetric } from "@/lib/types/enterprise";

export class GovernanceService {
  private auditTrails: AuditTrail[] = [];

  async logAuditTrail(
    action: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, any>,
    request?: Request
  ): Promise<AuditTrail> {
    const trail: AuditTrail = {
      id: crypto.randomUUID(),
      action,
      userId,
      resourceType,
      resourceId,
      changes,
      ipAddress: request?.headers.get("x-forwarded-for") || "unknown",
      userAgent: request?.headers.get("user-agent") || "unknown",
      timestamp: new Date(),
    };

    // Store in memory (in production, would save to database)
    this.auditTrails.push(trail);
    console.log("[AUDIT]", trail);

    return trail;
  }

  getAuditLogs(userId?: string, action?: string): AuditTrail[] {
    let logs = this.auditTrails;

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    // Sort by most recent first
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  generateBiasReport(): {
    modelVersion: string;
    biasScore: number;
    fairnessMetrics: Record<string, any>;
    recommendations: string[];
  } {
    // Generate mock bias report (in production, would analyze actual model predictions)
    const biasScore = 0.15 + Math.random() * 0.3; // 0.15-0.45 range
    
    return {
      modelVersion: "v2.3.1",
      biasScore,
      fairnessMetrics: {
        "Demographic Parity": (0.85 + Math.random() * 0.15).toFixed(3),
        "Equal Opportunity": (0.90 + Math.random() * 0.08).toFixed(3),
        "Predictive Parity": (0.88 + Math.random() * 0.10).toFixed(3),
        "Calibration": (0.92 + Math.random() * 0.07).toFixed(3),
      },
      recommendations: [
        "Consider rebalancing training data to ensure equal representation",
        "Implement fairness constraints in model optimization",
        "Monitor predictions across demographic groups regularly",
        "Conduct periodic bias audits with diverse test sets",
      ],
    };
  }

  async trackDataLineage(
    dataId: string,
    sourceType: "upload" | "api" | "calculation" | "model_prediction",
    source: string,
    transformations: Array<{ operation: string }>
  ): Promise<DataLineage> {
    const lineage: DataLineage = {
      dataId,
      sourceType,
      source,
      transformations: transformations.map((t, idx) => ({
        step: idx + 1,
        operation: t.operation,
        timestamp: new Date(),
      })),
      downstream: [],
    };

    // In production, would save to graph database for lineage tracking
    console.log("[DATA LINEAGE]", lineage);

    return lineage;
  }

  async monitorBias(predictions: number[], sensitiveAttribute: string[]): Promise<BiasMetric[]> {
    // Simplified bias detection
    const metrics: BiasMetric[] = [];

    // Demographic parity
    const groupA = predictions.slice(0, Math.floor(predictions.length / 2));
    const groupB = predictions.slice(Math.floor(predictions.length / 2));

    const avgA = groupA.reduce((a, b) => a + b, 0) / groupA.length;
    const avgB = groupB.reduce((a, b) => a + b, 0) / groupB.length;

    const disparateImpact = avgB / (avgA + 1e-8);

    metrics.push({
      metric: "Disparate Impact Ratio",
      value: disparateImpact,
      threshold: 0.8,
      status: disparateImpact >= 0.8 && disparateImpact <= 1.25 ? "pass" : "warning",
      explanation: `Ratio of outcomes between groups: ${disparateImpact.toFixed(3)}. Should be between 0.8-1.25`,
    });

    // Equal opportunity difference
    const equalOppDiff = Math.abs(avgA - avgB);
    metrics.push({
      metric: "Equal Opportunity Difference",
      value: equalOppDiff,
      threshold: 0.1,
      status: equalOppDiff <= 0.1 ? "pass" : "warning",
      explanation: `Absolute difference in outcomes: ${equalOppDiff.toFixed(3)}. Should be ≤ 0.1`,
    });

    return metrics;
  }

  async maskSensitiveData(
    data: Record<string, any>,
    sensitiveFields: string[]
  ): Promise<Record<string, any>> {
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (typeof masked[field] === "string") {
          masked[field] = "***REDACTED***";
        } else if (typeof masked[field] === "number") {
          masked[field] = -1;
        }
      }
    }

    return masked;
  }

  async generateComplianceDashboard(auditTrails: AuditTrail[]) {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentTrails = auditTrails.filter((t) => t.timestamp >= last30Days);

    return {
      totalActions: recentTrails.length,
      actionsByType: this.groupBy(recentTrails, "action"),
      actionsByUser: this.groupBy(recentTrails, "userId"),
      suspiciousActivities: recentTrails.filter(
        (t) =>
          t.action.includes("delete") || t.action.includes("modify_sensitive")
      ),
      complianceScore: Math.min(
        100,
        95 + (recentTrails.filter((t) => t.changes).length / recentTrails.length) * 5
      ),
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const governanceService = new GovernanceService();