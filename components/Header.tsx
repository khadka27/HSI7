'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Menu, X, Shield } from 'lucide-react';
import CategoryToggle from './CategoryToggle';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Health<span className="text-[#16A34A]">Store</span>
            </span>
          </Link>

          {/* Desktop toggle + admin */}
          <div className="hidden md:flex items-center gap-4">
            <CategoryToggle />
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-4">
            <CategoryToggle />
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 w-full justify-center"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
