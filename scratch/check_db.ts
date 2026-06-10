import prisma from "../lib/db";

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      detailedDescription: true,
    }
  });
  console.log(`Found ${products.length} products`);
  for (const p of products) {
    console.log(`- Product: ${p.name} (${p.slug})`);
  }

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
    }
  });
  console.log(`Found ${articles.length} articles`);
  for (const a of articles) {
    console.log(`- Article: ${a.title} (${a.slug})`);
    console.log("-----------------------------------------");
    console.log(a.content.substring(0, 1000));
    console.log("-----------------------------------------");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
