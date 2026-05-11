const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: 'test-3' }
    });
    console.log(product ? `Product exists: ${product.name}` : 'Product not found');
    
    const allProducts = await prisma.product.findMany({ take: 5 });
    console.log('Sample products:', allProducts.map(p => p.slug));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
