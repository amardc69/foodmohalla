"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import imageCompression from "browser-image-compression";

export default function CustomizeMenuPage() {
  const menuItems = useQuery(api.menu.getMenuItems, {});
  const categoriesDb = useQuery(api.menu.getCategories, {});
  
  const addMenuItem = useMutation(api.menu.addMenuItem);
  const updateMenuItem = useMutation(api.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.menu.deleteMenuItem);
  const generateUploadUrl = useMutation(api.menu.generateUploadUrl);
  
  const addCategory = useMutation(api.menu.addCategory);
  const updateCategory = useMutation(api.menu.updateCategory);
  const deleteCategory = useMutation(api.menu.deleteCategory);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<Id<"menuItems"> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Category state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<Id<"categories"> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("restaurant_menu");
  const [selectedCategoryImage, setSelectedCategoryImage] = useState<File | null>(null);
  const [categoryUploading, setCategoryUploading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const ICONS_LIST = [
    // Meals & Fast Food
    "restaurant_menu", "lunch_dining", "local_pizza", "tapas", "burger", "fastfood", "set_meal",
    "bento", "rice_bowl", "soup_kitchen", "ramen_dining", "kebab_dining", "dinner_dining",
    "brunch_dining", "breakfast_dining", "bakery_dining", "takeout_dining",
    
    // Drinks & Cafe
    "local_cafe", "coffee", "emoji_food_beverage", "coffee_maker", "local_drink", "water_drop",
    "liquor", "wine_bar", "local_bar", "sports_bar", "nightlife", "celebration", "glass_cup",

    // Sweets & Desserts
    "icecream", "cake", "cookie", "bakery_dining", 
    
    // Ingredients
    "egg", "egg_alt", "eco", "grass", "nature", "agriculture",
    
    // Utensils & Dining
    "restaurant", "local_dining", "flatware", "menu_book", "room_service", "delivery_dining",
    "kitchen", "food_bank", "outdoor_grill", "microwave", "blender", "iron", "gas_meter",

    // Food Traits & Prep
    "local_fire_department", "ac_unit", "cruelty_free", "healing",

    // Embellishments/General
    "favorite", "favorite_border", "star", "stars", "whatshot", "thumb_up", "new_releases",
    "verified", "loyalty", "local_offer", "sell", "discount", "redeem", "savings", "storefront",
    
    // Extras (filling out 100 common material-symbols in food context)
    "shopping_cart", "shopping_basket", "receipt_long", "receipt", "local_shipping", "two_wheeler",
    "electric_moped", "pedal_bike", "delivery_dining", "store", "restaurant",
    "home", "location_on", "my_location", "map", "tour", "directions_walk", "directions_run",
    "volunteer_activism", "support_agent", "sentiment_satisfied", "sentiment_very_satisfied",
    "cake", "icecream", "local_pizza", "fastfood", "local_cafe", "emoji_food_beverage", "cookie",
    "rice_bowl", "soup_kitchen", "egg", "egg_alt", "tapas", "liquor", "wine_bar"
  ];

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
    isSizeBased: false,
    isHot: false,
    badge: "",
    discount: 0,
    isOutOfStock: false,
    isBestSeller: false,
    isFeatured: false,
    calories: 0,
    sizes: [] as { name: string; price: number }[],
    addons: [] as { name: string; price: number, sizePrices?: Record<string, number> }[],
    instructions: [] as string[],
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
      isSizeBased: item.isSizeBased || false,
      isHot: item.isHot || false,
      badge: item.badge || "",
      discount: item.discount || 0,
      isOutOfStock: item.isOutOfStock || false,
      isBestSeller: item.isBestSeller || false,
      isFeatured: item.isFeatured || false,
      calories: item.calories || 0,
      sizes: item.sizes || [],
      addons: item.addons || [],
      instructions: item.instructions || [],
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
      isSizeBased: false,
      isHot: false,
      badge: "",
      discount: 0,
      isOutOfStock: false,
      isBestSeller: false,
      isFeatured: false,
      calories: 0,
      sizes: [],
      addons: [],
      instructions: [],
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
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedFile, options);
        
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": compressedFile.type },
          body: compressedFile,
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

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { name: "", price: 0 }],
    }));
  };

  const updateSize = (index: number, field: "name" | "price", value: string | number) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const addAddon = () => {
    setFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, { name: "", price: 0 }],
    }));
  };

  const updateAddon = (index: number, field: "name" | "price" | "sizePrices", value: string | number | Record<string, number>) => {
    const newAddons = [...formData.addons];
    newAddons[index] = { ...newAddons[index], [field]: value };
    setFormData({ ...formData, addons: newAddons });
  };

  const updateAddonSizePrice = (addonIndex: number, sizeName: string, price: number) => {
    const newAddons = [...formData.addons];
    const currentSizePrices = newAddons[addonIndex].sizePrices || {};
    newAddons[addonIndex] = {
      ...newAddons[addonIndex],
      sizePrices: { ...currentSizePrices, [sizeName]: price }
    };
    setFormData({ ...formData, addons: newAddons });
  };

  const removeAddon = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setCategoryUploading(true);
    try {
      let storageId = undefined;
      let imageUrl = "";

      if (selectedCategoryImage) {
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedCategoryImage, options);
        
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": compressedFile.type },
          body: compressedFile,
        });
        const { storageId: uploadedStorageId } = await result.json();
        storageId = uploadedStorageId;
      }

      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      
      if (editingCategoryId) {
        await updateCategory({
          _id: editingCategoryId,
          name: newCategoryName,
          slug,
          icon: newCategoryIcon,
          storageId: storageId,
        });
      } else {
        await addCategory({
          name: newCategoryName,
          slug,
          description: "",
          image: "", // Gets managed dynamically if passed storageId
          storageId: storageId,
          icon: newCategoryIcon
        });
      }

      setNewCategoryName("");
      setNewCategoryIcon("restaurant_menu");
      setEditingCategoryId(null);
      setSelectedCategoryImage(null);
      setIsAddingCategory(false);
    } catch (err) {
      console.error("Failed to save category", err);
      alert("Failed to save category. Please try again.");
    } finally {
      setCategoryUploading(false);
    }
  };

  const handleEditCategoryClick = (cat: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategoryId(cat._id);
    setNewCategoryName(cat.name);
    setNewCategoryIcon(cat.icon);
    setSelectedCategoryImage(null);
    setIsAddingCategory(true);
  };

  const closeCategoryModal = () => {
    setIsAddingCategory(false);
    setEditingCategoryId(null);
    setNewCategoryName("");
    setNewCategoryIcon("restaurant_menu");
    setSelectedCategoryImage(null);
  };

  const handleDeleteCategory = async (id: Id<"categories">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this category? Items under it will not have a valid category.")) {
      await deleteCategory({ id });
    }
  };

  const filteredMenuItems = menuItems.filter((item: any) => {
    // 1. Category Filter
    if (activeCategoryFilter && item.category !== activeCategoryFilter) return false;
    
    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }
    
    // 3. Status Filter
    if (statusFilter === "veg" && !item.isVeg) return false;
    if (statusFilter === "nonveg" && item.isVeg) return false;
    if (statusFilter === "bestseller" && !item.isBestSeller) return false;
    if (statusFilter === "featured" && !item.isFeatured) return false;
    if (statusFilter === "outofstock" && !item.isOutOfStock) return false;
    
    return true;
  });

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
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-foodmohalla-600 transition-colors shadow-sm cursor-pointer"
        >
          + Add New Item
        </button>
      </div>

      {/* Categories Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 pb-2">
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
            <div key={cat._id} className="inline-flex items-center bg-white border border-gray-200 rounded-full shadow-sm whitespace-nowrap overflow-hidden group">
              <button
                onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat.slug ? null : cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                  activeCategoryFilter === cat.slug
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                <span className="text-sm font-bold">{cat.name}</span>
              </button>
              
              <div className="max-w-0 opacity-0 overflow-hidden group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-center">
                <div className="flex border-l border-gray-100">
                  <button
                    onClick={(e) => handleEditCategoryClick(cat, e)}
                    title="Edit Category"
                    className="px-2 py-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors shrink-0 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px] block">edit</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteCategory(cat._id, e)}
                    title="Delete Category"
                    className="px-2 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border-l border-gray-100 shrink-0 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px] block">close</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isAddingCategory && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">category</span>
                    {editingCategoryId ? "Edit Category" : "New Category"}
                  </h2>
                  <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200 disabled:opacity-50" disabled={categoryUploading}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleAddCategory} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-text-muted ml-1">Category Name</label>
                      <input
                        type="text"
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary outline-none shadow-sm transition-shadow text-slate-700 font-medium"
                        placeholder="e.g. Burgers, Pizza, Sides"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        autoFocus
                        disabled={categoryUploading}
                      />
                    </div>

                    {/* Image Upload for Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-text-muted ml-1">Category Image (Optional)</label>
                      <div className="relative">
                         <input
                           type="file"
                           className="w-full p-2 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-sm text-slate-500"
                           accept="image/*"
                           onChange={(e) => setSelectedCategoryImage(e.target.files?.[0] || null)}
                           disabled={categoryUploading}
                         />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-bold text-text-muted">Select an Icon</label>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary">
                           <span className="material-symbols-outlined text-[18px]">{newCategoryIcon}</span>
                           <span className="text-xs font-bold uppercase tracking-wider">Selected</span>
                        </div>
                      </div>
                      
                      <div className="h-[200px] overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50/80 shadow-inner">
                        {ICONS_LIST.map((iconName, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNewCategoryIcon(iconName)}
                            disabled={categoryUploading}
                            title={iconName}
                            className={`flex items-center justify-center w-full aspect-square rounded-xl transition-all disabled:opacity-50 ${
                              newCategoryIcon === iconName ? "bg-primary text-white shadow-md shadow-primary/30 scale-110" : "bg-white text-gray-500 border border-transparent hover:border-gray-200 hover:text-primary hover:shadow-sm"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={categoryUploading} className="w-full bg-primary text-white rounded-xl py-3.5 font-bold hover:bg-foodmohalla-600 shadow-md shadow-primary/20 transition-all text-base flex justify-center items-center gap-2 disabled:opacity-60">
                      {categoryUploading ? (
                         <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                      ) : (
                         <span className="material-symbols-outlined text-[20px]">{editingCategoryId ? "save" : "add_circle"}</span>
                      )}
                      {categoryUploading ? "Saving..." : (editingCategoryId ? "Save Changes" : "Create Category")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          <button
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-full hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors whitespace-nowrap font-bold text-sm flex items-center gap-1 cursor-pointer bg-white"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Category
          </button>
        </div>
      </div>

      {/* Items Filtering UI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary outline-none shadow-sm transition-shadow"
            placeholder="Search items by name or description..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm font-semibold text-gray-700 cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Items</option>
          <option value="veg">Veg Only</option>
          <option value="nonveg">Non-Veg Only</option>
          <option value="bestseller">Best Sellers</option>
          <option value="featured">Featured</option>
          <option value="outofstock">Out of Stock</option>
        </select>
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
                 {item.isFeatured && <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded shadow-sm">FEATURED</span>}
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
                      ? "bg-slate-50 text-primary border-primary/20"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-primary/20 hover:text-primary"
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
                {!formData.isSizeBased && (
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
                )}
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
                      checked={formData.isSizeBased}
                      onChange={(e) => setFormData({ ...formData, isSizeBased: e.target.checked })}
                    />
                    <span className="text-sm font-semibold">Size-Based Item</span>
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

                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-bold text-text-muted">Calories (kcal)</label>
                    <div className="relative">
                       <input
                         type="number"
                         min="0"
                         className="w-full pl-3 pr-4 py-2 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
                         value={formData.calories}
                         onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                       />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizes section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Sizes</h3>
                  <button
                    type="button"
                    onClick={addSize}
                    className="text-xs font-bold text-primary hover:text-foodmohalla-600 transition-colors bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Size
                  </button>
                </div>
                {formData.sizes.length === 0 ? (
                  <p className="text-sm text-text-muted italic border-2 border-dashed border-gray-200 p-6 rounded-xl text-center">No sizes configured (Standard size will be used).</p>
                ) : (
                  <div className="space-y-3">
                    {formData.sizes.map((size, index) => (
                      <div key={index} className="flex gap-3 items-center p-2 rounded-lg border border-gray-200 bg-white">
                        <input
                          type="text"
                          placeholder="Size Name (e.g. Small, Medium, Large)"
                          className="flex-1 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                          value={size.name}
                          onChange={(e) => updateSize(index, "name", e.target.value)}
                          required
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-sm text-gray-400">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            min="0"
                            className="w-full pl-7 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                            value={size.price}
                            onChange={(e) => updateSize(index, "price", parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Size"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Addons</h3>
                  <button
                    type="button"
                    onClick={addAddon}
                    className="text-xs font-bold text-primary hover:text-foodmohalla-600 transition-colors bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Addon
                  </button>
                </div>
                {formData.addons.length === 0 ? (
                  <p className="text-sm text-text-muted italic border-2 border-dashed border-gray-200 p-6 rounded-xl text-center">No addons configured for this item.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.addons.map((addon, index) => (
                      <div key={index} className="flex flex-col gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                        <div className="flex gap-3 items-center">
                          <input
                            type="text"
                            placeholder="Addon Name (e.g. Extra Cheese)"
                            className="flex-1 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                            value={addon.name}
                            onChange={(e) => updateAddon(index, "name", e.target.value)}
                            required
                          />
                          {!formData.sizes.length && (
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
                          )}
                          <button
                            type="button"
                            onClick={() => removeAddon(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Addon"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </div>
                        {formData.sizes.length > 0 && (
                          <div className="pl-4 border-l-2 border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                            {formData.sizes.map((s, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 w-16 truncate">{s.name}</span>
                                <div className="relative flex-1">
                                  <span className="absolute left-2 top-[3px] text-xs text-gray-400">₹</span>
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    min="0"
                                    className="w-full pl-6 p-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none text-xs"
                                    value={addon.sizePrices?.[s.name] || 0}
                                    onChange={(e) => updateAddonSizePrice(index, s.name, parseFloat(e.target.value) || 0)}
                                    required
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Custom Instructions</h3>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="text-xs font-bold text-primary hover:text-foodmohalla-600 transition-colors bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Instruction
                  </button>
                </div>
                {formData.instructions.length === 0 ? (
                  <p className="text-sm text-text-muted italic border-2 border-dashed border-gray-200 p-6 rounded-xl text-center">No custom instructions configured for this item.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.instructions.map((inst, index) => (
                      <div key={index} className="flex gap-3 items-center p-2 rounded-lg border border-gray-200 bg-white">
                        <input
                          type="text"
                          placeholder="Instruction (e.g. Make it Crispy)"
                          className="flex-1 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                          value={inst}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Instruction"
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
                  className="px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-foodmohalla-600 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
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
