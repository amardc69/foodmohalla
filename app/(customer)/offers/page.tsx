"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

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

function getOfferSummary(offer: any): string {
  switch (offer.discountType) {
    case "percentage":
      return `${offer.discountValue}% OFF${offer.maxDiscount ? ` up to ₹${offer.maxDiscount}` : ""}`;
    case "flat":
      return `₹${offer.discountValue} OFF`;
    case "bogo":
      return `Buy ${offer.bogoBuyQty || 1}, Get ${offer.bogoGetQty || 1} Free`;
    case "free_item":
      return `Free ${offer.freeItemName || "Item"}`;
    case "combo":
      return `₹${offer.discountValue} OFF on Combo`;
    case "cashback":
      return `₹${offer.cashbackAmount || 0} Cashback`;
    default:
      return `${offer.discountValue}% OFF`;
  }
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-text-muted font-medium">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
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

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-gray-300">local_offer</span>
          </div>
          <h2 className="text-lg font-bold text-text-main mb-1">No Offers Right Now</h2>
          <p className="text-sm text-text-muted max-w-xs mx-auto mb-5">
            We&apos;re cooking up some exciting deals! Check back soon.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-foodmohalla-600 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer._id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                {/* Coupon cutouts */}
                <div className="absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-background-light -translate-y-1/2 border-r border-gray-200"></div>
                <div className="absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-background-light -translate-y-1/2 border-l border-gray-200"></div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: Offer Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-primary leading-tight mb-0.5">
                      {getOfferSummary(offer)}
                    </p>
                    <p className="text-sm text-text-main font-medium mb-2">
                      {offer.description}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-muted">
                      {offer.minOrderValue ? (
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">shopping_cart</span>
                          Min ₹{offer.minOrderValue}
                        </span>
                      ) : null}
                      {offer.discountType === "percentage" && offer.maxDiscount ? (
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">trending_down</span>
                          Max ₹{offer.maxDiscount} off
                        </span>
                      ) : null}
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">schedule</span>
                        {formatValidity(offer.validFrom, offer.validUntil)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Code + Copy */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <span className="font-mono text-sm font-black tracking-[0.15em] text-text-main py-2 px-3 uppercase">
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
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <Link
                      href="/menu"
                      className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-foodmohalla-600 transition-colors whitespace-nowrap"
                    >
                      Use Now
                    </Link>
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
