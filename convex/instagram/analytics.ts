// @ts-nocheck
import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const getAccountAnalytics = query({
  args: {
    accountId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const analytics = await ctx.db
      .query("instagram_analytics")
      .withIndex("by_account_date", (q) => 
        q.eq("accountId", args.accountId)
      )
      .collect();
    
    const filtered = analytics
      .filter(a => a.date >= startDateStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const totals = filtered.reduce((acc, day) => ({
      followersDelta: acc.followersDelta + day.followersDelta,
      totalPosts: acc.totalPosts + day.postsCount,
      totalLikes: acc.totalLikes + day.totalLikes,
      totalComments: acc.totalComments + day.totalComments,
      totalSaves: acc.totalSaves + day.totalSaves,
      totalShares: acc.totalShares + day.totalShares,
    }), {
      followersDelta: 0,
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalSaves: 0,
      totalShares: 0,
    });
    
    const avgEngagement = totals.totalPosts > 0
      ? ((totals.totalLikes + totals.totalComments) / totals.totalPosts)
      : 0;
    
    return {
      daily: filtered,
      totals: {
        ...totals,
        avgEngagementRate: avgEngagement,
      },
    };
  },
});

export const getWeeklyReport = query({
  args: { accountId: v.string() },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("instagram_analytics")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const last7Days = analytics
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
    
    const previous7Days = analytics
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(7, 14);
    
    const currentTotals = last7Days.reduce((acc, day) => ({
      followers: day.followersCount,
      followersDelta: acc.followersDelta + day.followersDelta,
      likes: acc.likes + day.totalLikes,
      comments: acc.comments + day.totalComments,
      saves: acc.saves + day.totalSaves,
      shares: acc.shares + day.totalShares,
      posts: acc.posts + day.postsCount,
    }), { followers: 0, followersDelta: 0, likes: 0, comments: 0, saves: 0, shares: 0, posts: 0 });
    
    const previousTotals = previous7Days.reduce((acc, day) => ({
      followersDelta: acc.followersDelta + day.followersDelta,
      likes: acc.likes + day.totalLikes,
      comments: acc.comments + day.totalComments,
      saves: acc.saves + day.totalSaves,
      shares: acc.shares + day.totalShares,
      posts: acc.posts + day.postsCount,
    }), { followersDelta: 0, likes: 0, comments: 0, saves: 0, shares: 0, posts: 0 });
    
    const percentChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    return {
      period: '7 days',
      current: currentTotals,
      previous: previousTotals,
      changes: {
        followersDelta: percentChange(currentTotals.followersDelta, previousTotals.followersDelta),
        likes: percentChange(currentTotals.likes, previousTotals.likes),
        comments: percentChange(currentTotals.comments, previousTotals.comments),
        engagement: percentChange(
          currentTotals.likes + currentTotals.comments,
          previousTotals.likes + previousTotals.comments
        ),
      },
      topPosts: last7Days
        .flatMap(day => day.topPosts || [])
        .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
        .slice(0, 5),
    };
  },
});

export const syncAnalytics = action({
  args: { accountId: v.id("instagram_accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(
      api["instagram/accounts"].getById,
      { accountId: args.accountId }
    );
    
    if (!account || !account.isConnected) {
      throw new Error("Account not connected");
    }
    
    const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf8');
    const today = new Date().toISOString().split('T')[0];
    
    const metrics = ['followers_count', 'media_count'];
    
    const insightsUrl = new URL(`https://graph.facebook.com/v18.0/${account.instagramId}/insights`);
    insightsUrl.searchParams.set('access_token', accessToken);
    insightsUrl.searchParams.set('metric', metrics.join(','));
    insightsUrl.searchParams.set('period', 'day');
    
    const response = await fetch(insightsUrl.toString());
    const data = await response.json();
    
    const mediaUrl = new URL(`https://graph.facebook.com/v18.0/${account.instagramId}/media`);
    mediaUrl.searchParams.set('access_token', accessToken);
    mediaUrl.searchParams.set('fields', 'id,caption,like_count,comments_count,timestamp,permalink');
    mediaUrl.searchParams.set('limit', '20');
    
    const mediaResponse = await fetch(mediaUrl.toString());
    const mediaData = await mediaResponse.json();
    
    const posts = mediaData.data || [];
    
    const totalLikes = posts.reduce((sum: number, p: any) => sum + (p.like_count || 0), 0);
    const totalComments = posts.reduce((sum: number, p: any) => sum + (p.comments_count || 0), 0);
    const avgLikes = posts.length > 0 ? totalLikes / posts.length : 0;
    const avgComments = posts.length > 0 ? totalComments / posts.length : 0;
    
    const existingAnalytics = await ctx.runQuery(
      api["instagram/analyticsOps"].getByAccountAndDate,
      { accountId: args.accountId, date: today }
    );
    
    if (existingAnalytics) {
      await ctx.runMutation(
        api["instagram/analyticsOps"].updateAnalyticsRecord,
        {
          analyticsId: existingAnalytics._id,
          followersCount: data.data?.[0]?.values?.[0]?.value || account.followers || 0,
          postsCount: posts.length,
          totalLikes,
          totalComments,
          avgLikesPerPost: avgLikes,
          avgCommentsPerPost: avgComments,
          engagementRate: avgLikes + avgComments,
        }
      );
    } else {
      await ctx.runMutation(
        api["instagram/analyticsOps"].createAnalyticsRecord,
        {
          accountId: args.accountId,
          date: today,
          periodStart: Date.now() - 86400000,
          periodEnd: Date.now(),
          followersCount: data.data?.[0]?.values?.[0]?.value || account.followers || 0,
          followersDelta: 0,
          postsCount: posts.length,
          storiesCount: 0,
          totalLikes,
          totalComments,
          totalSaves: 0,
          totalShares: 0,
          avgLikesPerPost: avgLikes,
          avgCommentsPerPost: avgComments,
          engagementRate: avgLikes + avgComments,
        }
      );
    }
    
    return { success: true, followers: data.data?.[0]?.values?.[0]?.value || 0 };
  },
});

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

export const createAnalytics = mutation({
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

export const updateAnalytics = mutation({
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

export const exportReport = query({
  args: {
    accountId: v.string(),
    format: v.optional(v.union(v.literal("csv"), v.literal("json"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const format = args.format || "csv";
    const now = new Date();
    const defaultEnd = now.toISOString().split('T')[0];
    const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    
    const startDate = args.startDate || defaultStart;
    const endDate = args.endDate || defaultEnd;
    
    const analytics = await ctx.db
      .query("instagram_analytics")
      .withIndex("by_account_date", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const filtered = analytics
      .filter(a => a.date >= startDate && a.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const account = await ctx.db
      .query("instagram_accounts")
      .withIndex("by_instagramId", (q) => q.eq("instagramId", args.accountId))
      .first();
    
    if (format === "json") {
      return {
        format: "json",
        account: account?.username || "unknown",
        period: { start: startDate, end: endDate },
        data: filtered.map(a => ({
          date: a.date,
          followers: a.followersCount,
          followersDelta: a.followersDelta,
          posts: a.postsCount,
          likes: a.totalLikes,
          comments: a.totalComments,
          saves: a.totalSaves,
          shares: a.totalShares,
          engagementRate: a.engagementRate,
          avgLikesPerPost: a.avgLikesPerPost,
          avgCommentsPerPost: a.avgCommentsPerPost,
        })),
        summary: {
          totalPosts: filtered.reduce((sum, a) => sum + a.postsCount, 0),
          totalLikes: filtered.reduce((sum, a) => sum + a.totalLikes, 0),
          totalComments: filtered.reduce((sum, a) => sum + a.totalComments, 0),
          avgEngagementRate: filtered.length > 0 
            ? filtered.reduce((sum, a) => sum + a.engagementRate, 0) / filtered.length 
            : 0,
        },
      };
    }
    
    const csvHeaders = [
      "Fecha",
      "Seguidores",
      "Cambio Seguidores",
      "Posts",
      "Likes",
      "Comentarios",
      "Guardados",
      "Compartidos",
      "Tasa Engagement %",
      "Likes/Post",
      "Comentarios/Post"
    ];
    
    const csvRows = filtered.map(a => [
      a.date,
      a.followersCount,
      a.followersDelta,
      a.postsCount,
      a.totalLikes,
      a.totalComments,
      a.totalSaves,
      a.totalShares,
      (a.engagementRate * 100).toFixed(2),
      a.avgLikesPerPost.toFixed(2),
      a.avgCommentsPerPost.toFixed(2),
    ]);
    
    const totalLikes = filtered.reduce((sum, a) => sum + a.totalLikes, 0);
    const totalComments = filtered.reduce((sum, a) => sum + a.totalComments, 0);
    const totalPosts = filtered.reduce((sum, a) => sum + a.postsCount, 0);
    
    const summaryRows = [
      [],
      ["RESUMEN"],
      ["Cuenta", account?.username || "unknown"],
      ["Periodo", `${startDate} - ${endDate}`],
      ["Total Posts", totalPosts],
      ["Total Likes", totalLikes],
      ["Total Comentarios", totalComments],
      ["Engagement Promedio %", filtered.length > 0 
        ? ((filtered.reduce((sum, a) => sum + a.engagementRate, 0) / filtered.length) * 100).toFixed(2) 
        : "0.00"],
    ];
    
    const allRows = [
      csvHeaders,
      ...csvRows,
      ...summaryRows
    ];
    
    return {
      format: "csv",
      account: account?.username || "unknown",
      period: { start: startDate, end: endDate },
      csv: allRows.map(row => row.join(",")).join("\n"),
      summary: {
        totalPosts,
        totalLikes,
        totalComments,
        avgEngagementRate: filtered.length > 0 
          ? filtered.reduce((sum, a) => sum + a.engagementRate, 0) / filtered.length 
          : 0,
      },
    };
  },
});

export const getTopPosts = query({
  args: {
    accountId: v.string(),
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const days = args.days || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const analytics = await ctx.db
      .query("instagram_analytics")
      .withIndex("by_account_date", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const filtered = analytics
      .filter(a => a.date >= startDateStr)
      .sort((a, b) => b.engagementRate - a.engagementRate);
    
    const topPosts = filtered
      .flatMap(a => (a.topPosts || []).map(p => ({
        ...p,
        date: a.date,
        engagementRate: a.engagementRate,
      })))
      .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
      .slice(0, limit);
    
    return topPosts;
  },
});

export const getPerformanceMetrics = query({
  args: {
    accountId: v.string(),
    metric: v.optional(v.union(
      v.literal("followers"),
      v.literal("engagement"),
      v.literal("reach"),
      v.literal("posts")
    )),
    period: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
  },
  handler: async (ctx, args) => {
    const periodDays = args.period === "7d" ? 7 : args.period === "90d" ? 90 : 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const analytics = await ctx.db
      .query("instagram_analytics")
      .withIndex("by_account_date", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const filtered = analytics
      .filter(a => a.date >= startDateStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const account = await ctx.db
      .query("instagram_accounts")
      .withIndex("by_instagramId", (q) => q.eq("instagramId", args.accountId))
      .first();
    
    const metric = args.metric || "engagement";
    
    const data = filtered.map(a => {
      let value: number;
      let label: string;
      
      switch (metric) {
        case "followers":
          value = a.followersCount;
          label = "Seguidores";
          break;
        case "posts":
          value = a.postsCount;
          label = "Posts";
          break;
        case "reach":
          value = a.totalReach || 0;
          label = "Alcance";
          break;
        default:
          value = a.engagementRate * 100;
          label = "Engagement %";
      }
      
      return {
        date: a.date,
        value,
        label,
      };
    });
    
    const avg = data.length > 0 
      ? data.reduce((sum, d) => sum + d.value, 0) / data.length 
      : 0;
    
    const max = data.length > 0 
      ? Math.max(...data.map(d => d.value)) 
      : 0;
    
    const min = data.length > 0 
      ? Math.min(...data.map(d => d.value)) 
      : 0;
    
    return {
      metric,
      period: args.period || "30d",
      accountUsername: account?.username || "unknown",
      data,
      stats: { avg, max, min },
      summary: {
        totalPosts: filtered.reduce((sum, a) => sum + a.postsCount, 0),
        totalLikes: filtered.reduce((sum, a) => sum + a.totalLikes, 0),
        totalComments: filtered.reduce((sum, a) => sum + a.totalComments, 0),
        totalFollowersGained: filtered.reduce((sum, a) => sum + a.followersDelta, 0),
      },
    };
  },
});
