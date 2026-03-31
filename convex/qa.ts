import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get questions
export const getQuestions = query({
  args: { adminView: v.boolean() },
  handler: async (ctx, args) => {
    let q = ctx.db.query("qa").order("desc");

    if (!args.adminView) {
      // Members only see answered questions
      return await q.filter((q) => q.eq(q.field("respondida"), true)).collect();
    }

    // Admin/CEO sees all
    return await q.collect();
  },
});

// Ask a question
export const askQuestion = mutation({
  args: {
    userId: v.string(),
    pregunta: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("qa", {
      userId: args.userId,
      pregunta: args.pregunta,
      isAnonymous: args.isAnonymous,
      respondida: false,
      createdAt: Date.now(),
    });
  },
});

// Answer a question
export const answerQuestion = mutation({
  args: {
    id: v.id("qa"),
    respuesta: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      respuesta: args.respuesta,
      respondida: true,
      respondidaAt: Date.now(),
    });
  },
});

// Delete a question
export const deleteQuestion = mutation({
  args: { id: v.id("qa") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
