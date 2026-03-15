"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems = [
  { icon: "dashboard", label: "Overview", href: "/admin" },
  { icon: "restaurant_menu", label: "Customize Menu", href: "/admin/customize-menu" },
  { icon: "local_offer", label: "Offers & Coupons", href: "/admin/offers" },
  { icon: "inventory_2", label: "Inventory", href: "/admin/inventory" },
  { icon: "local_shipping", label: "Delivery Partners", href: "/admin/delivery" },
  { icon: "bar_chart", label: "Analytics", href: "/admin/analytics" },
];

const settingsItems = [
  { icon: "person", label: "Account", href: "/admin/account" },
  { icon: "settings", label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent non-admins from rendering the admin panel
  if (session && (session.user as any)?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Restricted Panel</h1>
          <p className="text-slate-500 mb-6">
            You do not have the required administrator privileges to view this area.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/"
              className="w-full py-2.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-foodmohalla-600 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col fixed inset-y-0 left-0 z-40 h-screen overflow-y-auto transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="h-12 w-auto flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/foodmohalla.png" alt="Food Mohalla" className="h-full w-auto object-contain" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="text-slate-900 text-lg font-extrabold tracking-tight leading-tight truncate">Food Mohalla</h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Admin Panel</p>
          </div>
          {/* Close button on mobile */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-4 mb-2">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className={`material-symbols-outlined ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    } transition-colors`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

          <div className="pt-6 mt-6 border-t border-slate-100">
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Settings
            </p>
            {settingsItems.map((item) => (
              <Link
                key={item.label}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors group"
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <div
              className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-cover bg-center flex-shrink-0"
              style={{
                backgroundImage: `url('https://ui-avatars.com/api/?name=Admin&background=ec7f13&color=fff')`,
              }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin</p>
              <p className="text-xs text-slate-500 font-medium truncate">admin@foodmohalla</p>
            </div>
            <Link href="/" className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
              <span className="material-symbols-outlined">logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-12 w-auto flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/foodmohalla.png" alt="Food Mohalla" className="h-full w-auto object-contain" />
            </div>
            <span className="font-extrabold text-lg text-slate-900">Food Mohalla</span>
          </div>
          <button
            className="text-slate-600 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </header>
        <div className="flex-1 p-4 md:p-8 bg-slate-50">{children}</div>
      </main>
    </div>
  );
}
