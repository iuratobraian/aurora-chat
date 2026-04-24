import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExpenses = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const addExpense = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    amount: v.number(),
    date: v.string(),
    category: v.string(),
    paymentMethod: v.string(),
    note: v.optional(v.string()),
    cardId: v.optional(v.string()),
    totalInstallments: v.optional(v.number()),
    currentInstallment: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getFixedExpenses = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fixedExpenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const addFixedExpense = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    dayOfMonth: v.number(),
    active: v.boolean(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("fixedExpenses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getCards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creditCards")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const addCard = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    limit: v.number(),
    closingDay: v.number(),
    dueDay: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("creditCards", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
