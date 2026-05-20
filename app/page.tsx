"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategoryContext } from "@/context/CategoryContext";
import ProductCard from "@/components/ProductCard";
import SubcategoryCard from "@/components/SubcategoryCard";
import SkeletonCard from "@/components/SkeletonCard";
import type {
  Product,
  Subcategory,
  HeroSettings,
  Ingredient,
} from "@/lib/types";
import {
  Grid3x3 as Grid3X3,
  ShoppingCart,
  LayoutGrid,
  List,
  FlaskConical,
  Sparkles,
  Users,
  Package,
  CheckCircle,
  MessageCircle,
  Star,
  Flame,
} from "lucide-react";

export default function HomePage() {
  const { activeCategory } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
        console.error("Failed to fetch data:", error);
        // Set empty arrays as fallback
        setProducts([]);
        setSubcategories([]);
        setHeroSettings(null);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const latestProducts = products.slice(0, 8);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (latestProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex(
        (prevIndex) => (prevIndex + 1) % latestProducts.length,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [latestProducts.length]);

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
      {/* Hero Banner - Blue Theme */}
      <section className="relative w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Decorative Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Your Health, Our Priority
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                Premium Health & Wellness Products
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl">
                Shop science-backed supplements and premium wellness gear.
                Curated for your health journey with expert guidance.
              </p>

              {/* Product Count Badge */}
              <div className="flex items-center gap-3 pt-2">
                <div className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">
                    {latestProducts.length}+
                  </span>
                  <span className="text-white/90 text-sm font-medium ml-2">
                    Premium Products
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/40 transform hover:scale-105 active:scale-95"
                >
                  Browse Products <span className="text-xl">→</span>
                </a>
              </div>
            </div>

            {/* Right Side - Product Carousel */}
            <div className="hidden lg:flex items-center justify-center relative h-96">
              <div className="relative w-full h-full">
                {/* Circular gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-full blur-2xl"></div>

                {/* Carousel Container */}
                {latestProducts.length > 0 && (
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* Current Product Image with Fade Transition */}
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* Background Product Name Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-6xl sm:text-7xl md:text-8xl font-black text-white/15 select-none leading-tight break-words max-w-full px-4 transform -skew-y-12">
                            {latestProducts[
                              currentSlideIndex
                            ]?.name?.toUpperCase() || "PRODUCT"}
                          </p>
                        </div>
                      </div>

                      {/* Product Image */}
                      <Image
                        src={
                          latestProducts[currentSlideIndex]?.image ||
                          "/placeholder-hero.png"
                        }
                        alt={
                          latestProducts[currentSlideIndex]?.name ||
                          "Featured Product"
                        }
                        fill
                        className="absolute object-contain drop-shadow-2xl transition-opacity duration-500 ease-in-out opacity-100 z-10"
                        priority
                      />

                      {/* Product Info Badge - Name Only */}
                      {/* <div className="absolute bottom-6 left-6 bg-white/95 rounded-xl px-5 py-3 shadow-xl backdrop-blur-sm max-w-xs z-20 border border-white/30">
                        <p className="text-sm font-bold text-slate-900 line-clamp-2">
                          {latestProducts[currentSlideIndex]?.name}
                        </p>
                      </div> */}

                      {/* Carousel Indicators (Dots) */}
                      <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                        {latestProducts.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlideIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentSlideIndex
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                            aria-label={`Go to product ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {latestProducts.length === 0 && (
                  <div className="relative z-10 w-full h-full flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-sm">
                    <div className="text-center text-white">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium opacity-75">
                        Loading Products...
                      </p>
                    </div>
                  </div>
                )}

                {/* Quality Badge */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-white/95 rounded-full flex items-center justify-center shadow-lg z-20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">100%</p>
                    <p className="text-xs font-semibold text-gray-600">
                      Quality
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="relative py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat Cards */}
            {[
              { number: "10K+", label: "Satisfied Customers", Icon: Users },
              { number: "500+", label: "Premium Products", Icon: Package },
              { number: "99.8%", label: "Quality Assured", Icon: CheckCircle },
              {
                number: "24/7",
                label: "Customer Support",
                Icon: MessageCircle,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 text-center shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <stat.Icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mx-auto mb-3" />
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Latest Products */}
        <section id="products">
          <div className="glass-band rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-700/40 flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Latest {activeCategory === "nutra" ? "Supplement" : "Product"}{" "}
                  Picks
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Hand-picked{" "}
                  {activeCategory === "nutra"
                    ? "wellness essentials"
                    : "premium gear"}{" "}
                  curated just for you
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-gray-200 p-1 rounded-xl self-start sm:self-center shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Grid
              </button>
            </div>
          </div>

          {loading ? (
            <div
              className={
                viewMode === "list"
                  ? "space-y-3 sm:space-y-4 md:space-y-5 w-full"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              }
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    viewMode === "list"
                      ? "h-64 bg-gray-50 rounded-3xl animate-pulse border border-gray-100"
                      : "h-80"
                  }
                >
                  {viewMode === "grid" && <SkeletonCard />}
                </div>
              ))}
            </div>
          ) : latestProducts.length === 0 ? (
            <div className="surface-shell rounded-3xl text-center py-16 text-slate-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No products found for this category.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "list"
                  ? "flex flex-col gap-3 sm:gap-4 md:gap-5 w-full"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              }
            >
              {latestProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={
                    viewMode === "list"
                      ? "relative group bg-white border border-gray-200 rounded-2xl overflow-visible shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex items-center h-auto min-h-32"
                      : "relative group"
                  }
                >
                  {index === 0 && (
                    <div className="absolute -top-3 -left-3 z-10 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/30 ring-2 ring-white animate-pulse flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Top Pick
                    </div>
                  )}
                  <div
                    className={
                      viewMode === "list"
                        ? "w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4"
                        : "transition-all duration-300 group-hover:scale-105 w-full"
                    }
                  >
                    <ProductCard product={product} variant={viewMode} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 sm:mt-12 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 sm:px-10 py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white text-sm sm:text-base font-bold rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all duration-300 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                View All Products
                <span className="text-xl leading-none transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </div>
        </section>

        {/* Active Ingredients */}
        {ingredients.length > 0 && (
          <section id="ingredients">
            <div className="glass-band rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 flex-shrink-0">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    Powerful Ingredients
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Science-backed components for maximum wellness benefits
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="group bg-gradient-to-br from-white to-slate-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden relative"
                >
                  {/* Background accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 opacity-0 group-hover:opacity-50 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    {/* Image */}
                    <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden border-2 border-emerald-100 mb-4 group-hover:border-emerald-300 transition-colors relative">
                      <Image
                        src={ing.image || "/ingredient-placeholder.png"}
                        alt={ing.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {ing.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      Premium quality ingredient for optimal health benefits
                    </p>

                    {/* Badge */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
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
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {activeCategory === "nutra"
                  ? "Supplement Catalog & Reviews"
                  : "Product Catalog & Reviews"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Explore our comprehensive wellness collections and find your
                perfect match
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 sm:h-40 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 animate-pulse"
                />
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <div className="surface-shell rounded-3xl text-center py-16 text-slate-500">
              <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No subcategories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {subcategories.map((sub, idx) => (
                <div key={sub.id} className="group relative">
                  {idx < 2 && (
                    <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      New
                    </div>
                  )}
                  <div className="h-full transition-all duration-300 group-hover:scale-105">
                    <SubcategoryCard subcategory={sub} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl -ml-30 -mb-30"></div>

          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Wellness?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have taken control of
              their health journey with our premium products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-slate-100 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                Shop Now
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 backdrop-blur-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
