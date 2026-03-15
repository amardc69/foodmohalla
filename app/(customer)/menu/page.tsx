"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MenuItem } from "@/lib/types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

import { useSession } from "next-auth/react";
import { useCartUserId } from "@/lib/useGuestId";

const defaultInstructions = [
  "No Onions",
  "No Mayo",
  "Less Spicy",
  "Extra Spicy",
  "No Garlic",
];
const defaultAddonsFallback = [
  { name: "Extra Cheese Slice", price: 1.5 },
  { name: "Extra Paneer Patty", price: 3.0 },
  { name: "Peri Peri Sprinkles", price: 0.5 },
];

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  // const [vegOnly, setVegOnly] = useState(false);

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const [selectedItemForSheet, setSelectedItemForSheet] = useState<any | null>(
    null,
  );
  const [sheetQuantity, setSheetQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>(
    [],
  );

  const { data: session } = useSession();
  const userId = useCartUserId(session);
  const cartItems = useQuery(api.cart.getCart, userId ? { userId } : "skip");
  const addToCart = useMutation(api.cart.addToCart);
  const updateCartItem = useMutation(api.cart.updateCartItem);

  const categoriesDb = useQuery(api.categories.getCategories) || [];

  const adminSettings = useQuery(api.adminSettings.getAllSettings) || {};
  const freeDeliveryEnabled = adminSettings.freeDeliveryEnabled === "true";
  const freeDeliveryThreshold = Number(adminSettings.freeDeliveryThreshold || 0);

  const userFavourites = useQuery(
    api.favourites.getUserFavourites,
    userId ? { userId } : "skip",
  );
  const addFavourite = useMutation(api.favourites.addFavourite);
  const removeFavourite = useMutation(api.favourites.removeFavourite);

  async function handleToggleFavourite(item: any, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    const isFav = userFavourites?.some((f: any) => f.id === item.id);
    if (isFav) {
      await removeFavourite({ userId, menuItemId: item.id });
    } else {
      await addFavourite({ userId, menuItemId: item.id });
    }
  }

  const itemsQuery = useQuery(api.menu.getMenuItems, {
    category: activeCategory || undefined,
    search: search || undefined,
    // vegOnly: vegOnly || undefined,
  });

  const items = useMemo(() => itemsQuery || [], [itemsQuery]);
  const grouped = useMemo(() => {
    return items.reduce(
      (acc: any, item: any) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }, [items]);

  function openAddSheet(item: any) {
    setSelectedItemForSheet(item);
    setSheetQuantity(1);
    setSelectedAddons([]);
    setSelectedSize(item.sizes && item.sizes.length > 0 ? item.sizes[0].name : "");
    setSelectedInstructions([]);
  }

  function toggleAddon(addon: string) {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon],
    );
  }

  function toggleInstruction(inst: string) {
    setSelectedInstructions((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst],
    );
  }

  async function handleSheetAddToCart() {
    if (!selectedItemForSheet || !userId) return;
    setAddingToCart(selectedItemForSheet.id);

    const itemAddons = selectedItemForSheet.addons || [];
    const enrichedAddons = selectedAddons.map((name) => {
      const addon = itemAddons.find((a: any) => a.name === name);
      // Determine addon price considering sizePrices if a size is selected
      let addonPrice = addon?.price || 0;
      if (selectedSize && addon?.sizePrices && addon.sizePrices[selectedSize] !== undefined) {
        addonPrice = addon.sizePrices[selectedSize];
      }
      return { name, price: addonPrice };
    });

    try {
      await addToCart({
        userId,
        menuItemId: selectedItemForSheet.id,
        quantity: sheetQuantity,
        addons: enrichedAddons,
        instructions: selectedInstructions,
        selectedSize: selectedSize || undefined,
      });
      setSelectedItemForSheet(null);
    } finally {
      setTimeout(() => setAddingToCart(null), 500);
    }
  }

  const categoryList = Object.keys(grouped);
  const relatedItems = selectedItemForSheet
    ? items.filter((i: any) => i.id !== selectedItemForSheet.id).slice(0, 2)
    : [];

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
              <span
                className={`text-sm ${!activeCategory ? "font-bold" : "font-medium"}`}
              >
                All Items
              </span>
            </button>
            {categoriesDb.map((cat: any) => (
              <button
                key={cat.slug}
                onClick={() =>
                  setActiveCategory(cat.slug === activeCategory ? "" : cat.slug)
                }
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeCategory === cat.slug
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  {cat.icon || "restaurant_menu"}
                </span>
                <span
                  className={`text-sm capitalize ${activeCategory === cat.slug ? "font-bold" : "font-medium"}`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </nav>
        </div>
        {/* Promo Card */}
        {freeDeliveryEnabled && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-foodmohalla-600 p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full bg-white/20 blur-xl"></div>
            <h3 className="relative text-lg font-bold mb-1">Free Delivery</h3>
            <p className="relative text-xs opacity-90 mb-3">
              On orders above ₹{freeDeliveryThreshold}
            </p>
            <Link
              href="/menu"
              className="relative block w-full rounded-lg bg-white py-2 text-xs font-bold text-primary shadow-sm hover:bg-slate-50 transition-colors text-center"
            >
              Order Now
            </Link>
          </div>
        )}
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
          {/* Veg Only Switch - commented out
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
          */}
        </div>

        {/* Menu Sections */}
        {(Object.entries(grouped) as [string, any[]][]).map(
          ([category, categoryItems]) => (
            <section
              key={category}
              className="mb-10 scroll-mt-28"
              id={category}
            >
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
                        className={`w-full h-full object-cover transition-transform duration-500 ${item.isOutOfStock ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
                        src={item.image}
                      />
                      {item.isOutOfStock && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-black tracking-widest rounded-full shadow-lg">OUT OF STOCK</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {item.isBestSeller && <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] w-fit font-bold rounded shadow-sm">BEST SELLER</span>}
                        {item.isFeatured && <span className="px-2 py-0.5 bg-foodmohalla-500 text-white text-[10px] w-fit font-bold rounded shadow-sm">FEATURED</span>}
                        {item.badge && (
                          <div
                            className={`text-white text-[10px] w-fit font-bold px-2 py-0.5 rounded shadow-sm ${
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
                      </div>
                      <button
                        onClick={(e) => handleToggleFavourite(item, e)}
                        className="absolute top-3 right-3 size-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm z-10"
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${userFavourites?.some((f: any) => f.id === item.id) ? "fill-current text-red-500" : ""}`}
                          style={userFavourites?.some((f: any) => f.id === item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
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

                      </div>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        {item.isSizeBased && item.sizes?.length > 0 ? (
                          <span className="text-lg font-bold text-slate-900 flex items-center gap-1">
                            <span className="text-xs text-slate-500 font-medium">From</span>
                            ₹{Math.min(...item.sizes.map((s: any) => s.price)).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-slate-900">
                            ₹{item.price.toFixed(2)}
                          </span>
                        )}
                        {(() => {
                          const cartItem = cartItems?.find(
                            (ci) =>
                              ci.menuItemId === item.id &&
                              (!ci.addons || ci.addons.length === 0),
                          );

                          if (cartItem) {
                            return (
                              <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1 border border-slate-200">
                                <button
                                  onClick={() =>
                                    updateCartItem({
                                      cartItemId: cartItem._id,
                                      quantity: cartItem.quantity - 1,
                                    })
                                  }
                                  className="size-7 bg-white rounded-md flex items-center justify-center text-slate-600 hover:text-primary hover:bg-slate-50 shadow-sm transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    remove
                                  </span>
                                </button>
                                <span className="text-sm font-bold text-slate-800 w-4 text-center">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateCartItem({
                                      cartItemId: cartItem._id,
                                      quantity: cartItem.quantity + 1,
                                    })
                                  }
                                  className="size-7 bg-white rounded-md flex items-center justify-center text-slate-600 hover:text-primary hover:bg-slate-50 shadow-sm transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    add
                                  </span>
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button
                              onClick={() => !item.isOutOfStock && openAddSheet(item)}
                              disabled={addingToCart === item.id || item.isOutOfStock}
                              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                item.isOutOfStock
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                  : addingToCart === item.id
                                  ? "bg-green-500 text-white"
                                  : "bg-primary hover:bg-foodmohalla-600 text-white shadow-sm shadow-foodmohalla-200"
                              }`}
                            >
                              {item.isOutOfStock ? "Out of Stock" : addingToCart === item.id ? "Added!" : "Add"}
                              {!item.isOutOfStock && (
                                <span className="material-symbols-outlined text-[18px]">
                                  {addingToCart === item.id ? "check" : "add"}
                                </span>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ),
        )}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined !text-6xl mb-4">
              search_off
            </span>
            <p className="text-lg font-bold">No items found</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        )}
      </main>

      <Drawer
        open={!!selectedItemForSheet}
        onOpenChange={(open) => !open && setSelectedItemForSheet(null)}
      >
        <DrawerContent className="max-h-[92vh] flex flex-col">
          {selectedItemForSheet &&
            (() => {
              const itemSizes = selectedItemForSheet.sizes || [];
              const hasSizes = itemSizes.length > 0;
              
              // Determine base price
              let baseItemPrice = selectedItemForSheet.price;
              if (hasSizes && selectedSize) {
                const sizeObj = itemSizes.find((s: any) => s.name === selectedSize);
                if (sizeObj) baseItemPrice = sizeObj.price;
              }

              const itemAddons = selectedItemForSheet.addons?.length
                ? selectedItemForSheet.addons
                : defaultAddonsFallback;
                
              const addonTotal = selectedAddons.reduce(
                (sum: number, name: string) => {
                  const addon = itemAddons.find((a: any) => a.name === name);
                  let aPrice = addon?.price || 0;
                  if (hasSizes && selectedSize && addon?.sizePrices?.[selectedSize] !== undefined) {
                    aPrice = addon.sizePrices[selectedSize];
                  }
                  return sum + aPrice;
                },
                0,
              );
              const unitPrice = baseItemPrice + addonTotal;
              const totalPrice = unitPrice * sheetQuantity;

              return (
                <>
                  <DrawerHeader className="sr-only">
                    <DrawerTitle>{selectedItemForSheet.name}</DrawerTitle>
                    <DrawerDescription>
                      {selectedItemForSheet.description}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex-1 overflow-y-auto hide-scrollbar">
                    {/* 2-column grid on desktop, stacked on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 px-4 sm:px-6 pt-4 pb-6">
                      {/* ─── COLUMN 1: Details, Small Image, Addons, Instructions ── */}
                      <div className="lg:col-span-1 space-y-6">
                        {/* Header: Info + Small Image */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">
                              {selectedItemForSheet.name}
                            </h2>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl font-black text-primary">
                                ₹{baseItemPrice.toFixed(2)}
                              </span>

                            </div>
                            <p className="text-slate-500 text-xs lg:text-sm leading-relaxed">
                              {selectedItemForSheet.description}
                            </p>
                          </div>

                          {/* Small Image */}
                          <div className="relative w-24 h-24 lg:w-28 lg:h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={selectedItemForSheet.name}
                              src={selectedItemForSheet.image}
                              className="w-full h-full object-cover"
                            />
                            {selectedItemForSheet.isVeg && (
                              <div className="absolute top-1.5 left-1.5 bg-green-600 border border-white text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
                                VEG
                              </div>
                            )}
                          </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Sizes Output */}
                        {hasSizes && (
                          <div>
                            <h3 className="font-bold text-sm lg:text-base mb-3 flex items-center gap-2">
                              Choose Size
                              <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full shadow-sm">
                                Required
                              </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {itemSizes.map((size: any) => (
                                <button
                                  key={size.name}
                                  onClick={() => setSelectedSize(size.name)}
                                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                    selectedSize === size.name
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-slate-200 text-slate-600 hover:border-primary/50"
                                  }`}
                                >
                                  {size.name}
                                  <span className="block text-xs font-normal mt-0.5 opacity-80">
                                    ₹{size.price.toFixed(2)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Addons from Convex */}
                        {itemAddons.length > 0 && (
                          <div>
                            <h3 className="font-bold text-sm lg:text-base mb-3 flex items-center gap-2">
                              Choice of Add-ons
                              <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                Optional
                              </span>
                            </h3>
                            <div className="space-y-2">
                              {itemAddons.map((addon: any) => (
                                <label
                                  key={addon.name}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer hover:border-primary/50 transition-colors bg-white ${
                                    selectedAddons.includes(addon.name)
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-slate-200"
                                  }`}
                                >
                                <div className="flex items-center gap-3">
                                    <input
                                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary bg-transparent"
                                      type="checkbox"
                                      checked={selectedAddons.includes(
                                        addon.name,
                                      )}
                                      onChange={() => toggleAddon(addon.name)}
                                    />
                                    <span className="text-xs lg:text-sm font-medium">
                                      {addon.name}
                                    </span>
                                  </div>
                                  <span className="text-xs lg:text-sm font-semibold text-slate-500">
                                    +₹{
                                      (hasSizes && selectedSize && addon?.sizePrices?.[selectedSize] !== undefined)
                                        ? addon.sizePrices[selectedSize].toFixed(2)
                                        : addon.price.toFixed(2)
                                    }
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        <div>
                          <h3 className="font-bold text-sm lg:text-base mb-3">
                            Special Instructions
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {[
                              ...defaultInstructions,
                              ...(selectedItemForSheet?.instructions || []),
                            ].map((inst) => (
                              <label key={inst} className="cursor-pointer">
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={selectedInstructions.includes(inst)}
                                  onChange={() => toggleInstruction(inst)}
                                />
                                <span className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-slate-500 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all select-none">
                                  {inst}
                                </span>
                              </label>
                            ))}
                          </div>
                          <textarea
                            placeholder="E.g. Make it extra crispy, allergy to peanuts..."
                            className="w-full text-xs lg:text-sm p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none h-20"
                            value={
                              selectedInstructions
                                .find((i) => i.startsWith("Custom: "))
                                ?.replace("Custom: ", "") || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedInstructions((prev) => {
                                const filtered = prev.filter(
                                  (i) => !i.startsWith("Custom: "),
                                );
                                return val.trim()
                                  ? [...filtered, `Custom: ${val}`]
                                  : filtered;
                              });
                            }}
                          ></textarea>
                        </div>
                      </div>



                      {/* ─── COLUMN 3: Order Summary Only ─────────── */}
                      <div className="lg:col-span-1 mt-8 lg:mt-0">
                        {/* Order summary card */}
                        <div className="bg-slate-50 rounded-2xl p-5 lg:p-6 border border-slate-200 shadow-inner">
                          <h3 className="font-bold text-base mb-5 flex items-center gap-2 text-slate-800">
                            <span className="material-symbols-outlined text-primary text-[22px]">
                              receipt_long
                            </span>
                            Order Summary
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 font-medium">
                                {selectedItemForSheet.name}
                              </span>
                              <span className="font-bold text-slate-800">
                                ₹{selectedItemForSheet.price.toFixed(2)}
                              </span>
                            </div>
                            {selectedAddons.length > 0 && (
                              <div className="flex justify-between text-sm bg-white p-2 rounded-lg border border-slate-100">
                                <span className="text-slate-500 text-xs">
                                  Add-ons ({selectedAddons.length})
                                </span>
                                <span className="font-bold text-primary text-xs">
                                  +₹{addonTotal.toFixed(2)}
                                </span>
                              </div>
                            )}

                            <div className="border-t border-slate-200 pt-4 mt-2">
                              <div className="flex justify-between items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit mx-auto lg:mx-0 lg:w-full mb-4">
                                <button
                                  onClick={() =>
                                    setSheetQuantity(
                                      Math.max(1, sheetQuantity - 1),
                                    )
                                  }
                                  className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    remove
                                  </span>
                                </button>
                                <span className="font-bold text-base w-10 text-center text-slate-800">
                                  {sheetQuantity}
                                </span>
                                <button
                                  onClick={() =>
                                    setSheetQuantity(sheetQuantity + 1)
                                  }
                                  className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    add
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-4 mt-2">
                              <div className="flex justify-between items-end">
                                <span className="font-bold text-base text-slate-800">
                                  Total
                                </span>
                                <span className="font-black text-2xl text-primary leading-none">
                                  ₹{totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleSheetAddToCart}
                            disabled={addingToCart === selectedItemForSheet.id}
                            className={`w-full mt-6 font-bold text-base py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                              addingToCart === selectedItemForSheet.id
                                ? "bg-green-500 text-white shadow-green-500/30"
                                : "bg-primary hover:bg-foodmohalla-600 text-white shadow-foodmohalla-500/30"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {addingToCart === selectedItemForSheet.id
                                ? "check_circle"
                                : "shopping_cart"}
                            </span>
                            <span>
                              {addingToCart === selectedItemForSheet.id
                                ? "Added to Cart"
                                : "Add to Cart"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
