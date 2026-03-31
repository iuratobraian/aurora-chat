import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { calculateXpGain } from "./lib/permissions";
import { addXpInternal } from "./lib/gamification";
import { api } from "./_generated/api";
import { checkSpam, checkUserRateLimit } from "./moderation";
import { checkRateLimit } from "./lib/rateLimit";
import { assertOwnershipOrAdmin } from "./lib/auth";
import logger from "./logger";

const AI_BOT_USER_ID = "ai_agent_system";

// Query cache for exclusive community IDs (refreshes every 5 minutes)
let exclusiveCommunityCache: { ids: Set<string>; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getExclusiveCommunityIds(ctx: any): Promise<Set<string>> {
  const now = Date.now();
  if (exclusiveCommunityCache && (now - exclusiveCommunityCache.timestamp) < CACHE_TTL) {
    return exclusiveCommunityCache.ids;
  }
  
  const communities = await ctx.db
    .query("communities")
    .withIndex("by_isPortalExclusive", (q: any) => q.eq("isPortalExclusive", true))
    .collect();
  
  const ids = new Set<string>(communities.map((c: any) => c._id.toString()));
  exclusiveCommunityCache = { ids, timestamp: now };
  return ids;
}

// Obtener posts ordenados con información de usuario - OPTIMIZADO
export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    // Use cached exclusive community IDs
    const exclusiveCommunityIds = await getExclusiveCommunityIds(ctx);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(20);

    if (posts.length === 0) return [];

    // Filter out posts from exclusive communities
    const filteredPosts = posts.filter(post => {
      // For direct posts, check if they belong to an exclusive community via subcommunityId
      if (post.subcommunityId && exclusiveCommunityIds.has(post.subcommunityId)) {
        return false;
      }
      return true;
    });

    const userIds = [...new Set(filteredPosts.map(p => p.userId))];
    
    const profileMap = new Map();
    if (userIds.length > 0) {
      const profiles = await Promise.all(
        userIds.map((userId: string) =>
          ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", userId)).first()
        )
      );
      profiles.forEach(p => {
        if (p) profileMap.set(p.userId, p);
      });
    }

    return filteredPosts.map((post) => {
      const postAny = post as any;
      
      if (post.userId === "ai_sentiment_agent") {
        return {
          ...post,
          nombreUsuario: "Máximo | Market News",
          usuarioManejo: "max_news",
          avatarUsuario: "https://api.dicebear.com/7.x/avataaars/svg?seed=max_news&backgroundColor=c0aede",
          esPro: true,
          esVerificado: true,
          authorFollowers: 12500,
          accuracyUser: 87,
        };
      }

      const profile = profileMap.get(post.userId);

      const nombreUsuario = profile?.nombre || postAny.nombreUsuario || "Usuario";
      const usuarioManejo = profile?.usuario || postAny.usuarioManejo || "user";
      const avatarUsuario = profile?.avatar || postAny.avatarUsuario || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`;

      return {
        ...post,
        nombreUsuario,
        usuarioManejo,
        avatarUsuario,
        avatarFrame: profile?.avatarFrame ?? postAny.avatarFrame,
        esPro: profile?.esPro ?? postAny.esPro ?? false,
        esVerificado: profile?.esVerificado ?? postAny.esVerificado ?? false,
        authorFollowers: profile?.seguidores?.length ?? postAny.authorFollowers ?? 0,
        accuracyUser: profile?.accuracy ?? postAny.accuracyUser ?? 50,
      };
    });
  },
});



// Obtener posts con paginación - OPTIMIZADO con cursor nativo de Convex
export const getPostsPaginated = query({
  args: { 
    numItems: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const numItems = args.numItems ?? 10;
    
    // Use cached exclusive community IDs
    const exclusiveCommunityIds = await getExclusiveCommunityIds(ctx);
    
    const cursor: string | null = args.cursor ?? null;
    const pagination = await ctx.db
      .query("posts")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "active"))
      .order("desc")
      .paginate({ cursor, numItems });

    if (pagination.page.length === 0) {
      return { page: [], continueCursor: null, isDone: true };
    }

    // Filter out posts from exclusive communities
    const filteredPage = pagination.page.filter((post: any) => {
      if (post.subcommunityId && exclusiveCommunityIds.has(post.subcommunityId)) {
        return false;
      }
      return true;
    });

    const continueCursor = pagination.continueCursor;
    const isDone = pagination.isDone || filteredPage.length < numItems;

    const userIds = [...new Set(filteredPage.map((p: any) => p.userId))];
    const profiles = await Promise.all(
      userIds.map((userId: string) =>
        ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", userId)).first()
      )
    );
    const profileMap = new Map(
      profiles.filter((p): p is NonNullable<typeof p> => p !== null).map(p => [p.userId, p])
    );

    const postsWithUser = filteredPage.map((post: any) => {
      if (post.userId === "ai_sentiment_agent") {
        return {
          ...post,
          nombreUsuario: "Máximo | Market News",
          usuarioManejo: "max_news",
          avatarUsuario: "https://api.dicebear.com/7.x/avataaars/svg?seed=max_news&backgroundColor=c0aede",
          esPro: true,
          esVerificado: true,
          authorFollowers: 12500,
          accuracyUser: 87,
        };
      }

      const profile = profileMap.get(post.userId);

      const nombreUsuario = profile?.nombre || post.nombreUsuario || "Usuario";
      const usuarioManejo = profile?.usuario || post.usuarioManejo || "user";
      const avatarUsuario = profile?.avatar || post.avatarUsuario || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`;

      return {
        ...post,
        nombreUsuario,
        usuarioManejo,
        avatarUsuario,
        avatarFrame: profile?.avatarFrame ?? post.avatarFrame,
        esPro: profile?.esPro ?? post.esPro ?? false,
        esVerificado: profile?.esVerificado ?? post.esVerificado ?? false,
        authorFollowers: profile?.seguidores?.length ?? post.authorFollowers ?? 0,
        accuracyUser: profile?.accuracy ?? post.accuracyUser ?? 50,
      };
    });

    return { page: postsWithUser, continueCursor, isDone };
  },
});

// Obtener posts de un usuario
export const getPostsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Crear post
export const createPost = mutation({
  args: {
    userId: v.string(),
    titulo: v.optional(v.string()),
    par: v.optional(v.string()),
    tipo: v.optional(v.string()),
    contenido: v.string(),
    categoria: v.string(),
    esAnuncio: v.boolean(),
    datosGrafico: v.optional(v.array(v.number())),
    tradingViewUrl: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    zonaOperativa: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    reputationSnapshot: v.optional(v.number()),
    badgesSnapshot: v.optional(v.array(v.string())),
    comentariosCerrados: v.optional(v.boolean()),
    isAiAgent: v.optional(v.boolean()),
    sentiment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);

    // Check rate limit by tier
    const rateLimit = await checkRateLimit(ctx, args.userId, "createPost");
    if (!rateLimit) {
      throw new Error("Límite de posts excedido para tu tier. Upgrade a PRO para más posts.");
    }

    // Check for spam
    const spamCheck = await checkSpam(ctx, args.contenido, args.userId, "post");
    if (spamCheck.isSpam && spamCheck.isPending) {
      const now = Date.now();
      const postId = await ctx.db.insert("posts", {
        ...args,
        likes: [],
        comentarios: [],
        compartidos: 0,
        createdAt: now,
        ultimaInteraccion: now,
        status: "pending_review",
      });

      // Create spam report
      await ctx.db.insert("spamReports", {
        userId: args.userId,
        contentId: postId.toString(),
        content: args.contenido.substring(0, 500),
        reason: spamCheck.reason,
        contentType: "post",
        createdAt: now,
        status: "pending",
      });

      return { postId, pendingReview: true, reason: spamCheck.reason };
    }

    const now = Date.now();
    
    // Obtener frame actual del perfil para el snapshot
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const postId = await ctx.db.insert("posts", {
      ...args,
      likes: [],
      comentarios: [],
      compartidos: 0,
      createdAt: now,
      ultimaInteraccion: now,
      status: "active",
      avatarFrame: profile?.avatarFrame,
    });

    // Gamification Integration
    await addXpInternal(ctx, args.userId, "post");

    // AI Dual-Posting: Also create in AI News community
    if (args.isAiAgent) {
      try {
        let aiNewsCommunity = await ctx.db
          .query("communities")
          .withIndex("by_slug", (q) => q.eq("slug", "ai-news"))
          .first();

        if (!aiNewsCommunity) {
          const communityId = await ctx.db.insert("communities", {
            ownerId: AI_BOT_USER_ID,
            name: "AI News",
            slug: "ai-news",
            description: "Noticias y análisis generados por IA automáticamente",
            visibility: "public",
            accessType: "free",
            priceMonthly: 0,
            maxMembers: 999999,
            currentMembers: 1,
            plan: "free",
            stripeAccountId: undefined,
            totalRevenue: 0,
            status: "active",
            createdAt: Date.now(),
          });

          await ctx.db.insert("communityMembers", {
            communityId,
            userId: AI_BOT_USER_ID,
            role: "owner",
            subscriptionStatus: undefined,
            joinedAt: Date.now(),
          });

          aiNewsCommunity = await ctx.db.get(communityId);
        }

        if (aiNewsCommunity) {
          await ctx.db.insert("communityPosts", {
            communityId: aiNewsCommunity._id,
            userId: args.userId,
            titulo: args.titulo || "",
            contenido: args.contenido,
            imagenUrl: args.imagenUrl || "",
            tipo: "text",
            likes: [],
            commentsCount: 0,
            isPinned: false,
            isLocked: false,
            tags: args.tags,
            createdAt: now,
            updatedAt: now,
            status: "active",
          });
          logger.info(`[AI DUAL-POST] Post ${postId} replicated to AI News community`);
        }
      } catch (e) {
        logger.warn(`[AI DUAL-POST] Failed to create dual post: ${e}`);
      }
    }

    return { postId, pendingReview: false };
  },
});

// Actualizar contenido (Solo Autor o Admin)
export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    userId: v.string(),
    likes: v.optional(v.array(v.string())),
    comentarios: v.optional(v.array(v.any())),
    contenido: v.optional(v.string()),
    titulo: v.optional(v.string()),
    categoria: v.optional(v.string()),
    esAnuncio: v.optional(v.boolean()),
    tradingViewUrl: v.optional(v.string()),
    ratings: v.optional(v.array(v.any())),
    encuesta: v.optional(v.any()),
    ultimaInteraccion: v.optional(v.number()),
    compartidos: v.optional(v.number()),
    comentariosCerrados: v.optional(v.boolean()),
    par: v.optional(v.string()),
    tipo: v.optional(v.string()),
    zonaOperativa: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    imagenUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);
    const { id, userId, ...updates } = args;
    const post = await ctx.db.get(id);
    if (!post) throw new Error("Post no encontrado");

    if (post.userId !== userId) {
      const admin = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No tienes permiso para editar este post");
    }

    // Registrar edición en historial antes de actualizar
    const editHistory = post.editHistory || [];
    editHistory.push({
      timestamp: Date.now(),
      userId: userId,
      previousData: { contenido: post.contenido, titulo: post.titulo },
      newData: updates,
      changes: Object.keys(updates),
    });

    // Agregar audit fields
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
      editHistory,
    });
  },
});

// Toggle like en un post
export const toggleLike = mutation({
  args: { id: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);

    const post = await ctx.db.get(args.id);
    if (!post) return;
    const likes = post.likes || [];
    const hasLiked = likes.includes(args.userId);
    const newLikes = hasLiked
      ? likes.filter((id) => id !== args.userId)
      : [...likes, args.userId];
    
    await ctx.db.patch(args.id, { likes: newLikes });

    if (!hasLiked) {
      // XP for Liker
      await addXpInternal(ctx, args.userId, "like");
      
      // Notification and XP for Author
      if (post.userId !== args.userId) {
        await addXpInternal(ctx, post.userId, "like");
        await ctx.db.insert("notifications", {
          userId: post.userId,
          type: "like",
          title: "👍 ¡NUEVO LIKE!",
          body: `A alguien le gustó tu post: ${post.titulo || 'Sin título'}`,
          read: false,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.userId}`,
          createdAt: Date.now(),
        });
      }
    }

    return newLikes;
  },
});

// Agregar comentario con XP y Notificaciones
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    text: v.string(),
    parentId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);

    // Check rate limit for comments
    const rateLimit = await checkUserRateLimit(ctx, args.userId, "comment");
    if (!rateLimit.allowed) {
      throw new Error(rateLimit.reason || "Límite de comentarios excedido");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const profile = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", args.userId)).unique();
    if (!profile) throw new Error("Perfil no encontrado");

    // Check for spam in comment
    const spamCheck = await checkSpam(ctx, args.text, args.userId, "comment");
    const isFlagged = spamCheck.isSpam;

    const newComment = {
      id: Date.now().toString(),
      userId: args.userId,
      nombreUsuario: profile.nombre,
      avatarUsuario: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.userId}`,
      texto: isFlagged ? "[Contenido en revisión]" : args.text,
      tiempo: "Ahora",
      likes: [],
      respuestas: [],
      createdAt: Date.now(),
      flagged: isFlagged,
      flaggedReason: spamCheck.reason,
    };

    const addReply = (comments: any[]): any[] =>
      comments.map(c => {
        if (c.id === args.parentId) return { ...c, respuestas: [...(c.respuestas || []), newComment] };
        if (c.respuestas?.length) return { ...c, respuestas: addReply(c.respuestas) };
        return c;
      });

    const updatedComments = args.parentId 
      ? addReply(post.comentarios || []) 
      : [newComment, ...(post.comentarios || [])];

    await ctx.db.patch(args.postId, {
      comentarios: updatedComments,
      ultimaInteraccion: Date.now()
    });

    // If flagged by spam, create a report
    if (isFlagged && spamCheck.isPending) {
      await ctx.db.insert("spamReports", {
        userId: args.userId,
        contentId: args.postId.toString(),
        content: args.text.substring(0, 500),
        reason: spamCheck.reason,
        contentType: "comment",
        createdAt: Date.now(),
        status: "pending",
      });
    }

    // Gamification
    if (!isFlagged) {
      await addXpInternal(ctx, args.userId, "comment");
    }

    // Notification for Author
    if (post.userId !== args.userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "comment",
        title: "💬 NUEVO COMENTARIO",
        body: `${profile.nombre} comentó en tu post: ${post.titulo || 'Sin título'}`,
        read: false,
        avatarUrl: profile.avatar,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  }
});

// Eliminar post (MOVER A PAPELERA - Soft Delete)
export const deletePost = mutation({
  args: { id: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);
    
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post no encontrado");

    // Check if already in trash
    if (post.status === "trash") {
      return { success: true, message: "Post ya estaba en papelera" };
    }

    const isOwner = post.userId === args.userId;
    let isAdmin = false;
    
    if (!isOwner) {
      const admin = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .unique();
      isAdmin = !!admin && (admin.role || 0) >= 4;
    }

    if (!isOwner && !isAdmin) throw new Error("No autorizado para eliminar este post");

    // Soft delete con auditoría
    await ctx.db.patch(args.id, { 
      status: "trash",
      deletedAt: Date.now(),
      deletedBy: args.userId,
    });
    return { success: true, message: "Post movido a papelera" };
  },
});

// Obtener posts eliminados (Papelera) - Solo autor o admin
export const getTrashPosts = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
      
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();
      
      const isAdmin = profile && (profile.role || 0) >= 4; // MOD/ADMIN status
      
      if (!isAdmin) {
        // Return limited trash posts for the authenticated non-admin user
        return await ctx.db
          .query("posts")
          .withIndex("by_userId", q => q.eq("userId", identity.subject))
          .collect()
          .then(posts => posts.filter(p => p.status === "trash"));
      }
      
      // Admin view: Limited collection to prevent server crashes
      return await ctx.db
        .query("posts")
        .withIndex("by_status", q => q.eq("status", "trash"))
        .order("desc")
        .take(100);
    } catch (error) {
      console.error("Error in getTrashPosts:", error);
      return [];
    }
  },
});

// Cancelar post en pending_review (rollback antes de moderación)
export const cancelPendingPost = mutation({
  args: { id: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (identity.subject !== args.userId) throw new Error("No autorizado");
    
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post no encontrado");
    
    if (post.userId !== args.userId) {
      throw new Error("Solo puedes cancelar tus propios posts");
    }
    
    if (post.status !== "pending_review") {
      throw new Error("Solo puedes cancelar posts en revisión");
    }
    
    // Soft delete con auditoría
    await ctx.db.patch(args.id, { 
      status: "deleted",
      deletedAt: Date.now(),
      deletedBy: args.userId,
      deleteReason: "user_cancelled_pending_review",
    });
    
    // Eliminar spam report asociado si existe
    const spamReports = await ctx.db
      .query("spamReports")
      .withIndex("by_contentId", q => q.eq("contentId", args.id.toString()))
      .collect();
    
    for (const report of spamReports) {
      await ctx.db.delete(report._id);
    }
    
    return { success: true, message: "Post cancelado y eliminado" };
  },
});

// Obtener posts pendientes de revisión (para el usuario)
export const getPendingPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    if (identity.subject !== args.userId) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();
      if (!profile || (profile.role || 0) < 5) return [];
    }
    
    return await ctx.db
      .query("posts")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .collect()
      .then(posts => posts.filter(p => p.status === "pending_review"));
  },
});

// Restaurar post (recuperar de papelera)
export const restorePost = mutation({
  args: { id: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");
    
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post no encontrado");
    
    // Verificar autorización
    const isOwner = post.userId === args.userId;
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const isAdmin = !!admin && (admin.role || 0) >= 4;
    
    if (!isOwner && !isAdmin) throw new Error("No autorizado para restaurar este post");

    // Restaurar - limpiar campos de auditoría
    await ctx.db.patch(args.id, { 
      status: "published",
      deletedAt: undefined,
      deletedBy: undefined,
      deleteReason: undefined,
    });
    
    // Registrar en auditoría
    await ctx.db.insert("backups", {
      itemId: args.id.toString(),
      itemType: "post",
      operation: "update" as const,
      previousData: post,
      newData: null,
      diff: null,
      userId: args.userId,
      createdAt: Date.now(),
      restored: true,
    });
  },
});

// Eliminar post PERMANENTEMENTE
export const permanentDeletePost = mutation({
  args: { id: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado para eliminar posts");

    await ctx.db.delete(args.id);
  },
});

// Dar puntos/monedas a un post
export const givePoints = mutation({
  args: { postId: v.id("posts"), userId: v.string(), points: v.number() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    if (args.points <= 0) throw new Error("Las monedas deben ser mayores a cero");

    const now = Date.now();
    
    // 1. Verificar balance del donante
    const donor = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!donor) throw new Error("Perfil de donante no encontrado");
    
    const available = donor.dailyFreeCoinsBalance || 0;
    if (args.points > available) {
      throw new Error(`No tienes suficientes monedas. Disponibles: ${available}`);
    }

    // 2. Restar monedas del balance diario
    await ctx.db.patch(donor._id, {
      dailyFreeCoinsBalance: available - args.points,
    });

    // 3. Insertar registro de puntos
    await ctx.db.insert("post_points", {
      postId: args.postId.toString(),
      userId: args.userId,
      points: args.points,
      givenAt: now,
    });

    // 4. Actualizar total en el post
    const currentPoints = (post as any).puntos || 0;
    await ctx.db.patch(args.postId, {
      puntos: currentPoints + args.points,
      ultimaInteraccion: now,
    });

    // 5. Notificación para el autor
    if (post.userId !== args.userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "puntos",
        title: "✨ ¡HAS RECIBIDO MONEDAS!",
        body: `${donor.nombre} te ha regalado ${args.points} monedas en tu post: ${post.titulo || 'Sin título'}`,
        read: false,
        avatarUrl: donor.avatar,
        createdAt: now,
      });
    }

    return { success: true, newTotal: currentPoints + args.points, balanceRemaining: available - args.points };
  },
});

// Mutación interna para dar puntos (sin require auth Convex)
export const givePointsInternal = mutation({
  args: { postId: v.id("posts"), userId: v.string(), points: v.number() },
  handler: async (ctx, args) => {
    if (args.points <= 0) throw new Error("Los puntos deben ser mayores a cero");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post no encontrado");

    const now = Date.now();
    
    // Verificar si el usuario ya dio puntos a este post
    const existingPoints = await ctx.db
      .query("post_points")
      .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", args.userId))
      .unique();
    
    if (existingPoints) {
      throw new Error("Ya has dado puntos a este post");
    }
    
    // Insertar registro de puntos
    await ctx.db.insert("post_points", {
      postId: args.postId,
      userId: args.userId,
      points: args.points,
      givenAt: now,
    });

    // Actualizar total en el post
    const currentPoints = (post as any).puntos || 0;
    await ctx.db.patch(args.postId, {
      puntos: currentPoints + args.points,
      ultimaInteraccion: now,
    });

    // Notificación para el autor
    if (post.userId !== args.userId) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .unique();

      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "puntos",
        title: "✨ ¡HAS RECIBIDO PUNTOS!",
        body: `${profile?.nombre || 'Alguien'} te ha dado ${args.points} puntos en tu post: ${post.titulo || 'Sin título'}`,
        read: false,
        avatarUrl: profile?.avatar,
        createdAt: now,
      });
    }

    return { success: true, newTotal: currentPoints + args.points };
  },
});

// FUNCIÓN DE SEMILLA (SEED) - Solo SUPERADMIN (role >= 6)
export const seedDatabase = internalMutation({
  args: { adminId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const adminUserId = args.adminId || "admin_initial_seed";
    
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", adminUserId))
      .unique();
    if (!admin || (admin.role || 0) < 6) throw new Error("Solo superadmin puede ejecutar seed");

    // 1. Limpiar posts existentes
    const allPosts = await ctx.db.query("posts").collect();
    for (const post of allPosts) {
      await ctx.db.delete(post._id);
    }

    // 2. Crear un perfil de admin si no existe
    const adminId = "admin_initial_seed";
    const existingAdmin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", adminId)).unique();

    const adminData = {
      userId: adminId,
      nombre: "Admin",
      usuario: "brai",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=brai",
      esPro: true,
      esVerificado: true,
      rol: "admin",
      role: 6,
      xp: 10000,
      level: 50,
      email: "admin@tradeportal.com",
      biografia: "Cuenta oficial de administracion.",
      seguidores: [],
      siguiendo: [],
      aportes: 0,
      accuracy: 100,
      reputation: 100,
      saldo: 1000,
      fechaRegistro: new Date().toISOString(),
      estadisticas: {},
    };

    if (existingAdmin) {
      await ctx.db.patch(existingAdmin._id, { ...adminData, createdAt: Date.now() });
    } else {
      await ctx.db.insert("profiles", { ...adminData, createdAt: Date.now() });
    }

    // 3. Crear posts de prueba
    const now = Date.now();
    await ctx.db.insert("posts", {
      userId: adminId,
      titulo: "¡Bienvenidos a la nueva plataforma!",
      contenido: "Esta es una publicación de prueba generada automáticamente para verificar la conexión con Convex. ¡Todo funciona correctamente!",
      categoria: "General",
      esAnuncio: true,
      likes: [],
      comentarios: [],
      compartidos: 0,
      createdAt: now,
      ultimaInteraccion: now,
      reputationSnapshot: 100,
      badgesSnapshot: ["Verified"],
    });

    return "Database seeded successfully";
  }
});

// SEED DATA: Comunidades y Publicidades de ejemplo
export const seedCommunitiesAndAds = internalMutation({
  args: { creatorId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const creatorId = args.creatorId || "system_seed";

    // 6 COMUNIDADES DE EJEMPLO
    const communityData = [
      {
        ownerId: creatorId,
        name: "Forex Warriors",
        slug: "forex-warriors",
        description: "Domina el mercado Forex. Análisis de pares mayores, estrategias de price action y gestión de riesgo.",
        visibility: "public" as const,
        accessType: "free" as const,
        maxMembers: 500,
        currentMembers: 127,
        plan: "growth" as const,
        totalRevenue: 0,
        status: "active" as const,
        createdAt: now,
      },
      {
        ownerId: creatorId,
        name: "Crypto Bulls",
        slug: "crypto-bulls",
        description: "Trading de Criptomonedas. Bitcoin, Ethereum, análisis on-chain y estrategias DeFi.",
        visibility: "public" as const,
        accessType: "free" as const,
        maxMembers: 1000,
        currentMembers: 342,
        plan: "scale" as const,
        totalRevenue: 0,
        status: "active" as const,
        createdAt: now,
      },
      {
        ownerId: creatorId,
        name: "Trading Consistente",
        slug: "trading-consistente",
        description: "Strategies que funcionan. Enfoque en psicotrading, disciplina y resultados reproducibles.",
        visibility: "public" as const,
        accessType: "paid" as const,
        priceMonthly: 29.99,
        maxMembers: 200,
        currentMembers: 89,
        plan: "enterprise" as const,
        totalRevenue: 2670,
        status: "active" as const,
        createdAt: now,
      },
      {
        ownerId: creatorId,
        name: "Indices Trading",
        slug: "indices-trading",
        description: "SP500, Nasdaq, Dow. Análisis de índices bursátiles y correlación con mercados globales.",
        visibility: "public" as const,
        accessType: "free" as const,
        maxMembers: 300,
        currentMembers: 156,
        plan: "growth" as const,
        totalRevenue: 0,
        status: "active" as const,
        createdAt: now,
      },
      {
        ownerId: creatorId,
        name: "Gold & Commodities",
        slug: "gold-commodities",
        description: "Oro, Petróleo, Commodities. Trading de materias primas y activos tangibles.",
        visibility: "public" as const,
        accessType: "paid" as const,
        priceMonthly: 19.99,
        maxMembers: 150,
        currentMembers: 67,
        plan: "starter" as const,
        totalRevenue: 1339,
        status: "active" as const,
        createdAt: now,
      },
      {
        ownerId: creatorId,
        name: "Options Trading",
        slug: "options-trading",
        description: "Estrategias de opciones. Spreads, straddles, strangles y gestión de delta.",
        visibility: "public" as const,
        accessType: "paid" as const,
        priceMonthly: 49.99,
        maxMembers: 100,
        currentMembers: 45,
        plan: "enterprise" as const,
        totalRevenue: 2249,
        status: "active" as const,
        createdAt: now,
      },
    ];

    const createdCommunities: { slug: string; id: any }[] = [];
    for (const data of communityData) {
      const existing = await ctx.db
        .query("communities")
        .withIndex("by_slug", (q) => q.eq("slug", data.slug))
        .first();
      
      if (!existing) {
        const id = await ctx.db.insert("communities", data);
        createdCommunities.push({ slug: data.slug, id });
        
        // Agregar owner como miembro
        await ctx.db.insert("communityMembers", {
          communityId: id,
          userId: creatorId,
          role: "owner",
          joinedAt: now,
        });
      } else {
        createdCommunities.push({ slug: data.slug, id: existing._id });
      }
    }

    // Crear publicidades de ejemplo - TradePortal Ads
    const adsData = [
      // Sidebar Ads
      {
        titulo: "Señales de Trading Premium",
        descripcion: "Recibe señales diarias de forex, crypto e índices con más del 85% de precisión. Prueba gratis 7 días.",
        imagenUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        link: "/senales",
        sector: "sidebar",
        activo: true,
        subtitle: "Señales VIP",
        extra: "Probar Gratis",
      },
      {
        titulo: "Copy Trading Automático",
        descripcion: "Copia las operaciones de traders profesionales automáticamente. Sin experiencia requerida.",
        imagenUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
        link: "/copy-trading",
        sector: "sidebar",
        activo: true,
        subtitle: "Nuevo",
        extra: "Comenzar",
      },
      {
        titulo: "Comunidades de Trading",
        descripcion: "Únete a comunidades exclusivas de traders. Comparte estrategias y aprende de los mejores.",
        imagenUrl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
        link: "/comunidades",
        sector: "sidebar",
        activo: true,
        subtitle: "Únete Gratis",
        extra: "Ver Más",
      },
      // Feed Ads
      {
        titulo: "Masterclass de Trading",
        descripcion: "Aprende las técnicas profesionales de trading con nuestros expertos. 20 horas de contenido exclusivo.",
        imagenUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        link: "/cursos",
        sector: "feed",
        activo: true,
        subtitle: "Formación Premium",
        extra: "Ver Curso",
      },
      {
        titulo: "Propel Your Trading Career",
        descripcion: "Accede a herramientas profesionales de análisis, calendario económico y más. Todo en un solo lugar.",
        imagenUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        link: "/productos",
        sector: "feed",
        activo: true,
        subtitle: "Herramientas Pro",
        extra: "Explorar",
      },
      // Banner Ads
      {
        titulo: "EAs y Robots de Trading",
        descripcion: "Automatiza tu trading con Expert Advisors optimizados. Compatible con MT4 y MT5.",
        imagenUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        link: "/marketplace",
        sector: "banner",
        activo: true,
        subtitle: "Marketplace",
        extra: "Ver EAs",
      },
      {
        titulo: "TradePortal Pro Membership",
        descripcion: "Desbloquea todas las funciones premium: señales, análisis y comunidad VIP.",
        imagenUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        link: "/pricing",
        sector: "banner",
        activo: true,
        subtitle: "Premium",
        extra: "Upgrade",
      },
      // Cursos Ads
      {
        titulo: "Curso de Forex desde Cero",
        descripcion: "Domina el mercado de divisas desde los fundamentos hasta estrategias avanzadas.",
        imagenUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
        link: "/academia/forex",
        sector: "cursos",
        activo: true,
        subtitle: "Academia",
        extra: "Inscribirse",
      },
      {
        titulo: "Análisis Técnico Profesional",
        descripcion: "Aprende a leer gráficos como un experto. Patrones, indicadores y mucho más.",
        imagenUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
        link: "/academia/analisis",
        sector: "cursos",
        activo: true,
        subtitle: "Popular",
        extra: "Ver Detalles",
      },
      // Noticias Ads
      {
        titulo: "Calendario Económico",
        descripcion: "No te pierdas ningún evento importante. Calendario en tiempo real con análisis.",
        imagenUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80",
        link: "/calendario",
        sector: "noticias",
        activo: true,
        subtitle: "Daily Brief",
        extra: "Ver Calendario",
      },
      {
        titulo: "Análisis Semanal del Mercado",
        descripcion: "Resumen completo de los mercados: forex, crypto, índices y commodities.",
        imagenUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        link: "/news",
        sector: "noticias",
        activo: true,
        subtitle: "News",
        extra: "Leer Más",
      },
      // Prop Firms
      {
        titulo: "Trading Challenge",
        descripcion: "Demuestra tu skill y accede a fondos de hasta $200K. Sin riesgo de tu bolsillo.",
        imagenUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        link: "/prop-firms",
        sector: "sidebar",
        activo: true,
        subtitle: "Prop Trading",
        extra: "Aplicar",
      },
    ];

    let adsCreated = 0;
    for (const data of adsData) {
      await ctx.db.insert("ads", data);
      adsCreated++;
    }

    return { communities: createdCommunities.length, ads: adsCreated };
  }
});

// SEED DATA: Posts de ejemplo para comunidades
export const seedCommunityPosts = internalMutation({
  args: { communitySlug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = "system_seed";

    const communityMap: Record<string, { categoria: string; par: string }> = {
      "forex-warriors": { categoria: "Forex", par: "EUR/USD" },
      "crypto-bulls": { categoria: "Crypto", par: "BTC/USD" },
      "trading-consistente": { categoria: "Educación", par: "" },
      "indices-trading": { categoria: "Índices", par: "SP500" },
      "gold-commodities": { categoria: "Commodities", par: "XAU/USD" },
      "options-trading": { categoria: "Opciones", par: "" },
    };

    const postsTemplates = [
      {
        tipo: "Análisis",
        templates: [
          { titulo: "Análisis Semanal del Mercado", contenido: "Resumen de los movimientos más importantes de la semana. Soportes y resistencias clave identificados." },
          { titulo: " setup de Entrada Confirmado", contenido: "He identificado un setup clásico de price action. Mañana publicaremos la operación en vivo." },
        ]
      },
      {
        tipo: "Idea",
        templates: [
          { titulo: " Oportunidad de Compra Detectada", contenido: "El precio ha llegado a una zona de demanda histórica. Mi gestión de riesgo está lista." },
          { titulo: "Idea de Trading del Día", contenido: "Comparto mi análisis del día. La tendencia está clara, solo falta esperar el pullback." },
        ]
      },
      {
        tipo: "Educativo",
        templates: [
          { titulo: "Concepto Clave: Soporte y Resistencia", contenido: "Hoy explico cómo identificar correctamente los niveles clave en el chart." },
          { titulo: "Tip: Cómo Gestionar el Riesgo", contenido: "Nunca arriesgues más del 1-2% de tu capital por operación. Disciplina es igual a supervivencia." },
        ]
      },
      {
        tipo: "Noticia",
        templates: [
          { titulo: " Impacto de las Noticias en el Mercado", contenido: "Los datos económicos de hoy moverán el mercado. Prepárate para volatilidad." },
          { titulo: "Alerta: Evento de Alto Impacto", contenido: "Esta noche tenemos decisión de tasas. Las sorpresas pueden generar movimientos grandes." },
        ]
      },
    ];

    let postsCreated = 0;

    for (const [slug, config] of Object.entries(communityMap)) {
      const existing = await ctx.db
        .query("communities")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      
      if (!existing) continue;

      // Crear 4 posts por comunidad
      for (let i = 0; i < postsTemplates.length; i++) {
        const template = postsTemplates[i];
        const postData = template.templates[i % template.templates.length];

        await ctx.db.insert("posts", {
          userId,
          titulo: postData.titulo,
          par: config.par,
          tipo: template.tipo,
          contenido: postData.contenido,
          categoria: config.categoria,
          esAnuncio: false,
          likes: [],
          comentarios: [],
          tags: [config.categoria.toLowerCase(), slug],
          sentiment: i % 2 === 0 ? "Bullish" : "Neutral",
          createdAt: now - (i * 3600000), // Posts espaciados 1 hora
          ultimaInteraccion: now - (i * 3600000),
          status: "active",
        });
        postsCreated++;
      }
    }

    return { postsCreated };
  }
});

// Dar puntos a un post (estilo Taringa)
export const givePostPoints = mutation({
  args: {
    postId: v.string(),
    userId: v.string(),
    points: v.number(),
  },
  handler: async (ctx, args) => {
    const { postId, userId, points } = args;

    // Verificar si el usuario ya dio puntos a este post
    const existingVote = await ctx.db
      .query("post_points")
      .withIndex("by_post_user", (q) => q.eq("postId", postId).eq("userId", userId))
      .first();

    if (existingVote) {
      throw new Error("Ya has dado puntos a esta publicación");
    }

    // Verificar que el post existe
    const post = await ctx.db.query("posts").collect()
      .then(posts => posts.find(p => (p as any)._id.toString() === postId));
    if (!post) {
      throw new Error("Publicación no encontrada");
    }

    // Registrar el voto
    await ctx.db.insert("post_points", {
      postId,
      userId,
      points,
      givenAt: Date.now(),
    });

    // Actualizar puntos totales del post
    const currentPuntos = (post as any).puntos || 0;
    await ctx.db.patch(postId as any, {
      puntos: currentPuntos + points,
    });

    // Notificar al autor del post
    if (post.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "puntos",
        title: "¡Puntos recibidos!",
        body: `Alguien te dio ${points} puntos en tu publicación`,
        link: `/post/${postId}`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true, totalPoints: currentPuntos + points };
  },
});

// Obtener puntos dados por usuario a un post
export const getPostPointsGiven = query({
  args: {
    postId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("post_points")
      .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", args.userId))
      .first();

    return vote?.points || 0;
  },
});

// Obtener puntos totales de un post
export const getPostTotalPoints = query({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.query("posts").filter((q) => q.eq(q.field("_id"), args.postId as any)).first();
    return (post as any)?.puntos || 0;
  },
});

// Obtener posts más puntuados (para ranking)
export const getTopPointsPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Ordenar por puntos
    const sortedPosts = posts
      .map(p => ({ ...p, puntos: (p as any).puntos || 0 }))
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, limit);

    return sortedPosts;
  },
});

// ELIMINAR TODOS LOS POSTS - Para limpieza de base de datos
export const deleteAllPosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("posts").collect();
    let deleted = 0;
    
    for (const post of allPosts) {
      await ctx.db.delete(post._id);
      deleted++;
    }

    return { deleted, message: `Se eliminaron ${deleted} posts` };
  },
});
