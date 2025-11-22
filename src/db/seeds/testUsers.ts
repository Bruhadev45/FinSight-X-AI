import { db } from "../index";
import { user } from "../schema";
import { randomUUID } from "crypto";

export async function seedTestUsers() {
  console.log("🌱 Seeding test users...");

  try {
    // Insert admin user (password will be set via better-auth registration)
    await db.insert(user).values({
      id: randomUUID(),
      email: "admin@finsightx.com",
      name: "Admin User",
      role: "admin",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing();

    // Insert company user
    await db.insert(user).values({
      id: randomUUID(),
      email: "company@test.com",
      name: "Test Company User",
      role: "company",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing();

    console.log("✅ Test users seeded successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 Admin Portal (/admin/login):");
    console.log("   Email: admin@finsightx.com");
    console.log("   Password: Admin@123456");
    console.log("\n🏢 Company Portal (/company/login):");
    console.log("   Email: company@test.com");
    console.log("   Password: Company@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Error seeding test users:", error);
    throw error;
  }
}