"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const categoriesDb = useQuery(api.categories.getCategories) || [];

  return (
    <>
      {/* Hero Section */}
      <div className="w-full">
        <div className="p-4 md:p-6 lg:px-40 lg:py-8">
          <div className="relative flex min-h-[480px] flex-col gap-6 overflow-hidden rounded-3xl bg-slate-900 items-center justify-center p-8 md:p-16 text-center shadow-xl shadow-orange-900/10">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBN7is5LqvsmcDicnuXA5bX8-nlNhgHxMAytUYoOHip70L1fRiKv_VRg84yQT5Akx4vsGMV7VUeg-f4xVEa9K4k9yOMtMUsA_Np059kjynSxy7kZF6bPa9TR0775Kcar1V0QuhOEJv0ilAIepPges629sjl3TltxDgwxSNtRqNeFWZniBLaR3_Q8wLDnhuR25XCslcTo8ywkDsNOLAogwZmpW38HLJfRLiOpV9kdYj7kaa_mTKMIdczsW19n1WETzuaVgs9_QgZ3Pkn')`,
              }}
            ></div>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
            <div className="relative z-20 flex flex-col gap-4 max-w-3xl items-center">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl drop-shadow-sm">
                Delicious food delivered to your doorstep
              </h1>
              <h2 className="text-slate-200 text-lg font-medium leading-relaxed max-w-xl drop-shadow-sm">
                Order from the best restaurants in your neighborhood and satisfy
                your cravings instantly.
              </h2>
            </div>
            <label className="relative z-20 flex flex-col w-full max-w-[560px] mt-4">
              <div className="flex w-full items-center rounded-xl bg-white p-2 shadow-2xl shadow-black/20 ring-1 ring-slate-900/5">
                <div className="flex items-center justify-center pl-4 text-slate-400">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <input
                  className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 text-base h-12 px-3"
                  placeholder="Enter your delivery location"
                  type="text"
                />
                <Link
                  href="/menu"
                  className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-orange-600 transition-colors text-white text-base font-bold shadow-md shadow-orange-500/20"
                >
                  Find Food
                </Link>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 lg:px-40 pb-20">
        <div className="max-w-[1280px] mx-auto flex flex-col">
          {/* Popular Categories */}
          <div className="mt-8 mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                Popular Categories
              </h2>
              <Link
                className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
                href="/menu"
              >
                View all{" "}
                <span className="material-symbols-outlined !text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categoriesDb.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/menu?category=${cat.slug}`}
                  className="group cursor-pointer flex flex-col gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${cat.image}')` }}
                    ></div>
                  </div>
                  <div className="px-1 pb-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-slate-900 text-lg font-bold leading-normal">
                        {cat.name}
                      </p>
                      <div className="bg-orange-100 text-primary p-1 rounded-full">
                        <span className="material-symbols-outlined !text-base block">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Features / Why Us */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex flex-col gap-4 md:w-1/3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined">stars</span>
                </div>
                <h2 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
                  Why Food Mohalla?
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  We bring the best taste of the town directly to you with
                  unmatched speed and quality service. Experience food delivery
                  like never before.
                </p>
                <button className="w-fit mt-2 text-primary font-bold hover:underline flex items-center gap-1">
                  Learn more{" "}
                  <span className="material-symbols-outlined !text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:w-2/3 w-full">
                {[
                  {
                    icon: "electric_moped",
                    title: "Fast Delivery",
                    desc: "Get your food delivered hot and fresh in under 30 minutes guarantee.",
                  },
                  {
                    icon: "restaurant",
                    title: "Fresh Food",
                    desc: "We partner with top-rated restaurants to ensure premium quality meals.",
                  },
                  {
                    icon: "sell",
                    title: "Best Prices",
                    desc: "Enjoy exclusive deals and the best meal prices in your area.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex flex-col gap-4 p-6 rounded-2xl bg-background-light hover:bg-orange-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">
                        {feature.icon}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-slate-900 text-lg font-bold leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-normal">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 rounded-3xl bg-primary p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
            <div className="z-10 flex flex-col gap-4 max-w-xl text-center md:text-left">
              <h2 className="text-white text-3xl md:text-4xl font-black leading-tight">
                Ready to order?
              </h2>
              <p className="text-white/90 text-lg font-medium">
                Download our mobile app for faster ordering and exclusive
                mobile-only offers.
              </p>
              <div className="flex gap-4 mt-2 justify-center md:justify-start">
                <button className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-900 transition-colors">
                  <span className="material-symbols-outlined">ios</span>
                  App Store
                </button>
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined">android</span>
                  Play Store
                </button>
              </div>
            </div>
            <div className="z-10 relative w-full max-w-xs md:max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Person holding a smartphone showing food delivery app"
                className="rounded-2xl shadow-2xl rotate-3 border-4 border-white/20"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNjMkEmMbjfoUOmd7ajfFdtFwE5tBonKPKtVAbkd4kxNq0JrMMFeYX-4BZm-V1IgzYdFpZ947W-u8qDj9gtuyJC8OZ5hMpQ9L0X9jJJb_76UqNrdrHnqVtmQr2y_cP2oA3v6d9LSGfRLyyB6OKCiVtrXOL4yX5VjK0ElJwUB6cLUMLKC2j7q6r3YwaCbsFtDLdSYe2OtSUIvMIH02hZlKwTYzPSAfNE4u735Pyp9cmwinTQRhNfj3SVYwsGY70HUsAI2gUlVwQrsOf"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
