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

export const getConfig = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("platformConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    return config?.value ?? null;
  },
});

export const getAllConfig = query({
  handler: async (ctx) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden ver configuración");

    const configs = await ctx.db.query("platformConfig").collect();
    return configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {});
  },
});

export const setConfig = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden modificar configuración");

    const identity = await ctx.auth.getUserIdentity();
    
    const existing = await ctx.db
      .query("platformConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      return ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description,
        updatedAt: Date.now(),
        updatedBy: identity?.subject,
      });
    }

    return ctx.db.insert("platformConfig", {
      key: args.key,
      value: args.value,
      description: args.description,
      updatedAt: Date.now(),
      updatedBy: identity?.subject,
    });
  },
});

export const deleteConfig = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden eliminar configuración");

    const config = await ctx.db
      .query("platformConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (config) {
      await ctx.db.delete(config._id);
    }
  },
});
