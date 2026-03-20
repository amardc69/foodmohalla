import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  menuItems: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
    rating: v.number(),
    isVeg: v.boolean(),
    isSizeBased: v.optional(v.boolean()),
    isHot: v.optional(v.boolean()),
    badge: v.optional(v.string()),
    sizes: v.optional(v.array(v.object({ name: v.string(), price: v.number() }))),
    addons: v.optional(v.any()), // modified to support sizePrices inside the array objects

    discount: v.optional(v.number()), // discount percentage or flat value
    isOutOfStock: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    calories: v.optional(v.number()),
    instructions: v.optional(v.array(v.string())),
  }).index("by_menu_item_id", ["id"]).index("by_category", ["category"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    image: v.string(),
    icon: v.string(),
  }).index("by_slug", ["slug"]),

  offers: defineTable({
    code: v.string(),
    description: v.string(),
    discountType: v.string(), // "percentage" | "flat" | "bogo" | "free_item" | "combo" | "cashback"
    discountValue: v.number(), // percentage or flat amount (0 for types that don't use it)
    minOrderValue: v.optional(v.number()),
    maxDiscount: v.optional(v.number()), // cap for percentage discounts
    validFrom: v.optional(v.number()), // start timestamp
    validUntil: v.optional(v.number()), // end timestamp
    usageLimitPerUser: v.optional(v.number()), // per-user cap
    totalUsageLimit: v.optional(v.number()), // global cap (e.g., "first 100 users")
    timesUsed: v.optional(v.number()), // current total usage counter
    isActive: v.boolean(),
    // BOGO-specific
    bogoCategory: v.optional(v.string()), // category slug for BOGO
    bogoItemId: v.optional(v.string()), // specific item ID for BOGO (optional)
    bogoBuyQty: v.optional(v.number()), // buy X
    bogoGetQty: v.optional(v.number()), // get Y free
    // Free Item-specific
    freeItemId: v.optional(v.string()), // the menu item given free
    freeItemName: v.optional(v.string()), // display name
    // Combo-specific
    comboItemIds: v.optional(v.array(v.string())), // required item IDs
    // Cashback-specific
    cashbackAmount: v.optional(v.number()), // flat cashback credited after delivery
  }).index("by_code", ["code"]),

  couponUsages: defineTable({
    userId: v.string(),
    offerCode: v.string(),
    orderId: v.id("orders"),
    usedAt: v.number(),
  }).index("by_user_and_code", ["userId", "offerCode"]),

  orders: defineTable({
    customer: v.object({
      name: v.string(),
      avatar: v.string(),
    }),
    items: v.array(
      v.object({
        menuItemId: v.string(),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        selectedSize: v.optional(v.string()),
        addons: v.optional(v.array(v.any())),
        instructions: v.optional(v.array(v.string())),
      })
    ),
    status: v.string(), // "Pending", "Preparing", "Out for Delivery", "Delivered", "Rejected"
    totalPrice: v.number(),
    paymentMethod: v.optional(v.string()), // "cod", "upi"
    appliedCoupon: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    deliveryAddress: v.optional(v.string()),
    deliveryLat: v.optional(v.number()),
    deliveryLng: v.optional(v.number()),
    deliveryFlat: v.optional(v.string()),
    deliveryLandmark: v.optional(v.string()),
    customerPhone: v.optional(v.string()), // added for whatsapp sync
    rejectionReason: v.optional(v.string()),
    userId: v.optional(v.string()),
    adminTime: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    orderType: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  addresses: defineTable({
    id: v.string(),
    userId: v.string(),
    label: v.string(),
    icon: v.string(),
    address: v.string(),
    deliveryTime: v.string(),
    isSelected: v.boolean(),
    flat: v.optional(v.string()),
    landmark: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  carts: defineTable({
    userId: v.string(), // Use sessionId for guests or userId for logged in
    menuItemId: v.string(),
    quantity: v.number(),
    selectedSize: v.optional(v.string()),
    addons: v.optional(v.array(v.any())),
    instructions: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  favourites: defineTable({
    userId: v.string(),
    menuItemId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_item", ["userId", "menuItemId"]),

  users: defineTable({
    name: v.string(),
    username: v.string(),
    password: v.string(), // hashed in production, plain text for demo
    phone: v.string(),
    role: v.string(), // "admin" | "customer"
    avatar: v.optional(v.string()),
    walletBalance: v.optional(v.number()), // cashback credits
  }).index("by_username", ["username"]),

  adminSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
