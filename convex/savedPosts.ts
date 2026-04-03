import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";

export const getSavedPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes ver los guardados de otro usuario.");
    }
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
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes realizar esta operación para otro usuario.");
    }
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
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes guardar posts de otro usuario.");
    }
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
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes desguardar posts de otro usuario.");
    }
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
