import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createEvent = mutation({
  args: {
    channelId: v.string(),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    userId: v.id("users"),
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
    });
  },
});

export const getEventsByChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.gt(q.field("date"), Date.now() - 86400000)) // Mostrar hasta 1 día después de pasado
      .collect();
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
