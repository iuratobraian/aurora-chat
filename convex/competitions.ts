import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveCompetitions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("competitions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const getUpcomingCompetitions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const competitions = await ctx.db
      .query("competitions")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .collect();
    return competitions
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, limit || 10);
  },
});

export const getFeaturedCompetitions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("competitions")
      .filter((q) => q.eq(q.field("isFeatured"), true))
      .take(3);
  },
});

export const joinCompetition = mutation({
  args: {
    competitionId: v.id("competitions"),
    oderId: v.string(),
    username: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const competition = await ctx.db.get(args.competitionId);
    if (!competition) throw new Error("Competition not found");
    
    if (competition.maxParticipants && competition.currentParticipants >= competition.maxParticipants) {
      throw new Error("Competition is full");
    }

    const allParticipants = await ctx.db
      .query("competition_participants")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .collect();
    
    const existing = allParticipants.find(p => p.competitionId === args.competitionId);
    if (existing) throw new Error("Already joined");

    const participantId = await ctx.db.insert("competition_participants", {
      competitionId: args.competitionId,
      oderId: args.oderId,
      username: args.username,
      avatar: args.avatar,
      score: 0,
      metrics: {},
      joinedAt: Date.now(),
      lastUpdated: Date.now(),
    });

    await ctx.db.patch(args.competitionId, {
      currentParticipants: competition.currentParticipants + 1,
    });

    return participantId;
  },
});

export const leaveCompetition = mutation({
  args: {
    competitionId: v.id("competitions"),
    oderId: v.string(),
  },
  handler: async (ctx, args) => {
    const allParticipants = await ctx.db
      .query("competition_participants")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .collect();
    
    const participant = allParticipants.find(p => p.competitionId === args.competitionId);
    if (!participant) throw new Error("Not a participant");

    await ctx.db.delete(participant._id);
    
    const competition = await ctx.db.get(args.competitionId);
    if (competition) {
      await ctx.db.patch(args.competitionId, {
        currentParticipants: Math.max(0, competition.currentParticipants - 1),
      });
    }
  },
});

export const getLeaderboard = query({
  args: { competitionId: v.id("competitions"), limit: v.optional(v.number()) },
  handler: async (ctx, { competitionId, limit }) => {
    const participants = await ctx.db
      .query("competition_participants")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
    
    return participants
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 50);
  },
});

export const getUserParticipation = query({
  args: { oderId: v.string() },
  handler: async (ctx, { oderId }) => {
    return await ctx.db
      .query("competition_participants")
      .withIndex("by_user", (q) => q.eq("oderId", oderId))
      .collect();
  },
});
