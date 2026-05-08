import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

let prisma: PrismaClient;
let pool: Pool;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
      globalForPrisma.pool = pool;
    }
  } else {
    // Fallback for build time when DATABASE_URL is not available
    prisma = {} as PrismaClient;
  }
}

export default prisma;
