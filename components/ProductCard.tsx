import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";

interface Props {
  product: Product;
  variant?: "grid" | "list";
  useFeaturedImage?: boolean;
}

export default function ProductCard({
  product,
  variant = "grid",
  useFeaturedImage = true,
}: Props) {
  const displayImage =
    useFeaturedImage && product.featuredImage
      ? product.featuredImage
      : product.image;
  const isNutra = String(product.categoryType).toUpperCase() === "NUTRA";

  if (variant === "list") {
    return (
      <div className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-row h-full w-full">
        <Link
          href={`/products/${product.slug}`}
          className="relative w-24 sm:w-40 md:w-72 aspect-square overflow-hidden bg-gray-50 flex-shrink-0 block"
        >
          <Image
            src={displayImage || "/placeholder-image.png"}
            alt={product.imageAlt || product.name || "Product Image"}
            fill
            className="object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold tracking-widest uppercase shadow-sm ${
                isNutra
                  ? "bg-white/95 text-blue-800"
                  : "bg-white/95 text-sky-800"
              }`}
            >
              {isNutra ? "Supplement" : "Product"}
            </span>
          </div>
        </Link>

        <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1 sm:space-y-2">
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2 sm:truncate">
                {product.name}
              </h3>
            </Link>
            <p className="hidden sm:block text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Ingredients preview - Hidden on mobile */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="hidden md:flex flex-wrap gap-2 mt-2">
                {product.ingredients.slice(0, 2).map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 rounded-lg"
                  >
                    <div className="w-3 h-3 rounded-full overflow-hidden bg-white border border-blue-100 flex-shrink-0">
                      <img
                        src={ing.image || "/ingredient-placeholder.png"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[8px] font-bold text-blue-800 uppercase tracking-tight">
                      {ing.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 border-t border-gray-50 pt-2 sm:pt-4 mt-2 sm:mt-3">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Best Price
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end w-full sm:w-auto">
              {product.readMoreLink && (
                <a
                  href={product.readMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all flex items-center gap-1"
                >
                  Read More
                </a>
              )}
              {product.buyNowLink && (
                <a
                  href={product.buyNowLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-400 text-amber-950 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm shadow-sm hover:bg-amber-300 transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap"
                >
                  <ShoppingCart className="w-3 sm:w-4 h-3 sm:h-4" /> Buy Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl md:rounded-3xl hover:shadow-xl hover:shadow-blue-950/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col border border-gray-100">
      {/* Image Area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[16/9] overflow-hidden bg-blue-50/60 block"
      >
        <Image
          src={displayImage || "/placeholder-image.png"}
          alt={product.imageAlt || product.name || "Product Image"}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide uppercase ${
              isNutra
                ? "bg-blue-100/95 text-blue-800"
                : "bg-sky-100/95 text-sky-800"
            }`}
          >
            {isNutra ? "Supplement" : "Product"}
          </span>
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          <div className="mt-3">
            <span className="text-lg sm:text-xl font-black text-blue-700">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {product.readMoreLink && (
            <a
              href={product.readMoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold border border-blue-50 text-blue-600 bg-blue-50/30 hover:bg-blue-50 transition-all"
            >
              Read More
            </a>
          )}

          {/* Buy Now Button */}
          {product.buyNowLink ? (
            <a
              href={product.buyNowLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-amber-950 hover:bg-amber-300 transition-all shadow-md shadow-amber-200/50"
            >
              <ShoppingCart className="w-4 h-4" /> Buy Now
            </a>
          ) : (
            <div className="py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-400 flex items-center justify-center opacity-50 cursor-not-allowed">
              Coming Soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
