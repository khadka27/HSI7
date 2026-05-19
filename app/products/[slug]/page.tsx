import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import TableOfContent from "@/components/TableOfContent";
import ProductFirstH1HashUrl from "@/components/ProductFirstH1HashUrl";
import AuthorAvatar from "@/components/AuthorAvatar";
import { ProductSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import {
  ShoppingCart,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  FlaskConical,
  Activity,
  Zap,
} from "lucide-react";
import type { Product, Subcategory, Ingredient } from "@/lib/types";
import { injectFirstH1Id } from "@/lib/productContentHeading";

interface ProductFull extends Omit<
  Product,
  "createdAt" | "updatedAt" | "author"
> {
  createdAt: Date;
  updatedAt: Date;
  subcategory: Subcategory & { category: { name: string; type: string } };
  author?: {
    name: string;
    avatar?: string | null;
    title?: string | null;
    bio?: string | null;
    expertise?: string | null;
    website?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
  } | null;
  ingredients?: Ingredient[];
}

async function getProduct(slug: string): Promise<ProductFull | null> {
  try {
    const product = await (prisma.product.findUnique as any)({
      where: { slug },
      include: {
        subcategory: {
          include: { category: true },
        },
        author: true,
        ingredients: true,
      },
    });
    return product as unknown as ProductFull | null;
  } catch {
    return null;
  }
}

async function getRelatedProducts(subcategoryId: string, currentId: string) {
  const related = await prisma.product.findMany({
    where: {
      subcategoryId,
      id: { not: currentId },
    },
    take: 4,
    include: {
      ingredients: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (related.length > 0) return related;

  // Fallback to latest products if no related found
  return prisma.product.findMany({
    where: { id: { not: currentId } },
    take: 4,
    include: {
      ingredients: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.subcategoryId,
    product.id,
  );
  const keyFeaturesList = product.keyFeatures
    ? (product.keyFeatures as string).split("\n").filter((f) => f.trim())
    : [];
  const { html: descriptionHtml, firstH1Slug } = injectFirstH1Id(
    product.detailedDescription,
  );

  return (
    <main className="min-h-screen bg-white">
      <ProductFirstH1HashUrl slug={firstH1Slug} />
      <ProductSchema
        name={product.name}
        description={product.detailedDescription}
        price={product.price}
        image={product.image}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products/${product.slug}`}
        slug={product.slug}
        shortDescription={product.shortDescription || ""}
        keyFeatures={product.keyFeatures || ""}
        categoryType={product.categoryType}
        subcategoryName={product.subcategory.name}
        imageAlt={product.imageAlt || ""}
        featuredImage={product.featuredImage || ""}
        readMoreLink={product.readMoreLink || ""}
        createdAt={product.createdAt.toISOString()}
        updatedAt={product.updatedAt.toISOString()}
        author={
          product.author
            ? {
                name: product.author.name,
                title: product.author.title,
                avatar: product.author.avatar,
                bio: product.author.bio,
                expertise: product.author.expertise,
                website: product.author.website,
                twitter: product.author.twitter,
                linkedin: product.author.linkedin,
                rating: product.author.rating,
                reviewCount: product.author.reviewCount,
              }
            : null
        }
      />
      <BreadcrumbSchema
        items={[
          {
            name: "Home",
            url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          },
          {
            name: "Products",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products`,
          },
          {
            name: product.name,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products/${product.slug}`,
          },
        ]}
      />

      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-8 pb-10 sm:pb-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden">
            <Breadcrumb
              crumbs={[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: product.name },
              ]}
            />
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Image Gallery */}
            <div className="lg:col-span-7 xl:col-span-7">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white shadow-2xl shadow-blue-900/10 bg-white">
                <Image
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  fill
                  className="object-contain p-4 sm:p-8"
                  priority
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold text-blue-800 uppercase tracking-widest shadow-sm border border-blue-100/50">
                    {product.subcategory.categoryType === "nutra"
                      ? "Supplement"
                      : "Premium Gear"}
                  </span>
                </div>
              </div>

              {/* Trust Markers */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center group hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Pure Quality
                  </span>
                </div>
                <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center group hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Fast Shipping
                  </span>
                </div>
                <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center group hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Easy Returns
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Verified Product
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6 sm:mb-8">
                <span className="text-4xl sm:text-5xl font-black text-blue-600 tracking-tighter">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest line-through decoration-2">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              </div>

              {/* Short description */}
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed border-l-4 border-blue-400 pl-4 italic mb-5">
                {product.shortDescription}
              </p>

              {/* CTA buttons — full width on mobile */}
              {(product.readMoreLink || product.buyNowLink) && (
                <div className="mt-6 mb-8 flex flex-col sm:flex-row gap-3">
                  {product.buyNowLink && (
                    <a
                      href={product.buyNowLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-amber-300/40 hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      <ShoppingCart className="w-4 h-4" /> Buy Now
                    </a>
                  )}
                  {product.readMoreLink && (
                    <a
                      href={product.readMoreLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read More
                    </a>
                  )}
                </div>
              )}

              {/* Key Features */}
              {keyFeaturesList.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Key Features
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {keyFeaturesList.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {keyFeaturesList.length > 5 && (
                      <li className="text-xs text-gray-400 pl-6">
                        +{keyFeaturesList.length - 5} more below
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Content & TOC Section */}
          <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 border-t border-gray-100 bg-white rounded-3xl mt-12 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Content Column */}
              <div className="lg:col-span-8 order-2 lg:order-1">
                {/* Author Info at Top */}
                {product.author && (
                  <div className="mb-10 p-5 sm:p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border-4 border-white flex-shrink-0 ring-1 ring-slate-100">
                        <AuthorAvatar
                          src={product.author.avatar}
                          alt={product.author.avatarAlt || product.author.name}
                          name={product.author.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-lg font-black text-slate-900 tracking-tight">
                            {product.author.name}
                          </span>
                          <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                              Verified Expert
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-medium">
                              {product.author.title || "Health Researcher"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              Updated:{" "}
                              {new Date(product.updatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-50 pt-3">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-700">
                              4.9/5
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                              Rating
                            </span>
                          </div>
                          <div className="h-3 w-px bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold text-slate-700">
                              12+ yrs
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                              Experience
                            </span>
                          </div>
                          <div className="h-3 w-px bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-700">
                              500+
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                              Products Reviewed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-extrabold prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                  <div
                    className="product-content"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                </div>
              </div>

              {/* Sidebar Column */}
              <aside className="lg:col-span-4 order-1 lg:order-2 space-y-8">
                <div className="sticky top-24">
                  <TableOfContent />

                  {/* Current Product Card in Sidebar */}
                  <div className="mt-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">
                      Product Highlights
                    </p>
                    <ProductCard
                      product={product as any}
                      useFeaturedImage={false}
                    />
                  </div>

                  {/* Ingredients Sidebar Widget */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="mt-8 bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />

                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                          <FlaskConical className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold leading-tight">
                            Active Ingredients
                          </h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                            Potency & Purity
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        {product.ingredients.map((ing) => (
                          <div
                            key={ing.id}
                            className="flex items-center gap-4 group/item"
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 flex-shrink-0 group-hover/item:border-blue-500/50 transition-colors">
                              <Image
                                src={ing.image || "/ingredient-placeholder.png"}
                                alt={ing.name}
                                fill
                                className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white group-hover/item:text-blue-400 transition-colors">
                                {ing.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Activity className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                  Bioavailable Form
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400">
                            Scientific Trust
                          </span>
                          <span className="text-xs font-black text-blue-400">
                            99.8%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[99.8%]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 sm:mb-12">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Zap className="w-3 h-3" /> Expert Recommendation
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Complete Your <span className="text-blue-600">Regimen</span>
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors group"
              >
                View all collection{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p as any}
                  useFeaturedImage={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
