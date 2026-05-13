import type { MetadataRoute } from "next";

const baseUrl = "https://healthstoreinfo7.top";

const staticPages = [
  "",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
  "/legal/refunds",
  "/legal/shipping",
  "/legal/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  let subcategoryEntries: MetadataRoute.Sitemap = [];
  let productEntries: MetadataRoute.Sitemap = [];

  // Skip database queries if DATABASE_URL is not available (build-time)
  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL not set during sitemap generation, using static pages only",
    );
    return staticEntries;
  }

  try {
    // Lazy import to avoid connection errors during build
    const prisma = (await import("@/lib/db")).default;

    const [subcategories, products, articles] = await Promise.all([
      prisma.subcategory.findMany({
        select: { slug: true, updatedAt: true, createdAt: true },
      }),
      prisma.product.findMany({
        select: { slug: true, updatedAt: true, createdAt: true },
      }),
      (prisma as any).article.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
    ]);

    subcategoryEntries = subcategories.map((subcategory: { slug: string; updatedAt: Date | null; createdAt: Date }) => ({
      url: `${baseUrl}/subcategory/${subcategory.slug}`,
      lastModified: subcategory.updatedAt ?? subcategory.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    productEntries = products.map((product: { slug: string; updatedAt: Date | null; createdAt: Date }) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ?? product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const articleEntries: MetadataRoute.Sitemap = articles.map((a: { slug: string; updatedAt: Date; publishedAt: Date | null }) => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticEntries, ...subcategoryEntries, ...productEntries, ...articleEntries];
  } catch (error) {
    console.warn("Database unavailable during sitemap generation, using static pages only", error);
    return staticEntries;
  }
}
