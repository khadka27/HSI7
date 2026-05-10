"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    fetch(`/api/products`)
      .then((r) => r.json())
      .then((products: Product[]) => {
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.shortDescription.toLowerCase().includes(query.toLowerCase()),
        );
        setResults(filtered.slice(0, 6));
        setIsOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-11 pr-10 py-2.5 sm:py-3 md:py-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm md:text-base"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full mt-3 w-full bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-8 text-center text-white/60">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            </div>
          ) : results.length > 0 ? (
          <div className="max-h-64 sm:max-h-96 overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => { setQuery(""); setIsOpen(false); }}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                >
                  <img
                    src={product.featuredImage || product.image}
                    alt={product.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-white/60 truncate">{product.shortDescription}</p>
                  </div>
                  <p className="text-emerald-400 text-sm font-semibold flex-shrink-0">
                    ${product.price.toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-white/60">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
