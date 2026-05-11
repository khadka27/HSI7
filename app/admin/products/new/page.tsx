'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
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
    <div className="max-w-7xl space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Product</h1>
            <p className="text-xs text-gray-400">Fill in the details below to create a new product</p>
          </div>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        submitLabel="Create Product"
        cancelHref="/admin/products"
      />
    </div>
  );
}
