"use client";

import { useCategoryContext } from "@/context/CategoryContext";
import type { CategoryType } from "@/lib/types";

export default function CategoryToggle() {
  const { activeCategory, setActiveCategory } = useCategoryContext();

  const options: { label: string; value: CategoryType }[] = [
    { label: "Supplement", value: "nutra" },
    { label: "Product", value: "ecom" },
  ];

  return (
    <div className="flex w-full sm:w-auto rounded-2xl p-1 bg-blue-50/90 border border-blue-100 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setActiveCategory(opt.value)}
          className={`flex-1 sm:flex-none px-5 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            activeCategory === opt.value
              ? opt.value === "nutra"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                : "bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md"
              : "text-blue-800/70 hover:bg-white/70"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
