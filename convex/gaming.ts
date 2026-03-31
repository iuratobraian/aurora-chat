import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createGameSession = mutation({
  args: {
    userId: v.string(),
    appId: v.string(),
    gameMode: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("gameSessions", {
      userId: args.userId,
      appId: args.appId,
      gameMode: args.gameMode,
      status: "active",
      startTime: Date.now(),
      endTime: undefined,
      score: 0,
      xpEarned: 0,
      completed: false,
    });
    return sessionId;
  },
});

export const completeGameSession = mutation({
  args: {
    sessionId: v.id("gameSessions"),
    score: v.number(),
    won: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Sesión no encontrada");
    if (session.status !== "active") throw new Error("Sesión ya completada");

    const XP_BASE = 50;
    const XP_WIN_BONUS = 100;
    const XP_TIME_BONUS = 10;
    
    let xpEarned = XP_BASE;
    if (args.won) xpEarned += XP_WIN_BONUS;
    
    const duration = session.endTime 
      ? (session.endTime - session.startTime) / 1000 / 60 
      : (Date.now() - session.startTime) / 1000 / 60;
    if (duration < 5) xpEarned += XP_TIME_BONUS;

    await ctx.db.patch(args.sessionId, {
      status: "completed",
      endTime: Date.now(),
      score: args.score,
      xpEarned,
      completed: true,
    });

    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();

    if (userProfile) {
      const currentXP = (userProfile.xp || 0) + xpEarned;
      const newLevel = Math.floor(currentXP / 1000) + 1;
      await ctx.db.patch(userProfile._id, {
        xp: currentXP,
        level: newLevel,
      });
    }

    return { xpEarned, won: args.won };
  },
});

export const getUserGameSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const getGameStats = query({
  args: { appId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("gameSessions")
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .collect();

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === "completed");
    const completedCount = completedSessions.length;
    const totalXP = completedSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
    const avgScore = completedCount > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedCount)
      : 0;
    const winRate = completedCount > 0
      ? Math.round((completedSessions.filter(s => s.score > 0).length / completedCount) * 100)
      : 0;

    const uniquePlayers = new Set(sessions.map(s => s.userId)).size;

    return {
      appId: args.appId,
      totalSessions,
      completedSessions: completedCount,
      uniquePlayers,
      totalXP,
      averageScore: avgScore,
      winRate,
      lastPlayed: sessions[0]?.startTime || null,
    };
  },
});

export const getLeaderboard = query({
  args: { appId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("gameSessions")
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .collect();

    const userScores: Record<string, { totalScore: number; wins: number; sessions: number }> = {};
    
    sessions.forEach(s => {
      if (!userScores[s.userId]) {
        userScores[s.userId] = { totalScore: 0, wins: 0, sessions: 0 };
      }
      userScores[s.userId].totalScore += s.score || 0;
      userScores[s.userId].sessions += 1;
      if (s.score > 0) userScores[s.userId].wins += 1;
    });

    const leaderboard = await Promise.all(
      Object.entries(userScores)
        .sort((a, b) => b[1].totalScore - a[1].totalScore)
        .slice(0, args.limit || 10)
        .map(async ([userId, stats]) => {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();
          return {
            userId,
            username: profile?.usuario || profile?.nombre || "Jugador",
            avatar: profile?.avatar,
            ...stats,
          };
        })
    );

    return leaderboard;
  },
});

export const getAllGamesStats = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .collect();

    const games = apps.filter(a => a.category === "game");

    const stats = await Promise.all(
      games.map(async (game) => {
        const sessions = await ctx.db
          .query("gameSessions")
          .filter((q) => q.eq(q.field("appId"), game.appId))
          .collect();

        return {
          appId: game.appId,
          name: game.name,
          icon: game.icon,
          status: game.status,
          totalSessions: sessions.length,
          completedSessions: sessions.filter(s => s.status === "completed").length,
          uniquePlayers: new Set(sessions.map(s => s.userId)).size,
        };
      })
    );

    return stats;
  },
});

export const recordGamePlayed = mutation({
  args: {
    appId: v.string(),
    playerCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gameStats")
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalPlays: existing.totalPlays + 1,
        lastPlayed: Date.now(),
      });
    } else {
      await ctx.db.insert("gameStats", {
        appId: args.appId,
        totalPlays: 1,
        playerCount: args.playerCount,
        lastPlayed: Date.now(),
      });
    }
    return { success: true };
  },
});
