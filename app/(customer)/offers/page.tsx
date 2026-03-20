"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

const TYPE_META: Record<string, { icon: string; color: string; gradient: string; label: string }> = {
  percentage: { icon: "percent", color: "text-blue-600 bg-blue-100", gradient: "from-blue-500 to-blue-600", label: "% OFF" },
  flat: { icon: "money_off", color: "text-green-600 bg-green-100", gradient: "from-green-500 to-emerald-600", label: "FLAT OFF" },
  bogo: { icon: "add_shopping_cart", color: "text-purple-600 bg-purple-100", gradient: "from-purple-500 to-violet-600", label: "BOGO" },
  free_item: { icon: "redeem", color: "text-amber-600 bg-amber-100", gradient: "from-amber-500 to-orange-600", label: "FREE ITEM" },
  combo: { icon: "fastfood", color: "text-rose-600 bg-rose-100", gradient: "from-rose-500 to-pink-600", label: "COMBO" },
  cashback: { icon: "account_balance_wallet", color: "text-teal-600 bg-teal-100", gradient: "from-teal-500 to-cyan-600", label: "CASHBACK" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] || TYPE_META.percentage;
}

function formatValidity(from?: number, until?: number) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (from && until) {
    return `${new Date(from).toLocaleDateString("en-IN", opts)} – ${new Date(until).toLocaleDateString("en-IN", opts)}`;
  }
  if (until) {
    return `Valid till ${new Date(until).toLocaleDateString("en-IN", opts)}`;
  }
  return "No expiry";
}

export default function OffersPage() {
  const offers = useQuery(api.offers.getActiveOffers, {});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (offers === undefined) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-text-muted font-medium">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Minimal Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">local_offer</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">
              Offers & Deals
            </h1>
            <p className="text-sm text-text-muted">
              {offers.length} {offers.length === 1 ? "offer" : "offers"} available · Copy code & apply at checkout
            </p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-gray-300">local_offer</span>
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2">No Offers Right Now</h2>
          <p className="text-text-muted max-w-sm mx-auto mb-6">
            We&apos;re cooking up some exciting deals! Check back soon for discounts and special offers.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-foodmohalla-600 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const meta = getTypeMeta(offer.discountType);
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative"
              >
                {/* Coupon cutout decoration */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-background-light -translate-y-1/2 z-10 border-r border-gray-200"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background-light -translate-y-1/2 z-10 border-l border-gray-200"></div>

                <div className="flex flex-col sm:flex-row">
                  {/* Left: Gradient Section */}
                  <div className={`sm:w-40 bg-gradient-to-br ${meta.gradient} p-6 flex flex-col items-center justify-center text-center text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5"></div>
                    <div className="relative z-10">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {meta.icon}
                      </span>
                      <div className="text-2xl font-black leading-tight mb-1">
                        {offer.discountType === "percentage" && `${offer.discountValue}%`}
                        {offer.discountType === "flat" && `₹${offer.discountValue}`}
                        {offer.discountType === "bogo" && `B${offer.bogoBuyQty || 1}G${offer.bogoGetQty || 1}`}
                        {offer.discountType === "free_item" && "FREE"}
                        {offer.discountType === "combo" && `₹${offer.discountValue}`}
                        {offer.discountType === "cashback" && `₹${offer.cashbackAmount || 0}`}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                        {offer.discountType === "percentage" && "OFF"}
                        {offer.discountType === "flat" && "OFF"}
                        {offer.discountType === "bogo" && "DEAL"}
                        {offer.discountType === "free_item" && "ITEM"}
                        {offer.discountType === "combo" && "COMBO"}
                        {offer.discountType === "cashback" && "BACK"}
                      </div>
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-text-main mb-1 leading-snug">
                        {offer.description}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted mt-2">
                        {offer.minOrderValue ? (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">shopping_cart</span>
                            Min ₹{offer.minOrderValue}
                          </span>
                        ) : null}
                        {offer.discountType === "percentage" && offer.maxDiscount ? (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">trending_down</span>
                            Max ₹{offer.maxDiscount} off
                          </span>
                        ) : null}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {formatValidity(offer.validFrom, offer.validUntil)}
                        </span>
                      </div>
                    </div>

                    {/* Code + Actions */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 flex items-center border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <span className="flex-1 text-center font-mono text-sm font-black tracking-[0.2em] text-text-main py-2 px-3 uppercase">
                          {offer.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(offer.code)}
                          className={`px-3 py-2 text-xs font-bold transition-all border-l-2 border-dashed border-gray-300 ${
                            isCopied
                              ? "bg-green-500 text-white"
                              : "bg-white text-primary hover:bg-primary/5"
                          }`}
                        >
                          {isCopied ? (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">content_copy</span>
                              Copy
                            </span>
                          )}
                        </button>
                      </div>
                      <Link
                        href="/menu"
                        className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-foodmohalla-600 transition-colors shadow-sm shadow-primary/20 whitespace-nowrap"
                      >
                        Use Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
