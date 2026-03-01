import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import bcrypt from "bcryptjs";

/**
 * Register a new user. Returns the user ID on success, or throws if username already taken.
 */
export const register = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    password: v.string(),
    phone: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      throw new Error("This username is already taken");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(args.password, salt);

    const userId = await ctx.db.insert("users", {
      name: args.name,
      username: args.username,
      password: hashedPassword,
      phone: args.phone,
      role: args.role || "customer",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(args.name)}&background=ec7f13&color=fff`,
    });

    return userId;
  },
});

/**
 * Look up a user by username and password for sign-in.
 * Returns the user object (minus password) or null.
 */
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      return null;
    }

    const passwordsMatch = bcrypt.compareSync(args.password, user.password);
    
    if (!passwordsMatch) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    };
  },
});

/**
 * Get user by username.
 */
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    };
  },
});

/**
 * Get current user by generic auth ID.
 */
export const currentUser = query({
  args: { authProviderId: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.authProviderId as Id<"users">);
      if (!user) return null;

      return {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      };
    } catch {
      return null;
    }
  },
});
