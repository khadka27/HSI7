"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Upload,
  X,
  Package,
  FileText,
  Star,
  Image as ImageIcon,
  Search,
  Link as LinkIcon,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { Subcategory } from "@/lib/types";
import RichTextEditor from "@/components/admin/RichTextEditor";

export interface ProductFormData {
  name: string;
  price: string;
  categoryType: string;
  subcategoryId: string;
  authorId: string;
  shortDescription: string;
  detailedDescription: string;
  keyFeatures: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  featuredImage: string;
  readMoreLink: string;
  buyNowLink: string;
  ingredientIds: string[];
  status: string;
}

interface Props {
  initialValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData, publish: boolean) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
}

// Compress uploads before sending them to the server to avoid 413 payloads.
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxDimension = 1600;
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);

        const encode = (
          mimeType: "image/webp" | "image/jpeg",
          quality: number,
        ) =>
          new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob((blob) => resolveBlob(blob), mimeType, quality);
          });

        const tryCompress = async () => {
          for (const mimeType of ["image/webp", "image/jpeg"] as const) {
            let quality = 0.82;
            while (quality >= 0.2) {
              const blob = await encode(mimeType, quality);
              if (blob && blob.size <= 100 * 1024) {
                resolve(blob);
                return;
              }
              quality = Number((quality - 0.1).toFixed(2));
            }
          }

          const fallback = await encode("image/jpeg", 0.2);
          resolve(fallback || file);
        };

        void tryCompress();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function getCompressedFileName(fileName: string, mimeType: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  return `${baseName}.${extension}`;
}

// ── Reusable field components ─────────────────────────────────────────────────
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && (
          <span className="ml-2 text-xs font-normal text-gray-400">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  accent = "amber",
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const accents: Record<string, string> = {
    amber: "from-amber-500 to-orange-500",
    blue: "from-blue-500 to-indigo-500",
    violet: "from-violet-500 to-purple-500",
    rose: "from-rose-500 to-pink-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className={`h-0.5 bg-gradient-to-r ${accents[accent] || accents.amber}`}
      />
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accents[accent]} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ── Image upload zone ─────────────────────────────────────────────────────────
function ImageZone({
  label,
  hint,
  value,
  uploading,
  onUpload,
  onUrl,
  onRemove,
  warning,
}: {
  label: string;
  hint?: string;
  value: string;
  uploading: boolean;
  onUpload: (f: File) => void;
  onUrl: (url: string) => void;
  onRemove: () => void;
  warning?: string;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {hint && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {hint}
            </span>
          )}
        </label>
        <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg text-xs font-medium">
          {(["upload", "url"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-md transition-colors capitalize ${tab === t ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t === "upload" ? "📁 Upload" : "🔗 URL"}
            </button>
          ))}
        </div>
      </div>

      {tab === "upload" ? (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 hover:border-amber-400 hover:bg-amber-50/30"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-7 h-7 text-gray-300" />
              <p className="text-sm text-gray-500">
                Drop image or{" "}
                <span className="text-amber-600 font-medium">
                  click to browse
                </span>
              </p>
              <p className="text-xs text-gray-400">
                JPEG · PNG · WebP · GIF — max 5 MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <button
            type="button"
            disabled={!urlInput.trim()}
            onClick={() => {
              onUrl(urlInput.trim());
              setUrlInput("");
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {warning && (
        <div className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {warning}
        </div>
      )}

      {value && (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
            ✓ Image set
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel,
  cancelHref,
}: Props) {
  const productImageRef = useRef<HTMLInputElement>(null);
  const featuredImageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormData>({
    name: "",
    price: "",
    categoryType: "nutra",
    subcategoryId: "",
    authorId: "",
    shortDescription: "",
    detailedDescription: "",
    keyFeatures: "",
    metaTitle: "",
    metaDescription: "",
    image: "",
    featuredImage: "",
    readMoreLink: "",
    buyNowLink: "",
    ingredientIds: [],
    status: "DRAFT",
    ...initialValues,
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [authors, setAuthors] = useState<
    { id: string; name: string; title: string | null }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [featuredImageWarning, setFeaturedImageWarning] = useState("");

  useEffect(() => {
    fetch("/api/subcategories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubcategories(data);
      });
    fetch("/api/authors")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAuthors(data);
      });
  }, []);

  const filteredSubs = subcategories.filter(
    (s) => s.categoryType?.toLowerCase() === form.categoryType?.toLowerCase(),
  );

  const set =
    (key: keyof ProductFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const validateFeaturedImage = (url: string) => {
    if (!url) {
      setFeaturedImageWarning("");
      return;
    }
    const img = new Image();
    img.onload = () => {
      setFeaturedImageWarning(
        img.naturalWidth !== 1200 || img.naturalHeight !== 680
          ? `Image is ${img.naturalWidth}×${img.naturalHeight}px — recommended 1200×680`
          : "",
      );
    };
    img.onerror = () => setFeaturedImageWarning("");
    img.src = url;
  };

  const uploadImage = async (file: File, type: "product" | "featured") => {
    const setUploading =
      type === "product" ? setUploadingProduct : setUploadingFeatured;
    const key = type === "product" ? "image" : "featuredImage";
    setUploading(true);
    setError("");
    try {
      let compressedFile = file;
      try {
        const compressedBlob = await compressImage(file);
        compressedFile = new File(
          [compressedBlob],
          getCompressedFileName(file.name, compressedBlob.type),
          { type: compressedBlob.type },
        );
      } catch (compressionError) {
        console.warn(
          "Product image compression failed, sending original file:",
          compressionError,
        );
      }

      const fd = new FormData();
      fd.append("file", compressedFile);
      fd.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((p) => ({ ...p, [key]: data.url }));
      if (type === "featured") validateFeaturedImage(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!form.name.trim()) {
      setError("Product Name is required");
      return;
    }
    if (!form.price.trim()) {
      setError("Price is required");
      return;
    }
    if (!form.subcategoryId) {
      setError("Subcategory is required");
      return;
    }
    
    const setter = publish ? setPublishing : setSaving;
    setter(true);
    setError("");
    setSuccess(false);
    try {
      const updatedData = { ...form, status: publish ? "PUBLISHED" : "DRAFT" };
      await onSubmit(updatedData, publish);
      setForm((p) => ({ ...p, status: publish ? "PUBLISHED" : "DRAFT" }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setter(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      {/* Error / success banners */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Product saved successfully!
        </div>
      )}

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — main content (2/3) */}
        <div className="xl:col-span-2 space-y-5">
          {/* Basic info */}
          <SectionCard
            icon={Package}
            title="Basic Information"
            subtitle="Product name, price and category"
            accent="amber"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Name" required>
                <input
                  required
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls}
                  placeholder="e.g. Vitamin D3 1000 IU"
                />
              </Field>
              <Field label="Price (USD)" required>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    $
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={set("price")}
                    className={`${inputCls} pl-7`}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label="Category Type" required>
                <select
                  required
                  value={form.categoryType}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      categoryType: e.target.value,
                      subcategoryId: "",
                    }))
                  }
                  className={inputCls}
                >
                  <option value="nutra">🌿 Nutra</option>
                  <option value="ecom">🛒 Ecom</option>
                </select>
              </Field>
              <Field label="Subcategory" required>
                <select
                  required
                  value={form.subcategoryId}
                  onChange={set("subcategoryId")}
                  className={inputCls}
                >
                  <option value="">Select subcategory…</option>
                  {filteredSubs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {filteredSubs.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No subcategories for this type yet.
                  </p>
                )}
              </Field>
              <Field
                label="Author"
                hint="Shown as trust signal in article header"
              >
                <select
                  value={form.authorId}
                  onChange={set("authorId")}
                  className={inputCls}
                >
                  <option value="">No author</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.title ? ` — ${a.title}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Short Description"
              required
              hint="Shown on product cards"
            >
              <textarea
                required
                value={form.shortDescription}
                onChange={set("shortDescription")}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Brief, compelling description (1–2 sentences)"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.shortDescription.length} chars
              </p>
            </Field>
          </SectionCard>

          {/* Key features */}
          <SectionCard
            icon={Star}
            title="Key Features"
            subtitle="One feature per line — shown as bullet points"
            accent="blue"
          >
            <textarea
              value={form.keyFeatures}
              onChange={set("keyFeatures")}
              rows={6}
              className={`${inputCls} resize-none font-mono text-sm leading-relaxed`}
              placeholder={`Fast-acting formula\nClinically tested ingredients\nNo artificial additives\nSuitable for all ages\nGluten-free`}
            />
            {form.keyFeatures && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.keyFeatures
                  .split("\n")
                  .filter(Boolean)
                  .map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                    >
                      <CheckCircle2 className="w-3 h-3" /> {f.trim()}
                    </span>
                  ))}
              </div>
            )}
          </SectionCard>

          {/* Detailed description */}
          <SectionCard
            icon={FileText}
            title="Detailed Description"
            subtitle="Full article content — supports rich formatting"
            accent="blue"
          >
            <RichTextEditor
              value={form.detailedDescription}
              onChange={(val) =>
                setForm((p) => ({ ...p, detailedDescription: val }))
              }
              placeholder="Type '/' for commands — headings, lists, images, buttons, ingredients…"
            />
          </SectionCard>

          {/* SEO */}
          <SectionCard
            icon={Search}
            title="SEO"
            subtitle="Meta title and description for search engines"
            accent="violet"
          >
            <Field label="Meta Title" hint="50–60 chars recommended">
              <input
                value={form.metaTitle}
                onChange={set("metaTitle")}
                className={inputCls}
                placeholder={form.name || "SEO page title"}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">
                  {form.metaTitle.length} chars
                </p>
                {form.metaTitle.length > 60 && (
                  <p className="text-xs text-amber-500">Too long</p>
                )}
              </div>
            </Field>
            <Field label="Meta Description" hint="150–160 chars recommended">
              <textarea
                value={form.metaDescription}
                onChange={set("metaDescription")}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder={form.shortDescription || "SEO meta description"}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">
                  {form.metaDescription.length} chars
                </p>
                {form.metaDescription.length > 160 && (
                  <p className="text-xs text-amber-500">Too long</p>
                )}
              </div>
            </Field>
          </SectionCard>
        </div>

        {/* Right — sidebar (1/3) */}
        <div className="space-y-5">
          {/* Publish card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Publish</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  form.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={publishing || saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing…
                  </>
                ) : (
                  <>
                    {form.status === 'PUBLISHED' ? 'Update & Publish' : 'Publish Product'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving || publishing}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Save Draft
                  </>
                )}
              </button>

              <Link
                href={cancelHref}
                className="w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Product image */}
          <SectionCard
            icon={ImageIcon}
            title="Product Image"
            subtitle="Square thumbnail"
            accent="rose"
          >
            <ImageZone
              label=""
              hint="Square, any size"
              value={form.image}
              uploading={uploadingProduct}
              onUpload={(f) => uploadImage(f, "product")}
              onUrl={(url) => setForm((p) => ({ ...p, image: url }))}
              onRemove={() => setForm((p) => ({ ...p, image: "" }))}
            />
            <Field label="Image URL">
              <input
                value={form.image}
                onChange={set("image")}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>
          </SectionCard>

          {/* Featured image */}
          <SectionCard
            icon={ImageIcon}
            title="Featured Image"
            subtitle="Hero banner — 1200×680 recommended"
            accent="blue"
          >
            <ImageZone
              label=""
              hint="1200×680 px"
              value={form.featuredImage}
              uploading={uploadingFeatured}
              warning={featuredImageWarning}
              onUpload={(f) => uploadImage(f, "featured")}
              onUrl={(url) => {
                setForm((p) => ({ ...p, featuredImage: url }));
                validateFeaturedImage(url);
              }}
              onRemove={() => {
                setForm((p) => ({ ...p, featuredImage: "" }));
                setFeaturedImageWarning("");
              }}
            />
            <Field label="Image URL">
              <input
                value={form.featuredImage}
                onChange={(e) => {
                  set("featuredImage")(e);
                  validateFeaturedImage(e.target.value);
                }}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>
          </SectionCard>

          {/* Links */}
          <SectionCard
            icon={LinkIcon}
            title="Links"
            subtitle="External CTA links"
            accent="blue"
          >
            <Field label="Read More Link">
              <input
                value={form.readMoreLink}
                onChange={set("readMoreLink")}
                className={inputCls}
                placeholder="https://..."
                type="url"
              />
            </Field>
            <Field
              label="Buy Now Link"
              hint="Shown as a primary CTA button on the product page"
            >
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 text-sm">
                  🛒
                </span>
                <input
                  value={form.buyNowLink}
                  onChange={set("buyNowLink")}
                  className={`${inputCls} pl-9`}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </Field>
          </SectionCard>
        </div>
      </div>

      {/* Sticky bottom bar on mobile */}
      <div className="xl:hidden sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex gap-3 -mx-4 sm:-mx-6 z-20">
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={publishing || saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Publishing…
            </>
          ) : (
            form.status === 'PUBLISHED' ? 'Update & Publish' : 'Publish'
          )}
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || publishing}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors bg-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            'Save Draft'
          )}
        </button>
      </div>
    </form>
  );
}
