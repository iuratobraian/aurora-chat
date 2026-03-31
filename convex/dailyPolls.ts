import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const votePoll = mutation({
  args: {
    communityId: v.id("communities"),
    asset: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Debes iniciar sesión para votar");
    
    const userId = identity.subject;
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const existingVotes = await ctx.db
      .query("dailyPolls")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", userId)
      )
      .collect();
    
    const todayVote = existingVotes.find(v => v.votedAt >= todayStart);

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
      userId,
      asset: args.asset,
      direction: args.direction,
      votedAt: Date.now(),
    });

    return { success: true, message: "Voto registrado", changed: true };
  },
});

export const getTodayPoll = query({
  args: { communityId: v.id("communities"), asset: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const userVote = userId ? await ctx.db
      .query("dailyPolls")
      .withIndex("by_community_user", (q) => 
        q.eq("communityId", args.communityId).eq("userId", userId)
      )
      .first() : null;

    const todayUserVote = userVote && userVote.votedAt >= todayStart ? userVote : null;

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
  },
});
