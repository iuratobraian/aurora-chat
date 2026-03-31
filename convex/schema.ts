import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========================
  // SISTEMA DE AUDITORÍA ROBUSTO
  // ========================
  // Todas las tablas tienen campos de auditoría para recuperar información
  // NO se elimina información permanentemente - solo se marca como eliminada
  
  profiles: defineTable({
    // Campos principales
    userId: v.string(),
    nombre: v.string(),
    usuario: v.string(),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    esPro: v.boolean(),
    esVerificado: v.boolean(),
    rol: v.string(),
    experiencia: v.optional(v.string()), // 'beginner' | 'intermediate' | 'advanced'
    role: v.optional(v.number()), // 0=FREE, 1=PRO, 2=ELITE, 3=CREATOR, 4=MOD, 5=ADMIN, 6=SUPERADMIN
    xp: v.optional(v.number()), // Experience points
    level: v.optional(v.number()), // User level (default 1)
    email: v.string(),
    password: v.optional(v.string()), // Added for manual login verification
    biografia: v.optional(v.string()),
    instagram: v.optional(v.string()),
    seguidores: v.optional(v.array(v.string())),
    siguiendo: v.optional(v.array(v.string())),
    aportes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    reputation: v.optional(v.number()),
    badges: v.optional(v.array(v.string())),
    estadisticas: v.any(),
    saldo: v.optional(v.number()),
    dailyFreeCoinsBalance: v.optional(v.number()), // Monedas gratuitas diarias
    lastClaimDate: v.optional(v.string()), // Última fecha de reclamación (YYYY-MM-DD)
    watchlist: v.optional(v.array(v.string())),
    watchedClasses: v.optional(v.array(v.string())),
    Medellas: v.optional(v.array(v.any())),
    medals: v.optional(v.array(v.any())),
    medallas: v.optional(v.array(v.any())),
    progreso: v.optional(v.any()),
    fechaRegistro: v.string(),
    diasActivos: v.optional(v.number()), // Unique days logged in
    ultimoLogin: v.optional(v.string()), // Last day recorded (YYYY-MM-DD)
    status: v.optional(v.string()), // 'active' | 'banned' | 'deleted'
    referredBy: v.optional(v.string()), // Referral code used during signup
    streakDays: v.optional(v.number()), // Consecutive login days
    isBlocked: v.optional(v.boolean()), // Account blocked status
    avatarFrame: v.optional(v.string()), // Streak frame earned (e.g. streak_7_frame)
    streakReward: v.optional(v.string()), // Last reward title earned
    weeklyXP: v.optional(v.number()),
    weeklyXPResetAt: v.optional(v.number()),
    monthlyXP: v.optional(v.number()),
    monthlyXPResetAt: v.optional(v.number()),
    userNumber: v.optional(v.number()),
    phone: v.optional(v.string()),
    whatsappOptIn: v.optional(v.boolean()),
    // === CAMPOS DE AUDITORÍA (ROBUSTO) ===
    createdAt: v.optional(v.number()), // Timestamp de creación
    updatedAt: v.optional(v.number()), // Última actualización
    deletedAt: v.optional(v.number()), // Soft delete - NO se elimina, se marca
    deletedBy: v.optional(v.string()), //Quién lo eliminó (userId)
    deleteReason: v.optional(v.string()), // Razón de eliminación
    originalData: v.optional(v.any()), // Snapshot antes de eliminación (para recuperación)
    editHistory: v.optional(v.array(v.any())), // Historial de ediciones
  }).index("by_userId", ["userId"]).index("by_usuario", ["usuario"]).index("by_email", ["email"]).index("by_userNumber", ["userNumber"]).index("by_status", ["status"]).index("by_deletedAt", ["deletedAt"]).index("by_role", ["role"]).index("by_xp", ["xp"]).index("by_level", ["level"]),

  posts: defineTable({
    userId: v.string(),
    titulo: v.optional(v.string()),
    par: v.optional(v.string()),
    tipo: v.optional(v.string()),
    contenido: v.string(),
    categoria: v.string(),
    esAnuncio: v.boolean(),
    datosGrafico: v.optional(v.array(v.number())),
    tradingViewUrl: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    zonaOperativa: v.optional(v.any()),
    likes: v.array(v.string()),
    comentarios: v.array(v.any()),
    tags: v.optional(v.array(v.string())),
    reputationSnapshot: v.optional(v.number()),
    badgesSnapshot: v.optional(v.array(v.string())),
    ratings: v.optional(v.array(v.any())),
    encuesta: v.optional(v.any()),
    compartidos: v.optional(v.number()),
    comentariosCerrados: v.optional(v.boolean()),
    isAiAgent: v.optional(v.boolean()),
    isSignal: v.optional(v.boolean()),
    signalDetails: v.optional(v.any()), // entryPrice, stopLoss, takeProfits, direction
    sentiment: v.optional(v.string()),
    subcommunityId: v.optional(v.string()),
    createdAt: v.number(),
    ultimaInteraccion: v.optional(v.number()),
    status: v.optional(v.string()), // 'published' | 'draft' | 'trash' | 'deleted'
    avatarFrame: v.optional(v.string()),
    puntos: v.optional(v.number()), // Total points given to this post
    // Token reward system
    tokenTipsReceived: v.optional(v.number()), // Total tokens received
    tokenTipsCount: v.optional(v.number()), // Number of tippers
    monthlyTokenTips: v.optional(v.number()), // Tokens this month
    monthKey: v.optional(v.string()), // "2026-01" format
    isTopMonthly: v.optional(v.boolean()), // Flagged as top post
    // === CAMPOS DE AUDITORÍA (ROBUSTO) ===
    updatedAt: v.optional(v.number()), // Última actualización
    deletedAt: v.optional(v.number()), // Soft delete - NO se elimina permanentemente
    deletedBy: v.optional(v.string()), //Quién lo eliminó (userId)
    deleteReason: v.optional(v.string()), // Razón de eliminación
    originalData: v.optional(v.any()), // Snapshot antes de eliminación (para recuperación)
    editHistory: v.optional(v.array(v.any())), // Historial de ediciones
  }).index("by_createdAt", ["createdAt"]).index("by_userId", ["userId"]).index("by_status", ["status"]).index("by_status_createdAt", ["status", "createdAt"]).index("by_categoria", ["categoria"]).index("by_par", ["par"]).index("by_user_categoria", ["userId", "categoria"]).index("by_monthlyTokens", ["monthKey", "monthlyTokenTips"]).index("by_deletedAt", ["deletedAt"]),

  post_points: defineTable({
    postId: v.string(),
    userId: v.string(),
    points: v.number(),
    givenAt: v.number(),
  }).index("by_postId", ["postId"]).index("by_userId", ["userId"]).index("by_post_user", ["postId", "userId"]),

  ads: defineTable({
    titulo: v.string(),
    descripcion: v.string(),
    imagenUrl: v.string(),
    videoUrl: v.optional(v.string()),
    link: v.string(),
    sector: v.string(),
    activo: v.boolean(),
    subtitle: v.optional(v.string()),
    extra: v.optional(v.string()),
    contenido: v.optional(v.string()),
  }),

   notifications: defineTable({
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
       v.literal("puntos"),
       v.literal("payment")
     ),
     title: v.string(),
     body: v.string(),
     data: v.optional(v.any()),
     read: v.boolean(),
     link: v.optional(v.string()),
     avatarUrl: v.optional(v.string()),
     createdAt: v.number(),
   }).index("by_user", ["userId"])
     .index("by_user_read", ["userId", "read"])
     .index("by_user_created", ["userId", "createdAt"]),

  recursos: defineTable({
    userId: v.string(),
    titulo: v.string(),
    descripcion: v.string(),
    categoria: v.string(),
    plataforma: v.string(),
    precio: v.number(),
    descargas: v.number(),
    valoracion: v.number(),
    version: v.string(),
    tags: v.array(v.string()),
    likes: v.array(v.string()),
    comentarios: v.array(v.any()),
    archivoUrl: v.optional(v.string()),
    tradingViewUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_createdAt", ["createdAt"]),

  global_config: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  videos: defineTable({
    tipo: v.string(), // 'video' | 'pdf'
    titulo: v.string(),
    autor: v.string(),
    descripcion: v.string(),
    thumbnail: v.string(),
    embedUrl: v.string(),
    duracion: v.string(),
    categoria: v.string(),
    createdAt: v.number(),
  }).index("by_categoria", ["categoria"]).index("by_createdAt", ["createdAt"]),

  qa: defineTable({
    userId: v.string(),
    pregunta: v.string(),
    respuesta: v.optional(v.string()),
    respondida: v.boolean(),
    isAnonymous: v.boolean(),
    createdAt: v.number(),
    respondidaAt: v.optional(v.number()),
  }).index("by_respondida", ["respondida"]).index("by_createdAt", ["createdAt"]),

  chat: defineTable({
    userId: v.string(),
    nombre: v.string(),
    avatar: v.string(),
    texto: v.string(),
    imagenUrl: v.optional(v.string()),
    isAi: v.optional(v.boolean()),
    flagged: v.optional(v.boolean()),
    flaggedWords: v.optional(v.array(v.string())),
    channelId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]).index("by_channel", ["channelId", "createdAt"]).index("by_user", ["userId"]),

  chatChannels: defineTable({
    name: v.string(),
    slug: v.string(),
    type: v.union(v.literal("global"), v.literal("community"), v.literal("direct"), v.literal("subcommunity")),
    communityId: v.optional(v.id("communities")),
    participants: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_type", ["type"]).index("by_community", ["communityId"]),

  chatTyping: defineTable({
    channelId: v.string(),
    userId: v.string(),
    nombre: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_channel", ["channelId"]).index("by_channel_user", ["channelId", "userId"]),

  communities: defineTable({
    ownerId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    visibility: v.union(v.literal("public"), v.literal("unlisted"), v.literal("private")),
    accessType: v.union(v.literal("free"), v.literal("paid")),
    priceMonthly: v.optional(v.number()),
    maxMembers: v.number(),
    currentMembers: v.number(),
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("growth"), v.literal("scale"), v.literal("enterprise")),
    stripeAccountId: v.optional(v.string()),
    totalRevenue: v.number(),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    isPromoted: v.optional(v.boolean()),
    promotionPlan: v.optional(v.string()),
    promotionEndDate: v.optional(v.number()),
    isPortalExclusive: v.optional(v.boolean()), // Flag para excluir del feed global del Portal
    // === CAMPOS DE AUDITORÍA ===
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.string()),
    deleteReason: v.optional(v.string()),
    originalData: v.optional(v.any()),
  }).index("by_slug", ["slug"]).index("by_owner", ["ownerId"]).index("by_status", ["status"]).index("by_status_visibility", ["status", "visibility"]).index("by_currentMembers", ["currentMembers"]).index("by_deletedAt", ["deletedAt"]).index("by_isPortalExclusive", ["isPortalExclusive"]),

  communityMembers: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("moderator"), v.literal("member"), v.literal("pending")),
    subscriptionStatus: v.optional(v.string()),
    joinedAt: v.number()
  }).index("by_community", ["communityId"]).index("by_user", ["userId"]).index("by_community_user", ["communityId", "userId"]).index("by_subscriptionStatus", ["subscriptionStatus"]),

  achievements: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(v.literal('trading'), v.literal('social'), v.literal('learning'), v.literal('special')),
    points: v.number(),
    requirement: v.any(),
    rarity: v.union(v.literal('common'), v.literal('rare'), v.literal('epic'), v.literal('legendary')),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_category", ["category"]).index("by_active", ["isActive"]),

  userAchievements: defineTable({
    userId: v.string(),
    achievementId: v.string(),
    unlockedAt: v.number(),
    notifiedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_user_achievement", ["userId", "achievementId"]),

  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string()
    }),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_user", ["userId"]).index("by_endpoint", ["endpoint"]),

  communityReviews: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number()
  }).index("by_community", ["communityId"]).index("by_user_community", ["communityId", "userId"]),

  savedPosts: defineTable({
    userId: v.string(),
    postId: v.string(),
    createdAt: v.number()
  }).index("by_user", ["userId"]).index("by_user_post", ["userId", "postId"]).index("by_post", ["postId"]),

  rateLimits: defineTable({
    key: v.string(),
    userId: v.string(),
    action: v.string(),
    count: v.number(),
    resetAt: v.number()
  }).index("by_key", ["key"])
    .index("by_user", ["userId"]),

  backups: defineTable({
    itemId: v.string(),
    itemType: v.union(v.literal("post"), v.literal("profile"), v.literal("community"), v.literal("comment"), v.literal("system_export")),
    operation: v.union(v.literal("create"), v.literal("update"), v.literal("delete"), v.literal("restore")),
    previousData: v.optional(v.any()),
    newData: v.optional(v.any()),
    diff: v.optional(v.any()),
    userId: v.string(),
    reason: v.optional(v.string()),
    createdAt: v.number(),
    restored: v.optional(v.boolean()),
  }).index("by_item", ["itemType", "itemId"])
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  pendingSync: defineTable({
    operation: v.union(v.literal("create"), v.literal("update"), v.literal("delete")),
    itemType: v.string(),
    itemId: v.string(),
    data: v.any(),
    timestamp: v.number(),
    retries: v.number(),
    lastError: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"]),

  pendingPosts: defineTable({
    titulo: v.string(),
    contenido: v.string(),
    fuente: v.string(),
    categoria: v.string(),
    par: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    programedAt: v.number(),
    createdAt: v.number(),
    status: v.union(v.literal('pending'), v.literal('published'), v.literal('rejected')),
  }).index("by_status", ["status"]).index("by_programedAt", ["programedAt"]),

  aiAgentConfig: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    schedules: v.array(v.object({
      period: v.union(v.literal('morning'), v.literal('afternoon'), v.literal('evening')),
      hours: v.array(v.number()),
      enabled: v.boolean(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  spamReports: defineTable({
    userId: v.string(),
    reason: v.string(),
    content: v.string(),
    contentType: v.union(v.literal('post'), v.literal('comment')),
    contentId: v.string(),
    createdAt: v.number(),
    status: v.union(v.literal('pending'), v.literal('reviewed'), v.literal('dismissed')),
    reporterId: v.optional(v.string()),
    moderatorId: v.optional(v.string()),
    action: v.optional(v.string()),
    notes: v.optional(v.string()),
    severity: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    resolvedAt: v.optional(v.number()),
  }).index("by_status", ["status"]).index("by_contentId", ["contentId"]).index("by_user", ["userId"]).index("by_reporterId", ["reporterId"]).index("by_createdAt", ["createdAt"]),

  moderationConfig: defineTable({
    key: v.string(),
    type: v.union(v.literal('blockedWords'), v.literal('whitelist'), v.literal('settings')),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  moderationLogs: defineTable({
    moderatorId: v.string(),
    action: v.string(),
    contentType: v.union(v.literal('post'), v.literal('comment'), v.literal('user')),
    contentId: v.string(),
    reason: v.string(),
    previousStatus: v.optional(v.string()),
    newStatus: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_moderator", ["moderatorId"]).index("by_createdAt", ["createdAt"]),

  payments: defineTable({
    userId: v.string(),
    provider: v.union(v.literal("mercadopago"), v.literal("zenobank"), v.literal("stripe")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    externalReference: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_externalReference", ["externalReference"])
    .index("by_status", ["status"]),

  subscriptions: defineTable({
    userId: v.string(),
    provider: v.union(v.literal("mercadopago"), v.literal("zenobank"), v.literal("stripe")),
    plan: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("paused"),
      v.literal("expired")
    ),
    externalReference: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    mercadopagoSubscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_externalReference", ["externalReference"])
    .index("by_status", ["status"]),

  subscriptionPlans: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    interval: v.union(v.literal("month"), v.literal("year")),
    features: v.array(v.string()),
    isActive: v.boolean(),
    maxCommunities: v.number(),
    maxSignals: v.number(),
    prioritySupport: v.boolean(),
    sortOrder: v.optional(v.number()),
  }).index("by_active", ["isActive"]),

  premiumCommunities: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    durationDays: v.number(),
    maxMembers: v.optional(v.number()),
    features: v.array(v.string()),
    creatorId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  communityAccess: defineTable({
    userId: v.string(),
    communityId: v.string(),
    status: v.union(v.literal("active"), v.literal("expired")),
    purchaseDate: v.number(),
    expiryDate: v.optional(v.number()),
    paymentId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_community", ["communityId"])
    .index("by_user_community", ["userId", "communityId"]),

  userCredits: defineTable({
    userId: v.string(),
    credits: v.number(),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  wishlists: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_product", ["userId", "productId"]),

  creditTransactions: defineTable({
    userId: v.string(),
    type: v.union(v.literal("purchase"), v.literal("usage"), v.literal("bonus")),
    amount: v.number(),
    description: v.string(),
    referenceId: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  strategies: defineTable({
    id: v.string(),
    authorId: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.any(),
    price: v.number(),
    currency: v.union(v.literal('USD'), v.literal('XP')),
    category: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    downloads: v.number(),
    rating: v.number(),
    ratingCount: v.optional(v.number()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  bookLibrary: defineTable({
    userId: v.string(),
    strategyId: v.string(),
    title: v.string(),
    fileUrl: v.string(),
    coverUrl: v.optional(v.string()),
    authorName: v.optional(v.string()),
    addedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_strategy", ["userId", "strategyId"]),

  strategyPurchases: defineTable({
    userId: v.string(),
    strategyId: v.string(),
    purchasedAt: v.number(),
    amountPaid: v.number(),
    currency: v.union(v.literal('USD'), v.literal('XP')),
  }).index("by_user", ["userId"])
    .index("by_strategy", ["strategyId"]),

  platformReviews: defineTable({
    userId: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number()
  }).index("by_createdAt", ["createdAt"])
    .index("by_user", ["userId"]),

  affiliates: defineTable({
    userId: v.string(),
    code: v.string(),
    totalReferrals: v.number(),
    totalEarnings: v.number(),
    pendingEarnings: v.number(),
    paidEarnings: v.number(),
    commissionRate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_code", ["code"]),

  affiliateReferrals: defineTable({
    affiliateId: v.id("affiliates"),
    affiliateUserId: v.string(),
    referredUserId: v.string(),
    referralCode: v.string(),
    transactionId: v.optional(v.string()),
    transactionAmount: v.optional(v.number()),
    commissionAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  }).index("by_affiliateId", ["affiliateId"])
    .index("by_referredUserId", ["referredUserId"])
    .index("by_status", ["status"]),

  auditLogs: defineTable({
    userId: v.string(),
    action: v.union(
      v.literal("login"),
      v.literal("logout"),
      v.literal("post_create"),
      v.literal("post_update"),
      v.literal("post_delete"),
      v.literal("payment_initiated"),
      v.literal("payment_completed"),
      v.literal("payment_failed"),
      v.literal("role_change"),
      v.literal("profile_update"),
      v.literal("profile_delete"),
      v.literal("resource_create"),
      v.literal("resource_delete"),
      v.literal("community_create"),
      v.literal("community_delete"),
      v.literal("community_update"),
      v.literal("moderation_action"),
      v.literal("subscription_change"),
      v.literal("user_ban"),
      v.literal("user_unban"),
      v.literal("user_delete"),
      v.literal("user_update"),
      v.literal("admin_action")
    ),
    details: v.optional(v.any()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.string()),
    previousValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_action", ["userId", "action"])
    .index("by_target", ["targetType", "targetId"]),

  stripeSubscriptions: defineTable({
    userId: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    priceId: v.string(),
    plan: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_userId", ["userId"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_customerId", ["customerId"]),

  communityPosts: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    titulo: v.optional(v.string()),
    contenido: v.string(),
    imagenUrl: v.optional(v.string()),
    tipo: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("link"),
      v.literal("poll"),
      v.literal("signal")
    ),
    likes: v.array(v.string()),
    commentsCount: v.optional(v.number()),
    isPinned: v.optional(v.boolean()),
    isLocked: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("deleted"), v.literal("hidden")),
  }).index("by_community", ["communityId"])
    .index("by_user", ["userId"])
    .index("by_community_created", ["communityId", "createdAt"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_status", ["status"]),

  communitySubscriptions: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    plan: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing")
    ),
    MercadoPagoSubscriptionId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_community", ["communityId"])
    .index("by_user", ["userId"])
    .index("by_community_user", ["communityId", "userId"])
    .index("by_status", ["status"]),

  communityPayouts: defineTable({
    communityId: v.id("communities"),
    ownerId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    MercadoPagoPaymentId: v.optional(v.string()),
    description: v.optional(v.string()),
    periodStart: v.number(),
    periodEnd: v.number(),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  }).index("by_community", ["communityId"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  products: defineTable({
    authorId: v.string(),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    category: v.union(
      v.literal("ea"),
      v.literal("indicator"),
      v.literal("template"),
      v.literal("course"),
      v.literal("signal"),
      v.literal("vps"),
      v.literal("tool")
    ),
    attributes: v.optional(v.object({
      platform: v.optional(v.string()),
      pairs: v.optional(v.array(v.string())),
      timeframe: v.optional(v.array(v.string())),
      riskLevel: v.optional(v.string()),
      level: v.optional(v.string()),
      duration: v.optional(v.string()),
      format: v.optional(v.array(v.string())),
      frequency: v.optional(v.string()),
      specs: v.optional(v.any()),
    })),
    price: v.number(),
    currency: v.union(v.literal("USD"), v.literal("EUR"), v.literal("XP")),
    images: v.array(v.string()),
    demoFile: v.optional(v.string()),
    mainFile: v.optional(v.string()),
    fileName: v.optional(v.string()),
    rating: v.number(),
    ratingCount: v.number(),
    salesCount: v.number(),
    views: v.number(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    isDeleted: v.boolean(),
    reviews: v.array(v.object({
      userId: v.string(),
      userName: v.string(),
      userAvatar: v.optional(v.string()),
      rating: v.number(),
      comment: v.string(),
      createdAt: v.number(),
    })),
    mql5Id: v.optional(v.string()),
    mql5Url: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"])
    .index("by_published", ["isPublished"])
    .index("by_published_createdAt", ["isPublished", "createdAt"])
    .index("by_featured_published", ["isFeatured", "isPublished", "createdAt"])
    .index("by_rating", ["rating"]),

  purchases: defineTable({
    productId: v.id("products"),
    authorId: v.string(),
    buyerId: v.string(),
    amount: v.number(),
    currency: v.string(),
    platformFee: v.number(),
    authorEarnings: v.number(),
    MercadoPagoPaymentId: v.optional(v.string()),
    MercadoPagoPreferenceId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded")
    ),
    downloadCount: v.number(),
    lastDownloadAt: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_product", ["productId"])
    .index("by_buyer", ["buyerId"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  author_payouts: defineTable({
    authorId: v.string(),
    amount: v.number(),
    platformFee: v.number(),
    netAmount: v.number(),
    MercadoPagoPaymentId: v.optional(v.string()),
    MercadoPagoRecipientId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("paid"),
      v.literal("failed")
    ),
    salesIncluded: v.array(v.id("purchases")),
    salesAmount: v.number(),
    period: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    notes: v.optional(v.string()),
  }).index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  creator_profiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    avatarImage: v.optional(v.string()),
    socialLinks: v.object({
      youtube: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      telegram: v.optional(v.string()),
      discord: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    expertise: v.array(v.string()),
    languages: v.optional(v.array(v.string())),
    MercadoPagoEmail: v.optional(v.string()),
    totalEarnings: v.number(),
    totalSales: v.number(),
    totalFollowers: v.number(),
    totalViews: v.number(),
    isVerified: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  creator_earnings: defineTable({
    creatorId: v.string(),
    source: v.union(
      v.literal("marketplace"),
      v.literal("community"),
      v.literal("tips"),
      v.literal("affiliate"),
      v.literal("other")
    ),
    sourceId: v.string(),
    amount: v.number(),
    platformFee: v.number(),
    netAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("available"),
      v.literal("reserved"),
      v.literal("paid"),
      v.literal("refunded")
    ),
    payoutId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_creator", ["creatorId"])
    .index("by_source", ["source"])
    .index("by_status", ["status"]),

  creator_followers: defineTable({
    creatorId: v.string(),
    followerId: v.string(),
    createdAt: v.number(),
  }).index("by_creator", ["creatorId"])
    .index("by_follower", ["followerId"])
    .index("by_creator_follower", ["creatorId", "followerId"]),

  creator_activities: defineTable({
    creatorId: v.string(),
    type: v.union(
      v.literal("product_published"),
      v.literal("community_created"),
      v.literal("post"),
      v.literal("milestone"),
      v.literal("payout")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    referenceType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_creator", ["creatorId"])
    .index("by_createdAt", ["createdAt"]),

  signal_plans: defineTable({
    name: v.string(),
    slug: v.string(),
    signalsPerDay: v.number(),
    signalsPerWeek: v.optional(v.number()),
    signalsPerMonth: v.optional(v.number()),
    signalTypes: v.array(v.string()),
    hasVIPSignals: v.boolean(),
    hasEntryConfirmation: v.boolean(),
    hasExitTiming: v.boolean(),
    hasRiskAnalysis: v.boolean(),
    hasTradeManagement: v.boolean(),
    hasDailyReport: v.boolean(),
    priceMonthly: v.number(),
    priceYearly: v.optional(v.number()),
    currency: v.union(v.literal("USD"), v.literal("EUR")),
    subscriberCount: v.number(),
    avgRating: v.number(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_active", ["isActive"])
    .index("by_price", ["priceMonthly"]),

  signal_subscriptions: defineTable({
    userId: v.string(),
    planId: v.id("signal_plans"),
    MercadoPagoSubscriptionId: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("expired"),
      v.literal("pending"),
      v.literal("trial")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    signalsReceivedToday: v.number(),
    signalsReceivedThisWeek: v.number(),
    signalsReceivedThisMonth: v.number(),
    lastSignalReceivedAt: v.optional(v.number()),
    dailyLimitReachedAt: v.optional(v.number()),
    isTrial: v.boolean(),
    trialEndsAt: v.optional(v.number()),
    totalSignalsReceived: v.number(),
    winRate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_plan", ["planId"]),

  apps: defineTable({
    appId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(v.literal('game'), v.literal('tool'), v.literal('utility')),
    visibility: v.union(v.literal('public'), v.literal("private")),
    status: v.union(v.literal("active"), v.literal("beta"), v.literal("maintenance")),
    config: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_appId", ["appId"]).index("by_visibility", ["visibility"]),

  gameSessions: defineTable({
    userId: v.string(),
    appId: v.string(),
    gameMode: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    score: v.number(),
    xpEarned: v.number(),
    completed: v.boolean(),
  }).index("by_user", ["userId"]).index("by_app", ["appId"]).index("by_status", ["status"]),

  gameStats: defineTable({
    appId: v.string(),
    totalPlays: v.number(),
    playerCount: v.number(),
    lastPlayed: v.number(),
  }).index("by_appId", ["appId"]),

  signals: defineTable({
    signalId: v.string(),
    providerId: v.string(),
    type: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("indices"),
      v.literal("commodities"),
      v.literal("stocks"),
      v.literal("binary"),
      v.literal("options")
    ),
    priority: v.union(
      v.literal("vip"),
      v.literal("premium"),
      v.literal("standard"),
      v.literal("free")
    ),
    pair: v.string(),
    pairCategory: v.optional(v.string()),
    direction: v.union(v.literal("buy"), v.literal("sell")),
    entryPrice: v.number(),
    entryRangeMin: v.optional(v.number()),
    entryRangeMax: v.optional(v.number()),
    entryType: v.union(
      v.literal("instant"),
      v.literal("limit"),
      v.literal("stop"),
      v.literal("range")
    ),
    stopLoss: v.number(),
    stopLossPips: v.optional(v.number()),
    stopLossPercentage: v.optional(v.number()),
    takeProfits: v.array(v.object({
      level: v.number(),
      price: v.number(),
      percentage: v.optional(v.number()),
      reached: v.boolean(),
      reachedAt: v.optional(v.number()),
    })),
    timeframe: v.union(
      v.literal("M1"), v.literal("M5"), v.literal("M15"),
      v.literal("H1"), v.literal("H4"), v.literal("D1"),
      v.literal("W1"), v.literal("MN")
    ),
    sentiment: v.union(v.literal("bullish"), v.literal("bearish"), v.literal("neutral")),
    analysis: v.string(),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("partially_hit"),
      v.literal("hit"),
      v.literal("canceled"),
      v.literal("expired")
    ),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    totalSubscribersNotified: v.number(),
    subscribersActed: v.number(),
    subscribersWon: v.number(),
    subscribersLost: v.number(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_pair", ["pair"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_status", ["status"])
    .index("by_provider", ["providerId"])
    .index("by_sentAt", ["sentAt"]),

  signal_subscribers_actions: defineTable({
    signalId: v.string(),
    userId: v.string(),
    action: v.union(
      v.literal("viewed"),
      v.literal("opened_trade"),
      v.literal("closed_profit"),
      v.literal("closed_loss"),
      v.literal("ignored")
    ),
    tradeOpened: v.boolean(),
    entryPriceUsed: v.optional(v.number()),
    exitPriceUsed: v.optional(v.number()),
    result: v.union(
      v.literal("profit"),
      v.literal("loss"),
      v.literal("breakeven"),
      v.literal("pending")
    ),
    pipsGained: v.optional(v.number()),
    percentageGained: v.optional(v.number()),
    platform: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_signal", ["signalId"])
    .index("by_user", ["userId"])
    .index("by_result", ["result"]),

  signal_providers: defineTable({
    userId: v.string(),
    isVerified: v.boolean(),
    verificationLevel: v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("institutional")
    ),
    totalSignalsSent: v.number(),
    totalSignalsActive: v.number(),
    avgWinRate: v.number(),
    totalPipsGenerated: v.number(),
    subscribersCount: v.number(),
    avgRating: v.number(),
    totalRatings: v.number(),
    earningsThisMonth: v.number(),
    totalEarnings: v.number(),
    pendingPayout: v.number(),
    signalsPerDayLimit: v.number(),
    signalsPerWeekLimit: v.number(),
    isActive: v.boolean(),
    isSuspended: v.boolean(),
    suspensionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_rating", ["avgRating"]),

  signal_notifications: defineTable({
    userId: v.string(),
    signalId: v.string(),
    channel: v.union(
      v.literal("push"),
      v.literal("email"),
      v.literal("telegram"),
      v.literal("sms"),
      v.literal("whatsapp")
    ),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("not_sent"),
      v.literal("filtered")
    ),
    opened: v.boolean(),
    openedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_signal", ["signalId"])
    .index("by_status", ["status"]),

  // Signal notification preferences per user
  signal_notification_prefs: defineTable({
    userId: v.string(),
    enabled: v.boolean(),
    signalTypes: v.array(v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("indices"),
      v.literal("commodities"),
      v.literal("stocks"),
      v.literal("binary"),
      v.literal("options")
    )),
    minProviderRating: v.number(),
    minWinRate: v.optional(v.number()),
    notifyOnNew: v.boolean(),
    notifyOnResult: v.boolean(),
    notifyOnUpdate: v.boolean(),
    quietHoursStart: v.optional(v.number()),
    quietHoursEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  signal_performance: defineTable({
    providerId: v.string(),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    periodStart: v.number(),
    periodEnd: v.number(),
    signalsSent: v.number(),
    signalsWon: v.number(),
    signalsLost: v.number(),
    signalsPending: v.number(),
    totalPipsWon: v.number(),
    totalPipsLost: v.number(),
    netPips: v.number(),
    winRate: v.number(),
    byPair: v.any(),
    byType: v.any(),
    createdAt: v.number(),
  }).index("by_provider_period", ["providerId", "period", "periodStart"]),

  // --- AGENT-2: COMPETITIONS ---
  competitions: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("special")
    ),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("ended")
    ),
    startsAt: v.number(),
    endsAt: v.number(),
    createdAt: v.number(),
    maxParticipants: v.optional(v.number()),
    currentParticipants: v.number(),
    entryRequirement: v.optional(v.object({
      minXP: v.optional(v.number()),
      minLevel: v.optional(v.number()),
      subscription: v.optional(v.union(
        v.literal("free"),
        v.literal("pro"),
        v.literal("elite")
      )),
    })),
    rules: v.array(v.object({
      metric: v.union(
        v.literal("accuracy"),
        v.literal("posts"),
        v.literal("engagement"),
        v.literal("profit"),
        v.literal("winrate")
      ),
      weight: v.number(),
      description: v.string(),
    })),
    prizes: v.array(v.object({
      rankStart: v.number(),
      rankEnd: v.number(),
      type: v.union(
        v.literal("xp"),
        v.literal("subscription_months"),
        v.literal("badge"),
        v.literal("cash")
      ),
      value: v.number(),
      description: v.string(),
    })),
    createdBy: v.string(),
    isFeatured: v.boolean(),
    coverImage: v.optional(v.string()),
  }).index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_startsAt", ["startsAt"]),

  competition_participants: defineTable({
    competitionId: v.id("competitions"),
    oderId: v.string(),
    username: v.string(),
    avatar: v.string(),
    score: v.number(),
    metrics: v.any(),
    joinedAt: v.number(),
    lastUpdated: v.number(),
  }).index("by_competition", ["competitionId"])
    .index("by_user", ["oderId"])
    .index("by_competition_score", ["competitionId", "score"]),

  // --- AGENT-2: TRADER VERIFICATION ---
  trader_verification: defineTable({
    oderId: v.string(),
    level: v.union(
      v.literal("none"),
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("institutional")
    ),
    emailVerified: v.boolean(),
    phoneVerified: v.boolean(),
    kycStatus: v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    kycDocuments: v.array(v.object({
      type: v.union(
        v.literal("id"),
        v.literal("passport"),
        v.literal("drivers_license")
      ),
      uploadedAt: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      ),
      rejectionReason: v.optional(v.string()),
    })),
    brokerConnected: v.boolean(),
    brokerName: v.optional(v.string()),
    brokerAccountId: v.optional(v.string()),
    tradingVerified: v.boolean(),
    verifiedStats: v.optional(v.object({
      totalTrades: v.number(),
      winRate: v.number(),
      avgRiskReward: v.number(),
      sharpeRatio: v.optional(v.number()),
      maxDrawdown: v.number(),
      verifiedAt: v.number(),
      periodStart: v.number(),
      periodEnd: v.number(),
    })),
    companyVerified: v.boolean(),
    companyName: v.optional(v.string()),
    companyDocument: v.optional(v.string()),
    regulatoryLicenses: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["oderId"])
    .index("by_level", ["level"])
    .index("by_kycStatus", ["kycStatus"]),

  // --- AGENT-2: USER PREFERENCES ---
  user_preferences: defineTable({
    oderId: v.string(),
    theme: v.union(
      v.literal("dark"),
      v.literal("light"),
      v.literal("system")
    ),
    accentColor: v.string(),
    fontSize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large")
    ),
    reducedMotion: v.boolean(),
    highContrast: v.boolean(),
    language: v.union(
      v.literal("es"),
      v.literal("en"),
      v.literal("pt")
    ),
    pushEnabled: v.boolean(),
    emailEnabled: v.boolean(),
    notificationPreferences: v.object({
      mentions: v.boolean(),
      likes: v.boolean(),
      comments: v.boolean(),
      follows: v.boolean(),
      signals: v.boolean(),
      competitions: v.boolean(),
      news: v.boolean(),
      marketing: v.boolean(),
    }),
    quietHours: v.object({
      enabled: v.boolean(),
      start: v.string(),
      end: v.string(),
      timezone: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["oderId"]),

  // --- AGENT-3: AD AUCTION SYSTEM ---
  ad_slots: defineTable({
    slotId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("banner"),
      v.literal("sidebar"),
      v.literal("feed"),
      v.literal("popup")
    ),
    size: v.object({
      width: v.number(),
      height: v.number(),
    }),
    positions: v.array(v.number()),
    page: v.string(),
    floorPrice: v.number(),
    currency: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_slotId", ["slotId"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_page", ["page"]),

  ad_auctions: defineTable({
    auctionId: v.string(),
    slotId: v.id("ad_slots"),
    auctionType: v.union(
      v.literal("cpc"),
      v.literal("cpm"),
      v.literal("fixed")
    ),
    currentBid: v.number(),
    currency: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    maxDuration: v.number(),
    targeting: v.object({
      countries: v.optional(v.array(v.string())),
      languages: v.optional(v.array(v.string())),
      subscriptionTiers: v.optional(v.array(v.string())),
      interests: v.optional(v.array(v.string())),
      excludeCountries: v.optional(v.array(v.string())),
      schedule: v.optional(v.object({
        days: v.array(v.number()),
        hours: v.array(v.number()),
      })),
    }),
    status: v.union(
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    winnerId: v.optional(v.string()),
    winnerBid: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_slot", ["slotId"])
    .index("by_status", ["status"])
    .index("by_startsAt", ["startsAt"]),

  ad_bids: defineTable({
    auctionId: v.id("ad_auctions"),
    bidderId: v.string(),
    campaignId: v.id("ad_campaigns"),
    amount: v.number(),
    bidType: v.union(
      v.literal("cpc"),
      v.literal("cpm"),
      v.literal("fixed")
    ),
    createdAt: v.number(),
  }).index("by_auction", ["auctionId"])
    .index("by_bidder", ["bidderId"])
    .index("by_campaign", ["campaignId"]),

  ad_campaigns: defineTable({
    advertiserId: v.string(),
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    ads: v.array(v.object({
      adId: v.string(),
      title: v.string(),
      description: v.string(),
      imageUrl: v.string(),
      link: v.string(),
      ctaText: v.optional(v.string()),
    })),
    budget: v.number(),
    budgetType: v.union(
      v.literal("daily"),
      v.literal("total")
    ),
    spent: v.number(),
    targeting: v.any(),
    impressions: v.number(),
    clicks: v.number(),
    ctr: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_advertiser", ["advertiserId"])
    .index("by_status", ["status"]),

  // --- INSTAGRAM INTEGRATION ---
  instagram_accounts: defineTable({
    userId: v.string(),
    instagramId: v.string(),
    username: v.string(),
    accessToken: v.string(),
    encryptedRefreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    isBusiness: v.boolean(),
    isConnected: v.boolean(),
    followers: v.optional(v.number()),
    permissions: v.array(v.string()),
    autoPostEnabled: v.boolean(),
    defaultHashtags: v.optional(v.array(v.string())),
    watermarkEnabled: v.boolean(),
    watermarkPosition: v.optional(v.string()),
    aiAutoReply: v.boolean(),
    aiReplyLanguage: v.optional(v.string()),
    aiReplyDelay: v.optional(v.number()),
    totalPosts: v.optional(v.number()),
    totalReplies: v.optional(v.number()),
    profilePicture: v.optional(v.string()),
    biography: v.optional(v.string()),
    website: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_instagramId", ["instagramId"])
    .index("by_connected", ["isConnected"]),

  instagram_scheduled_posts: defineTable({
    userId: v.string(),
    accountId: v.string(),
    caption: v.string(),
    hashtags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    carouselUrls: v.optional(v.array(v.string())),
    scheduledFor: v.number(),
    timezone: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    aiEnhanced: v.boolean(),
    aiSuggestions: v.optional(v.any()),
    instagramPostId: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    campaignId: v.optional(v.string()),
    repeatEnabled: v.boolean(),
    repeatInterval: v.optional(v.number()),
    engagementPrediction: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    reach: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_status", ["status"])
    .index("by_scheduledFor", ["scheduledFor"]),

  instagram_content_templates: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    template: v.string(),
    variables: v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("date")),
      defaultValue: v.optional(v.string()),
    })),
    defaultHashtags: v.optional(v.array(v.string())),
    defaultImage: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
    useCount: v.number(),
    lastUsedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  instagram_auto_reply_rules: defineTable({
    userId: v.string(),
    accountId: v.string(),
    triggerType: v.union(
      v.literal("keyword"),
      v.literal("pattern"),
      v.literal("sender"),
      v.literal("always")
    ),
    triggerValue: v.string(),
    responseType: v.union(
      v.literal("text"),
      v.literal("template"),
      v.literal("ai_generated")
    ),
    responseText: v.optional(v.string()),
    templateId: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    delayMinutes: v.optional(v.number()),
    activeHours: v.optional(v.object({
      enabled: v.boolean(),
      startHour: v.number(),
      endHour: v.number(),
      timezone: v.string(),
    })),
    onlyNewFollowers: v.boolean(),
    excludeKeywords: v.optional(v.array(v.string())),
    triggerCount: v.number(),
    replyCount: v.number(),
    isActive: v.boolean(),
    priority: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_active", ["isActive"]),

  instagram_analytics: defineTable({
    accountId: v.string(),
    date: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),
    followersCount: v.number(),
    followersDelta: v.number(),
    postsCount: v.number(),
    storiesCount: v.number(),
    reelsCount: v.optional(v.number()),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalSaves: v.number(),
    totalShares: v.number(),
    totalReach: v.optional(v.number()),
    totalImpressions: v.optional(v.number()),
    avgLikesPerPost: v.number(),
    avgCommentsPerPost: v.number(),
    engagementRate: v.number(),
    topPosts: v.array(v.object({
      postId: v.string(),
      likes: v.number(),
      comments: v.number(),
      reach: v.number(),
    })),
    createdAt: v.number(),
  }).index("by_account", ["accountId"])
    .index("by_date", ["date"])
    .index("by_account_date", ["accountId", "date"]),

  instagram_ai_queue: defineTable({
    userId: v.string(),
    accountId: v.optional(v.string()),
    requestType: v.union(
      v.literal("caption"),
      v.literal("hashtags"),
      v.literal("image_description"),
      v.literal("comment_reply"),
      v.literal("dm_response"),
      v.literal("content_ideas")
    ),
    prompt: v.string(),
    context: v.optional(v.any()),
    aiProvider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("google"),
      v.literal("meta")
    ),
    aiModel: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    retryCount: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  instagram_messages: defineTable({
    accountId: v.string(),
    messageId: v.string(),
    senderId: v.string(),
    senderUsername: v.string(),
    recipientId: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("story_mention"),
      v.literal("comment")
    ),
    text: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    isRead: v.boolean(),
    isFromBusiness: v.boolean(),
    wasAutoReplied: v.boolean(),
    autoReplyRuleId: v.optional(v.string()),
    aiGeneratedResponse: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_account", ["accountId"])
    .index("by_sender", ["senderId"])
    .index("by_account_read", ["accountId", "isRead"])
    .index("by_createdAt", ["createdAt"]),

  prop_firms: defineTable({
    name: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    affiliateLink: v.string(),
    isActive: v.boolean(),
    order: v.number(),
    characteristics: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }),

  referrals: defineTable({
    referrerId: v.string(),
    referredId: v.string(),
    referralCode: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("expired")
    ),
    rewardType: v.union(
      v.literal("xp"),
      v.literal("subscription_days"),
      v.literal("badge"),
      v.literal("cash")
    ),
    referrerReward: v.number(),
    referredReward: v.number(),
    referrerClaimed: v.boolean(),
    referredClaimed: v.boolean(),
    claimedAt: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_referrer", ["referrerId"])
    .index("by_referred", ["referredId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"]),

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
  }).index("by_user", ["userId"])
    .index("by_code", ["code"]),

  // --- MARKET INTELLIGENCE ---
  economic_calendar: defineTable({
    eventId: v.string(),
    source: v.union(
      v.literal("investing"),
      v.literal("myfxbook"),
      v.literal("forexfactory")
    ),
    datetime: v.number(),
    timezone: v.string(),
    date: v.string(),
    time: v.string(),
    country: v.string(),
    countryCode: v.string(),
    currency: v.string(),
    event: v.string(),
    eventSlug: v.string(),
    impact: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    actual: v.optional(v.string()),
    forecast: v.optional(v.string()),
    previous: v.optional(v.string()),
    revised: v.optional(v.string()),
    isLive: v.boolean(),
    sentiment: v.optional(v.union(
      v.literal("better"),
      v.literal("worse"),
      v.literal("neutral")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_date", ["date"])
    .index("by_datetime", ["datetime"])
    .index("by_country", ["country"])
    .index("by_impact", ["impact"])
    .index("by_source_date", ["source", "date"]),

  market_news: defineTable({
    title: v.string(),
    summary: v.string(),
    content: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    sourceLogo: v.optional(v.string()),
    category: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("commodities"),
      v.literal("indices"),
      v.literal("stocks"),
      v.literal("general")
    ),
    sentiment: v.union(
      v.literal("bullish"),
      v.literal("bearish"),
      v.literal("neutral")
    ),
    relatedPairs: v.array(v.string()),
    relatedAssets: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    author: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      avatar: v.string(),
      isVerified: v.boolean(),
    })),
    isAIGenerated: v.boolean(),
    publishedAt: v.number(),
    views: v.number(),
    likes: v.array(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_sentiment", ["sentiment"])
    .index("by_source", ["source"]),

  news_sources: defineTable({
    name: v.string(),
    url: v.string(),
    type: v.union(
      v.literal("rss"),
      v.literal("api"),
      v.literal("webhook")
    ),
    feedUrl: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    isActive: v.boolean(),
    lastFetched: v.optional(v.number()),
    fetchInterval: v.number(),
    priority: v.number(),
    categories: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"])
    .index("by_type", ["type"]),

  systemErrors: defineTable({
    errorMessage: v.string(),
    errorStack: v.optional(v.string()),
    componentStack: v.optional(v.string()),
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
    pageUrl: v.string(),
    userAgent: v.optional(v.string()),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    status: v.union(
      v.literal("new"),
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("ignored")
    ),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_createdAt", ["createdAt"]),

  pendingOperations: defineTable({
    operationType: v.union(
      v.literal("create_post"),
      v.literal("update_post"),
      v.literal("delete_post"),
      v.literal("add_comment"),
      v.literal("update_profile"),
      v.literal("toggle_follow"),
      v.literal("like_post"),
      v.literal("share_post")
    ),
    payload: v.any(),
    targetId: v.optional(v.string()),
    userId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("failed"),
      v.literal("completed")
    ),
    retryCount: v.number(),
    maxRetries: v.number(),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  }).index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_type", ["operationType"])
    .index("by_createdAt", ["createdAt"]),

  // ─── SUBCOMUNIDADES ───────────────────────────────────────────────────

  subcommunities: defineTable({
    parentId: v.id("communities"),
    ownerId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("general"),
      v.literal("support"),
      v.literal("help"),
      v.literal("group")
    ),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("invite_only")),
    coverImage: v.optional(v.string()),
    plan: v.string(),
    accessType: v.union(v.literal("free"), v.literal("paid")),
    priceMonthly: v.optional(v.number()),
    adsEnabled: v.boolean(),
    adFrequency: v.number(),
    allowedAdTypes: v.array(v.string()),
    tvEnabled: v.boolean(),
    tvStreamUrl: v.optional(v.string()),
    tvIsLive: v.optional(v.boolean()),
    maxMembers: v.number(),
    currentMembers: v.number(),
    status: v.string(),
    createdAt: v.number(),
  }).index("by_parent", ["parentId"])
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_parent_slug", ["parentId", "slug"])
    .index("by_status", ["status"]),

  subcommunityMembers: defineTable({
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("moderator"), v.literal("member")),
    joinedAt: v.number(),
  }).index("by_subcommunity", ["subcommunityId"])
    .index("by_user", ["userId"])
    .index("by_subcommunity_user", ["subcommunityId", "userId"]),

  subcommunitySubscriptions: defineTable({
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing")
    ),
    MercadoPagoSubscriptionId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_subcommunity", ["subcommunityId"])
    .index("by_user", ["userId"])
    .index("by_subcommunity_user", ["subcommunityId", "userId"])
    .index("by_status", ["status"]),

  communityPlanSettings: defineTable({
    communityId: v.id("communities"),
    plan: v.string(),
    maxSubcommunities: v.number(),
    maxMembersPerSub: v.number(),
    adsAllowed: v.boolean(),
    canDisableAds: v.boolean(),
    defaultAdFrequency: v.number(),
    tvAllowed: v.boolean(),
    tvMaxViewers: v.number(),
    chatAllowed: v.boolean(),
    analyticsEnabled: v.boolean(),
    customBranding: v.boolean(),
    updatedAt: v.number(),
  }).index("by_community", ["communityId"]),

  subcommunityInvites: defineTable({
    subcommunityId: v.id("subcommunities"),
    invitedBy: v.string(),
    email: v.string(),
    userId: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired")),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_subcommunity", ["subcommunityId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Token system for rewarding posts
  token_balances: defineTable({
    userId: v.string(),
    balance: v.number(),
    totalEarned: v.number(),
    totalSpent: v.number(),
    dailyLimit: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  token_transactions: defineTable({
    userId: v.string(),
    targetUserId: v.string(),
    targetPostId: v.string(),
    amount: v.number(),
    type: v.union(v.literal("earned"), v.literal("spent"), v.literal("bonus"), v.literal("refund")),
    reason: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_targetUser", ["targetUserId"])
    .index("by_targetPost", ["targetPostId"])
    .index("by_date", ["createdAt"]),

  token_daily_limits: defineTable({
    userId: v.string(),
    date: v.string(),
    tokensSent: v.number(),
    updatedAt: v.number(),
  }).index("by_user_date", ["userId", "date"]),

  pendingNotifications: defineTable({
    type: v.string(),
    phoneNumber: v.string(),
    userId: v.string(),
    userName: v.string(),
    data: v.any(),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
    errorAt: v.optional(v.number()),
  }).index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  adminFindings: defineTable({
    category: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("dismissed")),
    filePath: v.optional(v.string()),
    lineNumber: v.optional(v.number()),
    detectedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    source: v.optional(v.union(v.literal("manual"), v.literal("guard"))),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    route: v.optional(v.string()),
    taskId: v.optional(v.string()),
    reportedAt: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_severity", ["severity"])
    .index("by_status", ["status"])
    .index("by_detectedAt", ["detectedAt"]),

  platformConfig: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["key"]),

  dailyPolls: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    asset: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
    votedAt: v.number(),
  }).index("by_community_user", ["communityId", "userId"])
    .index("by_asset", ["asset"])
    .index("by_date", ["votedAt"]),
});

/*
 * =============================================================================
 * FASE 8 CLOSURE - SCHEMA NOTES
 * =============================================================================
 * 
 * TODO: Reels / Micro-Capsules Feature (Fase 8)
 * ------------------------------------------------
 * The following features are planned but NOT YET IMPLEMENTED:
 * 
 * 1. Instagram Reels Integration:
 *    - Schema for storing Instagram Reels (video content)
 *    - Video upload/compression pipeline
 *    - Reels analytics (views, likes, shares, completion rate)
 *    - Integration with Instagram Graph API for Reels publishing
 * 
 * 2. Micro-Capsules (Educational Short-form Content):
 *    - Schema for micro-learning capsules (30s-2min videos)
 *    - Creator tools for micro-capsule creation
 *    - Progress tracking for users consuming capsules
 *    - Quiz/assessment integration
 * 
 * Related Files:
 *    - Frontend: src/views/InstagramMarketingView.tsx (video tab)
 *    - Components: InstagramMediaLibrary, InstagramPostEditor
 *    - Backend: convex/instagram/ (future implementation)
 * 
 * Estimated Implementation: Fase 9 or later
 */
