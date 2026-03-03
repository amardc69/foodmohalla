"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function CustomizeMenuPage() {
  const menuItems = useQuery(api.menu.getMenuItems, {});
  const categoriesDb = useQuery(api.menu.getCategories, {});
  
  const addMenuItem = useMutation(api.menu.addMenuItem);
  const updateMenuItem = useMutation(api.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.menu.deleteMenuItem);
  const generateUploadUrl = useMutation(api.menu.generateUploadUrl);
  
  const addCategory = useMutation(api.menu.addCategory);
  const deleteCategory = useMutation(api.menu.deleteCategory);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<Id<"menuItems"> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Category state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    rating: 0,
    isVeg: true,
    isHot: false,
    badge: "",
    discount: 0,
    isOutOfStock: false,
    isBestSeller: false,
    isFeatured: false,
    addons: [] as { name: string; price: number }[],
  });

  if (menuItems === undefined || categoriesDb === undefined) {
    return <div className="p-8 text-center text-slate-500">Loading menu...</div>;
  }

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      isVeg: item.isVeg,
      isHot: item.isHot || false,
      badge: item.badge || "",
      discount: item.discount || 0,
      isOutOfStock: item.isOutOfStock || false,
      isBestSeller: item.isBestSeller || false,
      isFeatured: item.isFeatured || false,
      addons: item.addons || [],
    });
    setEditingId(item._id);
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      id: `item-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      image: "",
      category: categoriesDb[0]?.slug || "",
      rating: 5.0,
      isVeg: true,
      isHot: false,
      badge: "",
      discount: 0,
      isOutOfStock: false,
      isBestSeller: false,
      isFeatured: false,
      addons: [],
    });
    setEditingId(null);
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let storageId = undefined;
      if (selectedFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId: uploadedStorageId } = await result.json();
        storageId = uploadedStorageId;
      }

      if (editingId) {
        // Strip fields not accepted by updateMenuItem
        const { id: _id, rating: _rating, ...updateData } = formData;
        await updateMenuItem({
          _id: editingId,
          storageId,
          ...updateData,
        });
      } else {
        await addMenuItem({
          ...formData,
          storageId,
        });
      }
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to save menu item:", error);
      alert("Failed to save menu item. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: Id<"menuItems">) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteMenuItem({ _id: id });
    }
  };

  const addAddon = () => {
    setFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, { name: "", price: 0 }],
    }));
  };

  const updateAddon = (index: number, field: "name" | "price", value: string | number) => {
    const newAddons = [...formData.addons];
    newAddons[index] = { ...newAddons[index], [field]: value };
    setFormData({ ...formData, addons: newAddons });
  };

  const removeAddon = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    await addCategory({
      name: newCategoryName,
      slug,
      description: "",
      image: "",
      icon: "restaurant_menu"
    });
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (id: Id<"categories">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this category? Items under it will not have a valid category.")) {
      await deleteCategory({ id });
    }
  };

  const filteredMenuItems = activeCategoryFilter 
    ? menuItems.filter(item => item.category === activeCategoryFilter)
    : menuItems;

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
            Customize Menu
          </h2>
          <p className="text-text-muted mt-1">
            Build your menu, add images, modify addons, and set item flags.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm cursor-pointer"
        >
          + Add New Item
        </button>
      </div>

      {/* Categories Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setActiveCategoryFilter(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-colors ${
              activeCategoryFilter === null 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Items
          </button>
          
          {categoriesDb.map((cat) => (
             <div key={cat._id} className="relative group">
               <button
                 onClick={() => setActiveCategoryFilter(cat.slug)}
                 className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-colors flex items-center pr-8 ${
                   activeCategoryFilter === cat.slug 
                     ? "bg-slate-800 text-white shadow-md" 
                     : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                 }`}
               >
                 {cat.name}
               </button>
               <button
                 onClick={(e) => handleDeleteCategory(cat._id, e)}
                 className={`absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 ${
                   activeCategoryFilter === cat.slug ? "text-slate-300 hover:text-red-400" : "text-gray-400 hover:text-red-500"
                 }`}
               >
                 <span className="material-symbols-outlined text-[14px]">close</span>
               </button>
             </div>
          ))}

          {isAddingCategory ? (
            <form onSubmit={handleAddCategory} className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <input 
                type="text" 
                autoFocus
                placeholder="Category Name" 
                className="px-3 py-1.5 border border-primary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-40"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button type="submit" className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-orange-600 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
              <button type="button" onClick={() => setIsAddingCategory(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-full hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors whitespace-nowrap font-bold text-sm flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Category
            </button>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenuItems.map((item) => (
          <div key={item._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
            <div className="h-48 bg-gray-100 relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              {item.isOutOfStock && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-black tracking-widest rounded-full shadow-lg">OUT OF STOCK</span>
                </div>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                 {item.isBestSeller && <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded shadow-sm">BEST SELLER</span>}
                 {item.isFeatured && <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded shadow-sm">FEATURED</span>}
              </div>
              
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded cursor-default shadow-sm border border-gray-100">
                 {item.isVeg ? (
                   <div className="border-2 border-green-500 w-4 h-4 flex items-center justify-center p-[1px]">
                     <div className="bg-green-500 rounded-full w-2 h-2"></div>
                   </div>
                 ) : (
                   <div className="border-2 border-red-500 w-4 h-4 flex items-center justify-center p-[1px]">
                     <div className="bg-red-500 rounded-full w-2 h-2"></div>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-text-main leading-tight flex-1">{item.name}</h3>
                <span className="font-bold text-primary whitespace-nowrap">₹{item.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-text-muted line-clamp-2 mb-3">{item.description}</p>
              
              {/* Quick toggles */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={(e) => { e.stopPropagation(); updateMenuItem({ _id: item._id, isOutOfStock: !item.isOutOfStock }); }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                    item.isOutOfStock
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-red-200 hover:text-red-500"
                  }`}
                >
                  {item.isOutOfStock ? "✕ Out of Stock" : "In Stock"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateMenuItem({ _id: item._id, isBestSeller: !item.isBestSeller }); }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                    item.isBestSeller
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-yellow-200 hover:text-yellow-600"
                  }`}
                >
                  ★ Best Seller
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateMenuItem({ _id: item._id, isFeatured: !item.isFeatured }); }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                    item.isFeatured
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  ◆ Featured
                </button>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 py-1.5 border border-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  Edit Options
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="w-8 flex items-center justify-center border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMenuItems.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
             <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">restaurant_menu</span>
             <p className="text-text-muted font-medium">No menu items found for this category.</p>
          </div>
        )}
      </div>

      {/* Modal Overlay for Editing/Adding Items */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {uploading && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
                 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <p className="mt-4 font-bold text-text-main">Saving item...</p>
               </div>
            )}
            
            <div className="sticky top-0 bg-white/95 backdrop-blur z-40 border-b border-gray-100 px-8 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <button 
                onClick={() => { setIsEditing(false); setSelectedFile(null); }}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                disabled={uploading}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Item Name</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Item Image</label>
                  <div className="flex items-center gap-4">
                    {formData.image && !selectedFile && (
                      <img src={formData.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    )}
                    {selectedFile && (
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-200">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      required={!editingId && !formData.image}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Price (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Category</label>
                  <select
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" disabled>Select a category</option>
                    {categoriesDb.map(c => (
                      <option key={c._id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider">Item Flags & Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  
                  {/* Veg / Non-Veg Toggle Switch */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-bold text-text-muted">Dietary Preference</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isVeg: true })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-l-lg border-y border-l transition-colors ${
                          formData.isVeg 
                            ? "bg-green-50 border-green-500 text-green-700 font-bold z-10 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">eco</span>
                        Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isVeg: false })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-r-lg border transition-colors ${
                          !formData.isVeg 
                            ? "bg-red-50 border-red-500 text-red-700 font-bold z-10 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">restaurant</span>
                        Non-Veg
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      checked={formData.isOutOfStock}
                      onChange={(e) => setFormData({ ...formData, isOutOfStock: e.target.checked })}
                    />
                    <span className="text-sm font-semibold">Out of Stock</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    />
                    <span className="text-sm font-semibold">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span className="text-sm font-semibold">Featured Item</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                    />
                    <span className="text-sm font-semibold">Spicy / Hot</span>
                  </label>

                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-bold text-text-muted">Discount (₹/%)</label>
                    <div className="relative">
                       <input
                         type="number"
                         min="0"
                         className="w-full pl-3 pr-4 py-2 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
                         value={formData.discount}
                         onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Addons</h3>
                  <button
                    type="button"
                    onClick={addAddon}
                    className="text-xs font-bold text-primary hover:text-orange-600 transition-colors bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Addon
                  </button>
                </div>
                {formData.addons.length === 0 ? (
                  <p className="text-sm text-text-muted italic border-2 border-dashed border-gray-200 p-6 rounded-xl text-center">No addons configured for this item.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.addons.map((addon, index) => (
                      <div key={index} className="flex gap-3 items-center p-2 rounded-lg border border-gray-200 bg-white">
                        <input
                          type="text"
                          placeholder="Addon Name (e.g. Extra Cheese)"
                          className="flex-1 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                          value={addon.name}
                          onChange={(e) => updateAddon(index, "name", e.target.value)}
                          required
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-sm text-gray-400">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            min="0"
                            className="w-full pl-7 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                            value={addon.price}
                            onChange={(e) => updateAddon(index, "price", parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAddon(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Addon"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-orange-600 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                  disabled={uploading}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
