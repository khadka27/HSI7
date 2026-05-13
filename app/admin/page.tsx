'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  FolderOpen, Layers, Package, Settings, LucideIcon,
  TrendingUp, Plus, ArrowRight, Activity,
} from 'lucide-react';

interface DashboardCard {
  label: string;
  count: number;
  icon: LucideIcon;
  href: string;
  newHref: string;
  gradient: string;
  iconBg: string;
  change?: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [counts, setCounts] = useState({ categories: 0, subcategories: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()).catch(() => []),
      fetch('/api/subcategories').then(r => r.json()).catch(() => []),
      fetch('/api/products').then(r => r.json()).catch(() => []),
    ]).then(([cats, subs, prods]) => {
      const productList = Array.isArray(prods)
        ? prods
        : ((prods as { products?: unknown[] })?.products ?? []);
      setCounts({
        categories: Array.isArray(cats) ? cats.length : 0,
        subcategories: Array.isArray(subs) ? subs.length : 0,
        products: Array.isArray(productList) ? productList.length : 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards: DashboardCard[] = [
    {
      label: 'Products',
      count: counts.products,
      icon: Package,
      href: '/admin/products',
      newHref: '/admin/products/new',
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Categories',
      count: counts.categories,
      icon: FolderOpen,
      href: '/admin/categories',
      newHref: '/admin/categories/new',
      gradient: 'from-blue-500 to-teal-500',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Subcategories',
      count: counts.subcategories,
      icon: Layers,
      href: '/admin/subcategories',
      newHref: '/admin/subcategories/new',
      gradient: 'from-sky-500 to-blue-500',
      iconBg: 'bg-sky-100 text-sky-600',
    },
    {
      label: 'Hero Settings',
      count: 1,
      icon: Settings,
      href: '/admin/hero-settings',
      newHref: '/admin/hero-settings',
      gradient: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-100 text-violet-600',
    },
  ];

  const quickActions = [
    { label: 'New Product',      href: '/admin/products/new',      color: 'bg-amber-500 hover:bg-amber-600',   icon: Package },
    { label: 'New Subcategory',  href: '/admin/subcategories/new', color: 'bg-sky-500 hover:bg-sky-600',       icon: Layers },
    { label: 'New Category',     href: '/admin/categories/new',    color: 'bg-blue-600 hover:bg-blue-700', icon: FolderOpen },
    { label: 'Hero Settings',    href: '/admin/hero-settings',     color: 'bg-violet-500 hover:bg-violet-600', icon: Settings },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = session?.user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">{name}</h1>
            <p className="text-blue-200/80 text-sm mt-1">
              You have <span className="text-white font-semibold">{counts.products}</span> products across <span className="text-white font-semibold">{counts.categories}</span> categories.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
            <Activity className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium">Store Active</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.href} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200">
              <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Link href={card.newHref}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    title={`Add ${card.label}`}>
                    <Plus className="w-3.5 h-3.5 text-gray-500" />
                  </Link>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {loading ? <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" /> : card.count}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <Link href={card.href} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors">
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions + overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Quick actions */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 ${action.color} text-white rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Store Overview</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total Products',      value: counts.products,      max: Math.max(counts.products, 1),      color: 'bg-amber-500' },
              { label: 'Total Categories',    value: counts.categories,    max: Math.max(counts.categories, 1),    color: 'bg-blue-500' },
              { label: 'Total Subcategories', value: counts.subcategories, max: Math.max(counts.subcategories, 1), color: 'bg-sky-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {loading ? '—' : item.value}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: loading ? '0%' : `${Math.min((item.value / Math.max(item.max, 10)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Products', value: counts.products, href: '/admin/products' },
              { label: 'Categories', value: counts.categories, href: '/admin/categories' },
              { label: 'Subcategories', value: counts.subcategories, href: '/admin/subcategories' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                <p className="text-xl font-bold text-gray-900 tabular-nums">
                  {loading ? '—' : item.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-700 transition-colors">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
