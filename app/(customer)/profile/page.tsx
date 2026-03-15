"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

function ProfileContent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const currentUser = useQuery(api.users.currentUser, 
    (session?.user as any)?.id ? { authProviderId: (session!.user as any).id as string } : "skip" // Assuming email/id is used to lookup
  );
  
  const [activeTab, setActiveTab] = useState<"overview" | "favorites">("overview");

  // Fetch favorites
  const favorites = useQuery(api.favourites.getUserFavourites, 
    currentUser?.id ? { userId: currentUser.id } : "skip"
  );
  
  if (status === "loading" || currentUser === undefined) {
    return (
      <div className="flex flex-1 justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // fallback if user is in session but not fully synced in Convex yet
  const userToDisplay: any = currentUser || session?.user;

  return (
    <div className="flex flex-1 flex-col items-center py-12 px-4 bg-slate-50 min-h-screen w-full">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <Link href="/menu" className="size-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors text-slate-600 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          
          {/* Avatar Area */}
          <div className="shrink-0 flex flex-col items-center">
             <div className="size-32 rounded-full bg-gradient-to-br from-primary/20 to-foodmohalla-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative group">
                {userToDisplay?.image ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={userToDisplay.image} alt={userToDisplay.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-primary">
                    {userToDisplay?.name?.charAt(0) || "U"}
                  </span>
                )}
             </div>
          </div>

          {/* User Details */}
          <div className="flex flex-col gap-1 flex-1 w-full">
            <h2 className="text-2xl font-bold text-slate-900">
              {userToDisplay?.name || "Foodie"}
            </h2>
            <p className="text-slate-500 font-medium mb-4">
              @{currentUser?.username || userToDisplay?.email?.split('@')[0] || "user"}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                 <span className="font-semibold text-slate-700">
                   {currentUser?.phone || "Not set"}
                 </span>
              </div>
              <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                 <span className="font-semibold text-slate-700 truncate">
                   {userToDisplay?.email || "Not set"}
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-slate-900 mt-6 tracking-tight">Account Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/orders" className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">Order History</span>
          </Link>
          
          <button 
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-3 p-4 bg-white border ${activeTab === "favorites" ? "border-primary shadow-md" : "border-slate-200"} rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group`}
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className={activeTab === "favorites" ? "material-symbols-outlined material-icons-round text-primary" : "material-symbols-outlined"}>favorite</span>
            </div>
            <span className={`font-bold transition-colors ${activeTab === "favorites" ? "text-primary" : "text-slate-700 group-hover:text-primary"}`}>Favorites</span>
          </button>

          <Link href="/checkout" className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">Addresses</span>
          </Link>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === "favorites" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">favorite</span> Your Favorites
            </h2>
            
            {favorites === undefined ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <span className="material-symbols-outlined !text-4xl">heart_broken</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No favorites yet</h3>
                <p className="text-slate-500 max-w-sm mb-6">You haven&apos;t added any items to your favorites. Explore our menu and save your top picks!</p>
                <Link href="/menu" className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-foodmohalla-600 transition-colors shadow-sm">
                  Explore Menu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 items-center group hover:shadow-md transition-shadow">
                    <div className="size-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                       {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                      </div>
                      <p className="text-sm font-semibold text-primary mt-1">${item.price.toFixed(2)}</p>
                      <Link href={`/menu`} className="mt-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1 w-fit">
                        Order now <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 justify-center items-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
