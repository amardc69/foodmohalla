"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MenuItem } from "@/lib/types";

import { useSession } from "next-auth/react";
import { useCartUserId } from "@/lib/useGuestId";

const categoryIcons: Record<string, string> = {
  burgers: "lunch_dining",
  pizza: "local_pizza",
  sides: "tapas",
  beverages: "local_cafe",
  desserts: "icecream",
  desi: "restaurant",
};

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const { data: session } = useSession();
  const userId = useCartUserId(session);
  const addToCart = useMutation(api.cart.addToCart);

  const itemsQuery = useQuery(api.menu.getMenuItems, {
    category: activeCategory || undefined,
    search: search || undefined,
    vegOnly: vegOnly || undefined,
  });

  const items = useMemo(() => itemsQuery || [], [itemsQuery]);
  const grouped = useMemo(() => {
    return items.reduce((acc: any, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [items]);

  async function handleAddToCart(itemId: string) {
    if (!userId) return;
    setAddingToCart(itemId);
    try {
      await addToCart({
        userId,
        menuItemId: itemId,
        quantity: 1,
        addons: [],
        instructions: []
      });
    } finally {
      setTimeout(() => setAddingToCart(null), 500);
    }
  }

  const categoryList = Object.keys(grouped);

  return (
    <div className="flex flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6 sticky top-24 h-fit">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 text-lg font-bold">Categories</h2>
            <p className="text-slate-500 text-sm">Quick Jump</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveCategory("")}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                !activeCategory
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                restaurant_menu
              </span>
              <span className={`text-sm ${!activeCategory ? "font-bold" : "font-medium"}`}>
                All Items
              </span>
            </button>
            {Object.entries(categoryIcons).map(([slug, icon]) => (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug === activeCategory ? "" : slug)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeCategory === slug
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <span className={`text-sm capitalize ${activeCategory === slug ? "font-bold" : "font-medium"}`}>
                  {slug}
                </span>
              </button>
            ))}
          </nav>
        </div>
        {/* Promo Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full bg-white/20 blur-xl"></div>
          <h3 className="relative text-lg font-bold mb-1">Free Delivery</h3>
          <p className="relative text-xs opacity-90 mb-3">On orders above ₹25</p>
          <Link
            href="/menu"
            className="relative block w-full rounded-lg bg-white py-2 text-xs font-bold text-primary shadow-sm hover:bg-slate-50 transition-colors text-center"
          >
            Order Now
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8 sticky top-[72px] lg:static z-40 bg-background-light py-2">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary shadow-sm text-sm transition-all"
              placeholder="Search for dishes, like 'Cheeseburger'..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer gap-2 select-none group">
              <div className="relative">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-green-600 transition-colors">
                Veg Only
              </span>
            </label>
          </div>
        </div>

        {/* Menu Sections */}
        {(Object.entries(grouped) as [string, any[]][]).map(([category, categoryItems]) => (
          <section key={category} className="mb-10 scroll-mt-28" id={category}>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {category}
              </h2>
              <span className="text-sm text-slate-500">
                {categoryItems.length} Items
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full"
                >
                  <Link
                    href={`/menu/${item.id}`}
                    className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-slate-100 block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={item.image}
                    />
                    {item.badge && (
                      <div
                        className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm ${
                          item.badge === "HOT"
                            ? "bg-red-500"
                            : item.badge === "VEG"
                            ? "bg-green-600"
                            : "bg-primary"
                        }`}
                      >
                        {item.badge}
                      </div>
                    )}
                    <button className="absolute top-3 right-3 size-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">
                        favorite
                      </span>
                    </button>
                  </Link>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Link href={`/menu/${item.id}`}>
                        <h3 className="font-bold text-lg text-slate-900 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          star
                        </span>
                        {item.rating}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold text-slate-900">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        disabled={addingToCart === item.id}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                          addingToCart === item.id
                            ? "bg-green-500 text-white"
                            : "bg-primary hover:bg-orange-600 text-white shadow-sm shadow-orange-200"
                        }`}
                      >
                        {addingToCart === item.id ? "Added!" : "Add"}
                        <span className="material-symbols-outlined text-[18px]">
                          {addingToCart === item.id ? "check" : "add"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined !text-6xl mb-4">search_off</span>
            <p className="text-lg font-bold">No items found</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
