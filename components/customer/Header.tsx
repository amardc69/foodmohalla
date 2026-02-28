"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartUserId } from "@/lib/useGuestId";

export default function CustomerHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userId = useCartUserId(session);
  const cartItems = useQuery(api.cart.getCart, userId ? { userId } : "skip");
  
  const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 md:px-10">
      <Link href="/" className="flex items-center gap-4">
        <div className="size-8 text-primary">
          <span className="material-symbols-outlined !text-4xl">
            restaurant_menu
          </span>
        </div>
        <h2 className="text-slate-900 text-xl font-extrabold leading-tight tracking-tight">
          Food Mohalla
        </h2>
      </Link>
      <div className="flex flex-1 justify-end gap-8">
        <nav className="hidden md:flex items-center gap-9">
          <Link
            className={`text-sm font-medium leading-normal transition-colors ${
              pathname === "/"
                ? "text-primary font-bold"
                : "text-slate-700 hover:text-primary"
            }`}
            href="/"
          >
            Home
          </Link>
          <Link
            className={`text-sm font-medium leading-normal transition-colors ${
              pathname === "/menu"
                ? "text-primary font-bold"
                : "text-slate-700 hover:text-primary"
            }`}
            href="/menu"
          >
            Menu
          </Link>
          <Link
            className="text-slate-700 hover:text-primary transition-colors text-sm font-medium leading-normal"
            href="#"
          >
            Offers
          </Link>
        </nav>
        <div className="flex gap-2 items-center">
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2 hidden md:inline-block">
                Hi, {session.user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/" })}
              className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors"
            >
              Sign In
            </button>
          )}
          <Link
            href="/checkout"
            className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-900"
          >
            <span className="material-symbols-outlined !text-xl">
              shopping_cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
