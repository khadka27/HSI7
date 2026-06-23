import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subcategory } from "@/lib/types";

interface Props {
  subcategory: Subcategory;
}

export default function SubcategoryCard({ subcategory }: Props) {
  return (
    <Link href={`/subcategory/${subcategory.slug}`} className="group block h-full">
      <div className="relative bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 h-full min-h-[60px] transition-all duration-250 hover:border-[#0284c7] hover:bg-[#0284c7] hover:shadow-[0_6px_20px_rgba(2,132,199,0.22)] hover:-translate-y-0.5 group-active:scale-[0.98]">
        <span className="text-[0.8rem] font-black text-slate-800 group-hover:text-white transition-colors leading-snug flex-1 tracking-tight">
          {subcategory.name}
        </span>
        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-all duration-250">
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
