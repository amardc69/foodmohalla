import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMenuItems = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    vegOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("menuItems");

    const items = await q.collect();

    return items.filter((item) => {
      let matches = true;

      if (args.category) {
        matches = matches && item.category === args.category;
      }

      if (args.search) {
        matches = matches && item.name.toLowerCase().includes(args.search.toLowerCase());
      }

      if (args.vegOnly) {
        matches = matches && item.isVeg === true;
      }

      return matches;
    });
  },
});

export const getMenuItemById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_menu_item_id", (q) => q.eq("id", args.id))
      .first();
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const addCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    image: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      image: args.image,
      icon: args.icon,
    });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addMenuItem = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.string(),
    storageId: v.optional(v.id("_storage")),
    category: v.string(),
    rating: v.number(),
    isVeg: v.boolean(),
    isHot: v.optional(v.boolean()),
    badge: v.optional(v.string()),
    addons: v.optional(v.array(v.object({ name: v.string(), price: v.number() }))),
    discount: v.optional(v.number()),
    isOutOfStock: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let imageUrl = args.image;
    if (args.storageId) {
      imageUrl = (await ctx.storage.getUrl(args.storageId)) || args.image;
    }

    return await ctx.db.insert("menuItems", {
      id: args.id,
      name: args.name,
      description: args.description,
      price: args.price,
      image: imageUrl,
      category: args.category,
      rating: args.rating,
      isVeg: args.isVeg,
      isHot: args.isHot,
      badge: args.badge,
      addons: args.addons,
      discount: args.discount,
      isOutOfStock: args.isOutOfStock,
      isBestSeller: args.isBestSeller,
      isFeatured: args.isFeatured,
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    _id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    category: v.optional(v.string()),
    rating: v.optional(v.number()),
    isVeg: v.optional(v.boolean()),
    isHot: v.optional(v.boolean()),
    badge: v.optional(v.string()),
    addons: v.optional(v.array(v.object({ name: v.string(), price: v.number() }))),
    discount: v.optional(v.number()),
    isOutOfStock: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { _id, storageId, ...updates } = args;
    
    if (storageId) {
      updates.image = (await ctx.storage.getUrl(storageId)) || updates.image;
    }

    await ctx.db.patch(_id, updates);
  },
});

export const deleteMenuItem = mutation({
  args: { _id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
  },
});
