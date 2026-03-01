"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MenuItem } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

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

const addons = [
  { name: "Extra Cheese Slice", price: 1.5 },
  { name: "Extra Paneer Patty", price: 3.0 },
  { name: "Peri Peri Sprinkles", price: 0.5 },
];

const instructions = ["No Onions", "No Mayo", "Less Spicy"];

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const [selectedItemForSheet, setSelectedItemForSheet] = useState<any | null>(null);
  const [sheetQuantity, setSheetQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);

  const { data: session } = useSession();
  const userId = useCartUserId(session);
  const cartItems = useQuery(api.cart.getCart, userId ? { userId } : "skip");
  const addToCart = useMutation(api.cart.addToCart);
  const updateCartItem = useMutation(api.cart.updateCartItem);

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

  function openAddSheet(item: any) {
    setSelectedItemForSheet(item);
    setSheetQuantity(1);
    setSelectedAddons([]);
    setSelectedInstructions([]);
  }

  function toggleAddon(addon: string) {
    setSelectedAddons((prev) =>
      prev.includes(addon)
        ? prev.filter((a) => a !== addon)
        : [...prev, addon]
    );
  }

  function toggleInstruction(inst: string) {
    setSelectedInstructions((prev) =>
      prev.includes(inst)
        ? prev.filter((i) => i !== inst)
        : [...prev, inst]
    );
  }

  async function handleSheetAddToCart() {
    if (!selectedItemForSheet || !userId) return;
    setAddingToCart(selectedItemForSheet.id);
    
    const enrichedAddons = selectedAddons.map(name => {
      const addon = addons.find(a => a.name === name);
      return { name, price: addon?.price || 0 };
    });

    try {
      await addToCart({
        userId,
        menuItemId: selectedItemForSheet.id,
        quantity: sheetQuantity,
        addons: enrichedAddons,
        instructions: selectedInstructions
      });
      setSelectedItemForSheet(null);
    } finally {
      setTimeout(() => setAddingToCart(null), 500);
    }
  }

  const categoryList = Object.keys(grouped);
  const relatedItems = selectedItemForSheet ? items.filter((i: any) => i.id !== selectedItemForSheet.id).slice(0, 2) : [];

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
                      {(() => {
                        const cartItem = cartItems?.find(
                          (ci) => ci.menuItemId === item.id && (!ci.addons || ci.addons.length === 0)
                        );

                        if (cartItem) {
                          return (
                            <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1 border border-slate-200">
                              <button
                                onClick={() => updateCartItem({ cartItemId: cartItem._id, quantity: cartItem.quantity - 1 })}
                                className="size-7 bg-white rounded-md flex items-center justify-center text-slate-600 hover:text-primary hover:bg-slate-50 shadow-sm transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <span className="text-sm font-bold text-slate-800 w-4 text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateCartItem({ cartItemId: cartItem._id, quantity: cartItem.quantity + 1 })}
                                className="size-7 bg-white rounded-md flex items-center justify-center text-slate-600 hover:text-primary hover:bg-slate-50 shadow-sm transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                              </button>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() => openAddSheet(item)}
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
                        );
                      })()}
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

      <Sheet open={!!selectedItemForSheet} onOpenChange={(open) => !open && setSelectedItemForSheet(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto z-[100] border-l-0 shadow-2xl">
          {selectedItemForSheet && (
            <div className="flex flex-col h-full">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-2xl font-bold text-slate-900">{selectedItemForSheet.name}</SheetTitle>
                <SheetDescription className="text-slate-500">
                  {selectedItemForSheet.description}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-8">
                {/* Add-ons */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    Choice of Add-ons
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {addons.map((addon) => (
                      <label
                        key={addon.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-primary transition-colors bg-white ${
                          selectedAddons.includes(addon.name)
                            ? "border-primary bg-primary/5"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            className="size-5 rounded border-gray-300 text-primary focus:ring-primary bg-transparent"
                            type="checkbox"
                            checked={selectedAddons.includes(addon.name)}
                            onChange={() => toggleAddon(addon.name)}
                          />
                          <span className="text-sm font-medium">{addon.name}</span>
                        </div>
                        <span className="text-sm text-slate-500">
                          +₹{addon.price.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    Special Instructions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {instructions.map((inst) => (
                      <label key={inst} className="cursor-pointer">
                        <input
                          className="peer sr-only"
                          type="checkbox"
                          checked={selectedInstructions.includes(inst)}
                          onChange={() => toggleInstruction(inst)}
                        />
                        <span className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-500 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all select-none">
                          {inst}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frequently Bought Together */}
                {relatedItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Frequently Bought Together</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                      {relatedItems.map((related: any) => (
                        <Link
                          key={related.id}
                          href={`/menu/${related.id}`}
                          className="snap-start shrink-0 w-40 bg-white rounded-xl border border-slate-200 p-2 flex flex-col hover:shadow-md transition-shadow"
                        >
                          <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="w-full h-full object-cover"
                              alt={related.name}
                              src={related.image}
                            />
                          </div>
                          <h4 className="font-bold text-[13px] mb-1 truncate">
                            {related.name}
                          </h4>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-semibold text-slate-500">
                              ₹{related.price.toFixed(2)}
                            </span>
                            <span className="size-6 flex items-center justify-center bg-slate-100 rounded-md hover:bg-primary hover:text-white transition-colors gap-0.5"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openAddSheet(related); }} >
                              <span className="material-symbols-outlined text-[14px]">
                                add
                              </span>
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer / Cart Action */}
              <div className="pt-6 mt-6 border-t border-slate-200 px-1 pb-4">
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2 mb-4 w-32 self-start">
                  <button
                    onClick={() => setSheetQuantity(Math.max(1, sheetQuantity - 1))}
                    className="size-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{sheetQuantity}</span>
                  <button
                    onClick={() => setSheetQuantity(sheetQuantity + 1)}
                    className="size-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                {(() => {
                  const addonTotal = selectedAddons.reduce((sum, name) => {
                    const addon = addons.find((a) => a.name === name);
                    return sum + (addon?.price || 0);
                  }, 0);
                  const totalPrice = (selectedItemForSheet.price + addonTotal) * sheetQuantity;

                  return (
                    <button
                      onClick={handleSheetAddToCart}
                      disabled={addingToCart === selectedItemForSheet.id}
                      className={`w-full font-bold text-lg py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98] ${
                        addingToCart === selectedItemForSheet.id
                          ? "bg-green-500 text-white shadow-green-500/30"
                          : "bg-primary hover:bg-orange-600 text-white shadow-orange-500/30"
                      }`}
                    >
                      <span>{addingToCart === selectedItemForSheet.id ? "Added!" : "Add to Cart"}</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-semibold">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
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
