import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── PLANES Y LÍMITES ────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, {
  maxSubcommunities: number;
  maxMembersPerSub: number;
  adsAllowed: boolean;
  canDisableAds: boolean;
  defaultAdFrequency: number;
  tvAllowed: boolean;
  tvMaxViewers: number;
  chatAllowed: boolean;
  analyticsEnabled: boolean;
  customBranding: boolean;
}> = {
  free: {
    maxSubcommunities: 2,
    maxMembersPerSub: 50,
    adsAllowed: true,
    canDisableAds: false,
    defaultAdFrequency: 5,
    tvAllowed: false,
    tvMaxViewers: 0,
    chatAllowed: true,
    analyticsEnabled: false,
    customBranding: false,
  },
  starter: {
    maxSubcommunities: 3,
    maxMembersPerSub: 200,
    adsAllowed: true,
    canDisableAds: true,
    defaultAdFrequency: 8,
    tvAllowed: true,
    tvMaxViewers: 50,
    chatAllowed: true,
    analyticsEnabled: false,
    customBranding: false,
  },
  growth: {
    maxSubcommunities: 10,
    maxMembersPerSub: 1000,
    adsAllowed: true,
    canDisableAds: true,
    defaultAdFrequency: 0,
    tvAllowed: true,
    tvMaxViewers: 200,
    chatAllowed: true,
    analyticsEnabled: true,
    customBranding: false,
  },
  scale: {
    maxSubcommunities: 999,
    maxMembersPerSub: 5000,
    adsAllowed: true,
    canDisableAds: true,
    defaultAdFrequency: 0,
    tvAllowed: true,
    tvMaxViewers: 1000,
    chatAllowed: true,
    analyticsEnabled: true,
    customBranding: true,
  },
  enterprise: {
    maxSubcommunities: 9999,
    maxMembersPerSub: 99999,
    adsAllowed: true,
    canDisableAds: true,
    defaultAdFrequency: 0,
    tvAllowed: true,
    tvMaxViewers: 99999,
    chatAllowed: true,
    analyticsEnabled: true,
    customBranding: true,
  },
};

// ─── QUERIES ──────────────────────────────────────────────────────────

export const getPlanSettings = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("communityPlanSettings")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .first();

    if (settings) return settings;

    const community = await ctx.db.get(args.communityId);
    if (!community) return null;

    const plan = (community as any).plan || "free";
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    return { communityId: args.communityId, plan, ...limits, updatedAt: 0 };
  },
});

export const canCreateSubcommunity = query({
  args: { communityId: v.id("communities"), userId: v.string() },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) return { allowed: false, reason: "Comunidad no encontrada" };

    const comm = community as any;
    if (comm.ownerId !== args.userId) {
      return { allowed: false, reason: "Solo el owner puede crear subcomunidades" };
    }

    const plan = comm.plan || "free";
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    const existing = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent", (q) => q.eq("parentId", args.communityId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (existing.length >= limits.maxSubcommunities) {
      return { allowed: false, reason: `Límite de subcomunidades alcanzado (${limits.maxSubcommunities}). Mejora tu plan.` };
    }

    return { allowed: true, limits, currentCount: existing.length };
  },
});

export const getPlanLimits = query({
  args: { plan: v.string() },
  handler: async (_ctx, args) => {
    return PLAN_LIMITS[args.plan] || PLAN_LIMITS.free;
  },
});

// ─── MUTATIONS ────────────────────────────────────────────────────────

export const initializePlanSettings = mutation({
  args: {
    communityId: v.id("communities"),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("communityPlanSettings")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .first();

    if (existing) return existing._id;

    const limits = PLAN_LIMITS[args.plan] || PLAN_LIMITS.free;

    return await ctx.db.insert("communityPlanSettings", {
      communityId: args.communityId,
      plan: args.plan,
      ...limits,
      updatedAt: Date.now(),
    });
  },
});

export const updatePlan = mutation({
  args: {
    communityId: v.id("communities"),
    newPlan: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Comunidad no encontrada");

    const comm = community as any;
    if (comm.ownerId !== args.userId) throw new Error("No autorizado");

    const limits = PLAN_LIMITS[args.newPlan] || PLAN_LIMITS.free;

    const existing = await ctx.db
      .query("communityPlanSettings")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.newPlan,
        ...limits,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("communityPlanSettings", {
        communityId: args.communityId,
        plan: args.newPlan,
        ...limits,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.communityId, { plan: args.newPlan as "free" | "starter" | "growth" | "scale" | "enterprise" });

    return { success: true, limits };
  },
});

export const toggleAds = mutation({
  args: {
    communityId: v.id("communities"),
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId) throw new Error("Solo el owner puede cambiar publicidad");

    const settings = await ctx.db
      .query("communityPlanSettings")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .first();

    if (settings && !settings.canDisableAds && !args.enabled) {
      throw new Error("Tu plan no permite desactivar publicidad. Mejora a Starter o superior.");
    }

    await ctx.db.patch(args.subcommunityId, {
      adsEnabled: args.enabled,
      adFrequency: args.enabled ? (settings?.defaultAdFrequency || 8) : 0,
    });

    return { success: true };
  },
});

export const setAdFrequency = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    frequency: v.number(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId) throw new Error("No autorizado");

    await ctx.db.patch(args.subcommunityId, {
      adFrequency: Math.max(3, Math.min(15, args.frequency)),
    });

    return { success: true };
  },
});

export const setAllowedAdTypes = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    types: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId) throw new Error("No autorizado");

    const validTypes = ["feed", "sidebar", "banner"];
    const filtered = args.types.filter(t => validTypes.includes(t));

    await ctx.db.patch(args.subcommunityId, {
      allowedAdTypes: filtered,
    });

    return { success: true };
  },
});
