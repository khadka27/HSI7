'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Image, Palette, Upload, X } from 'lucide-react';
import type { HeroSettings } from '@/lib/types';

export default function HeroSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch('/api/hero-settings')
      .then(r => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/hero-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed');
      router.push('/admin');
    } catch {
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<HeroSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update settings with the uploaded image URL
      updateSettings({ backgroundImage: result.url });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    updateSettings({ backgroundImage: '' });
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;
  if (!settings) return <p className="text-red-500">Failed to load settings.</p>;

  const heroStyle = settings.backgroundType === 'image' && settings.backgroundImage
    ? { backgroundImage: `url(${settings.backgroundImage})` }
    : {
        background: `linear-gradient(to bottom right, ${settings.gradientFrom}, ${settings.gradientVia}, ${settings.gradientTo})`
      };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Hero Section Settings</h1>
        <button
          onClick={() => setPreview(!preview)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          {preview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {preview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
          </div>
          <section 
            className="py-14 px-4 relative"
            style={{
              ...heroStyle,
              backgroundSize: settings.backgroundSize,
              backgroundPosition: settings.backgroundPosition,
            }}
          >
            {settings.backgroundType === 'image' && settings.backgroundImage && (
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${settings.overlayOpacity / 100})` }} />
            )}
            <div className="max-w-7xl mx-auto text-center relative z-10" style={{ color: settings.textColor }}>
              <p className="text-sm font-medium tracking-widest uppercase mb-3 opacity-80">
                {settings.subtitle}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                {settings.title}
              </h1>
              <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed opacity-90">
                {settings.description}
              </p>
            </div>
          </section>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

        {/* Content Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Content Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input
                required
                value={settings.title}
                onChange={e => updateSettings({ title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                placeholder="Your Wellness Journey Starts Here"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
              <input
                value={settings.subtitle}
                onChange={e => updateSettings({ subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                placeholder="Premium Health Products"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              required
              value={settings.description}
              onChange={e => updateSettings({ description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent resize-none"
              placeholder="Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
            <input
              type="color"
              value={settings.textColor}
              onChange={e => updateSettings({ textColor: e.target.value })}
              className="w-20 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Background Settings */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Background Settings
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="backgroundType"
                  value="gradient"
                  checked={settings.backgroundType === 'gradient'}
                  onChange={e => updateSettings({ backgroundType: e.target.value as 'gradient' | 'image' })}
                  className="text-[#16A34A] focus:ring-[#16A34A]"
                />
                <span className="text-sm">Gradient</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="backgroundType"
                  value="image"
                  checked={settings.backgroundType === 'image'}
                  onChange={e => updateSettings({ backgroundType: e.target.value as 'gradient' | 'image' })}
                  className="text-[#16A34A] focus:ring-[#16A34A]"
                />
                <span className="text-sm">Image</span>
              </label>
            </div>
          </div>

          {settings.backgroundType === 'gradient' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gradient From</label>
                <input
                  type="color"
                  value={settings.gradientFrom}
                  onChange={e => updateSettings({ gradientFrom: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gradient Via</label>
                <input
                  type="color"
                  value={settings.gradientVia}
                  onChange={e => updateSettings({ gradientVia: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gradient To</label>
                <input
                  type="color"
                  value={settings.gradientTo}
                  onChange={e => updateSettings({ gradientTo: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                
                {/* Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <span className="text-sm text-gray-500">or</span>
                    <span className="text-sm text-gray-500">enter URL below</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="text-xs text-gray-400">
                    Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
                  </div>
                </div>

                {/* URL Input */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Or enter image URL</label>
                  <input
                    value={settings.backgroundImage}
                    onChange={e => updateSettings({ backgroundImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                    placeholder="https://example.com/hero-background.jpg"
                  />
                </div>

                {/* Image Preview */}
                {settings.backgroundImage && (
                  <div className="mt-3 relative">
                    <div className="aspect-video w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 relative">
                      <img
                        src={settings.backgroundImage}
                        alt="Background preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click × to remove image</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Size</label>
                  <select
                    value={settings.backgroundSize}
                    onChange={e => updateSettings({ backgroundSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent bg-white"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Position</label>
                  <select
                    value={settings.backgroundPosition}
                    onChange={e => updateSettings({ backgroundPosition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent bg-white"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top left">Top Left</option>
                    <option value="top right">Top Right</option>
                    <option value="bottom left">Bottom Left</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Overlay Opacity (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={settings.overlayOpacity}
                    onChange={e => updateSettings({ overlayOpacity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{settings.overlayOpacity}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <Link
            href="/admin"
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}