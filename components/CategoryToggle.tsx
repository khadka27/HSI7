"use client";

import { useCategoryContext } from "@/context/CategoryContext";
import type { CategoryType } from "@/lib/types";

export default function CategoryToggle() {
  const { activeCategory, setActiveCategory } = useCategoryContext();

  const options: { label: string; value: CategoryType }[] = [
    { label: "Nutra", value: "nutra" },
    { label: "Ecom", value: "ecom" },
  ];

  return (
    <div className="flex w-full sm:w-auto rounded-2xl p-1 bg-emerald-50/90 border border-emerald-100 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setActiveCategory(opt.value)}
          className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeCategory === opt.value
              ? opt.value === "nutra"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md"
                : "bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md"
              : "text-emerald-800/70 hover:bg-white/70"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
