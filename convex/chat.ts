import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { filterMessage, getModerationWarning, calculateSpamScore, moderateMessage } from "./lib/moderation";
import { addXpInternal } from "./lib/gamification";
import { checkRateLimit } from "./lib/rateLimit";

export const getChannels = query({
  args: {},
  handler: async (ctx) => {
    const channels = await ctx.db.query("chatChannels").collect();
    return channels;
  },
});

export const getOrCreateChannel = mutation({
  args: {
    type: v.union(v.literal("global"), v.literal("community"), v.literal("direct"), v.literal("private")),
    communityId: v.optional(v.id("communities")),
    participant1: v.string(),
    participant2: v.optional(v.string()),
    name: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = args.type === "direct" 
      ? `dm_${[args.participant1, args.participant2].sort().join("_")}`
      : args.type === "community" && args.communityId
        ? `community_${args.communityId}`
        : args.type === "private" && args.name
          ? `private_${args.name.toLowerCase().replace(/\s+/g, "-")}_${Date.now()}`
          : "global";

    const existing = await ctx.db
      .query("chatChannels")
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("slug"), slug))
      .first();

    if (existing) return existing._id;

    const channelName = args.type === "global" ? "General" 
      : args.type === "community" ? "Comunidad" 
      : args.type === "direct" ? "Chat Privado" 
      : args.name || "Canal Privado";

    const id = await ctx.db.insert("chatChannels", {
      name: channelName,
      slug,
      type: args.type,
      communityId: args.communityId,
      participants: [args.participant1, ...(args.participant2 ? [args.participant2] : [])],
      createdBy: args.participant1,
      createdAt: Date.now(),
      password: args.password || undefined,
      isPrivate: !!args.password,
    });

    return id;
  },
});

export const createChannel = mutation({
  args: {
    name: v.string(),
    password: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = `private_${args.name.toLowerCase().replace(/\s+/g, "-")}_${Date.now()}`;
    
    // Check if channel with similar name already exists
    const existing = await ctx.db
      .query("chatChannels")
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("slug"), slug))
      .first();
    
    if (existing) {
      throw new Error("Ya existe un canal con ese nombre");
    }

    const id = await ctx.db.insert("chatChannels", {
      name: args.name,
      slug,
      type: "private",
      participants: [args.createdBy],
      createdBy: args.createdBy,
      createdAt: Date.now(),
      password: args.password || undefined,
      isPrivate: !!args.password,
    });

    return { _id: id, name: args.name, slug, isPrivate: !!args.password };
  },
});

export const verifyChannelPassword = query({
  args: {
    channelSlug: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db
      .query("chatChannels")
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("slug"), args.channelSlug))
      .first();

    if (!channel) {
      return { valid: false, reason: "Canal no encontrado" };
    }

    if (!channel.isPrivate || !channel.password) {
      return { valid: true, channel };
    }

    if (channel.password === args.password) {
      return { valid: true, channel };
    }

    return { valid: false, reason: "Contraseña incorrecta" };
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
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("slug"), args.channelSlug))
      .first();

    if (!channel) {
      return { valid: false, reason: "Canal no encontrado" };
    }

    if (!channel.isPrivate || !channel.password) {
      return { valid: true, channel };
    }

    if (channel.password === args.password) {
      return { valid: true, channel };
    }

    return { valid: false, reason: "Contraseña incorrecta" };
  },
});

export const getServerStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get all chat messages
    const allMessages = await ctx.db.query("chat").collect();
    
    // Get today's messages
    const todayMessages = allMessages.filter(m => m.createdAt >= oneDayAgo);
    
    // Get this week's messages
    const weekMessages = allMessages.filter(m => m.createdAt >= oneWeekAgo);

    // Get channels count
    const channels = await ctx.db.query("chatChannels").collect();

    // Get unique users in last 24h
    const uniqueUsers = new Set(todayMessages.map(m => m.userId));

    // Estimate storage (rough estimate based on message count)
    // Average message ~500 bytes, plus overhead
    const estimatedStorageKB = allMessages.length * 0.5;

    return {
      totalMessages: allMessages.length,
      todayMessages: todayMessages.length,
      weekMessages: weekMessages.length,
      totalChannels: channels.length,
      activeUsers: uniqueUsers.size,
      estimatedStorageKB: Math.round(estimatedStorageKB),
      storagePercentage: Math.min(100, Math.round((estimatedStorageKB / 5000) * 100)), // 5MB = 100%
    };
  },
});

export const getMessagesByChannel = query({
  args: {
    channelId: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const channelId = args.channelId || "global";

    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as Id<"chat">);
      if (!cursorDoc || !("createdAt" in cursorDoc)) {
        return { messages: [], nextCursor: null, hasMore: false };
      }
      const cursorTime = cursorDoc.createdAt;
      const messages = await ctx.db
        .query("chat")
        .withIndex("by_channel")
        .filter((q) => q.eq(q.field("channelId"), channelId))
        .filter((q) => q.lt(q.field("createdAt"), cursorTime))
        .order("desc")
        .take(limit + 1);
      
      const hasMore = messages.length > limit;
      const resultMessages = hasMore ? messages.slice(0, limit) : messages;
      const nextCursor = hasMore && resultMessages.length > 0 
        ? resultMessages[resultMessages.length - 1]._id 
        : null;
      
      return { 
        messages: resultMessages.reverse(), 
        nextCursor, 
        hasMore 
      };
    }

    const messages = await ctx.db
      .query("chat")
      .withIndex("by_channel")
      .filter((q) => q.eq(q.field("channelId"), channelId))
      .order("desc")
      .take(limit + 1);
    
    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore && resultMessages.length > 0 
      ? resultMessages[resultMessages.length - 1]._id 
      : null;
    
    return { 
      messages: resultMessages.reverse(), 
      nextCursor, 
      hasMore 
    };
  },
});

export const getLatestMessages = query({
  args: {
    channelId: v.optional(v.string()),
    afterTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const channelId = args.channelId || "global";
    const afterTimestamp = args.afterTimestamp || 0;
    
    const messages = await ctx.db
      .query("chat")
      .withIndex("by_channel")
      .filter((q) => q.eq(q.field("channelId"), channelId))
      .filter((q) => q.gt(q.field("createdAt"), afterTimestamp))
      .order("asc")
      .collect();
    
    return messages;
  },
});

export const getTypingUsers = query({
  args: {
    channelId: v.string(),
    excludeUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const typingUsers = await ctx.db
      .query("chatTyping")
      .withIndex("by_channel")
      .filter((q) => q.eq(q.field("channelId"), args.channelId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .filter((q) => q.neq(q.field("userId"), args.excludeUserId))
      .collect();

    return typingUsers.map(t => t.nombre || t.userId);
  },
});

export const setTyping = mutation({
  args: {
    channelId: v.string(),
    userId: v.string(),
    nombre: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 3000;

    const existing = await ctx.db
      .query("chatTyping")
      .withIndex("by_channel_user")
      .filter((q) => q.eq(q.field("channelId"), args.channelId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt, nombre: args.nombre });
    } else {
      await ctx.db.insert("chatTyping", {
        channelId: args.channelId,
        userId: args.userId,
        expiresAt,
        nombre: args.nombre,
      });
    }
  },
});

export const getMessages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 15; // Default to 15 messages for responsiveness
    
    // Only return recent messages
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const messages = await ctx.db
      .query("chat")
      .withIndex("by_createdAt")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .order("desc") // Get newest first
      .take(limit);
      
    return messages.reverse(); // Reverse back to chronological order
  },
});

export const sendMessage = mutation({
  args: {
    userId: v.string(),
    nombre: v.string(),
    avatar: v.string(),
    texto: v.string(),
    imagenUrl: v.optional(v.string()),
    isAi: v.optional(v.boolean()),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId || !args.nombre) {
      throw new Error("Datos de usuario inválidos");
    }
    
    const ts = Date.now();
    const channelId = args.channelId || "global";
    
    if (!args.isAi) {
      const rateLimit = await checkRateLimit(ctx, args.userId, "sendMessage");
      if (!rateLimit) {
        throw new Error("Límite de mensajes excedido para tu tier. Upgrade a PRO para más mensajes.");
      }

      const simpleModeration = moderateMessage(args.texto, []);
      if (!simpleModeration.isAllowed) {
        await ctx.db.insert("moderationLogs", {
          moderatorId: "system",
          action: "chat_blocked",
          contentType: "comment",
          contentId: "",
          reason: `${simpleModeration.reason} - Severity: ${simpleModeration.severity}`,
          createdAt: ts,
        });
        throw new Error(simpleModeration.reason || "Contenido no permitido");
      }

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentMessages = await ctx.db
        .query("chat")
        .withIndex("by_channel")
        .filter((q) => q.eq(q.field("channelId"), channelId))
        .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
        .collect();
        
      const userMessageCount = recentMessages.filter(m => m.userId === args.userId).length;
      const spamScore = calculateSpamScore(args.texto);
      
      if (spamScore >= 70) {
        const spamWarnings = [
          "Tu mensaje parece spam. Evita repetir caracteres o escribir todo en mayúsculas.",
          "¿Es eso un mensaje repetitivo? Intenta escribir algo único e interesante.",
          "¡Hey! No queremos spam aquí. Cuéntanos algo que realmente quieras decir."
        ];
        const warning = spamWarnings[Math.floor(Math.random() * spamWarnings.length)];
        await ctx.db.insert("chat", {
          userId: "ai_moderator",
          nombre: "TradeAIA",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TradeAIA&backgroundColor=b6e3f4",
          texto: `👋 @${args.nombre}, ${warning}`,
          isAi: true,
          channelId,
          createdAt: ts + 150,
        });
      }
      
      if (userMessageCount === 0) {
        const greetings = [
          `¡Qué bueno verte por aquí @${args.nombre}! 👋 Disfruta el stream.`,
          `¡Bienvenido @${args.nombre}! ✨ Estamos atentos a tus consultas.`,
          `Hola @${args.nombre}, 📈 el análisis está por ponerse interesante.`
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        await ctx.db.insert("chat", {
          userId: "ai_moderator",
          nombre: "TradeAIA",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TradeAIA&backgroundColor=b6e3f4",
          texto: randomGreeting,
          isAi: true,
          channelId,
          createdAt: ts + 100,
        });
      }

      const moderationResult = filterMessage(args.texto);
      const warningMessage = getModerationWarning(moderationResult);
      
      if (!moderationResult.clean) {
        await ctx.db.insert("moderationLogs", {
          moderatorId: "system",
          action: "chat_flagged",
          contentType: "comment",
          contentId: "",
          reason: `Flagged: ${[...moderationResult.blockedWords, ...moderationResult.suspiciousUrls, ...moderationResult.scamPatterns].join(", ") || "spam"}`,
          createdAt: ts,
        });
        const warning = warningMessage || "Tu mensaje fue marcado por contener contenido inapropiado. ¡Gracias por mantener el orden! ✨";
        await ctx.db.insert("chat", {
          userId: "ai_moderator",
          nombre: "TradeAIA",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TradeAIA&backgroundColor=b6e3f4",
          texto: `👋 Hola @${args.nombre}, ${warning}`,
          isAi: true,
          channelId,
          createdAt: ts + 200,
        });
      }
      
      await ctx.db.insert("chat", {
        userId: args.userId,
        nombre: args.nombre,
        avatar: args.avatar,
        texto: moderationResult.censored,
        imagenUrl: args.imagenUrl,
        isAi: args.isAi,
        flagged: !moderationResult.clean,
        flaggedWords: [...moderationResult.blockedWords, ...moderationResult.suspiciousUrls, ...moderationResult.scamPatterns],
        channelId,
        createdAt: ts,
      });

      await addXpInternal(ctx, args.userId, "chat_message");
      
      return { 
        success: true, 
        flagged: !moderationResult.clean, 
        blockedWords: moderationResult.blockedWords,
        suspiciousUrls: moderationResult.suspiciousUrls,
        scamPatterns: moderationResult.scamPatterns,
        spamScore: moderationResult.spamScore,
        warning: warningMessage
      };
    }

    await ctx.db.insert("chat", {
      userId: args.userId,
      nombre: args.nombre,
      avatar: args.avatar,
      texto: args.texto,
      imagenUrl: args.imagenUrl,
      isAi: args.isAi,
      channelId,
      createdAt: ts,
    });

    return { success: true };
  },
});
