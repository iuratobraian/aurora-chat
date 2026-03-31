import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

export const getFindings = query({
  args: {
    category: v.optional(v.string()),
    severity: v.optional(v.union(v.literal("info"), v.literal("warning"), v.literal("critical"))),
    status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("dismissed"))),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) return [];

    let q = ctx.db.query("adminFindings");
    
    if (args.category) {
      q = q.filter((q) => q.eq("category", args.category));
    }
    if (args.severity) {
      q = q.filter((q) => q.eq("severity", args.severity));
    }
    if (args.status) {
      q = q.filter((q) => q.eq("status", args.status));
    }

    const results = await q.collect();
    return results.sort((a, b) => b.detectedAt - a.detectedAt).slice(0, 100);
  },
});

export const addFinding = mutation({
  args: {
    category: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    filePath: v.optional(v.string()),
    lineNumber: v.optional(v.number()),
    source: v.optional(v.union(v.literal("manual"), v.literal("guard"))),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    route: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden agregar findings");

    return ctx.db.insert("adminFindings", {
      ...args,
      status: "open",
      detectedAt: Date.now(),
    });
  },
});

export const updateFindingStatus = mutation({
  args: {
    findingId: v.id("adminFindings"),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden actualizar findings");

    const identity = await ctx.auth.getUserIdentity();
    
    return ctx.db.patch(args.findingId, {
      status: args.status,
      resolvedAt: args.status === "resolved" ? Date.now() : undefined,
      resolvedBy: args.status === "resolved" ? identity?.subject : undefined,
    });
  },
});

export const deleteFinding = mutation({
  args: { findingId: v.id("adminFindings") },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden eliminar findings");

    await ctx.db.delete(args.findingId);
  },
});

export const getFindingStats = query({
  handler: async (ctx) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) return { total: 0, open: 0, inProgress: 0, resolved: 0, dismissed: 0, critical: 0 };

    const all = await ctx.db.query("adminFindings").collect();
    
    return {
      total: all.length,
      open: all.filter(f => f.status === "open").length,
      inProgress: all.filter(f => f.status === "in_progress").length,
      resolved: all.filter(f => f.status === "resolved").length,
      dismissed: all.filter(f => f.status === "dismissed").length,
      critical: all.filter(f => f.severity === "critical").length,
    };
  },
});
