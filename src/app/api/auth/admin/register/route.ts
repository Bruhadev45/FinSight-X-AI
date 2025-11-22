import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, account } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Admin registration code - in production, use environment variable
const ADMIN_REGISTRATION_CODE = "FINSIGHT_ADMIN_2024";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, adminCode } = await request.json();

    // Validate admin code
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
      return NextResponse.json(
        { error: "Invalid admin registration code" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (same as better-auth)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with admin role
    const userId = crypto.randomUUID();
    const now = new Date();

    await db.insert(user).values({
      id: userId,
      name,
      email,
      role: "admin",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create account entry for password - accountId should be the email for credential provider
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: email,
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { message: "Admin account created successfully", userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}