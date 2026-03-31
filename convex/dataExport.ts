import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * EXPORTAR DATOS - Administrador puede exportar toda la información
 */

// Exportar todos los perfiles
export const exportProfiles = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("profiles").collect();
    const filtered = args.includeDeleted 
      ? profiles 
      : profiles.filter(p => !p.status || p.status !== "deleted");
    return filtered.map(p => ({
      ...p,
      _exportedAt: Date.now(),
    }));
  },
});

// Exportar todos los posts
export const exportPosts = query({
  args: { includeTrash: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").collect();
    const filtered = args.includeTrash 
      ? posts 
      : posts.filter(p => !p.status || (p.status !== "trash" && p.status !== "deleted"));
    return filtered.map(p => ({
      ...p,
      _exportedAt: Date.now(),
    }));
  },
});

// Exportar todos los comentarios (de posts)
export const exportComments = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const allComments: any[] = [];
    for (const post of posts) {
      if (post.comentarios && post.comentarios.length > 0) {
        for (const comment of post.comentarios) {
          allComments.push({
            ...comment,
            postId: post._id,
            postTitle: post.titulo,
            _exportedAt: Date.now(),
          });
        }
      }
    }
    return allComments;
  },
});

// Exportar todas las comunidades
export const exportCommunities = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const communities = await ctx.db.query("communities").collect();
    const filtered = args.includeDeleted 
      ? communities 
      : communities.filter(c => !c.status || c.status !== "deleted");
    return filtered.map(c => ({
      ...c,
      _exportedAt: Date.now(),
    }));
  },
});

// Exportar todo en un solo JSON
export const exportAllData = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("profiles").collect();
    const posts = await ctx.db.query("posts").collect();
    const communities = await ctx.db.query("communities").collect();
    const ads = await ctx.db.query("ads").collect();
    
    const allComments: any[] = [];
    for (const post of posts) {
      if (post.comentarios && post.comentarios.length > 0) {
        for (const comment of post.comentarios) {
          allComments.push({
            ...comment,
            postId: post._id,
          });
        }
      }
    }

    return {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      profiles: profiles.map(p => ({ ...p, _exportedAt: Date.now() })),
      posts: posts.map(p => ({ ...p, _exportedAt: Date.now() })),
      comments: allComments.map(c => ({ ...c, _exportedAt: Date.now() })),
      communities: communities.map(c => ({ ...c, _exportedAt: Date.now() })),
      ads: ads.map(a => ({ ...a, _exportedAt: Date.now() })),
      stats: {
        totalProfiles: profiles.length,
        totalPosts: posts.length,
        totalComments: allComments.length,
        totalCommunities: communities.length,
        totalAds: ads.length,
      },
    };
  },
});

/**
 * IMPORTAR DATOS - Administrador puede importar datos
 */

// Importar perfiles
export const importProfiles = mutation({
  args: { profiles: v.array(v.any()), mode: v.optional(v.union(v.literal("merge"), v.literal("replace"))) },
  handler: async (ctx, args) => {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const profile of args.profiles) {
      try {
        if (!profile.userId || !profile.nombre || !profile.usuario || !profile.email) {
          errors.push(`Perfil incompleto: ${profile.usuario || 'sin usuario'}`);
          skipped++;
          continue;
        }

        const existing = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
          .first();

        if (existing && args.mode === "merge") {
          await ctx.db.patch(existing._id, {
            ...profile,
            updatedAt: Date.now(),
            _importedAt: Date.now(),
          });
        } else if (!existing) {
          await ctx.db.insert("profiles", {
            ...profile,
            createdAt: profile.createdAt || Date.now(),
            _importedAt: Date.now(),
          });
        }
        imported++;
      } catch (e: any) {
        errors.push(`Error importando ${profile.usuario}: ${e.message}`);
        skipped++;
      }
    }

    return { imported, skipped, errors: errors.slice(0, 10) };
  },
});

// Importar posts
export const importPosts = mutation({
  args: { posts: v.array(v.any()), mode: v.optional(v.union(v.literal("merge"), v.literal("replace"))) },
  handler: async (ctx, args) => {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const post of args.posts) {
      try {
        if (!post.userId || !post.contenido) {
          errors.push(`Post incompleto`);
          skipped++;
          continue;
        }

        await ctx.db.insert("posts", {
          ...post,
          createdAt: post.createdAt || Date.now(),
          _importedAt: Date.now(),
        });
        imported++;
      } catch (e: any) {
        errors.push(`Error importando post: ${e.message}`);
        skipped++;
      }
    }

    return { imported, skipped, errors: errors.slice(0, 10) };
  },
});

// Importar comunidades
export const importCommunities = mutation({
  args: { communities: v.array(v.any()) },
  handler: async (ctx, args) => {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const community of args.communities) {
      try {
        if (!community.name || !community.slug || !community.ownerId) {
          errors.push(`Comunidad incompleta: ${community.name}`);
          skipped++;
          continue;
        }

        await ctx.db.insert("communities", {
          ...community,
          createdAt: community.createdAt || Date.now(),
          _importedAt: Date.now(),
        });
        imported++;
      } catch (e: any) {
        errors.push(`Error importando comunidad: ${e.message}`);
        skipped++;
      }
    }

    return { imported, skipped, errors: errors.slice(0, 10) };
  },
});

// Obtener estadísticas de la base de datos
export const getDatabaseStats = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    const posts = await ctx.db.query("posts").collect();
    const communities = await ctx.db.query("communities").collect();
    const ads = await ctx.db.query("ads").collect();
    const savedPosts = await ctx.db.query("savedPosts").collect();
    
    let totalComments = 0;
    for (const post of posts) {
      totalComments += (post.comentarios?.length || 0);
    }

    const deletedProfiles = profiles.filter(p => p.status === "deleted").length;
    const deletedPosts = posts.filter(p => p.status === "trash" || p.status === "deleted").length;
    const deletedCommunities = communities.filter(c => c.status === "deleted").length;

    return {
      profiles: {
        total: profiles.length,
        active: profiles.length - deletedProfiles,
        deleted: deletedProfiles,
      },
      posts: {
        total: posts.length,
        published: posts.filter(p => p.status === "published").length,
        draft: posts.filter(p => p.status === "draft").length,
        trash: deletedPosts,
      },
      comments: {
        total: totalComments,
      },
      communities: {
        total: communities.length,
        active: communities.length - deletedCommunities,
        deleted: deletedCommunities,
      },
      ads: {
        total: ads.length,
        active: ads.filter(a => a.activo).length,
      },
      savedPosts: {
        total: savedPosts.length,
      },
    };
  },
});
