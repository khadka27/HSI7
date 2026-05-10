import Link from "next/link";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const displayImage = product.featuredImage || product.image;

  return (
    <Link href={`/product/${product.slug}`} className="group block float-in">
      <div className="surface-shell rounded-3xl hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Featured image at 16:9 ratio */}
        <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50/60">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                product.categoryType === "NUTRA" || product.categoryType === "nutra"
                  ? "bg-emerald-100/95 text-emerald-800"
                  : "bg-sky-100/95 text-sky-800"
              }`}
            >
              {product.categoryType === "NUTRA" || product.categoryType === "nutra" ? "Nutra" : "Ecom"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-emerald-700">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-amber-700 border border-amber-300 bg-amber-50 px-2.5 py-1 rounded-full group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-white transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
