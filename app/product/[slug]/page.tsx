"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import type { Product, Subcategory } from "@/lib/types";
import { ExternalLink, Tag, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products`)
      .then((r) => r.json())
      .then(async (products: Product[]) => {
        const prod = products.find((p) => p.slug === slug);
        if (!prod) {
          setError("Product not found");
          return;
        }
        setProduct(prod);
        const subs: Subcategory[] = await fetch("/api/subcategories").then(
          (r) => r.json(),
        );
        const sub = subs.find((s) => s.id === prod.subcategoryId);
        if (sub) setSubcategory(sub);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-emerald-100 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-emerald-100 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-emerald-100 rounded w-3/4" />
                <div className="h-6 bg-emerald-100 rounded w-1/4" />
                <div className="h-4 bg-emerald-100 rounded w-full" />
                <div className="h-4 bg-emerald-100 rounded w-full" />
                <div className="h-4 bg-emerald-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="surface-shell rounded-3xl text-center p-10 max-w-lg w-full">
          <p className="text-red-500 text-lg mb-4">
            {error || "Product not found"}
          </p>
          <Link href="/" className="text-emerald-700 font-semibold underline">
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 glass-band rounded-2xl px-4 py-3">
          <Breadcrumb
            crumbs={[
              { label: "Home", href: "/" },
              {
                label: product.categoryType === "nutra" ? "Nutra" : "Ecom",
                href: "/",
              },
              ...(subcategory
                ? [
                    {
                      label: subcategory.name,
                      href: `/subcategory/${subcategory.slug}`,
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />
        </div>

        {/* Back button */}
        <Link
          href={subcategory ? `/subcategory/${subcategory.slug}` : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden surface-shell">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Featured Image */}
            <div className="aspect-[1200/680] rounded-2xl overflow-hidden surface-shell">
              <img
                src={product.featuredImage}
                alt={`${product.name} featured`}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              Featured image (1200x680)
            </p>
          </div>

          {/* Info */}
          <div className="space-y-5 surface-shell rounded-3xl p-6 md:p-8 h-fit">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  product.categoryType === "nutra"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {product.categoryType === "nutra" ? "Nutra" : "Ecom"}
              </span>
              {subcategory && (
                <span className="flex items-center gap-1 text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full bg-white/75">
                  <Tag className="w-3 h-3" /> {subcategory.name}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-emerald-700">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-slate-700 text-base leading-relaxed border-l-4 border-emerald-600 pl-4 italic">
              {product.shortDescription}
            </p>

            <div className="border-t border-emerald-100 pt-5">
              <h2 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
                Product Details
              </h2>
              <p className="text-slate-700 text-sm md:text-base leading-loose whitespace-pre-line">
                {product.detailedDescription}
              </p>
            </div>

            {product.readMoreLink && (
              <a
                href={product.readMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <ExternalLink className="w-4 h-4" />
                Read More
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
