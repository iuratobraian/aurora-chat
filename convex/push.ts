import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const subscribeToPush = mutation({
  args: {
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string()
      })
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        endpoint: args.subscription.endpoint,
        keys: args.subscription.keys,
        updatedAt: Date.now()
      });
    } else {
      await ctx.db.insert("pushSubscriptions", {
        userId: identity.subject,
        endpoint: args.subscription.endpoint,
        keys: args.subscription.keys,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    return { success: true };
  }
});

export const unsubscribePush = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    await Promise.all(subscriptions.map((s) => ctx.db.delete(s._id)));
    return { success: true };
  }
});

export const getPushSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
  }
});

export const getVapidPublicKey = query({
  args: {},
  handler: async () => {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
});

export const getAllPushSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    
    if (!profile || (profile.role || 0) < 5) {
      throw new Error("Solo admins pueden ver todas las suscripciones");
    }
    
    return await ctx.db.query("pushSubscriptions").collect();
  }
});

export const getPushSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db.query("pushSubscriptions").collect();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    return {
      total: subscriptions.length,
      activeLast24h: subscriptions.filter(s => s.createdAt > oneDayAgo).length,
      activeLastWeek: subscriptions.filter(s => s.createdAt > oneWeekAgo).length,
      timestamp: now
    };
  }
});

export const deleteInvalidSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();
    
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
    return { success: true };
  }
});

export const cleanupOldSubscriptions = mutation({
  args: { olderThanDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    
    if (!profile || (profile.role || 0) < 5) {
      throw new Error("Solo admins pueden limpiar suscripciones");
    }

    const days = args.olderThanDays ?? 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const oldSubscriptions = await ctx.db
      .query("pushSubscriptions")
      .collect();
    
    const toDelete = oldSubscriptions.filter(s => s.createdAt < cutoff);
    
    await Promise.all(toDelete.map(s => ctx.db.delete(s._id)));
    
    return { deleted: toDelete.length };
  }
});
