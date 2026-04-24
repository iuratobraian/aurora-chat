import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
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
    user1Id: v.optional(v.id("users")),
    user2Id: v.optional(v.id("users")),
  }).index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_users", ["user1Id", "user2Id"]),

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
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    privacyMode: v.optional(v.union(v.literal("everyone"), v.literal("requests"))),
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
});
