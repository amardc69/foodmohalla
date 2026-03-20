"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { useCartUserId } from "@/lib/useGuestId";
import Link from "next/link";

export default function FavouritesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authUserId = (session?.user as any)?.id;
  const userId = useCartUserId(session);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/favourites");
    }
  }, [status, router]);

  const favourites = useQuery(
    api.favourites.getUserFavourites,
    authUserId ? { userId: authUserId } : "skip"
  );
  const removeFavourite = useMutation(api.favourites.removeFavourite);
  const addToCart = useMutation(api.cart.addToCart);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const handleRemove = async (menuItemId: string) => {
    if (!authUserId) return;
    await removeFavourite({ userId: authUserId, menuItemId });
  };

  const handleAddToCart = async (item: any) => {
    if (!userId) return;
    await addToCart({
      userId,
      menuItemId: item.id,
      quantity: 1,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-red-500 text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">
              My Favourites
            </h1>
            <p className="text-sm text-text-muted">
              {favourites ? `${favourites.length} saved ${favourites.length === 1 ? "item" : "items"}` : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {favourites === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <span
              className="material-symbols-outlined text-5xl text-red-300"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              heart_broken
            </span>
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">No Favourites Yet</h2>
          <p className="text-text-muted max-w-sm mx-auto mb-6 leading-relaxed">
            Start exploring our menu and tap the heart icon to save your favourite dishes here for quick access!
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-xl hover:bg-foodmohalla-600 transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            Explore Menu
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((item: any) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.isVeg ? (
                      <span className="bg-white/95 backdrop-blur-sm text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="w-2.5 h-2.5 border border-green-600 flex items-center justify-center rounded-[2px]">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </span>
                        VEG
                      </span>
                    ) : (
                      <span className="bg-white/95 backdrop-blur-sm text-red-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="w-2.5 h-2.5 border border-red-600 flex items-center justify-center rounded-[2px]">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        </span>
                        NON-VEG
                      </span>
                    )}
                    {item.isBestSeller && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                        ★ BESTSELLER
                      </span>
                    )}
                  </div>

                  {/* Remove Favourite */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm hover:shadow-md active:scale-90"
                    title="Remove from favourites"
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>

                  {/* Rating */}
                  {item.rating > 0 && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-text-main">{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-main leading-tight mb-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Category */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mb-3">
                      <span className="material-symbols-outlined text-[12px]">category</span>
                      {item.category}
                    </span>
                  </div>

                  {/* Price + Add to Cart */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-black text-text-main">
                        ₹{item.price}
                      </span>
                      {item.discount && item.discount > 0 && (
                        <span className="ml-2 text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                          {item.discount}% OFF
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.isOutOfStock}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm ${
                        item.isOutOfStock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-foodmohalla-600 shadow-primary/20 hover:shadow-md"
                      }`}
                    >
                      {item.isOutOfStock ? (
                        <>
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          Sold Out
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-gray-50 via-red-50/50 to-gray-50 rounded-2xl p-8 border border-gray-100">
              <span
                className="material-symbols-outlined text-red-400 text-3xl mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <h3 className="text-lg font-bold text-text-main mb-1">Discover More</h3>
              <p className="text-sm text-text-muted mb-4 max-w-sm mx-auto">
                Browse our full menu to find and save more of your favourite dishes!
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-foodmohalla-600 transition-colors shadow-md shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                Browse Menu
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
