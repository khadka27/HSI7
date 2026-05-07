import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn(
      "Warning: DATABASE_URL is not set. Set it to your Postgres connection string.",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  const email = process.env.SEED_ADMIN_EMAIL || "admin@hsi7.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const name = process.env.SEED_ADMIN_NAME || "Admin User";

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("Admin user already exists:", existing.email);
      return;
    }

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

    console.log("Admin user created successfully:");
    console.log("Email:", admin.email);
    console.log("Password:", password);
    console.log("Please change the password after first login!");
  } catch (error) {
    console.error("Error creating admin user:", error);
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
