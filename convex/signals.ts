import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getSignalPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signal_plans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getFeaturedPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signal_plans")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.eq(q.field("isFeatured"), true)
      ))
      .collect();
  },
});

export const getPlanBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const plans = await ctx.db
      .query("signal_plans")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .collect();
    return plans[0] || null;
  },
});

export const getActiveSignals = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(50);
    
    if (signals.length === 0) return [];
    
    const providerIds = [...new Set(signals.map(s => s.providerId))];
    const providers = await ctx.db
      .query("signal_providers")
      .filter(q => q.or(...providerIds.map(pid => q.eq(q.field("userId"), pid))))
      .collect();
    const providerMap = new Map(providers.map(p => [p.userId, p]));
    
    return signals.map(signal => ({
      ...signal,
      provider: providerMap.get(signal.providerId),
    })).sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));
  },
});

export const getSignalsByType = query({
  args: { type: v.union(
    v.literal("forex"),
    v.literal("crypto"),
    v.literal("indices"),
    v.literal("commodities"),
    v.literal("stocks"),
    v.literal("binary"),
    v.literal("options")
  )},
  handler: async (ctx, { type }) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_type", (q) => q.eq("type", type))
      .collect();
  },
});

export const getSignalsByPair = query({
  args: { pair: v.string() },
  handler: async (ctx, { pair }) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_pair", (q) => q.eq("pair", pair))
      .collect();
  },
});

export const getSignalById = query({
  args: { signalId: v.string() },
  handler: async (ctx, { signalId }) => {
    const signals = await ctx.db
      .query("signals")
      .filter((q) => q.eq(q.field("signalId"), signalId))
      .collect();
    return signals[0] || null;
  },
});

export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db
      .query("signal_subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    return subs[0] || null;
  },
});

export const getUserSubscriptions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("signal_subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getSignalProviders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signal_providers")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.eq(q.field("isSuspended"), false)
      ))
      .collect();
  },
});

export const getTopProviders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const providers = await ctx.db
      .query("signal_providers")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.eq(q.field("isSuspended"), false)
      ))
      .collect();
    
    return providers
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  },
});

export const getProviderByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const providers = await ctx.db
      .query("signal_providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return providers[0] || null;
  },
});

export const subscribeToPlan = mutation({
  args: {
    userId: v.string(),
    planId: v.id("signal_plans"),
    MercadoPagoSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) throw new Error("No autorizado para suscribir a otro usuario");

    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");
    if (!plan.isActive) throw new Error("Plan is not active");

    const now = Date.now();
    const periodEnd = now + (30 * 24 * 60 * 60 * 1000);

    const subscriptionId = await ctx.db.insert("signal_subscriptions", {
      userId: args.userId,
      planId: args.planId,
      MercadoPagoSubscriptionId: args.MercadoPagoSubscriptionId,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      signalsReceivedToday: 0,
      signalsReceivedThisWeek: 0,
      signalsReceivedThisMonth: 0,
      isTrial: false,
      totalSignalsReceived: 0,
      winRate: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.planId, {
      subscriberCount: plan.subscriberCount + 1,
    });

    return subscriptionId;
  },
});

export const cancelSubscription = mutation({
  args: { subscriptionId: v.id("signal_subscriptions") },
  handler: async (ctx, { subscriptionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription) throw new Error("Subscription not found");
    if (subscription.userId !== identity.subject) {
      const caller = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .unique();
      if (!caller || (caller.role || 0) < 5) throw new Error("No autorizado para cancelar esta suscripción");
    }

    await ctx.db.patch(subscriptionId, {
      status: "canceled",
      updatedAt: Date.now(),
    });

    const plan = await ctx.db.get(subscription.planId);
    if (plan) {
      await ctx.db.patch(subscription.planId, {
        subscriberCount: Math.max(0, plan.subscriberCount - 1),
      });
    }
  },
});

export const createSignal = mutation({
  args: {
    providerId: v.string(),
    type: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("indices"),
      v.literal("commodities"),
      v.literal("stocks"),
      v.literal("binary"),
      v.literal("options")
    ),
    priority: v.union(
      v.literal("vip"),
      v.literal("premium"),
      v.literal("standard"),
      v.literal("free")
    ),
    pair: v.string(),
    pairCategory: v.optional(v.string()),
    direction: v.union(v.literal("buy"), v.literal("sell")),
    entryPrice: v.number(),
    entryRangeMin: v.optional(v.number()),
    entryRangeMax: v.optional(v.number()),
    entryType: v.union(
      v.literal("instant"),
      v.literal("limit"),
      v.literal("stop"),
      v.literal("range")
    ),
    stopLoss: v.number(),
    stopLossPips: v.optional(v.number()),
    stopLossPercentage: v.optional(v.number()),
    takeProfits: v.array(v.object({
      level: v.number(),
      price: v.number(),
      percentage: v.optional(v.number()),
      reached: v.boolean(),
      reachedAt: v.optional(v.number()),
    })),
    timeframe: v.union(
      v.literal("M1"), v.literal("M5"), v.literal("M15"),
      v.literal("H1"), v.literal("H4"), v.literal("D1"),
      v.literal("W1"), v.literal("MN")
    ),
    sentiment: v.union(v.literal("bullish"), v.literal("bearish"), v.literal("neutral")),
    analysis: v.string(),
    reason: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.providerId !== identity.subject) {
      const caller = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .unique();
      if (!caller || (caller.role || 0) < 5) throw new Error("No autorizado para crear señales a nombre de otro");
    }

    const provider = await ctx.db
      .query("signal_providers")
      .withIndex("by_user", (q) => q.eq("userId", args.providerId))
      .first();
    
    if (!provider) throw new Error("Provider not found");
    if (provider.isSuspended) throw new Error("Provider is suspended");

    const now = Date.now();
    const signalId = `signal_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const signal = await ctx.db.insert("signals", {
      signalId,
      providerId: args.providerId,
      type: args.type,
      priority: args.priority,
      pair: args.pair,
      pairCategory: args.pairCategory,
      direction: args.direction,
      entryPrice: args.entryPrice,
      entryRangeMin: args.entryRangeMin,
      entryRangeMax: args.entryRangeMax,
      entryType: args.entryType,
      stopLoss: args.stopLoss,
      stopLossPips: args.stopLossPips,
      stopLossPercentage: args.stopLossPercentage,
      takeProfits: args.takeProfits,
      timeframe: args.timeframe,
      sentiment: args.sentiment,
      analysis: args.analysis,
      reason: args.reason,
      status: args.scheduledFor ? "scheduled" : "active",
      scheduledFor: args.scheduledFor,
      sentAt: args.scheduledFor ? undefined : now,
      expiresAt: args.scheduledFor ? args.scheduledFor + (24 * 60 * 60 * 1000) : now + (24 * 60 * 60 * 1000),
      totalSubscribersNotified: 0,
      subscribersActed: 0,
      subscribersWon: 0,
      subscribersLost: 0,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(provider._id, {
      totalSignalsSent: provider.totalSignalsSent + 1,
      totalSignalsActive: provider.totalSignalsActive + 1,
      updatedAt: now,
    });

    ctx.scheduler.runAfter(0, api.signalNotifications.notifySubscribersOfNewSignal, {
      signalId,
      providerId: args.providerId,
      signalType: args.type,
      pair: args.pair,
      direction: args.direction,
      entryPrice: args.entryPrice,
      priority: args.priority,
    });

    return signal;
  },
});

export const updateSignalStatus = mutation({
  args: {
    signalId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("partially_hit"),
      v.literal("hit"),
      v.literal("canceled"),
      v.literal("expired")
    ),
  },
  handler: async (ctx, { signalId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const signals = await ctx.db
      .query("signals")
      .filter((q) => q.eq(q.field("signalId"), signalId))
      .collect();
    
    const signal = signals[0];
    if (!signal) throw new Error("Signal not found");

    const isProvider = signal.providerId === identity.subject;
    const caller = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    const isAdmin = caller && (caller.role || 0) >= 5;

    if (!isProvider && !isAdmin) throw new Error("No tienes permiso para actualizar este signal");

    const now = Date.now();
    await ctx.db.patch(signal._id, {
      status,
      closedAt: status === "hit" || status === "canceled" || status === "expired" ? now : undefined,
      updatedAt: now,
    });

    if (status === "hit" || status === "canceled" || status === "expired") {
      const provider = await ctx.db
        .query("signal_providers")
        .withIndex("by_user", (q) => q.eq("userId", signal.providerId))
        .first();
      
      if (provider) {
        await ctx.db.patch(provider._id, {
          totalSignalsActive: Math.max(0, provider.totalSignalsActive - 1),
          updatedAt: now,
        });

        // Trigger accuracy recalculation
        ctx.scheduler.runAfter(0, api.profiles.recalculateAccuracy, { userId: signal.providerId });
      }
    }

    ctx.scheduler.runAfter(0, api.signalNotifications.notifySubscribersOfSignalUpdate, {
      signalId: signal.signalId,
      providerId: signal.providerId,
      signalType: signal.type,
      pair: signal.pair,
      status,
    });
  },
});

export const recordSubscriberAction = mutation({
  args: {
    signalId: v.string(),
    userId: v.string(),
    action: v.union(
      v.literal("viewed"),
      v.literal("opened_trade"),
      v.literal("closed_profit"),
      v.literal("closed_loss"),
      v.literal("ignored")
    ),
    tradeOpened: v.boolean(),
    entryPriceUsed: v.optional(v.number()),
    exitPriceUsed: v.optional(v.number()),
    result: v.optional(v.union(
      v.literal("profit"),
      v.literal("loss"),
      v.literal("breakeven"),
      v.literal("pending")
    )),
    pipsGained: v.optional(v.number()),
    percentageGained: v.optional(v.number()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const caller = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .unique();
      if (!caller || (caller.role || 0) < 5) throw new Error("No autorizado para registrar acciones a nombre de otro");
    }
    const signals = await ctx.db
      .query("signals")
      .filter((q) => q.eq(q.field("signalId"), args.signalId))
      .collect();
    
    const signal = signals[0];
    if (!signal) throw new Error("Signal not found");

    const now = Date.now();
    await ctx.db.insert("signal_subscribers_actions", {
      signalId: args.signalId,
      userId: args.userId,
      action: args.action,
      tradeOpened: args.tradeOpened,
      entryPriceUsed: args.entryPriceUsed,
      exitPriceUsed: args.exitPriceUsed,
      result: args.result || "pending",
      pipsGained: args.pipsGained,
      percentageGained: args.percentageGained,
      platform: args.platform,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(signal._id, {
      subscribersActed: signal.subscribersActed + (args.action === "opened_trade" ? 1 : 0),
      subscribersWon: signal.subscribersWon + (args.result === "profit" ? 1 : 0),
      subscribersLost: signal.subscribersLost + (args.result === "loss" ? 1 : 0),
      updatedAt: now,
    });
  },
});

export const getSignalStats = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("signals").collect();
    const providers = await ctx.db.query("signal_providers").collect();
    const subscriptions = await ctx.db.query("signal_subscriptions").collect();
    const plans = await ctx.db.query("signal_plans").collect();

    const activeSignals = signals.filter(s => s.status === "active" || s.status === "partially_hit");
    const wonSignals = signals.filter(s => s.status === "hit");
    const totalSubscribers = subscriptions.filter(s => s.status === "active").length;
    const avgWinRate = providers.length > 0 
      ? providers.reduce((sum, p) => sum + p.avgWinRate, 0) / providers.length 
      : 0;

    return {
      totalSignals: signals.length,
      activeSignals: activeSignals.length,
      wonSignals: wonSignals.length,
      totalProviders: providers.length,
      totalSubscribers,
      totalPlans: plans.length,
      avgWinRate: avgWinRate.toFixed(1),
    };
  },
});

export const getProviderStats = query({
  args: { providerId: v.string() },
  handler: async (ctx, { providerId }) => {
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_provider", (q) => q.eq("providerId", providerId))
      .collect();
    
    const performances = await ctx.db
      .query("signal_performance")
      .filter((q) => q.eq(q.field("providerId"), providerId))
      .collect();

    const activeSignals = signals.filter(s => s.status === "active" || s.status === "partially_hit");
    const wonSignals = signals.filter(s => s.status === "hit");
    const totalPips = signals.reduce((sum, s) => {
      const wonTPs = s.takeProfits.filter(tp => tp.reached);
      const wonPips = wonTPs.reduce((tpSum, tp) => tpSum + (tp.percentage || 0), 0);
      return sum + wonPips;
    }, 0);

    return {
      totalSignals: signals.length,
      activeSignals: activeSignals.length,
      wonSignals: wonSignals.length,
      winRate: signals.length > 0 ? ((wonSignals.length / signals.length) * 100).toFixed(1) : "0",
      totalPips: totalPips.toFixed(1),
      recentPerformance: performances.slice(-7),
    };
  },
});

export const becomeProvider = mutation({
  args: {
    userId: v.string(),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, isVerified = false }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (userId !== identity.subject) {
      const caller = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .unique();
      if (!caller || (caller.role || 0) < 5) throw new Error("No autorizado para registrar providers a nombre de otro");
    }

    const existing = await ctx.db
      .query("signal_providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    if (existing.length > 0) throw new Error("Already a provider");

    const now = Date.now();
    const providerId = await ctx.db.insert("signal_providers", {
      userId,
      isVerified,
      verificationLevel: "basic",
      totalSignalsSent: 0,
      totalSignalsActive: 0,
      avgWinRate: 0,
      totalPipsGenerated: 0,
      subscribersCount: 0,
      avgRating: 0,
      totalRatings: 0,
      earningsThisMonth: 0,
      totalEarnings: 0,
      pendingPayout: 0,
      signalsPerDayLimit: 5,
      signalsPerWeekLimit: 20,
      isActive: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    });

    return providerId;
  },
});

export const getSignalHistory = query({
  args: {
    limit: v.optional(v.number()),
    signalId: v.optional(v.id("signals")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db.query("signals");
    
    if (args.signalId) {
      return await ctx.db.get(args.signalId);
    }
    
    const allSignals = await query.order("desc").take(limit * 2);
    
    return allSignals
      .filter(s => s.status !== "draft")
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);
  },
});

export const sendSignalToChat = mutation({
  args: {
    signalId: v.id("signals"),
    channelId: v.optional(v.string()),
    communityId: v.optional(v.id("communities")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const signal = await ctx.db.get(args.signalId);
    if (!signal) throw new Error("Signal not found");

    const isProvider = signal.providerId === identity.subject;
    const caller = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    const isAdmin = caller && (caller.role || 0) >= 5;
    if (!isProvider && !isAdmin) throw new Error("No tienes permiso para enviar este signal al chat");
    
    const channelId = args.channelId || `community_${args.communityId || "global"}`;
    
    const chatMessageId = await ctx.db.insert("chat", {
      userId: signal.providerId,
      nombre: "Signal Bot",
      avatar: "🤖",
      texto: formatSignalForChat(signal),
      channelId,
      createdAt: Date.now(),
    });
    
    return { success: true, chatMessageId };
  },
});

function formatSignalForChat(signal: any): string {
  const direction = signal.direction === "buy" ? "📈 COMPRA" : "📉 VENTA";
  const pairs = signal.pair ? `**${signal.pair}**` : "";
  const entry = signal.entryPrice ? `@ ${signal.entryPrice}` : "";
  const sl = signal.stopLoss ? `SL: ${signal.stopLoss}` : "";
  const tp = signal.takeProfit ? `TP: ${signal.takeProfit.join(", ")}` : "";
  
  return `${direction} ${pairs}\n${entry}\n${sl} | ${tp}`;
}
