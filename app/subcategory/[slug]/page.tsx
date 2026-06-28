"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import { CategorySchema, BreadcrumbSchema } from "@/components/SEOSchema";
import type { Product, Subcategory } from "@/lib/types";
import { PackageSearch } from "lucide-react";

export default function SubcategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/subcategories`)
      .then((r) => r.json())
      .then((subs: Subcategory[]) => {
        const sub = subs.find((s) => s.slug === slug);
        if (!sub) {
          setError("Subcategory not found");
          setLoading(false);
          return;
        }
        setSubcategory(sub);
        return fetch(`/api/products?subcategoryId=${sub.id}`).then((r) =>
          r.json(),
        );
      })
      .then((data?: { products: Product[] }) => {
        if (data?.products) setProducts(data.products);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <main className="min-h-screen">
      {subcategory && (
        <>
          <CategorySchema
            name={subcategory.name}
            description={subcategory.description || ""}
            image={subcategory.image || ""}
            url={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/subcategory/${subcategory.slug}`}
          />
          <BreadcrumbSchema
            items={[
              {
                name: "Home",
                url:
                  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              },
              {
                name: subcategory.categoryType === "nutra" ? "Nutra" : "Ecom",
                url:
                  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              },
              {
                name: subcategory.name,
                url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/subcategory/${subcategory.slug}`,
              },
            ]}
          />
        </>
      )}
      {/* Subcategory Hero */}
      {subcategory && (
        <section className="relative h-48 sm:h-60 md:h-72 overflow-hidden mx-3 mt-4 sm:mx-4 sm:mt-6 rounded-2xl sm:rounded-[2rem] border border-white/30 shadow-2xl shadow-blue-950/15 max-w-[1320px] lg:mx-auto">
          <img
            src={subcategory.image}
            alt={subcategory.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
            <div className="max-w-[1320px] mx-auto">
              <Breadcrumb
                crumbs={[
                  { label: "Home", href: "/" },
                  { label: subcategory.categoryType === "nutra" ? "Nutra" : "Ecom", href: "/" },
                  { label: subcategory.name },
                ]}
              />
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white mt-2 sm:mt-3 drop-shadow-md tracking-tight">
                {subcategory.name}
              </h1>
              <p className="text-white/85 text-xs sm:text-sm md:text-base mt-1 sm:mt-2 max-w-2xl line-clamp-2">
                {subcategory.description}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1320px] mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        {/* Toggle */}
        <div className="glass-band rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <p className="text-xs sm:text-sm text-slate-600">
            {loading ? "..." : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {error && (
          <div className="surface-shell rounded-3xl text-center py-16">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !error && products.length === 0 ? (
          <div className="surface-shell rounded-2xl sm:rounded-3xl text-center py-16 sm:py-20">
            <PackageSearch className="w-12 h-12 sm:w-14 sm:h-14 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              No products in this subcategory yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
