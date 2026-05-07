import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Subcategory } from '@/lib/types';

interface Props {
  subcategory: Subcategory;
}

export default function SubcategoryCard({ subcategory }: Props) {
  return (
    <Link href={`/subcategory/${subcategory.slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-100">
        <div className="relative h-44 overflow-hidden bg-gray-50">
          <img
            src={subcategory.image}
            alt={subcategory.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h3 className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow-md">
            {subcategory.name}
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {subcategory.description}
          </p>
          <div className="mt-3 flex items-center text-[#16A34A] text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
            Browse Products <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
