import { query } from "./_generated/server";
import { v } from "convex/values";

export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return { valid: false, error: "Not authenticated" };
    }

    if (identity.subject !== args.token) {
      return { valid: false, error: "Token mismatch" };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return {
      valid: true,
      userId: identity.subject,
      email: identity.email,
      profile: profile ? {
        id: profile._id,
        nombre: profile.nombre,
        usuario: profile.usuario,
        avatar: profile.avatar,
        role: profile.role,
        xp: profile.xp,
        level: profile.level,
        esPro: profile.esPro || false,
      } : null,
    };
  },
});

export const getAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return { authenticated: false };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return {
      authenticated: true,
      userId: identity.subject,
      email: identity.email,
      profile: profile ? {
        id: profile._id,
        nombre: profile.nombre,
        usuario: profile.usuario,
        esPro: profile.esPro || false,
      } : null,
    };
  },
});
