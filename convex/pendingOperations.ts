import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_RETRIES = 5;
const RETENTION_HOURS = 24;

export const queueOperation = mutation({
  args: {
    operationType: v.union(
      v.literal("create_post"),
      v.literal("update_post"),
      v.literal("delete_post"),
      v.literal("add_comment"),
      v.literal("update_profile"),
      v.literal("toggle_follow"),
      v.literal("like_post"),
      v.literal("share_post")
    ),
    payload: v.any(),
    targetId: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const operationId = await ctx.db.insert("pendingOperations", {
      operationType: args.operationType,
      payload: args.payload,
      targetId: args.targetId,
      userId: args.userId,
      status: "pending",
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      createdAt: Date.now(),
      expiresAt: Date.now() + (RETENTION_HOURS * 60 * 60 * 1000),
    });

    return { operationId, queued: true };
  },
});

export const getPendingOperations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const operations = await ctx.db
      .query("pendingOperations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending"),
        q.eq(q.field("status"), "failed")
      ))
      .order("desc")
      .take(50);

    return operations;
  },
});

export const getAllPendingOperations = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let operations;
    
    if (args.status) {
      operations = await ctx.db
        .query("pendingOperations")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .take(100);
    } else {
      operations = await ctx.db
        .query("pendingOperations")
        .filter((q) => q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "failed")
        ))
        .order("desc")
        .take(100);
    }

    return operations;
  },
});

export const getPendingStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("pendingOperations").collect();
    
    const stats = {
      total: all.length,
      pending: all.filter(o => o.status === "pending").length,
      failed: all.filter(o => o.status === "failed").length,
      processing: all.filter(o => o.status === "processing").length,
      byType: {} as Record<string, number>,
      criticalUsers: [] as { userId: string; count: number }[],
    };

    all.forEach(o => {
      if (o.status === "pending" || o.status === "failed") {
        stats.byType[o.operationType] = (stats.byType[o.operationType] || 0) + 1;
      }
    });

    const userCounts: Record<string, number> = {};
    all.filter(o => o.status === "pending" || o.status === "failed").forEach(o => {
      userCounts[o.userId] = (userCounts[o.userId] || 0) + 1;
    });
    
    stats.criticalUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    return stats;
  },
});

export const markOperationProcessing = mutation({
  args: { operationId: v.id("pendingOperations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.operationId, {
      status: "processing",
    });
  },
});

export const markOperationCompleted = mutation({
  args: { operationId: v.id("pendingOperations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.operationId, {
      status: "completed",
      processedAt: Date.now(),
    });
  },
});

export const markOperationFailed = mutation({
  args: {
    operationId: v.id("pendingOperations"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);
    if (!operation) return { success: false, reason: "Operation not found" };

    const newRetryCount = operation.retryCount + 1;
    
    if (newRetryCount >= operation.maxRetries) {
      await ctx.db.patch(args.operationId, {
        status: "failed",
        retryCount: newRetryCount,
        lastError: args.error,
      });
      return { success: false, reason: "Max retries exceeded", retries: newRetryCount };
    }

    await ctx.db.patch(args.operationId, {
      status: "pending",
      retryCount: newRetryCount,
      lastError: args.error,
    });
    
    return { success: true, retries: newRetryCount };
  },
});

export const retryOperation = mutation({
  args: { operationId: v.id("pendingOperations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.operationId, {
      status: "pending",
      retryCount: 0,
    });
    return { success: true };
  },
});

export const deleteOperation = mutation({
  args: { operationId: v.id("pendingOperations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.operationId);
    return { success: true };
  },
});

export const cleanupExpiredOperations = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("pendingOperations").collect();
    const now = Date.now();
    let deleted = 0;

    for (const op of all) {
      if (
        (op.status === "completed" && op.processedAt && now - op.processedAt > 24 * 60 * 60 * 1000) ||
        (op.expiresAt && now > op.expiresAt)
      ) {
        await ctx.db.delete(op._id);
        deleted++;
      }
    }

    return { deleted };
  },
});

export const retryAllPending = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let operations: any[];
    
    if (args.userId) {
      const allOps = await ctx.db
        .query("pendingOperations")
        .withIndex("by_user", (q) => q.eq("userId", args.userId as string))
        .collect();
      operations = allOps.filter(o => o.status === "pending" || o.status === "failed").slice(0, 50);
    } else {
      const allOps = await ctx.db.query("pendingOperations").collect();
      operations = allOps.filter(o => o.status === "pending" || o.status === "failed").slice(0, 50);
    }

    let retried = 0;
    for (const op of operations) {
      await ctx.db.patch(op._id, { status: "pending", retryCount: 0 });
      retried++;
    }

    return { retried };
  },
});
