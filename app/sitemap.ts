import type { MetadataRoute } from "next";
import prisma from "@/lib/db";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

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

  const [subcategories, products] = await Promise.all([
    prisma.subcategory.findMany({
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const subcategoryEntries = subcategories.map((subcategory) => ({
    url: `${baseUrl}/subcategory/${subcategory.slug}`,
    lastModified: subcategory.updatedAt ?? subcategory.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productEntries = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt ?? product.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...subcategoryEntries, ...productEntries];
}
