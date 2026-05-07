"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  Package,
  ShoppingBag,
  ArrowLeft,
  Settings,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Subcategories", href: "/admin/subcategories", icon: Layers },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Hero Settings", href: "/admin/hero-settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const hideSidebar =
    pathname === "/admin/login" || pathname?.startsWith("/admin/login");

  const handleLogout = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {!hideSidebar && (
        <aside className="hidden md:flex flex-col w-60 bg-gray-900 text-white shrink-0">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
            <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">HealthStore</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {session.user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#16A34A] text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-4 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        {!hideSidebar && (
          <header className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#16A34A]" />
              <span className="font-bold text-sm">Admin Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-gray-400 text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 text-xs flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>
        )}

        {/* Mobile nav */}
        {!hideSidebar && (
          <nav className="md:hidden bg-gray-800 flex overflow-x-auto">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? "border-[#16A34A] text-white"
                      : "border-transparent text-gray-400"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
