import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPoll = mutation({
  args: {
    channelId: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("polls", {
      channelId: args.channelId,
      question: args.question,
      options: args.options.map(opt => ({ text: opt, votes: [] })),
      createdBy: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const getPollsByChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("polls")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
  },
});

export const voteInPoll = mutation({
  args: { pollId: v.id("polls"), optionIndex: v.number(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) return;

    // Check if user already voted in ANY option
    const hasVoted = poll.options.some(opt => opt.votes.includes(args.userId));
    if (hasVoted) return;

    const newOptions = [...poll.options];
    newOptions[args.optionIndex].votes.push(args.userId);

    await ctx.db.patch(args.pollId, { options: newOptions });
  },
});
