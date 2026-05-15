import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 md:mt-24 relative overflow-hidden bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1/2 bg-gradient-to-b from-blue-900/20 to-transparent blur-3xl rounded-b-full pointer-events-none opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-10">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center shrink-0 group transition-transform duration-300 hover:scale-105">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 md:h-12 w-auto object-contain drop-shadow-lg" 
              />
            </Link>
            <p className="text-sm tracking-wide text-slate-400 max-w-xs leading-relaxed">
              Elevating your lifestyle with wellness-first living and curated health products.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-end justify-center h-full gap-5">
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-3 text-sm font-medium">
              <Link href="/" className="text-slate-300 hover:text-white hover:underline underline-offset-4 decoration-blue-500 transition-all">Home</Link>
              <Link href="/products" className="text-slate-300 hover:text-white hover:underline underline-offset-4 decoration-blue-500 transition-all">Products</Link>
              <Link href="/about" className="text-slate-300 hover:text-white hover:underline underline-offset-4 decoration-blue-500 transition-all">About</Link>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-3 text-sm">
              <Link href="/legal" className="text-slate-500 hover:text-slate-300 transition-colors">Legal</Link>
              <Link href="/legal/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/legal/terms" className="text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium tracking-wide">
          <p>&copy; {new Date().getFullYear()} HealthStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
