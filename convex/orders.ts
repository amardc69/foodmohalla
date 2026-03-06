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
    statusFilter: v.optional(v.string()),
    statsPeriod: v.optional(v.string()), // "today" | "week" | "all"
  },
  handler: async (ctx, args) => {
    let allOrders;

    if (args.statusFilter && args.statusFilter !== "All") {
      allOrders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.statusFilter!))
        .order("desc")
        .collect();
    } else {
      allOrders = await ctx.db.query("orders").order("desc").collect();
    }

    // Enrich orders with computed display fields + resolve real user names
    const enriched = await Promise.all(
      allOrders.map(async (o) => {
        let resolvedName = o.customer.name;
        let resolvedUsername = "";
        let resolvedAvatar = o.customer.avatar;

        if (o.userId) {
          try {
            const user = await ctx.db.get(o.userId as any);
            if (user && "name" in user) {
              resolvedName = (user as any).name;
              resolvedUsername = (user as any).username || "";
              resolvedAvatar =
                (user as any).avatar || resolvedAvatar;
            }
          } catch {
            // fallback to stored customer info
          }
        }

        return {
          ...o,
          customer: {
            name: resolvedName,
            avatar: resolvedAvatar,
          },
          customerUsername: resolvedUsername,
          displayId: formatOrderId(o._id),
          timeAgo: formatTimeAgo(o._creationTime),
          itemsSummary: formatItemsSummary(o.items),
          displayPrice: `₹${o.totalPrice.toFixed(2)}`,
        };
      })
    );

    // Stats calculation with period filter
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    const weekMs = weekStart.getTime();

    const allForStats = await ctx.db.query("orders").collect();
    const period = args.statsPeriod || "today";

    let periodStart = 0; // "all" = no filter
    if (period === "today") periodStart = todayMs;
    else if (period === "week") periodStart = weekMs;

    const periodOrders = periodStart > 0
      ? allForStats.filter((o) => o._creationTime >= periodStart)
      : allForStats;

    const pendingOrders = periodOrders.filter(
      (o) => o.status === "Pending" || o.status === "Preparing"
    ).length;

    const deliveredCount = periodOrders.filter(
      (o) => o.status === "Delivered"
    ).length;

    const totalRev = periodOrders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const stats = {
      totalRevenue: `₹${totalRev.toFixed(0)}`,
      pendingOrders,
      deliveredToday: deliveredCount,
    };

    let filtered = enriched;
    if (args.search) {
      const lower = args.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.displayId.toLowerCase().includes(lower) ||
          o.customer.name.toLowerCase().includes(lower) ||
          o.customerUsername.toLowerCase().includes(lower)
      );
    }

    return {
      orders: filtered,
      stats,
      total: allForStats.length,
    };
  },
});

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    let resolvedName = order.customer.name;
    let resolvedUsername = "";
    let resolvedAvatar = order.customer.avatar;

    if (order.userId) {
      try {
        const user = await ctx.db.get(order.userId as any);
        if (user && "name" in user) {
          resolvedName = (user as any).name;
          resolvedUsername = (user as any).username || "";
          resolvedAvatar = (user as any).avatar || resolvedAvatar;
        }
      } catch { /* fallback */ }
    }

    return {
      ...order,
      customer: {
        name: resolvedName,
        avatar: resolvedAvatar,
      },
      customerUsername: resolvedUsername,
      displayId: formatOrderId(order._id),
      timeAgo: formatTimeAgo(order._creationTime),
      itemsSummary: formatItemsSummary(order.items),
      displayPrice: `₹${order.totalPrice.toFixed(2)}`,
    };
  },
});

const STATUS_ORDER: Record<string, number> = {
  Pending: 0,
  Preparing: 1,
  "Out for Delivery": 2,
  Delivered: 3,
};

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

    // Reject is always allowed
    if (args.status === "Rejected") {
      await ctx.db.patch(args.orderId, { status: args.status });
      return;
    }

    // Enforce forward-only status transitions
    const currentRank = STATUS_ORDER[order.status] ?? -1;
    const newRank = STATUS_ORDER[args.status] ?? -1;
    if (newRank <= currentRank) {
      throw new Error(
        `Cannot move status backward from '${order.status}' to '${args.status}'`
      );
    }

    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

export const acceptOrder = mutation({
  args: { 
    orderId: v.id("orders"),
    adminTime: v.number()
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "Pending") throw new Error("Order is not pending");

    // Require delivery address (landmark is optional)
    if (!order.deliveryAddress || order.deliveryAddress.trim() === "") {
      throw new Error("Cannot accept order without a delivery address");
    }

    await ctx.db.patch(args.orderId, { 
      status: "Preparing",
      adminTime: args.adminTime,
      acceptedAt: Date.now()
    });
  },
});

export const rejectOrder = mutation({
  args: {
    orderId: v.id("orders"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "Pending") throw new Error("Order is not pending");
    await ctx.db.patch(args.orderId, {
      status: "Rejected",
      rejectionReason: args.reason,
    });
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
    paymentMethod: v.optional(v.string()),
    appliedCoupon: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    deliveryAddress: v.optional(v.string()),
    deliveryLat: v.optional(v.number()),
    deliveryLng: v.optional(v.number()),
    deliveryFlat: v.optional(v.string()),
    deliveryLandmark: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get customer name from the users table
    let customerName = "Guest User";
    let customerAvatar = "https://ui-avatars.com/api/?name=Guest+User";

    if (args.userId) {
      try {
        const user = await ctx.db.get(args.userId as any);
        if (user && "name" in user) {
          customerName = (user as any).name;
          customerAvatar =
            (user as any).avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=ec7f13&color=fff`;
        }
      } catch {
        // fallback to default
      }
    }

    const orderId = await ctx.db.insert("orders", {
      customer: {
        name: customerName,
        avatar: customerAvatar,
      },
      items: args.items,
      status: "Pending",
      totalPrice: args.totalPrice,
      paymentMethod: args.paymentMethod,
      appliedCoupon: args.appliedCoupon,
      discountAmount: args.discountAmount,
      deliveryAddress: args.deliveryAddress,
      deliveryLat: args.deliveryLat,
      deliveryLng: args.deliveryLng,
      deliveryFlat: args.deliveryFlat,
      deliveryLandmark: args.deliveryLandmark,
      userId: args.userId,
    });

    return orderId;
  },
});

export const getUserOrders = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return orders.map((o) => ({
      ...o,
      displayId: formatOrderId(o._id),
      timeAgo: formatTimeAgo(o._creationTime),
      itemsSummary: formatItemsSummary(o.items),
      displayPrice: `₹${o.totalPrice.toFixed(2)}`,
    }));
  },
});
