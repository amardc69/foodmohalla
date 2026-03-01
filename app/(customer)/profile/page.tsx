"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

function ProfileContent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const currentUser = useQuery(api.users.currentUser, 
    session?.user?.id ? { authProviderId: session.user.id } : "skip" // Assuming email/id is used to lookup
  );
  
  if (status === "loading" || currentUser === undefined) {
    return (
      <div className="flex flex-1 justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // fallback if user is in session but not fully synced in Convex yet
  const userToDisplay = currentUser || session?.user;

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
             <div className="size-32 rounded-full bg-gradient-to-br from-primary/20 to-orange-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative group">
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
          <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">Order History</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">Favorites</span>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">Addresses</span>
          </button>
        </div>

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
