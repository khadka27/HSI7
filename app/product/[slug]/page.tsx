import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { ProductSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import { ExternalLink, Tag, ArrowLeft, CheckCircle2, Calendar, ShoppingCart, Package, Star, Globe, Twitter } from "lucide-react";
import prisma from "@/lib/db";

// Explicit type that matches the actual DB schema including all new fields
interface ProductFull {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryType: string;
  shortDescription: string;
  detailedDescription: string;
  keyFeatures: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  image: string;
  imageAlt: string | null;
  featuredImage: string;
  featuredImageAlt: string | null;
  readMoreLink: string | null;
  buyNowLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  subcategoryId: string;
  author: {
    id: string;
    name: string;
    title: string | null;
    bio: string | null;
    expertise: string | null;
    avatar: string | null;
    avatarAlt: string | null;
    website: string | null;
    twitter: string | null;
    linkedin: string | null;
    reviewCount: number | null;
    rating: number | null;
  } | null;
  subcategory: {
    id: string;
    name: string;
    slug: string;
    categoryType: string;
    description: string | null;
    image: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
      type: string;
    } | null;
  } | null;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://healthstoreinfo7.top";

async function getProduct(slug: string): Promise<ProductFull | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        subcategory: {
          include: { category: true },
        },
        author: true,
      },
    });
    return product as unknown as ProductFull | null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const url = `${SITE_URL}/product/${product.slug}`;
  const image = product.featuredImage || product.image;

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription,
      siteName: "HealthStore",
      images: image ? [{ url: image, width: 1200, height: 630, alt: product.name }] : [],
      publishedTime: product.createdAt.toISOString(),
      modifiedTime: product.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription,
      images: image ? [image] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const subcategory = product.subcategory;
  const keyFeaturesList = product.keyFeatures
    ? product.keyFeatures.split("\n").map((f) => f.trim()).filter(Boolean)
    : [];

  const isNutra = product.categoryType === "NUTRA";
  const productUrl = `${SITE_URL}/product/${product.slug}`;

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Schema.org — server-rendered, visible in page source */}
      <ProductSchema
        name={product.name}
        description={product.detailedDescription}
        shortDescription={product.shortDescription}
        price={product.price}
        image={product.image}
        featuredImage={product.featuredImage ?? undefined}
        imageAlt={product.imageAlt ?? undefined}
        url={productUrl}
        slug={product.slug}
        keyFeatures={product.keyFeatures ?? undefined}
        categoryType={isNutra ? "Nutra" : "Ecom"}
        subcategoryName={subcategory?.name}
        readMoreLink={product.readMoreLink ?? undefined}
        createdAt={product.createdAt.toISOString()}
        updatedAt={product.updatedAt.toISOString()}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: isNutra ? "Nutra" : "Ecom", url: SITE_URL },
          ...(subcategory
            ? [{ name: subcategory.name, url: `${SITE_URL}/subcategory/${subcategory.slug}` }]
            : []),
          { name: product.name, url: productUrl },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-5">
          <Breadcrumb
            crumbs={[
              { label: "Home", href: "/" },
              { label: isNutra ? "Nutra" : "Ecom", href: "/" },
              ...(subcategory
                ? [{ label: subcategory.name, href: `/subcategory/${subcategory.slug}` }]
                : []),
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

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Hero — split layout */}
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
                  {product.createdAt.toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
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

              {/* Author trust signal — first fold */}
              {product.author && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                  {product.author.avatar ? (
                    <img src={product.author.avatar} alt={product.author.avatarAlt || product.author.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                      <span className="text-indigo-600 font-bold text-lg">{product.author.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{product.author.name}</span>
                      {product.author.title && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                          {product.author.title}
                        </span>
                      )}
                    </div>
                    {product.author.expertise && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.author.expertise}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        Updated {product.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {product.author.rating && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {product.author.rating.toFixed(1)}
                          {product.author.reviewCount && (
                            <span className="text-gray-400 font-normal">({product.author.reviewCount.toLocaleString()} reviews)</span>
                          )}
                        </span>
                      )}
                      {product.author.website && (
                        <a href={product.author.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors">
                          <Globe className="w-3 h-3" /> Website
                        </a>
                      )}
                      {product.author.twitter && (
                        <a href={`https://twitter.com/${product.author.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 transition-colors">
                          <Twitter className="w-3 h-3" /> {product.author.twitter}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Key Features */}
              {keyFeaturesList.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Key Features
                  </p>
                  <ul className="space-y-2">
                    {keyFeaturesList.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
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

              {/* CTA buttons */}
              {(product.readMoreLink || product.buyNowLink) && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {product.buyNowLink && (
                    <a
                      href={product.buyNowLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-amber-300/40 hover:-translate-y-0.5"
                    >
                      <ShoppingCart className="w-4 h-4" /> Buy Now
                    </a>
                  )}
                  {product.readMoreLink && (
                    <a
                      href={product.readMoreLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read More
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right — image */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-gray-100 min-h-[320px] lg:min-h-[420px] flex items-center justify-center overflow-hidden">
              {product.featuredImage ? (
                <img
                  src={product.featuredImage}
                  alt={product.featuredImageAlt ?? product.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : product.image ? (
                <img
                  src={product.image}
                  alt={product.imageAlt ?? product.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="flex items-center justify-center text-gray-300"><Package className="w-16 h-16" /></div>
              )}
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
