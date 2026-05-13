import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Star, Globe, ExternalLink } from 'lucide-react';
import prisma from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://healthstoreinfo7.top';

async function getArticle(slug: string) {
  try {
    return await (prisma as any).article.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { author: true },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };
  const url = `${SITE_URL}/article/${slug}`;
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.metaKeywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article', url,
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      siteName: 'HealthStore',
      images: article.featuredImage ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.featuredImageAlt || article.title }] : [],
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author ? [article.author.name] : [],
    },
    twitter: { card: 'summary_large_image', title: article.metaTitle || article.title, description: article.metaDescription || article.excerpt, images: article.featuredImage ? [article.featuredImage] : [] },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const author = article.author;
  const wordCount = article.content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    url: `${SITE_URL}/article/${slug}`,
    image: article.featuredImage,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: author ? { '@type': 'Person', name: author.name, ...(author.title ? { jobTitle: author.title } : {}), ...(author.website ? { url: author.website } : {}) } : { '@type': 'Organization', name: 'HealthStore' },
    publisher: { '@type': 'Organization', name: 'HealthStore', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    ...(author?.rating && author?.reviewCount ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: author.rating.toFixed(1), reviewCount: author.reviewCount.toString(), bestRating: '5' } } : {}),
  };

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f9fafb 300px)' }}>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Hero image — full bleed with gradient overlay */}
      {article.featuredImage && (
        <div className="relative w-full overflow-hidden" style={{ maxHeight: 520 }}>
          <img src={article.featuredImage} alt={article.featuredImageAlt || article.title}
            className="w-full object-cover" style={{ maxHeight: 520, minHeight: 280 }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-white/70">
              {article.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readTime} min read</span>
              <span className="bg-teal-500/80 text-white px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-sm">Article</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
              {article.title}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 mb-5 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
        </Link>

        {/* If no featured image, show title here */}
        {!article.featuredImage && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-400">
              {article.publishedAt && (
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readTime} min read</span>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              {article.title}
            </h1>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Main article */}
          <article className="min-w-0">

            {/* Excerpt card */}
            {article.excerpt && (
              <div className="mb-5 p-5 bg-teal-50 border border-teal-100 rounded-2xl">
                <p className="text-gray-700 text-base leading-relaxed font-medium">{article.excerpt}</p>
              </div>
            )}

            {/* Author bar */}
            {author && (
              <div className="flex items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                {author.avatar ? (
                  <img src={author.avatar} alt={author.avatarAlt || author.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-teal-100 flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-base">
                    {author.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{author.name}</span>
                    {author.title && <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-medium">{author.title}</span>}
                    {author.rating && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold ml-auto">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {author.rating.toFixed(1)}
                        {author.reviewCount && <span className="text-gray-400 font-normal">({author.reviewCount.toLocaleString()})</span>}
                      </span>
                    )}
                  </div>
                  {author.expertise && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{author.expertise}</p>}
                </div>
              </div>
            )}

            {/* Article body */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="article-content product-content"
                  dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>

              {/* Footer */}
              <div className="px-6 sm:px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-400">
                  Last updated: {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {author?.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Author website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            {/* Author card */}
            {author && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500" />
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">About the Author</p>
                  <div className="flex items-center gap-3 mb-3">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="w-14 h-14 rounded-full object-cover border-2 border-teal-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{author.name}</p>
                      {author.title && <p className="text-xs text-teal-600 font-medium">{author.title}</p>}
                    </div>
                  </div>
                  {author.bio && <p className="text-xs text-gray-500 leading-relaxed mb-3">{author.bio}</p>}
                  {author.expertise && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Expertise</p>
                      <p className="text-xs text-gray-500">{author.expertise}</p>
                    </div>
                  )}
                  {author.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="text-amber-400">{'★'.repeat(Math.round(author.rating))}{'☆'.repeat(5 - Math.round(author.rating))}</div>
                      <span className="font-bold text-gray-900">{author.rating.toFixed(1)}</span>
                      {author.reviewCount && <span className="text-xs text-gray-400">({author.reviewCount.toLocaleString()} reviews)</span>}
                    </div>
                  )}
                  {author.website && (
                    <a href={author.website} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-teal-200 text-teal-600 hover:bg-teal-50 rounded-xl text-xs font-semibold transition-colors">
                      <Globe className="w-3.5 h-3.5" /> Visit Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Article info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Article Info</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Read time</span><span className="font-semibold text-gray-900">{readTime} min</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Word count</span><span className="font-semibold text-gray-900">{wordCount.toLocaleString()}</span>
                </div>
                {article.publishedAt && (
                  <div className="flex justify-between text-gray-600">
                    <span>Published</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
