import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const reportError = mutation({
  args: {
    errorMessage: v.string(),
    errorStack: v.optional(v.string()),
    componentStack: v.optional(v.string()),
    pageUrl: v.string(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    let userId: string | undefined;
    let userEmail: string | undefined;
    let userName: string | undefined;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        userId = identity.subject;
        userEmail = identity.email;
        userName = identity.name || identity.nickname;
      }
    } catch {
    }

    const errorId = await ctx.db.insert("systemErrors", {
      errorMessage: args.errorMessage,
      errorStack: args.errorStack,
      componentStack: args.componentStack,
      userId,
      userEmail,
      userName,
      pageUrl: args.pageUrl,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      severity: args.severity,
      status: "new",
      createdAt: Date.now(),
    });

    return { errorId, reported: true };
  },
});

export const getUnreviewedErrors = query({
  args: {},
  handler: async (ctx) => {
    const errors = await ctx.db
      .query("systemErrors")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .order("desc")
      .take(50);

    return errors;
  },
});

export const getErrorStats = query({
  args: {},
  handler: async (ctx) => {
    const allErrors = await ctx.db.query("systemErrors").collect();
    
    const stats = {
      total: allErrors.length,
      new: allErrors.filter(e => e.status === "new").length,
      reviewed: allErrors.filter(e => e.status === "reviewed").length,
      resolved: allErrors.filter(e => e.status === "resolved").length,
      critical: allErrors.filter(e => e.severity === "critical" && e.status !== "resolved").length,
      today: allErrors.filter(e => {
        const today = new Date();
        const errorDate = new Date(e.createdAt);
        return errorDate.toDateString() === today.toDateString();
      }).length,
    };

    return stats;
  },
});

export const markErrorReviewed = mutation({
  args: {
    errorId: v.id("systemErrors"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    
    if (!admin || (admin.role || 0) < 5) {
      throw new Error("Solo admins pueden revisar errores");
    }

    await ctx.db.patch(args.errorId, {
      status: "reviewed",
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
      notes: args.notes,
    });

    return { success: true };
  },
});

export const resolveError = mutation({
  args: {
    errorId: v.id("systemErrors"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    
    if (!admin || (admin.role || 0) < 5) {
      throw new Error("Solo admins pueden resolver errores");
    }

    await ctx.db.patch(args.errorId, {
      status: "resolved",
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
      notes: args.notes,
    });

    return { success: true };
  },
});
