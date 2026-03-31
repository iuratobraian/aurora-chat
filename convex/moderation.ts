import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import logger from "./logger";

const USER_LIMITS = {
  postsPerHour: 5,
  postsPerDay: 20,
  commentsPerHour: 30,
  commentsPerDay: 100,
  likesPerHour: 100,
  likesPerDay: 500,
};

const DEFAULT_BLOCKED_WORDS = [
  "spam", "estafa", "scam", "hack", "hacker", "robo", "virus", "malware",
  "free money", "ganar dinero rapido", "inversion segura", "trading garantia",
  "onlyfans", "telegram hack", "whatsapp hack", "instagram hack", "bitcoin giveaway",
  "crypto giveaway", "airdrop gratis", "envía eth", "envía btc",
];

const SUSPICIOUS_PATTERNS = [
  /https?:\/\/[^\s]*\.(ru|cn|tk|ml|ga|cf|gq)\//i,
  /bit\.ly|goo\.gl|tinyurl|t\.co/i,
  /\b(free|gratis|win|gana|premio|premios)\b.*\b(download|descarga|click|link)\b/i,
  /\b(make money|earn money|money making)\b/i,
  /\b(buy now|order now|limited time|act now)\b/i,
  /[A-Z]{5,}/g,
];

const SPAM_PATTERNS = [
  /(.)\1{4,}/g,
  /!{3,}/g,
  /\?{3,}/g,
  /\${3,}/g,
  /https?:\/\/[^\s]{50,}/g,
];

interface SpamCheckResult {
  isSpam: boolean;
  isPending: boolean;
  reason: string;
  severity: "low" | "medium" | "high";
  matchedPatterns: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ");
}

function checkBlockedWords(content: string, blockedWords: string[]): string[] {
  const normalized = normalizeText(content);
  return blockedWords.filter(word => normalized.includes(word.toLowerCase()));
}

function checkSuspiciousLinks(content: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(content));
}

function checkSpamPatterns(content: string): string[] {
  const matchedPatterns: string[] = [];
  
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
    }
  }
  
  return matchedPatterns;
}

function checkCapsRatio(content: string): boolean {
  const letters = content.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 10) return false;
  const upperCount = letters.replace(/[^A-Z]/g, "").length;
  return upperCount / letters.length > 0.7;
}

function checkRepetitiveContent(content: string): boolean {
  const words = content.toLowerCase().split(/\s+/);
  if (words.length < 5) return false;
  
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  const maxRepeat = Math.max(...wordCounts.values());
  return maxRepeat / words.length > 0.4;
}

export async function checkSpam(
  ctx: any,
  content: string,
  userId: string,
  contentType: "post" | "comment"
): Promise<SpamCheckResult> {
  const matchedPatterns: string[] = [];
  let severity: "low" | "medium" | "high" = "low";
  
  const config = await ctx.db
    .query("moderationConfig")
    .withIndex("by_key", (q: any) => q.eq("key", "blockedWords"))
    .first();
  
  const blockedWords = config?.value || DEFAULT_BLOCKED_WORDS;
  
  const foundBlockedWords = checkBlockedWords(content, blockedWords);
  if (foundBlockedWords.length > 0) {
    matchedPatterns.push(...foundBlockedWords);
    severity = "high";
  }
  
  if (checkSuspiciousLinks(content)) {
    matchedPatterns.push("suspicious_link");
    severity = "high";
  }
  
  const spamPatterns = checkSpamPatterns(content);
  if (spamPatterns.length > 0) {
    matchedPatterns.push(...spamPatterns);
    severity = severity === "high" ? "high" : "medium";
  }
  
  if (checkCapsRatio(content)) {
    matchedPatterns.push("excessive_caps");
    severity = severity === "high" ? "high" : "medium";
  }
  
  if (checkRepetitiveContent(content)) {
    matchedPatterns.push("repetitive_content");
    severity = severity === "high" ? "high" : "medium";
  }
  
  const isWhitelisted = await checkWhitelist(ctx, userId);
  if (isWhitelisted) {
    return {
      isSpam: false,
      isPending: false,
      reason: "",
      severity: "low",
      matchedPatterns: [],
    };
  }
  
  const isSpam = matchedPatterns.length > 0;
  const isPending = severity === "high" && isSpam;
  
  return {
    isSpam,
    isPending,
    reason: matchedPatterns.join(", "),
    severity,
    matchedPatterns,
  };
}

async function checkWhitelist(ctx: any, userId: string): Promise<boolean> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  
  if (profile?.role && profile.role >= 4) return true;
  if (profile?.esVerificado) return true;
  
  const whitelistConfig = await ctx.db
    .query("moderationConfig")
    .withIndex("by_key", (q: any) => q.eq("key", "whitelist"))
    .first();
  
  const whitelist: string[] = whitelistConfig?.value || [];
  return whitelist.includes(userId);
}

export async function checkUserRateLimit(
  ctx: any,
  userId: string,
  action: "post" | "comment" | "like"
): Promise<{ allowed: boolean; reason?: string; limit?: number }> {
  const isWhitelisted = await checkWhitelist(ctx, userId);
  if (isWhitelisted) {
    return { allowed: true };
  }
  
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  
  const isPro = profile?.esPro || profile?.role === 2 || profile?.role === 3;
  
  let limits = USER_LIMITS;
  if (isPro) {
    limits = {
      postsPerHour: 10,
      postsPerDay: 40,
      commentsPerHour: 60,
      commentsPerDay: 200,
      likesPerHour: 200,
      likesPerDay: 1000,
    };
  }
  
  if (action === "post") {
    const hourLimit = limits.postsPerHour;
    const dayLimit = limits.postsPerDay;
    
    const hourPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();
    
    if (hourPosts.length >= hourLimit) {
      return { allowed: false, reason: `Límite de ${hourLimit} posts por hora excedido`, limit: hourLimit };
    }
    
    const dayPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();
    
    if (dayPosts.length >= dayLimit) {
      return { allowed: false, reason: `Límite de ${dayLimit} posts por día excedido`, limit: dayLimit };
    }
  }
  
  if (action === "like") {
    const hourLimit = limits.likesPerHour;
    const dayLimit = limits.likesPerDay;
    
    const hourLikes = await ctx.db
      .query("posts")
      .collect();
    
    let hourLikeCount = 0;
    for (const post of hourLikes) {
      const likes = post.likes || [];
      const recentLikes = likes.filter((uid: string) => {
        return likes.indexOf(uid) !== -1;
      });
      hourLikeCount += recentLikes.length;
    }
    
    if (hourLikeCount >= hourLimit) {
      return { allowed: false, reason: `Límite de ${hourLimit} likes por hora excedido`, limit: hourLimit };
    }
  }
  
  return { allowed: true };
}

export const getSpamReports = query({
  args: {
    status: v.optional(v.union(v.literal('pending'), v.literal('reviewed'), v.literal('dismissed'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let reports;
    if (args.status) {
      reports = await ctx.db
        .query("spamReports")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .order("desc")
        .take(limit);
    } else {
      reports = await ctx.db
        .query("spamReports")
        .order("desc")
        .take(limit);
    }
    
    const reportsWithUsers = await Promise.all(
      reports.map(async (report) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", report.userId))
          .first();
        
        let content = null;
        if (report.contentType === "post") {
          const post = await ctx.db
            .query("posts")
            .filter((q: any) => q.eq(q.field("_id"), report.contentId))
            .first();
          if (post) {
            content = { titulo: post.titulo, contenido: post.contenido, status: post.status };
          }
        }
        
        return {
          ...report,
          userProfile: profile ? { nombre: profile.nombre, usuario: profile.usuario, avatar: profile.avatar } : null,
          content,
        };
      })
    );
    
    return reportsWithUsers;
  },
});

export const reportContent = mutation({
  args: {
    userId: v.string(),
    contentId: v.string(),
    content: v.string(),
    reason: v.string(),
    contentType: v.union(v.literal('post'), v.literal('comment')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existingReport = await ctx.db
      .query("spamReports")
      .withIndex("by_contentId", (q: any) => q.eq("contentId", args.contentId))
      .filter((q: any) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existingReport) {
      throw new Error("Ya has reportado este contenido");
    }
    
    await ctx.db.insert("spamReports", {
      userId: args.userId,
      contentId: args.contentId,
      content: args.content.substring(0, 500),
      reason: args.reason,
      contentType: args.contentType,
      createdAt: now,
      status: "pending",
      reporterId: args.userId,
    });
    
    return { success: true };
  },
});

export const moderateContent = mutation({
  args: {
    contentId: v.string(),
    contentType: v.union(v.literal('post'), v.literal('comment')),
    action: v.union(v.literal('approve'), v.literal('reject'), v.literal('delete'), v.literal('dismiss')),
    moderatorId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 4) {
      throw new Error("No tienes permisos de moderación");
    }
    
    const now = Date.now();
    let affectedUserId: string | null = null;
    
    if (args.contentType === "post") {
      const post = await ctx.db
        .query("posts")
        .filter((q: any) => q.eq(q.field("_id"), args.contentId))
        .first();
      
      if (post) {
        affectedUserId = post.userId;
        if (args.action === "delete") {
          await ctx.db.patch(post._id, { status: "trash" });
        } else if (args.action === "reject") {
          await ctx.db.patch(post._id, { status: "pending_review" });
        }
      }
    }
    
    const reports = await ctx.db
      .query("spamReports")
      .withIndex("by_contentId", (q: any) => q.eq("contentId", args.contentId))
      .collect();
    
    for (const report of reports) {
      await ctx.db.patch(report._id, {
        status: args.action === "dismiss" ? "dismissed" : "reviewed",
        moderatorId: args.moderatorId,
        action: args.action,
        notes: args.notes,
        resolvedAt: now,
      });
    }
    
    await ctx.db.insert("moderationLogs", {
      moderatorId: args.moderatorId,
      action: args.action,
      contentType: args.contentType,
      contentId: args.contentId,
      reason: args.notes || "",
      createdAt: now,
    });

    if (affectedUserId && args.action !== "dismiss" && args.action !== "approve") {
      const actionMessages: Record<string, { title: string; body: string }> = {
        delete: {
          title: "Contenido eliminado",
          body: "Tu publicación ha sido eliminada por violar las normas de la comunidad.",
        },
        reject: {
          title: "Contenido rechazado",
          body: "Tu publicación ha sido rechazada y no será visible hasta que sea revisada.",
        },
      };
      
      const msg = actionMessages[args.action];
      if (msg) {
        await ctx.db.insert("notifications", {
          userId: affectedUserId,
          type: "system",
          title: msg.title,
          body: msg.body,
          read: false,
          createdAt: now,
        });
        
        ctx.scheduler.runAfter(0, api.pushActions.sendPushNotification, {
          userId: affectedUserId,
          title: msg.title,
          body: msg.body,
          url: "/posts",
          type: "system",
        });
      }
    }
    
    return { success: true };
  },
});

export const bulkModerate = mutation({
  args: {
    contentIds: v.array(v.string()),
    contentType: v.union(v.literal('post'), v.literal('comment')),
    action: v.union(v.literal('approve'), v.literal('reject'), v.literal('delete'), v.literal('dismiss')),
    moderatorId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 5) {
      throw new Error("Solo administradores pueden realizar acciones masivas");
    }
    
    const now = Date.now();
    let processed = 0;
    
    for (const contentId of args.contentIds) {
      try {
        if (args.contentType === "post") {
          const post = await ctx.db
            .query("posts")
            .filter((q: any) => q.eq(q.field("_id"), contentId))
            .first();
          
          if (post) {
            if (args.action === "delete") {
              await ctx.db.patch(post._id, { status: "trash" });
            } else if (args.action === "reject") {
              await ctx.db.patch(post._id, { status: "pending_review" });
            } else if (args.action === "approve") {
              await ctx.db.patch(post._id, { status: "active" });
            }
          }
        }
        
        const reports = await ctx.db
          .query("spamReports")
          .withIndex("by_contentId", (q: any) => q.eq("contentId", contentId))
          .collect();
        
        for (const report of reports) {
          await ctx.db.patch(report._id, {
            status: args.action === "dismiss" ? "dismissed" : "reviewed",
            moderatorId: args.moderatorId,
            action: args.action,
            notes: args.notes,
          });
        }
        
        await ctx.db.insert("moderationLogs", {
          moderatorId: args.moderatorId,
          action: args.action,
          contentType: args.contentType,
          contentId,
          reason: args.notes || "Bulk action",
          createdAt: now,
        });
        
        processed++;
      } catch (e) {
        logger.error(`Error moderating content ${contentId}:`, e);
      }
    }
    
    return { success: true, processed };
  },
});

export const getAutoModerationStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const allReports = await ctx.db.query("spamReports").collect();
    
    const pendingReports = allReports.filter(r => r.status === "pending");
    const reviewedReports = allReports.filter(r => r.status === "reviewed");
    const dismissedReports = allReports.filter(r => r.status === "dismissed");
    
    const recentReports = allReports.filter(r => r.createdAt >= oneDayAgo);
    const weekReports = allReports.filter(r => r.createdAt >= sevenDaysAgo);
    
    const posts = await ctx.db.query("posts").collect();
    const dayPosts = posts.filter(p => p.createdAt >= oneDayAgo);
    const weekPosts = posts.filter(p => p.createdAt >= sevenDaysAgo);
    
    const flaggedPosts = posts.filter(p => (p as any).status === "pending_review");
    
    const allLogs = await ctx.db.query("moderationLogs").collect();
    const recentLogs = allLogs.filter(l => l.createdAt >= oneDayAgo);
    
    const moderatorActions = new Map<string, number>();
    for (const log of recentLogs) {
      moderatorActions.set(log.moderatorId, (moderatorActions.get(log.moderatorId) || 0) + 1);
    }
    
    const topModerators = Array.from(moderatorActions.entries())
      .map(([moderatorId, count]) => ({ moderatorId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const spamReasons = new Map<string, number>();
    for (const report of recentReports) {
      spamReasons.set(report.reason, (spamReasons.get(report.reason) || 0) + 1);
    }
    
    return {
      reports: {
        total: allReports.length,
        pending: pendingReports.length,
        reviewed: reviewedReports.length,
        dismissed: dismissedReports.length,
        today: recentReports.length,
        thisWeek: weekReports.length,
      },
      posts: {
        total: posts.length,
        createdToday: dayPosts.length,
        createdThisWeek: weekPosts.length,
        flagged: flaggedPosts.length,
      },
      moderation: {
        actionsToday: recentLogs.length,
        topModerators,
      },
      topReasons: Array.from(spamReasons.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  },
});

export const updateBlockedWords = mutation({
  args: {
    moderatorId: v.string(),
    words: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 5) {
      throw new Error("Solo administradores pueden modificar la configuración");
    }
    
    const existing = await ctx.db
      .query("moderationConfig")
      .withIndex("by_key", (q: any) => q.eq("key", "blockedWords"))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.words,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("moderationConfig", {
        key: "blockedWords",
        type: "blockedWords",
        value: args.words,
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

export const updateWhitelist = mutation({
  args: {
    moderatorId: v.string(),
    userIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 5) {
      throw new Error("Solo administradores pueden modificar la whitelist");
    }
    
    const existing = await ctx.db
      .query("moderationConfig")
      .withIndex("by_key", (q: any) => q.eq("key", "whitelist"))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.userIds,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("moderationConfig", {
        key: "whitelist",
        type: "whitelist",
        value: args.userIds,
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

export const getModerationConfig = query({
  args: {},
  handler: async (ctx) => {
    const blockedWordsConfig = await ctx.db
      .query("moderationConfig")
      .withIndex("by_key", (q: any) => q.eq("key", "blockedWords"))
      .first();
    
    const whitelistConfig = await ctx.db
      .query("moderationConfig")
      .withIndex("by_key", (q: any) => q.eq("key", "whitelist"))
      .first();
    
    return {
      blockedWords: blockedWordsConfig?.value || DEFAULT_BLOCKED_WORDS,
      whitelist: whitelistConfig?.value || [],
    };
  },
});

export const getModerationLogs = query({
  args: {
    moderatorId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    let logs;
    if (args.moderatorId) {
      logs = await ctx.db
        .query("moderationLogs")
        .withIndex("by_moderator", (q: any) => q.eq("moderatorId", args.moderatorId))
        .order("desc")
        .take(limit);
    } else {
      logs = await ctx.db
        .query("moderationLogs")
        .withIndex("by_createdAt")
        .order("desc")
        .take(limit);
    }
    
    const logsWithModerators = await Promise.all(
      logs.map(async (log) => {
        const moderator = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", log.moderatorId))
          .first();
        
        return {
          ...log,
          moderatorName: moderator?.nombre || "Unknown",
          moderatorUsuario: moderator?.usuario || "unknown",
        };
      })
    );
    
    return logsWithModerators;
  },
});

export const addToWhitelist = mutation({
  args: {
    moderatorId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 4) {
      throw new Error("No tienes permisos de moderación");
    }
    
    const existing = await ctx.db
      .query("moderationConfig")
      .withIndex("by_key", (q: any) => q.eq("key", "whitelist"))
      .first();
    
    const currentList: string[] = existing?.value || [];
    
    if (!currentList.includes(args.userId)) {
      const newList = [...currentList, args.userId];
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          value: newList,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("moderationConfig", {
          key: "whitelist",
          type: "whitelist",
          value: newList,
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});

export const removeFromWhitelist = mutation({
  args: {
    moderatorId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 4) {
      throw new Error("No tienes permisos de moderación");
    }
    
    const existing = await ctx.db
      .query("moderationConfig")
      .withIndex("by_key", (q: any) => q.eq("key", "whitelist"))
      .first();
    
    if (existing) {
      const currentList: string[] = existing.value || [];
      const newList = currentList.filter(id => id !== args.userId);
      
      await ctx.db.patch(existing._id, {
        value: newList,
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

export const suspendUser = mutation({
  args: {
    moderatorId: v.string(),
    userId: v.string(),
    reason: v.string(),
    duration: v.optional(v.union(v.literal('1day'), v.literal('7days'), v.literal('30days'), v.literal('permanent'))),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 5) {
      throw new Error("Solo administradores pueden suspender usuarios");
    }
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("Usuario no encontrado");
    }
    
    if ((profile.role || 0) >= moderator.role!) {
      throw new Error("No puedes suspender a un usuario con el mismo o mayor rol");
    }
    
    const now = Date.now();
    let suspensionEnd: number | undefined;
    
    if (args.duration === '1day') {
      suspensionEnd = now + 24 * 60 * 60 * 1000;
    } else if (args.duration === '7days') {
      suspensionEnd = now + 7 * 24 * 60 * 60 * 1000;
    } else if (args.duration === '30days') {
      suspensionEnd = now + 30 * 24 * 60 * 60 * 1000;
    }
    
    await ctx.db.patch(profile._id, {
      status: args.duration === 'permanent' ? 'suspended' : 'active',
    });
    
    await ctx.db.insert("moderationLogs", {
      moderatorId: args.moderatorId,
      action: 'suspend',
      contentType: 'user',
      contentId: args.userId,
      reason: args.reason,
      previousStatus: profile.status || 'active',
      newStatus: args.duration === 'permanent' ? 'suspended' : `suspended_until_${suspensionEnd}`,
      createdAt: now,
    });
    
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: "Cuenta suspendida",
      body: args.duration === 'permanent' 
        ? `Tu cuenta ha sido suspendida permanentemente. Razón: ${args.reason}`
        : `Tu cuenta ha sido suspendida por ${args.duration}. Razón: ${args.reason}`,
      read: false,
      createdAt: now,
    });
    
    ctx.scheduler.runAfter(0, api.pushActions.sendPushNotification, {
      userId: args.userId,
      title: "Cuenta suspendida",
      body: args.duration === 'permanent' 
        ? `Tu cuenta ha sido suspendida permanentemente. Razón: ${args.reason}`
        : `Tu cuenta ha sido suspendida por ${args.duration}. Razón: ${args.reason}`,
      url: "/profile",
      type: "system",
    });
    
    return { success: true };
  },
});

export const unsuspendUser = mutation({
  args: {
    moderatorId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.moderatorId))
      .first();
    
    if (!moderator || (moderator.role || 0) < 5) {
      throw new Error("Solo administradores pueden levantar suspensiones");
    }
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("Usuario no encontrado");
    }
    
    await ctx.db.patch(profile._id, {
      status: 'active',
    });
    
    await ctx.db.insert("moderationLogs", {
      moderatorId: args.moderatorId,
      action: 'unsuspend',
      contentType: 'user',
      contentId: args.userId,
      reason: 'Suspensión levantada',
      previousStatus: profile.status,
      newStatus: 'active',
      createdAt: Date.now(),
    });
    
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: "Suspensión levantada",
      body: "Tu cuenta ha sido reactivada. Por favor, cumple con las normas de la comunidad.",
      read: false,
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

export const getSuspendedUsers = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .collect();
    
    const suspended = profiles.filter(p => p.status === 'suspended');
    
    return suspended.map(p => ({
      _id: p._id,
      userId: p.userId,
      nombre: p.nombre,
      usuario: p.usuario,
      email: p.email,
      role: p.role,
      fechaRegistro: p.fechaRegistro,
    }));
  },
});

export const getReportsByReason = query({
  args: {
    reason: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let reports;
    
    if (args.reason) {
      const allReports = await ctx.db
        .query("spamReports")
        .filter((q: any) => q.eq(q.field("reason"), args.reason))
        .order("desc")
        .take(limit);
      reports = allReports;
    } else {
      reports = await ctx.db
        .query("spamReports")
        .order("desc")
        .take(limit);
    }
    
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", report.reporterId || report.userId))
          .first();
        
        const affectedUser = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", report.userId))
          .first();
        
        return {
          ...report,
          reporterName: reporter?.nombre || 'Unknown',
          affectedUserName: affectedUser?.nombre || 'Unknown',
          affectedUserUsuario: affectedUser?.usuario || 'unknown',
        };
      })
    );
    
    return reportsWithDetails;
  },
});

export const getTopSpamReasons = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("spamReports")
      .collect();
    
    const reasonCounts = new Map<string, number>();
    
    for (const report of reports) {
      const count = reasonCounts.get(report.reason) || 0;
      reasonCounts.set(report.reason, count + 1);
    }
    
    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  },
});

export const autoModeratePost = internalMutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    contenido: v.string(),
  },
  handler: async (ctx, args) => {
    const spamCheck = await checkSpam(ctx, args.contenido, args.userId, "post");
    
    if (spamCheck.isPending) {
      await ctx.db.patch(args.postId, { status: "pending_review" });
      
      await ctx.db.insert("spamReports", {
        userId: args.userId,
        contentId: args.postId.toString(),
        content: args.contenido.substring(0, 500),
        reason: spamCheck.reason,
        contentType: "post",
        createdAt: Date.now(),
        status: "pending",
      });
    }
    
    return spamCheck;
  },
});
