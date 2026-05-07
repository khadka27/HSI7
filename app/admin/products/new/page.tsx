'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm, { type ProductFormData } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: ProductFormData) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    router.push('/admin/products');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>
      <ProductForm
        onSubmit={handleSubmit}
        submitLabel="Create Product"
        cancelHref="/admin/products"
      />
    </div>
  );
}
