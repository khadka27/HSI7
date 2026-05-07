'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import CategoryToggle from '@/components/CategoryToggle';
import type { Product, Subcategory } from '@/lib/types';
import { PackageSearch } from 'lucide-react';

export default function SubcategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/subcategories`)
      .then(r => r.json())
      .then((subs: Subcategory[]) => {
        const sub = subs.find(s => s.slug === slug);
        if (!sub) { setError('Subcategory not found'); setLoading(false); return; }
        setSubcategory(sub);
        return fetch(`/api/products?subcategoryId=${sub.id}`).then(r => r.json());
      })
      .then((prods?: Product[]) => {
        if (prods) setProducts(prods);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Subcategory Hero */}
      {subcategory && (
        <section className="relative h-56 md:h-72 overflow-hidden">
          <img
            src={subcategory.image}
            alt={subcategory.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb crumbs={[
                { label: 'Home', href: '/' },
                { label: subcategory.categoryType === 'nutra' ? 'Nutra' : 'Ecom', href: '/' },
                { label: subcategory.name },
              ]} />
              <h1 className="text-2xl md:text-4xl font-bold text-white mt-2 drop-shadow-md">
                {subcategory.name}
              </h1>
              <p className="text-white/80 text-sm mt-1 max-w-xl">{subcategory.description}</p>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toggle */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-sm text-gray-500">
            {loading ? '...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </p>
          <CategoryToggle />
        </div>

        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !error && products.length === 0 ? (
          <div className="text-center py-20">
            <PackageSearch className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No products in this subcategory yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
