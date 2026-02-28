"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col fixed inset-y-0 left-0 z-20 h-screen overflow-y-auto transition-transform transform md:translate-x-0 -translate-x-full md:sticky md:top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">lunch_dining</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-lg font-extrabold tracking-tight leading-tight">Food Mohalla</h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Admin Panel</p>
          </div>
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
              className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-cover bg-center"
              style={{
                backgroundImage: `url('https://ui-avatars.com/api/?name=Admin&background=ec7f13&color=fff')`,
              }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin</p>
              <p className="text-xs text-slate-500 font-medium truncate">admin@foodmohalla</p>
            </div>
            <Link href="/" className="text-slate-400 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined">logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col border-l border-slate-200">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">lunch_dining</span>
            </div>
            <span className="font-extrabold text-lg text-slate-900">Food Mohalla</span>
          </div>
          <button className="text-slate-600 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>
        <div className="flex-1 p-4 md:p-8 bg-slate-50">{children}</div>
      </main>
    </div>
  );
}
