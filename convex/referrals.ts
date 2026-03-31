import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TP-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getReferralCode = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const code = await ctx.db
      .query("referralCodes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return code;
  },
});

export const getOrCreateReferralCode = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const existing = await ctx.db
      .query("referralCodes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
    
    if (existing) return existing;
    
    const code = generateReferralCode();
    const newCode = await ctx.db.insert("referralCodes", {
      userId: identity.subject,
      code,
      uses: 0,
      maxUses: undefined,
      rewardXp: 500,
      rewardDays: 7,
      isActive: true,
      createdAt: Date.now(),
      expiresAt: undefined,
    });
    
    return await ctx.db.get(newCode);
  },
});

export const updateReferralCode = mutation({
  args: {
    codeId: v.id("referralCodes"),
    maxUses: v.optional(v.number()),
    rewardXp: v.optional(v.number()),
    rewardDays: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const code = await ctx.db.get(args.codeId);
    if (!code) throw new Error("Código no encontrado");
    if (code.userId !== identity.subject) {
      const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
      if (!admin || (admin.role || 0) < 5) throw new Error("No autorizado");
    }
    
    const updates: any = {};
    if (args.maxUses !== undefined) updates.maxUses = args.maxUses;
    if (args.rewardXp !== undefined) updates.rewardXp = args.rewardXp;
    if (args.rewardDays !== undefined) updates.rewardDays = args.rewardDays;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.expiresAt !== undefined) updates.expiresAt = args.expiresAt;
    
    await ctx.db.patch(args.codeId, updates);
  },
});

export const applyReferralCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const referralCode = await ctx.db
      .query("referralCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    
    if (!referralCode) throw new Error("Código de referido inválido");
    if (!referralCode.isActive) throw new Error("Este código ya no está activo");
    if (referralCode.expiresAt && referralCode.expiresAt < Date.now()) {
      throw new Error("Este código ha expirado");
    }
    if (referralCode.maxUses && referralCode.uses >= referralCode.maxUses) {
      throw new Error("Este código ha alcanzado su límite de usos");
    }
    if (referralCode.userId === identity.subject) {
      throw new Error("No puedes usar tu propio código de referido");
    }
    
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred", (q) => q.eq("referredId", identity.subject))
      .first();
    
    if (existingReferral) throw new Error("Ya has usado un código de referido");
    
    const referralId = await ctx.db.insert("referrals", {
      referrerId: referralCode.userId,
      referredId: identity.subject,
      referralCode: args.code.toUpperCase(),
      status: "pending",
      rewardType: "xp",
      referrerReward: referralCode.rewardXp || 500,
      referredReward: referralCode.rewardDays ? 7 : 200,
      referrerClaimed: false,
      referredClaimed: false,
      createdAt: Date.now(),
      completedAt: undefined,
    });
    
    await ctx.db.patch(referralCode._id, { uses: referralCode.uses + 1 });
    
    return await ctx.db.get(referralId);
  },
});

export const getMyReferrals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", identity.subject))
      .collect();
    
    const referredProfiles = await Promise.all(
      referrals.map(r => 
        ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", r.referredId)).first()
      )
    );
    
    return referrals.map((r, i) => ({
      ...r,
      referredProfile: referredProfiles[i],
    }));
  },
});

export const getReferralsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para ver referidos de otro usuario");
    }
    
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", args.userId))
      .collect();
    
    const referredProfiles = await Promise.all(
      referrals.map(r => 
        ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", r.referredId)).first()
      )
    );
    
    return referrals.map((r, i) => ({
      ...r,
      referredProfile: referredProfiles[i],
    }));
  },
});

export const claimReferralReward = mutation({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const referral = await ctx.db.get(args.referralId);
    if (!referral) throw new Error("Referido no encontrado");
    if (referral.status !== "pending") throw new Error("Este referído ya fue completado");
    
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (now - referral.createdAt > sevenDays) {
      await ctx.db.patch(args.referralId, { status: "expired" });
      throw new Error("Este período de referido ha expirado");
    }
    
    let isReferrer = referral.referrerId === identity.subject;
    let isReferred = referral.referredId === identity.subject;
    
    if (!isReferrer && !isReferred) throw new Error("No tienes acceso a este referído");
    
    if (isReferrer && referral.referrerClaimed) throw new Error("Ya reclamaste tu recompensa");
    if (isReferred && referral.referredClaimed) throw new Error("Ya reclamaste tu recompensa");
    
    if (isReferrer) {
      const referrerProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", q => q.eq("userId", identity.subject))
        .first();
      
      if (referrerProfile) {
        const currentXp = referrerProfile.xp || 0;
        const nextXp = currentXp + referral.referrerReward;
        
        await ctx.db.patch(referrerProfile._id, { xp: nextXp });
        
        await ctx.db.insert("notifications", {
          userId: identity.subject,
          type: "achievement",
          title: "¡Recompensa de referido!",
          body: `Has reclamado ${referral.referrerReward} XP por tu referido.`,
          read: false,
          createdAt: now,
        });
      }
      
      await ctx.db.patch(args.referralId, { referrerClaimed: true });
    }
    
    if (isReferred) {
      const referredProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", q => q.eq("userId", identity.subject))
        .first();
      
      if (referredProfile) {
        const currentXp = referredProfile.xp || 0;
        const daysBonus = referral.rewardType === "subscription_days" ? referral.referredReward : 0;
        const xpBonus = referral.rewardType === "xp" ? referral.referredReward : 200;
        
        await ctx.db.patch(referredProfile._id, { xp: currentXp + xpBonus });
        
        await ctx.db.insert("notifications", {
          userId: identity.subject,
          type: "achievement",
          title: "¡Bienvenido! 🎁",
          body: `Has reclamado ${xpBonus} XP de bienvenida por usar un código de referido.`,
          read: false,
          createdAt: now,
        });
      }
      
      await ctx.db.patch(args.referralId, { referredClaimed: true });
    }
    
    const updatedReferral = await ctx.db.get(args.referralId);
    if (updatedReferral?.referrerClaimed && updatedReferral?.referredClaimed) {
      await ctx.db.patch(args.referralId, { 
        status: "completed",
        completedAt: now,
      });

      const completedReferrals = await ctx.db
        .query("referrals")
        .withIndex("by_referrer", (q) => q.eq("referrerId", referral.referrerId))
        .collect();
      
      const completedCount = completedReferrals.filter(r => r.status === "completed").length;
      
      const userAchievements = await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("userId", referral.referrerId))
        .collect();
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
      
      const allAchievements = await ctx.db.query("achievements").collect();
      for (const achievement of allAchievements) {
        if (unlockedIds.has(achievement.id)) continue;
        
        const req = achievement.requirement as { type: string; value: number };
        if (req.type === "referrals" && completedCount >= req.value) {
          await ctx.db.insert("userAchievements", {
            userId: referral.referrerId,
            achievementId: achievement.id,
            unlockedAt: now,
          });
          
          await ctx.db.insert("notifications", {
            userId: referral.referrerId,
            type: "achievement",
            title: "¡Nuevo Logro!",
            body: `Has desbloqueado: ${achievement.name}`,
            read: false,
            data: { achievementId: achievement.id, points: achievement.points },
            createdAt: now,
          });
          
          const referrerProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", referral.referrerId))
            .first();
          if (referrerProfile) {
            await ctx.db.patch(referrerProfile._id, {
              xp: (referrerProfile.xp || 0) + achievement.points,
            });
          }
        }
      }
    }
    
    return await ctx.db.get(args.referralId);
  },
});

export const completeReferral = mutation({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
    if (!admin || (admin.role || 0) < 5) throw new Error("Solo admins pueden marcar referidos como completados");
    
    const referral = await ctx.db.get(args.referralId);
    if (!referral) throw new Error("Referido no encontrado");
    
    await ctx.db.patch(args.referralId, { 
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const getReferralStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", args.userId))
      .collect();
    
    const pending = referrals.filter(r => r.status === "pending").length;
    const completed = referrals.filter(r => r.status === "completed").length;
    const expired = referrals.filter(r => r.status === "expired").length;
    
    const totalXpEarned = referrals
      .filter(r => r.status === "completed" || r.referrerClaimed)
      .reduce((sum, r) => sum + (r.referrerClaimed ? r.referrerReward : 0), 0);
    
    return {
      totalReferrals: referrals.length,
      pending,
      completed,
      expired,
      totalXpEarned,
    };
  },
});

const referralStatus = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("expired")
);

export const getAllReferrals = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(referralStatus),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first();
      
    if (!admin || (admin.role || 0) < 5) {
      return [];
    }
    
    let referrals;
    
    if (args.status !== undefined) {
      const status = args.status;
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_status", q => q.eq("status", status))
        .order("desc")
        .take(args.limit || 50);
    } else {
      referrals = await ctx.db
        .query("referrals")
        .order("desc")
        .take(args.limit || 50);
    }
    
    return referrals.map(r => ({
      ...r,
      referrerProfile: null,
      referredProfile: null,
    }));
  },
});

export const getTopReferrers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
    if (!admin || (admin.role || 0) < 5) return [];
    
    const referrals = await ctx.db.query("referrals").collect();
    
    const referrerCounts: Record<string, number> = {};
    const referrerCompleted: Record<string, number> = {};
    
    for (const r of referrals) {
      referrerCounts[r.referrerId] = (referrerCounts[r.referrerId] || 0) + 1;
      if (r.status === "completed") {
        referrerCompleted[r.referrerId] = (referrerCompleted[r.referrerId] || 0) + 1;
      }
    }
    
    const topReferrers = Object.entries(referrerCounts)
      .map(([userId, total]) => ({
        userId,
        totalReferrals: total,
        completedReferrals: referrerCompleted[userId] || 0,
      }))
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, args.limit || 10);
    
    const profiles = await Promise.all(
      topReferrers.map(r => 
        ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", r.userId)).first()
      )
    );
    
    return topReferrers.map((r, i) => ({
      ...r,
      profile: profiles[i],
    }));
  },
});

const COMMISSION_RATE = 0.20;

export const recordReferralPurchase = mutation({
  args: {
    buyerId: v.string(),
    amount: v.number(),
    purchaseId: v.id("purchases"),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_referred", (q) => q.eq("referredId", args.buyerId))
      .first();
    
    if (!referral || referral.status !== "completed") {
      return null;
    }
    
    const commission = Math.floor(args.amount * COMMISSION_RATE);
    
    const referrerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", referral.referrerId))
      .first();
    
    if (referrerProfile) {
      const currentBalance = referrerProfile.saldo || 0;
      await ctx.db.patch(referrerProfile._id, { saldo: currentBalance + commission });
      
      await ctx.db.insert("notifications", {
        userId: referral.referrerId,
        type: "achievement",
        title: "¡Comisión de referido! 💰",
        body: `Has ganado $${commission} (20%) por la compra de tu referido.`,
        read: false,
        createdAt: Date.now(),
      });
    }
    
    return {
      referralId: referral._id,
      commission,
      purchaseId: args.purchaseId,
    };
  },
});

export const getReferralPurchaseStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", args.userId))
      .collect();
    
    const completedReferrals = referrals.filter(r => r.status === "completed");
    const referredUserIds = completedReferrals.map(r => r.referredId);
    
    let totalPurchases = 0;
    let totalCommission = 0;
    let purchaseCount = 0;
    
    for (const userId of referredUserIds) {
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_buyer", (q) => q.eq("buyerId", userId))
        .collect();
      
      const completedPurchases = purchases.filter(p => p.status === "completed");
      for (const purchase of completedPurchases) {
        totalPurchases += purchase.amount;
        totalCommission += Math.floor(purchase.amount * COMMISSION_RATE);
        purchaseCount++;
      }
    }
    
    const milestoneThreshold = 10;
    const milestoneProgress = completedReferrals.length >= milestoneThreshold 
      ? 100 
      : Math.floor((completedReferrals.length / milestoneThreshold) * 100);
    
    const hasMilestoneReward = completedReferrals.length >= milestoneThreshold;
    
    return {
      totalReferrals: referrals.length,
      completedReferrals: completedReferrals.length,
      purchaseCount,
      totalPurchases,
      totalCommission,
      commissionRate: COMMISSION_RATE * 100,
      milestoneThreshold,
      milestoneProgress,
      hasMilestoneReward,
      nextMilestone: milestoneThreshold,
    };
  },
});

export const claimMilestoneReward = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", identity.subject))
      .collect();
    
    const completedReferrals = referrals.filter(r => r.status === "completed");
    const milestoneThreshold = 10;
    
    if (completedReferrals.length < milestoneThreshold) {
      throw new Error(`Necesitas ${milestoneThreshold} referidos completados. Actualmente tienes ${completedReferrals.length}.`);
    }
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
    
    if (!profile) throw new Error("Perfil no encontrado");
    
    await ctx.db.patch(profile._id, { 
      esPro: true,
      role: 1,
    });
    
    await ctx.db.insert("notifications", {
      userId: identity.subject,
      type: "achievement",
      title: "¡Premio Milestone Desbloqueado! 🎁",
      body: `Has alcanzado ${completedReferrals.length} referidos. ¡Tu suscripción PRO es gratuita y tienes acceso a cuenta de fondeo de $5k!`,
      read: false,
      data: { 
        type: "milestone_reward",
        subscriptionFree: true,
        fundingAccount: 5000,
      },
      createdAt: Date.now(),
    });
    
    return {
      success: true,
      subscriptionFree: true,
      fundingAccount: 5000,
    };
  },
});
