"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { ProductSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import type { Product, Subcategory } from "@/lib/types";
import { ExternalLink, Tag, ArrowLeft, CheckCircle2, Calendar } from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    // Fetch product directly by slug
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then(async (prod: Product & { error?: string }) => {
        if (prod.error || !prod.id) { setError('Product not found'); return; }
        setProduct(prod);
        // subcategory is already included in the response
        if ((prod as any).subcategory) {
          setSubcategory((prod as any).subcategory);
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="aspect-[16/9] bg-gray-100 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center p-10">
          <p className="text-red-500 text-lg mb-4">{error || "Product not found"}</p>
          <Link href="/" className="text-emerald-700 font-semibold underline">Go back home</Link>
        </div>
      </main>
    );
  }

  const keyFeaturesList = product.keyFeatures
    ? product.keyFeatures.split('\n').map(f => f.trim()).filter(Boolean)
    : [];

  const isNutra = String(product.categoryType).toUpperCase() === "NUTRA";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <main className="min-h-screen bg-gray-50/50">
      {product && (
        <>
          <ProductSchema
            name={product.name}
            description={product.shortDescription}
            price={product.price}
            image={product.featuredImage || product.image}
            url={`${siteUrl}/product/${product.slug}`}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: siteUrl },
              { name: isNutra ? "Nutra" : "Ecom", url: siteUrl },
              ...(subcategory ? [{ name: subcategory.name, url: `${siteUrl}/subcategory/${subcategory.slug}` }] : []),
              { name: product.name, url: `${siteUrl}/product/${product.slug}` },
            ]}
          />
        </>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-5">
          <Breadcrumb
            crumbs={[
              { label: "Home", href: "/" },
              { label: isNutra ? "Nutra" : "Ecom", href: "/" },
              ...(subcategory ? [{ label: subcategory.name, href: `/subcategory/${subcategory.slug}` }] : []),
              { label: product.name },
            ]}
          />
        </div>

        {/* Back */}
        <Link
          href={subcategory ? `/subcategory/${subcategory.slug}` : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Article layout */}
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Hero header — split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left — info */}
            <div className="px-6 sm:px-10 pt-8 pb-8 flex flex-col justify-center">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  isNutra ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                }`}>
                  {isNutra ? "Nutra" : "Ecom"}
                </span>
                {subcategory && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full bg-gray-50">
                    <Tag className="w-3 h-3" /> {subcategory.name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                  <Calendar className="w-3 h-3" />
                  {new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-4xl font-extrabold text-emerald-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Short description */}
              <p className="text-gray-500 text-base leading-relaxed border-l-4 border-emerald-400 pl-4 italic mb-6">
                {product.shortDescription}
              </p>

              {/* Key Features inline in hero */}
              {keyFeaturesList.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Key Features</p>
                  <ul className="space-y-2">
                    {keyFeaturesList.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                    {keyFeaturesList.length > 5 && (
                      <li className="text-xs text-gray-400 pl-6.5">+{keyFeaturesList.length - 5} more below</li>
                    )}
                  </ul>
                </div>
              )}

              {/* CTA */}
              {product.readMoreLink && (
                <div className="mt-7">
                  <a
                    href={product.readMoreLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read More
                  </a>
                </div>
              )}
            </div>

            {/* Right — featured image */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-gray-100 min-h-[320px] lg:min-h-[420px] flex items-center justify-center overflow-hidden">
              {product.featuredImage ? (
                <img
                  src={product.featuredImage}
                  alt={product.featuredImageAlt || product.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : product.image ? (
                <img
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="text-gray-300 text-6xl select-none">📦</div>
              )}
              {/* Subtle gradient overlay on left edge to blend with content */}
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent hidden lg:block" />
            </div>
          </div>

          {/* Detailed description — rendered HTML */}
          <div className="px-6 sm:px-10 py-8 border-t border-gray-100">
            <div
              className="product-content"
              dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
            />
          </div>

        </article>
      </div>
    </main>
  );
}
