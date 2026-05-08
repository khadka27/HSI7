require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Initialize Prisma with adapter for version 7
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL is not set');
        process.exit(1);
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@hsi7.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const name = process.env.SEED_ADMIN_NAME || 'Admin User';

    try {
        // Check if admin user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('✓ Admin user already exists:', existing.email);
            return;
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 12);
        
        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashed,
                name,
                role: 'ADMIN',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        console.log('✓ Admin user created successfully:');
        console.log(`  Email: ${admin.email}`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Role: ${admin.role}`);
        
        console.log('\n✅ Database seed completed successfully!\n');
        console.log('📝 Admin Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n⚠️  Please change the password after first login!\n');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
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