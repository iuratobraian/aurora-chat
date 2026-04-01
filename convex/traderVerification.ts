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



export const getVerificationStatus = query({
  args: { oderId: v.string() },
  handler: async (ctx, { oderId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    if (oderId !== identity.subject) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", q => q.eq("userId", identity.subject))
        .unique();
      if (!profile || (profile.role || 0) < 5) {
        return null;
      }
    }
    
    const verification = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", oderId))
      .first();
    
    if (!verification) {
      return {
        oderId,
        level: "none" as const,
        emailVerified: false,
        phoneVerified: false,
        kycStatus: "none" as const,
        kycDocuments: [],
        brokerConnected: false,
        tradingVerified: false,
        companyVerified: false,
        regulatoryLicenses: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
    
    return verification;
  },
});

export const startVerification = mutation({
  args: {
    oderId: v.string(),
    level: v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("institutional")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        level: args.level,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("trader_verification", {
      oderId: args.oderId,
      level: args.level,
      emailVerified: false,
      phoneVerified: false,
      kycStatus: "none",
      kycDocuments: [],
      brokerConnected: false,
      tradingVerified: false,
      companyVerified: false,
      regulatoryLicenses: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const uploadKYCDocument = mutation({
  args: {
    oderId: v.string(),
    documentType: v.union(
      v.literal("id"),
      v.literal("passport"),
      v.literal("drivers_license")
    ),
    documentUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    const newDocument = {
      type: args.documentType,
      uploadedAt: Date.now(),
      status: "pending" as const,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        kycDocuments: [...existing.kycDocuments, newDocument],
        kycStatus: "pending",
        level: "intermediate",
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("trader_verification", {
      oderId: args.oderId,
      level: "intermediate",
      emailVerified: false,
      phoneVerified: false,
      kycStatus: "pending",
      kycDocuments: [newDocument],
      brokerConnected: false,
      tradingVerified: false,
      companyVerified: false,
      regulatoryLicenses: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const connectBroker = mutation({
  args: {
    oderId: v.string(),
    brokerName: v.string(),
    brokerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        brokerConnected: true,
        brokerName: args.brokerName,
        brokerAccountId: args.brokerAccountId,
        level: "advanced",
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("trader_verification", {
      oderId: args.oderId,
      level: "advanced",
      emailVerified: false,
      phoneVerified: false,
      kycStatus: "none",
      kycDocuments: [],
      brokerConnected: true,
      brokerName: args.brokerName,
      brokerAccountId: args.brokerAccountId,
      tradingVerified: false,
      companyVerified: false,
      regulatoryLicenses: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const disconnectBroker = mutation({
  args: {
    oderId: v.string(),
    brokerName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        brokerConnected: false,
        brokerName: undefined,
        brokerAccountId: undefined,
        tradingVerified: false,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return null;
  },
});

export const updateVerificationLevel = mutation({
  args: {
    oderId: v.string(),
    level: v.union(
      v.literal("none"),
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("institutional")
    ),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden actualizar niveles de verificación");
    
    const existing = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        level: args.level,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return null;
  },
});

export const listAllVerifications = query({
  args: {},
  handler: async (ctx) => {
    try {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) return [];
      
      const verifications = await ctx.db
        .query("trader_verification")
        .order("desc")
        .take(100);
        
      return verifications.map(v => ({
        ...v,
        id: v._id,
      }));
    } catch (err) {
      console.error("Error in listAllVerifications:", err);
      return [];
    }
  },
});

export const updateVerificationStatus = mutation({
  args: {
    oderId: v.string(),
    kycStatus: v.optional(v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
    tradingVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden actualizar verificaciones");
    
    const existing = await ctx.db
      .query("trader_verification")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (!existing) {
      return null;
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.kycStatus !== undefined) {
      updates.kycStatus = args.kycStatus;
    }
    if (args.tradingVerified !== undefined) {
      updates.tradingVerified = args.tradingVerified;
    }

    await ctx.db.patch(existing._id, updates);
    return existing._id;
  },
});
