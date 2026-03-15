"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
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
  
  const [activeTab, setActiveTab] = useState<"overview" | "favorites" | "addresses">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });

  const updateProfile = useMutation(api.users.updateProfile);

  // Fetch favorites
  const favorites = useQuery(api.favourites.getUserFavourites, 
    currentUser?.id ? { userId: currentUser.id } : "skip"
  );

  // Fetch addresses
  const addresses = useQuery(api.addresses.getAddresses,
    currentUser?.id ? { userId: currentUser.id } : "skip"
  );

  function handleEditClick() {
    setEditForm({ name: userToDisplay?.name || "", phone: currentUser?.phone || "" });
    setIsEditing(true);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser?.id) return;
    try {
      await updateProfile({ userId: currentUser.id, name: editForm.name, phone: editForm.phone });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  }
  
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {userToDisplay?.name || "Foodie"}
                </h2>
                <p className="text-slate-500 font-medium mb-4">
                  @{currentUser?.username || userToDisplay?.email?.split('@')[0] || "user"}
                </p>
              </div>
              <button onClick={handleEditClick} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            </div>
            
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

          <button 
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-3 p-4 bg-white border ${activeTab === "addresses" ? "border-primary shadow-md" : "border-slate-200"} rounded-2xl hover:border-primary/30 hover:shadow-md transition-all text-left group`}
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <span className={`font-bold transition-colors ${activeTab === "addresses" ? "text-primary" : "text-slate-700 group-hover:text-primary"}`}>Addresses</span>
          </button>
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
                      <p className="text-sm font-semibold text-primary mt-1">₹{item.price.toFixed(2)}</p>
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

        {activeTab === "addresses" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span> Saved Addresses
            </h2>
            
            {addresses === undefined ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <span className="material-symbols-outlined !text-4xl">location_off</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No addresses saved</h3>
                <p className="text-slate-500 max-w-sm mb-6">Add an address during checkout for faster ordering next time!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr: any) => (
                  <div key={addr._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 items-start group hover:shadow-md transition-shadow">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined">{addr.icon || "location_on"}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{addr.label || "Address"}</h4>
                        {addr.isSelected && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                        {addr.flat && <span className="block font-medium text-slate-700">{addr.flat}</span>}
                        {addr.address}
                        {addr.landmark && <span className="block mt-1">Landmark: {addr.landmark}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit</span>
                  Edit Profile
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleEditSave} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-500 ml-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary outline-none shadow-sm transition-shadow text-slate-700 font-medium"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-500 ml-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary outline-none shadow-sm transition-shadow text-slate-700 font-medium"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="w-full mt-4 bg-primary text-white rounded-xl py-3.5 font-bold hover:bg-foodmohalla-600 shadow-md shadow-primary/20 transition-all text-base flex justify-center items-center gap-2">
                     <span className="material-symbols-outlined text-[20px]">save</span>
                     Save Changes
                  </button>
                </form>
              </div>
            </div>
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
