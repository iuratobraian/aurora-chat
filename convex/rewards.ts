import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, assertOwnershipOrAdmin } from "./lib/auth";

export const getRewardsCatalog = query({
  args: {},
  handler: async (ctx) => {
    const rewards = await ctx.db.query("rewards").order("desc").collect();
    return rewards;
  },
});

export const getUserRewards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    if ((await ctx.auth.getUserIdentity())?.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes ver los canjes de otro usuario.");
    }
    const rewards = await ctx.db
      .query("rewards_history")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return rewards;
  },
});

export const redeemReward = mutation({
  args: {
    userId: v.string(),
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes canjear recompensas para otro usuario.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!profile) throw new Error("Perfil no encontrado");

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) throw new Error("Recompensa no encontrada");

    const currentXp = profile.xp || 0;
    if (currentXp < reward.xpCost) {
      throw new Error(`XP insuficiente. Necesitas ${reward.xpCost} XP, tienes ${currentXp} XP`);
    }

    await ctx.db.patch(profile._id, {
      xp: currentXp - reward.xpCost,
    });

    await ctx.db.insert("rewards_history", {
      userId: args.userId,
      rewardId: args.rewardId,
      rewardName: reward.name,
      xpSpent: reward.xpCost,
      status: "active",
      redeemedAt: Date.now(),
      expiresAt: reward.expiresInDays ? Date.now() + reward.expiresInDays * 24 * 60 * 60 * 1000 : undefined,
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: "🎁 Recompensa Canjeada",
      body: `Has canjeado "${reward.name}" por ${reward.xpCost} XP`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, newBalance: currentXp - reward.xpCost };
  },
});

export const activateReward = mutation({
  args: {
    userId: v.string(),
    historyId: v.id("rewards_history"),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) {
        throw new Error("IDOR Detectado: No puedes activar recompensas de otro usuario.");
    }
    const history = await ctx.db.get(args.historyId);
    if (!history || history.userId !== args.userId) {
      throw new Error("Recompensa no encontrada");
    }

    await ctx.db.patch(args.historyId, {
      status: "activated",
      activatedAt: Date.now(),
    });

    return { success: true };
  },
});
