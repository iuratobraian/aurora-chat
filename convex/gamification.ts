import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireAdmin } from "./lib/auth";
import { ACHIEVEMENTS, XP_VALUES, getLevelFromXP, getAchievementById } from "./lib/achievements";

function getXpMultiplier(profile?: any): number {
  const now = new Date();
  const day = now.getDay();
  let multiplier = 1;
  if (day === 0 || day === 6) multiplier = 2;
  
  if (profile?.streakReward === 'streak_60' || profile?.streakReward === 'streak_100') {
    multiplier *= 1.5;
  }
  
  return multiplier;
}

export const awardXP = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes otorgar XP a otro usuario.");
    }
    // Multiplier will be calculated after fetching profile
    let multiplier = 1;
    let finalAmount = args.amount;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) throw new Error("User not found");

    multiplier = getXpMultiplier(profile);
    finalAmount = args.amount * multiplier;

    const now = Date.now();
    const weekStart = now - (now % (7 * 24 * 60 * 60 * 1000));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const weeklyXPPatch: Record<string, number> = {};
    if (!profile.weeklyXPResetAt || profile.weeklyXPResetAt < weekStart) {
      weeklyXPPatch.weeklyXP = finalAmount;
      weeklyXPPatch.weeklyXPResetAt = weekStart;
    } else {
      weeklyXPPatch.weeklyXP = (profile.weeklyXP || 0) + finalAmount;
    }

    if (!profile.monthlyXPResetAt || profile.monthlyXPResetAt < monthStart) {
      weeklyXPPatch.monthlyXP = finalAmount;
      weeklyXPPatch.monthlyXPResetAt = monthStart;
    } else {
      weeklyXPPatch.monthlyXP = (profile.monthlyXP || 0) + finalAmount;
    }

    const newXP = (profile.xp || 0) + finalAmount;
    const levelInfo = getLevelFromXP(newXP);

    await ctx.db.patch(profile._id, {
      xp: newXP,
      level: levelInfo.level,
      weeklyXP: weeklyXPPatch.weeklyXP,
      weeklyXPResetAt: weeklyXPPatch.weeklyXPResetAt,
      monthlyXP: weeklyXPPatch.monthlyXP,
      monthlyXPResetAt: weeklyXPPatch.monthlyXPResetAt,
    });

    return { xp: newXP, level: levelInfo, multiplier, earned: finalAmount };
  }
});

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const levelInfo = getLevelFromXP(profile.xp || 0);

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", args.userId))
      .collect();

    const completedReferrals = referrals.filter(r => r.status === "completed");
    const referredUserIds = completedReferrals.map(r => r.referredId);

    let totalCommission = 0;
    let purchaseCount = 0;

    for (const userId of referredUserIds) {
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_buyer", (q) => q.eq("buyerId", userId))
        .collect();

      const completedPurchases = purchases.filter(p => p.status === "completed");
      for (const purchase of completedPurchases) {
        totalCommission += Math.floor(purchase.amount * 0.20);
        purchaseCount++;
      }
    }

    const milestoneThreshold = 10;
    const milestoneProgress = completedReferrals.length >= milestoneThreshold 
      ? 100 
      : Math.floor((completedReferrals.length / milestoneThreshold) * 100);

    return {
      xp: (profile.xp || 0),
      level: levelInfo,
      referralStats: {
        totalReferrals: referrals.length,
        completedReferrals: completedReferrals.length,
        purchaseCount,
        totalCommission,
        commissionRate: 20,
        milestoneThreshold,
        milestoneProgress,
        hasMilestoneReward: completedReferrals.length >= milestoneThreshold,
      }
    };
    } catch(e) {
      console.error('[getUserProgress] error:', e);
      return null;
    }
  }
});

export const getGlobalLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    // Optimized: take top profiles directly instead of loading all
    const profiles = await ctx.db
      .query("profiles")
      .order("desc")
      .take(limit);

    return profiles
      .map((p) => ({
        userId: p.userId,
        nombre: p.nombre,
        usuario: p.usuario,
        avatar: p.avatar,
        xp: (p.xp || 0),
        level: getLevelFromXP(p.xp || 0)
      }));
  }
});

export const getWeeklyLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    // Optimized: use filter to get profiles with weeklyXP
    const profiles = await ctx.db
      .query("profiles")
      .filter(q => q.gt(q.field("weeklyXP"), 0))
      .take(limit * 2); // Get more to sort
    
    const sorted = profiles
      .sort((a, b) => (b.weeklyXP || 0) - (a.weeklyXP || 0))
      .slice(0, limit)
      .map((p) => ({
        userId: p.userId,
        nombre: p.nombre,
        usuario: p.usuario,
        avatar: p.avatar,
        xp: (p.weeklyXP || 0),
        level: getLevelFromXP(p.xp || 0)
      }));

    return sorted;
  }
});

export const getMonthlyLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const profiles = await ctx.db.query("profiles").collect();

    const sorted = profiles
      .sort((a, b) => (b.monthlyXP || 0) - (a.monthlyXP || 0))
      .slice(0, limit)
      .map((p) => ({
        userId: p.userId,
        nombre: p.nombre,
        usuario: p.usuario,
        avatar: p.avatar,
        xp: (p.monthlyXP || 0),
        level: getLevelFromXP(p.xp || 0)
      }));

    return sorted;
  }
});

export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allAchievements = await ctx.db.query("achievements").collect();
    const achievementMap = new Map(allAchievements.map(a => [a.id, a]));

    return userAchievements.map((ua) => {
      const achievement = achievementMap.get(ua.achievementId);
      return {
        ...ua,
        achievement: achievement ? {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          points: achievement.points,
          rarity: achievement.rarity,
        } : null
      };
    });
    } catch(e) {
      console.error('[getUserAchievements] error:', e);
      return [];
    }
  }
});

async function checkAndUnlockAchievements(ctx: any, userId: string, profile: any, posts: any[]): Promise<any[]> {
  const userAchievements = await ctx.db
    .query("userAchievements")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId));

  const stats = {
    postsCount: posts.length,
    commentsCount: posts.reduce((acc: number, p: any) => acc + (p.comentarios?.length || 0), 0),
    likesReceived: posts.reduce((acc: number, p: any) => acc + (p.likes?.length || 0), 0),
    referralsCount: 0,
    loginStreak: profile.diasActivos || 0,
    daysActive: profile.diasActivos || 0,
    totalXP: (profile.xp || 0)
  };

  const newlyUnlocked: any[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.condition(stats)) {
      await ctx.db.insert("userAchievements", {
        userId,
        achievementId: achievement.id,
        unlockedAt: Date.now()
      });

      if (achievement.xp > 0) {
        const newXP = (profile.xp || 0) + achievement.xp;
        const levelInfo = getLevelFromXP(newXP);
        await ctx.db.patch(profile._id, { xp: newXP, level: levelInfo.level });
        profile.xp = newXP;
        profile.level = levelInfo.level;
      }

      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

export const checkAchievements = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes verificar logros para otro usuario.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return [];

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return await checkAndUnlockAchievements(ctx, args.userId, profile, posts);
  }
});

export const recordDailyLogin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes registrar login para otro usuario.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const today = new Date().toISOString().split("T")[0];
    const ultimoLogin = profile.ultimoLogin;

    let newDiasActivos = profile.diasActivos || 0;
    let diasConsecutivos = 1;

    if (ultimoLogin !== today) {
      if (ultimoLogin) {
        const lastDate = new Date(ultimoLogin);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          diasConsecutivos = (profile.diasActivos || 0) + 1;
        }
      }

      newDiasActivos = Math.max(newDiasActivos, diasConsecutivos);

      await ctx.db.patch(profile._id, {
        ultimoLogin: today,
        diasActivos: newDiasActivos
      });

      let bonusXP = XP_VALUES.DAILY_LOGIN;
      const currentStreakReward = profile.streakReward;

      if (diasConsecutivos === 7) {
        bonusXP += XP_VALUES.STREAK_7;
      } else if (diasConsecutivos === 30) {
        bonusXP += XP_VALUES.STREAK_30;
      } else if (diasConsecutivos === 60) {
        bonusXP += (XP_VALUES as any).STREAK_60 || 1500;
      } else if (diasConsecutivos === 100) {
        bonusXP += (XP_VALUES as any).STREAK_100 || 5000;
      }

      let newStreakReward = currentStreakReward;
      let newAvatarFrame = profile.avatarFrame;

      if (diasConsecutivos >= 100 && currentStreakReward !== 'streak_100') {
        newStreakReward = 'streak_100';
        newAvatarFrame = 'streak_100';
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "achievement",
          title: "👑 ¡Leyenda del Trade!",
          body: `100 días de racha! Has desbloqueado el frame "Legendario" y acceso a comunidad VIP.`,
          read: false,
          data: { streak: diasConsecutivos, reward: 'streak_100' },
          createdAt: Date.now(),
        });
      } else if (diasConsecutivos >= 60 && currentStreakReward !== 'streak_60') {
        newStreakReward = 'streak_60';
        newAvatarFrame = 'streak_60';
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "achievement",
          title: "🔥 Elite Dedicado",
          body: `60 días de racha! Has desbloqueado el frame "Elite" y un multiplicador de XP x1.5.`,
          read: false,
          data: { streak: diasConsecutivos, reward: 'streak_60' },
          createdAt: Date.now(),
        });
      } else if (diasConsecutivos >= 30 && (currentStreakReward === undefined || currentStreakReward === 'streak_7')) {
        newStreakReward = 'streak_30';
        newAvatarFrame = 'streak_30';
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "achievement",
          title: "💎 ¡Mes Completo!",
          body: `30 días de racha! Has desbloqueado el frame "Dedicado" para tu avatar.`,
          read: false,
          data: { streak: diasConsecutivos, reward: 'streak_30' },
          createdAt: Date.now(),
        });
      } else if (diasConsecutivos >= 7 && currentStreakReward === undefined) {
        newStreakReward = 'streak_7';
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "achievement",
          title: "✨ ¡Consistente!",
          body: `7 días de racha! Continúa así para desbloquear más recompensas.`,
          read: false,
          data: { streak: diasConsecutivos, reward: 'streak_7' },
          createdAt: Date.now(),
        });
      }

      const newXP = (profile.xp || 0) + bonusXP;
      const levelInfo = getLevelFromXP(newXP);

      await ctx.db.patch(profile._id, {
        xp: newXP,
        level: levelInfo.level,
        ...(newAvatarFrame && { avatarFrame: newAvatarFrame }),
        streakReward: newStreakReward,
      });

      const posts = await ctx.db
        .query("posts")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      await checkAndUnlockAchievements(ctx, args.userId, { ...profile, xp: newXP, level: levelInfo.level }, posts);

      return {
        xpAwarded: bonusXP,
        streak: diasConsecutivos,
        newXP,
        level: levelInfo,
        streakReward: newStreakReward,
        avatarFrame: newAvatarFrame,
      };
    }

    return { xpAwarded: 0, streak: diasConsecutivos };
  }
});

export const awardPostXP = mutation({
  args: {
    userId: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes otorgar XP a otro usuario.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const newXP = (profile.xp || 0) + XP_VALUES.CREATE_POST;
    const levelInfo = getLevelFromXP(newXP);

    await ctx.db.patch(profile._id, { xp: newXP, level: levelInfo.level });

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    await checkAndUnlockAchievements(ctx, args.userId, { ...profile, xp: newXP, level: levelInfo.level }, posts);

    return { xp: newXP, level: levelInfo };
  }
});

export const awardLikeXP = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes otorgar XP a otro usuario.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const newXP = (profile.xp || 0) + XP_VALUES.POST_LIKED;
    const levelInfo = getLevelFromXP(newXP);

    await ctx.db.patch(profile._id, { xp: newXP, level: levelInfo.level });

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    await checkAndUnlockAchievements(ctx, args.userId, { ...profile, xp: newXP, level: levelInfo.level }, posts);

    return { xp: newXP, level: levelInfo };
  }
});

export const awardCommentXP = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes otorgar XP a otro usuario.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const newXP = (profile.xp || 0) + XP_VALUES.COMMENT;
    const levelInfo = getLevelFromXP(newXP);

    await ctx.db.patch(profile._id, { xp: newXP, level: levelInfo.level });

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    await checkAndUnlockAchievements(ctx, args.userId, { ...profile, xp: newXP, level: levelInfo.level }, posts);

    return { xp: newXP, level: levelInfo };
  }
});

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    communityId: v.optional(v.id("communities"))
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    if (args.communityId) {
      const members = await ctx.db
        .query("communityMembers")
        .withIndex("by_community", (q) => q.eq("communityId", args.communityId!))
        .collect();

      const memberUserIds = members.map((m) => m.userId);
      const profiles = await ctx.db.query("profiles").collect();

      return profiles
        .filter((p) => memberUserIds.includes(p.userId))
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, limit)
        .map((p) => ({
          userId: p.userId,
          nombre: p.nombre,
          usuario: p.usuario,
          avatar: p.avatar,
          xp: (p.xp || 0),
          level: getLevelFromXP(p.xp || 0)
        }));
    }

    const profiles = await ctx.db.query("profiles").collect();

    return profiles
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, limit)
      .map((p) => ({
        userId: p.userId,
        nombre: p.nombre,
        usuario: p.usuario,
        avatar: p.avatar,
        xp: (p.xp || 0),
        level: getLevelFromXP(p.xp || 0)
      }));
  }
});

export const getAchievementProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      const allAchievements = await ctx.db.query("achievements").collect();
      const userAchievements = await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId));
      
      return allAchievements
        .filter(a => !unlockedIds.has(a.id))
        .map(a => ({
          id: a.id,
          name: a.name,
          icon: a.icon || '🏆',
          description: a.description,
          category: a.category,
          points: a.points,
          rarity: a.rarity || 'common',
          progress: 0,
          current: 0,
          target: (a as any).target || 1,
        }));
    } catch(e) {
      console.error('[getAchievementProgress] error:', e);
      return [];
    }
  }
});
