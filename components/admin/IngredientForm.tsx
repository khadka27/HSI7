'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, Loader2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Ingredient } from '@/lib/types';

interface Props {
  initialData?: Ingredient;
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white transition-all';

export default function IngredientForm({ initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    imageAlt: initialData?.imageAlt || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEdit ? `/api/ingredients/${initialData.id}` : '/api/ingredients';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      router.push('/admin/ingredients');
      router.refresh();
    } catch (err) {
      setError('Failed to save ingredient. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/ingredients" className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:shadow-md transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Ingredient' : 'New Ingredient'}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Update existing ingredient details' : 'Create a new supplement ingredient'}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Ingredient Details</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ingredient Name</label>
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  className={inputCls}
                  placeholder="e.g. Ashwagandha Root"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Slug</label>
                <input
                  value={form.slug}
                  onChange={set('slug')}
                  className={inputCls}
                  placeholder="ashwagandha-root"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 italic">Leave empty to auto-generate from name</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={6}
                  className={`${inputCls} resize-none`}
                  placeholder="What are the benefits and uses of this ingredient?"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Publish Changes</h3>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl text-sm font-bold transition-all hover:shadow-xl hover:shadow-amber-500/20 active:scale-95"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  isEdit ? 'Update Ingredient' : 'Create Ingredient'
                )}
              </button>
              <Link href="/admin/ingredients" className="w-full flex items-center justify-center py-3 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all">
                Cancel
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Thumbnail</h3>
            </div>
            <div className="p-6">
              <ImageUpload
                value={form.image}
                alt={form.imageAlt}
                onChange={url => setForm(p => ({ ...p, image: url }))}
                onAltChange={alt => setForm(p => ({ ...p, imageAlt: alt }))}
                type="ingredient"
                accentColor="ring-amber-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
