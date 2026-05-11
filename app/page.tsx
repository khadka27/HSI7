"use client";

import { useEffect, useState } from "react";
import { useCategoryContext } from "@/context/CategoryContext";
import ProductCard from "@/components/ProductCard";
import SubcategoryCard from "@/components/SubcategoryCard";
import SkeletonCard from "@/components/SkeletonCard";
import SearchBar from "@/components/SearchBar";
import type { Product, Subcategory, HeroSettings, Ingredient } from "@/lib/types";
import { Sparkles, Grid3x3 as Grid3X3, ShoppingCart, LayoutGrid, List, FlaskConical } from "lucide-react";

export default function HomePage() {
  const { activeCategory } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products?type=${activeCategory}`).then((r) => r.json()),
      fetch(`/api/subcategories?type=${activeCategory}`).then((r) => r.json()),
      fetch("/api/hero-settings").then((r) => r.json()),
      fetch("/api/ingredients").then((r) => r.json()),
    ])
      .then(([prodsData, subs, hero, ings]) => {
        // Handle API errors by providing fallback empty arrays
        const prods = prodsData?.products || [];
        setProducts(Array.isArray(prods) ? prods : []);
        setSubcategories(Array.isArray(subs) ? subs : []);
        setIngredients(Array.isArray(ings) ? ings : []);
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
    buyNowLink: "",
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
      <section className="px-3 sm:px-4 pt-3 sm:pt-4 md:pt-6 pb-4 sm:pb-6 md:pb-8" style={heroStyle}>
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
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-950/20 blur-3xl" />

          {/* Split Content */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-10 md:py-14 lg:py-20">
            {/* Left Side - Text Content */}
            <div className="fade-in-up space-y-3 sm:space-y-4 md:space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all">
                  <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/90">
                    ✦ {hero.subtitle}
                  </span>
                </div>
              </div>

              {/* Heading */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.15] tracking-tight"
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

              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <a
                  href="#products"
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-white text-blue-900 font-semibold text-sm hover:shadow-lg hover:shadow-white/30 hover:scale-105 transition-all"
                >
                  Shop Now <span className="text-base">→</span>
                </a>
                {hero.buyNowLink && (
                  <a
                    href={hero.buyNowLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm hover:shadow-lg hover:shadow-amber-400/40 hover:scale-105 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" /> Buy Now
                  </a>
                )}
                <a
                  href="#categories"
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-white/15 text-white border border-white/30 font-semibold text-sm hover:bg-white/25 transition-all backdrop-blur-sm"
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-14 space-y-10 sm:space-y-14 md:space-y-16">
        {/* Latest Products */}
        <section id="products">
          <div className="glass-band rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-700/40 flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Latest {activeCategory === "nutra" ? "Supplement" : "Product"} Picks
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Hand-picked {activeCategory === "nutra" ? "wellness essentials" : "premium gear"}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100/50 p-1 rounded-xl self-start sm:self-center border border-gray-200/50">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list" 
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "grid" 
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Grid
              </button>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={viewMode === "list" ? "h-64 bg-gray-50 rounded-3xl animate-pulse border border-gray-100" : "h-80"}>
                  {viewMode === "grid" && <SkeletonCard />}
                </div>
              ))}
            </div>
          ) : latestProducts.length === 0 ? (
            <div className="surface-shell rounded-3xl text-center py-16 text-slate-500">
              <p className="text-lg">No products found for this category.</p>
            </div>
          ) : (
            <div className={viewMode === "list" ? "flex flex-col gap-5 sm:gap-6" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"}>
              {latestProducts.map((product, index) => (
                <div key={product.id} className="relative">
                  {index === 0 && (
                    <div className="absolute -top-3 -left-3 z-10 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/30 ring-2 ring-white">
                      Top Pick
                    </div>
                  )}
                  <ProductCard product={product} variant={viewMode} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Ingredients */}
        {ingredients.length > 0 && (
          <section id="ingredients">
            <div className="glass-band rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center gap-3 mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/20">
                <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Powerful Ingredients</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Premium components selected for maximum efficacy</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
              {ingredients.map((ing) => (
                <div key={ing.id} className="group flex items-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-blue-100/50 flex-shrink-0 transition-transform group-hover:scale-110">
                    <img 
                      src={ing.image || "/ingredient-placeholder.png"} 
                      alt={ing.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 bg-white border border-blue-100/50 px-5 py-3 rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all">
                    <span className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1">{ing.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Subcategories */}
        <section id="categories">
          <div className="glass-band rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 flex items-center gap-3 mb-5 sm:mb-6 md:mb-8">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${activeCategory === "nutra" ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-700/40" : "bg-gradient-to-br from-sky-500 to-cyan-600 shadow-sky-700/40"}`}
            >
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {activeCategory === "nutra" ? "Supplement Catalog & Reviews" : "Product Catalog & Reviews"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Explore our comprehensive wellness collections
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-blue-50/50 rounded-2xl border border-blue-100 animate-pulse"
                />
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <div className="surface-shell rounded-3xl text-center py-16 text-slate-500">
              <p className="text-lg">No subcategories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
