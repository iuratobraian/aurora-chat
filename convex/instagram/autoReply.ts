// @ts-nocheck
import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const getAutoReplyRules = query({
  args: {
    userId: v.string(),
    accountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rules = await ctx.db
      .query("instagram_auto_reply_rules")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    if (args.accountId) {
      rules = rules.filter(r => r.accountId === args.accountId);
    }
    
    return rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  },
});

export const getActiveRules = query({
  args: { accountId: v.string() },
  handler: async (ctx, args) => {
    const rules = await ctx.db
      .query("instagram_auto_reply_rules")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  },
});

export const createAutoReplyRule = mutation({
  args: {
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
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const ruleId = await ctx.db.insert("instagram_auto_reply_rules", {
      userId: args.userId,
      accountId: args.accountId,
      triggerType: args.triggerType,
      triggerValue: args.triggerValue,
      responseType: args.responseType,
      responseText: args.responseText || "",
      templateId: args.templateId || "",
      aiPrompt: args.aiPrompt || "",
      aiModel: args.aiModel || "gpt-4o-mini",
      delayMinutes: args.delayMinutes || 0,
      activeHours: args.activeHours || undefined,
      onlyNewFollowers: args.onlyNewFollowers,
      excludeKeywords: args.excludeKeywords || [],
      triggerCount: 0,
      replyCount: 0,
      isActive: true,
      priority: args.priority || 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return ruleId;
  },
});

export const updateAutoReplyRule = mutation({
  args: {
    ruleId: v.id("instagram_auto_reply_rules"),
    userId: v.string(),
    triggerType: v.optional(v.union(
      v.literal("keyword"),
      v.literal("pattern"),
      v.literal("sender"),
      v.literal("always")
    )),
    triggerValue: v.optional(v.string()),
    responseType: v.optional(v.union(
      v.literal("text"),
      v.literal("template"),
      v.literal("ai_generated")
    )),
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
    onlyNewFollowers: v.optional(v.boolean()),
    excludeKeywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    
    if (!rule || rule.userId !== args.userId) {
      throw new Error("Rule not found or unauthorized");
    }
    
    const updates: any = { updatedAt: Date.now() };
    
    if (args.triggerType !== undefined) updates.triggerType = args.triggerType;
    if (args.triggerValue !== undefined) updates.triggerValue = args.triggerValue;
    if (args.responseType !== undefined) updates.responseType = args.responseType;
    if (args.responseText !== undefined) updates.responseText = args.responseText;
    if (args.templateId !== undefined) updates.templateId = args.templateId;
    if (args.aiPrompt !== undefined) updates.aiPrompt = args.aiPrompt;
    if (args.aiModel !== undefined) updates.aiModel = args.aiModel;
    if (args.delayMinutes !== undefined) updates.delayMinutes = args.delayMinutes;
    if (args.activeHours !== undefined) updates.activeHours = args.activeHours;
    if (args.onlyNewFollowers !== undefined) updates.onlyNewFollowers = args.onlyNewFollowers;
    if (args.excludeKeywords !== undefined) updates.excludeKeywords = args.excludeKeywords;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.priority !== undefined) updates.priority = args.priority;
    
    await ctx.db.patch(args.ruleId, updates);
    
    return { success: true };
  },
});

export const deleteAutoReplyRule = mutation({
  args: {
    ruleId: v.id("instagram_auto_reply_rules"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    
    if (!rule || rule.userId !== args.userId) {
      throw new Error("Rule not found or unauthorized");
    }
    
    await ctx.db.delete(args.ruleId);
    
    return { success: true };
  },
});

export const toggleRuleStatus = mutation({
  args: {
    ruleId: v.id("instagram_auto_reply_rules"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    
    if (!rule || rule.userId !== args.userId) {
      throw new Error("Rule not found or unauthorized");
    }
    
    await ctx.db.patch(args.ruleId, {
      isActive: !rule.isActive,
      updatedAt: Date.now(),
    });
    
    return { success: true, isActive: !rule.isActive };
  },
});

export const processIncomingMessage = action({
  args: {
    accountId: v.string(),
    senderId: v.string(),
    senderUsername: v.string(),
    messageText: v.string(),
    messageType: v.optional(v.string()),
    isNewFollower: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rules = await ctx.runQuery(
      api["instagram/autoReply"].getActiveRules,
      { accountId: args.accountId }
    );
    
    if (!rules || rules.length === 0) {
      return { matched: false, rule: null };
    }
    
    const sortedRules = rules.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
    
    const matchingRule = sortedRules.find((rule: any) => {
      switch (rule.triggerType) {
        case 'keyword':
          return args.messageText.toLowerCase().includes(rule.triggerValue.toLowerCase());
        case 'pattern':
          const regex = new RegExp(rule.triggerValue, 'i');
          return regex.test(args.messageText);
        case 'sender':
          return args.senderUsername.toLowerCase() === rule.triggerValue.toLowerCase();
        case 'always':
          return true;
        default:
          return false;
      }
    });
    
    if (!matchingRule) {
      return { matched: false, rule: null };
    }
    
    if (matchingRule.onlyNewFollowers && !args.isNewFollower) {
      return { matched: false, rule: null };
    }
    
    if (matchingRule.activeHours?.enabled) {
      const now = new Date();
      const hour = now.getHours();
      const { startHour, endHour } = matchingRule.activeHours;
      
      if (startHour <= endHour) {
        if (hour < startHour || hour >= endHour) {
          return { matched: false, rule: null };
        }
      } else {
        if (hour < startHour && hour >= endHour) {
          return { matched: false, rule: null };
        }
      }
    }
    
    await ctx.runMutation(
      api["instagram/autoReply"].incrementRuleStats,
      { ruleId: matchingRule._id }
    );
    
    return {
      matched: true,
      rule: matchingRule,
      shouldReply: true,
    };
  },
});

export const incrementRuleStats = mutation({
  args: { ruleId: v.id("instagram_auto_reply_rules") },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    
    if (rule) {
      await ctx.db.patch(args.ruleId, {
        triggerCount: rule.triggerCount + 1,
        replyCount: rule.replyCount + 1,
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

export const getRuleStats = query({
  args: { ruleId: v.id("instagram_auto_reply_rules") },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    
    if (!rule) {
      throw new Error("Rule not found");
    }
    
    return {
      triggerCount: rule.triggerCount,
      replyCount: rule.replyCount,
      matchRate: rule.triggerCount > 0 ? (rule.replyCount / rule.triggerCount) * 100 : 0,
    };
  },
});
