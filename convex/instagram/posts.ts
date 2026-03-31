// @ts-nocheck
import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";

export const getPostsToPublish = query({
  args: {
    windowStart: v.number(),
    windowEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("instagram_scheduled_posts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    return posts.filter(
      (p) => p.scheduledFor >= args.windowStart && p.scheduledFor <= args.windowEnd
    );
  },
});

export const getPostById = query({
  args: { postId: v.id("instagram_scheduled_posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

export const updateAISuggestions = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    suggestions: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      aiEnhanced: true,
      aiSuggestions: args.suggestions,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getScheduledPosts = query({
  args: {
    userId: v.string(),
    accountId: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let postsQuery = ctx.db
      .query("instagram_scheduled_posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    const allPosts = await postsQuery.collect();

    let filtered = allPosts;

    if (args.accountId) {
      filtered = filtered.filter(p => p.accountId === args.accountId);
    }

    if (args.status) {
      filtered = filtered.filter(p => p.status === args.status);
    }

    filtered.sort((a, b) => b.scheduledFor - a.scheduledFor);

    return filtered.slice(0, args.limit || 50);
  },
});

export const getUpcomingPosts = query({
  args: {
    userId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const now = Date.now();
    const future = now + (days * 24 * 60 * 60 * 1000);

    const posts = await ctx.db
      .query("instagram_scheduled_posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return posts
      .filter(p => p.scheduledFor >= now && p.scheduledFor <= future && p.status === "scheduled")
      .sort((a, b) => a.scheduledFor - b.scheduledFor);
  },
});

export const createScheduledPost = mutation({
  args: {
    userId: v.string(),
    accountId: v.string(),
    caption: v.string(),
    hashtags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    scheduledFor: v.number(),
    timezone: v.string(),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled")
    )),
    campaignId: v.optional(v.string()),
    repeatEnabled: v.boolean(),
    repeatInterval: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const postStatus = args.status || (args.scheduledFor <= now ? "scheduled" : "draft");

    const postId = await ctx.db.insert("instagram_scheduled_posts", {
      userId: args.userId,
      accountId: args.accountId,
      caption: args.caption,
      hashtags: args.hashtags || [],
      imageUrl: args.imageUrl || "",
      videoUrl: args.videoUrl || "",
      scheduledFor: args.scheduledFor,
      timezone: args.timezone,
      status: postStatus,
      aiEnhanced: false,
      repeatEnabled: args.repeatEnabled,
      repeatInterval: args.repeatInterval,
      campaignId: args.campaignId || "",
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

export const updateScheduledPost = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    userId: v.string(),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    timezone: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post || post.userId !== args.userId) {
      throw new Error("Post not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.caption !== undefined) updates.caption = args.caption;
    if (args.hashtags !== undefined) updates.hashtags = args.hashtags;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.videoUrl !== undefined) updates.videoUrl = args.videoUrl;
    if (args.scheduledFor !== undefined) updates.scheduledFor = args.scheduledFor;
    if (args.timezone !== undefined) updates.timezone = args.timezone;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.postId, updates);

    return { success: true };
  },
});

export const deleteScheduledPost = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post || post.userId !== args.userId) {
      throw new Error("Post not found or unauthorized");
    }

    if (post.status === "published") {
      throw new Error("Cannot delete a published post");
    }

    await ctx.db.delete(args.postId);

    return { success: true };
  },
});

export const publishPostNow = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post || post.userId !== args.userId) {
      throw new Error("Post not found or unauthorized");
    }

    if (post.status === "published") {
      throw new Error("Post already published");
    }

    const account = await ctx.db
      .query("instagram_accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!account || !account.isConnected) {
      throw new Error("Instagram account not connected");
    }

    await ctx.db.patch(args.postId, {
      status: "publishing",
      updatedAt: Date.now(),
    });

    return { 
      success: true, 
      postId: args.postId,
      accountId: account.instagramId,
      imageUrl: post.imageUrl,
      caption: post.caption,
    };
  },
});

export const markPostPublished = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    instagramPostId: v.string(),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: "published",
      instagramPostId: args.instagramPostId,
      publishedAt: args.publishedAt || Date.now(),
      updatedAt: Date.now(),
    });

    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        scheduledFor: post.scheduledFor,
      });
    }

    return { success: true };
  },
});

export const markPostFailed = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const duplicatePost = mutation({
  args: {
    postId: v.id("instagram_scheduled_posts"),
    userId: v.string(),
    newScheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.postId);

    if (!original || original.userId !== args.userId) {
      throw new Error("Post not found or unauthorized");
    }

    const now = Date.now();

    const newPostId = await ctx.db.insert("instagram_scheduled_posts", {
      userId: args.userId,
      accountId: original.accountId,
      caption: original.caption,
      hashtags: original.hashtags,
      imageUrl: original.imageUrl,
      videoUrl: original.videoUrl,
      scheduledFor: args.newScheduledFor,
      timezone: original.timezone,
      status: "scheduled",
      aiEnhanced: original.aiEnhanced,
      aiSuggestions: original.aiSuggestions,
      campaignId: original.campaignId,
      repeatEnabled: false,
      repeatInterval: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return newPostId;
  },
});

export const getPostsByDate = query({
  args: {
    userId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("instagram_scheduled_posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return posts
      .filter(p => p.scheduledFor >= args.startDate && p.scheduledFor <= args.endDate)
      .sort((a, b) => a.scheduledFor - b.scheduledFor);
  },
});

export const getPostStats = query({
  args: {
    userId: v.string(),
    accountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("instagram_scheduled_posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let filtered = posts;

    if (args.accountId) {
      filtered = filtered.filter(p => p.accountId === args.accountId);
    }

    const stats = {
      total: filtered.length,
      drafts: filtered.filter(p => p.status === "draft").length,
      scheduled: filtered.filter(p => p.status === "scheduled").length,
      published: filtered.filter(p => p.status === "published").length,
      failed: filtered.filter(p => p.status === "failed").length,
      totalLikes: filtered.reduce((sum, p) => sum + (p.likes || 0), 0),
      totalComments: filtered.reduce((sum, p) => sum + (p.comments || 0), 0),
      totalReach: filtered.reduce((sum, p) => sum + (p.reach || 0), 0),
      avgEngagement: filtered.filter(p => p.status === "published").length > 0
        ? filtered.filter(p => p.status === "published")
            .reduce((sum, p) => sum + ((p.likes || 0) + (p.comments || 0)), 0) /
            filtered.filter(p => p.status === "published").length
        : 0,
    };

    return stats;
  },
});
