'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen, Layers, Package, ArrowRight, Settings, LucideIcon } from 'lucide-react';

interface DashboardCard {
  label: string;
  count: number;
  icon: LucideIcon;
  href: string;
  color: string;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ categories: 0, subcategories: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([cats, subs, prods]) => {
      setCounts({ categories: cats.length, subcategories: subs.length, products: prods.length });
    }).finally(() => setLoading(false));
  }, []);

  const cards: DashboardCard[] = [
    { label: 'Categories', count: counts.categories, icon: FolderOpen, href: '/admin/categories', color: 'bg-green-500' },
    { label: 'Subcategories', count: counts.subcategories, icon: Layers, href: '/admin/subcategories', color: 'bg-sky-500' },
    { label: 'Products', count: counts.products, icon: Package, href: '/admin/products', color: 'bg-amber-500' },
    { label: 'Hero Settings', count: 1, icon: Settings, href: '/admin/hero-settings', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your store content from here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(card => {
          const IconComponent = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '—' : card.count}
                </p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-sm font-medium transition-colors">
            + Add Product
          </Link>
          <Link href="/admin/subcategories/new" className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg text-sm font-medium transition-colors">
            + Add Subcategory
          </Link>
          <Link href="/admin/categories/new" className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-sm font-medium transition-colors">
            + Add Category
          </Link>
        </div>
      </div>
    </div>
  );
}
