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
