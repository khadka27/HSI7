import type { MetadataRoute } from "next";
import products from "@/data/products.json";
import subcategories from "@/data/subcategories.json";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const subcategoryEntries = subcategories.map((subcategory) => ({
    url: `${baseUrl}/subcategory/${subcategory.slug}`,
    lastModified: new Date(subcategory.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productEntries = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...subcategoryEntries, ...productEntries];
}
