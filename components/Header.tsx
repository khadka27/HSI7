"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import CategoryToggle from "./CategoryToggle";
import SearchBar from "./SearchBar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px] gap-4">

          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/25">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-base md:text-xl font-semibold text-slate-900 tracking-tight">
                  Health<span className="text-blue-600">Store</span>
                </span>
              </div>
            </Link>

            <Link href="/products" className="hidden lg:block text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
              Products
            </Link>
          </div>

          {/* Center — toggle always visible on desktop */}
          <div className="hidden md:flex items-center gap-4">
            <CategoryToggle />
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                searchOpen 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Right — Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-lg transition-colors ${searchOpen ? "text-blue-600" : "text-slate-600"}`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg text-slate-600 hover:bg-blue-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Field Area — Slides down */}
        {searchOpen && (
          <div className="py-4 border-t border-blue-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <SearchBar />
          </div>
        )}

        {/* Mobile menu — toggle full width */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-100 pt-3 flex flex-col gap-3">
            <CategoryToggle />
            <Link 
              href="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 bg-blue-50 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center justify-between"
            >
              All Products
              <span className="text-lg">→</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
