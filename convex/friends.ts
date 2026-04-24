import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendFriendRequest = mutation({
  args: { fromId: v.id("users"), toId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("friends")
      .withIndex("by_users", (q) => q.eq("user1Id", args.fromId).eq("user2Id", args.toId))
      .first() || await ctx.db
      .query("friends")
      .withIndex("by_users", (q) => q.eq("user1Id", args.toId).eq("user2Id", args.fromId))
      .first();

    if (existing) return existing;

    return await ctx.db.insert("friends", {
      user1Id: args.fromId,
      user2Id: args.toId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const acceptFriendRequest = mutation({
  args: { friendId: v.id("friends") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.friendId, { status: "accepted" });
  },
});

export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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

    const friendIds = [...friends1.map(f => f.user2Id), ...friends2.map(f => f.user1Id)];
    
    const results = [];
    for (const id of friendIds) {
      const u = await ctx.db.get(id);
      if (u) results.push(u);
    }
    return results;
  },
});

export const getPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2Id", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});
