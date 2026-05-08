"use client";

import { useEffect, useState } from "react";
import { useCategoryContext } from "@/context/CategoryContext";
import ProductCard from "@/components/ProductCard";
import SubcategoryCard from "@/components/SubcategoryCard";
import SkeletonCard from "@/components/SkeletonCard";
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
        setProducts(prods);
        setSubcategories(subs);
        setHeroSettings(hero);
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
      {/* Hero Banner */}
      <section className="px-4 pt-7 md:pt-10" style={heroStyle}>
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2rem] md:rounded-[2.25rem] border border-white/25 shadow-2xl shadow-emerald-950/20">
          {hero.backgroundType === "image" && hero.backgroundImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${hero.overlayOpacity / 100})`,
              }}
            />
          )}
          <div className="absolute -top-28 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-emerald-950/25 blur-3xl" />
          <div
            className="relative z-10 px-6 py-16 md:px-12 md:py-20 lg:px-18 text-center md:text-left"
            style={{ color: hero.textColor }}
          >
            <div className="max-w-3xl fade-in-up">
              <p className="inline-flex items-center text-[11px] md:text-xs font-semibold tracking-[0.22em] uppercase mb-4 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20">
                {hero.subtitle}
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] mb-5">
                {hero.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < hero.title.split("\n").length - 1 && (
                      <br className="hidden md:block" />
                    )}
                  </span>
                ))}
              </h1>
              <p className="text-base md:text-lg max-w-2xl leading-relaxed opacity-95">
                {hero.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-14">
        {/* Latest Products */}
        <section>
          <div className="glass-band rounded-3xl p-4 md:p-5 flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-700/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
                Latest {activeCategory === "nutra" ? "Nutra" : "Ecom"} Products
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
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
        <section>
          <div className="glass-band rounded-3xl p-4 md:p-5 flex items-center gap-3 mb-6">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${activeCategory === "nutra" ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-700/30" : "bg-gradient-to-br from-sky-500 to-cyan-600 shadow-sky-700/25"}`}
            >
              <Grid3X3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
                Shop by Category
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
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
