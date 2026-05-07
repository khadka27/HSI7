import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#16A34A] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">Health<span className="text-[#16A34A]">Store</span></span>
          </div>
          <p className="text-sm text-center flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for your health journey
          </p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} HealthStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
