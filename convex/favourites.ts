import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add a menu item to the user's favourites
 */
export const addFavourite = mutation({
  args: {
    userId: v.string(),
    menuItemId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if it already exists
    const existing = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_item", (q) =>
        q.eq("userId", args.userId).eq("menuItemId", args.menuItemId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("favourites", {
      userId: args.userId,
      menuItemId: args.menuItemId,
    });
  },
});

/**
 * Remove a menu item from the user's favourites
 */
export const removeFavourite = mutation({
  args: {
    userId: v.string(),
    menuItemId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_item", (q) =>
        q.eq("userId", args.userId).eq("menuItemId", args.menuItemId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }

    return false;
  },
});

/**
 * Get a user's favourited menu items
 */
export const getUserFavourites = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const favourites = await ctx.db
      .query("favourites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch the actual menu items for these favourites
    const menuItems = await Promise.all(
      favourites.map(async (fav) => {
        const item = await ctx.db
          .query("menuItems")
          .withIndex("by_menu_item_id", (q) => q.eq("id", fav.menuItemId))
          .first();

        if (item) {
          return { ...item, favouriteId: fav._id };
        }
        return null;
      })
    );

    // Filter out any nulls if an item was deleted
    return menuItems.filter((i) => i !== null);
  },
});
