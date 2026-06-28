"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";

interface SearchBarProps {
  isNavbar?: boolean;
  onClose?: () => void;
}

export default function SearchBar({ isNavbar = false, onClose }: SearchBarProps) {
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
      .then((data: { products: Product[] }) => {
        const products = data.products || [];
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
    <div
      ref={containerRef}
      className={
        isNavbar
          ? "relative w-full md:w-60 md:focus-within:w-72 lg:w-64 lg:focus-within:w-80 transition-all duration-300"
          : "relative w-full max-w-3xl mx-auto"
      }
    >
      <div className="relative group">
        <Search
          className={`absolute ${
            isNavbar ? "left-3.5 w-4 h-4" : "left-4 w-5 h-5"
          } top-1/2 -translate-y-1/2 text-blue-600/40 pointer-events-none group-focus-within:text-blue-600 transition-colors`}
        />
        <input
          type="text"
          placeholder={isNavbar ? "Search products..." : "Search for supplements or products..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className={
            isNavbar
              ? "w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm"
              : "w-full pl-12 pr-12 py-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
          }
          autoFocus={isNavbar ? !!onClose : false}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className={`absolute ${
              isNavbar ? "right-3.5" : "right-4"
            } top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors`}
          >
            <X className={isNavbar ? "w-4 h-4" : "w-5 h-5"} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div
          className={`absolute top-full mt-2 w-full bg-white border border-blue-100 rounded-2xl shadow-2xl shadow-blue-900/10 z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isNavbar ? "md:w-[380px] md:right-0" : ""
          }`}
        >
          {loading ? (
            <div className="px-4 py-10 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-100 border-t-blue-600 rounded-full" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Quick Results
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                    if (onClose) onClose();
                  }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50/50 rounded-2xl transition-all duration-200 group border-b border-gray-50 last:border-0"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-bold truncate group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {product.shortDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 text-sm font-extrabold">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-slate-500">
              <Search className="w-10 h-10 text-blue-100 mx-auto mb-3" />
              <p className="text-sm font-medium">
                No results found for{" "}
                <span className="text-slate-900">&ldquo;{query}&rdquo;</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try a different keyword or check your spelling
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
