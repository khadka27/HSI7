'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Product, Subcategory } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json()),
    ]).then(([prods, subs]) => {
      setProducts(prods);
      setSubcategories(subs);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const getSubcategoryName = (id: string) => subcategories.find(s => s.id === id)?.name || '—';

  const filtered = products.filter(p => {
    const matchType = !typeFilter || p.categoryType === typeFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-white"
        >
          <option value="">All Types</option>
          <option value="nutra">Nutra</option>
          <option value="ecom">Ecom</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Subcategory</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Price</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {prod.image && <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{prod.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        prod.categoryType === 'nutra' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'
                      }`}>{prod.categoryType}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{getSubcategoryName(prod.subcategoryId)}</td>
                    <td className="px-5 py-4 font-semibold text-[#16A34A]">${prod.price.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/products/${prod.id}`} className="p-1.5 text-gray-400 hover:text-[#F59E0B] rounded-lg hover:bg-amber-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400">No products found.</div>}
        </div>
      )}
    </div>
  );
}
