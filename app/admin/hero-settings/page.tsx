'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Settings, Loader2, AlertCircle, CheckCircle2,
  Type, Image as ImageIcon, Eye, EyeOff, Upload, X, Palette,
} from 'lucide-react';
import type { HeroSettings } from '@/lib/types';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white';

function SectionCard({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export default function HeroSettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    fetch('/api/hero-settings').then(r => r.json()).then(setSettings).finally(() => setLoading(false));
  }, []);

  const update = (updates: Partial<HeroSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/hero-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed');
      const savedRow = await res.json();
      if (savedRow && !savedRow.error) setSettings(savedRow);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'hero');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      update({ backgroundImage: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;
  if (!settings) return <p className="text-red-500">Failed to load settings.</p>;

  const heroStyle = settings.backgroundType === 'image' && settings.backgroundImage
    ? { backgroundImage: `url(${settings.backgroundImage})`, backgroundSize: settings.backgroundSize, backgroundPosition: settings.backgroundPosition }
    : { background: `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientVia}, ${settings.gradientTo})` };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Hero Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Customize your homepage hero banner</p>
        </div>
        <button type="button" onClick={() => setPreview(p => !p)}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Banners */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />Settings saved successfully!
        </div>
      )}

      {/* Live preview */}
      {preview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-blue-400" />
            </div>
            <span className="text-xs text-gray-400 ml-2">Live Preview</span>
          </div>
          <section className="relative py-12 px-6 overflow-hidden" style={heroStyle}>
            {settings.backgroundType === 'image' && settings.backgroundImage && (
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${settings.overlayOpacity / 100})` }} />
            )}
            <div className="relative z-10 max-w-2xl mx-auto text-center" style={{ color: settings.textColor }}>
              {settings.subtitle && (
                <p className="text-xs font-bold tracking-widest uppercase mb-3 opacity-75">{settings.subtitle}</p>
              )}
              <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-3">{settings.title || 'Your Title Here'}</h1>
              <p className="text-sm sm:text-base opacity-85 leading-relaxed">{settings.description || 'Your description here'}</p>
            </div>
          </section>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Main — 2/3 */}
          <div className="xl:col-span-2 space-y-5">

            {/* Content */}
            <SectionCard icon={Type} title="Content" subtitle="Title, subtitle and description text">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input required value={settings.title} onChange={e => update({ title: e.target.value })} className={inputCls} placeholder="Your Wellness Journey Starts Here" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle <span className="text-xs font-normal text-gray-400">(badge text)</span></label>
                  <input value={settings.subtitle} onChange={e => update({ subtitle: e.target.value })} className={inputCls} placeholder="Premium Health Products" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea required value={settings.description} onChange={e => update({ description: e.target.value })} rows={3}
                  className={`${inputCls} resize-none`} placeholder="Discover science-backed supplements…" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.textColor} onChange={e => update({ textColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <span className="text-sm text-gray-500 font-mono">{settings.textColor}</span>
                  <button type="button" onClick={() => update({ textColor: '#FFFFFF' })}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg">White</button>
                  <button type="button" onClick={() => update({ textColor: '#111827' })}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg">Dark</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Buy Now Link
                  <span className="ml-2 text-xs font-normal text-gray-400">URL for the Buy Now button (leave empty to hide)</span>
                </label>
                <input
                  type="url"
                  value={settings.buyNowLink || ''}
                  onChange={e => update({ buyNowLink: e.target.value })}
                  className={inputCls}
                  placeholder="https://example.com/shop"
                />
              </div>
            </SectionCard>

            {/* Background */}
            <SectionCard icon={ImageIcon} title="Background" subtitle="Gradient or image background">
              {/* Type toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {(['gradient', 'image'] as const).map(t => (
                  <button key={t} type="button" onClick={() => update({ backgroundType: t })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      settings.backgroundType === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {t === 'gradient' ? '🎨 Gradient' : '🖼 Image'}
                  </button>
                ))}
              </div>

              {settings.backgroundType === 'gradient' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Gradient Colors</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'From', key: 'gradientFrom' as const, value: settings.gradientFrom },
                      { label: 'Via',  key: 'gradientVia'  as const, value: settings.gradientVia },
                      { label: 'To',   key: 'gradientTo'   as const, value: settings.gradientTo },
                    ].map(({ label, key, value }) => (
                      <div key={key} className="text-center">
                        <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
                        <input type="color" value={value} onChange={e => update({ [key]: e.target.value })}
                          className="w-full h-14 rounded-xl border border-gray-200 cursor-pointer p-1" />
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">{value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Gradient preview swatch */}
                  <div className="mt-3 h-8 rounded-xl" style={{ background: `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientVia}, ${settings.gradientTo})` }} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload zone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                    <div
                      onClick={() => !uploading && fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        uploading ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/30'
                      }`}
                    >
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                          <p className="text-sm text-violet-600">Uploading…</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <Upload className="w-6 h-6 text-gray-300" />
                          <p className="text-sm text-gray-500">Drop image or <span className="text-violet-600 font-medium">click to browse</span></p>
                          <p className="text-xs text-gray-400">JPEG · PNG · WebP — max 5 MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Or enter image URL</label>
                    <input value={settings.backgroundImage} onChange={e => update({ backgroundImage: e.target.value })}
                      className={inputCls} placeholder="https://example.com/hero.jpg" />
                  </div>

                  {settings.backgroundImage && (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                      <img src={settings.backgroundImage} alt="Background preview" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <button type="button" onClick={() => update({ backgroundImage: '' })}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Size</label>
                      <select value={settings.backgroundSize} onChange={e => update({ backgroundSize: e.target.value })} className={inputCls}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                      <select value={settings.backgroundPosition} onChange={e => update({ backgroundPosition: e.target.value })} className={inputCls}>
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="top left">Top Left</option>
                        <option value="top right">Top Right</option>
                        <option value="bottom left">Bottom Left</option>
                        <option value="bottom right">Bottom Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Overlay <span className="text-gray-400 font-normal">{settings.overlayOpacity}%</span>
                      </label>
                      <input type="range" min="0" max="80" value={settings.overlayOpacity}
                        onChange={e => update({ overlayOpacity: parseInt(e.target.value) })}
                        className="w-full accent-violet-500 mt-2" />
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-5">
            {/* Publish */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Publish</h3>
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Settings'}
                </button>
                <Link href="/admin" className="w-full flex items-center justify-center py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
                <Link href="/" target="_blank"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-violet-200 bg-violet-50 rounded-xl text-sm text-violet-700 hover:bg-violet-100 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View Live Site
                </Link>
              </div>
            </div>

            {/* Quick tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-gray-900">Tips</h3>
              </div>
              <div className="p-5 space-y-3 text-xs text-gray-500">
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <p>Use <strong>white text</strong> on dark gradient backgrounds for best readability.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <p>For image backgrounds, set overlay to <strong>30–50%</strong> to keep text readable.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <p>Recommended image size: <strong>1920×600px</strong> or wider.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <p>Keep the title under <strong>60 characters</strong> for mobile display.</p>
                </div>
              </div>
            </div>

            {/* Current gradient preview */}
            {settings.backgroundType === 'gradient' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Gradient Preview</p>
                  <div className="h-20 rounded-xl" style={{ background: `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientVia}, ${settings.gradientTo})` }} />
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-400">
                    <span>{settings.gradientFrom}</span>
                    <span>{settings.gradientVia}</span>
                    <span>{settings.gradientTo}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
