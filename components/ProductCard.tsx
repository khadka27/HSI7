import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-100">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              product.categoryType === 'nutra'
                ? 'bg-green-100 text-green-700'
                : 'bg-sky-100 text-sky-700'
            }`}>
              {product.categoryType === 'nutra' ? 'Nutra' : 'Ecom'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#16A34A] transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-[#16A34A]">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-[#F59E0B] border border-[#F59E0B] px-2.5 py-1 rounded-full group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
