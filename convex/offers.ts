import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getOptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("offers").collect();
  },
});

export const getActiveOffers = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("offers").collect();
    const now = Date.now();
    return all.filter((o) => {
      if (!o.isActive) return false;
      if (o.validFrom && now < o.validFrom) return false;
      if (o.validUntil && now > o.validUntil) return false;
      if (o.totalUsageLimit && (o.timesUsed || 0) >= o.totalUsageLimit) return false;
      return true;
    });
  },
});

export const validateOffer = query({
  args: {
    code: v.string(),
    cartTotal: v.number(),
    userId: v.optional(v.string()),
    // Cart items for BOGO / combo / free-item validation
    cartItems: v.optional(
      v.array(
        v.object({
          menuItemId: v.string(),
          name: v.string(),
          quantity: v.number(),
          price: v.number(),
          category: v.optional(v.string()),
        })
      )
    ),
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
      return { valid: false, error: "This offer is no longer active" };
    }

    const now = Date.now();
    if (offer.validFrom && now < offer.validFrom) {
      return { valid: false, error: "This offer is not yet active" };
    }
    if (offer.validUntil && now > offer.validUntil) {
      return { valid: false, error: "This offer has expired" };
    }

    // Global usage limit
    if (offer.totalUsageLimit && (offer.timesUsed || 0) >= offer.totalUsageLimit) {
      return { valid: false, error: "This offer has reached its usage limit" };
    }

    // Per-user usage limit
    if (args.userId && offer.usageLimitPerUser) {
      const usages = await ctx.db
        .query("couponUsages")
        .withIndex("by_user_and_code", (q) =>
          q.eq("userId", args.userId!).eq("offerCode", offer.code)
        )
        .collect();
      if (usages.length >= offer.usageLimitPerUser) {
        return { valid: false, error: "You have already used this offer the maximum number of times" };
      }
    }

    // Min order value
    if (offer.minOrderValue && args.cartTotal < offer.minOrderValue) {
      return {
        valid: false,
        error: `Minimum order value is ₹${offer.minOrderValue}`,
      };
    }

    // Type-specific validation
    const type = offer.discountType;
    const cartItems = args.cartItems || [];

    if (type === "bogo") {
      // Check qualifying items exist in cart
      const qualifying = cartItems.filter((item) => {
        if (offer.bogoItemId) return item.menuItemId === offer.bogoItemId;
        if (offer.bogoCategory) return item.category === offer.bogoCategory;
        return false;
      });
      const totalQty = qualifying.reduce((sum, i) => sum + i.quantity, 0);
      const buyQty = offer.bogoBuyQty || 1;
      if (totalQty < buyQty) {
        return {
          valid: false,
          error: `Add at least ${buyQty} qualifying item(s) to use this BOGO offer`,
        };
      }
    }

    if (type === "combo") {
      // Check all required combo items are in cart
      const comboIds = offer.comboItemIds || [];
      const cartItemIds = cartItems.map((i) => i.menuItemId);
      const missing = comboIds.filter((id) => !cartItemIds.includes(id));
      if (missing.length > 0) {
        return {
          valid: false,
          error: `Add all combo items to your cart to use this offer`,
        };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;

    if (type === "percentage") {
      discountAmount = (args.cartTotal * offer.discountValue) / 100;
      if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
        discountAmount = offer.maxDiscount;
      }
    } else if (type === "flat") {
      discountAmount = offer.discountValue;
      if (discountAmount > args.cartTotal) {
        discountAmount = args.cartTotal;
      }
    } else if (type === "bogo") {
      // Discount = price of the cheapest qualifying item × getQty
      const qualifying = cartItems.filter((item) => {
        if (offer.bogoItemId) return item.menuItemId === offer.bogoItemId;
        if (offer.bogoCategory) return item.category === offer.bogoCategory;
        return false;
      });
      if (qualifying.length > 0) {
        const cheapest = Math.min(...qualifying.map((i) => i.price));
        discountAmount = cheapest * (offer.bogoGetQty || 1);
      }
    } else if (type === "free_item") {
      // Discount = price of the free item (looked up from menu)
      if (offer.freeItemId) {
        const menuItem = await ctx.db
          .query("menuItems")
          .withIndex("by_menu_item_id", (q) => q.eq("id", offer.freeItemId!))
          .first();
        if (menuItem) {
          discountAmount = menuItem.price;
        }
      }
    } else if (type === "combo") {
      discountAmount = offer.discountValue;
    } else if (type === "cashback") {
      // No immediate discount; cashback is credited after delivery
      discountAmount = 0;
    }

    return {
      valid: true,
      offer,
      discountAmount: Math.round(discountAmount * 100) / 100,
      isCashback: type === "cashback",
      cashbackAmount: type === "cashback" ? offer.cashbackAmount || 0 : 0,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const addOffer = mutation({
  args: {
    code: v.string(),
    description: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
    minOrderValue: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    usageLimitPerUser: v.optional(v.number()),
    totalUsageLimit: v.optional(v.number()),
    isActive: v.boolean(),
    // BOGO
    bogoCategory: v.optional(v.string()),
    bogoItemId: v.optional(v.string()),
    bogoBuyQty: v.optional(v.number()),
    bogoGetQty: v.optional(v.number()),
    // Free Item
    freeItemId: v.optional(v.string()),
    freeItemName: v.optional(v.string()),
    // Combo
    comboItemIds: v.optional(v.array(v.string())),
    // Cashback
    cashbackAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("offers", {
      ...args,
      code: args.code.toUpperCase().replace(/\s+/g, ""),
      timesUsed: 0,
    });
  },
});

export const updateOffer = mutation({
  args: {
    id: v.id("offers"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    discountType: v.optional(v.string()),
    discountValue: v.optional(v.number()),
    minOrderValue: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    usageLimitPerUser: v.optional(v.number()),
    totalUsageLimit: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    bogoCategory: v.optional(v.string()),
    bogoItemId: v.optional(v.string()),
    bogoBuyQty: v.optional(v.number()),
    bogoGetQty: v.optional(v.number()),
    freeItemId: v.optional(v.string()),
    freeItemName: v.optional(v.string()),
    comboItemIds: v.optional(v.array(v.string())),
    cashbackAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    if (updates.code) {
      updates.code = updates.code.toUpperCase().replace(/\s+/g, "");
    }
    await ctx.db.patch(id, updates);
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

export const recordCouponUsage = mutation({
  args: {
    userId: v.string(),
    offerCode: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Insert usage record
    await ctx.db.insert("couponUsages", {
      userId: args.userId,
      offerCode: args.offerCode,
      orderId: args.orderId,
      usedAt: Date.now(),
    });

    // Increment timesUsed on the offer
    const offer = await ctx.db
      .query("offers")
      .withIndex("by_code", (q) => q.eq("code", args.offerCode))
      .first();
    if (offer) {
      await ctx.db.patch(offer._id, {
        timesUsed: (offer.timesUsed || 0) + 1,
      });
    }
  },
});

export const creditCashback = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // userId here is the auth provider ID — find user by it
    const user = await ctx.db.get(args.userId as any);
    if (user && "walletBalance" in user) {
      await ctx.db.patch((user as any)._id, {
        walletBalance: ((user as any).walletBalance || 0) + args.amount,
      });
    }
  },
});
