// convex/schema.ts — AGREGAR ESTOS ÍNDICES A TU SCHEMA EXISTENTE
// (solo los que son necesarios para auth.ts y posts.ts)
// Buscá cada tabla en tu schema y agregá los índices que falten.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── ÍNDICES REQUERIDOS POR MÓDULO ───────────────────────────────────────────
//
// profiles:
//   .index("by_email", ["email"])
//   .index("by_usuario", ["usuario"])
//
// posts:
//   .index("by_user", ["userId"])
//   .index("by_status_createdAt", ["status", "createdAt"])
//   .index("by_subcommunity", ["subcommunityId"])
//
// communityPosts:
//   .index("by_community", ["communityId"])
//   .index("by_community_user", ["communityId", "userId"])
//
// communityMembers:
//   .index("by_community_user", ["communityId", "userId"])
//
// subcommunityMembers:
//   .index("by_subcommunity_user", ["subcommunityId", "userId"])
//
// referralCodes:
//   .index("by_code", ["code"])
//
// notifications:
//   .index("by_user", ["userId"])
//   .index("by_user_read", ["userId", "read"])
//
// ─────────────────────────────────────────────────────────────────────────────

// EJEMPLO MÍNIMO — reemplazá o integrá en tu schema.ts existente:
export default defineSchema({
  profiles: defineTable({
    email: v.string(),
    password: v.string(),
    nombre: v.string(),
    usuario: v.string(),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    esPro: v.boolean(),
    esVerificado: v.boolean(),
    rol: v.string(),
    role: v.number(),
    xp: v.number(),
    level: v.number(),
    biografia: v.optional(v.string()),
    instagram: v.optional(v.string()),
    seguidores: v.array(v.string()),
    siguiendo: v.array(v.string()),
    aportes: v.number(),
    accuracy: v.optional(v.number()),
    reputation: v.optional(v.number()),
    badges: v.array(v.string()),
    estadisticas: v.optional(v.any()),
    saldo: v.number(),
    watchlist: v.optional(v.array(v.string())),
    watchedClasses: v.optional(v.array(v.string())),
    Medellas: v.optional(v.array(v.string())),
    progreso: v.optional(v.any()),
    fechaRegistro: v.number(),
    diasActivos: v.number(),
    ultimoLogin: v.number(),
    status: v.string(),
    referredBy: v.optional(v.any()),
    streakDays: v.number(),
    isBlocked: v.boolean(),
    avatarFrame: v.optional(v.any()),
    streakReward: v.optional(v.any()),
    weeklyXP: v.optional(v.number()),
    monthlyXP: v.optional(v.number()),
    userNumber: v.number(),
    phone: v.optional(v.any()),
    whatsappOptIn: v.optional(v.boolean()),
    ultimaInteraccion: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_usuario", ["usuario"])
    .index("by_role", ["role"]),

  posts: defineTable({
    userId: v.string(),
    titulo: v.optional(v.string()),
    par: v.optional(v.string()),
    tipo: v.string(),
    contenido: v.string(),
    categoria: v.optional(v.string()),
    esAnuncio: v.boolean(),
    datosGrafico: v.optional(v.array(v.any())),
    tradingViewUrl: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    zonaOperativa: v.optional(v.string()),
    likes: v.array(v.string()),
    comentarios: v.array(v.any()),
    tags: v.array(v.string()),
    reputationSnapshot: v.optional(v.number()),
    badgesSnapshot: v.optional(v.array(v.string())),
    ratings: v.optional(v.array(v.any())),
    encuesta: v.optional(v.any()),
    compartidos: v.number(),
    comentariosCerrados: v.boolean(),
    isAiAgent: v.boolean(),
    isSignal: v.boolean(),
    signalDetails: v.optional(v.any()),
    sentiment: v.optional(v.string()),
    subcommunityId: v.optional(v.any()),
    createdAt: v.number(),
    ultimaInteraccion: v.optional(v.number()),
    status: v.string(),
    avatarFrame: v.optional(v.any()),
    puntos: v.optional(v.number()),
    tokenTipsReceived: v.optional(v.number()),
    tokenTipsCount: v.optional(v.number()),
    monthlyTokenTips: v.optional(v.number()),
    monthKey: v.optional(v.string()),
    isTopMonthly: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_status_createdAt", ["status", "createdAt"])
    .index("by_subcommunity", ["subcommunityId"]),

  communityPosts: defineTable({
    communityId: v.string(),
    userId: v.string(),
    titulo: v.optional(v.string()),
    contenido: v.string(),
    imagenUrl: v.optional(v.string()),
    tipo: v.string(),
    likes: v.array(v.string()),
    commentsCount: v.number(),
    isPinned: v.boolean(),
    isLocked: v.boolean(),
    tags: v.array(v.string()),
    encuesta: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.string(),
  })
    .index("by_community", ["communityId"])
    .index("by_community_user", ["communityId", "userId"]),

  communityMembers: defineTable({
    communityId: v.string(),
    userId: v.string(),
    role: v.string(),
    subscriptionStatus: v.optional(v.string()),
    joinedAt: v.number(),
  }).index("by_community_user", ["communityId", "userId"]),

  subcommunityMembers: defineTable({
    subcommunityId: v.string(),
    userId: v.string(),
    role: v.string(),
    joinedAt: v.number(),
  }).index("by_subcommunity_user", ["subcommunityId", "userId"]),

  referralCodes: defineTable({
    userId: v.string(),
    code: v.string(),
    uses: v.number(),
    maxUses: v.optional(v.number()),
    rewardXp: v.number(),
    rewardDays: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

  referrals: defineTable({
    referrerId: v.string(),
    referredId: v.string(),
    referralCode: v.string(),
    status: v.string(),
    rewardType: v.string(),
    referrerReward: v.number(),
    referredReward: v.number(),
    referrerClaimed: v.boolean(),
    referredClaimed: v.boolean(),
    claimedAt: v.optional(v.any()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    read: v.boolean(),
    link: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),
});
