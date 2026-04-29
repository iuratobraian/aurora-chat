import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  chat: defineTable({
    userId: v.string(),
    nombre: v.string(),
    avatar: v.string(),
    texto: v.string(),
    imagenUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    eventId: v.optional(v.string()),
    isAi: v.optional(v.boolean()),
    flagged: v.optional(v.boolean()),
    flaggedWords: v.optional(v.array(v.string())),
    channelId: v.optional(v.string()),
    createdAt: v.number(),
    isPinned: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    isEdited: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
    linkPreview: v.optional(v.object({
      url: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      domain: v.optional(v.string()),
    })),
  }).index("by_createdAt", ["createdAt"])
    .index("by_channel", ["channelId", "createdAt"])
    .index("by_userId", ["userId"]),

  chatChannels: defineTable({
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("global"),
      v.literal("community"),
      v.literal("direct"),
      v.literal("subcommunity"),
      v.literal("private")
    ),
    communityId: v.optional(v.string()), // Changed from id("communities") to string to be independent
    participants: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    password: v.optional(v.string()), 
    isPrivate: v.optional(v.boolean()),
    status: v.optional(v.string()),
    user1Id: v.optional(v.id("users")),
    user2Id: v.optional(v.id("users")),
    moderators: v.optional(v.array(v.string())),
    isPaused: v.optional(v.boolean()),
    welcomeMessage: v.optional(v.string()),
  }).index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_users", ["user1Id", "user2Id"]),

  events: defineTable({
    channelId: v.string(),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    createdBy: v.id("users"),
    participants: v.array(v.id("users")),
    createdAt: v.number(),
  }).index("by_channel", ["channelId"]),

  polls: defineTable({
    channelId: v.string(),
    question: v.string(),
    options: v.array(v.object({
      text: v.string(),
      votes: v.array(v.id("users")),
    })),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_channel", ["channelId"]),


  friends: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    createdAt: v.number(),
  }).index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_users", ["user1Id", "user2Id"]),

  chatTyping: defineTable({
    channelId: v.string(),
    userId: v.string(),
    nombre: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_channel", ["channelId"])
    .index("by_channel_user", ["channelId", "userId"]),

  serverStats: defineTable({
    totalMessages: v.number(),
    todayMessages: v.number(),
    weekMessages: v.number(),
    totalChannels: v.number(),
    activeUsers: v.number(),
    estimatedStorageKB: v.number(),
    storagePercentage: v.number(),
    lastUpdated: v.number(),
  }),

  users: defineTable({
    email: v.string(),
    username: v.string(),
    name: v.string(),
    avatar: v.string(),
    password: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    privacyMode: v.optional(v.union(v.literal("everyone"), v.literal("requests"))),
    themeColor: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"])

    .index("by_username", ["username"]),

  statuses: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    userAvatar: v.string(),
    content: v.string(), // Text or Image URL
    type: v.union(v.literal("text"), v.literal("image")),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_expiresAt", ["expiresAt"])
    .index("by_userId", ["userId"]),

  reminders: defineTable({
    userId: v.id("users"),
    text: v.string(),
    date: v.number(),
    completed: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  passwords: defineTable({
    userId: v.id("users"),
    site: v.string(),
    username: v.string(),
    encryptedPassword: v.string(), // Encrypted client-side
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  expenses: defineTable({
    userId: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    amount: v.number(),
    date: v.string(),
    category: v.string(),
    paymentMethod: v.string(),
    note: v.optional(v.string()),
    cardId: v.optional(v.string()),
    accountId: v.optional(v.string()),
    totalInstallments: v.optional(v.number()),
    currentInstallment: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_accountId", ["accountId"]),

  fixedExpenses: defineTable({
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    dayOfMonth: v.number(),
    active: v.boolean(),
    category: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  creditCards: defineTable({
    userId: v.string(),
    name: v.string(),
    limit: v.number(),
    closingDay: v.number(),
    dueDay: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  accounts: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.string(), // "bank", "cash", "savings"
    balance: v.number(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  videos: defineTable({
    userId: v.string(),
    tipo: v.string(),
    titulo: v.string(),
    autor: v.string(),
    descripcion: v.string(),
    thumbnail: v.string(),
    embedUrl: v.string(),
    duracion: v.string(),
    categoria: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_categoria", ["categoria"])
    .index("by_createdAt", ["createdAt"]),
});


