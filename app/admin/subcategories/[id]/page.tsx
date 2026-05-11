'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, Loader2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent bg-white';

export default function EditSubcategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', categoryType: 'nutra', description: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/subcategories/${id}`).then(r => r.json()).then(sub => {
      setForm({ name: sub.name ?? '', categoryType: sub.categoryType ?? 'nutra', description: sub.description ?? '', image: sub.image ?? '' });
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/subcategories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed');
      router.push('/admin/subcategories');
    } catch { setError('Failed to update. Please try again.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/subcategories" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm"><Layers className="w-4 h-4 text-white" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Edit Subcategory</h1><p className="text-xs text-gray-400 mt-0.5">{form.name || 'Update subcategory details'}</p></div>
      </div>
      {error && <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-sky-500 to-blue-500" />
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-semibold text-gray-900">Subcategory Details</h3><p className="text-xs text-gray-400 mt-0.5">Name, type and description</p></div>
              </div>
              <div className="p-6 space-y-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label><input required value={form.name} onChange={set('name')} className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category Type <span className="text-red-500">*</span></label><select required value={form.categoryType} onChange={set('categoryType')} className={inputCls}><option value="nutra">🌿 Nutra</option><option value="ecom">🛒 Ecom</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><textarea value={form.description} onChange={set('description')} rows={4} className={`${inputCls} resize-none`} /></div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-sky-500 to-blue-500" />
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Publish</h3>
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
                </button>
                <Link href="/admin/subcategories" className="w-full flex items-center justify-center py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-sky-500 to-blue-500" />
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-semibold text-gray-900">Image</h3><p className="text-xs text-gray-400 mt-0.5">Subcategory thumbnail</p></div>
              </div>
              <div className="p-5">
                <ImageUpload value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} type="subcategory" accentColor="ring-[#0EA5E9]" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
