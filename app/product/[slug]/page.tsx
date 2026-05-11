import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { ProductSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import { ExternalLink, Tag, ArrowLeft, CheckCircle2, Calendar } from "lucide-react";
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
  createdAt: Date;
  updatedAt: Date;
  subcategoryId: string;
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
                <div className="text-gray-300 text-6xl select-none">📦</div>
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
