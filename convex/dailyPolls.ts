import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const votePoll = mutation({
  args: {
    communityId: v.id("communities"),
    asset: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const todayStart = new Date().setHours(0, 0, 0, 0);

      const existingVotes = await ctx.db
        .query("dailyPolls")
        .withIndex("by_community_user", (q) =>
          q.eq("communityId", args.communityId).eq("userId", args.userId)
        )
        .collect();

      const todayVote = existingVotes.find(v => v.votedAt >= todayStart && v.asset === args.asset);

      if (todayVote) {
        if (todayVote.direction === args.direction) {
          return { success: true, message: "Ya has votado esta dirección hoy", changed: false };
        }
        await ctx.db.patch(todayVote._id, {
          direction: args.direction,
          votedAt: Date.now(),
        });
        return { success: true, message: "Voto actualizado", changed: true };
      }

      await ctx.db.insert("dailyPolls", {
        communityId: args.communityId,
        userId: args.userId,
        asset: args.asset,
        direction: args.direction,
        votedAt: Date.now(),
      });

      return { success: true, message: "Voto registrado", changed: true };
    } catch(e) {
      console.error('[votePoll] error:', e);
      return { success: false, message: 'Error al votar', changed: false };
    }
  },
});

export const getTodayPoll = query({
  args: { communityId: v.id("communities"), asset: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    try {
      const todayStart = new Date().setHours(0, 0, 0, 0);

      let todayUserVote = null;
      if (args.userId) {
        const uid = args.userId;
        const userVote = await ctx.db
          .query("dailyPolls")
          .withIndex("by_community_user", (q) =>
            q.eq("communityId", args.communityId).eq("userId", uid)
          )
          .first();
        if (userVote && userVote.votedAt >= todayStart && userVote.asset === args.asset) {
          todayUserVote = userVote;
        }
      }

      const allVotes = await ctx.db
        .query("dailyPolls")
        .withIndex("by_asset", (q) => q.eq("asset", args.asset))
        .collect();

      const todayVotes = allVotes.filter(v => v.votedAt >= todayStart);
      const upVotes = todayVotes.filter(v => v.direction === "up").length;
      const downVotes = todayVotes.filter(v => v.direction === "down").length;

      return {
        userVote: todayUserVote?.direction || null,
        upVotes,
        downVotes,
        totalVotes: todayVotes.length,
        upPercentage: todayVotes.length > 0 ? Math.round((upVotes / todayVotes.length) * 100) : 50,
      };
    } catch(e) {
      console.error('[getTodayPoll] error:', e);
      return { userVote: null, upVotes: 0, downVotes: 0, totalVotes: 0, upPercentage: 50 };
    }
  },
});

export const getPollResults = query({
  args: { asset: v.string() },
  handler: async (ctx, args) => {
    try {
      const todayStart = new Date().setHours(0, 0, 0, 0);

      const allVotes = await ctx.db
        .query("dailyPolls")
        .withIndex("by_asset", (q) => q.eq("asset", args.asset))
        .collect();

      const todayVotes = allVotes.filter(v => v.votedAt >= todayStart);
      const upVotes = todayVotes.filter(v => v.direction === "up").length;
      const downVotes = todayVotes.filter(v => v.direction === "down").length;

      return {
        upVotes,
        downVotes,
        totalVotes: todayVotes.length,
        upPercentage: todayVotes.length > 0 ? Math.round((upVotes / todayVotes.length) * 100) : 50,
        downPercentage: todayVotes.length > 0 ? Math.round((downVotes / todayVotes.length) * 100) : 50,
      };
    } catch(e) {
      console.error('[getPollResults] error:', e);
      return { upVotes: 0, downVotes: 0, totalVotes: 0, upPercentage: 50, downPercentage: 50 };
    }
  },
});
