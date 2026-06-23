"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import Pagination from "@/components/Pagination";
import { PackageSearch, Filter, List, LayoutGrid } from "lucide-react";
import type { Product } from "@/lib/types";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeType, setActiveType] = useState<string>(searchParams.get("type") || "");

  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    const typeQuery = activeType ? `&type=${activeType}` : "";
    fetch(`/api/products?page=${page}&limit=12${typeQuery}&status=PUBLISHED`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, activeType]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    const params = new URLSearchParams(searchParams);
    if (type) params.set("type", type);
    else params.delete("type");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#fafbfc]">
      {/* Header */}
      <section className="relative bg-slate-900 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-dark.svg')] opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 ring-1 ring-blue-500/30 backdrop-blur-md">
              <PackageSearch className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Explore Our <span className="text-blue-400">Products</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
              Discover our curated selection of premium supplements and wellness products, 
              scientifically formulated for maximum efficacy.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex items-center gap-2 mr-2 text-gray-400">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Filter:</span>
            </div>
            {[
              { id: "", label: "All Products" },
              { id: "nutra", label: "Supplements" },
              { id: "ecom", label: "E-commerce" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeType === t.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <div className="h-8 w-px bg-gray-100 mx-1" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {pagination.total} Results
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={viewMode === "list" ? "h-64 bg-gray-50 rounded-3xl animate-pulse" : "h-80"}>
                {viewMode === "grid" && <SkeletonCard />}
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className={viewMode === "list" ? "flex flex-col gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant={viewMode} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
      <ProductsContent />
    </Suspense>
  );
}
