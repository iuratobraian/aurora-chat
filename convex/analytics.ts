import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserPerformance = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comentarios.length, 0);

    const signals = await ctx.db
      .query("signals")
      .withIndex("by_provider", (q) => q.eq("providerId", args.userId))
      .collect();

    const totalSignals = signals.length;
    const activeSignals = signals.filter(s => s.status === 'active').length;
    const hitSignals = signals.filter(s => s.status === 'hit').length;
    const winRate = totalSignals > 0 ? (hitSignals / totalSignals) * 100 : 0;

    const achievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalPosts,
      publishedPosts,
      totalLikes,
      totalComments,
      totalSignals,
      activeSignals,
      hitSignals,
      winRate: Math.round(winRate * 100) / 100,
      achievementsCount: achievements.length,
    };
  },
});

export const getCommunityStats = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const subscriptions = await ctx.db
      .query("communitySubscriptions")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    return {
      totalMembers: members.length,
      totalPosts: posts.length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + (s.currentPeriodEnd > Date.now() ? 1 : 0), 0),
      activeSubscriptions,
    };
  },
});

export const getSignalsPerformance = query({
  args: {
    providerId: v.string(),
    periodDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoff = args.periodDays 
      ? Date.now() - (args.periodDays * 24 * 60 * 60 * 1000)
      : Date.now() - (30 * 24 * 60 * 60 * 1000);

    const signals = await ctx.db
      .query("signals")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    const recentSignals = signals.filter(s => s.createdAt >= cutoff);
    
    const byStatus = {
      draft: recentSignals.filter(s => s.status === 'draft').length,
      scheduled: recentSignals.filter(s => s.status === 'scheduled').length,
      active: recentSignals.filter(s => s.status === 'active').length,
      hit: recentSignals.filter(s => s.status === 'hit').length,
      canceled: recentSignals.filter(s => s.status === 'canceled').length,
      expired: recentSignals.filter(s => s.status === 'expired').length,
    };

    const totalSubscribers = recentSignals.reduce((sum, s) => sum + s.totalSubscribersNotified, 0);
    const avgActed = recentSignals.length > 0 
      ? recentSignals.reduce((sum, s) => sum + s.subscribersActed, 0) / recentSignals.length 
      : 0;

    return {
      totalSignals: recentSignals.length,
      byStatus,
      totalSubscribersNotified: totalSubscribers,
      avgSubscriberActed: Math.round(avgActed * 100) / 100,
    };
  },
});

export const getPlatformStats = query({
  args: {},
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("profiles").collect();
    const allPosts = await ctx.db.query("posts").collect();
    const allCommunities = await ctx.db.query("communities").collect();
    const allSignals = await ctx.db.query("signals").collect();

    const activeUsers = allUsers.filter(u => u.status === 'active').length;
    const proUsers = allUsers.filter(u => u.esPro).length;
    const publishedPosts = allPosts.filter(p => p.status === 'published').length;
    const activeCommunities = allCommunities.filter(c => c.status === 'active').length;
    const activeSignals = allSignals.filter(s => s.status === 'active').length;

    return {
      totalUsers: allUsers.length,
      activeUsers,
      proUsers,
      totalPosts: allPosts.length,
      publishedPosts,
      totalCommunities: allCommunities.length,
      activeCommunities,
      totalSignals: allSignals.length,
      activeSignals,
    };
  },
});
