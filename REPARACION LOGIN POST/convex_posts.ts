import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────
// TIPOS COMPARTIDOS
// ─────────────────────────────────────────────
const postStatusValues = v.union(
  v.literal("active"),
  v.literal("deleted"),
  v.literal("pending"),
  v.literal("flagged")
);

const postTypeValues = v.union(
  v.literal("text"),
  v.literal("image"),
  v.literal("link"),
  v.literal("poll"),
  v.literal("signal"),
  v.literal("chart")
);

// ─────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────
async function assertCommunityAccess(
  ctx: any,
  communityId: string,
  userId: string
): Promise<void> {
  const community = await ctx.db.get(communityId);
  if (!community) throw new Error("COMMUNITY_NOT_FOUND");

  if (community.visibility === "private" || community.accessType === "paid") {
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_community_user", (q: any) =>
        q.eq("communityId", communityId).eq("userId", userId)
      )
      .first();

    if (!member) throw new Error("NOT_A_MEMBER");
    if (member.role === "pending") throw new Error("MEMBERSHIP_PENDING");
  }
}

async function assertSubcommunityAccess(
  ctx: any,
  subcommunityId: string,
  userId: string
): Promise<void> {
  const sub = await ctx.db.get(subcommunityId);
  if (!sub) throw new Error("SUBCOMMUNITY_NOT_FOUND");

  if (sub.visibility === "private" || sub.accessType === "paid") {
    const member = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q: any) =>
        q.eq("subcommunityId", subcommunityId).eq("userId", userId)
      )
      .first();

    if (!member) throw new Error("NOT_A_MEMBER");
  }
}

// ─────────────────────────────────────────────
// CREATE POST — FEED PÚBLICO
// ─────────────────────────────────────────────
export const createPublicPost = mutation({
  args: {
    userId: v.id("profiles"),
    titulo: v.optional(v.string()),
    contenido: v.string(),
    tipo: postTypeValues,
    par: v.optional(v.string()),
    categoria: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    tradingViewUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    zonaOperativa: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    encuesta: v.optional(
      v.object({
        pregunta: v.string(),
        opciones: v.array(v.string()),
        multipleChoice: v.boolean(),
        endsAt: v.optional(v.number()),
      })
    ),
    isSignal: v.optional(v.boolean()),
    signalDetails: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Verificar que el usuario exista y no esté bloqueado
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.isBlocked) throw new Error("USER_BLOCKED");
    if (user.status === "suspended") throw new Error("USER_SUSPENDED");

    const now = Date.now();

    // Rate limiting básico: máx 10 posts por hora
    const oneHourAgo = now - 3600000;
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("createdAt"), oneHourAgo))
      .collect();

    if (recentPosts.length >= 10) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    const postId = await ctx.db.insert("posts", {
      userId: args.userId,
      titulo: args.titulo || "",
      par: args.par || "",
      tipo: args.tipo,
      contenido: args.contenido,
      categoria: args.categoria || "general",
      esAnuncio: false,
      datosGrafico: [],
      tradingViewUrl: args.tradingViewUrl || "",
      imagenUrl: args.imagenUrl || "",
      zonaOperativa: args.zonaOperativa || "",
      likes: [],
      comentarios: [],
      tags: args.tags || [],
      reputationSnapshot: user.reputation || 0,
      badgesSnapshot: user.badges || [],
      ratings: [],
      encuesta: args.encuesta || null,
      compartidos: 0,
      comentariosCerrados: false,
      isAiAgent: false,
      isSignal: args.isSignal || false,
      signalDetails: args.signalDetails || null,
      sentiment: args.sentiment || "neutral",
      subcommunityId: null,
      createdAt: now,
      ultimaInteraccion: now,
      status: "active",
      avatarFrame: user.avatarFrame || null,
      puntos: 0,
      tokenTipsReceived: 0,
      tokenTipsCount: 0,
      monthlyTokenTips: 0,
      monthKey: new Date().toISOString().slice(0, 7),
      isTopMonthly: false,
    });

    // XP por publicar
    await ctx.db.patch(args.userId, {
      xp: (user.xp || 0) + 5,
      aportes: (user.aportes || 0) + 1,
      ultimaInteraccion: now,
    });

    return { success: true, postId };
  },
});

// ─────────────────────────────────────────────
// CREATE POST — COMUNIDAD PRIVADA/PÚBLICA
// ─────────────────────────────────────────────
export const createCommunityPost = mutation({
  args: {
    userId: v.id("profiles"),
    communityId: v.id("communities"),
    titulo: v.optional(v.string()),
    contenido: v.string(),
    tipo: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("link"),
      v.literal("poll"),
      v.literal("signal")
    ),
    imagenUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPinned: v.optional(v.boolean()),
    encuesta: v.optional(
      v.object({
        pregunta: v.string(),
        opciones: v.array(v.string()),
        multipleChoice: v.boolean(),
        endsAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.isBlocked) throw new Error("USER_BLOCKED");

    // Verificar acceso a la comunidad
    await assertCommunityAccess(ctx, args.communityId, args.userId);

    const now = Date.now();

    const postId = await ctx.db.insert("communityPosts", {
      communityId: args.communityId,
      userId: args.userId,
      titulo: args.titulo || "",
      contenido: args.contenido,
      imagenUrl: args.imagenUrl || "",
      tipo: args.tipo,
      likes: [],
      commentsCount: 0,
      isPinned: args.isPinned || false,
      isLocked: false,
      tags: args.tags || [],
      encuesta: args.encuesta || null,
      createdAt: now,
      updatedAt: now,
      status: "active",
    });

    // XP por aportar en comunidad
    await ctx.db.patch(args.userId, {
      xp: (user.xp || 0) + 3,
      aportes: (user.aportes || 0) + 1,
    });

    return { success: true, postId };
  },
});

// ─────────────────────────────────────────────
// CREATE POST — SUBCOMUNIDAD
// ─────────────────────────────────────────────
export const createSubcommunityPost = mutation({
  args: {
    userId: v.id("profiles"),
    subcommunityId: v.id("subcommunities"),
    titulo: v.optional(v.string()),
    contenido: v.string(),
    tipo: postTypeValues,
    imagenUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isSignal: v.optional(v.boolean()),
    signalDetails: v.optional(v.any()),
    sentiment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.isBlocked) throw new Error("USER_BLOCKED");

    // Verificar acceso a la subcomunidad
    await assertSubcommunityAccess(ctx, args.subcommunityId, args.userId);

    const now = Date.now();

    const postId = await ctx.db.insert("posts", {
      userId: args.userId,
      titulo: args.titulo || "",
      par: "",
      tipo: args.tipo,
      contenido: args.contenido,
      categoria: "community",
      esAnuncio: false,
      datosGrafico: [],
      tradingViewUrl: "",
      imagenUrl: args.imagenUrl || "",
      zonaOperativa: "",
      likes: [],
      comentarios: [],
      tags: args.tags || [],
      reputationSnapshot: user.reputation || 0,
      badgesSnapshot: user.badges || [],
      ratings: [],
      encuesta: null,
      compartidos: 0,
      comentariosCerrados: false,
      isAiAgent: false,
      isSignal: args.isSignal || false,
      signalDetails: args.signalDetails || null,
      sentiment: args.sentiment || "neutral",
      subcommunityId: args.subcommunityId,
      createdAt: now,
      ultimaInteraccion: now,
      status: "active",
      avatarFrame: user.avatarFrame || null,
      puntos: 0,
      tokenTipsReceived: 0,
      tokenTipsCount: 0,
      monthlyTokenTips: 0,
      monthKey: new Date().toISOString().slice(0, 7),
      isTopMonthly: false,
    });

    await ctx.db.patch(args.userId, {
      xp: (user.xp || 0) + 3,
      aportes: (user.aportes || 0) + 1,
    });

    return { success: true, postId };
  },
});

// ─────────────────────────────────────────────
// GET FEED PÚBLICO (paginado)
// ─────────────────────────────────────────────
export const getPublicFeed = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    categoria: v.optional(v.string()),
    tipo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 50);

    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_status_createdAt")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("subcommunityId"), null)
        )
      )
      .order("desc");

    if (args.categoria && args.categoria !== "all") {
      postsQuery = ctx.db
        .query("posts")
        .filter((q: any) =>
          q.and(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("subcommunityId"), null),
            q.eq(q.field("categoria"), args.categoria)
          )
        )
        .order("desc");
    }

    const page = await postsQuery.paginate({ numItems: limit, cursor: args.cursor || null });

    // Enriquecer con datos de usuario
    const enriched = await Promise.all(
      page.page.map(async (post: any) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          author: user
            ? {
                _id: user._id,
                nombre: user.nombre,
                usuario: user.usuario,
                avatar: user.avatar,
                esVerificado: user.esVerificado,
                rol: user.rol,
                avatarFrame: user.avatarFrame,
              }
            : null,
        };
      })
    );

    return {
      posts: enriched,
      nextCursor: page.continueCursor,
      isDone: page.isDone,
    };
  },
});

// ─────────────────────────────────────────────
// GET FEED DE COMUNIDAD
// ─────────────────────────────────────────────
export const getCommunityFeed = query({
  args: {
    communityId: v.id("communities"),
    userId: v.optional(v.id("profiles")),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("COMMUNITY_NOT_FOUND");

    // Para comunidades privadas, verificar membresía
    if (
      (community.visibility === "private" || community.accessType === "paid") &&
      args.userId
    ) {
      const member = await ctx.db
        .query("communityMembers")
        .withIndex("by_community_user", (q) =>
          q.eq("communityId", args.communityId).eq("userId", args.userId!)
        )
        .first();

      if (!member || member.role === "pending") {
        return { posts: [], nextCursor: null, isDone: true, requiresMembership: true };
      }
    } else if (community.visibility === "private" && !args.userId) {
      return { posts: [], nextCursor: null, isDone: true, requiresMembership: true };
    }

    const limit = Math.min(args.limit || 20, 50);

    const page = await ctx.db
      .query("communityPosts")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .paginate({ numItems: limit, cursor: args.cursor || null });

    const enriched = await Promise.all(
      page.page.map(async (post: any) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          author: user
            ? {
                _id: user._id,
                nombre: user.nombre,
                usuario: user.usuario,
                avatar: user.avatar,
                esVerificado: user.esVerificado,
                rol: user.rol,
              }
            : null,
        };
      })
    );

    return {
      posts: enriched,
      nextCursor: page.continueCursor,
      isDone: page.isDone,
      requiresMembership: false,
    };
  },
});

// ─────────────────────────────────────────────
// GET FEED DE SUBCOMUNIDAD
// ─────────────────────────────────────────────
export const getSubcommunityFeed = query({
  args: {
    subcommunityId: v.id("subcommunities"),
    userId: v.optional(v.id("profiles")),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("SUBCOMMUNITY_NOT_FOUND");

    // Verificar acceso
    if (sub.visibility === "private" || sub.accessType === "paid") {
      if (!args.userId) {
        return { posts: [], nextCursor: null, isDone: true, requiresMembership: true };
      }
      const member = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.userId!)
        )
        .first();

      if (!member) {
        return { posts: [], nextCursor: null, isDone: true, requiresMembership: true };
      }
    }

    const limit = Math.min(args.limit || 20, 50);

    const page = await ctx.db
      .query("posts")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("subcommunityId"), args.subcommunityId),
          q.eq(q.field("status"), "active")
        )
      )
      .order("desc")
      .paginate({ numItems: limit, cursor: args.cursor || null });

    const enriched = await Promise.all(
      page.page.map(async (post: any) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          author: user
            ? {
                _id: user._id,
                nombre: user.nombre,
                usuario: user.usuario,
                avatar: user.avatar,
                esVerificado: user.esVerificado,
                rol: user.rol,
              }
            : null,
        };
      })
    );

    return {
      posts: enriched,
      nextCursor: page.continueCursor,
      isDone: page.isDone,
      requiresMembership: false,
    };
  },
});

// ─────────────────────────────────────────────
// LIKE / UNLIKE
// ─────────────────────────────────────────────
export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("POST_NOT_FOUND");

    const likes: string[] = post.likes || [];
    const hasLiked = likes.includes(args.userId);

    const newLikes = hasLiked
      ? likes.filter((id) => id !== args.userId)
      : [...likes, args.userId];

    await ctx.db.patch(args.postId, { likes: newLikes, ultimaInteraccion: Date.now() });

    // Notificar al autor (solo si es like, no unlike)
    if (!hasLiked && post.userId !== args.userId) {
      const liker = await ctx.db.get(args.userId);
      if (liker) {
        await ctx.db.insert("notifications", {
          userId: post.userId,
          type: "like",
          title: "Le gustó tu post",
          body: `${liker.nombre} le dio like a tu publicación`,
          data: { postId: args.postId },
          read: false,
          link: `/post/${args.postId}`,
          avatarUrl: liker.avatar,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true, liked: !hasLiked, likesCount: newLikes.length };
  },
});

// ─────────────────────────────────────────────
// COMENTAR
// ─────────────────────────────────────────────
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("profiles"),
    contenido: v.string(),
    replyTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("POST_NOT_FOUND");
    if (post.comentariosCerrados) throw new Error("COMMENTS_CLOSED");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const now = Date.now();
    const comment = {
      id: `${args.userId}_${now}`,
      userId: args.userId,
      nombre: user.nombre,
      usuario: user.usuario,
      avatar: user.avatar,
      contenido: args.contenido,
      likes: [],
      replyTo: args.replyTo || null,
      createdAt: now,
    };

    await ctx.db.patch(args.postId, {
      comentarios: [...(post.comentarios || []), comment],
      ultimaInteraccion: now,
    });

    // Notificar al autor
    if (post.userId !== args.userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "comment",
        title: "Nuevo comentario",
        body: `${user.nombre} comentó en tu post`,
        data: { postId: args.postId, commentId: comment.id },
        read: false,
        link: `/post/${args.postId}`,
        avatarUrl: user.avatar,
        createdAt: now,
      });
    }

    return { success: true, comment };
  },
});

// ─────────────────────────────────────────────
// DELETE POST
// ─────────────────────────────────────────────
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("POST_NOT_FOUND");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    // Solo el autor o admin/mod puede borrar
    const isAuthor = post.userId === args.userId;
    const isMod = user.role >= 4; // MOD = 4

    if (!isAuthor && !isMod) throw new Error("UNAUTHORIZED");

    await ctx.db.patch(args.postId, { status: "deleted" });
    return { success: true };
  },
});

// ─────────────────────────────────────────────
// GET SINGLE POST
// ─────────────────────────────────────────────
export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.status === "deleted") return null;

    const user = await ctx.db.get(post.userId);
    return {
      ...post,
      author: user
        ? {
            _id: user._id,
            nombre: user.nombre,
            usuario: user.usuario,
            avatar: user.avatar,
            esVerificado: user.esVerificado,
            rol: user.rol,
            esPro: user.esPro,
          }
        : null,
    };
  },
});
