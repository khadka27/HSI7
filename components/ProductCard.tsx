import Link from "next/link";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const displayImage = product.featuredImage || product.image;
  const isNutra = String(product.categoryType).toUpperCase() === "NUTRA";

  return (
    <Link href={`/product/${product.slug}`} className="group block float-in">
      <div className="surface-shell rounded-2xl md:rounded-3xl hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Featured image 16:9 */}
        <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50/60">
          <img
            src={displayImage}
            alt={product.imageAlt || product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide uppercase ${
              isNutra ? "bg-emerald-100/95 text-emerald-800" : "bg-sky-100/95 text-sky-800"
            }`}>
              {isNutra ? "Nutra" : "Ecom"}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-emerald-700">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700 border border-amber-300 bg-amber-50 px-2 sm:px-2.5 py-1 rounded-full group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-white transition-colors whitespace-nowrap">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
