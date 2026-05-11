const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({
    include: { subcategory: true }
  });
  console.log('Total products:', products.length);
  console.log('Products:', JSON.stringify(products, null, 2));
  process.exit(0);
}

check();
