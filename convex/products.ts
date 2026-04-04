import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertOwnershipOrAdmin, requireUser, requireAdmin } from "./lib/auth";

export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 50 }) => {
    let products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    if (category && category !== "all") {
      products = products.filter(p => p.category === category);
    }

    return products
      .filter(p => p.isPublished)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

export const getFeaturedProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.and(
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("isFeatured"), true),
        q.eq(q.field("isPublished"), true)
      ))
      .collect();

    return products.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId);
    if (!product || product.isDeleted) return null;

    return product;
  },
});

export const getProductsByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, { authorId }) => {
    await assertOwnershipOrAdmin(ctx, authorId);
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("authorId"), authorId))
      .collect()
      .then(products => products.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const getUserPurchases = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    try {
    const purchases = await ctx.db
      .query("purchases")
      .filter((q) => q.eq(q.field("buyerId"), userId))
      .collect();

    const products = await ctx.db.query("products").collect();
    const productMap = new Map(products.map(p => [p._id, p]));

    return purchases
      .filter(p => p.status === "completed")
      .map(purchase => ({
        ...purchase,
        product: productMap.get(purchase.productId),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
    } catch(e) {
      console.error('[getUserPurchases] error:', e);
      return [];
    }
  }
});

export const searchProducts = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { query: searchQuery, category }) => {
    let products = await ctx.db
      .query("products")
      .filter((q) => q.and(
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("isPublished"), true)
      ))
      .collect();

    const queryLower = searchQuery.toLowerCase();

    products = products.filter(p =>
      p.title.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      (p.authorName && p.authorName.toLowerCase().includes(queryLower))
    );

    if (category && category !== "all") {
      products = products.filter(p => p.category === category);
    }

    return products.sort((a, b) => b.views - a.views);
  },
});

export const getTopProducts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 10 }) => {
    let products = await ctx.db
      .query("products")
      .filter((q) => q.and(
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("isPublished"), true)
      ))
      .collect();

    if (category && category !== "all") {
      products = products.filter(p => p.category === category);
    }

    return products
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);
  },
});

export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.and(
        q.eq(q.field("category"), category),
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("isPublished"), true)
      ))
      .collect()
      .then(products => products.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const getAllProductsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("products")
      .collect()
      .then(products => products.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const createProduct = mutation({
  args: {
    authorId: v.string(),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    category: v.union(
      v.literal("ea"),
      v.literal("indicator"),
      v.literal("template"),
      v.literal("course"),
      v.literal("signal"),
      v.literal("vps"),
      v.literal("tool")
    ),
    attributes: v.optional(v.object({
      platform: v.optional(v.string()),
      pairs: v.optional(v.array(v.string())),
      timeframe: v.optional(v.array(v.string())),
      riskLevel: v.optional(v.string()),
      level: v.optional(v.string()),
      duration: v.optional(v.string()),
      format: v.optional(v.array(v.string())),
      frequency: v.optional(v.string()),
      specs: v.optional(v.any()),
    })),
    price: v.number(),
    currency: v.union(v.literal("USD"), v.literal("EUR"), v.literal("XP")),
    images: v.array(v.string()),
    demoFile: v.optional(v.string()),
    mainFile: v.optional(v.string()),
    fileName: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.optional(v.boolean()),
    mql5Id: v.optional(v.string()),
    mql5Url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.authorId) {
        throw new Error("IDOR Detectado: No puedes crear productos como otro usuario.");
    }
    
    // Si no es admin y no es el autor, assertOwnershipOrAdmin lanzará error
    // En este caso, ya validamos identity.subject matches authorId.
    
    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      authorId: args.authorId,
      authorName: args.authorName,
      authorAvatar: args.authorAvatar,
      title: args.title,
      description: args.description,
      longDescription: args.longDescription,
      category: args.category,
      attributes: args.attributes,
      price: args.price,
      currency: args.currency,
      images: args.images,
      demoFile: args.demoFile,
      mainFile: args.mainFile,
      fileName: args.fileName,
      rating: 0,
      ratingCount: 0,
      salesCount: 0,
      views: 0,
      tags: args.tags,
      isPublished: args.isPublished ?? false,
      isFeatured: false,
      isDeleted: false,
      reviews: [],
      createdAt: now,
      updatedAt: now,
      mql5Id: args.mql5Id,
      mql5Url: args.mql5Url,
    });

    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    longDescription: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("ea"),
      v.literal("indicator"),
      v.literal("template"),
      v.literal("course"),
      v.literal("signal"),
      v.literal("vps"),
      v.literal("tool")
    )),
    attributes: v.optional(v.object({
      platform: v.optional(v.string()),
      pairs: v.optional(v.array(v.string())),
      timeframe: v.optional(v.array(v.string())),
      riskLevel: v.optional(v.string()),
      level: v.optional(v.string()),
      duration: v.optional(v.string()),
      format: v.optional(v.array(v.string())),
      frequency: v.optional(v.string()),
      specs: v.optional(v.any()),
    })),
    price: v.optional(v.number()),
    currency: v.optional(v.union(v.literal("USD"), v.literal("EUR"), v.literal("XP"))),
    images: v.optional(v.array(v.string())),
    demoFile: v.optional(v.string()),
    mainFile: v.optional(v.string()),
    fileName: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    mql5Id: v.optional(v.string()),
    mql5Url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    const caller = await requireUser(ctx);
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");
    if (product.authorId !== caller.subject) {
      await assertOwnershipOrAdmin(ctx, product.authorId);
    }

    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const caller = await requireUser(ctx);
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");
    if (product.authorId !== caller.subject) {
      await assertOwnershipOrAdmin(ctx, product.authorId);
    }
    await ctx.db.patch(productId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});

export const publishProduct = mutation({
  args: {
    productId: v.id("products"),
    publish: v.boolean(),
  },
  handler: async (ctx, { productId, publish }) => {
    const caller = await requireUser(ctx);
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");
    if (product.authorId !== caller.subject) {
      await assertOwnershipOrAdmin(ctx, product.authorId);
    }
    await ctx.db.patch(productId, {
      isPublished: publish,
      updatedAt: Date.now(),
    });
  },
});

export const toggleFeatured = mutation({
  args: {
    productId: v.id("products"),
    featured: v.boolean(),
  },
  handler: async (ctx, { productId, featured }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(productId, {
      isFeatured: featured,
      updatedAt: Date.now(),
    });
  },
});

export const purchaseProduct = mutation({
  args: {
    productId: v.id("products"),
    buyerId: v.string(),
    amount: v.number(),
    currency: v.string(),
    platformFee: v.number(),
    authorEarnings: v.number(),
    MercadoPagoPaymentId: v.optional(v.string()),
    MercadoPagoPreferenceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.buyerId) {
        throw new Error("IDOR Detectado: No puedes realizar compras para otro usuario.");
    }
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (product.isDeleted) throw new Error("Product no longer available");

    const existingPurchase = await ctx.db
      .query("purchases")
      .filter((q) => q.and(
        q.eq(q.field("productId"), args.productId),
        q.eq(q.field("buyerId"), args.buyerId),
        q.eq(q.field("status"), "completed")
      ))
      .collect();

    if (existingPurchase.length > 0) {
      throw new Error("Already purchased");
    }

    const purchaseId = await ctx.db.insert("purchases", {
      productId: args.productId,
      authorId: product.authorId,
      buyerId: args.buyerId,
      amount: args.amount,
      currency: args.currency,
      platformFee: args.platformFee,
      authorEarnings: args.authorEarnings,
      MercadoPagoPaymentId: args.MercadoPagoPaymentId,
      MercadoPagoPreferenceId: args.MercadoPagoPreferenceId,
      status: "completed",
      downloadCount: 0,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    await ctx.db.patch(args.productId, {
      salesCount: (product.salesCount || 0) + 1,
      updatedAt: Date.now(),
    });

    return purchaseId;
  },
});

export const rateProduct = mutation({
  args: {
    productId: v.id("products"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const existingReview = product.reviews.find(r => r.userId === args.userId);
    if (existingReview) {
      throw new Error("Already reviewed");
    }

    const newReview = {
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    };

    const reviews = [...product.reviews, newReview];
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await ctx.db.patch(args.productId, {
      reviews,
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
      updatedAt: Date.now(),
    });
  },
});

export const addToWishlist = mutation({
  args: {
    productId: v.id("products"),
    userId: v.string(),
  },
  handler: async (ctx, { productId, userId }) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== userId) {
        throw new Error("IDOR Detectado: No puedes modificar la wishlist de otro usuario.");
    }
    const existing = await ctx.db
      .query("wishlists")
      .filter((q) => q.and(
        q.eq(q.field("productId"), productId),
        q.eq(q.field("userId"), userId)
      ))
      .collect();

    if (existing.length > 0) {
      return existing[0]._id;
    }

    return await ctx.db.insert("wishlists", {
      productId,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const removeFromWishlist = mutation({
  args: {
    productId: v.id("products"),
    userId: v.string(),
  },
  handler: async (ctx, { productId, userId }) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== userId) {
        throw new Error("IDOR Detectado: No puedes modificar la wishlist de otro usuario.");
    }
    const items = await ctx.db
      .query("wishlists")
      .filter((q) => q.and(
        q.eq(q.field("productId"), productId),
        q.eq(q.field("userId"), userId)
      ))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});

export const getUserWishlist = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== userId) {
        throw new Error("IDOR Detectado: No puedes ver la wishlist de otro usuario.");
    }
    const wishlistItems = await ctx.db
      .query("wishlists")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const products = await ctx.db.query("products").collect();
    const productMap = new Map(products.map(p => [p._id, p]));

    return wishlistItems
      .map(item => ({
        ...item,
        product: productMap.get(item.productId),
      }))
      .filter(item => item.product && !item.product.isDeleted);
  },
});

export const importFromMQL5 = mutation({
  args: {
    authorId: v.string(),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    mql5Id: v.string(),
    mql5Url: v.string(),
    title: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    images: v.array(v.string()),
    price: v.number(),
    currency: v.union(v.literal("USD"), v.literal("EUR"), v.literal("XP")),
    platform: v.optional(v.string()),
    pairs: v.optional(v.array(v.string())),
    timeframe: v.optional(v.array(v.string())),
    riskLevel: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("mql5Id"), args.mql5Id))
      .collect();

    if (existing.length > 0) {
      throw new Error("Product already imported from MQL5");
    }

    const now = Date.now();
    return await ctx.db.insert("products", {
      authorId: args.authorId,
      authorName: args.authorName,
      authorAvatar: args.authorAvatar,
      title: args.title,
      description: args.description,
      longDescription: args.longDescription,
      category: "ea",
      attributes: {
        platform: args.platform,
        pairs: args.pairs,
        timeframe: args.timeframe,
        riskLevel: args.riskLevel,
      },
      price: args.price,
      currency: args.currency,
      images: args.images,
      rating: 0,
      ratingCount: 0,
      salesCount: 0,
      views: 0,
      tags: args.tags,
      isPublished: true,
      isFeatured: false,
      isDeleted: false,
      reviews: [],
      createdAt: now,
      updatedAt: now,
      mql5Id: args.mql5Id,
      mql5Url: args.mql5Url,
    });
  },
});

export const getProductStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const purchases = await ctx.db.query("purchases").collect();
    const completedPurchases = purchases.filter(p => p.status === "completed");

    const byCategory: Record<string, number> = {};
    products.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.authorEarnings, 0);

    return {
      totalProducts: products.length,
      publishedProducts: products.filter(p => p.isPublished).length,
      totalSales: completedPurchases.length,
      totalRevenue,
      byCategory,
    };
  },
});
