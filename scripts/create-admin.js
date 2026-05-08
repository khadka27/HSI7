const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('? DATABASE_URL is missing. Add it to .env before seeding.');
  process.exit(1);
}

// Add SSL configuration if using PostgreSQL with SSL
let poolConfig = { connectionString };
if (connectionString.includes('postgresql://') || connectionString.includes('postgres://')) {
  // Handle SSL certificate verification for cloud databases
  poolConfig = {
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }  // For cloud databases with self-signed certs
      : undefined,
  };
}

const pool = new Pool(poolConfig);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function createAdmin() {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@hsi7.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const name = process.env.SEED_ADMIN_NAME || 'Admin User';

    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      console.log('? Admin user already exists!');
      console.log('  Email:', existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('? Admin user created successfully:');
    console.log('  Email:', admin.email);
    console.log('  Password: admin123');
    console.log('  Please change the password after first login!');
  } catch (error) {
    console.error('? Error creating admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdmin();
