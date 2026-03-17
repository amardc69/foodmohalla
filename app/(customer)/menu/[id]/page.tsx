"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MenuItem } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useCartUserId } from "@/lib/useGuestId";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  
  const { data: session } = useSession();
  const userId = useCartUserId(session);
  const addToCartMutation = useMutation(api.cart.addToCart);

  const item: any = useQuery(api.menu.getMenuItemById, { id: params.id as string });
  const relatedItems = useQuery(api.menu.getMenuItems, {})?.slice(0, 3) || [];

  const addFavourite = useMutation(api.favourites.addFavourite);
  const removeFavourite = useMutation(api.favourites.removeFavourite);
  const userFavourites = useQuery(
    api.favourites.getUserFavourites,
    userId ? { userId } : "skip"
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (item?.sizes?.length > 0 && !selectedSize) {
      setSelectedSize(item.sizes[0].name);
    }
  }, [item, selectedSize]);

  async function handleToggleFavourite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !item) return;
    const isFav = userFavourites?.some((f: any) => f.id === item.id);
    if (isFav) {
      await removeFavourite({ userId, menuItemId: item.id });
    } else {
      await addFavourite({ userId, menuItemId: item.id });
    }
  }

  function toggleAddon(addon: string) {
    setSelectedAddons((prev) =>
      prev.includes(addon)
        ? prev.filter((a) => a !== addon)
        : [...prev, addon]
    );
  }

  async function handleAddToCart() {
    if (!item || !userId) return;
    setIsAdding(true);
    
    const itemAddons = item.addons || [];
    const enrichedAddons = selectedAddons.map(name => {
      const addon = itemAddons.find((a: any) => a.name === name);
      let addonPrice = addon?.price || 0;
      if (selectedSize && addon?.sizePrices && addon.sizePrices[selectedSize] !== undefined) {
        addonPrice = addon.sizePrices[selectedSize];
      }
      return { name, price: addonPrice };
    });
    
    await addToCartMutation({
      userId,
      menuItemId: item.id,
      quantity,
      addons: enrichedAddons,
      instructions: selectedInstructions,
      selectedSize: selectedSize || undefined,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 2000);
  }

  const hasSizes = item?.sizes && item.sizes.length > 0;
  let baseItemPrice = item?.price || 0;
  if (hasSizes && selectedSize) {
    const sizeObj = item.sizes.find((s: any) => s.name === selectedSize);
    if (sizeObj) baseItemPrice = sizeObj.price;
  }

  const addonTotal = selectedAddons.reduce((sum, name) => {
    const itemAddons = item?.addons || [];
    const addon = itemAddons.find((a: any) => a.name === name);
    let aPrice = addon?.price || 0;
    if (hasSizes && selectedSize && addon?.sizePrices?.[selectedSize] !== undefined) {
      aPrice = addon.sizePrices[selectedSize];
    }
    return sum + aPrice;
  }, 0);

  const totalPrice = item ? (baseItemPrice + addonTotal) * quantity : 0;

  if (item === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <span className="material-symbols-outlined !text-6xl mb-4">error</span>
        <p className="text-lg font-bold">Item not found</p>
        <Link href="/menu" className="text-primary mt-2 hover:underline">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-text-muted mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="mx-2 material-symbols-outlined text-[16px]">
          chevron_right
        </span>
        <Link className="hover:text-primary transition-colors" href="/menu">
          Menu
        </Link>
        <span className="mx-2 material-symbols-outlined text-[16px]">
          chevron_right
        </span>
        <span className="font-semibold text-text-main">{item.name}</span>
      </nav>

      {/* Grid Layout: Image (Col 1), Info (Col 2), FBT (Col 1 Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-10">
        
        {/* 1. Left: Image */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={item.image}
            />
            {item.isVeg && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-green-700 uppercase tracking-wide border border-green-200 flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-600"></span> Veg
              </div>
            )}
            <button 
              onClick={handleToggleFavourite}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"
            >
              <span className={`material-symbols-outlined ${userFavourites?.some((f: any) => f.id === item.id) ? "fill-current text-red-500" : ""}`}
                style={userFavourites?.some((f: any) => f.id === item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* 2. Right: Product Details */}
        <div className="lg:col-span-5 lg:row-span-2 relative">
          <div className="sticky top-24 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-extrabold text-text-main leading-tight">
                  {item.name}
                </h1>
                <div className="flex flex-col items-end shrink-0 ml-4">
                  {item.isSizeBased && item.sizes?.length > 0 ? (
                    <span className="text-2xl font-bold text-primary flex items-center gap-1">
                      <span className="text-sm text-slate-500 font-medium">From</span>
                      ₹{Math.min(...item.sizes.map((s: any) => s.price)).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      ₹{item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-4 text-text-muted leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-6 mt-4 pb-6 border-b border-neutral-light">
                <div className="flex items-center gap-1 text-text-muted">
                  <span className="material-symbols-outlined text-lg">
                    schedule
                  </span>
                  <span className="text-sm font-medium">25-30 mins</span>
                </div>
                <div className="flex items-center gap-1 text-text-muted">
                  <span className="material-symbols-outlined text-lg">
                    local_fire_department
                  </span>
                  <span className="text-sm font-medium">{item.calories ? `${item.calories} kcal` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Sizes */}
            {hasSizes && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  Choose Size
                  <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full shadow-sm">
                    Required
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size: any) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-start ${
                        selectedSize === size.name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-neutral-light text-slate-600 hover:border-primary/50"
                      }`}
                    >
                      {size.name}
                      <span className="block text-xs font-normal mt-0.5 opacity-80 gap-1">
                        ₹{size.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            <div className="space-y-6">
              {item.addons && item.addons.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  Choice of Add-ons
                  <span className="text-xs font-normal text-text-muted bg-slate-100 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </h3>
                <div className="space-y-3">
                  {item.addons.map((addon: any) => (
                    <label
                      key={addon.name}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-primary transition-colors bg-white ${
                        selectedAddons.includes(addon.name)
                          ? "border-primary bg-primary/5"
                          : "border-neutral-light"
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
                      <span className="text-sm text-text-muted whitespace-nowrap">
                        +₹{(hasSizes && selectedSize && addon?.sizePrices?.[selectedSize] !== undefined)
                          ? addon.sizePrices[selectedSize].toFixed(2)
                          : addon.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              )}

              {/* Special Instructions */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  Special Instructions
                </h3>
                <textarea
                  placeholder="E.g. Make it extra crispy, allergy to peanuts..."
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none h-20 shadow-sm"
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

            {/* Cart Action */}
            <div className="pt-4 pb-8 sm:pb-0 border-t border-slate-100">
              <div className="flex flex-row items-center gap-3 w-full">
                {/* Quantity Control */}
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2 py-2 w-[40%] sm:w-[140px] shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <span className="font-bold text-lg w-8 text-center text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || item.isOutOfStock}
                  className={`flex-1 font-bold text-sm sm:text-lg py-3.5 px-3 sm:px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                    item.isOutOfStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : isAdding
                      ? "bg-green-500 text-white shadow-green-500/30"
                      : "bg-primary hover:bg-foodmohalla-600 text-white shadow-foodmohalla-500/30"
                  }`}
                >
                  <span className="hidden sm:inline">
                    {item.isOutOfStock ? "Out of Stock" : isAdding ? "Added!" : "Add to Cart"}
                  </span>
                  <span className="sm:hidden">
                    {item.isOutOfStock ? "Out of Stock" : isAdding ? "Added!" : "Add"}
                  </span>
                  {!item.isOutOfStock && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs sm:text-sm font-semibold">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Left Bottom: Frequently Bought Together (Sits under image on LG, bottom of page on Mobile) */}
        <div className="lg:col-span-7 mt-6 lg:mt-0">
          <h3 className="text-xl font-bold mb-4">
            Frequently Bought Together
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {relatedItems.map((related: any) => (
              <Link
                key={related.id}
                href={`/menu/${related.id}`}
                className="snap-start shrink-0 w-48 bg-white rounded-xl border border-slate-200 p-3 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover"
                    alt={related.name}
                    src={related.image}
                  />
                </div>
                <h4 className="font-bold text-sm mb-1 truncate">
                  {related.name}
                </h4>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold text-text-muted">
                    ₹{related.price.toFixed(2)}
                  </span>
                  <span className="size-8 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}