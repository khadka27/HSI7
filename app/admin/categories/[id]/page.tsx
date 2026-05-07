'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', type: 'nutra', description: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/categories/${id}`).then(r => r.json()).then(cat => {
      setForm({ name: cat.name, type: cat.type, description: cat.description || '', image: cat.image || '' });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      router.push('/admin/categories');
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/categories" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
          <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent bg-white">
            <option value="nutra">Nutra</option>
            <option value="ecom">Ecom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
          <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/categories" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
