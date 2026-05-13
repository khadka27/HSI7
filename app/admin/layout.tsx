"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, FolderOpen, Layers, Package,
  ShoppingBag, ArrowLeft, Settings, LogOut, User,
  Menu, X, ChevronRight, UserCog, FlaskConical, Sparkles, FileText,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     href: "/admin",                icon: LayoutDashboard, color: "text-blue-400" },
  { label: "Categories",    href: "/admin/categories",     icon: FolderOpen,      color: "text-sky-400" },
  { label: "Subcategories", href: "/admin/subcategories",  icon: Layers,          color: "text-violet-400" },
  { label: "Ingredients",   href: "/admin/ingredients",    icon: FlaskConical,    color: "text-amber-400" },
  { label: "Products",      href: "/admin/products",       icon: Package,         color: "text-amber-400" },
  { label: "Authors",       href: "/admin/authors",        icon: UserCog,         color: "text-indigo-400" },
  { label: "Articles",      href: "/admin/articles",       icon: FileText,        color: "text-teal-400" },
  { label: "SEO Articles",  href: "/admin/seo-article",    icon: Sparkles,        color: "text-violet-400" },
  { label: "Hero Settings", href: "/admin/hero-settings",  icon: Settings,        color: "text-rose-400" },
  { label: "Account",       href: "/admin/settings",       icon: UserCog,         color: "text-indigo-400" },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full bg-[#0f1117] text-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">HealthStore</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors md:hidden">
            <X className="w-4 h-4 text-white/60" />
          </button>
        )}
      </div>

      {/* User */}
      {session?.user && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-white/5 border border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name || session.user.email}
              </p>
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">
                {(session.user as any)?.role || "Admin"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {navItems.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600/20 text-white border border-blue-500/30"
                  : "text-white/50 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : item.color + " opacity-60 group-hover:opacity-100"}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/8 pt-3">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/6 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideSidebar = pathname === "/admin/login" || pathname?.startsWith("/admin/login");

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title from nav */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {navItems.find(n => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "Admin"}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
