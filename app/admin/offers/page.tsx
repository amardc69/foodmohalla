"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function OffersPage() {
  const offers = useQuery(api.offers.getOptions, {});
  const addOffer = useMutation(api.offers.addOffer);
  const deleteOffer = useMutation(api.offers.deleteOffer);
  const toggleOfferStatus = useMutation(api.offers.toggleOfferStatus);

  const adminSettings = useQuery(api.adminSettings.getAllSettings);
  const freeDeliveryEnabled = adminSettings?.freeDeliveryEnabled;
  const freeDeliveryThreshold = adminSettings?.freeDeliveryThreshold;
  const setSetting = useMutation(api.adminSettings.setSetting);

  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage", // or "flat"
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimitPerUser: 1,
    isActive: true,
  });

  const [localFdEnabled, setLocalFdEnabled] = useState<boolean>(false);
  const [localFdThreshold, setLocalFdThreshold] = useState<string>("0");
  const [saveFdMsg, setSaveFdMsg] = useState("");

  useEffect(() => {
    if (freeDeliveryEnabled !== undefined) {
      setLocalFdEnabled(freeDeliveryEnabled === "true");
    }
  }, [freeDeliveryEnabled]);

  useEffect(() => {
    if (freeDeliveryThreshold !== undefined) {
      setLocalFdThreshold(freeDeliveryThreshold || "0");
    }
  }, [freeDeliveryThreshold]);

  const handleSaveFd = async () => {
    await setSetting({ key: "freeDeliveryEnabled", value: localFdEnabled ? "true" : "false" });
    await setSetting({ key: "freeDeliveryThreshold", value: localFdThreshold.toString() });
    setSaveFdMsg("Saved!");
    setTimeout(() => setSaveFdMsg(""), 2000);
  };

  if (offers === undefined) {
    return <div className="p-8 text-center text-slate-500">Loading offers...</div>;
  }

  const handleAddNew = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimitPerUser: 1,
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOffer({
      ...formData,
      code: formData.code.toUpperCase().replace(/\s+/g, ""), // Sanitize code
      minOrderValue: formData.minOrderValue || undefined,
      maxDiscount: formData.maxDiscount || undefined,
      usageLimitPerUser: formData.usageLimitPerUser || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async (id: Id<"offers">) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      await deleteOffer({ id });
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-text-main">
          Create New Offer / Coupon
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Coupon Code</label>
              <input
                required
                type="text"
                placeholder="e.g. WELCOME50"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Short Description</label>
              <input
                required
                type="text"
                placeholder="e.g. 50% off on your first order"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Discount Type</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">
                Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-text-main mb-4">Usage Restrictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Min. Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Max. Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none flex items-center"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || 0 })}
                  placeholder="Optional"
                  disabled={formData.discountType === "flat"}
                  title={formData.discountType === "flat" ? "Not applicable for flat discounts" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Usage Limit per Person</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-foodmohalla-600 transition-colors"
            >
              Save Offer
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Free Delivery Global Config */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">local_shipping</span>
            Global Free Delivery
          </h3>
          <p className="text-sm text-text-muted mt-2 max-w-xl leading-relaxed">
            Enable a persistent free delivery offer across the menu. When active, delivery fees will automatically become ₹0 if the customer's cart exceeds the configured threshold.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-inner w-full lg:w-auto">
           <div className="flex items-center gap-3">
             <label className="text-sm font-bold text-slate-700">Status</label>
             <button
               onClick={() => setLocalFdEnabled(!localFdEnabled)}
               className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${localFdEnabled ? "bg-green-500" : "bg-gray-300"}`}
             >
               <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${localFdEnabled ? "translate-x-6" : "translate-x-1"}`} />
             </button>
           </div>
           
           <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1"></div>
           
           <div className="flex items-center gap-2">
             <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Min Order (₹)</label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
               <input
                  type="number"
                  min="0"
                  className="w-24 pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:bg-gray-100 bg-white"
                  value={localFdThreshold}
                  onChange={(e) => setLocalFdThreshold(e.target.value)}
                  disabled={!localFdEnabled}
               />
             </div>
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
             <button
               onClick={handleSaveFd}
               className="w-full sm:w-auto px-5 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
             >
               Save Changes
             </button>
             {saveFdMsg && <span className="text-xs font-bold text-green-600 animate-in fade-in duration-300 whitespace-nowrap">{saveFdMsg}</span>}
           </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
            Offers & Coupons
          </h2>
          <p className="text-text-muted mt-1">
            Create discount codes to run marketing campaigns and reward loyalty.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-foodmohalla-600 transition-colors shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          + Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer._id} className={`bg-white rounded-xl border ${offer.isActive ? "border-primary shadow-sm shadow-primary/10" : "border-gray-200 opacity-60"} overflow-hidden flex flex-col relative transition-all`}>
            {/* Dashed line effect mimicking a coupon */}
            <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-slate-50 border-r border-gray-200 -translate-y-1/2 z-10 hidden sm:block"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-slate-50 border-l border-gray-200 -translate-y-1/2 z-10 hidden sm:block"></div>
            
            <div className={`p-5 flex-1 flex flex-col items-center justify-center text-center ${offer.isActive ? "bg-primary/5" : "bg-gray-50"} border-b border-dashed border-gray-300`}>
              <span className={`px-3 py-1 text-xs font-bold rounded-full mb-3 ${offer.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                {offer.isActive ? "ACTIVE" : "DISABLED"}
              </span>
              <h3 className="text-2xl font-black text-text-main uppercase tracking-widest border-2 border-dashed border-text-main px-4 py-2 rounded-lg bg-white shadow-sm mb-2">
                {offer.code}
              </h3>
              <p className="text-sm font-bold text-text-main">
                {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
              </p>
            </div>
            
            <div className="p-4 space-y-2 text-xs text-text-muted font-medium">
              <p>{offer.description}</p>
              <div className="flex justify-between">
                <span>Min Order:</span>
                <span className="text-text-main font-bold">{offer.minOrderValue ? `₹${offer.minOrderValue}` : "None"}</span>
              </div>
              {offer.discountType === "percentage" && (
                <div className="flex justify-between">
                  <span>Max Discount:</span>
                  <span className="text-text-main font-bold">{offer.maxDiscount ? `₹${offer.maxDiscount}` : "No limit"}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Usage per user:</span>
                <span className="text-text-main font-bold">{offer.usageLimitPerUser || "1"} time(s)</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
              <button
                onClick={() => toggleOfferStatus({ id: offer._id, isActive: !offer.isActive })}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
                  offer.isActive 
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {offer.isActive ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => handleDelete(offer._id)}
                className="w-10 flex items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Delete Offer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ))}

        {offers.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">local_offer</span>
            <p className="text-text-muted font-medium">No offers configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
