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

// MIGRACIÓN MASIVA DE URLS (INTERNAL)
import { internalMutation } from "./_generated/server";

export const migrateUrls = internalMutation({
  args: {
    oldUrl: v.string(),
    newUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { oldUrl, newUrl } = args;
    let count = 0;

    // 1. Posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      let changed = false;
      let updates: any = {};
      
      if (post.contenido?.includes(oldUrl)) {
        updates.contenido = post.contenido.replaceAll(oldUrl, newUrl);
        changed = true;
      }
      if (post.imagenUrl?.includes(oldUrl)) {
        updates.imagenUrl = post.imagenUrl.replaceAll(oldUrl, newUrl);
        changed = true;
      }
      if (post.tradingViewUrl?.includes(oldUrl)) {
        updates.tradingViewUrl = post.tradingViewUrl.replaceAll(oldUrl, newUrl);
        changed = true;
      }

      if (changed) {
        await ctx.db.patch(post._id, updates);
        count++;
      }
    }

    // 2. Ads
    const ads = await ctx.db.query("ads").collect();
    for (const ad of ads) {
      let changed = false;
      let updates: any = {};
      
      if (ad.imagenUrl?.includes(oldUrl)) {
        updates.imagenUrl = ad.imagenUrl.replaceAll(oldUrl, newUrl);
        changed = true;
      }
      if (ad.link?.includes(oldUrl)) {
        updates.link = ad.link.replaceAll(oldUrl, newUrl);
        changed = true;
      }

      if (changed) {
        await ctx.db.patch(ad._id, updates);
        count++;
      }
    }

    // 3. Communities
    const communities = await ctx.db.query("communities").collect();
    for (const c of communities) {
      if (c.coverImage?.includes(oldUrl)) {
        await ctx.db.patch(c._id, {
          coverImage: c.coverImage.replaceAll(oldUrl, newUrl)
        });
        count++;
      }
    }

    // 4. Profiles
    const profiles = await ctx.db.query("profiles").collect();
    for (const p of profiles) {
      let changed = false;
      let updates: any = {};
      
      if (p.avatar?.includes(oldUrl)) {
        updates.avatar = p.avatar.replaceAll(oldUrl, newUrl);
        changed = true;
      }
      if (p.banner?.includes(oldUrl)) {
        updates.banner = p.banner.replaceAll(oldUrl, newUrl);
        changed = true;
      }

      if (changed) {
        await ctx.db.patch(p._id, updates);
        count++;
      }
    }

    return { success: true, count, message: `Se actualizaron ${count} registros` };
  }
});
