import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  // Handle SSL for cloud databases
  const poolConfig: any = { connectionString: databaseUrl };
  if (databaseUrl.includes("postgresql://")) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(poolConfig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Starting database seed...\n");

  const email = process.env.SEED_ADMIN_EMAIL || "admin@hsi7.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const name = process.env.SEED_ADMIN_NAME || "Admin User";

  try {
    // Create admin user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("✓ Admin user already exists:", existing.email);
    } else {
      const hashed = await bcrypt.hash(password, 12);
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name,
          role: "ADMIN",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      console.log("✓ Admin user created successfully:");
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  Role: ${admin.role}`);
    }

    console.log("\n✅ Database seed completed successfully!\n");
    console.log("📝 Admin Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n⚠️  Please change the password after first login!\n");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
