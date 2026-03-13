import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value ?? null;
  },
});

export const getAllSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("adminSettings").collect();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  },
});

export const setSetting = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("adminSettings", {
        key: args.key,
        value: args.value,
      });
    }
  },
});
