import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 md:mt-20 border-t border-blue-100/80 bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 text-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-950/50 flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold tracking-tight text-base md:text-lg">
                Health<span className="text-blue-300">Store</span>
              </span>
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/70">
                Built for wellness-first living
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm text-center flex items-center gap-1.5 text-blue-100/90">
            Made with <Heart className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> for your health journey
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-5 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>        </div>

        <div className="border-t border-blue-300/15 mt-6 md:mt-8 pt-5 text-center text-xs text-blue-100/60">
          &copy; {new Date().getFullYear()} HealthStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
