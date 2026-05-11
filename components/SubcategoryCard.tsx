import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subcategory } from "@/lib/types";

interface Props {
  subcategory: Subcategory;
}

export default function SubcategoryCard({ subcategory }: Props) {
  return (
    <Link href={`/subcategory/${subcategory.slug}`} className="group block">
      <div className="bg-white border border-blue-100/50 rounded-2xl px-6 py-4 flex items-center justify-center text-center transition-all duration-300 hover:bg-blue-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 group-active:scale-95 h-full min-h-[64px]">
        <span className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors tracking-tight leading-tight">
          {subcategory.name}
        </span>
      </div>
    </Link>
  );
}
