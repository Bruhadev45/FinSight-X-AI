import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, account, session } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, adminCode } = await request.json();

    // Require admin code for security
    if (adminCode !== "FINSIGHT_ADMIN_2024") {
      return NextResponse.json(
        { error: "Invalid admin code" },
        { status: 403 }
      );
    }

    // Find user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { message: "No user found with this email" },
        { status: 404 }
      );
    }

    const userId = existingUser[0].id;

    // Delete related records first (foreign key constraints)
    await db.delete(session).where(eq(session.userId, userId));
    await db.delete(account).where(eq(account.userId, userId));
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json(
      { message: "User account deleted successfully", email },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
