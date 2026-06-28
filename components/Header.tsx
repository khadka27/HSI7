"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px] gap-4 relative">

          {/* Logo (Left) */}
          <div className="flex items-center shrink-0 z-10">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 md:h-10 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Links (Center) */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="relative group text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/products" className="relative group text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
              <span>Products</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="relative group text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
              <span>About</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4 z-10">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                searchOpen 
                  ? "bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)]" 
                  : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
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
              className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${searchOpen ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
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
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center justify-between"
            >
              Home
              <span className="text-lg">→</span>
            </Link>
            <Link 
              href="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 bg-blue-50 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center justify-between"
            >
              All Products
              <span className="text-lg">→</span>
            </Link>
            <Link 
              href="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center justify-between"
            >
              About
              <span className="text-lg">→</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
