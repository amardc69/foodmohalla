"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const OFFER_TYPES = [
  {
    value: "percentage",
    label: "Percentage Off",
    icon: "percent",
    color: "bg-blue-500",
    desc: "X% discount on cart total",
  },
  {
    value: "flat",
    label: "Flat Discount",
    icon: "money_off",
    color: "bg-green-500",
    desc: "Fixed ₹ amount off the order",
  },
  {
    value: "bogo",
    label: "Buy One Get One",
    icon: "add_shopping_cart",
    color: "bg-purple-500",
    desc: "Buy X items, get Y free",
  },
  {
    value: "free_item",
    label: "Free Item",
    icon: "redeem",
    color: "bg-amber-500",
    desc: "A free menu item on qualifying orders",
  },
  {
    value: "combo",
    label: "Combo Deal",
    icon: "fastfood",
    color: "bg-rose-500",
    desc: "Discount when specific items bought together",
  },
  {
    value: "cashback",
    label: "Cashback",
    icon: "account_balance_wallet",
    color: "bg-teal-500",
    desc: "Credits earned for future orders",
  },
];

function getTypeConfig(type: string) {
  return OFFER_TYPES.find((t) => t.value === type) || OFFER_TYPES[0];
}

function formatDate(ts: number | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface OfferFormData {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimitPerUser: number;
  totalUsageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  bogoCategory: string;
  bogoItemId: string;
  bogoBuyQty: number;
  bogoGetQty: number;
  freeItemId: string;
  freeItemName: string;
  comboItemIds: string[];
  cashbackAmount: number;
}

const defaultFormData: OfferFormData = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  usageLimitPerUser: 1,
  totalUsageLimit: 0,
  validFrom: "",
  validUntil: "",
  isActive: true,
  bogoCategory: "",
  bogoItemId: "",
  bogoBuyQty: 1,
  bogoGetQty: 1,
  freeItemId: "",
  freeItemName: "",
  comboItemIds: [],
  cashbackAmount: 0,
};

export default function OffersPage() {
  const offers = useQuery(api.offers.getOptions, {});
  const menuItems = useQuery(api.menu.getMenuItems, {});
  const categories = useQuery(api.menu.getCategories, {});
  const addOffer = useMutation(api.offers.addOffer);
  const updateOfferMut = useMutation(api.offers.updateOffer);
  const deleteOffer = useMutation(api.offers.deleteOffer);
  const toggleOfferStatus = useMutation(api.offers.toggleOfferStatus);

  const adminSettings = useQuery(api.adminSettings.getAllSettings);
  const freeDeliveryEnabled = adminSettings?.freeDeliveryEnabled;
  const freeDeliveryThreshold = adminSettings?.freeDeliveryThreshold;
  const setSetting = useMutation(api.adminSettings.setSetting);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<Id<"offers"> | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(defaultFormData);
  const [comboInput, setComboInput] = useState("");

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
    setFormData(defaultFormData);
    setEditingId(null);
    setIsEditing(true);
  };

  const handleEdit = (offer: any) => {
    setFormData({
      code: offer.code,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderValue: offer.minOrderValue || 0,
      maxDiscount: offer.maxDiscount || 0,
      usageLimitPerUser: offer.usageLimitPerUser || 1,
      totalUsageLimit: offer.totalUsageLimit || 0,
      validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split("T")[0] : "",
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split("T")[0] : "",
      isActive: offer.isActive,
      bogoCategory: offer.bogoCategory || "",
      bogoItemId: offer.bogoItemId || "",
      bogoBuyQty: offer.bogoBuyQty || 1,
      bogoGetQty: offer.bogoGetQty || 1,
      freeItemId: offer.freeItemId || "",
      freeItemName: offer.freeItemName || "",
      comboItemIds: offer.comboItemIds || [],
      cashbackAmount: offer.cashbackAmount || 0,
    });
    setEditingId(offer._id);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      code: formData.code.toUpperCase().replace(/\s+/g, ""),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      minOrderValue: formData.minOrderValue || undefined,
      maxDiscount: formData.maxDiscount || undefined,
      usageLimitPerUser: formData.usageLimitPerUser || undefined,
      totalUsageLimit: formData.totalUsageLimit || undefined,
      validFrom: formData.validFrom ? new Date(formData.validFrom).getTime() : undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil + "T23:59:59").getTime() : undefined,
      isActive: formData.isActive,
    };

    // Type-specific fields
    if (formData.discountType === "bogo") {
      payload.bogoCategory = formData.bogoCategory || undefined;
      payload.bogoItemId = formData.bogoItemId || undefined;
      payload.bogoBuyQty = formData.bogoBuyQty;
      payload.bogoGetQty = formData.bogoGetQty;
    }
    if (formData.discountType === "free_item") {
      payload.freeItemId = formData.freeItemId || undefined;
      payload.freeItemName = formData.freeItemName || undefined;
    }
    if (formData.discountType === "combo") {
      payload.comboItemIds = formData.comboItemIds.length > 0 ? formData.comboItemIds : undefined;
    }
    if (formData.discountType === "cashback") {
      payload.cashbackAmount = formData.cashbackAmount;
    }

    if (editingId) {
      await updateOfferMut({ id: editingId, ...payload });
    } else {
      await addOffer(payload);
    }
    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = async (id: Id<"offers">) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      await deleteOffer({ id });
    }
  };

  const addComboItem = (itemId: string) => {
    if (itemId && !formData.comboItemIds.includes(itemId)) {
      setFormData({ ...formData, comboItemIds: [...formData.comboItemIds, itemId] });
    }
    setComboInput("");
  };

  const removeComboItem = (itemId: string) => {
    setFormData({
      ...formData,
      comboItemIds: formData.comboItemIds.filter((id) => id !== itemId),
    });
  };

  // ─── Create / Edit Form ────────────────────────────────────────────────────
  if (isEditing) {
    const selectedType = getTypeConfig(formData.discountType);
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-main">
            {editingId ? "Edit Offer" : "Create New Offer"}
          </h2>
          <button
            onClick={() => { setIsEditing(false); setEditingId(null); }}
            className="text-text-muted hover:text-text-main transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Offer Type Selector */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
            Select Offer Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {OFFER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, discountType: type.value, discountValue: 0 })}
                className={`p-4 rounded-xl border-2 transition-all text-left group ${
                  formData.discountType === type.value
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3 ${type.color} ${
                    formData.discountType === type.value ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  } transition-opacity`}
                >
                  <span className="material-symbols-outlined text-xl">{type.icon}</span>
                </div>
                <p className="text-sm font-bold text-text-main leading-tight">{type.label}</p>
                <p className="text-[10px] text-text-muted mt-1 leading-snug">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
          {/* Common Fields */}
          <div>
            <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
              <span className={`material-symbols-outlined text-white p-1.5 rounded-lg ${selectedType.color}`}>{selectedType.icon}</span>
              Basic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Coupon Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. WELCOME50"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase font-mono text-lg tracking-wider"
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
            </div>
          </div>

          {/* Type-Specific Fields */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-text-main mb-4">Discount Configuration</h3>

            {/* Percentage */}
            {formData.discountType === "percentage" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Discount Percentage (%)</label>
                  <input
                    required type="number" min="1" max="100" step="1"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Max Discount Cap (₹)</label>
                  <input
                    type="number" min="0"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || 0 })}
                    placeholder="Leave 0 for no cap"
                  />
                </div>
              </div>
            )}

            {/* Flat */}
            {formData.discountType === "flat" && (
              <div className="max-w-sm">
                <label className="block text-sm font-bold text-text-muted mb-2">Flat Discount Amount (₹)</label>
                <input
                  required type="number" min="1"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}

            {/* BOGO */}
            {formData.discountType === "bogo" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">Apply To</label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                      value={formData.bogoItemId ? "item" : "category"}
                      onChange={(e) => {
                        if (e.target.value === "item") {
                          setFormData({ ...formData, bogoCategory: "" });
                        } else {
                          setFormData({ ...formData, bogoItemId: "" });
                        }
                      }}
                    >
                      <option value="category">Entire Category</option>
                      <option value="item">Specific Item</option>
                    </select>
                  </div>
                  {!formData.bogoItemId && (
                    <div>
                      <label className="block text-sm font-bold text-text-muted mb-2">Category</label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                        value={formData.bogoCategory}
                        onChange={(e) => setFormData({ ...formData, bogoCategory: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories?.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.bogoItemId !== undefined && formData.bogoCategory === "" && (
                    <div>
                      <label className="block text-sm font-bold text-text-muted mb-2">Specific Item</label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                        value={formData.bogoItemId}
                        onChange={(e) => setFormData({ ...formData, bogoItemId: e.target.value })}
                      >
                        <option value="">Select Item</option>
                        {menuItems?.map((item) => (
                          <option key={item.id} value={item.id}>{item.name} (₹{item.price})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">Buy Qty</label>
                    <input
                      type="number" min="1"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      value={formData.bogoBuyQty}
                      onChange={(e) => setFormData({ ...formData, bogoBuyQty: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">Get Free Qty</label>
                    <input
                      type="number" min="1"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      value={formData.bogoGetQty}
                      onChange={(e) => setFormData({ ...formData, bogoGetQty: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Free Item */}
            {formData.discountType === "free_item" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Free Item</label>
                  <select
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                    value={formData.freeItemId}
                    onChange={(e) => {
                      const item = menuItems?.find((i) => i.id === e.target.value);
                      setFormData({
                        ...formData,
                        freeItemId: e.target.value,
                        freeItemName: item?.name || "",
                      });
                    }}
                  >
                    <option value="">Select item to give free</option>
                    {menuItems?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (₹{item.price})
                      </option>
                    ))}
                  </select>
                </div>
                {formData.freeItemName && (
                  <div className="flex items-end">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">redeem</span>
                      <span className="text-sm font-bold text-green-800">Free: {formData.freeItemName}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Combo */}
            {formData.discountType === "combo" && (
              <div className="space-y-4">
                <div className="max-w-sm">
                  <label className="block text-sm font-bold text-text-muted mb-2">Combo Discount (₹)</label>
                  <input
                    required type="number" min="1"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Required Items (all must be in cart)</label>
                  <div className="flex gap-2 mb-3">
                    <select
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                      value={comboInput}
                      onChange={(e) => setComboInput(e.target.value)}
                    >
                      <option value="">Select item to add</option>
                      {menuItems
                        ?.filter((i) => !formData.comboItemIds.includes(i.id))
                        .map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => addComboItem(comboInput)}
                      disabled={!comboInput}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-foodmohalla-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.comboItemIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.comboItemIds.map((id) => {
                        const item = menuItems?.find((i) => i.id === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-sm font-semibold"
                          >
                            {item?.name || id}
                            <button type="button" onClick={() => removeComboItem(id)} className="hover:text-rose-900">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cashback */}
            {formData.discountType === "cashback" && (
              <div className="max-w-sm">
                <label className="block text-sm font-bold text-text-muted mb-2">Cashback Amount (₹)</label>
                <input
                  required type="number" min="1"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.cashbackAmount}
                  onChange={(e) => setFormData({ ...formData, cashbackAmount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-text-muted mt-2">This amount will be credited to the customer&apos;s wallet after the order is delivered.</p>
              </div>
            )}
          </div>

          {/* Usage Restrictions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-text-main mb-4">Restrictions & Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Min. Order Value (₹)</label>
                <input
                  type="number" min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                  placeholder="0 = no minimum"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Usage per Person</label>
                <input
                  type="number" min="1"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Total Usage Limit</label>
                <input
                  type="number" min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.totalUsageLimit}
                  onChange={(e) => setFormData({ ...formData, totalUsageLimit: parseInt(e.target.value) || 0 })}
                  placeholder="0 = unlimited"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm font-bold text-text-main">{formData.isActive ? "Active" : "Inactive"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-text-main mb-4">Validity Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setEditingId(null); }}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-foodmohalla-600 transition-colors shadow-sm shadow-primary/20"
            >
              {editingId ? "Update Offer" : "Create Offer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── List View ──────────────────────────────────────────────────────────────
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
            Enable a persistent free delivery offer across the menu. When active, delivery fees will automatically become ₹0 if the customer&apos;s cart exceeds the configured threshold.
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
            Create discount codes, BOGO deals, free items, combo offers and cashback to reward your customers.
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
        {offers.map((offer) => {
          const typeConfig = getTypeConfig(offer.discountType);
          return (
            <div
              key={offer._id}
              className={`bg-white rounded-xl border ${offer.isActive ? "border-primary/30 shadow-sm shadow-primary/5" : "border-gray-200 opacity-60"} overflow-hidden flex flex-col relative transition-all hover:shadow-md group`}
            >
              {/* Dashed line effect mimicking a coupon */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-slate-50 border-r border-gray-200 -translate-y-1/2 z-10 hidden sm:block"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-slate-50 border-l border-gray-200 -translate-y-1/2 z-10 hidden sm:block"></div>

              {/* Header */}
              <div className={`p-5 flex-1 flex flex-col items-center justify-center text-center ${offer.isActive ? "bg-primary/5" : "bg-gray-50"} border-b border-dashed border-gray-300`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full text-white ${typeConfig.color}`}>
                    {typeConfig.label.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${offer.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {offer.isActive ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-text-main uppercase tracking-widest border-2 border-dashed border-text-main px-4 py-2 rounded-lg bg-white shadow-sm mb-2">
                  {offer.code}
                </h3>
                <p className="text-sm font-bold text-text-main">
                  {offer.discountType === "percentage" && `${offer.discountValue}% OFF`}
                  {offer.discountType === "flat" && `₹${offer.discountValue} OFF`}
                  {offer.discountType === "bogo" && `Buy ${offer.bogoBuyQty || 1} Get ${offer.bogoGetQty || 1} Free`}
                  {offer.discountType === "free_item" && `Free ${offer.freeItemName || "Item"}`}
                  {offer.discountType === "combo" && `₹${offer.discountValue} OFF on Combo`}
                  {offer.discountType === "cashback" && `₹${offer.cashbackAmount || 0} Cashback`}
                </p>
              </div>

              {/* Details */}
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
                  <span className="text-text-main font-bold">{offer.usageLimitPerUser || "Unlimited"} time(s)</span>
                </div>
                {offer.totalUsageLimit ? (
                  <div className="flex justify-between">
                    <span>Total limit:</span>
                    <span className="text-text-main font-bold">{offer.timesUsed || 0}/{offer.totalUsageLimit}</span>
                  </div>
                ) : null}
                {(offer.validFrom || offer.validUntil) && (
                  <div className="flex justify-between">
                    <span>Valid:</span>
                    <span className="text-text-main font-bold text-[10px]">
                      {formatDate(offer.validFrom)} – {formatDate(offer.validUntil)}
                    </span>
                  </div>
                )}
                {offer.timesUsed ? (
                  <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
                    <span>Times used:</span>
                    <span className="text-primary font-bold">{offer.timesUsed}</span>
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
                <button
                  onClick={() => handleEdit(offer)}
                  className="flex-1 py-1.5 rounded text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
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
          );
        })}

        {offers.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">local_offer</span>
            <p className="text-text-muted font-medium">No offers configured yet.</p>
            <button onClick={handleAddNew} className="mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-foodmohalla-600 transition-colors">
              Create Your First Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
