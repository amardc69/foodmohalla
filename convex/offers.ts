import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("offers").collect();
  },
});

export const addOffer = mutation({
  args: {
    code: v.string(),
    description: v.string(),
    discountType: v.string(), // "percentage" or "flat"
    discountValue: v.number(),
    minOrderValue: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    validUntil: v.optional(v.number()), // timestamp
    usageLimitPerUser: v.optional(v.number()), // how many times a single user can use it
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const newOfferId = await ctx.db.insert("offers", {
      code: args.code,
      description: args.description,
      discountType: args.discountType,
      discountValue: args.discountValue,
      minOrderValue: args.minOrderValue,
      maxDiscount: args.maxDiscount,
      validUntil: args.validUntil,
      usageLimitPerUser: args.usageLimitPerUser,
      isActive: args.isActive,
    });
    return newOfferId;
  },
});

export const toggleOfferStatus = mutation({
  args: { id: v.id("offers"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const deleteOffer = mutation({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const validateOffer = query({
  args: {
    code: v.string(),
    cartTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.db
      .query("offers")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!offer) {
      return { valid: false, error: "Invalid coupon code" };
    }

    if (!offer.isActive) {
      return { valid: false, error: "Coupon code is expired or inactive" };
    }

    if (offer.validUntil && offer.validUntil < Date.now()) {
      return { valid: false, error: "Coupon code is expired" };
    }

    if (offer.minOrderValue && args.cartTotal < offer.minOrderValue) {
      return { valid: false, error: `Minimum order value for this coupon is ₹${offer.minOrderValue}` };
    }

    return { valid: true, offer };
  },
});
