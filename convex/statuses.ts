import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const postStatus = mutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
    userAvatar: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image")),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const expiresAt = createdAt + (12 * 60 * 60 * 1000); // 12 hours

    return await ctx.db.insert("statuses", {
      ...args,
      createdAt,
      expiresAt,
    });
  },
});

export const getActiveStatuses = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("statuses")
      .withIndex("by_expiresAt", (q) => q.gt("expiresAt", now))
      .order("desc")
      .take(50);
  },
});

export const deleteExpiredStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("statuses")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .take(100);

    for (const status of expired) {
      await ctx.db.delete(status._id);
    }
  },
});
