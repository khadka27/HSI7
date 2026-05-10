"use client";

import { useEffect, useState } from "react";
import { useCategoryContext } from "@/context/CategoryContext";
import ProductCard from "@/components/ProductCard";
import SubcategoryCard from "@/components/SubcategoryCard";
import SkeletonCard from "@/components/SkeletonCard";
import SearchBar from "@/components/SearchBar";
import type { Product, Subcategory, HeroSettings } from "@/lib/types";
import { Sparkles, Grid3x3 as Grid3X3 } from "lucide-react";

export default function HomePage() {
  const { activeCategory } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products?type=${activeCategory}`).then((r) => r.json()),
      fetch(`/api/subcategories?type=${activeCategory}`).then((r) => r.json()),
      fetch("/api/hero-settings").then((r) => r.json()),
    ])
      .then(([prods, subs, hero]) => {
        // Handle API errors by providing fallback empty arrays
        setProducts(Array.isArray(prods) ? prods : []);
        setSubcategories(Array.isArray(subs) ? subs : []);
        setHeroSettings(hero && !hero.error ? hero : null);
      })
      .catch((error) => {
        console.error('Failed to fetch data:', error);
        // Set empty arrays as fallback
        setProducts([]);
        setSubcategories([]);
        setHeroSettings(null);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const latestProducts = products.slice(0, 8);

  // Default hero settings if not loaded
  const defaultHero: HeroSettings = {
    id: "default",
    title: "Your Wellness Journey Starts Here",
    subtitle: "Premium Health Products",
    description:
      "Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.",
    backgroundImage: "",
    backgroundType: "gradient",
    gradientFrom: "#16A34A",
    gradientVia: "#15803D",
    gradientTo: "#14532D",
    textColor: "#FFFFFF",
    overlayOpacity: 30,
    backgroundPosition: "center",
    backgroundSize: "cover",
    updatedAt: new Date().toISOString(),
  };

  const hero = heroSettings || defaultHero;

  const heroStyle =
    hero.backgroundType === "image" && hero.backgroundImage
      ? {
          backgroundImage: `url(${hero.backgroundImage})`,
          backgroundSize: hero.backgroundSize,
          backgroundPosition: hero.backgroundPosition,
        }
      : {
          background: `linear-gradient(130deg, ${hero.gradientFrom}, ${hero.gradientVia}, ${hero.gradientTo})`,
        };

  return (
    <main className="min-h-screen">
      {/* Hero Banner - Compact Split Layout */}
      <section className="px-4 pt-4 md:pt-6 pb-6 md:pb-8" style={heroStyle}>
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/20 shadow-xl shadow-black/30">
          {hero.backgroundType === "image" && hero.backgroundImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${hero.overlayOpacity / 100})`,
              }}
            />
          )}

          {/* Animated gradient orbs */}
          <div className="absolute -top-32 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-950/20 blur-3xl" />

          {/* Split Content - Compact 50/50 */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center px-6 sm:px-8 md:px-12 py-12 md:py-16 lg:py-20">
            {/* Left Side - Text Content */}
            <div className="fade-in-up space-y-4 md:space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all">
                  <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/90">
                    ✨ {hero.subtitle}
                  </span>
                </div>
              </div>

              {/* Heading - Compact & Bold */}
              <h1
                className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.15] tracking-tight"
                style={{ color: hero.textColor }}
              >
                {hero.title.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              {/* Description - Shorter */}
              <p
                className="text-sm md:text-base lg:text-lg max-w-xl leading-relaxed font-light"
                style={{ color: hero.textColor }}
              >
                {hero.description}
              </p>

              {/* Search Bar */}
              <div className="pt-1">
                <SearchBar />
              </div>

              {/* CTA Buttons - Compact */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white text-emerald-900 font-semibold text-sm hover:shadow-lg hover:shadow-white/30 hover:scale-105 transition-all"
                >
                  Shop Now <span className="text-base">→</span>
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white/15 text-white border border-white/30 font-semibold text-sm hover:bg-white/25 transition-all backdrop-blur-sm"
                >
                  Explore
                </a>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="hidden lg:flex items-center justify-center relative h-56">
              {/* Diagonal Design Element */}
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm"
                style={{
                  clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* Latest Products */}
        <section id="products">
          <div className="glass-band rounded-3xl p-5 md:p-6 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-700/40 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Latest {activeCategory === "nutra" ? "Nutra" : "Ecom"} Products
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Top picks in{" "}
                {activeCategory === "nutra"
                  ? "nutrition & supplements"
                  : "fitness & wellness equipment"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : latestProducts.length === 0 ? (
            <div className="surface-shell rounded-3xl text-center py-16 text-slate-500">
              <p className="text-lg">No products found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Subcategories */}
        <section id="categories">
          <div className="glass-band rounded-3xl p-5 md:p-6 flex items-center gap-3 mb-8">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${activeCategory === "nutra" ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-700/40" : "bg-gradient-to-br from-sky-500 to-cyan-600 shadow-sky-700/40"}`}
            >
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Shop by Category
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore our curated{" "}
                {activeCategory === "nutra" ? "supplement" : "product"}{" "}
                collections
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="surface-shell rounded-3xl overflow-hidden animate-pulse"
                >
                  <div className="h-44 bg-emerald-100/70" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-emerald-100 rounded w-full" />
                    <div className="h-3 bg-emerald-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <div className="surface-shell rounded-3xl text-center py-16 text-slate-500">
              <p className="text-lg">No subcategories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {subcategories.map((sub) => (
                <SubcategoryCard key={sub.id} subcategory={sub} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
