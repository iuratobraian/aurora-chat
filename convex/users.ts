import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.toLowerCase()))
      .first();

    if (existingUsername) {
      throw new Error("El nombre de usuario ya existe");
    }

    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.username}`;

    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: args.username.toLowerCase(),
      name: args.name,
      avatar,
      password: args.password,
      createdAt: Date.now(),
    });

    return userId;
  },
});


export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];
    const users = await ctx.db
      .query("users")
      .take(10);
    
    return users.filter(u => 
      u.username.includes(args.query.toLowerCase()) || 
      u.name.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    privacyMode: v.optional(v.union(v.literal("everyone"), v.literal("requests"))),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});


