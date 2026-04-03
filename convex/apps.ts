import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/auth";

const DEFAULT_APPS = [
  {
    appId: "saboteador_invisible",
    name: "El Saboteador Invisible",
    description: "Juego de deducción social. Encuentra al traidor antes de que sabotee todo.",
    icon: "visibility_off",
    category: "Social Deduction",
    visibility: "public",
    status: "beta",
    minPlayers: 4,
    maxPlayers: 10,
  },
  {
    appId: "trivia_trading",
    name: "Trivia Trading",
    description: "Pon a prueba tus conocimientos de trading con preguntas desafiantes.",
    icon: "quiz",
    category: "Quiz",
    visibility: "public",
    status: "active",
    minPlayers: 1,
    maxPlayers: 1,
  },
  {
    appId: "trading_simulation",
    name: "Simulador de Trading",
    description: "Practica operaciones sin riesgo con dinero virtual.",
    icon: "trending_up",
    category: "Simulation",
    visibility: "public",
    status: "beta",
    minPlayers: 1,
    maxPlayers: 1,
  },
  {
    appId: "market_predictor",
    name: "Predice el Mercado",
    description: "Compite prediciendo movimientos del mercado con otros traders.",
    icon: "prediction",
    category: "Prediction",
    visibility: "public",
    status: "active",
    minPlayers: 1,
    maxPlayers: 100,
  },
];

export const seedApps = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const app of DEFAULT_APPS) {
      const existing = await ctx.db
        .query("apps")
        .filter((q) => q.eq(q.field("appId"), app.appId))
        .first();

      if (!existing) {
        await ctx.db.insert("apps", {
          appId: app.appId,
          name: app.name,
          description: app.description,
          icon: app.icon,
          category: "game" as any,
          visibility: "public" as any,
          status: app.status as any,
          config: { minPlayers: app.minPlayers, maxPlayers: app.maxPlayers, category: app.category },
          createdAt: Date.now(),
        });
      }
    }
    return { seeded: DEFAULT_APPS.length };
  },
});

export const listApps = query({
  args: { isAdmin: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.isAdmin) {
      await requireAdmin(ctx);
      return await ctx.db.query("apps").collect();
    }
    await requireUser(ctx);
    return await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .collect();
  },
});

export const toggleAppVisibility = mutation({
  args: { appId: v.string(), visibility: v.union(v.literal("public"), v.literal("private")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const app = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first();

    if (!app) throw new Error("App not found");
    
    await ctx.db.patch(app._id, { visibility: args.visibility });
  },
});

export const updateAppStatus = mutation({
  args: { appId: v.string(), status: v.union(v.literal("active"), v.literal("beta"), v.literal("maintenance")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const app = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first();

    if (!app) throw new Error("App not found");
    
    await ctx.db.patch(app._id, { status: args.status });
  },
});
