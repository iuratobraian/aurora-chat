import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSubcommunity = mutation({
  args: {
    parentId: v.id("communities"),
    ownerId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    visibility: v.union(v.literal("private"), v.literal("invite_only")),
    plan: v.string(),
    priceMonthly: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const parent = await ctx.db.get(args.parentId);
    if (!parent) throw new Error("Comunidad padre no encontrada");
    if (parent.ownerId !== args.ownerId) throw new Error("Solo el dueño puede crear subcomunidades");

    const existing = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent_slug", (q) => 
        q.eq("parentId", args.parentId).eq("slug", args.slug)
      )
      .first();
    
    if (existing) throw new Error("Slug ya existe en esta comunidad");

    const subcommunityId = await ctx.db.insert("subcommunities", {
      parentId: args.parentId,
      ownerId: args.ownerId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      type: "general",
      visibility: args.visibility,
      plan: args.plan,
      accessType: "free",
      priceMonthly: 0,
      adsEnabled: false,
      adFrequency: 0,
      allowedAdTypes: [],
      tvEnabled: false,
      tvStreamUrl: undefined,
      tvIsLive: false,
      maxMembers: args.maxMembers || 100,
      currentMembers: 0,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("subcommunityMembers", {
      subcommunityId,
      userId: args.ownerId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return subcommunityId;
  },
});

export const setSubcommunityPricing = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    ownerId: v.string(),
    priceMonthly: v.number(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const subcommunity = await ctx.db.get(args.subcommunityId);
    if (!subcommunity) throw new Error("Subcomunidad no encontrada");
    if (subcommunity.ownerId !== args.ownerId) throw new Error("No autorizado");

    await ctx.db.patch(args.subcommunityId, {
      accessType: args.priceMonthly > 0 ? "paid" : "free",
      priceMonthly: args.priceMonthly,
      plan: args.priceMonthly > 0 ? "paid" : "free",
    });

    return { success: true, priceMonthly: args.priceMonthly };
  },
});

export const subscribeToSubcommunity = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    paymentMethod: v.optional(v.string()),
    MercadoPagoSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const subcommunity = await ctx.db.get(args.subcommunityId);
    if (!subcommunity) throw new Error("Subcomunidad no encontrada");
    if (subcommunity.status !== "active") throw new Error("Subcomunidad inactiva");

    const existing = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (existing) throw new Error("Ya eres miembro de esta subcomunidad");

    if (subcommunity.currentMembers >= subcommunity.maxMembers) {
      throw new Error("Subcomunidad llena");
    }

    await ctx.db.insert("subcommunityMembers", {
      subcommunityId: args.subcommunityId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.subcommunityId, {
      currentMembers: subcommunity.currentMembers + 1,
    });

    return { success: true };
  },
});

export const cancelSubcommunitySubscription = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const membership = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) throw new Error("No eres miembro");
    if (membership.role === "owner") throw new Error("El dueño no puede cancelar");

    await ctx.db.delete(membership._id);

    const subcommunity = await ctx.db.get(args.subcommunityId);
    if (subcommunity) {
      await ctx.db.patch(args.subcommunityId, {
        currentMembers: Math.max(0, subcommunity.currentMembers - 1),
      });
    }

    return { success: true };
  },
});

export const getSubcommunityAnalytics = query({
  args: { subcommunityId: v.id("subcommunities") },
  handler: async (ctx, args) => {
    const subcommunity = await ctx.db.get(args.subcommunityId);
    if (!subcommunity) return null;

    const members = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", args.subcommunityId))
      .collect();

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentMembers = members.filter(m => m.joinedAt > thirtyDaysAgo);

    return {
      subcommunityId: args.subcommunityId,
      name: subcommunity.name,
      totalMembers: subcommunity.currentMembers,
      maxMembers: subcommunity.maxMembers,
      occupancyRate: Math.round((subcommunity.currentMembers / subcommunity.maxMembers) * 100),
      plan: subcommunity.plan,
      recentGrowth: recentMembers.length,
      growthRate: Math.round((recentMembers.length / Math.max(subcommunity.currentMembers, 1)) * 100),
      status: subcommunity.status,
      createdAt: subcommunity.createdAt,
      daysActive: Math.floor((Date.now() - subcommunity.createdAt) / (24 * 60 * 60 * 1000)),
    };
  },
});

export const getOwnerSubcommunitiesAnalytics = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const subcommunities = await ctx.db
      .query("subcommunities")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    const analytics = await Promise.all(
      subcommunities.map(async (sub) => {
        const members = await ctx.db
          .query("subcommunityMembers")
          .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", sub._id))
          .collect();

        const parent = await ctx.db.get(sub.parentId);

        return {
          subcommunityId: sub._id,
          name: sub.name,
          slug: sub.slug,
          parentName: parent?.name,
          totalMembers: sub.currentMembers,
          maxMembers: sub.maxMembers,
          occupancyRate: Math.round((sub.currentMembers / sub.maxMembers) * 100),
          plan: sub.plan,
          status: sub.status,
        };
      })
    );

    return {
      totalSubcommunities: subcommunities.length,
      totalMembers: analytics.reduce((sum, a) => sum + a.totalMembers, 0),
      averageOccupancy: Math.round(
        analytics.reduce((sum, a) => sum + a.occupancyRate, 0) / Math.max(analytics.length, 1)
      ),
      subcommunities: analytics,
    };
  },
});

export const getSubcommunityRevenue = query({
  args: { subcommunityId: v.id("subcommunities") },
  handler: async (ctx, args) => {
    const subcommunity = await ctx.db.get(args.subcommunityId);
    if (!subcommunity) return null;

    const members = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", args.subcommunityId))
      .collect();

    const activeMembers = members.filter(m => m.role !== "owner");

    return {
      subcommunityId: args.subcommunityId,
      memberCount: activeMembers.length,
      estimatedMonthlyRevenue: activeMembers.length * (subcommunity.plan === "paid" ? 50 : 0),
      plan: subcommunity.plan,
    };
  },
});
