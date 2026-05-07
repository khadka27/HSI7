'use client';

import { useEffect, useState } from 'react';
import { useCategoryContext } from '@/context/CategoryContext';
import ProductCard from '@/components/ProductCard';
import SubcategoryCard from '@/components/SubcategoryCard';
import SkeletonCard from '@/components/SkeletonCard';
import type { Product, Subcategory, HeroSettings } from '@/lib/types';
import { Sparkles, Grid3x3 as Grid3X3 } from 'lucide-react';

export default function HomePage() {
  const { activeCategory } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products?type=${activeCategory}`).then(r => r.json()),
      fetch(`/api/subcategories?type=${activeCategory}`).then(r => r.json()),
      fetch('/api/hero-settings').then(r => r.json()),
    ])
      .then(([prods, subs, hero]) => {
        setProducts(prods);
        setSubcategories(subs);
        setHeroSettings(hero);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const latestProducts = products.slice(0, 8);

  // Default hero settings if not loaded
  const defaultHero: HeroSettings = {
    id: 'default',
    title: 'Your Wellness Journey Starts Here',
    subtitle: 'Premium Health Products',
    description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
    backgroundImage: '',
    backgroundType: 'gradient',
    gradientFrom: '#16A34A',
    gradientVia: '#15803D',
    gradientTo: '#14532D',
    textColor: '#FFFFFF',
    overlayOpacity: 30,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    updatedAt: new Date().toISOString(),
  };

  const hero = heroSettings || defaultHero;

  const heroStyle = hero.backgroundType === 'image' && hero.backgroundImage
    ? { 
        backgroundImage: `url(${hero.backgroundImage})`,
        backgroundSize: hero.backgroundSize,
        backgroundPosition: hero.backgroundPosition,
      }
    : {
        background: `linear-gradient(to bottom right, ${hero.gradientFrom}, ${hero.gradientVia}, ${hero.gradientTo})`
      };

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Banner */}
      <section 
        className="py-14 px-4 relative"
        style={heroStyle}
      >
        {hero.backgroundType === 'image' && hero.backgroundImage && (
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${hero.overlayOpacity / 100})` }} />
        )}
        <div className="max-w-7xl mx-auto text-center relative z-10" style={{ color: hero.textColor }}>
          <p className="text-sm font-medium tracking-widest uppercase mb-3 opacity-80">
            {hero.subtitle}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {hero.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < hero.title.split('\n').length - 1 && <br className="hidden md:block" />}
              </span>
            ))}
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed opacity-90">
            {hero.description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Latest Products */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Latest {activeCategory === 'nutra' ? 'Nutra' : 'Ecom'} Products
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Top picks in {activeCategory === 'nutra' ? 'nutrition & supplements' : 'fitness & wellness equipment'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : latestProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No products found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {latestProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Subcategories */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeCategory === 'nutra' ? 'bg-[#16A34A]' : 'bg-[#0EA5E9]'}`}>
              <Grid3X3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Shop by Category
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Explore our curated {activeCategory === 'nutra' ? 'supplement' : 'product'} collections
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No subcategories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {subcategories.map(sub => (
                <SubcategoryCard key={sub.id} subcategory={sub} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
