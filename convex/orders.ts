import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper: format a relative time string from a timestamp.
 */
function formatTimeAgo(creationTime: number): string {
  const now = Date.now();
  const diffMs = now - creationTime;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

/**
 * Helper: format an order display ID from the Convex _id.
 */
function formatOrderId(id: string): string {
  // Use the last 6 chars of the Convex _id for a short display ID
  const shortId = id.slice(-6).toUpperCase();
  return `#ORD-${shortId}`;
}

/**
 * Helper: build a human-readable items summary string.
 */
function formatItemsSummary(items: Array<{ name: string; quantity: number }>): string {
  return items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
}

export const getOrders = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allOrders = await ctx.db.query("orders").order("desc").collect();

    // Enrich orders with computed display fields
    const enriched = allOrders.map((o) => ({
      ...o,
      displayId: formatOrderId(o._id),
      timeAgo: formatTimeAgo(o._creationTime),
      itemsSummary: formatItemsSummary(o.items),
      displayPrice: `₹${o.totalPrice.toFixed(2)}`,
    }));

    // Stats calculation — "today" based on UTC day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const pendingOrders = enriched.filter(
      (o) => o.status === "Pending" || o.status === "Preparing"
    ).length;

    const deliveredToday = enriched.filter(
      (o) => o.status === "Delivered" && o._creationTime >= todayMs
    ).length;

    const totalRev = enriched
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const stats = {
      totalRevenue: `₹${totalRev.toFixed(0)}`,
      pendingOrders,
      deliveredToday,
    };

    let filtered = enriched;
    if (args.search) {
      const lower = args.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.displayId.toLowerCase().includes(lower) ||
          o.customer.name.toLowerCase().includes(lower)
      );
    }

    return {
      orders: filtered,
      stats,
      total: enriched.length,
    };
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error(`Order ${args.orderId} not found`);
    }
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

export const createOrder = mutation({
  args: {
    items: v.array(
      v.object({
        menuItemId: v.string(),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        addons: v.optional(v.array(v.any())),
        instructions: v.optional(v.array(v.string())),
      })
    ),
    totalPrice: v.number(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      customer: {
        name: args.userId ? `User ${args.userId.substring(0, 4)}` : "Guest User",
        avatar: "https://ui-avatars.com/api/?name=Guest+User",
      },
      items: args.items,
      status: "Pending",
      totalPrice: args.totalPrice,
    });

    return orderId;
  },
});
