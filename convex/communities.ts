import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { checkRateLimit } from "./lib/rateLimit";
import { assertOwnershipOrAdmin, requireUser, requireAdmin } from "./lib/auth";

export const createCommunity = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    visibility: v.union(v.literal("public"), v.literal("unlisted"), v.literal("private")),
    accessType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    priceMonthly: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("growth"), v.literal("scale"), v.literal("enterprise")),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    
    // Validate caller is the owner
    if (identity.subject !== args.ownerId) {
      throw new Error("No tienes permiso para crear esta comunidad");
    }

    // Input validation
    if (args.name.length < 2 || args.name.length > 60) {
      throw new Error("El nombre debe tener entre 2 y 60 caracteres");
    }
    if (args.description.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.slug)) {
      throw new Error("El slug solo puede contener letras minúsculas, números y guiones");
    }
    if (args.priceMonthly !== undefined && args.priceMonthly < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    if (args.maxMembers !== undefined && args.maxMembers < 1) {
      throw new Error("El máximo de miembros debe ser al menos 1");
    }

    const existing = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      throw new Error("El slug ya está en uso. Elige otro nombre.");
    }

    const communityId = await ctx.db.insert("communities", {
      ownerId: args.ownerId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      visibility: args.visibility,
      accessType: args.accessType || "free",
      priceMonthly: args.priceMonthly || 0,
      maxMembers: args.maxMembers || 999999,
      currentMembers: 1,
      plan: args.plan,
      totalRevenue: 0,
      coverImage: args.coverImage,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("communityMembers", {
      communityId,
      userId: args.ownerId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return communityId;
  },
});

export const getCommunity = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!community || community.status === "deleted") {
      return null;
    }

    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", community._id))
      .collect();

    return { ...community, members };
  },
});

export const listPublicCommunities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .order("desc")
      .take(limit);

    return communities;
  },
});

export const joinCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
      throw new Error("No puedes unirte a una comunidad en nombre de otro usuario");
    }

    const allowed = await checkRateLimit(ctx, args.userId, "joinCommunity");
    if (!allowed) {
      throw new Error("Límite de unirse a comunidades excedido. Intenta más tarde.");
    }

    const community = await ctx.db.get(args.communityId);
    
    if (!community || community.status !== "active") {
      throw new Error("La comunidad no existe o está inactiva");
    }

    if (community.visibility === "private") {
      throw new Error("Esta comunidad es privada. Necesitas una invitación.");
    }

    if (community.currentMembers >= community.maxMembers) {
      throw new Error("La comunidad está llena");
    }

    const existing = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      return args.communityId;
    }

    // Verificar suscripción para comunidades pagadas
    if (community.accessType === "paid" && community.priceMonthly && community.priceMonthly > 0) {
      const activeSubscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect()
        .then(subs => subs.find(s => 
          s.status === "active" && 
          s.communityId === args.communityId &&
          (!s.currentPeriodEnd || s.currentPeriodEnd > Date.now())
        ));

      if (!activeSubscription) {
        throw new Error(`La comunidad "${community.name}" requiere suscripción activa. Realiza el pago primero.`);
      }
    }

    await ctx.db.insert("communityMembers", {
      communityId: args.communityId,
      userId: args.userId,
      role: community.accessType === "free" ? "member" : "member",
      subscriptionStatus: "active",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.communityId, {
      currentMembers: community.currentMembers + 1,
    });

    return args.communityId;
  },
});

export const leaveCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
      throw new Error("No puedes abandonar una comunidad en nombre de otro usuario");
    }

    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("No eres miembro de esta comunidad");
    }

    if (membership.role === "owner") {
      throw new Error("El dueño no puede abandonar la comunidad");
    }

    await ctx.db.delete(membership._id);

    const community = await ctx.db.get(args.communityId);
    if (community) {
      await ctx.db.patch(args.communityId, {
        currentMembers: Math.max(0, community.currentMembers - 1),
      });
    }
  },
});

export const getUserCommunities = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId || args.userId === 'guest') return [];
    
    // Simplified auth check - don't require full auth for viewing own communities
    const identity = await ctx.auth.getUserIdentity?.();
    if (!identity || identity.subject !== args.userId) return [];
    
    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (memberships.length === 0) return [];

    const communityIds = memberships.map(m => m.communityId);
    const communityMap = new Map();
    
    // Optimize: fetch communities in batches instead of all at once
    const allCommunities = await ctx.db
      .query("communities")
      .withIndex("by_status", q => q.eq("status", "active"))
      .take(500);
    
    const filtered = allCommunities.filter(c => communityIds.includes(c._id));
    filtered.forEach(c => communityMap.set(c._id, c));

    return memberships
      .map(m => communityMap.get(m.communityId))
      .filter(Boolean)
      .map((community, i) => ({ ...community, membership: memberships[i] }));
  },
});

export const searchCommunities = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 50);
    const searchTerm = args.query.toLowerCase().trim();
    
    if (!searchTerm) {
      return [];
    }
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(100);
    
    const filtered = communities.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm) ||
      c.slug.toLowerCase().includes(searchTerm)
    );
    
    return filtered.slice(0, limit);
  }
});

export const getTrendingCommunities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50);
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .take(100);
    
    return communities
      .sort((a, b) => b.currentMembers - a.currentMembers)
      .slice(0, limit);
  }
});

export const getTopCommunitiesByMembers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50);
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .take(100);
    
    return communities
      .sort((a, b) => b.currentMembers - a.currentMembers)
      .slice(0, limit);
  }
});

export const getTopCommunitiesByEngagement = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50);
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .take(100);
    
    const communitiesWithEngagement = await Promise.all(
      communities.map(async (c) => {
        const posts = await ctx.db
          .query("communityPosts")
          .withIndex("by_community", (q) => q.eq("communityId", c._id))
          .take(50);
        
        const engagement = posts.reduce((sum, p) => {
          return sum + (p.likes?.length || 0) + (p.commentsCount || 0);
        }, 0);
        
        return { ...c, engagement };
      })
    );
    
    return communitiesWithEngagement
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);
  }
});

export const getRecommendedCommunities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .take(limit);
    
    return communities;
  }
});

export const getRevelationCommunities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50);
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .take(100);
    
    return communities
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, limit);
  }
});

export const getCreatorCommunities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50);
    
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_status_visibility", (q) => 
        q.eq("status", "active").eq("visibility", "public")
      )
      .take(100);
    
    return communities
      .filter(c => c.plan && ['growth', 'scale', 'enterprise'].includes(c.plan))
      .slice(0, limit);
  }
});

export const getPromotedCommunities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 3, 10);
    const now = Date.now();
    
    const all = await ctx.db
      .query("communities")
      .withIndex("by_status", q => q.eq("status", "active"))
      .take(200);
    
    const promoted = all.filter(c => 
      c.isPromoted === true && 
      (!c.promotionEndDate || c.promotionEndDate > now)
    );
    
    return promoted.slice(0, limit);
  }
});

export const setCommunityPromoted = mutation({
  args: {
    communityId: v.id("communities"),
    isPromoted: v.boolean(),
    promotionPlan: v.optional(v.string()),
    promotionEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { communityId, isPromoted, promotionPlan, promotionEndDate } = args;
    
    await ctx.db.patch(communityId, {
      isPromoted,
      promotionPlan: isPromoted ? promotionPlan : undefined,
      promotionEndDate: isPromoted ? promotionEndDate : undefined,
    });
    
    return { success: true };
  }
});

export const getCommunityPosts = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_community_created", (q) => q.eq("communityId", args.communityId))
      .filter((q) => q.neq(q.field("status"), "deleted"))
      .order("desc")
      .take(50);

    if (posts.length === 0) return [];

    const userIds = [...new Set(posts.map(p => p.userId))];
    const allProfiles = await ctx.db.query("profiles").collect();
    const profileMap = new Map(allProfiles.filter(p => userIds.includes(p.userId)).map(p => [p.userId, p]));

    return posts.map((post) => {
      const profile = profileMap.get(post.userId);
      return {
        ...post,
        id: post._id,
        idUsuario: post.userId,
        nombreUsuario: profile?.nombre || "Usuario",
        usuarioManejo: profile?.usuario || "user",
        avatarUsuario: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
        esPro: profile?.esPro || false,
        esVerificado: profile?.esVerificado || false,
        authorFollowers: profile?.seguidores?.length || 0,
        accuracyUser: profile?.accuracy || 50,
        comentarios: [], // Por simplicidad inicial, si no hay tabla de comentarios para communityPosts
        tiempo: "Hace poco", // Podrías formatear la fecha aquí si es necesario
      };
    });
  },
});

export const createPost = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
    titulo: v.optional(v.string()),
    contenido: v.string(),
    imagenUrl: v.optional(v.string()),
    tipo: v.optional(v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("link"),
      v.literal("poll"),
      v.literal("signal")
    )),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("No autenticado");
      if (identity.subject !== args.userId) {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
          .first();
        if (!profile || (profile.role || 0) < 5) {
          throw new Error("No autorizado para publicar en nombre de otro usuario");
        }
      }

      const community = await ctx.db.get(args.communityId);
      if (!community) throw new Error("Comunidad no encontrada");

      if (community.visibility === "private") {
        throw new Error("Las comunidades privadas no permiten publicar posts");
      }

      const member = await ctx.db
        .query("communityMembers")
        .withIndex("by_community_user", (q) => 
          q.eq("communityId", args.communityId).eq("userId", args.userId)
        )
        .first();

      if (!member || member.role === "pending") {
        throw new Error("Debes ser miembro para publicar");
      }

      const postId = await ctx.db.insert("communityPosts", {
        communityId: args.communityId,
        userId: args.userId,
        titulo: args.titulo,
        contenido: args.contenido,
        imagenUrl: args.imagenUrl,
        tipo: args.tipo || "text",
        likes: [],
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
        tags: args.tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      });

      return postId;
    } catch (e) {
      console.error("createPost error:", e);
      throw e;
    }
  },
});

export const likePost = mutation({
  args: { postId: v.id("communityPosts"), userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const { assertOwnershipOrAdmin } = await import("./lib/auth");
    await assertOwnershipOrAdmin(ctx, args.userId);

    const allowed = await checkRateLimit(ctx, args.userId, "likePost");
    if (!allowed) {
      throw new Error("Límite de likes excedido. Intenta más tarde.");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const likes = post.likes || [];
    const hasLiked = likes.includes(args.userId);

    await ctx.db.patch(args.postId, {
      likes: hasLiked 
        ? likes.filter(id => id !== args.userId)
        : [...likes, args.userId],
    });

    return { liked: !hasLiked };
  },
});

export const deletePost = mutation({
  args: { postId: v.id("communityPosts"), userId: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const community = await ctx.db.get(post.communityId);
    const isOwner = post.userId === args.userId;
    const isAdmin = community?.ownerId === args.userId;

    if (!isOwner && !isAdmin) {
      throw new Error("Sin permisos para eliminar este post");
    }

    await ctx.db.patch(args.postId, { status: "deleted" });
    return { success: true };
  },
});

export const pinPost = mutation({
  args: { postId: v.id("communityPosts"), isPinned: v.boolean(), userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const community = await ctx.db.get(post.communityId);
    const isOwner = community?.ownerId === args.userId;
    const adminMember = community ? await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", post.communityId).eq("userId", args.userId)
      )
      .first() : null;
    const isAdmin = isOwner || (adminMember && ["owner", "admin", "moderator"].includes(adminMember.role));

    if (!isAdmin) throw new Error("Solo owners o admins pueden fijar posts");

    await ctx.db.patch(args.postId, { isPinned: args.isPinned });
    return { success: true };
  },
});

export const subscribeToCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
    plan: v.string(),
    MercadoPagoSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Comunidad no encontrada");

    if (community.visibility === "private") {
      throw new Error("Esta comunidad es privada");
    }

    const existing = await ctx.db
      .query("communitySubscriptions")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "active",
        plan: args.plan,
        MercadoPagoSubscriptionId: args.MercadoPagoSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const subId = await ctx.db.insert("communitySubscriptions", {
      communityId: args.communityId,
      userId: args.userId,
      plan: args.plan,
      status: "active",
      MercadoPagoSubscriptionId: args.MercadoPagoSubscriptionId,
      currentPeriodStart: Date.now(),
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("communityMembers", {
      communityId: args.communityId,
      userId: args.userId,
      role: "member",
      subscriptionStatus: "active",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.communityId, {
      currentMembers: (community.currentMembers || 0) + 1,
    });

    return subId;
  },
});

export const cancelSubscription = mutation({
  args: { communityId: v.id("communities"), userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("communitySubscriptions")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
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

export const getCommunitySubscription = query({
  args: { communityId: v.id("communities"), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communitySubscriptions")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();
  },
});

export const listCommunitiesWithSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("communities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const getCommunitySubscriptions = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communitySubscriptions")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();
  },
});

export const createPayout = mutation({
  args: {
    communityId: v.id("communities"),
    ownerId: v.string(),
    amount: v.number(),
    currency: v.string(),
    description: v.optional(v.string()),
    periodStart: v.number(),
    periodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const payoutId = await ctx.db.insert("communityPayouts", {
      communityId: args.communityId,
      ownerId: args.ownerId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      description: args.description,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      createdAt: Date.now(),
    });
    return payoutId;
  },
});

export const getCommunityPayouts = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityPayouts")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .order("desc")
      .take(20);
  },
});

export const getOwnerPayouts = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityPayouts")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .take(50);
  },
});

export const processPayouts = action({
  args: {},
  handler: async (ctx) => {
    const communities = await ctx.runQuery(api.communities.listCommunitiesWithSubscriptions, {});

    const results: any[] = [];
    const PLATFORM_FEE = 0.20; // 20% de comisión de la plataforma

    for (const community of communities) {
      if (community.accessType !== "paid" || !community.stripeAccountId) continue;

      const subscriptions = await ctx.runQuery(
        api.communities.getCommunitySubscriptions, 
        { communityId: community._id }
      );

      const activeSubs = subscriptions.filter((s: any) => s.status === "active");
      if (activeSubs.length === 0) continue;

      const now = Date.now();
      const monthlyRevenue = (community.priceMonthly || 0) * activeSubs.length;
      const ownerAmount = monthlyRevenue * (1 - PLATFORM_FEE);

      const payoutId = await ctx.runMutation(api.communities.createPayout, {
        communityId: community._id,
        ownerId: community.ownerId,
        amount: ownerAmount,
        currency: "USD",
        description: `Payout mensual - ${activeSubs.length} suscriptores`,
        periodStart: now - 30 * 24 * 60 * 60 * 1000,
        periodEnd: now,
      });

      await ctx.runMutation(api.communities.updateCommunityRevenue, {
        communityId: community._id,
        additionalRevenue: monthlyRevenue,
      });

      results.push({ communityId: community._id, payoutId, amount: ownerAmount });
    }

    return { processed: results.length, results };
  },
});

export const updateCommunityRevenue = mutation({
  args: {
    communityId: v.id("communities"),
    additionalRevenue: v.number(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (community) {
      await ctx.db.patch(args.communityId, {
        totalRevenue: (community.totalRevenue || 0) + args.additionalRevenue,
      });
    }
    return { success: true };
  },
});

export const getCommunityStats = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) return null;

    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const subscriptions = await ctx.db
      .query("communitySubscriptions")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const activeSubscriptions = subscriptions.filter(s => s.status === "active");

    return {
      totalMembers: members.length,
      totalPosts: posts.length,
      activeSubscriptions: activeSubscriptions.length,
      monthlyRevenue: (community.priceMonthly || 0) * activeSubscriptions.length,
      totalRevenue: community.totalRevenue || 0,
    };
  },
});

export const getCommunityMembers = query({
  args: { 
    communityId: v.optional(v.id("communities")),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const communityId = args.communityId;
    const limit = Math.min(args.limit || 50, 100);
    
    if (!communityId) return { members: [], nextCursor: null };
    
    try {
      const paginatedResult = await ctx.db
        .query("communityMembers")
        .withIndex("by_community", (q) => q.eq("communityId", communityId))
        .paginate({ numItems: limit, cursor: args.cursor || null });

      const memberships = paginatedResult.page;
      if (memberships.length === 0) return { members: [], nextCursor: null };

      const userIds = [...new Set(memberships.map((m: { userId: string }) => m.userId))];
      
      const profiles = await Promise.all(
        userIds.map((userId: string) => 
          ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first()
        )
      );

      const profileMap = new Map(
        profiles.filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined).map(p => [p.userId, p])
      );

      const members = memberships.map((m: { userId: string }) => {
        const profile = profileMap.get(m.userId);
        return {
          ...m,
          profile: profile ? {
            nombre: profile.nombre,
            usuario: profile.usuario,
            avatar: profile.avatar,
            email: profile.email,
          } : null,
        };
      });

      return { members, nextCursor: paginatedResult.continueCursor ?? null };
    } catch (error) {
      console.error("Error fetching community members:", error);
      return { members: [], nextCursor: null };
    }
  },
});

export const removeCommunityMember = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .first();
    
    if (!admin || (admin.role || 0) < 5) {
      throw new Error("No tienes permiso para expulsar miembros");
    }

    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("El usuario no es miembro de esta comunidad");
    }

    if (membership.role === "owner") {
      throw new Error("No puedes expulsar al dueño de la comunidad");
    }

    await ctx.db.delete(membership._id);

    const community = await ctx.db.get(args.communityId);
    if (community) {
      await ctx.db.patch(args.communityId, {
        currentMembers: Math.max(0, community.currentMembers - 1),
      });
    }

    return { success: true };
  },
});

export const updateCommunity = mutation({
  args: {
    id: v.id("communities"),
    userId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("unlisted"), v.literal("private"))),
    accessType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    priceMonthly: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted"))),
    coverImage: v.optional(v.string()),
    isPortalExclusive: v.optional(v.boolean()), // Flag para excluir del feed global
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Comunidad no encontrada");

    // Verify ownership or admin
    if (community.ownerId !== args.userId) {
      const identity = await requireUser(ctx);
      if (identity.subject !== args.userId) {
        throw new Error("No tienes permiso para editar esta comunidad");
      }
    }

    const { id, userId, ...updates } = args;
    await ctx.db.patch(id, updates);
    return { success: true };
  },
});

export const deleteCommunity = mutation({
  args: { id: v.id("communities"), userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Comunidad no encontrada");

    // Verify ownership
    if (community.ownerId !== args.userId) {
      const identity = await requireUser(ctx);
      if (identity.subject !== args.userId) {
        throw new Error("No tienes permiso para eliminar esta comunidad");
      }
    }

    // Soft delete con auditoría
    await ctx.db.patch(args.id, { 
      status: "deleted",
      deletedAt: Date.now(),
      deletedBy: args.userId,
    });
    return { success: true, message: "Comunidad movida a papelera" };
  },
});

// Restaurar comunidad de la papelera
export const restoreCommunity = mutation({
  args: { id: v.id("communities"), userId: v.string() },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Comunidad no encontrada");
    if (community.status !== "deleted") throw new Error("La comunidad no está eliminada");

    // Verify ownership or admin
    if (community.ownerId !== args.userId) {
      const identity = await requireUser(ctx);
      if (identity.subject !== args.userId) {
        throw new Error("No tienes permiso para restaurar esta comunidad");
      }
    }

    await ctx.db.patch(args.id, { 
      status: "active",
      deletedAt: undefined,
      deletedBy: undefined,
    });
    return { success: true };
  },
});

// Eliminar permanentemente desde papelera
export const permanentDeleteCommunity = mutation({
  args: { id: v.id("communities"), userId: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!admin || (admin.role || 0) < 5) {
      throw new Error("Solo admins pueden eliminar permanentemente");
    }

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Comunidad no encontrada");

    // Eliminar miembros
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.id))
      .collect();
    
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.id);
    return { success: true, message: "Comunidad eliminada permanentemente" };
  },
});

// Obtener comunidades eliminadas (Papelera)
export const getDeletedCommunities = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
      
      const profileResult = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();
        
      if (!profileResult || (profileResult.role || 0) < 5) return [];

      return await ctx.db
        .query("communities")
        .withIndex("by_status", q => q.eq("status", "deleted"))
        .order("desc")
        .take(100);
    } catch (err) {
      console.error("Error in getDeletedCommunities:", err);
      return [];
    }
  },
});

export const removeMember = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Comunidad no encontrada");

    if (community.ownerId !== args.adminId) {
      const adminMember = await ctx.db
        .query("communityMembers")
        .withIndex("by_community_user", (q) => 
          q.eq("communityId", args.communityId).eq("userId", args.adminId)
        )
        .first();
      
      if (!adminMember || !["owner", "admin"].includes(adminMember.role)) {
        throw new Error("Solo el dueño o admins pueden expulsar miembros");
      }
    }

    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("El usuario no es miembro de esta comunidad");
    }

    if (membership.role === "owner") {
      throw new Error("No puedes expulsar al dueño de la comunidad");
    }

    await ctx.db.delete(membership._id);

    if (community) {
      await ctx.db.patch(args.communityId, {
        currentMembers: Math.max(0, community.currentMembers - 1),
      });
    }

    return { success: true };
  },
});

export const updateMemberRole = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
    role: v.union(v.literal("member"), v.literal("admin"), v.literal("moderator")),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Comunidad no encontrada");

    if (community.ownerId !== args.adminId) {
      throw new Error("Solo el dueño puede cambiar roles");
    }

    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("El usuario no es miembro de esta comunidad");
    }

    if (membership.role === "owner") {
      throw new Error("No puedes cambiar el rol del dueño");
    }

    await ctx.db.patch(membership._id, { role: args.role });
    return { success: true };
  },
});

export const getCommunityPostsAdmin = query({
  args: { communityId: v.id("communities"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) return [];

    let query = ctx.db
      .query("communityPosts")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId));

    const posts = await query.collect();

    if (posts.length === 0) return [];

    const userIds = [...new Set(posts.map(p => p.userId))];
    const allProfiles = await ctx.db.query("profiles").collect();
    const profileMap = new Map(
      allProfiles
        .filter(p => userIds.includes(p.userId))
        .map(p => [p.userId, p])
    );

    const postsWithAuthors = posts.map(post => {
      const profile = profileMap.get(post.userId);
      return {
        ...post,
        author: profile ? {
          nombre: profile.nombre,
          usuario: profile.usuario,
          avatar: profile.avatar,
        } : null,
      };
    });

    if (args.status) {
      return postsWithAuthors.filter(p => p.status === args.status);
    }
    return postsWithAuthors;
  },
});

export const hidePost = mutation({
  args: { postId: v.id("communityPosts"), adminId: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const community = await ctx.db.get(post.communityId);
    if (!community) throw new Error("Comunidad no encontrada");

    const adminMember = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", post.communityId).eq("userId", args.adminId)
      )
      .first();

    if (!adminMember || !["owner", "admin", "moderator"].includes(adminMember.role)) {
      if (community.ownerId !== args.adminId) {
        throw new Error("Sin permisos para ocultar este post");
      }
    }

    await ctx.db.patch(args.postId, { status: "hidden" });
    return { success: true };
  },
});

export const deletePostAdmin = mutation({
  args: { postId: v.id("communityPosts"), adminId: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const community = await ctx.db.get(post.communityId);
    if (!community) throw new Error("Comunidad no encontrada");

    const adminMember = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", post.communityId).eq("userId", args.adminId)
      )
      .first();

    if (!adminMember || !["owner", "admin", "moderator"].includes(adminMember.role)) {
      if (community.ownerId !== args.adminId) {
        throw new Error("Sin permisos para eliminar este post");
      }
    }

    await ctx.db.patch(args.postId, { status: "deleted" });
    return { success: true };
  },
});

export const getOwnerCommunities = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const communities = await ctx.db
      .query("communities")
      .filter(q => q.eq(q.field("ownerId"), args.userId))
      .collect();
    
    return communities.filter(c => c.status !== "deleted");
  },
});

// BORRAR TODAS LAS COMUNIDADES - Limpieza total
export const deleteAllCommunities = internalMutation({
  args: {},
  handler: async (ctx) => {
    const communities = await ctx.db.query("communities").collect();
    const members = await ctx.db.query("communityMembers").collect();
    
    let deletedCommunities = 0;
    let deletedMembers = 0;
    
    // Eliminar miembros primero
    for (const member of members) {
      await ctx.db.delete(member._id);
      deletedMembers++;
    }
    
    // Eliminar comunidades
    for (const community of communities) {
      await ctx.db.delete(community._id);
      deletedCommunities++;
    }

    return { deletedCommunities, deletedMembers };
  },
});

// ========================
// PREMIUM COMMUNITIES
// ========================

export const getPremiumCommunities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("premiumCommunities")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getCommunityAccess = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityAccess")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const checkCommunityAccess = query({
  args: { userId: v.string(), communityId: v.string() },
  handler: async (ctx, args) => {
    const access = await ctx.db
      .query("communityAccess")
      .withIndex("by_user_community", (q) => 
        q.eq("userId", args.userId).eq("communityId", args.communityId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    return !!access;
  },
});

export const grantAccess = mutation({
  args: {
    userId: v.string(),
    communityId: v.string(),
    durationDays: v.number(),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiryDate = now + (args.durationDays * 24 * 60 * 60 * 1000);

    await ctx.db.insert("communityAccess", {
      userId: args.userId,
      communityId: args.communityId,
      status: "active",
      purchaseDate: now,
      expiryDate,
      paymentId: args.paymentId,
    });
  },
});

export const createPremiumCommunity = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    durationDays: v.number(),
    features: v.array(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const communityId = await ctx.db.insert("premiumCommunities", {
      ...args,
      maxMembers: 100,
      isActive: true,
    });
    return communityId;
  },
});

// ========================
// CREDITS SYSTEM
// ========================

export const getUserCredits = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    if (args.userId !== identity.subject) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();
      if (!profile || (profile.role || 0) < 5) return 0;
    }
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return credits?.credits || 0;
  },
});

export const addCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    referenceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existing = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        credits: existing.credits + args.amount,
        lastUpdated: now,
      });
    } else {
      await ctx.db.insert("userCredits", {
        userId: args.userId,
        credits: args.amount,
        lastUpdated: now,
      });
    }

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: "purchase",
      amount: args.amount,
      description: args.description,
      referenceId: args.referenceId,
      timestamp: now,
    });
  },
});

export const useCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    referenceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing || existing.credits < args.amount) {
      throw new Error("Créditos insuficientes");
    }

    await ctx.db.patch(existing._id, {
      credits: existing.credits - args.amount,
      lastUpdated: Date.now(),
    });

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: "usage",
      amount: -args.amount,
      description: args.description,
      referenceId: args.referenceId,
      timestamp: Date.now(),
    });
  },
});

export const grantCommunityAccess = mutation({
  args: {
    userId: v.string(),
    communityId: v.string(),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("communityAccess")
      .withIndex("by_user_community", (q) => q.eq("userId", args.userId).eq("communityId", args.communityId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "active",
        purchaseDate: Date.now(),
        paymentId: args.paymentReference,
      });
    } else {
      await ctx.db.insert("communityAccess", {
        userId: args.userId,
        communityId: args.communityId,
        status: "active",
        purchaseDate: Date.now(),
        paymentId: args.paymentReference,
      });
    }
  },
});
