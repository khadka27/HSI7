'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import type { Product, Subcategory } from '@/lib/types';
import { ExternalLink, Tag, ArrowLeft } from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products`)
      .then(r => r.json())
      .then(async (products: Product[]) => {
        const prod = products.find(p => p.slug === slug);
        if (!prod) { setError('Product not found'); return; }
        setProduct(prod);
        const subs: Subcategory[] = await fetch('/api/subcategories').then(r => r.json());
        const sub = subs.find(s => s.id === prod.subcategoryId);
        if (sub) setSubcategory(sub);
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Product not found'}</p>
          <Link href="/" className="text-[#16A34A] underline">Go back home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: product.categoryType === 'nutra' ? 'Nutra' : 'Ecom', href: '/' },
            ...(subcategory ? [{ label: subcategory.name, href: `/subcategory/${subcategory.slug}` }] : []),
            { label: product.name },
          ]} />
        </div>

        {/* Back button */}
        <Link
          href={subcategory ? `/subcategory/${subcategory.slug}` : '/'}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#16A34A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Featured Image */}
            <div className="aspect-[1200/680] rounded-xl overflow-hidden bg-white shadow-md border border-gray-100">
              <img
                src={product.featuredImage}
                alt={`${product.name} featured`}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">Featured image (1200×680)</p>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                product.categoryType === 'nutra'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-sky-100 text-sky-700'
              }`}>
                {product.categoryType === 'nutra' ? 'Nutra' : 'Ecom'}
              </span>
              {subcategory && (
                <span className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {subcategory.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-[#16A34A]">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-600 text-base leading-relaxed border-l-4 border-[#16A34A] pl-4 italic">
              {product.shortDescription}
            </p>

            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h2>
              <p className="text-gray-600 text-sm leading-loose whitespace-pre-line">
                {product.detailedDescription}
              </p>
            </div>

            {product.readMoreLink && (
              <a
                href={product.readMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
