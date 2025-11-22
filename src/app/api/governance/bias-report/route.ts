import { NextRequest, NextResponse } from "next/server";
import { governanceService } from "@/lib/services/governance";

export async function GET(request: NextRequest) {
  try {
    const biasReport = governanceService.generateBiasReport();

    return NextResponse.json(biasReport);
  } catch (error) {
    console.error("Bias report error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate bias report" },
      { status: 500 }
    );
  }
}