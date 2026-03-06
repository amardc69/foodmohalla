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
                  "from-amber-200/80 to-orange-400/80 dark:from-amber-700/50 dark:to-orange-900/50",
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
                );
              })}
            </div>
          </div>



          {/* Developer Credit banner removed, migrated to Footer */}
          {/* Offers & Combos */}
          <div className="mb-12 mt-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">Offers & Combos</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Unbeatable deals for your hunger pangs</p>
              </div>
              <div className="flex gap-2 hidden md:flex">
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined !text-lg">arrow_back</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar">
              <div className="min-w-[85%] md:min-w-[45%] lg:min-w-[32%] snap-center group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASWhwAH1OKnAANped0axr5Ncc10HfkVjbYb40eL0Qt_15DKFmyIRVUBEOfnkOO5BDU8V8uo4oaHlx-KyiLrvfhwHwnDbh4SfrUssgFUwGrdV4YTTuzjY2MrUcOtbdAb2tBEmLX_7Be1PiQc3Pro3ExpqN0VM_uKt0_2GkYKH8QxH5iuekECuOYOdFV5-qgAII_g4JvEIhjx714IfS3-DPci63_Np-B526PUf3w1Ivl0jUs-3yklGfK3ijm41wx56hNV7oQ6ESDCSjo')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-sm">
                      <span className="material-symbols-outlined !text-sm">local_offer</span>
                        50% OFF
                    </div>
                    <h3 className="text-2xl font-black drop-shadow-md leading-tight">Mega Burger Bash</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-lg">restaurant</span> The Burger Joint</span>
                    <span className="line-through text-slate-400">$24.99</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Combo Price</span>
                      <span className="text-2xl font-bold text-primary">$12.49</span>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                      Claim Offer
                      <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Includes: 2x Classic Cheese Burgers, 2x Fries, 2x Cokes</p>
                </div>
              </div>

              <div className="min-w-[85%] md:min-w-[45%] lg:min-w-[32%] snap-center group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAsvQU2Cu7VrPN2oQcRhLvyXp377w4Ix6SeUkT1-ExOUfeZ-1BvlLWo1NgOp90N4EOfuBhW0hM4_1BOHgFSRgELGGWgVp5LackYaTzNEBtr1VJMh4NwjoNZ1UyjF5ZUf4MMqfQn42nBPJaiDYhVhWwcJn1x48O3PT6gTFH0UTM3AI3mO4UUzWGU21NKf5dO9kG0xNQ-bMgMAXB8JwYfH23zx760T2wbN0f2nWaDpHAZ1SpPLQw5x9dsHBhDyIVz2HnEw2z5Vef94P6W')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center gap-1.5 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-sm">
                      <span className="material-symbols-outlined !text-sm">stars</span>
                        Buy 1 Get 1
                    </div>
                    <h3 className="text-2xl font-black drop-shadow-md leading-tight">Biryani Bonanza</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-lg">restaurant</span> Spice Route</span>
                    <span className="line-through text-slate-400">$32.00</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Starting at</span>
                      <span className="text-2xl font-bold text-primary">$16.00</span>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                      Claim Offer
                      <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Valid on all Chicken & Mutton Biryanis. Weekend Special.</p>
                </div>
              </div>

              <div className="min-w-[85%] md:min-w-[45%] lg:min-w-[32%] snap-center group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbrS-3oLwBOyx9USZFNSnVoNOs53ThglkJADxzSmIrnCJRD_CLyhR8RVi7vuc6KnUhTL4_Rv3oB_0eWBtKyNDFpQuNSvhYP6HN7W40O3YxP7U-849IcdlfbztR1SXTfbcW1yjt9jJk9qDF9PNc6ZKah23MMdBjI5O5BlF8m6oDuNTTY0CCqij_17wCh34V7rdWUqaQ4q_9Cjcypc-460ojUQ__cK537fMZEJSqW4Twj1MMGN0Xs2gcvkWumf8wFehKX4L0EbvYv7yT')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-sm">
                      <span className="material-symbols-outlined !text-sm">groups</span>
                        Family Deal
                    </div>
                    <h3 className="text-2xl font-black drop-shadow-md leading-tight">Family Feast Combo</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-lg">restaurant</span> La Pasta Italiano</span>
                    <span className="line-through text-slate-400">$45.00</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Flat Price</span>
                      <span className="text-2xl font-bold text-primary">$19.99</span>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                      Claim Offer
                      <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">2 Large Pizzas, Garlic Bread, 1.5L Coke. Serves 4.</p>
                </div>
              </div>

              <div className="min-w-[85%] md:min-w-[45%] lg:min-w-[32%] snap-center group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIxR5NG9rwSyxOgKABTILDzgr1HpdsJXSEs4P9nXKWoM4RyvhwP9xVam1spIMnp6q9u8GdAELnaaSOpvdrBcSu1i83xBvMOKgH95XlTUYAwtPlgmlTOmb5p5yvF_7RRIEedSOBq55_wcVQB6gkdEEPMbb4EUkQymZHcUjS-0zI_9cpNjR2XRE7Lco17HFUdGwJbFN66cN1CXdcdwr4fmzLyvaLoQNJETOVavhwZWF7QqYqj8LMDJpLDr9YfL_w7_H2c3VqbZbmotb8')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-sm">
                      <span className="material-symbols-outlined !text-sm">cake</span>
                        Free Dessert
                    </div>
                    <h3 className="text-2xl font-black drop-shadow-md leading-tight">Sweet Tooth Special</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-lg">restaurant</span> Sweet Cravings</span>
                    <span className="text-primary font-bold">Limited Time</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400">On orders above</span>
                      <span className="text-2xl font-bold text-primary">$25.00</span>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                      Claim Offer
                      <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Get a complimentary Chocolate Mousse on all main course orders.</p>
                </div>
              </div>
            </div>
          </div>

          {/* New Arrivals & Seasonal Specials */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">New Arrivals & Seasonal Specials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[300px] flex items-end p-8 group">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3BWPXBSMKqX1YbPLJIeVI92fj31vgs470oD0vb_i5aj-DN_LoKO4OBVtmc2D5zJuoMEVFjUdS_IbsH3Oux8LAUFF5m-c2UgSeB9ZKrefemeJYdwpOXd_kIJcvZQgLvcyFkz1wCRI5EtYDK3ubPF89_uSuvIwcd14v7yMjNOgt283dOL3oRNw9cRI2swhfJx16fx9goevtVWDzoD1kv1mhMn-BtZxPeg_gC5RFRMjSmARrnHzThNIu-UHa971_2mCLU0Y5CL_D5nSl')"}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="relative z-10 w-full">
                  <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">Limited Time</div>
                  <h3 className="text-2xl font-bold mb-2">Summer Berry Salad</h3>
                  <p className="text-slate-200 text-sm mb-4 line-clamp-2 max-w-md">Fresh strawberries, blueberries, and feta cheese on a bed of mixed greens with balsamic glaze.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">$12.99</span>
                    <button className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg">Try Now</button>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[300px] flex items-end p-8 group">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCg-Cg6-uh6VsM8s_cneRxN7aE4dBByyGkrvSIrcyISHAm9mtUq3D5bV7IBy6_NJw95XHcySfYspU3kh8fqBfzBySa9q_T8heYdALzx_-MUH5qnK2v5Ch0DKGg_fKsSDL8FccwL1oI_EPg4v2wtiaZSlGsnQC7Mq9ndfWA53Vsmpu8wec4V9mYGoMZ1fOsqGSeJvHxmC0tVT0jUE2G218oEqPIOsRkhjPzeYgr508AGntx5Qw4NjWm37Uk9Q4h7WXXQ7Xr3iMUyYEKM')"}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="relative z-10 w-full">
                  <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">New Arrival</div>
                  <h3 className="text-2xl font-bold mb-2">Spicy Chicken Pizza</h3>
                  <p className="text-slate-200 text-sm mb-4 line-clamp-2 max-w-md">Wood-fired pizza topped with spicy grilled chicken, jalapenos, and our signature hot sauce.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">$18.50</span>
                    <button className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg">Try Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          <div className="mt-4">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">What Our Foodies Say</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined !text-lg">arrow_back</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar">
              <div className="min-w-[85%] md:min-w-[40%] lg:min-w-[30%] snap-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img alt="Portrait of Priya Sharma" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDVQcb8dQtAYUS389aXuHBKxJ0dqj8J3WMAr3ODKGQdtTJdw9sIjTeRLfD4qZjV66YhwqmjNIcmA6jSBBtnf2bQCgbqp1WXTuS-LI8Meu73W-ANK-HpMKHjSG7IZUibFGR99Rvn_8UtplGj7l946yN76fXsO71vWWhwuhvNykQgN_gzRmY5l1_7KtbLiKfU7FREPrL4FqWCBvT3S1QyuaG9JUCNlMZOEYjg3pPBhctSDX4KsG6wm3HgrzRfgVypbp4iqF1_x1V8e4G" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">Priya Sharma</h4>
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 italic mb-2 leading-relaxed">
                  &quot;Absolutely loved the speed of delivery! The food arrived piping hot and tasted incredibly fresh. Food Mohalla has become my go-to for weekend dinners.&quot;
                </blockquote>
              </div>
              <div className="min-w-[85%] md:min-w-[40%] lg:min-w-[30%] snap-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img alt="Portrait of Rahul Verma" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT8YUt0-MPQNnRaDuxrML5PwJv8v1QxbcaWDUAW2mMBI9qiwSeAhXKo27mdd9_hhUWtJgsxTnSknUsvma2okS--Iv1JtTBH4GK1rQn0IOkxnkNxPoZFLHmEgaju8XzJ6uqKP94oEeegxZtti0Pp5KwsBsllVGkLUQ7vzV7t6jJnCTlX_PqvBnhcRBvktz1lRPcm-nEezKjiXD6yRyZ7Ps3_NmfpXmrMCfUXBRIiMBX7TJVDP1F4hN1FKfYuzHs6Vj74mipNOXBUug_" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">Rahul Verma</h4>
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 italic mb-2 leading-relaxed">
                  &quot;Great variety of restaurants to choose from. The interface is super easy to use, and I found some hidden gems in my neighborhood thanks to this app!&quot;
                </blockquote>
              </div>
              <div className="min-w-[85%] md:min-w-[40%] lg:min-w-[30%] snap-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img alt="Portrait of Aisha Khan" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_EKIyKMVaA9jO1X0DYD7tLz1WiGDpvwz_0DyCDuU5-Ro02VVmsAi-BWmJslXHYLvOny-n7PSOwBc8kBACQ3LN2YprGlrzv6xI8dfcwNxDuKezDD4OomKEX_faYShdwKnY5kxFxq9NjmlZu0He11vummoAAXIoS-kDtJj5prqeB0RBAW4VjaA9Nk5ZcdnqtV9xhwa3xhDbxOBzR1Dej76GrD4B0cUBO6MwKUBZo7f6YbMrrj8sWDNo66rSMp0-Fa-uBXWrukBDDTNq" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">Aisha Khan</h4>
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 italic mb-2 leading-relaxed">
                  &quot;The 'Family Feast Combo' is a lifesaver for our large gatherings. Affordable and delicious. Highly recommend the Biryani options!&quot;
                </blockquote>
              </div>
              <div className="min-w-[85%] md:min-w-[40%] lg:min-w-[30%] snap-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img alt="Portrait of David Chen" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGghBC-isMsyJyDWNrX4QXFJFu84brBf6hAMFPOFrUjmQc6cfJKTVoPx8kBhhd6i0cd8sb6HbESyDflDvT-0FAXk4AEY_bZE0JA-OIa-0SLhvWVRuKMxSjXTzKcQlys0ad9pNXSE3LBH9gWWijHYFuCuuaAJBaZMl140ZW_fltfyPwVRJwTDSf2jPpZQ6hNkVreG59JJETNOZ6kchy-xklwxOiR9W2lMxaz5ecEav2ovNSWos6D50vZnsfVOwrZwm6YuyPmm6PtMD2" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">David Chen</h4>
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star</span>
                      <span className="material-symbols-outlined !text-lg fill-current">star_half</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 italic mb-2 leading-relaxed">
                  &quot;Impressed by the packaging and hygiene standards. The delivery partners are always polite. It's refreshing to see such quality service.&quot;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
