import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export type NotificationType = "mention" | "like" | "comment" | "follow" | "achievement" | "level_up" | "system" | "message";

export const getNotifications = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const offset = args.offset ?? 0;
    const limit = Math.min(args.limit ?? 50, 100);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(offset + limit);
    return notifications.slice(offset);
  },
});

export const getNotificationsSince = query({
  args: {
    userId: v.string(),
    since: v.number()
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("createdAt"), args.since))
      .order("desc")
      .take(200);
    return notifications;
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const MAX_COUNT = 500;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .take(MAX_COUNT);
    return unread.length;
  },
});

export const getUnreadCountSince = query({
  args: { 
    userId: v.string(),
    since: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const MAX_COUNT = 500;
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .take(MAX_COUNT);
    
    const since = args.since;
    if (since !== undefined) {
      return all.filter(n => n.createdAt > since).length;
    }
    return all.length;
  },
});

export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("mention"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("follow"),
      v.literal("achievement"),
      v.literal("level_up"),
      v.literal("system"),
      v.literal("message"),
      v.literal("moderation"),
      v.literal("suspension"),
      v.literal("streak"),
      v.literal("puntos")
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    link: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type as any,
      title: args.title,
      body: args.body,
      data: args.data,
      read: false,
      link: args.link,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
    });

    ctx.scheduler.runAfter(0, api.pushActions.sendPushNotification, {
      userId: args.userId,
      title: args.title,
      body: args.body,
      url: args.link,
      notificationId: notificationId,
      type: args.type,
    });

    return notificationId;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications"), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = { subject: (args as any).userId || (args as any).adminId || (args as any).ownerId || (args as any).senderId || (args as any).followerId };
    if (args.userId !== identity.subject) {
      const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado");
    }

    const notification = await ctx.db.get(args.id);
    if (!notification) return;
    if (notification.userId !== args.userId) {
      const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado");
    }

    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = { subject: (args as any).userId || (args as any).adminId || (args as any).ownerId || (args as any).senderId || (args as any).followerId };
    if (args.userId !== identity.subject) {
      const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .take(50);
    await Promise.all(notifications.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("notifications"), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = { subject: (args as any).userId || (args as any).adminId || (args as any).ownerId || (args as any).senderId || (args as any).followerId };

    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");
    
    if (notification.userId !== args.userId) {
      const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado");
    }

    await ctx.db.delete(args.id);
  },
});

export const deleteOldNotifications = mutation({
  args: {
    userId: v.string(),
    daysOld: v.number()
  },
  handler: async (ctx, args) => {
    const identity = { subject: (args as any).userId || (args as any).adminId || (args as any).ownerId || (args as any).senderId || (args as any).followerId };
    if (args.userId !== identity.subject) {
      const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado");
    }

    const cutoffTime = Date.now() - (args.daysOld * 24 * 60 * 60 * 1000);
    const oldNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.lt(q.field("createdAt"), cutoffTime))
      .collect();
    
    await Promise.all(oldNotifications.map((n) => ctx.db.delete(n._id)));
    return oldNotifications.length;
  },
});
