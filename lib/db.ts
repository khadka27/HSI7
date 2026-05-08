// Dynamic import approach to handle build-time issues
let PrismaClient: any;
let PrismaPg: any;
let Pool: any;

try {
  // Try to import Prisma client
  const prismaModule = require("@prisma/client");
  PrismaClient = prismaModule.PrismaClient;
  
  const adapterModule = require("@prisma/adapter-pg");
  PrismaPg = adapterModule.PrismaPg;
  
  const pgModule = require("pg");
  Pool = pgModule.Pool;
} catch (error) {
  console.warn("Prisma client not available during build time:", error);
  // Create a mock client for build time
  PrismaClient = class MockPrismaClient {
    constructor() {}
    $disconnect() { return Promise.resolve(); }
  };
}

const connectionString = process.env.DATABASE_URL;

let prisma: any;

declare global {
  var __prisma: any | undefined;
}

if (process.env.NODE_ENV === "production") {
  if (connectionString && PrismaPg && Pool) {
    try {
      // Handle SSL certificate verification for cloud databases
      const poolConfig: any = { connectionString };
      if (connectionString.includes("postgresql://")) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }

      const pool = new Pool(poolConfig);
      const adapter = new PrismaPg(pool as any);
      prisma = new PrismaClient({ adapter });
    } catch (error) {
      console.warn("Failed to create Prisma client with adapter:", error);
      prisma = new PrismaClient();
    }
  } else {
    // Fallback for build time when DATABASE_URL is not available
    prisma = new PrismaClient();
  }
} else {
  if (!global.__prisma) {
    if (connectionString && PrismaPg && Pool) {
      try {
        const poolConfig: any = { connectionString };
        const pool = new Pool(poolConfig);
        const adapter = new PrismaPg(pool as any);
        global.__prisma = new PrismaClient({ adapter });
      } catch (error) {
        console.warn("Failed to create Prisma client with adapter:", error);
        global.__prisma = new PrismaClient();
      }
    } else {
      global.__prisma = new PrismaClient();
    }
  }
  prisma = global.__prisma;
}

export default prisma;
