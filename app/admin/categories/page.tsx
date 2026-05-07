'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/categories').then(r => r.json()).then(setCategories).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Description</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      cat.type === 'nutra' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'
                    }`}>{cat.type}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 truncate max-w-xs">{cat.description}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/categories/${cat.id}`} className="p-1.5 text-gray-400 hover:text-[#16A34A] rounded-lg hover:bg-green-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="py-12 text-center text-gray-400">No categories yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
