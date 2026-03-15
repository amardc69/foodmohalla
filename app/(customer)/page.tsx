"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const categoriesDb = useQuery(api.categories.getCategories) || [];

  return (
    <>
      {/* Hero Section */}
      <div className="w-full mt-10">
        <div className="p-4 md:p-6 lg:px-40 lg:py-8">
          <div className="relative flex min-h-[480px] flex-col gap-6 overflow-hidden rounded-3xl bg-slate-900 items-center justify-center p-8 md:p-16 text-center shadow-xl shadow-slate-900/10">
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
                Order from the best restaurant in your neighborhood and satisfy
                your cravings instantly.
              </h2>
            </div>
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
              {categoriesDb.map((cat: any, index: number) => {
                const bgColors = [
                  "from-amber-200/80 to-foodmohalla-400/80 dark:from-amber-700/50 dark:to-foodmohalla-900/50",
                  "from-rose-200/80 to-red-400/80 dark:from-rose-700/50 dark:to-red-900/50",
                  "from-emerald-200/80 to-teal-400/80 dark:from-emerald-700/50 dark:to-teal-900/50",
                  "from-blue-200/80 to-indigo-400/80 dark:from-blue-700/50 dark:to-indigo-900/50",
                  "from-purple-200/80 to-fuchsia-400/80 dark:from-purple-700/50 dark:to-fuchsia-900/50",
                  "from-lime-200/80 to-green-400/80 dark:from-lime-700/50 dark:to-green-900/50"
                ];
                const gradientClass = bgColors[index % bgColors.length];
                
                return (
                <Link
                  key={cat.slug}
                  href={`/menu?category=${cat.slug}`}
                  className="group cursor-pointer flex flex-col gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-full aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br ${gradientClass}`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110 relative z-0"
                      style={cat.image ? { backgroundImage: `url(${cat.image})` } : {}}
                    ></div>
                    {!cat.image && (
                      <div className="absolute inset-0 flex items-center justify-center text-white/50 opacity-50 z-20 mix-blend-overlay">
                        <span className="material-symbols-outlined !text-6xl">{cat.icon}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-1 pb-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-slate-900 text-lg font-bold leading-normal">
                        {cat.name}
                      </p>
                      <div className="bg-slate-100 text-primary p-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
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
                );
              })}
            </div>
          </div>



          {/* Developer Credit banner removed, migrated to Footer */}
          {/* Features / Why Us */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 md:p-12 mb-12 mt-8">
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
                    className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all group"
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


        </div>
      </div>
    </>
  );
}
