import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subcategory } from "@/lib/types";

interface Props {
  subcategory: Subcategory;
}

export default function SubcategoryCard({ subcategory }: Props) {
  return (
    <Link href={`/subcategory/${subcategory.slug}`} className="group block">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 group-active:scale-95 h-full min-h-[76px]">
        <span className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors tracking-tight leading-tight flex-1 pr-3 text-left">
          {subcategory.name}
        </span>
        <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors flex-shrink-0">
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
