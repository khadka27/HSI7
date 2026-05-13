'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Search, Image as ImageIcon, Globe,
  Eye, Save, Send, Loader2, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, User, Tag, Calendar,
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white transition-all';

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  authorId: string;
  status: string;
}

interface Props {
  initialData?: any;
  onSave: (data: ArticleData, publish: boolean) => Promise<void>;
}

function SectionCard({ icon: Icon, title, subtitle, accent = 'teal', children, collapsible = false }: {
  icon: React.ElementType; title: string; subtitle?: string;
  accent?: string; children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const accents: Record<string, string> = {
    teal:   'from-teal-500 to-emerald-600',
    violet: 'from-violet-500 to-purple-500',
    amber:  'from-amber-500 to-orange-500',
    sky:    'from-sky-500 to-blue-500',
    rose:   'from-rose-500 to-pink-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-0.5 bg-gradient-to-r ${accents[accent]}`} />
      <button type="button" onClick={() => collapsible && setOpen(v => !v)}
        className={`w-full px-6 py-4 border-b border-gray-50 flex items-center gap-3 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accents[accent]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
      </button>
      {(!collapsible || open) && <div className="p-6 space-y-5">{children}</div>}
    </div>
  );
}

export default function ArticleEditor({ initialData, onSave }: Props) {
  const [form, setForm] = useState<ArticleData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    featuredImageAlt: initialData?.featuredImageAlt || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
    authorId: initialData?.authorId || '',
    status: initialData?.status || 'DRAFT',
  });

  const [authors, setAuthors] = useState<{ id: string; name: string; title: string | null }[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);

  useEffect(() => {
    fetch('/api/authors').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAuthors(data);
    });
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && form.title) {
      const slug = form.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setForm(p => ({ ...p, slug }));
    }
  }, [form.title, slugManual]);

  // Auto-fill meta title from title
  useEffect(() => {
    if (!form.metaTitle && form.title) {
      setForm(p => ({ ...p, metaTitle: form.title }));
    }
  }, [form.title]);

  const set = (key: keyof ArticleData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    const setter = publish ? setPublishing : setSaving;
    setter(true);
    setError('');
    try {
      await onSave(form, publish);
      setSaved(true);
      if (publish) setForm(p => ({ ...p, status: 'PUBLISHED' }));
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setter(false);
    }
  };

  const charCount = form.metaDescription.length;
  const isPublished = form.status === 'PUBLISHED';

  return (
    <div className="max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/articles" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isPublished ? 'Published' : 'Draft'} · {form.content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length} words
          </p>
        </div>
        {isPublished && (
          <Link href={`/article/${form.slug}`} target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-teal-600 border border-teal-200 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View Live
          </Link>
        )}
      </div>

      {/* Banners */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />Article saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Main — 2/3 */}
        <div className="xl:col-span-2 space-y-5">

          {/* Title + Slug */}
          <SectionCard icon={FileText} title="Article Content" subtitle="Title, slug and body content" accent="teal">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input value={form.title} onChange={set('title')} className={`${inputCls} text-lg font-semibold`}
                placeholder="Best Protein Powders for Muscle Gain in 2026" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL Slug
                <span className="ml-2 text-xs font-normal text-gray-400">/article/{form.slug || 'your-slug'}</span>
              </label>
              <input value={form.slug} onChange={e => { setSlugManual(true); set('slug')(e); }}
                className={`${inputCls} font-mono text-sm`} placeholder="best-protein-powders-2026" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Excerpt
                <span className="ml-2 text-xs font-normal text-gray-400">Shown in article cards and meta description fallback</span>
              </label>
              <textarea value={form.excerpt} onChange={set('excerpt')} rows={2}
                className={`${inputCls} resize-none`}
                placeholder="A short compelling summary of the article (1–2 sentences)…" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Type <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-[10px]">/</kbd> for blocks — headings, lists, images, tables, reviews, buttons…
                </span>
              </label>
              <RichTextEditor
                value={form.content}
                onChange={val => setForm(p => ({ ...p, content: val }))}
                placeholder="Start writing your article… Type / for commands"
              />
            </div>
          </SectionCard>

          {/* SEO */}
          <SectionCard icon={Search} title="SEO Settings" subtitle="Meta title, description and keywords" accent="violet" collapsible>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta Title
                <span className="ml-2 text-xs font-normal text-gray-400">{form.metaTitle.length}/60 chars</span>
              </label>
              <input value={form.metaTitle} onChange={set('metaTitle')} className={inputCls}
                placeholder={form.title || 'SEO page title'} />
              {form.metaTitle.length > 60 && (
                <p className="text-xs text-amber-500 mt-1">Too long — keep under 60 characters</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta Description
                <span className={`ml-2 text-xs font-normal ${charCount > 160 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {charCount}/160 chars
                </span>
              </label>
              <textarea value={form.metaDescription} onChange={set('metaDescription')} rows={3}
                className={`${inputCls} resize-none`}
                placeholder={form.excerpt || 'Compelling description for search results (150–160 chars)'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Keywords
                <span className="ml-2 text-xs font-normal text-gray-400">Comma-separated</span>
              </label>
              <input value={form.metaKeywords} onChange={set('metaKeywords')} className={inputCls}
                placeholder="protein powder, muscle gain, whey protein, supplements" />
            </div>

            {/* SERP Preview */}
            {(form.metaTitle || form.title) && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Google Preview</p>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-400">https://healthstoreinfo7.top/article/{form.slug}</p>
                  <p className="text-blue-700 text-base font-medium leading-tight hover:underline cursor-pointer line-clamp-1">
                    {form.metaTitle || form.title}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {form.metaDescription || form.excerpt || 'No description set.'}
                  </p>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-5">

          {/* Publish */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-teal-500 to-emerald-600" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Publish</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <button type="button" onClick={() => handleSave(true)} disabled={publishing || saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Send className="w-4 h-4" /> {isPublished ? 'Update & Publish' : 'Publish'}</>}
              </button>

              <button type="button" onClick={() => handleSave(false)} disabled={saving || publishing}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Draft</>}
              </button>

              <Link href="/admin/articles" className="w-full flex items-center justify-center py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </Link>
            </div>
          </div>

          {/* Featured Image */}
          <SectionCard icon={ImageIcon} title="Featured Image" subtitle="Article hero image" accent="rose">
            <ImageUpload
              value={form.featuredImage}
              alt={form.featuredImageAlt}
              onChange={url => setForm(p => ({ ...p, featuredImage: url }))}
              onAltChange={alt => setForm(p => ({ ...p, featuredImageAlt: alt }))}
              type="article"
              accentColor="ring-teal-500"
            />
          </SectionCard>

          {/* Author */}
          <SectionCard icon={User} title="Author" subtitle="Article author for trust signals" accent="sky">
            <select value={form.authorId} onChange={set('authorId')} className={inputCls}>
              <option value="">No author</option>
              {authors.map(a => (
                <option key={a.id} value={a.id}>{a.name}{a.title ? ` — ${a.title}` : ''}</option>
              ))}
            </select>
            {!authors.length && (
              <p className="text-xs text-gray-400">
                <Link href="/admin/authors/new" className="text-teal-600 hover:underline">Add an author</Link> to show trust signals.
              </p>
            )}
          </SectionCard>

          {/* Article info */}
          {initialData && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Article Info</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created</span>
                  <span>{new Date(initialData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Updated</span>
                  <span>{new Date(initialData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {initialData.publishedAt && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Published</span>
                    <span>{new Date(initialData.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Words</span>
                  <span>{form.content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
