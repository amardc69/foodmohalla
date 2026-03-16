"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartUserId } from "@/lib/useGuestId";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CustomerHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userId = useCartUserId(session);
  const cartItems = useQuery(api.cart.getCart, userId ? { userId } : "skip");

  const cartCount = cartItems
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "My Orders", href: "/orders" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-4 py-3 md:px-8 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-14 w-auto flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/foodmohalla.png"
              alt="Food Mohalla"
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Brand + description */}
          <div className="hidden sm:flex flex-col leading-tight">
            <h2 className="text-slate-900 text-xl font-extrabold tracking-tight">
              Food Mohalla
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Baramati · Best Burger Pizza Place
            </span>
          </div>
        </Link>

        <div className="flex flex-1 justify-end gap-6 sm:gap-8">
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                className={`text-sm font-medium leading-normal transition-colors ${
                  pathname === link.href
                    ? "text-primary font-bold"
                    : "text-slate-700 hover:text-primary"
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="text-slate-700 hover:text-primary transition-colors text-sm font-medium leading-normal"
              href="#"
            >
              Offers
            </Link>
          </nav>

          <div className="flex gap-3 sm:gap-4 items-center">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none">
                    <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-foodmohalla-100 flex items-center justify-center border border-primary/20 overflow-hidden">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {session.user?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-bold text-slate-700 hidden sm:block">
                      {session.user?.name?.split(" ")[0]}
                    </span>

                    <span className="material-symbols-outlined text-slate-400 text-[18px]">
                      expand_more
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 rounded-2xl shadow-xl border-slate-100 p-2"
                >
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-slate-900">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-slate-500">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="my-1 bg-slate-100" />

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full px-2 py-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        person
                      </span>
                      <span className="font-semibold text-sm">My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer"
                  >
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 w-full px-2 py-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        receipt_long
                      </span>
                      <span className="font-semibold text-sm">My Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-slate-100" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-xl focus:bg-red-50 focus:text-red-600 text-red-600 font-semibold cursor-pointer flex items-center gap-2 px-2 py-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      logout
                    </span>
                    <span className="text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/" })}
                className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors"
              >
                Sign In
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

            <Link
              href="/checkout"
              className="relative flex cursor-pointer items-center justify-center rounded-xl h-10 w-10 sm:w-12 bg-slate-100/80 hover:bg-primary/10 transition-colors text-slate-700 hover:text-primary group border border-transparent hover:border-primary/20"
            >
              <span className="material-symbols-outlined !text-[22px] group-hover:scale-110 transition-transform">
                shopping_cart
              </span>

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden flex items-center justify-center size-10 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="lg:hidden fixed top-[60px] left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {link.label === "Home"
                      ? "home"
                      : link.label === "Menu"
                      ? "restaurant_menu"
                      : link.label === "My Orders"
                      ? "receipt_long"
                      : "person"}
                  </span>
                  {link.label}
                </Link>
              ))}

              <Link
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  local_offer
                </span>
                Offers
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}