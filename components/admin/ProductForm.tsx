'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { CircleAlert as AlertCircle, Upload, X } from 'lucide-react';
import type { Subcategory } from '@/lib/types';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface ProductFormData {
  name: string;
  price: string;
  categoryType: string;
  subcategoryId: string;
  shortDescription: string;
  detailedDescription: string;
  keyFeatures: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  featuredImage: string;
  readMoreLink: string;
}

interface Props {
  initialValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
}

export default function ProductForm({ initialValues, onSubmit, submitLabel, cancelHref }: Props) {
  const productImageRef = useRef<HTMLInputElement>(null);
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    price: '',
    categoryType: 'nutra',
    subcategoryId: '',
    shortDescription: '',
    detailedDescription: '',
    keyFeatures: '',
    metaTitle: '',
    metaDescription: '',
    image: '',
    featuredImage: '',
    readMoreLink: '',
    ...initialValues,
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [error, setError] = useState('');
  const [featuredImageWarning, setFeaturedImageWarning] = useState('');

  useEffect(() => {
    fetch('/api/subcategories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setSubcategories(data);
    });
  }, []);

  const filteredSubs = subcategories.filter(s => 
    s.categoryType?.toLowerCase() === form.categoryType?.toLowerCase()
  );

  const set = (key: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
  };

  const validateFeaturedImage = (url: string) => {
    if (!url) { setFeaturedImageWarning(''); return; }
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth !== 1200 || img.naturalHeight !== 680) {
        setFeaturedImageWarning(`Image is ${img.naturalWidth}x${img.naturalHeight}. Required: 1200x680`);
      } else {
        setFeaturedImageWarning('');
      }
    };
    img.onerror = () => setFeaturedImageWarning('');
    img.src = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, imageType: 'product' | 'featured') => {
    const setUploading = imageType === 'product' ? setUploadingProduct : setUploadingFeatured;
    const fileInputRef = imageType === 'product' ? productImageRef : featuredImageRef;
    
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

      // Update form with the uploaded image URL
      const imageKey = imageType === 'product' ? 'image' : 'featuredImage';
      setForm(prev => ({ ...prev, [imageKey]: result.url }));
      
      // Validate featured image dimensions if it's a featured image
      if (imageType === 'featured') {
        validateFeaturedImage(result.url);
      }
      
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

  const handleProductImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleImageUpload(file, 'product');
  };

  const handleFeaturedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleImageUpload(file, 'featured');
  };

  const removeImage = (imageType: 'product' | 'featured') => {
    const imageKey = imageType === 'product' ? 'image' : 'featuredImage';
    setForm(prev => ({ ...prev, [imageKey]: '' }));
    if (imageType === 'featured') {
      setFeaturedImageWarning('');
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Name *</label>
          <input required value={form.name} onChange={set('name')} className={inputClass} placeholder="Product name" />
        </div>
        <div>
          <label className={labelClass}>Price (USD) *</label>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={inputClass} placeholder="0.00" />
        </div>
        <div>
          <label className={labelClass}>Category Type *</label>
          <select required value={form.categoryType} onChange={e => {
            setForm(p => ({ ...p, categoryType: e.target.value, subcategoryId: '' }));
          }} className={`${inputClass} bg-white`}>
            <option value="nutra">Nutra</option>
            <option value="ecom">Ecom</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Subcategory *</label>
          <select required value={form.subcategoryId} onChange={set('subcategoryId')} className={`${inputClass} bg-white`}>
            <option value="">Select subcategory</option>
            {filteredSubs.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Description *</label>
        <textarea required value={form.shortDescription} onChange={set('shortDescription')} rows={2}
          className={`${inputClass} resize-none`} placeholder="Brief product description shown in cards" />
      </div>

      <div>
        <label className={labelClass}>
          Key Features
          <span className="ml-2 text-xs font-normal text-gray-400">One feature per line — shown as bullet points</span>
        </label>
        <textarea
          value={form.keyFeatures}
          onChange={set('keyFeatures')}
          rows={5}
          className={`${inputClass} resize-none font-mono text-sm`}
          placeholder={`Fast-acting formula\nClinically tested ingredients\nNo artificial additives\nSuitable for all ages`}
        />
      </div>

      <div>
        <label className={labelClass}>Detailed Description *</label>
        <RichTextEditor
          value={form.detailedDescription}
          onChange={val => setForm(p => ({ ...p, detailedDescription: val }))}
          placeholder="Type '/' for commands — add headings, lists, images, buttons…"
        />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input value={form.metaTitle} onChange={set('metaTitle')} className={inputClass} placeholder="SEO page title" />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea value={form.metaDescription} onChange={set('metaDescription')} rows={2}
              className={`${inputClass} resize-none`} placeholder="SEO meta description (150-160 chars recommended)" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Images & Links</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Product Image *</label>
            
            {/* Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => productImageRef.current?.click()}
                  disabled={uploadingProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingProduct ? 'Uploading...' : 'Upload Image'}
                </button>
                <span className="text-sm text-gray-500">or</span>
                <span className="text-sm text-gray-500">enter URL below</span>
              </div>

              <input
                ref={productImageRef}
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
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
                required 
                value={form.image} 
                onChange={set('image')} 
                className={inputClass} 
                placeholder="https://..." 
              />
            </div>

            {/* Image Preview */}
            {form.image && (
              <div className="mt-3 relative inline-block">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative">
                  <img src={form.image} alt="Product preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage('product')}
                    className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click × to remove</p>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Featured Image * <span className="text-gray-400 font-normal">(1200x680 recommended)</span></label>
            
            {/* Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => featuredImageRef.current?.click()}
                  disabled={uploadingFeatured}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingFeatured ? 'Uploading...' : 'Upload Featured Image'}
                </button>
                <span className="text-sm text-gray-500">or</span>
                <span className="text-sm text-gray-500">enter URL below</span>
              </div>

              <input
                ref={featuredImageRef}
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                className="hidden"
              />

              <div className="text-xs text-gray-400">
                Recommended size: 1200x680 pixels for best display
              </div>
            </div>

            {/* URL Input */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Or enter featured image URL</label>
              <input 
                required 
                value={form.featuredImage}
                onChange={e => { set('featuredImage')(e); validateFeaturedImage(e.target.value); }}
                className={inputClass} 
                placeholder="https://... (1200x680 px recommended)" 
              />
            </div>

            {/* Validation Warning */}
            {featuredImageWarning && (
              <div className="mt-1.5 flex items-center gap-1.5 text-amber-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {featuredImageWarning}
              </div>
            )}

            {/* Image Preview */}
            {form.featuredImage && (
              <div className="mt-3 relative inline-block">
                <div className="aspect-[1200/680] w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 relative">
                  <img src={form.featuredImage} alt="Featured preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage('featured')}
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
          <div>
            <label className={labelClass}>Read More Link</label>
            <input value={form.readMoreLink} onChange={set('readMoreLink')} className={inputClass} placeholder="https://..." type="url" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
          {saving ? 'Saving...' : submitLabel}
        </button>
        <Link href={cancelHref} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</Link>
      </div>
    </form>
  );
}
