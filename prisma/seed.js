const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@hsi7.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const name = process.env.SEED_ADMIN_NAME || 'Admin User';

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('✓ Admin user already exists:', existing.email);
            return;
        }

        const hashed = await bcrypt.hash(password, 12);
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
        console.log('  Email:', admin.email);
        console.log('  Password:', password);
        console.log('  Please change the password after first login!');
    } catch (error) {
        console.error('✗ Error creating admin user:', error.message);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
