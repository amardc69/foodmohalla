import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAddresses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("addresses").collect();
  },
});

export const selectAddress = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("addresses").collect();
    for (const address of all) {
      if (address.id === args.id) {
        await ctx.db.patch(address._id, { isSelected: true });
      } else if (address.isSelected) {
        await ctx.db.patch(address._id, { isSelected: false });
      }
    }
  },
});

export const addAddress = mutation({
  args: {
    label: v.string(),
    icon: v.string(),
    address: v.string(),
    deliveryTime: v.string(),
    isSelected: v.boolean(),
    flat: v.optional(v.string()),
    landmark: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // If it's selected, unselect others
    if (args.isSelected) {
      const all = await ctx.db.query("addresses").collect();
      for (const addr of all) {
        if (addr.isSelected) {
          await ctx.db.patch(addr._id, { isSelected: false });
        }
      }
    }
    const newId = await ctx.db.insert("addresses", {
      id: "addr_" + Date.now().toString(),
      label: args.label,
      icon: args.icon,
      address: args.address,
      deliveryTime: args.deliveryTime,
      isSelected: args.isSelected,
      flat: args.flat,
      landmark: args.landmark,
      lat: args.lat,
      lng: args.lng,
    });
    return newId;
  },
});
