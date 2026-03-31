import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

function generateDiff(prev: any, next: any): any {
    if (!prev || !next) return null;
    const diff: Record<string, { from: any; to: any }> = {};
    const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
    for (const key of allKeys) {
        if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
            diff[key] = { from: prev[key], to: next[key] };
        }
    }
    return Object.keys(diff).length > 0 ? diff : null;
}

export const createBackup = mutation({
    args: {
        itemId: v.string(),
        itemType: v.union(v.literal("post"), v.literal("profile"), v.literal("community"), v.literal("comment"), v.literal("system_export")),
        operation: v.union(v.literal("create"), v.literal("update"), v.literal("delete"), v.literal("restore")),
        previousData: v.optional(v.any()),
        newData: v.optional(v.any()),
        userId: v.string(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const isAdmin = await getCallerAdminStatus(ctx);
        if (!isAdmin) throw new Error("Solo administradores pueden crear backups");
        
        const diff = args.previousData && args.newData
            ? generateDiff(args.previousData, args.newData)
            : null;

        const backupId = await ctx.db.insert("backups", {
            itemId: args.itemId,
            itemType: args.itemType,
            operation: args.operation,
            previousData: args.previousData || null,
            newData: args.newData || null,
            diff,
            userId: args.userId,
            createdAt: Date.now(),
            restored: false,
        });

        return backupId;
    },
});

export const createBackupInternal = internalMutation({
    args: {
        itemId: v.string(),
        itemType: v.union(v.literal("post"), v.literal("profile"), v.literal("community"), v.literal("comment"), v.literal("system_export")),
        operation: v.union(v.literal("create"), v.literal("update"), v.literal("delete"), v.literal("restore")),
        previousData: v.optional(v.any()),
        newData: v.optional(v.any()),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const diff = args.previousData && args.newData
            ? generateDiff(args.previousData, args.newData)
            : null;

        return await ctx.db.insert("backups", {
            itemId: args.itemId,
            itemType: args.itemType,
            operation: args.operation,
            previousData: args.previousData || null,
            newData: args.newData || null,
            diff,
            userId: args.userId,
            createdAt: Date.now(),
            restored: false,
        });
    },
});

export const restoreBackup = mutation({
    args: {
        backupId: v.id("backups"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const backup = await ctx.db.get(args.backupId);
        if (!backup) throw new Error("Backup no encontrado");

        const admin = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
        if (!admin || (admin.role || 0) < 5) throw new Error("Solo admins pueden restaurar backups");

        let restoredItem: any = null;

        switch (backup.itemType) {
            case "post": {
                const posts = await ctx.db
                    .query("posts")
                    .collect();
                const existing = posts.find((p: any) => p._id.toString() === backup.itemId || p._id === backup.itemId);
                if (existing) {
                    await ctx.db.patch(existing._id, backup.previousData || {});
                } else if (backup.previousData) {
                    await ctx.db.insert("posts", {
                        ...backup.previousData,
                        status: "active",
                    });
                }
                restoredItem = existing || backup.previousData;
                break;
            }
            case "profile": {
                const profiles = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", backup.itemId))
                    .collect();
                const existing = profiles[0];
                if (existing) {
                    await ctx.db.patch(existing._id, backup.previousData || {});
                }
                restoredItem = existing || backup.previousData;
                break;
            }
            case "comment": {
                restoredItem = backup.previousData;
                break;
            }
            default:
                restoredItem = backup.previousData;
        }

        await ctx.db.patch(args.backupId, { restored: true });

        await ctx.db.insert("backups", {
            itemId: backup.itemId,
            itemType: backup.itemType,
            operation: "update",
            previousData: restoredItem,
            newData: null,
            diff: { action: "restore", fromBackup: args.backupId },
            userId: args.userId,
            createdAt: Date.now(),
            restored: false,
        });

        return { success: true, restoredItem };
    },
});

export const getBackupHistory = query({
    args: {
        itemId: v.string(),
        itemType: v.optional(v.union(v.literal("post"), v.literal("profile"), v.literal("community"), v.literal("comment"), v.literal("system_export"))),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;

        if (args.itemType) {
            return await ctx.db
                .query("backups")
                .withIndex("by_item", (q) => q.eq("itemType", args.itemType!).eq("itemId", args.itemId))
                .order("desc")
                .take(limit);
        }

        const allBackups = await ctx.db
            .query("backups")
            .order("desc")
            .take(500);

        return allBackups.filter((b) => b.itemId === args.itemId).slice(0, limit);
    },
});

export const getBackupById = query({
    args: { backupId: v.id("backups") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.backupId);
    },
});

export const getUserBackups = query({
    args: {
        userId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 100;
        return await ctx.db
            .query("backups")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);
    },
});

export const getRecentBackups = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;
        return await ctx.db
            .query("backups")
            .withIndex("by_createdAt", (q) => q)
            .order("desc")
            .take(limit);
    },
});

export const deleteOldBackups = mutation({
    args: {
        olderThanDays: v.number(),
        keepRestored: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const isAdmin = await getCallerAdminStatus(ctx);
        if (!isAdmin) throw new Error("Solo administradores pueden eliminar backups");
        
        const cutoff = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000;
        const allBackups = await ctx.db.query("backups").collect();

        let deleted = 0;
        for (const backup of allBackups) {
            if (backup.createdAt < cutoff) {
                if (args.keepRestored && backup.restored) continue;
                await ctx.db.delete(backup._id);
                deleted++;
            }
        }

        return { deleted };
    },
});

export const getBackupStats = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("backups").collect();
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        const stats = {
            total: all.length,
            last24h: all.filter((b) => now - b.createdAt < day).length,
            last7days: all.filter((b) => now - b.createdAt < 7 * day).length,
            byType: {} as Record<string, number>,
            byOperation: {} as Record<string, number>,
            restored: all.filter((b) => b.restored).length,
        };

        for (const backup of all) {
            stats.byType[backup.itemType] = (stats.byType[backup.itemType] || 0) + 1;
            stats.byOperation[backup.operation] = (stats.byOperation[backup.operation] || 0) + 1;
        }

        return stats;
    },
});

export const exportSystemBackup = mutation({
    args: { adminId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const isAdmin = await getCallerAdminStatus(ctx);
        if (!isAdmin) throw new Error("Solo administradores pueden exportar backups del sistema");
        
        const adminUserId = args.adminId || (await ctx.auth.getUserIdentity())?.subject;

        const profiles = await ctx.db.query("profiles").collect();
        const posts = await ctx.db.query("posts").collect();
        const communities = await ctx.db.query("communities").collect();
        const ads = await ctx.db.query("ads").collect();
        const notifications = await ctx.db.query("notifications").collect();

        const backupData = {
            version: "1.0",
            exportedAt: Date.now(),
            exportedBy: adminUserId || 'system',
            data: {
                profiles,
                posts,
                communities,
                ads,
                notifications,
            }
        };

        const backupId = await ctx.db.insert("backups", {
            itemId: "system_full_export",
            itemType: "system_export",
            operation: "create",
            previousData: null,
            newData: backupData,
            userId: adminUserId || 'system',
            createdAt: Date.now(),
            restored: false,
        });

        return {
            backupId,
            data: backupData,
            message: "Backup exportado correctamente"
        };
    },
});

export const getSystemBackups = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        const backups = await ctx.db
            .query("backups")
            .withIndex("by_createdAt", (q) => q)
            .order("desc")
            .take(limit * 2);
        
        return backups.filter((b) => b.itemType === "system_export").slice(0, limit);
    },
});

export const importSystemBackup = mutation({
    args: {
        backupId: v.id("backups"),
        adminId: v.optional(v.string()),
        action: v.union(v.literal("merge"), v.literal("replace")),
    },
    handler: async (ctx, args) => {
        const isAdmin = await getCallerAdminStatus(ctx);
        if (!isAdmin) throw new Error("Solo administradores pueden importar backups del sistema");

        const backup = await ctx.db.get(args.backupId);
        if (!backup) throw new Error("Backup no encontrado");
        if (backup.itemType !== "system_export") throw new Error("No es un backup del sistema");

        const backupData = backup.newData as any;
        if (!backupData || !backupData.data) {
            throw new Error("Datos de backup inválidos");
        }

        let imported = { profiles: 0, posts: 0, communities: 0, ads: 0 };

        if (args.action === "replace") {
            if (backupData.data.profiles) {
                const existingProfiles = await ctx.db.query("profiles").collect();
                for (const p of existingProfiles) {
                    await ctx.db.delete(p._id);
                }
                for (const p of backupData.data.profiles) {
                    const { _id, ...data } = p;
                    await ctx.db.insert("profiles", data as any);
                    imported.profiles++;
                }
            }
        }

        await ctx.db.patch(args.backupId, { restored: true });

        return {
            success: true,
            imported,
            message: "Backup importado correctamente"
        };
    },
});

export const createPendingSync = mutation({
    args: {
        operation: v.union(v.literal("create"), v.literal("update"), v.literal("delete")),
        itemType: v.string(),
        itemId: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("pendingSync")
            .collect();
        const duplicate = existing.find(
            (p) => p.itemId === args.itemId && p.itemType === args.itemType
        );

        if (duplicate) {
            await ctx.db.patch(duplicate._id, {
                operation: args.operation,
                data: args.data,
                timestamp: Date.now(),
            });
            return duplicate._id;
        }

        return await ctx.db.insert("pendingSync", {
            operation: args.operation,
            itemType: args.itemType,
            itemId: args.itemId,
            data: args.data,
            timestamp: Date.now(),
            retries: 0,
        });
    },
});

export const getPendingSync = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("pendingSync")
            .withIndex("by_timestamp", (q) => q)
            .order("asc")
            .collect();
    },
});

export const removePendingSync = mutation({
    args: { id: v.id("pendingSync") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const updatePendingSyncRetry = mutation({
    args: {
        id: v.id("pendingSync"),
        error: v.string(),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item) return;

        await ctx.db.patch(args.id, {
            retries: item.retries + 1,
            lastError: args.error,
        });
    },
});

export const clearAllPendingSync = mutation({
    args: {},
    handler: async (ctx) => {
        const isAdmin = await getCallerAdminStatus(ctx);
        if (!isAdmin) throw new Error("Solo administradores pueden limpiar sincronizaciones pendientes");
        
        const all = await ctx.db.query("pendingSync").collect();
        for (const item of all) {
            await ctx.db.delete(item._id);
        }
        return { cleared: all.length };
    },
});
