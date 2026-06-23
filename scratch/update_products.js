require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const res = await prisma.product.updateMany({
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });
    console.log('Successfully updated products:', res);
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
