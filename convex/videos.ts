import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkRateLimit } from "./lib/rateLimit";

export const getVideos = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("videos").order("desc").collect();
    },
});

export const saveVideo = mutation({
    args: {
        id: v.optional(v.id("videos")),
        userId: v.string(),
        tipo: v.string(),
        titulo: v.string(),
        autor: v.string(),
        descripcion: v.string(),
        thumbnail: v.string(),
        embedUrl: v.string(),
        duracion: v.string(),
        categoria: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) throw new Error("userId requerido");

        const allowed = await checkRateLimit(ctx, args.userId, "saveVideo");
        if (!allowed) throw new Error("Límite de guardado de videos excedido. Intenta más tarde.");

        if (args.id) {
            const { id, userId, ...videoPatch } = args;
            const video = await ctx.db.get(id);
            if (video && video.autor !== userId) {
                const caller = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", userId))
                    .unique();
                if (!caller || (caller.role || 0) < 5) throw new Error("No tienes permiso para editar este video");
            }
            await ctx.db.patch(id, videoPatch);
            return id;
        } else {
            return await ctx.db.insert("videos", {
                ...args,
                createdAt: Date.now(),
            });
        }
    },
});

export const deleteVideo = mutation({
    args: { id: v.id("videos"), userId: v.string() },
    handler: async (ctx, args) => {
        if (!args.userId) throw new Error("userId requerido");

        const video = await ctx.db.get(args.id);
        if (!video) throw new Error("Video no encontrado");

        if (video.autor !== args.userId) {
            const caller = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .unique();
            if (!caller || (caller.role || 0) < 5) throw new Error("No tienes permiso para eliminar este video");
        }

        await ctx.db.delete(args.id);
    },
});

export const seedVideos = mutation({
    args: {
        userId: v.string(),
        videos: v.array(v.object({
            tipo: v.string(),
            titulo: v.string(),
            autor: v.string(),
            descripcion: v.string(),
            thumbnail: v.string(),
            embedUrl: v.string(),
            duracion: v.string(),
            categoria: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        if (!args.userId) throw new Error("userId requerido");

        const caller = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
        
        if (!caller || (caller.role || 0) < 5) {
            throw new Error("No tienes permiso para hacer seed de videos");
        }

        let added = 0;
        for (const video of args.videos) {
            await ctx.db.insert("videos", {
                ...video,
                createdAt: Date.now(),
            });
            added++;
        }

        return { added };
    },
});

export const bulkSaveVideos = mutation({
    args: {
        userId: v.string(),
        videos: v.array(v.object({
            videoId: v.string(),
            tipo: v.string(),
            titulo: v.string(),
            autor: v.string(),
            descripcion: v.string(),
            thumbnail: v.string(),
            embedUrl: v.string(),
            duracion: v.string(),
            categoria: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        if (!args.userId) throw new Error("userId requerido");

        const caller = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
        
        if (!caller || (caller.role || 0) < 5) {
            throw new Error("No tienes permiso para guardar videos en bulk");
        }

        let added = 0;
        let skipped = 0;

        for (const video of args.videos) {
            const allVideos = await ctx.db.query("videos").collect();
            const exists = allVideos.find(v => (v as any).videoId === video.videoId);
            
            if (exists) {
                skipped++;
                continue;
            }

            await ctx.db.insert("videos", {
                tipo: video.tipo,
                titulo: video.titulo,
                autor: video.autor,
                descripcion: video.descripcion,
                thumbnail: video.thumbnail,
                embedUrl: video.embedUrl,
                duracion: video.duracion,
                categoria: video.categoria,
                createdAt: Date.now(),
            });
            added++;
        }

        return { added, skipped };
    },
});
