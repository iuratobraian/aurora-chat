import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const DEFAULT_PREFS = {
  enabled: true,
  signalTypes: ["forex", "crypto"] as const,
  minProviderRating: 0,
  notifyOnNew: true,
  notifyOnResult: true,
  notifyOnUpdate: true,
};

export const getSignalNotificationPrefs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prefs = await ctx.db
      .query("signal_notification_prefs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!prefs) {
      return {
        userId: identity.subject,
        ...DEFAULT_PREFS,
        minWinRate: null,
        quietHoursStart: null,
        quietHoursEnd: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return prefs;
  },
});

export const updateSignalNotificationPrefs = mutation({
  args: {
    enabled: v.optional(v.boolean()),
    signalTypes: v.optional(v.array(v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("indices"),
      v.literal("commodities"),
      v.literal("stocks"),
      v.literal("binary"),
      v.literal("options")
    ))),
    minProviderRating: v.optional(v.number()),
    minWinRate: v.optional(v.number()),
    notifyOnNew: v.optional(v.boolean()),
    notifyOnResult: v.optional(v.boolean()),
    notifyOnUpdate: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.number()),
    quietHoursEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const existing = await ctx.db
      .query("signal_notification_prefs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    const now = Date.now();
    const updates = {
      ...args,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return { success: true, updated: existing._id };
    } else {
      const id = await ctx.db.insert("signal_notification_prefs", {
        userId: identity.subject,
        enabled: args.enabled ?? DEFAULT_PREFS.enabled,
        signalTypes: args.signalTypes ?? [...DEFAULT_PREFS.signalTypes],
        minProviderRating: args.minProviderRating ?? DEFAULT_PREFS.minProviderRating,
        minWinRate: args.minWinRate,
        quietHoursStart: args.quietHoursStart,
        quietHoursEnd: args.quietHoursEnd,
        notifyOnNew: args.notifyOnNew ?? DEFAULT_PREFS.notifyOnNew,
        notifyOnResult: args.notifyOnResult ?? DEFAULT_PREFS.notifyOnResult,
        notifyOnUpdate: args.notifyOnUpdate ?? DEFAULT_PREFS.notifyOnUpdate,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, created: id };
    }
  },
});

export const toggleSignalNotifications = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const existing = await ctx.db
      .query("signal_notification_prefs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { enabled: args.enabled, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("signal_notification_prefs", {
        userId: identity.subject,
        enabled: args.enabled,
        signalTypes: [...DEFAULT_PREFS.signalTypes],
        minProviderRating: DEFAULT_PREFS.minProviderRating,
        minWinRate: undefined,
        notifyOnNew: DEFAULT_PREFS.notifyOnNew,
        notifyOnResult: DEFAULT_PREFS.notifyOnResult,
        notifyOnUpdate: DEFAULT_PREFS.notifyOnUpdate,
        quietHoursStart: undefined,
        quietHoursEnd: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return { success: true, enabled: args.enabled };
  },
});

export const getUsersEligibleForSignalNotification = query({
  args: {
    signalType: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("indices"),
      v.literal("commodities"),
      v.literal("stocks"),
      v.literal("binary"),
      v.literal("options")
    ),
    providerRating: v.number(),
  },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("signal_notification_prefs")
      .filter((q) =>
        q.and(
          q.eq(q.field("enabled"), true),
          q.gte(q.field("minProviderRating"), 0)
        )
      )
      .collect();

    return prefs
      .filter((p) => {
        if (p.minProviderRating > args.providerRating) return false;
        if (!p.signalTypes.includes(args.signalType)) return false;
        return true;
      })
      .map((p) => p.userId);
  },
});

export const shouldNotifyUser = query({
  args: {
    userId: v.string(),
    signalType: v.string(),
    providerRating: v.number(),
  },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("signal_notification_prefs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!prefs || !prefs.enabled) return false;
    if (prefs.minProviderRating > args.providerRating) return false;
    if (!prefs.signalTypes.includes(args.signalType as any)) return false;

    const now = Date.now();
    if (prefs.quietHoursStart !== undefined && prefs.quietHoursEnd !== undefined) {
      const currentHour = new Date(now).getHours();
      const start = prefs.quietHoursStart;
      const end = prefs.quietHoursEnd;
      if (start < end) {
        if (currentHour >= start && currentHour < end) return false;
      } else {
        if (currentHour >= start || currentHour < end) return false;
      }
    }

    return true;
  },
});

export const recordSignalNotification = mutation({
  args: {
    userId: v.string(),
    signalId: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("not_sent"),
      v.literal("filtered"),
      v.literal("failed")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("signal_notifications", {
      userId: args.userId,
      signalId: args.signalId,
      channel: "push",
      status: args.status,
      opened: false,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getSignalNotificationHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const limit = args.limit ?? 50;
    return await ctx.db
      .query("signal_notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit);
  },
});

export const markSignalNotificationOpened = mutation({
  args: { notificationId: v.id("signal_notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) return;

    if (notification.userId !== identity.subject) {
      throw new Error("No autorizado");
    }

    await ctx.db.patch(args.notificationId, {
      opened: true,
      openedAt: Date.now(),
    });
  },
});

export const getSignalNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const notifications = await ctx.db
      .query("signal_notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const total = notifications.length;
    const sent = notifications.filter((n) => n.status === "sent").length;
    const failed = notifications.filter((n) => n.status === "failed").length;
    const opened = notifications.filter((n) => n.opened).length;
    const rate = total > 0 ? (opened / total) * 100 : 0;

    return {
      total,
      sent,
      failed,
      opened,
      openRate: Math.round(rate * 10) / 10,
    };
  },
});

export const notifySubscribersOfNewSignal = action({
  args: {
    signalId: v.string(),
    providerId: v.string(),
    signalType: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("indices"),
      v.literal("commodities"),
      v.literal("stocks"),
      v.literal("binary"),
      v.literal("options")
    ),
    pair: v.string(),
    direction: v.union(v.literal("buy"), v.literal("sell")),
    entryPrice: v.number(),
    priority: v.union(v.literal("vip"), v.literal("premium"), v.literal("standard"), v.literal("free")),
  },
  handler: async (ctx, args) => {
    const provider = await ctx.runQuery(api.signals.getProviderByUserId, { userId: args.providerId });
    if (!provider) return;

    const direction = args.direction === "buy" ? "📈 COMPRAR" : "📉 VENDER";
    const title = `${direction} ${args.pair} - Signal`;
    const body = `Precio entrada: ${args.entryPrice.toFixed(5)} | Prioridad: ${args.priority}`;
    const url = `/signals/${args.signalId}`;
    const providerRating = provider.avgRating || 0;

    const allUsersWithPrefs = await ctx.runQuery(api.signalNotifications.getAllUsersWithSignalPrefs, {});
    
    for (const userId of allUsersWithPrefs) {
      const shouldNotify = await ctx.runQuery(api.signalNotifications.shouldNotifyUser, {
        userId,
        signalType: args.signalType,
        providerRating,
      });

      if (!shouldNotify) {
        await ctx.runMutation(api.signalNotifications.recordSignalNotification, {
          userId,
          signalId: args.signalId,
          status: "filtered",
          reason: "user preferences",
        });
        continue;
      }

      try {
        await ctx.runMutation(api.pushActions.sendPushNotification, {
          userId,
          title,
          body,
          url,
          tag: `signal-${args.signalId}`,
          type: "signal_new",
        });

        await ctx.runMutation(api.signalNotifications.recordSignalNotification, {
          userId,
          signalId: args.signalId,
          status: "sent",
        });
      } catch {
        await ctx.runMutation(api.signalNotifications.recordSignalNotification, {
          userId,
          signalId: args.signalId,
          status: "failed",
        });
      }
    }
  },
});

export const notifySubscribersOfSignalUpdate = action({
  args: {
    signalId: v.string(),
    providerId: v.string(),
    signalType: v.string(),
    pair: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("partially_hit"),
      v.literal("hit"),
      v.literal("canceled"),
      v.literal("expired")
    ),
  },
  handler: async (ctx, args) => {
    const statusMessages: Record<string, string> = {
      active: "actualizado",
      partially_hit: "parcialmente alcanzado",
      hit: "¡ALCANZADO!",
      canceled: "cancelado",
      expired: "expirado",
    };

    const message = statusMessages[args.status] || args.status;
    const title = `Signal ${args.pair} - ${message}`;
    const body = `El signal ha sido ${message}. Ver detalles.`;
    const url = `/signals/${args.signalId}`;

    const allUsersWithPrefs = await ctx.runQuery(api.signalNotifications.getAllUsersWithSignalPrefs, {});
    
    for (const userId of allUsersWithPrefs) {
      try {
        await ctx.runMutation(api.pushActions.sendPushNotification, {
          userId,
          title,
          body,
          url,
          tag: `signal-update-${args.signalId}`,
          type: "signal_update",
        });

        await ctx.runMutation(api.signalNotifications.recordSignalNotification, {
          userId,
          signalId: args.signalId,
          status: "sent",
        });
      } catch {
        await ctx.runMutation(api.signalNotifications.recordSignalNotification, {
          userId,
          signalId: args.signalId,
          status: "failed",
        });
      }
    }
  },
});

export const getProviderById = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    const providers = await ctx.db
      .query("signal_providers")
      .withIndex("by_user", (q) => q.eq("userId", args.providerId))
      .collect();
    return providers[0] || null;
  },
});

export const getAllUsersWithSignalPrefs = query({
  args: {},
  handler: async (ctx) => {
    const prefs = await ctx.db.query("signal_notification_prefs").collect();
    return prefs.filter((p) => p.enabled).map((p) => p.userId);
  },
});
