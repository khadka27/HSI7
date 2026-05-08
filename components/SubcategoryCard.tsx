import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subcategory } from "@/lib/types";

interface Props {
  subcategory: Subcategory;
}

export default function SubcategoryCard({ subcategory }: Props) {
  return (
    <Link
      href={`/subcategory/${subcategory.slug}`}
      className="group block float-in"
    >
      <div className="surface-shell rounded-3xl hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="relative h-44 overflow-hidden bg-gray-50">
          <img
            src={subcategory.image}
            alt={subcategory.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent" />
          <h3 className="absolute bottom-3 left-4 text-white font-semibold text-lg drop-shadow-md tracking-tight">
            {subcategory.name}
          </h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {subcategory.description}
          </p>
          <div className="mt-4 inline-flex items-center text-emerald-700 text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
            Browse Products <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
