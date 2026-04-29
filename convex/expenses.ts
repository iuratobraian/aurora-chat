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
    accountId: v.optional(v.string()),
    totalInstallments: v.optional(v.number()),
    currentInstallment: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // If accountId is provided, update the account balance
    if (args.accountId) {
      const account = await ctx.db.get(args.accountId as any);
      if (account) {
        const newBalance = args.type === "income" 
          ? account.balance + args.amount 
          : account.balance - args.amount;
        await ctx.db.patch(account._id, { balance: newBalance });
      }
    }

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

export const getAccounts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const addAccount = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    type: v.string(),
    balance: v.number(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    userId: v.string(),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    amount: v.optional(v.number()),
    date: v.optional(v.string()),
    category: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    note: v.optional(v.string()),
    cardId: v.optional(v.string()),
    accountId: v.optional(v.string()),
    totalInstallments: v.optional(v.number()),
    currentInstallment: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteExpense = mutation({
  args: {
    id: v.id("expenses"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // If expense was linked to an account, revert the balance
    const expense = await ctx.db.get(args.id as any);
    if (expense && expense.accountId) {
      const account = await ctx.db.get(expense.accountId as any);
      if (account) {
        const revertAmount = expense.type === "income" 
          ? -expense.amount 
          : expense.amount;
        await ctx.db.patch(account._id, { balance: account.balance + revertAmount });
      }
    }
    return await ctx.db.delete(args.id as any);
  },
});
