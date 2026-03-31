import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const DEFAULT_ACHIEVEMENTS = [
  // Social
  { id: 'first_post', name: 'Primer Paso', description: 'Crea tu primera publicación', category: 'social' as const, icon: '✍️', points: 10, rarity: 'common' as const, requirement: { type: 'posts_count', value: 1 } },
  { id: 'post_10', name: 'Voz Activa', description: '10 publicaciones creadas', category: 'social' as const, icon: '📝', points: 50, rarity: 'rare' as const, requirement: { type: 'posts_count', value: 10 } },
  { id: 'post_50', name: 'Escritor Prolífico', description: '50 publicaciones creadas', category: 'social' as const, icon: '📚', points: 150, rarity: 'epic' as const, requirement: { type: 'posts_count', value: 50 } },
  { id: 'comment_10', name: 'Conversador', description: '10 comentarios', category: 'social' as const, icon: '💬', points: 25, rarity: 'common' as const, requirement: { type: 'comments_count', value: 10 } },
  { id: 'comment_50', name: 'Orador', description: '50 comentarios', category: 'social' as const, icon: '🎤', points: 75, rarity: 'rare' as const, requirement: { type: 'comments_count', value: 50 } },
  { id: 'comment_100', name: 'Comentarista', description: '100 comentarios', category: 'social' as const, icon: '🎧', points: 150, rarity: 'epic' as const, requirement: { type: 'comments_count', value: 100 } },
  { id: 'like_50', name: 'Dador de Likes', description: '50 likes dados', category: 'social' as const, icon: '❤️', points: 30, rarity: 'common' as const, requirement: { type: 'likes_given', value: 50 } },
  { id: 'like_100', name: 'Generoso', description: '100 likes dados', category: 'social' as const, icon: '💖', points: 50, rarity: 'rare' as const, requirement: { type: 'likes_given', value: 100 } },
  { id: 'follower_10', name: 'Influencer', description: '10 seguidores', category: 'social' as const, icon: '⭐', points: 100, rarity: 'rare' as const, requirement: { type: 'followers', value: 10 } },
  { id: 'follower_50', name: 'Celebridad', description: '50 seguidores', category: 'social' as const, icon: '🌟', points: 250, rarity: 'epic' as const, requirement: { type: 'followers', value: 50 } },
  { id: 'follower_100', name: 'Estrella', description: '100 seguidores', category: 'social' as const, icon: '✨', points: 500, rarity: 'legendary' as const, requirement: { type: 'followers', value: 100 } },
  
  // Trading
  { id: 'trade_idea', name: 'Analista', description: 'Comparte una idea de trading', category: 'trading' as const, icon: '📈', points: 25, rarity: 'common' as const, requirement: { type: 'trading_ideas', value: 1 } },
  { id: 'trade_10', name: 'Trader Activo', description: '10 ideas de trading', category: 'trading' as const, icon: '📊', points: 100, rarity: 'rare' as const, requirement: { type: 'trading_ideas', value: 10 } },
  { id: 'winning_trade', name: 'Trade Ganador', description: 'Publica un trade exitoso', category: 'trading' as const, icon: '🏆', points: 100, rarity: 'rare' as const, requirement: { type: 'winning_trades', value: 1 } },
  { id: 'winning_trade_5', name: 'Profit Hunter', description: '5 trades exitosos', category: 'trading' as const, icon: '💰', points: 300, rarity: 'epic' as const, requirement: { type: 'winning_trades', value: 5 } },
  { id: 'streak_3', name: 'En Racha', description: '3 días consecutivos de actividad', category: 'trading' as const, icon: '🔥', points: 50, rarity: 'common' as const, requirement: { type: 'login_streak', value: 3 } },
  { id: 'streak_7', name: 'Consistente', description: '7 días consecutivos de actividad', category: 'trading' as const, icon: '⚡', points: 200, rarity: 'rare' as const, requirement: { type: 'login_streak', value: 7 } },
  { id: 'streak_30', name: 'Dedicado', description: '30 días consecutivos de actividad', category: 'trading' as const, icon: '💎', points: 500, rarity: 'legendary' as const, requirement: { type: 'login_streak', value: 30 } },
  
  // Learning
  { id: 'course_complete', name: 'Estudiante', description: 'Completa un curso', category: 'learning' as const, icon: '🎓', points: 150, rarity: 'rare' as const, requirement: { type: 'courses_completed', value: 1 } },
  { id: 'course_3', name: 'Aprendiz', description: 'Completa 3 cursos', category: 'learning' as const, icon: '📖', points: 300, rarity: 'epic' as const, requirement: { type: 'courses_completed', value: 3 } },
  { id: 'quiz_100', name: 'Top Student', description: '100% en un quiz', category: 'learning' as const, icon: '🏅', points: 100, rarity: 'rare' as const, requirement: { type: 'quiz_perfect_score', value: 1 } },
  { id: 'first_resource', name: 'Recursos', description: 'Descarga tu primer recurso', category: 'learning' as const, icon: '📥', points: 25, rarity: 'common' as const, requirement: { type: 'resources_downloaded', value: 1 } },
  { id: 'resource_10', name: 'Bibliotecario', description: 'Descarga 10 recursos', category: 'learning' as const, icon: '📚', points: 100, rarity: 'rare' as const, requirement: { type: 'resources_downloaded', value: 10 } },
  
  // Special
  { id: 'early_bird', name: 'Pionero', description: 'Únete en el primer mes', category: 'special' as const, icon: '🐣', points: 500, rarity: 'legendary' as const, requirement: { type: 'early_member', value: 1 } },
  { id: 'verified_trader', name: 'Trader Verificado', description: 'Obtén verificación', category: 'special' as const, icon: '✅', points: 300, rarity: 'epic' as const, requirement: { type: 'verified', value: 1 } },
  { id: 'pro_member', name: 'Miembro PRO', description: 'Activa suscripción PRO', category: 'special' as const, icon: '👑', points: 250, rarity: 'rare' as const, requirement: { type: 'is_pro', value: 1 } },
  { id: 'first_login', name: 'Bienvenido', description: 'Primer inicio de sesión', category: 'special' as const, icon: '👋', points: 5, rarity: 'common' as const, requirement: { type: 'first_login', value: 1 } },
  { id: 'referral_1', name: 'Referidor', description: 'Referencia a 1 usuario', category: 'special' as const, icon: '🤝', points: 100, rarity: 'rare' as const, requirement: { type: 'referrals', value: 1 } },
  { id: 'referral_5', name: 'Embajador', description: 'Referencia a 5 usuarios', category: 'special' as const, icon: '🎖️', points: 300, rarity: 'epic' as const, requirement: { type: 'referrals', value: 5 } },
];

export const initializeAchievements = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("achievements").first();
    if (existing) return { message: "Achievements already initialized" };

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      await ctx.db.insert("achievements", {
        ...achievement,
        isActive: true,
        createdAt: Date.now(),
      });
    }
    return { message: `Initialized ${DEFAULT_ACHIEVEMENTS.length} achievements` };
  },
});

export const getAllAchievements = query({
  args: {},
  handler: async (ctx) => {
    const achievements = await ctx.db.query("achievements").collect();
    return achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      points: a.points,
      requirement: a.requirement,
      rarity: a.rarity,
      isActive: a.isActive,
    }));
  },
});

export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();

    const allAchievements = await ctx.db.query("achievements").collect();
    const achievementMap = new Map(allAchievements.map(a => [a.id, a]));

    return userAchievements.map(ua => {
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
        } : null,
      };
    });
  },
});

export const getAchievementProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const user = await ctx.db
      .query("profiles")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .first();
    
    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();

    const stats = {
      postsCount: user?.aportes || 0,
      followersCount: user?.seguidores?.length || 0,
      followingCount: user?.siguiendo?.length || 0,
      diasActivos: user?.diasActivos || 0,
      isPro: user?.esPro || false,
      isVerified: user?.esVerificado || false,
      coursesCompleted: user?.watchedClasses?.length || 0,
    };

    return allAchievements
      .filter(a => !unlockedIds.has(a.id))
      .map(achievement => {
        let current = 0;
        let target = 1;
        
        const req = achievement.requirement as { type: string; value: number };
        target = req.value;
        
        switch (req.type) {
          case 'posts_count':
            current = Math.min(stats.postsCount, target);
            break;
          case 'followers':
            current = Math.min(stats.followersCount, target);
            break;
          case 'login_streak':
            current = Math.min(stats.diasActivos, target);
            break;
          case 'is_pro':
          case 'verified':
          case 'early_member':
          case 'first_login':
            current = (req.type === 'is_pro' && stats.isPro) || 
                      (req.type === 'verified' && stats.isVerified) ? 1 : 0;
            target = 1;
            break;
          case 'courses_completed':
            current = Math.min(stats.coursesCompleted, target);
            break;
          default:
            current = 0;
        }

        const progress = target > 0 ? Math.round((current / target) * 100) : 0;

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          points: achievement.points,
          rarity: achievement.rarity,
          progress,
          current,
          target,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  },
});

export const checkAndAwardAchievements = mutation({
  args: { 
    userId: v.string(),
    action: v.union(
      v.literal('post_created'),
      v.literal('comment_created'),
      v.literal('like_given'),
      v.literal('follow_received'),
      v.literal('trade_shared'),
      v.literal('winning_trade'),
      v.literal('course_completed'),
      v.literal('quiz_passed'),
      v.literal('resource_downloaded'),
      v.literal('login'),
      v.literal('verified'),
      v.literal('subscription_upgraded'),
      v.literal('referral_completed'),
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, action, metadata } = args;
    const now = Date.now();

    const user = await ctx.db
      .query("profiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();

    if (!user) return { awarded: [], userId, action };

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();

    const stats = {
      postsCount: user.aportes || 0,
      followersCount: user.seguidores?.length || 0,
      followingCount: user.siguiendo?.length || 0,
      diasActivos: user.diasActivos || 0,
      isPro: user.esPro || false,
      isVerified: user.esVerificado || false,
      coursesCompleted: user.watchedClasses?.length || 0,
    };

    const awarded: string[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const req = achievement.requirement as { type: string; value: number };
      let shouldAward = false;

      switch (action) {
        case 'post_created':
        case 'trade_shared':
          if (req.type === 'posts_count' || req.type === 'trading_ideas') {
            shouldAward = (stats.postsCount >= req.value);
          }
          break;
        case 'winning_trade':
          if (req.type === 'winning_trades') {
            const winCount = (metadata?.winCount as number) || (user as any).winningTrades || 0;
            shouldAward = (winCount >= req.value);
          }
          break;
        case 'comment_created':
          if (req.type === 'comments_count') {
            const commentCount = (metadata?.commentCount as number) || stats.postsCount;
            shouldAward = (commentCount >= req.value);
          }
          break;
        case 'like_given':
          if (req.type === 'likes_given') {
            const likeCount = (metadata?.likeCount as number) || 0;
            shouldAward = (likeCount >= req.value);
          }
          break;
        case 'follow_received':
          if (req.type === 'followers') {
            shouldAward = (stats.followersCount >= req.value);
          }
          break;
        case 'course_completed':
          if (req.type === 'courses_completed') {
            shouldAward = (stats.coursesCompleted >= req.value);
          }
          break;
        case 'verified':
          if (req.type === 'verified') {
            shouldAward = true;
          }
          break;
        case 'subscription_upgraded':
          if (req.type === 'is_pro') {
            shouldAward = true;
          }
          break;
        case 'login':
          if (req.type === 'first_login' || req.type === 'login_streak') {
            shouldAward = (req.type === 'first_login') || 
                          (stats.diasActivos >= req.value);
          }
          break;
        case 'referral_completed':
          if (req.type === 'referrals') {
            const referralCount = (metadata?.referralCount as number) || 0;
            shouldAward = (referralCount >= req.value);
          }
          break;
      }

      if (shouldAward) {
        await ctx.db.insert("userAchievements", {
          userId,
          achievementId: achievement.id,
          unlockedAt: now,
        });

        await ctx.db.insert("notifications", {
          userId,
          type: "achievement",
          title: "¡Nuevo Logro Desbloqueado!",
          body: `Has desbloqueado: ${achievement.name}`,
          read: false,
          data: { achievementId: achievement.id, points: achievement.points },
          createdAt: now,
        });

        await ctx.db.patch(user._id, {
          xp: (user.xp || 0) + achievement.points,
        });

        awarded.push(achievement.id);
      }
    }

    return { awarded, userId, action, totalAwarded: awarded.length };
  },
});

export const getLeaderboardByAchievements = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const allUserAchievements = await ctx.db.query("userAchievements").collect();
    const allAchievements = await ctx.db.query("achievements").collect();
    
    const achievementPoints = new Map(
      allAchievements.map(a => [a.id, a.points])
    );

    const userScores: Record<string, { userId: string; totalPoints: number; count: number }> = {};
    
    for (const ua of allUserAchievements) {
      if (!userScores[ua.userId]) {
        userScores[ua.userId] = { userId: ua.userId, totalPoints: 0, count: 0 };
      }
      userScores[ua.userId].totalPoints += achievementPoints.get(ua.achievementId) || 0;
      userScores[ua.userId].count += 1;
    }

    const sortedUsers = Object.values(userScores)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);

    const leaderboard = await Promise.all(
      sortedUsers.map(async (userScore, index) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", q => q.eq("userId", userScore.userId))
          .first();
        
        return {
          rank: index + 1,
          userId: userScore.userId,
          nombre: profile?.nombre || 'Usuario',
          usuario: profile?.usuario || 'user',
          avatar: profile?.avatar || '',
          totalPoints: userScore.totalPoints,
          achievementsCount: userScore.count,
        };
      })
    );

    return leaderboard;
  },
});

export const getAchievementStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();

    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();

    const totalAchievements = allAchievements.length;
    const unlockedCount = userAchievements.length;
    const totalPoints = userAchievements.reduce((sum, ua) => {
      const achievement = allAchievements.find(a => a.id === ua.achievementId);
      return sum + (achievement?.points || 0);
    }, 0);

    const categoryBreakdown: Record<string, { total: number; unlocked: number }> = {
      social: { total: 0, unlocked: 0 },
      trading: { total: 0, unlocked: 0 },
      learning: { total: 0, unlocked: 0 },
      special: { total: 0, unlocked: 0 },
    };

    for (const a of allAchievements) {
      if (categoryBreakdown[a.category]) {
        categoryBreakdown[a.category].total++;
      }
    }

    for (const ua of userAchievements) {
      const achievement = allAchievements.find(a => a.id === ua.achievementId);
      if (achievement && categoryBreakdown[achievement.category]) {
        categoryBreakdown[achievement.category].unlocked++;
      }
    }

    return {
      totalAchievements,
      unlockedCount,
      lockedCount: totalAchievements - unlockedCount,
      totalPoints,
      completionPercentage: totalAchievements > 0 
        ? Math.round((unlockedCount / totalAchievements) * 100) 
        : 0,
      categoryBreakdown,
    };
  },
});
