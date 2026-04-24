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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get friend IDs
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1Id", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();
    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2Id", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();
    
    const friendIds = new Set([...friends1.map(f => f.user2Id), ...friends2.map(f => f.user1Id), args.userId]);

    const allStatuses = await ctx.db
      .query("statuses")
      .withIndex("by_expiresAt", (q) => q.gt("expiresAt", now))
      .order("desc")
      .collect();

    return allStatuses.filter(s => friendIds.has(s.userId));
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
