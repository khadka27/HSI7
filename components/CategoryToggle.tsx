'use client';

import { useCategoryContext } from '@/context/CategoryContext';
import type { CategoryType } from '@/lib/types';

export default function CategoryToggle() {
  const { activeCategory, setActiveCategory } = useCategoryContext();

  const options: { label: string; value: CategoryType }[] = [
    { label: 'Nutra', value: 'nutra' },
    { label: 'Ecom', value: 'ecom' },
  ];

  return (
    <div className="flex w-full sm:w-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setActiveCategory(opt.value)}
          className={`flex-1 sm:flex-none px-8 py-3 text-sm font-semibold transition-all duration-200 ${
            activeCategory === opt.value
              ? opt.value === 'nutra'
                ? 'bg-[#16A34A] text-white shadow-inner'
                : 'bg-[#0EA5E9] text-white shadow-inner'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
