import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkRateLimit } from "./lib/rateLimit";

// Obtener todos los recursos
export const getRecursos = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("recursos").order("desc").collect();
    },
});

// Obtener recursos de un usuario
export const getRecursosByUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("recursos")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

// Crear recurso
export const createRecurso = mutation({
    args: {
        userId: v.string(),
        titulo: v.string(),
        descripcion: v.string(),
        categoria: v.string(),
        plataforma: v.string(),
        precio: v.number(),
        version: v.string(),
        tags: v.array(v.string()),
        archivoUrl: v.optional(v.string()),
        tradingViewUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");
        if (args.userId !== identity.subject) {
            const caller = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
                .unique();
            if (!caller || (caller.role || 0) < 5) throw new Error("No autorizado para crear recursos a nombre de otro");
        }
        const allowed = await checkRateLimit(ctx, identity.subject, "createRecurso");
        if (!allowed) throw new Error("Límite de creacion de recursos excedido. Intenta más tarde.");
        return await ctx.db.insert("recursos", {
            ...args,
            descargas: 0,
            valoracion: 0,
            likes: [],
            comentarios: [],
            createdAt: Date.now(),
        });
    },
});

// Actualizar recurso (likes, comentarios, descargas)
export const updateRecurso = mutation({
    args: {
        id: v.id("recursos"),
        likes: v.optional(v.array(v.string())),
        comentarios: v.optional(v.array(v.any())),
        descargas: v.optional(v.number()),
        valoracion: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const allowed = await checkRateLimit(ctx, identity.subject, "updateRecurso");
        if (!allowed) throw new Error("Límite de actualizacion de recursos excedido. Intenta más tarde.");

        const recurso = await ctx.db.get(args.id);
        if (!recurso) throw new Error("Recurso no encontrado");

        if (recurso.userId !== identity.subject) {
            const caller = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
                .unique();
            if (!caller || (caller.role || 0) < 5) throw new Error("No tienes permiso para editar este recurso");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Eliminar recurso
export const deleteRecurso = mutation({
    args: { id: v.id("recursos") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const allowed = await checkRateLimit(ctx, identity.subject, "deleteRecurso");
        if (!allowed) throw new Error("Límite de eliminacion de recursos excedido. Intenta más tarde.");

        const recurso = await ctx.db.get(args.id);
        if (!recurso) throw new Error("Recurso no encontrado");

        if (recurso.userId !== identity.subject) {
            const caller = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
                .unique();
            if (!caller || (caller.role || 0) < 5) throw new Error("No tienes permiso para eliminar este recurso");
        }

        await ctx.db.delete(args.id);
    },
});
