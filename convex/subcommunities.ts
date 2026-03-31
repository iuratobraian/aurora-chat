import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { checkRateLimit } from "./lib/rateLimit";

// ─── QUERIES ──────────────────────────────────────────────────────────

export const getSubcommunities = query({
  args: { parentId: v.id("communities") },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .collect();

    return subs;
  },
});

export const getSubcommunitiesByType = query({
  args: { 
    parentId: v.id("communities"),
    type: v.optional(v.union(
      v.literal("general"),
      v.literal("support"),
      v.literal("help"),
      v.literal("group"),
      v.literal("courses")
    ))
  },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .collect();

    if (args.type) {
      return subs.filter((s) => (s as any).type === args.type);
    }
    return subs;
  },
});

export const getSubcommunity = query({
  args: {
    parentId: v.id("communities"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent_slug", (q) =>
        q.eq("parentId", args.parentId).eq("slug", args.slug)
      )
      .first();

    if (!sub || sub.status === "deleted") return null;

    const members = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", sub._id))
      .collect();

    return { ...sub, members };
  },
});

export const getSubcommunityById = query({
  args: { subcommunityId: v.id("subcommunities") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub || (sub as any).status === "deleted") return null;

    const members = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", args.subcommunityId))
      .collect();

    return { ...(sub as any), members };
  },
});

export const getUserSubcommunities = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const subs = await Promise.all(
      memberships.map(async (m) => {
        const sub = await ctx.db.get(m.subcommunityId);
        return sub ? { ...(sub as any), memberRole: m.role, joinedAt: m.joinedAt } : null;
      })
    );

    return subs.filter(Boolean);
  },
});

export const getSubcommunityMembers = query({
  args: { subcommunityId: v.id("subcommunities") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", args.subcommunityId))
      .collect();

    const enriched = await Promise.all(
      members.map(async (m) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", m.userId))
          .first();
        return {
          ...m,
          profile: profile ? {
            nombre: profile.nombre,
            usuario: profile.usuario,
            avatar: profile.avatar,
            rol: profile.rol,
          } : null,
        };
      })
    );

    return enriched;
  },
});

export const checkAccess = query({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) return { hasAccess: false, role: null, subcommunity: null, hasSubscription: false };

    const membership = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    let hasSubscription = false;
    if (membership && membership.role === "member") {
      const subscription = await ctx.db
        .query("subcommunitySubscriptions")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (subscription) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const isExpired = subscription.currentPeriodEnd < Date.now();
        hasSubscription = isActive && !isExpired;
      }
    }

    const hasAccess = !!membership && (membership.role !== "member" || hasSubscription);

    return {
      hasAccess,
      role: membership?.role || null,
      subcommunity: sub,
      hasSubscription,
    };
  },
});

export const getSubcommunityPosts = query({
  args: {
    subcommunityId: v.id("subcommunities"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    let query = ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("subcommunityId"), args.subcommunityId))
      .order("desc");

    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as Id<"posts">);
      if (cursorDoc && "createdAt" in cursorDoc) {
        query = query.filter((q) => q.lt(q.field("createdAt"), (cursorDoc as any).createdAt));
      }
    }

    const posts = await query.take(limit + 1);
    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && page.length > 0 ? page[page.length - 1]._id : null;

    return { page, nextCursor, isDone: !hasMore };
  },
});

// ─── MUTATIONS ────────────────────────────────────────────────────────

export const createSubcommunity = mutation({
  args: {
    parentId: v.id("communities"),
    ownerId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    type: v.optional(v.union(
      v.literal("general"),
      v.literal("support"),
      v.literal("help"),
      v.literal("group")
    )),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("invite_only")),
    accessType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    priceMonthly: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.ownerId !== identity.subject) throw new Error("No autorizado");

    const parent = await ctx.db.get(args.parentId);
    if (!parent) throw new Error("Comunidad padre no encontrada");

    const parentData = parent as any;
    if (parentData.visibility === "private") {
      throw new Error("Las comunidades privadas no permiten crear subcomunidades");
    }

    if (parentData.ownerId !== args.ownerId) {
      const membership = await ctx.db
        .query("communityMembers")
        .withIndex("by_community_user", (q) =>
          q.eq("communityId", args.parentId).eq("userId", args.ownerId)
        )
        .first();

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Solo el owner o admins de la comunidad pueden crear subcomunidades");
      }
    }

    const existingSlug = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent_slug", (q) =>
        q.eq("parentId", args.parentId).eq("slug", args.slug)
      )
      .first();

    if (existingSlug) throw new Error("Slug ya en uso en esta comunidad");

    const plan = parentData.plan || "free";
    const limits: Record<string, number> = {
      free: 2, starter: 3, growth: 10, scale: 999, enterprise: 9999
    };
    const existing = await ctx.db
      .query("subcommunities")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (existing.length >= (limits[plan] || 2)) {
      throw new Error(`Límite de subcomunidades alcanzado para plan ${plan}`);
    }

    const adSettings: Record<string, { enabled: boolean; freq: number }> = {
      free: { enabled: true, freq: 5 },
      starter: { enabled: true, freq: 8 },
      growth: { enabled: false, freq: 0 },
      scale: { enabled: false, freq: 0 },
      enterprise: { enabled: false, freq: 0 },
    };
    const adConf = adSettings[plan] || adSettings.free;

    const subId = await ctx.db.insert("subcommunities", {
      parentId: args.parentId,
      ownerId: args.ownerId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      type: args.type || "general",
      visibility: args.visibility,
      plan,
      accessType: args.accessType || "free",
      priceMonthly: args.priceMonthly || 0,
      adsEnabled: adConf.enabled,
      adFrequency: adConf.freq,
      allowedAdTypes: ["feed", "sidebar"],
      tvEnabled: plan !== "free",
      tvStreamUrl: undefined,
      tvIsLive: false,
      maxMembers: plan === "free" ? 50 : plan === "starter" ? 200 : 9999,
      currentMembers: 1,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("subcommunityMembers", {
      subcommunityId: subId,
      userId: args.ownerId,
      role: "owner",
      joinedAt: Date.now(),
    });

    const chatSlug = `sub_${subId}`;
    await ctx.db.insert("chatChannels", {
      name: args.name,
      slug: chatSlug,
      type: "subcommunity",
      communityId: args.parentId,
      participants: [args.ownerId],
      createdBy: args.ownerId,
      createdAt: Date.now(),
    });

    return subId;
  },
});

export const updateSubcommunity = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("invite_only"))),
    accessType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    priceMonthly: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    tvEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.userId || args.userId === "guest") {
      throw new Error("Debes iniciar sesión para unirte a la subcomunidad");
    }

    const allowed = await checkRateLimit(ctx, args.userId, "joinSubcommunity");
    if (!allowed) {
      throw new Error("Límite de unirse a subcomunidades excedido. Intenta más tarde.");
    }

    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId) {
      const membership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("No autorizado");
      }
    }

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.visibility !== undefined) updates.visibility = args.visibility;
    if (args.accessType !== undefined) updates.accessType = args.accessType;
    if (args.priceMonthly !== undefined) updates.priceMonthly = args.priceMonthly;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.tvEnabled !== undefined) updates.tvEnabled = args.tvEnabled;

    await ctx.db.patch(args.subcommunityId, updates);
    return { success: true };
  },
});

export const deleteSubcommunity = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId) throw new Error("Solo el owner puede eliminar");

    await ctx.db.patch(args.subcommunityId, { status: "deleted" });
    return { success: true };
  },
});

export const joinSubcommunity = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.status !== "active") throw new Error("Subcomunidad no activa");

    if (subData.accessType === "paid") {
      throw new Error("Esta subcomunidad es de pago. Suscríbete para unirte.");
    }

    const existing = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (existing) throw new Error("Ya eres miembro");

    const members = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", args.subcommunityId))
      .collect();

    if (members.length >= subData.maxMembers) {
      throw new Error("Subcomunidad llena");
    }

    await ctx.db.insert("subcommunityMembers", {
      subcommunityId: args.subcommunityId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.subcommunityId, {
      currentMembers: subData.currentMembers + 1,
    });

    const channel = await ctx.db
      .query("chatChannels")
      .filter((q) => q.eq(q.field("slug"), `sub_${args.subcommunityId}`))
      .first();

    if (channel) {
      const participants = [...(channel as any).participants];
      if (!participants.includes(args.userId)) {
        participants.push(args.userId);
        await ctx.db.patch(channel._id, { participants });
      }
    }

    return { success: true };
  },
});

export const leaveSubcommunity = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) throw new Error("No eres miembro");
    if (membership.role === "owner") throw new Error("El owner no puede salir");

    await ctx.db.delete(membership._id);

    const sub = await ctx.db.get(args.subcommunityId);
    if (sub) {
      await ctx.db.patch(args.subcommunityId, {
        currentMembers: Math.max(0, (sub as any).currentMembers - 1),
      });
    }

    return { success: true };
  },
});

export const changeMemberRole = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    targetUserId: v.string(),
    newRole: v.union(v.literal("admin"), v.literal("moderator"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId) {
      const adminMembership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (!adminMembership || adminMembership.role !== "admin") {
        throw new Error("Solo owner o admin pueden cambiar roles");
      }
    }

    const targetMembership = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.targetUserId)
      )
      .first();

    if (!targetMembership) throw new Error("Usuario no es miembro");

    await ctx.db.patch(targetMembership._id, { role: args.newRole });
    return { success: true };
  },
});

export const removeMember = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    targetUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.userId && args.userId !== args.targetUserId) {
      const membership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
        )
        .first();

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("No autorizado");
      }
    }

    if (args.targetUserId === subData.ownerId) {
      throw new Error("No se puede remover al owner");
    }

    const targetMembership = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.targetUserId)
      )
      .first();

    if (!targetMembership) throw new Error("Usuario no es miembro");

    await ctx.db.delete(targetMembership._id);

    await ctx.db.patch(args.subcommunityId, {
      currentMembers: Math.max(0, subData.currentMembers - 1),
    });

    return { success: true };
  },
});

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────

export const checkSubscription = query({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subcommunitySubscriptions")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (!subscription) return null;

    const isActive = subscription.status === "active" || subscription.status === "trialing";
    const isExpired = subscription.currentPeriodEnd < Date.now();

    return {
      status: subscription.status,
      isActive: isActive && !isExpired,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  },
});

export const subscribeToSubcommunity = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
    MercadoPagoSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.accessType !== "paid") {
      throw new Error("Esta subcomunidad es gratuita");
    }

    const existing = await ctx.db
      .query("subcommunitySubscriptions")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "active",
        MercadoPagoSubscriptionId: args.MercadoPagoSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("subcommunitySubscriptions", {
        subcommunityId: args.subcommunityId,
        userId: args.userId,
        status: "active",
        MercadoPagoSubscriptionId: args.MercadoPagoSubscriptionId,
        currentPeriodStart: Date.now(),
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    const member = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (!member) {
      await ctx.db.insert("subcommunityMembers", {
        subcommunityId: args.subcommunityId,
        userId: args.userId,
        role: "member",
        joinedAt: Date.now(),
      });
      await ctx.db.patch(args.subcommunityId, {
        currentMembers: subData.currentMembers + 1,
      });
    }

    return { success: true };
  },
});

export const cancelSubcommunitySubscription = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subcommunitySubscriptions")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (!subscription) throw new Error("Suscripción no encontrada");

    await ctx.db.patch(subscription._id, {
      status: "canceled",
      cancelAtPeriodEnd: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
