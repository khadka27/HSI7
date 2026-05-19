"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// Simple image compression using canvas (no external dependencies)
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale if too large; keep images comfortably below request limits.
        const maxDimension = 1600;
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);

        const mimeCandidates = ["image/webp", "image/jpeg"] as const;

        const encode = (
          mimeType: (typeof mimeCandidates)[number],
          quality: number,
        ) =>
          new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob((blob) => resolveBlob(blob), mimeType, quality);
          });

        const tryCompress = async () => {
          for (const mimeType of mimeCandidates) {
            let quality = 0.82;
            while (quality >= 0.2) {
              const blob = await encode(mimeType, quality);
              if (blob && blob.size <= 100 * 1024) {
                resolve(blob);
                return;
              }
              if (blob) {
                // Keep the smallest candidate seen so far as a fallback.
                if (quality <= 0.2) {
                  resolve(blob);
                  return;
                }
              }
              quality = Number((quality - 0.1).toFixed(2));
            }
          }

          // Final fallback: encode as JPEG at a low quality.
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

interface ImageUploadProps {
  value?: string;
  alt?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  type?: string;
  label?: string;
  required?: boolean;
  accentColor?: string; // tailwind ring color e.g. 'ring-[#16A34A]'
}

export default function ImageUpload({
  value = "",
  alt = "",
  onChange,
  onAltChange,
  type = "general",
  label,
  required = false,
  accentColor = "ring-blue-500",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:${accentColor} focus:border-transparent`;

  const upload = async (file: File) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, WebP or GIF allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Max file size is 10 MB.");
      return;
    }

    setUploading(true);
    setCompressing(true);
    try {
      // Compress image client-side targeting ~100KB
      let compressedFile = file;
      try {
        const compressedBlob = await compressImage(file);
        compressedFile = new File(
          [compressedBlob],
          getCompressedFileName(file.name, compressedBlob.type),
          {
            type: compressedBlob.type,
          },
        );
        console.log(
          `Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`,
        );
      } catch (compErr) {
        console.warn("Compression failed, proceeding with original:", compErr);
        compressedFile = file;
      }
      setCompressing(false);

      const fd = new FormData();
      fd.append("file", compressedFile);
      fd.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Upload failed");
      }
      const data = await res.json();
      onChange(data.url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setCompressing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit text-xs font-medium">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md transition-colors capitalize ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t === "upload" ? "📁 Upload" : "🔗 URL"}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files[0];
            if (f) upload(f);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">
                {compressing ? "Compressing…" : "Uploading…"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="w-7 h-7 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drop image or{" "}
                <span className="text-blue-600 font-medium">
                  click to browse
                </span>
              </p>
              <p className="text-xs text-gray-400">
                JPEG · PNG · WebP · GIF — auto-compressed to ~100KB
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
            className={inputCls}
          />
          <button
            type="button"
            disabled={!urlInput.trim()}
            onClick={() => {
              onChange(urlInput.trim());
              setUrlInput("");
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
          >
            Add
          </button>
        </div>
      )}

      {/* Alt text — always visible once image is set OR if onAltChange provided */}
      {onAltChange && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Alt text <span className="text-red-500">*</span>
            <span className="ml-1 font-normal text-gray-400">
              (required for accessibility & SEO)
            </span>
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Describe the image clearly, e.g. 'Woman taking vitamin D supplement'"
            className={inputCls}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
            <img
              src={value}
              alt={alt || "Preview"}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => {
                onChange("");
                if (onAltChange) onAltChange("");
              }}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{value}</p>
            {alt && <p className="text-xs text-blue-600 mt-1">Alt: {alt}</p>}
            {!alt && onAltChange && (
              <p className="text-xs text-amber-500 mt-1">⚠ Alt text missing</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
