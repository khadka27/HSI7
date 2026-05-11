'use client';

import { useEffect, useState } from 'react';
import IngredientForm from "@/components/admin/IngredientForm";
import type { Ingredient } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditIngredientPage({ params }: { params: { id: string } }) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ingredients/${params.id}`)
      .then(r => r.json())
      .then(setIngredient)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Ingredient not found.</p>
      </div>
    );
  }

  return <IngredientForm initialData={ingredient} />;
}
