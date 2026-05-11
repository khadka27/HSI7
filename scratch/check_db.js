const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:khadka27@localhost:5432/hsi7?schema=public&sslmode=disable"
      }
    }
  });

  try {
    const cats = await prisma.category.findMany({ include: { subcategories: true } });
    console.log('Categories:', cats.length);
    
    const prods = await prisma.product.findMany();
    console.log('Total Products in DB:', prods.length);
    
    if (prods.length > 0) {
      console.log('Categories represented in products:', [...new Set(prods.map(p => p.categoryType))]);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
