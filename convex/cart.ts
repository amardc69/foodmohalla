import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCart = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
      
    // Manually join with menu items to fetch rich data (name, price, image)
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        const menuItem = await ctx.db
          .query("menuItems")
          .withIndex("by_menu_item_id", (q) => q.eq("id", cartItem.menuItemId))
          .first();
          
        return {
          ...cartItem,
          menuItem,
        };
      })
    );
    
    return itemsWithDetails.filter(i => i.menuItem !== null);
  },
});

export const getCartTotal = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
      
    let total = 0;
    for (const cartItem of cartItems) {
      const menuItem = await ctx.db
        .query("menuItems")
        .withIndex("by_menu_item_id", (q) => q.eq("id", cartItem.menuItemId))
        .first();
      
      if (menuItem) {
        let itemTotal = menuItem.price;
        if (cartItem.addons) {
          cartItem.addons.forEach((addon: any) => {
            itemTotal += addon.price || 0;
          });
        }
        total += itemTotal * cartItem.quantity;
      }
    }
    return total;
  },
});


export const addToCart = mutation({
  args: {
    userId: v.string(),
    menuItemId: v.string(),
    quantity: v.number(),
    addons: v.optional(v.array(v.any())),
    instructions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if item already exists in cart with same addons
    const existingItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("menuItemId"), args.menuItemId))
      .collect();
      
    // Simple deep equality check for addons implies stringify
    const matchingItem = existingItems.find(
      (i) => JSON.stringify(i.addons || []) === JSON.stringify(args.addons || [])
    );
    
    if (matchingItem) {
      // Update quantity
      await ctx.db.patch(matchingItem._id, {
        quantity: matchingItem.quantity + args.quantity,
      });
    } else {
      // Create new cart row
      await ctx.db.insert("carts", {
        userId: args.userId,
        menuItemId: args.menuItemId,
        quantity: args.quantity,
        addons: args.addons,
        instructions: args.instructions,
      });
    }
  },
});

export const updateCartItem = mutation({
  args: { cartItemId: v.id("carts"), quantity: v.number() },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    }
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("carts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
  },
});

export const clearCart = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
      
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
