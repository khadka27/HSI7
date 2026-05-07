'use client';

import React, { createContext, useContext, useState } from 'react';
import type { CategoryType } from '@/lib/types';

interface CategoryContextValue {
  activeCategory: CategoryType;
  setActiveCategory: (cat: CategoryType) => void;
}

const CategoryContext = createContext<CategoryContextValue>({
  activeCategory: 'nutra',
  setActiveCategory: () => {},
});

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('nutra');
  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  return useContext(CategoryContext);
}
