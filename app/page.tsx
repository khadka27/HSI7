"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategoryContext } from "@/context/CategoryContext";
import ProductCard from "@/components/ProductCard";
import SubcategoryCard from "@/components/SubcategoryCard";
import SkeletonCard from "@/components/SkeletonCard";
import type { Product, Subcategory, Ingredient } from "@/lib/types";
import {
  ShoppingCart, LayoutGrid, List, FlaskConical,
  Users, Package, CheckCircle, MessageCircle, Star, Flame,
  ArrowRight, ChevronLeft, ChevronRight, Shield, Award,
  Zap, TrendingUp, Grid3x3 as Grid3X3,
} from "lucide-react";

export default function HomePage() {
  const { activeCategory } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    setLoading(true);
    setSlide(0);
    Promise.all([
      fetch(`/api/products?type=${activeCategory}&status=PUBLISHED`).then((r) => r.json()),
      fetch(`/api/subcategories?type=${activeCategory}`).then((r) => r.json()),
      fetch("/api/ingredients").then((r) => r.json()),
    ])
      .then(([prodsData, subs, ings]) => {
        const prods = prodsData?.products || [];
        setProducts(Array.isArray(prods) ? prods : []);
        setSubcategories(Array.isArray(subs) ? subs : []);
        setIngredients(Array.isArray(ings) ? ings : []);
      })
      .catch(() => { setProducts([]); setSubcategories([]); })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const featured = products.slice(0, 6);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => setSlide((p) => (p + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  const isNutra = activeCategory === "nutra";
  const BLUE = "#0284c7";
  const AMBER = "#f59e0b";

  const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'>No Image</text></svg>";

  return (
    <main className="min-h-screen" style={{ background: "#f8fafc" }}>

      {/* ═══════════════════════════════════════════ HERO SECTION */}
      <section style={{ background: BLUE }} className="relative overflow-hidden">
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}
        />
        {/* Right panel accent */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-[#0369a1] hidden lg:block" style={{ clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">

            {/* ── Left: Content ── */}
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-white rounded-full" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Star className="w-3 h-3" style={{ color: AMBER, fill: AMBER }} />
                {isNutra ? "Supplement Experts" : "Health Product Specialists"}
              </span>

              <div>
                <h1 className="text-[2.8rem] sm:text-[3.4rem] lg:text-[3.8rem] font-black text-white leading-[1.02] tracking-[-0.02em]">
                  {isNutra ? <>Your Daily<br /><span style={{ color: AMBER }}>Supplement</span><br />Elevated.</> : <>Premium Health<br /><span style={{ color: AMBER }}>Products</span><br />Curated.</>}
                </h1>
              </div>

              <p className="text-blue-100 text-base sm:text-[1.05rem] leading-[1.75] max-w-md font-medium">
                {isNutra
                  ? "Third-party tested, clinically formulated supplements approved by verified health experts."
                  : "Premium fitness and wellness gear from trusted brands — quality tested, expert approved."}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {[{ n: "10K+", l: "Customers" }, { n: "500+", l: "Products" }, { n: "99.8%", l: "Satisfaction" }].map(s => (
                  <div key={s.l}>
                    <div className="text-[1.6rem] font-black text-white leading-none">{s.n}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <a href="#products" className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.85rem] font-black rounded-xl shadow-lg transition-all duration-150 active:scale-95 hover:opacity-90" style={{ background: AMBER, color: "#1e293b" }}>
                  Browse Catalog <ArrowRight className="w-4 h-4" />
                </a>
                <Link href="/about" className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.85rem] font-bold rounded-xl transition-all duration-150 text-white" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}>
                  About Us
                </Link>
              </div>
            </div>

            {/* ── Right: Carousel ── */}
            <div className="lg:pl-10">
              {featured.length > 0 ? (
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto lg:max-w-none">
                  {/* Image area */}
                  <div className="relative bg-slate-50" style={{ height: 300 }}>
                    <Image
                      src={featured[slide]?.image || PLACEHOLDER}
                      alt={featured[slide]?.name || "Product"}
                      fill priority
                      className="object-contain p-6 animate-float"
                    />
                    {/* Top badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md" style={{ background: AMBER, color: "#1e293b" }}>
                      <Star className="w-2.5 h-2.5 fill-current" /> Top Pick
                    </div>
                    {/* Arrows */}
                    <button onClick={() => setSlide(p => p === 0 ? featured.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button onClick={() => setSlide(p => (p + 1) % featured.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="px-5 py-4 border-t border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: BLUE }}>Featured</p>
                        <h3 className="text-sm font-black text-slate-900 truncate max-w-[200px]">{featured[slide]?.name}</h3>
                        <p className="text-lg font-black mt-1" style={{ color: BLUE }}>${featured[slide]?.price?.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        {featured.map((_, i) => (
                          <button key={i} onClick={() => setSlide(i)} className="w-1.5 rounded-full transition-all duration-300" style={{ height: i === slide ? 20 : 6, background: i === slide ? BLUE : "#e2e8f0" }} aria-label={`Slide ${i + 1}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl h-80 flex items-center justify-center" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                  <ShoppingCart className="w-12 h-12 text-white/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ TRUST BAR */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 gap-y-3">
            {[
              { Icon: Shield, text: "Third-Party Tested" },
              { Icon: Award, text: "Expert Verified" },
              { Icon: Zap, text: "Fast Shipping" },
              { Icon: TrendingUp, text: "Clinically Formulated" },
              { Icon: CheckCircle, text: "100% Quality Assured" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-slate-300">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: AMBER }} />
                <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ STATS */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { n: "10K+", label: "Happy Customers", Icon: Users },
              { n: "500+", label: "Premium Products", Icon: Package },
              { n: "99.8%", label: "Quality Assured", Icon: CheckCircle },
              { n: "24/7", label: "Customer Support", Icon: MessageCircle },
            ].map((s) => (
              <div key={s.label} className="group border border-slate-200 rounded-2xl p-5 sm:p-6 bg-white hover:border-[#0284c7] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${BLUE}12` }}>
                  <s.Icon className="w-5 h-5" style={{ color: BLUE }} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{s.n}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ MAIN SECTIONS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-14 md:py-16 space-y-16 sm:space-y-20">

        {/* ─── PRODUCTS SECTION */}
        <section id="products">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ background: BLUE }} />
                <span className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: BLUE }}>
                  {isNutra ? "Supplement Picks" : "Product Catalog"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isNutra ? "Top Wellness Supplements" : "Premium Health Products"}
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                Hand-curated {isNutra ? "wellness essentials" : "premium gear"} — verified by experts.
              </p>
            </div>

            <div className="flex items-center gap-0 border border-slate-200 rounded-xl overflow-hidden self-start sm:self-auto bg-white shadow-sm">
              <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all ${viewMode === "list" ? "text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`} style={viewMode === "list" ? { background: BLUE } : {}}>
                <List className="w-3.5 h-3.5" /> List
              </button>
              <div className="w-px h-9 bg-slate-200" />
              <button onClick={() => setViewMode("grid")} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all ${viewMode === "grid" ? "text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`} style={viewMode === "grid" ? { background: BLUE } : {}}>
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={viewMode === "list" ? "h-36 bg-slate-200 rounded-2xl animate-pulse" : "h-80"}>
                  {viewMode === "grid" && <SkeletonCard />}
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl text-center py-20 text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No products found in this category.</p>
            </div>
          ) : (
            <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"}>
              {products.slice(0, 8).map((product, i) => (
                <div key={product.id} className="relative">
                  {i === 0 && (
                    <div className="absolute -top-2.5 -left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md" style={{ background: AMBER, color: "#1e293b" }}>
                      <Star className="w-2.5 h-2.5 fill-current" /> #1 Pick
                    </div>
                  )}
                  <ProductCard product={product} variant={viewMode} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link href="/products" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95" style={{ background: "#0f172a" }}>
              View All Products
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* ─── INGREDIENTS */}
        {ingredients.length > 0 && (
          <section id="ingredients">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "#10b981" }} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-600">Science Inside</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Key Active Ingredients</h2>
                <p className="text-slate-500 text-sm mt-1.5 font-medium">Science-backed components with proven wellness benefits.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
                <FlaskConical className="w-3.5 h-3.5" />
                {ingredients.length} Ingredients
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {ingredients.map((ing) => (
                <div key={ing.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#0284c7] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                  <div className="relative h-32 bg-slate-50 overflow-hidden">
                    <Image src={ing.image || "/ingredient-placeholder.png"} alt={ing.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-[#0284c7] transition-colors">{ing.name}</h3>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${BLUE}12`, color: BLUE }}>
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── CATEGORIES */}
        <section id="categories">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-violet-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-violet-600">Browse by Type</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isNutra ? "Supplement Categories" : "Product Categories"}
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Explore our comprehensive wellness collections.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold self-start sm:self-auto">
              <Grid3X3 className="w-3.5 h-3.5" />
              {subcategories.length} Categories
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse" />)}
            </div>
          ) : subcategories.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl text-center py-16 text-slate-400">
              <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {subcategories.map((sub, idx) => (
                <div key={sub.id} className="relative">
                  {idx < 2 && (
                    <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Flame className="w-2.5 h-2.5" /> New
                    </div>
                  )}
                  <SubcategoryCard subcategory={sub} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── CTA SECTION */}
        <section>
          <div className="rounded-3xl overflow-hidden relative" style={{ background: "#0f172a" }}>
            {/* Left amber accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full" style={{ background: AMBER }} />
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

            <div className="relative z-10 px-8 sm:px-12 md:px-16 py-14 sm:py-16 md:py-20">
              <div className="max-w-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: AMBER }}>
                  Start Your Journey
                </p>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                  Ready to Transform Your Health?
                </h2>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                  Join 10,000+ satisfied customers who&apos;ve taken control of their wellness with expert-curated products.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="#products" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[0.85rem] font-black shadow-lg transition-all active:scale-95 hover:opacity-90" style={{ background: AMBER, color: "#1e293b" }}>
                    <ShoppingCart className="w-4 h-4" /> Shop Now
                  </a>
                  <Link href="/about" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[0.85rem] font-bold text-white transition-all" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
