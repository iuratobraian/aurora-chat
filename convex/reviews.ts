import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkRateLimit } from "./lib/rateLimit";

export const createReview = mutation({
  args: {
    communityId: v.id("communities"),
    rating: v.number(),
    comment: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const existing = await ctx.db
      .query("communityReviews")
      .withIndex("by_user_community", q => 
        q.eq("communityId", args.communityId)
         .eq("userId", identity.subject))
      .first();
      
    if (existing) throw new Error("Ya calificaste esta comunidad");
    
    const reviewId = await ctx.db.insert("communityReviews", {
      communityId: args.communityId,
      userId: identity.subject,
      rating: Math.min(5, Math.max(1, args.rating)),
      comment: args.comment,
      createdAt: Date.now()
    });
    
    return reviewId;
  }
});

export const getCommunityReviews = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("communityReviews")
      .withIndex("by_community", q => q.eq("communityId", args.communityId))
      .order("desc")
      .take(20);
    
    const reviewsWithProfiles = await Promise.all(
      reviews.map(async (review) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", q => q.eq("userId", review.userId))
          .first();
        return { ...review, profile };
      })
    );
    
    return reviewsWithProfiles;
  }
});

export const getCommunityRating = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("communityReviews")
      .withIndex("by_community", q => q.eq("communityId", args.communityId))
      .collect();
    
    if (reviews.length === 0) return { average: 0, count: 0 };
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / reviews.length,
      count: reviews.length
    };
  }
});

export const deleteReview = mutation({
  args: { reviewId: v.id("communityReviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review no encontrada");
    if (review.userId !== identity.subject) throw new Error("No autorizado");
    
    await ctx.db.delete(args.reviewId);
    return true;
  }
});

export const getUserReview = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("communityReviews")
      .withIndex("by_user_community", q => 
        q.eq("communityId", args.communityId)
         .eq("userId", identity.subject))
      .first();
  }
});

export const createPlatformReview = mutation({
  args: {
    rating: v.number(),
    comment: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Debes iniciar sesión");
    
    const existing = await ctx.db
      .query("platformReviews")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .first();
      
    if (existing) throw new Error("Ya calificaste la plataforma");
    
    const reviewId = await ctx.db.insert("platformReviews", {
      userId: identity.subject,
      rating: Math.min(5, Math.max(1, args.rating)),
      comment: args.comment,
      createdAt: Date.now()
    });
    
    return reviewId;
  }
});

export const getPlatformReviews = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const reviews = await ctx.db
      .query("platformReviews")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    
    const reviewsWithProfiles = await Promise.all(
      reviews.map(async (review) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", q => q.eq("userId", review.userId))
          .first();
        return { ...review, profile };
      })
    );
    
    return reviewsWithProfiles;
  }
});

export const getPlatformRating = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("platformReviews")
      .collect();
    
    if (reviews.length === 0) return { average: 0, count: 0 };
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / reviews.length,
      count: reviews.length
    };
  }
});

export const getUserPlatformReview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("platformReviews")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .first();
  }
});

export const deletePlatformReview = mutation({
  args: { reviewId: v.id("platformReviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Debes iniciar sesión");
    
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review no encontrada");
    if (review.userId !== identity.subject) throw new Error("No autorizado");
    
    await ctx.db.delete(args.reviewId);
    return true;
  }
});
