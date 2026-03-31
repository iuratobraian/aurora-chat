// @ts-nocheck
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getByAccountAndDate = query({
  args: {
    accountId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("instagram_analytics")
      .withIndex("by_account_date", (q) => 
        q.eq("accountId", args.accountId)
      )
      .collect();
    
    return analytics.find(a => a.date === args.date);
  },
});

export const createAnalyticsRecord = mutation({
  args: {
    accountId: v.string(),
    date: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),
    followersCount: v.number(),
    followersDelta: v.number(),
    postsCount: v.number(),
    storiesCount: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalSaves: v.number(),
    totalShares: v.number(),
    avgLikesPerPost: v.number(),
    avgCommentsPerPost: v.number(),
    engagementRate: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("instagram_analytics", {
      accountId: args.accountId,
      date: args.date,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      followersCount: args.followersCount,
      followersDelta: args.followersDelta,
      postsCount: args.postsCount,
      storiesCount: args.storiesCount,
      totalLikes: args.totalLikes,
      totalComments: args.totalComments,
      totalSaves: args.totalSaves,
      totalShares: args.totalShares,
      avgLikesPerPost: args.avgLikesPerPost,
      avgCommentsPerPost: args.avgCommentsPerPost,
      engagementRate: args.engagementRate,
      topPosts: [],
      createdAt: Date.now(),
    });
    
    return id;
  },
});

export const updateAnalyticsRecord = mutation({
  args: {
    analyticsId: v.id("instagram_analytics"),
    followersCount: v.optional(v.number()),
    followersDelta: v.optional(v.number()),
    postsCount: v.optional(v.number()),
    totalLikes: v.optional(v.number()),
    totalComments: v.optional(v.number()),
    avgLikesPerPost: v.optional(v.number()),
    avgCommentsPerPost: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    
    if (args.followersCount !== undefined) updates.followersCount = args.followersCount;
    if (args.followersDelta !== undefined) updates.followersDelta = args.followersDelta;
    if (args.postsCount !== undefined) updates.postsCount = args.postsCount;
    if (args.totalLikes !== undefined) updates.totalLikes = args.totalLikes;
    if (args.totalComments !== undefined) updates.totalComments = args.totalComments;
    if (args.avgLikesPerPost !== undefined) updates.avgLikesPerPost = args.avgLikesPerPost;
    if (args.avgCommentsPerPost !== undefined) updates.avgCommentsPerPost = args.avgCommentsPerPost;
    if (args.engagementRate !== undefined) updates.engagementRate = args.engagementRate;
    
    await ctx.db.patch(args.analyticsId, updates);
    
    return { success: true };
  },
});
