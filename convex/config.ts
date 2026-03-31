import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConfig = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("global_config")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const setConfig = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("global_config")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    } else {
      return await ctx.db.insert("global_config", args);
    }
  },
});
