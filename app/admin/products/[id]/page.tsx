"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";
import type { ProductFormData } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(async (r) => {
        const contentType = r.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await r.json()
          : null;
        if (!r.ok) {
          throw new Error(
            data?.error || `Failed to load product (${r.status})`,
          );
        }
        return data;
      })
      .then((p) => setProduct(p))
      .catch((err) => {
        console.error("Failed to load product:", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update product");
    router.push("/admin/products");
  };

  if (loading)
    return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;
  if (!product)
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm">
        <Package className="w-4 h-4" /> Product not found.
      </div>
    );

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
          <Package className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-xs text-gray-400 mt-0.5">Update product details</p>
        </div>
      </div>
      <ProductForm
        initialValues={{
          name: product.name,
          price: String(product.price),
          categoryType: product.categoryType,
          subcategoryId: product.subcategoryId,
          shortDescription: product.shortDescription,
          detailedDescription: product.detailedDescription,
          keyFeatures: product.keyFeatures || "",
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          image: product.image,
          featuredImage: product.featuredImage,
          readMoreLink: product.readMoreLink,
          buyNowLink: (product as any).buyNowLink || "",
          authorId: (product as any).authorId || "",
          ingredientIds: product.ingredients?.map((i) => i.id) || [],
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        cancelHref="/admin/products"
      />
    </div>
  );
}
