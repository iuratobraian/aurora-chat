import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── QUERIES ──────────────────────────────────────────────────────────

export const getChannel = query({
  args: { subcommunityId: v.id("subcommunities") },
  handler: async (ctx, args) => {
    const channel = await ctx.db
      .query("chatChannels")
      .filter((q) => q.eq(q.field("slug"), `sub_${args.subcommunityId}`))
      .first();

    return channel;
  },
});

export const getMessages = query({
  args: {
    subcommunityId: v.id("subcommunities"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const channelId = `sub_${args.subcommunityId}`;

    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as any);
      if (!cursorDoc || !("createdAt" in cursorDoc)) {
        return { messages: [], nextCursor: null, hasMore: false };
      }
      const cursorTime = (cursorDoc as any).createdAt;
      const messages = await ctx.db
        .query("chat")
        .withIndex("by_channel")
        .filter((q) => q.eq(q.field("channelId"), channelId))
        .filter((q) => q.lt(q.field("createdAt"), cursorTime))
        .order("desc")
        .take(limit + 1);

      const hasMore = messages.length > limit;
      const result = hasMore ? messages.slice(0, limit) : messages;
      return {
        messages: result.reverse(),
        nextCursor: hasMore && result.length > 0 ? result[result.length - 1]._id : null,
        hasMore,
      };
    }

    const messages = await ctx.db
      .query("chat")
      .withIndex("by_channel")
      .filter((q) => q.eq(q.field("channelId"), channelId))
      .order("desc")
      .take(limit + 1);

    const hasMore = messages.length > limit;
    const result = hasMore ? messages.slice(0, limit) : messages;
    return {
      messages: result.reverse(),
      nextCursor: hasMore && result.length > 0 ? result[result.length - 1]._id : null,
      hasMore,
    };
  },
});

// ─── MUTATIONS ────────────────────────────────────────────────────────

export const sendMessage = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    nombre: v.string(),
    avatar: v.string(),
    texto: v.string(),
    imagenUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.texto.trim() && !args.imagenUrl) {
      throw new Error("Mensaje vacío");
    }

    const membership = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) throw new Error("Solo miembros pueden enviar mensajes");

    const channelId = `sub_${args.subcommunityId}`;

    const msgId = await ctx.db.insert("chat", {
      userId: args.userId,
      nombre: args.nombre,
      avatar: args.avatar,
      texto: args.texto.trim(),
      imagenUrl: args.imagenUrl,
      channelId,
      createdAt: Date.now(),
    });

    return msgId;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("chat"),
    userId: v.string(),
    subcommunityId: v.id("subcommunities"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Mensaje no encontrado");

    const msg = message as any;
    if (msg.userId !== args.userId) {
      const membership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (!membership || !["owner", "admin", "moderator"].includes(membership.role)) {
        throw new Error("No autorizado");
      }
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});
