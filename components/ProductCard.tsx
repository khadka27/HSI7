import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { ShoppingCart, Star, ExternalLink, ArrowRight } from "lucide-react";

interface Props {
  product: Product;
  variant?: "grid" | "list";
  useFeaturedImage?: boolean;
}

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'>No Image</text></svg>";

export default function ProductCard({ product, variant = "grid", useFeaturedImage = true }: Props) {
  const img = useFeaturedImage && product.featuredImage ? product.featuredImage : product.image;
  const isNutra = String(product.categoryType).toUpperCase() === "NUTRA";
  const label = isNutra ? "Supplement" : "Product";
  const labelColor = isNutra ? { bg: "#eff6ff", text: "#1d4ed8" } : { bg: "#f0fdf4", text: "#15803d" };

  /* ──── LIST VARIANT ──── */
  if (variant === "list") {
    return (
      <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#0284c7] hover:shadow-[0_8px_30px_rgba(2,132,199,0.10)] transition-all duration-300 flex flex-row">
        {/* Image */}
        <Link href={`/products/${product.slug}`} className="relative flex-shrink-0 bg-slate-50 block overflow-hidden" style={{ width: 96, minWidth: 96 }}>
          <Image
            src={img || PLACEHOLDER}
            alt={product.imageAlt || product.name || "Product"}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
          {/* SM screens show 96px, larger 160px */}
          <div className="sm:hidden" />
        </Link>
        <div className="hidden sm:block relative flex-shrink-0 bg-slate-50 overflow-hidden" style={{ width: 0 }} />

        {/* Content */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 md:p-5 flex flex-col justify-between gap-2">
          <div className="space-y-1.5">
            {/* Category tag */}
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ background: labelColor.bg, color: labelColor.text }}>
              {label}
            </span>

            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="text-sm sm:text-[0.95rem] font-black text-slate-900 leading-snug group-hover:text-[#0284c7] transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>

            <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {product.shortDescription}
            </p>

            {/* Ingredient chips — md+ */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="hidden md:flex flex-wrap gap-1.5 mt-1">
                {product.ingredients.slice(0, 3).map((ing) => (
                  <span key={ing.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {ing.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-1">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Price</p>
              <p className="text-xl font-black text-[#0284c7]">${product.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              {product.readMoreLink && (
                <a href={product.readMoreLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                  <ExternalLink className="w-3 h-3" /> Read
                </a>
              )}
              {product.buyNowLink && (
                <a href={product.buyNowLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black text-slate-900 shadow-sm hover:opacity-90 transition-all active:scale-95"
                  style={{ background: "#f59e0b" }}>
                  <ShoppingCart className="w-3 h-3" /> Buy Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──── GRID VARIANT ──── */
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#0284c7] hover:shadow-[0_12px_40px_rgba(2,132,199,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block bg-slate-50 overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Image
          src={img || PLACEHOLDER}
          alt={product.imageAlt || product.name || "Product"}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm" style={{ background: "rgba(255,255,255,0.92)", color: labelColor.text }}>
          {label}
        </span>
        {/* Rating mock */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white shadow-sm text-amber-600">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 5.0
        </span>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <div className="flex-1">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0284c7] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-[#0284c7]">${product.price.toFixed(2)}</span>
          {product.readMoreLink && (
            <a href={product.readMoreLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0284c7] transition-colors p-1">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          {product.buyNowLink ? (
            <a href={product.buyNowLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-slate-900 shadow-md hover:opacity-90 transition-all active:scale-95"
              style={{ background: "#f59e0b" }}>
              <ShoppingCart className="w-4 h-4" /> Buy Now
            </a>
          ) : (
            <Link href={`/products/${product.slug}`}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-[#0284c7] border border-[#0284c7]/30 hover:bg-[#0284c7]/5 transition-all group/link">
              View Details <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
