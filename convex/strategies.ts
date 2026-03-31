import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getLevelFromXP } from "./lib/achievements";

const XP_VALUES_STRATEGY = {
  SALE_BONUS: 50,
  PURCHASE_BONUS: 10,
};

export const getPublishedStrategies = query({
  args: {
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      minRating: v.optional(v.number()),
      sortBy: v.optional(v.union(v.literal('newest'), v.literal('popular'), v.literal('rating'), v.literal('price_asc'), v.literal('price_desc'))),
    })),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let strategies = await ctx.db
      .query("strategies")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    if (args.filters) {
      const { category, minPrice, maxPrice, minRating, sortBy } = args.filters;
      
      if (category) {
        strategies = strategies.filter(s => s.category === category);
      }
      
      if (minPrice !== undefined) {
        strategies = strategies.filter(s => s.price >= minPrice);
      }
      
      if (maxPrice !== undefined) {
        strategies = strategies.filter(s => s.price <= maxPrice);
      }
      
      if (minRating !== undefined) {
        strategies = strategies.filter(s => s.rating >= minRating);
      }
      
      if (sortBy) {
        switch (sortBy) {
          case 'newest':
            strategies.sort((a, b) => b.createdAt - a.createdAt);
            break;
          case 'popular':
            strategies.sort((a, b) => b.downloads - a.downloads);
            break;
          case 'rating':
            strategies.sort((a, b) => b.rating - a.rating);
            break;
          case 'price_asc':
            strategies.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            strategies.sort((a, b) => b.price - a.price);
            break;
        }
      } else {
        strategies.sort((a, b) => b.downloads - a.downloads);
      }
    } else {
      strategies.sort((a, b) => b.downloads - a.downloads);
    }

    const limit = args.limit || 20;
    const startIndex = args.cursor ? (() => {
      const parsed = parseInt(args.cursor, 10);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    })() : 0;
    const paginatedStrategies = strategies.slice(startIndex, startIndex + limit);
    
    const strategiesWithAuthors = await Promise.all(
      paginatedStrategies.map(async (strategy) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", strategy.authorId))
          .first();
        
        return {
          ...strategy,
          author: author ? {
            userId: author.userId,
            nombre: author.nombre,
            usuario: author.usuario,
            avatar: author.avatar,
            level: getLevelFromXP(author.xp || 0),
          } : null,
        };
      })
    );

    const nextCursor = startIndex + limit < strategies.length 
      ? (startIndex + limit).toString() 
      : null;

    return {
      strategies: strategiesWithAuthors,
      nextCursor,
      total: strategies.length,
    };
  },
});

export const getStrategyById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const strategy = await ctx.db
      .query("strategies")
      .withIndex("by_author", (q) => q.eq("authorId", args.id))
      .first();

    if (!strategy) {
      const allStrategies = await ctx.db.query("strategies").collect();
      const found = allStrategies.find(s => s.id === args.id);
      if (!found) return null;
      
      const author = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", found.authorId))
        .first();

      return {
        ...found,
        author: author ? {
          userId: author.userId,
          nombre: author.nombre,
          usuario: author.usuario,
          avatar: author.avatar,
          level: getLevelFromXP(author.xp || 0),
        } : null,
      };
    }

    return strategy;
  },
});

export const getStrategyByIdWithAccess = query({
  args: { 
    strategyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allStrategies = await ctx.db.query("strategies").collect();
    const strategy = allStrategies.find(s => s.id === args.strategyId);
    
    if (!strategy) return null;
    
    const author = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", strategy.authorId))
      .first();

    let hasAccess = false;
    let hasPurchased = false;

    if (args.userId) {
      if (strategy.authorId === args.userId) {
        hasAccess = true;
      } else if (strategy.price === 0) {
        hasAccess = true;
      } else {
        const purchase = await ctx.db
          .query("strategyPurchases")
          .withIndex("by_user", (q) => q.eq("userId", args.userId!))
          .collect();
        
        hasPurchased = purchase.some(p => p.strategyId === strategy.id);
        hasAccess = hasPurchased;
      }
    }

    const contentToShow = hasAccess ? strategy.content : null;
    const previewContent = hasAccess ? null : getPreviewContent(strategy.content);

    return {
      ...strategy,
      author: author ? {
        userId: author.userId,
        nombre: author.nombre,
        usuario: author.usuario,
        avatar: author.avatar,
        level: getLevelFromXP(author.xp || 0),
      } : null,
      hasAccess,
      hasPurchased,
      previewContent,
    };
  },
});

function getPreviewContent(content: any): string {
  if (typeof content === 'string') {
    return content.substring(0, 200) + '...';
  }
  if (content && content.description) {
    return content.description.substring(0, 200) + '...';
  }
  return 'Vista previa no disponible';
}

export const getUserStrategies = query({
  args: { 
    userId: v.string(),
    includeUnpublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let strategies = await ctx.db
      .query("strategies")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();

    if (!args.includeUnpublished) {
      strategies = strategies.filter(s => s.isPublished);
    }

    strategies.sort((a, b) => b.createdAt - a.createdAt);

    return strategies;
  },
});

export const searchStrategies = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const strategies = await ctx.db
      .query("strategies")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const queryLower = args.query.toLowerCase();
    let results = strategies.filter(s => 
      s.title.toLowerCase().includes(queryLower) ||
      s.description.toLowerCase().includes(queryLower) ||
      s.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );

    if (args.category) {
      results = results.filter(s => s.category === args.category);
    }

    results.sort((a, b) => b.downloads - a.downloads);

    const resultsWithAuthors = await Promise.all(
      results.slice(0, 20).map(async (strategy) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", strategy.authorId))
          .first();
        
        return {
          ...strategy,
          author: author ? {
            userId: author.userId,
            nombre: author.nombre,
            usuario: author.usuario,
            avatar: author.avatar,
            level: getLevelFromXP(author.xp || 0),
          } : null,
        };
      })
    );

    return resultsWithAuthors;
  },
});

export const getTopStrategies = query({
  args: { 
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    let strategies = await ctx.db
      .query("strategies")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    if (args.category) {
      strategies = strategies.filter(s => s.category === args.category);
    }

    strategies.sort((a, b) => {
      const scoreA = a.downloads * 0.5 + a.rating * 20 * 0.5;
      const scoreB = b.downloads * 0.5 + b.rating * 20 * 0.5;
      return scoreB - scoreA;
    });

    const topStrategies = strategies.slice(0, limit);

    const strategiesWithAuthors = await Promise.all(
      topStrategies.map(async (strategy) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", strategy.authorId))
          .first();
        
        return {
          ...strategy,
          author: author ? {
            userId: author.userId,
            nombre: author.nombre,
            usuario: author.usuario,
            avatar: author.avatar,
            level: getLevelFromXP(author.xp || 0),
          } : null,
        };
      })
    );

    return strategiesWithAuthors;
  },
});

export const getSellerLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const strategies = await ctx.db.query("strategies").collect();
    const purchases = await ctx.db.query("strategyPurchases").collect();

    const sellerStats: Record<string, { totalSales: number; totalRevenue: number; strategyCount: number }> = {};

    strategies.forEach(strategy => {
      if (!sellerStats[strategy.authorId]) {
        sellerStats[strategy.authorId] = {
          totalSales: 0,
          totalRevenue: 0,
          strategyCount: 0,
        };
      }
      if (strategy.isPublished) {
        sellerStats[strategy.authorId].strategyCount++;
      }
    });

    purchases.forEach(purchase => {
      if (sellerStats[purchase.userId]) {
        sellerStats[purchase.userId].totalSales++;
        sellerStats[purchase.userId].totalRevenue += purchase.amountPaid;
      }
    });

    const sellerIds = Object.keys(sellerStats);
    const sellersWithProfiles = await Promise.all(
      sellerIds.map(async (sellerId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", sellerId))
          .first();
        
        return {
          userId: sellerId,
          profile,
          stats: sellerStats[sellerId],
          level: profile ? getLevelFromXP(profile.xp || 0) : null,
        };
      })
    );

    const sortedSellers = sellersWithProfiles
      .filter(s => s.profile && s.stats.strategyCount > 0)
      .sort((a, b) => b.stats.totalSales - a.stats.totalSales)
      .slice(0, limit);

    return sortedSellers.map((seller, index) => ({
      rank: index + 1,
      userId: seller.userId,
      nombre: seller.profile?.nombre || 'Usuario',
      usuario: seller.profile?.usuario || 'usuario',
      avatar: seller.profile?.avatar,
      totalSales: seller.stats.totalSales,
      totalRevenue: seller.stats.totalRevenue,
      strategyCount: seller.stats.strategyCount,
      level: seller.level,
    }));
  },
});

export const createStrategy = mutation({
  args: {
    authorId: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.any(),
    price: v.number(),
    currency: v.union(v.literal('USD'), v.literal('XP')),
    category: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await ctx.db.insert("strategies", {
      id,
      authorId: args.authorId,
      title: args.title,
      description: args.description,
      content: args.content,
      price: args.price,
      currency: args.currency,
      category: args.category,
      tags: args.tags,
      imageUrl: args.imageUrl,
      fileUrl: args.fileUrl,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      isPublished: args.isPublished,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  },
});

export const updateStrategy = mutation({
  args: {
    id: v.string(),
    authorId: v.string(),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      content: v.optional(v.any()),
      price: v.optional(v.number()),
      currency: v.optional(v.union(v.literal('USD'), v.literal('XP'))),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      imageUrl: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const allStrategies = await ctx.db.query("strategies").collect();
    const strategy = allStrategies.find(s => s.id === args.id);

    if (!strategy) {
      throw new Error("Estrategia no encontrada");
    }

    if (strategy.authorId !== args.authorId) {
      throw new Error("No tienes permisos para editar esta estrategia");
    }

    await ctx.db.patch(strategy._id, {
      ...args.data,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteStrategy = mutation({
  args: {
    id: v.string(),
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const allStrategies = await ctx.db.query("strategies").collect();
    const strategy = allStrategies.find(s => s.id === args.id);

    if (!strategy) {
      throw new Error("Estrategia no encontrada");
    }

    if (strategy.authorId !== args.authorId) {
      throw new Error("No tienes permisos para eliminar esta estrategia");
    }

    await ctx.db.delete(strategy._id);

    return { success: true };
  },
});

export const publishStrategy = mutation({
  args: {
    id: v.string(),
    authorId: v.string(),
    publish: v.boolean(),
  },
  handler: async (ctx, args) => {
    const allStrategies = await ctx.db.query("strategies").collect();
    const strategy = allStrategies.find(s => s.id === args.id);

    if (!strategy) {
      throw new Error("Estrategia no encontrada");
    }

    if (strategy.authorId !== args.authorId) {
      throw new Error("No tienes permisos para publicar esta estrategia");
    }

    await ctx.db.patch(strategy._id, {
      isPublished: args.publish,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const purchaseStrategy = mutation({
  args: {
    strategyId: v.string(),
    userId: v.string(),
    paymentMethod: v.union(v.literal('USD'), v.literal('XP')),
  },
  handler: async (ctx, args) => {
    const allStrategies = await ctx.db.query("strategies").collect();
    const strategy = allStrategies.find(s => s.id === args.strategyId);

    if (!strategy) {
      throw new Error("Estrategia no encontrada");
    }

    if (!strategy.isPublished) {
      throw new Error("Esta estrategia no está disponible para compra");
    }

    if (strategy.authorId === args.userId) {
      throw new Error("No puedes comprar tu propia estrategia");
    }

    const existingPurchase = await ctx.db
      .query("strategyPurchases")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    if (existingPurchase.some(p => p.strategyId === args.strategyId)) {
      throw new Error("Ya has comprado esta estrategia");
    }

    const user = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (args.paymentMethod === 'XP') {
      if ((user.xp || 0) < strategy.price) {
        throw new Error("XP insuficiente para esta compra");
      }

      await ctx.db.patch(user._id, {
        xp: (user.xp || 0) - strategy.price,
      });
    }

    await ctx.db.insert("strategyPurchases", {
      userId: args.userId,
      strategyId: args.strategyId,
      purchasedAt: Date.now(),
      amountPaid: strategy.price,
      currency: args.paymentMethod,
    });

    if (strategy.category === 'books' && strategy.fileUrl) {
      await ctx.db.insert("bookLibrary", {
        userId: args.userId,
        strategyId: args.strategyId,
        title: strategy.title,
        fileUrl: strategy.fileUrl,
        coverUrl: strategy.imageUrl || '',
        authorName: '',
        addedAt: Date.now(),
      });
    }

    const allStrategies2 = await ctx.db.query("strategies").collect();
    const strategyUpdated = allStrategies2.find(s => s.id === args.strategyId);
    if (strategyUpdated) {
      await ctx.db.patch(strategyUpdated._id, {
        downloads: strategyUpdated.downloads + 1,
      });
    }

    if (args.paymentMethod === 'XP') {
      const author = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", strategy.authorId))
        .first();
      
      if (author) {
        const xpBonus = XP_VALUES_STRATEGY.SALE_BONUS;
        await ctx.db.patch(author._id, {
          xp: (author.xp || 0) + xpBonus,
          level: getLevelFromXP((author.xp || 0) + xpBonus).level,
        });
      }
    }

    const buyerXpBonus = XP_VALUES_STRATEGY.PURCHASE_BONUS;
    await ctx.db.patch(user._id, {
      xp: (user.xp || 0) + buyerXpBonus,
      level: getLevelFromXP((user.xp || 0) + buyerXpBonus).level,
    });

    return { success: true };
  },
});

export const rateStrategy = mutation({
  args: {
    strategyId: v.string(),
    userId: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("La calificación debe estar entre 1 y 5");
    }

    const allStrategies = await ctx.db.query("strategies").collect();
    const strategy = allStrategies.find(s => s.id === args.strategyId);

    if (!strategy) {
      throw new Error("Estrategia no encontrada");
    }

    const purchase = await ctx.db
      .query("strategyPurchases")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const hasPurchased = purchase.some(p => p.strategyId === args.strategyId);
    
    if (!hasPurchased && strategy.authorId !== args.userId) {
      throw new Error("Solo puedes calificar estrategias que has comprado o creado");
    }

    const newRatingCount = (strategy.ratingCount || 0) + 1;
    const newRating = ((strategy.rating * (strategy.ratingCount || 0)) + args.rating) / newRatingCount;

    await ctx.db.patch(strategy._id, {
      rating: Math.round(newRating * 10) / 10,
      ratingCount: newRatingCount,
    });

    return { success: true, newRating: Math.round(newRating * 10) / 10 };
  },
});

export const getUserPurchases = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("strategyPurchases")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allStrategies = await ctx.db.query("strategies").collect();

    const purchasedStrategies = purchases.map(purchase => {
      const strategy = allStrategies.find(s => s.id === purchase.strategyId);
      return {
        ...purchase,
        strategy,
      };
    }).filter(p => p.strategy);

    return purchasedStrategies;
  },
});

export const hasUserPurchased = query({
  args: {
    strategyId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("strategyPurchases")
      .withIndex("by_strategy", (q) => q.eq("strategyId", args.strategyId))
      .collect();

    return purchases.some(p => p.userId === args.userId);
  },
});

export const getUserBookLibrary = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const books = await ctx.db
      .query("bookLibrary")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return books.sort((a, b) => b.addedAt - a.addedAt);
  },
});

export const addToBookLibrary = mutation({
  args: {
    userId: v.string(),
    strategyId: v.string(),
    title: v.string(),
    fileUrl: v.string(),
    coverUrl: v.optional(v.string()),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookLibrary")
      .withIndex("by_user_strategy", (q) => 
        q.eq("userId", args.userId).eq("strategyId", args.strategyId)
      )
      .first();

    if (existing) {
      return { success: true, message: "Book already in library" };
    }

    await ctx.db.insert("bookLibrary", {
      userId: args.userId,
      strategyId: args.strategyId,
      title: args.title,
      fileUrl: args.fileUrl,
      coverUrl: args.coverUrl,
      authorName: args.authorName,
      addedAt: Date.now(),
    });

    return { success: true };
  },
});

export const removeFromBookLibrary = mutation({
  args: {
    userId: v.string(),
    strategyId: v.string(),
  },
  handler: async (ctx, args) => {
    const book = await ctx.db
      .query("bookLibrary")
      .withIndex("by_user_strategy", (q) => 
        q.eq("userId", args.userId).eq("strategyId", args.strategyId)
      )
      .first();

    if (book) {
      await ctx.db.delete(book._id);
    }

    return { success: true };
  },
});
