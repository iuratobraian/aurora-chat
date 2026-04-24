import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getChannels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("chatChannels").take(100);
  },
});

export const createChannel = mutation({
  args: {
    name: v.string(),
    password: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = args.name.toLowerCase().replace(/\s+/g, '-');
    const existing = await ctx.db
      .query("chatChannels")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) return existing;

    const channelId = await ctx.db.insert("chatChannels", {
      name: args.name,
      slug,
      type: args.password ? "private" : "global",
      participants: [args.createdBy],
      createdBy: args.createdBy,
      createdAt: Date.now(),
      password: args.password,
      isPrivate: !!args.password,
    });

    return { _id: channelId, slug, name: args.name, isPrivate: !!args.password };
  },
});

export const verifyChannelPasswordMutation = mutation({
  args: {
    channelSlug: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db
      .query("chatChannels")
      .withIndex("by_slug", (q) => q.eq("slug", args.channelSlug))
      .first();

    if (!channel) return { valid: false, reason: "Canal no encontrado" };
    if (!channel.isPrivate) return { valid: true };
    
    if (channel.password === args.password) {
      return { valid: true };
    }
    
    return { valid: false, reason: "Contraseña incorrecta" };
  },
});

export const getMessagesByChannel = query({
  args: {
    channelId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const messages = await ctx.db
      .query("chat")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(limit);

    return {
      messages: messages.reverse(),
    };
  },
});

export const sendMessage = mutation({
  args: {
    userId: v.string(),
    nombre: v.string(),
    avatar: v.string(),
    texto: v.string(),
    imagenUrl: v.optional(v.string()),
    channelId: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chat", {
      userId: args.userId,
      nombre: args.nombre,
      avatar: args.avatar,
      texto: args.texto,
      imagenUrl: args.imagenUrl,
      channelId: args.channelId,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getTypingUsers = query({
  args: {
    channelId: v.string(),
    excludeUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const typing = await ctx.db
      .query("chatTyping")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .filter((q) => q.neq(q.field("userId"), args.excludeUserId))
      .take(10);

    return typing.map((t) => t.nombre || "Alguien");
  },
});

export const setTyping = mutation({
  args: {
    channelId: v.string(),
    userId: v.string(),
    nombre: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatTyping")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", args.userId)
      )
      .first();

    const expiresAt = Date.now() + 3000;

    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      await ctx.db.insert("chatTyping", {
        channelId: args.channelId,
        userId: args.userId,
        nombre: args.nombre,
        expiresAt,
      });
    }
  },
});

export const getServerStats = query({
  args: {},
  handler: async (ctx) => {
    // Basic stats for demo purposes
    const totalMessages = await ctx.db.query("chat").take(1001);
    const totalChannels = await ctx.db.query("chatChannels").take(100);
    
    return {
      totalMessages: totalMessages.length,
      todayMessages: Math.floor(totalMessages.length * 0.3),
      weekMessages: totalMessages.length,
      totalChannels: totalChannels.length,
      activeUsers: Math.floor(Math.random() * 5) + 1,
      estimatedStorageKB: Math.floor(totalMessages.length * 0.5),
      storagePercentage: Math.min(99, Math.floor(totalMessages.length / 10)),
    };
  },
});

export const getOrCreatePrivateChannel = mutation({
  args: {
    user1Id: v.string(),
    user2Id: v.string(),
  },
  handler: async (ctx, args) => {
    const participants = [args.user1Id, args.user2Id].sort();
    const slug = `dm_${participants[0]}_${participants[1]}`;

    const existing = await ctx.db
      .query("chatChannels")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) return existing;

    const user2 = await ctx.db.get(args.user2Id as any); // Assuming ID or just string
    const name = user2 ? `Chat con ${user2.name}` : "Chat Privado";

    const channelId = await ctx.db.insert("chatChannels", {
      name,
      slug,
      type: "direct",
      participants,
      createdBy: args.user1Id,
      createdAt: Date.now(),
    });

    return { _id: channelId, slug, name };
  },
});

