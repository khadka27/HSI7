"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Shield } from "lucide-react";
import CategoryToggle from "./CategoryToggle";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-700/25">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-base md:text-xl font-semibold text-slate-900 tracking-tight">
                Health<span className="text-emerald-600">Store</span>
              </span>
              <p className="hidden md:block text-[11px] uppercase tracking-[0.18em] text-emerald-700/75">
                Premium wellness picks
              </p>
            </div>
          </Link>

          {/* Desktop toggle + admin */}
         

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-emerald-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-emerald-100 space-y-3 pt-3">
            <CategoryToggle />
          </div>
        )}
      </div>
    </header>
  );
}
