import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getActivePlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .take(50);
  },
});

export const getPlanById = query({
  args: { planId: v.id("subscriptionPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});

export const getCurrentSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .first();
    return subscriptions;
  },
});

export const createSubscription = mutation({
  args: {
    userId: v.string(),
    plan: v.string(),
    provider: v.optional(v.union(v.literal("mercadopago"), v.literal("zenobank"), v.literal("stripe"))),
    externalReference: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("canceled"), v.literal("expired"), v.literal("pending"))),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: args.plan,
      provider: args.provider || "mercadopago",
      status: args.status || "pending",
      externalReference: args.externalReference,
      currentPeriodEnd: args.currentPeriodEnd,
      createdAt: Date.now(),
    });
    return subscriptionId;
  },
});

export const updateSubscriptionStatus = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("expired"), v.literal("pending")),
    mercadopagoSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      status: args.status,
      mercadopagoSubscriptionId: args.mercadopagoSubscriptionId,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    });
  },
});

export const cancelSubscription = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .first();

    if (subscription) {
      // TODO: Call provider API to cancel recurring billing
      // For MercadoPago: call mercadopagoProvider.cancelPreapproval(subscription.externalReference)
      // For Stripe: call stripe.subscriptions.cancel(subscription.externalReference)
      await ctx.db.patch(subscription._id, {
        status: "canceled",
        cancelAtPeriodEnd: true,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getUserSubscriptionHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});
