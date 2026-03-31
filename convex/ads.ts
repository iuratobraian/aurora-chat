import { query, mutation } from "./_generated/server";
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

export const getAds = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ads").collect();
  },
});

export const saveAd = mutation({
  args: {
    id: v.optional(v.id("ads")),
    titulo: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    link: v.optional(v.string()),
    sector: v.optional(v.string()),
    activo: v.optional(v.boolean()),
    subtitle: v.optional(v.string()),
    extra: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden guardar anuncios");
    
    const { id, ...data } = args;


    const adData = {
      titulo: data.titulo || "Anuncio",
      descripcion: data.descripcion || "",
      imagenUrl: data.imagenUrl || "",
      videoUrl: data.videoUrl,
      link: data.link || "#",
      sector: data.sector || "sidebar",
      activo: data.activo ?? true,
      subtitle: data.subtitle,
      extra: data.extra,
    };

    if (id) {
      const existing = await ctx.db.get(id);
      if (existing) {
        await ctx.db.patch(id, adData);
        return id;
      }
    }

    // Si no hay ID o el ID no existe en la DB, insertamos uno nuevo
    return await ctx.db.insert("ads", adData);
  },
});

export const deleteAd = mutation({
  args: { id: v.id("ads") },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden eliminar anuncios");
    await ctx.db.delete(args.id);
  },
});

export const createCommunityAd = mutation({
  args: {
    communityId: v.id("communities"),
    plan: v.union(v.literal("basic"), v.literal("pro"), v.literal("enterprise")),
    durationDays: v.number(),
    price: v.number(),
    paymentMethod: v.optional(v.union(v.literal("mercadopago"), v.literal("stripe"))),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden crear anuncios de comunidad");
    
    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    const startDate = Date.now();
    const endDate = startDate + (args.durationDays * 24 * 60 * 60 * 1000);

    const adId = await ctx.db.insert("ads", {
      titulo: community.name,
      descripcion: community.description,
      imagenUrl: (community as any).coverImage || "",
      link: `/comunidad/${community.slug}`,
      sector: "community_promotion",
      activo: true,
      subtitle: `Plan ${args.plan}`,
      extra: JSON.stringify({
        communityId: args.communityId,
        plan: args.plan,
        startDate,
        endDate,
        price: args.price,
        paymentMethod: args.paymentMethod,
      }),
    });

    await ctx.db.patch(args.communityId, {
      isPromoted: true,
      promotionPlan: args.plan,
      promotionEndDate: endDate,
    } as any);

    return adId;
  },
});

export const getCommunityAds = query({
  args: {},
  handler: async (ctx) => {
    const ads = await ctx.db
      .query("ads")
      .filter((q) => q.eq(q.field("sector"), "community_promotion"))
      .filter((q) => q.eq(q.field("activo"), true))
      .collect();

    const now = Date.now();
    const activeAds = ads.filter((ad) => {
      if (!ad.extra) return true;
      try {
        const extra = JSON.parse(ad.extra);
        return !extra.endDate || extra.endDate > now;
      } catch {
        return true;
      }
    });

    return activeAds;
  },
});

export const deactivateExpiredAds = mutation({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden desactivar anuncios");
    
    const ads = await ctx.db.query("ads").collect();
    const now = Date.now();

    for (const ad of ads) {
      if (!ad.extra) continue;
      try {
        const extra = JSON.parse(ad.extra);
        if (extra.endDate && extra.endDate < now && ad.activo) {
          await ctx.db.patch(ad._id, { activo: false });

          if (extra.communityId) {
            await ctx.db.patch(extra.communityId, {
              isPromoted: false,
              promotionPlan: undefined,
              promotionEndDate: undefined,
            } as any);
          }
        }
      } catch {
        continue;
      }
    }

    return { deactivated: ads.filter((ad) => {
      if (!ad.extra) return false;
      try {
        const extra = JSON.parse(ad.extra);
        return extra.endDate && extra.endDate < now;
      } catch {
        return false;
      }
    }).length };
  },
});
