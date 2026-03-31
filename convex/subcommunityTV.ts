import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── QUERIES ──────────────────────────────────────────────────────────

export const getTVStatus = query({
  args: { subcommunityId: v.id("subcommunities") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) return null;

    const data = sub as any;
    return {
      tvEnabled: data.tvEnabled,
      tvStreamUrl: data.tvStreamUrl,
      tvIsLive: data.tvIsLive,
    };
  },
});

// ─── MUTATIONS ────────────────────────────────────────────────────────

export const startStream = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    streamUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const data = sub as any;
    if (!data.tvEnabled) throw new Error("TV no habilitada en esta subcomunidad");

    if (data.ownerId !== args.userId) {
      const membership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Solo owner o admin pueden iniciar transmisión");
      }
    }

    await ctx.db.patch(args.subcommunityId, {
      tvStreamUrl: args.streamUrl,
      tvIsLive: true,
    });

    return { success: true };
  },
});

export const stopStream = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const data = sub as any;
    if (data.ownerId !== args.userId) {
      const membership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("No autorizado");
      }
    }

    await ctx.db.patch(args.subcommunityId, {
      tvIsLive: false,
    });

    return { success: true };
  },
});

export const updateStreamUrl = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    streamUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const data = sub as any;
    if (data.ownerId !== args.userId) throw new Error("Solo el owner puede cambiar URL del stream");

    await ctx.db.patch(args.subcommunityId, {
      tvStreamUrl: args.streamUrl,
    });

    return { success: true };
  },
});
