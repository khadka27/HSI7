'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCheck, Loader2, AlertCircle, FileText, Image as ImageIcon, Star, Globe } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white';

const defaultForm = {
  name: '', title: '', bio: '', expertise: '',
  avatar: '', avatarAlt: '', website: '', twitter: '', linkedin: '',
  reviewCount: '', rating: '',
};

export default function NewAuthorPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create');
      router.push('/admin/authors');
    } catch { setError('Failed to create author. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/authors" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm"><UserCheck className="w-4 h-4 text-white" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">New Author</h1><p className="text-xs text-gray-400 mt-0.5">Add an author with trust signals</p></div>
      </div>

      {error && <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main */}
          <div className="xl:col-span-2 space-y-5">
            {/* Identity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-semibold text-gray-900">Author Identity</h3><p className="text-xs text-gray-400 mt-0.5">Name, title and biography</p></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label><input required value={form.name} onChange={set('name')} className={inputCls} placeholder="Dr. Jane Smith" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Title / Role</label><input value={form.title} onChange={set('title')} className={inputCls} placeholder="Certified Nutritionist" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Expertise / Credentials</label><input value={form.expertise} onChange={set('expertise')} className={inputCls} placeholder="15+ years in sports nutrition, PhD in Biochemistry" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label><textarea value={form.bio} onChange={set('bio')} rows={4} className={`${inputCls} resize-none`} placeholder="Brief author biography shown on articles…" /></div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"><Star className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-semibold text-gray-900">Trust Signals</h3><p className="text-xs text-gray-400 mt-0.5">Reviews and rating shown in article header</p></div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating <span className="text-xs font-normal text-gray-400">(1.0 – 5.0)</span></label>
                  <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={set('rating')} className={inputCls} placeholder="4.8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Count</label>
                  <input type="number" min="0" value={form.reviewCount} onChange={set('reviewCount')} className={inputCls} placeholder="1240" />
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-sky-500 to-blue-500" />
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center"><Globe className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-semibold text-gray-900">Links</h3><p className="text-xs text-gray-400 mt-0.5">Website and social profiles</p></div>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label><input type="url" value={form.website} onChange={set('website')} className={inputCls} placeholder="https://drjanesmith.com" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Twitter / X</label><input value={form.twitter} onChange={set('twitter')} className={inputCls} placeholder="@drjanesmith" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL</label><input type="url" value={form.linkedin} onChange={set('linkedin')} className={inputCls} placeholder="https://linkedin.com/in/…" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Publish</h3>
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Create Author'}
                </button>
                <Link href="/admin/authors" className="w-full flex items-center justify-center py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-semibold text-gray-900">Avatar</h3><p className="text-xs text-gray-400 mt-0.5">Author profile photo</p></div>
              </div>
              <div className="p-5">
                <ImageUpload value={form.avatar} alt={form.avatarAlt}
                  onChange={url => setForm(p => ({ ...p, avatar: url }))}
                  onAltChange={alt => setForm(p => ({ ...p, avatarAlt: alt }))}
                  type="author" accentColor="ring-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
