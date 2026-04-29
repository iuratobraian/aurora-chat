import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createEvent = mutation({
  args: {
    channelId: v.string(),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    userId: v.id("users"),
    notificationTime: v.optional(v.number()), // minutos antes para notificar
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      channelId: args.channelId,
      title: args.title,
      description: args.description,
      date: args.date,
      createdBy: args.userId,
      participants: [args.userId],
      createdAt: Date.now(),
      notificationTime: args.notificationTime || 15, // 15 min por defecto
      notified: false,
    });
  },
});

export const getEventsByChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.gt(q.field("date"), Date.now() - 86400000))
      .collect();
  },
});

export const getEventsByDateRange = query({
  args: { startDate: v.number(), endDate: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();
  },
});

export const getUpcomingEvents = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .filter((q) => q.gt(q.field("date"), now))
      .collect();
    
    // Filtrar eventos donde el usuario es participante
    return events.filter(e => e.participants.includes(args.userId));
  },
});

export const markEventNotified = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { notified: true });
  },
});

export const joinEvent = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return;
    if (event.participants.includes(args.userId)) return;
    
    await ctx.db.patch(args.eventId, {
      participants: [...event.participants, args.userId]
    });
  },
});

export const leaveEvent = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return;
    
    await ctx.db.patch(args.eventId, {
      participants: event.participants.filter(id => id !== args.userId)
    });
  },
});
