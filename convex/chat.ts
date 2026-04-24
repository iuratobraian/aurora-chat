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
    welcomeMessage: v.optional(v.string()),
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
      welcomeMessage: args.welcomeMessage,
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
    const user1Id = args.user1Id as any;
    const user2Id = args.user2Id as any;
    
    const existing = await ctx.db
      .query("chatChannels")
      .withIndex("by_users", (q) => q.eq("user1Id", user1Id).eq("user2Id", user2Id))
      .first() || await ctx.db
      .query("chatChannels")
      .withIndex("by_users", (q) => q.eq("user1Id", user2Id).eq("user2Id", user1Id))
      .first();

    if (existing) return existing;

    const user1 = await ctx.db.get(user1Id);
    const user2 = await ctx.db.get(user2Id);

    // Check if they are already friends
    const isFriend = await ctx.db
      .query("friends")
      .withIndex("by_users", (q) => q.eq("user1Id", user1Id).eq("user2Id", user2Id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first() || await ctx.db
      .query("friends")
      .withIndex("by_users", (q) => q.eq("user1Id", user2Id).eq("user2Id", user1Id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    // Instagram style: if receiver has "requests" mode AND NOT A FRIEND, channel is "pending"
    const status = (user2?.privacyMode === "requests" && !isFriend) ? "pending" : "active";


    const channelId = await ctx.db.insert("chatChannels", {
      name: `${user2?.name || 'User'}`,
      slug: `dm-${Date.now()}`,
      createdBy: user1Id,
      type: "direct",
      status,
      user1Id,
      user2Id,
    });
    
    // Send automated welcome message if exists
    const welcome = user2?.name ? `¡Hola ${user2.name}! Bienvenido a este chat privado con ${user1?.name}.` : "¡Hola! Bienvenido al chat.";
    
    const channel = await ctx.db.get(channelId);
    
    await ctx.db.insert("chat", {
      userId: "system",
      nombre: "Aurora Bot",
      avatar: "https://cdn-icons-png.flaticon.com/512/2593/2593635.png",
      texto: welcome,
      channelId: channel?.slug || '',
      createdAt: Date.now(),
    });

    return channel;


  },
});

export const updateChannelStatus = mutation({
  args: { channelId: v.id("chatChannels"), status: v.union(v.literal("active"), v.literal("pending")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.channelId, { status: args.status });
  },
});

export const deleteChannel = mutation({
  args: { channelId: v.id("chatChannels") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.channelId);
  },
});

export const deleteOldMessages = mutation({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const threshold = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const oldMessages = await ctx.db
      .query("chat")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", threshold))
      .take(100);

    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }
    
    return oldMessages.length;
  },
});


export const togglePinMessage = mutation({
  args: { messageId: v.id("chat"), isPinned: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { isPinned: args.isPinned });
  },
});

export const togglePauseChannel = mutation({
  args: { channelId: v.id("chatChannels"), isPaused: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.channelId, { isPaused: args.isPaused });
  },
});

export const getPinnedMessages = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq(q.field("isPinned"), true))
      .collect();
  },
});

export const getChannelBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatChannels")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
