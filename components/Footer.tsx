import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-emerald-100/80 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-7">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold tracking-tight text-lg">
                Health<span className="text-emerald-300">Store</span>
              </span>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">
                Built for wellness-first living
              </p>
            </div>
          </div>
          <p className="text-sm text-center flex items-center gap-1.5 text-emerald-100/90">
            Made with{" "}
            <Heart className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> for
            your health journey
          </p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
        <div className="border-t border-emerald-300/15 mt-8 pt-6 text-center text-xs text-emerald-100/60">
          &copy; {new Date().getFullYear()} HealthStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
