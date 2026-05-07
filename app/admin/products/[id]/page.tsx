'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import type { Product } from '@/lib/types';
import type { ProductFormData } from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(p => {
      setProduct(p);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    router.push('/admin/products');
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;
  if (!product) return <p className="text-red-500">Product not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <ProductForm
        initialValues={{
          name: product.name,
          price: String(product.price),
          categoryType: product.categoryType,
          subcategoryId: product.subcategoryId,
          shortDescription: product.shortDescription,
          detailedDescription: product.detailedDescription,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          image: product.image,
          featuredImage: product.featuredImage,
          readMoreLink: product.readMoreLink,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        cancelHref="/admin/products"
      />
    </div>
  );
}
