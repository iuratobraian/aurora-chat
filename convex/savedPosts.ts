import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSavedPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return saved.map(s => s.postId);
  },
});

export const hasSavedPost = query({
  args: { userId: v.string(), postId: v.string() },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();
    return !!saved;
  },
});

export const savePost = mutation({
  args: { userId: v.string(), postId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();
    
    if (existing) return existing._id;
    
    return await ctx.db.insert("savedPosts", {
      userId: args.userId,
      postId: args.postId,
      createdAt: Date.now(),
    });
  },
});

export const unsavePost = mutation({
  args: { userId: v.string(), postId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();
    
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
