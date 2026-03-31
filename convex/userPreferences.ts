import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPreferences = query({
  args: { oderId: v.string() },
  handler: async (ctx, { oderId }) => {
    const prefs = await ctx.db
      .query("user_preferences")
      .withIndex("by_user", (q) => q.eq("oderId", oderId))
      .first();
    
    if (!prefs) {
      return {
        oderId,
        theme: "dark" as const,
        accentColor: "#3B82F6",
        fontSize: "medium" as const,
        reducedMotion: false,
        highContrast: false,
        language: "es" as const,
        pushEnabled: true,
        emailEnabled: true,
        notificationPreferences: {
          mentions: true,
          likes: true,
          comments: true,
          follows: true,
          signals: true,
          competitions: true,
          news: true,
          marketing: false,
        },
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
          timezone: "America/Argentina/Buenos_Aires",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
    
    return prefs;
  },
});

export const updateTheme = mutation({
  args: {
    oderId: v.string(),
    theme: v.union(
      v.literal("dark"),
      v.literal("light"),
      v.literal("system")
    ),
    accentColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("user_preferences")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    const updates: Record<string, unknown> = {
      theme: args.theme,
      updatedAt: Date.now(),
    };
    if (args.accentColor) {
      updates.accentColor = args.accentColor;
    }

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert("user_preferences", {
      oderId: args.oderId,
      theme: args.theme,
      accentColor: args.accentColor || "#3B82F6",
      fontSize: "medium",
      reducedMotion: false,
      highContrast: false,
      language: "es",
      pushEnabled: true,
      emailEnabled: true,
      notificationPreferences: {
        mentions: true,
        likes: true,
        comments: true,
        follows: true,
        signals: true,
        competitions: true,
        news: true,
        marketing: false,
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
        timezone: "America/Argentina/Buenos_Aires",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateLanguage = mutation({
  args: {
    oderId: v.string(),
    language: v.union(
      v.literal("es"),
      v.literal("en"),
      v.literal("pt")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("user_preferences")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        language: args.language,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("user_preferences", {
      oderId: args.oderId,
      theme: "dark",
      accentColor: "#3B82F6",
      fontSize: "medium",
      reducedMotion: false,
      highContrast: false,
      language: args.language,
      pushEnabled: true,
      emailEnabled: true,
      notificationPreferences: {
        mentions: true,
        likes: true,
        comments: true,
        follows: true,
        signals: true,
        competitions: true,
        news: true,
        marketing: false,
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
        timezone: "America/Argentina/Buenos_Aires",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateNotifications = mutation({
  args: {
    oderId: v.string(),
    pushEnabled: v.optional(v.boolean()),
    emailEnabled: v.optional(v.boolean()),
    notificationPreferences: v.optional(v.object({
      mentions: v.optional(v.boolean()),
      likes: v.optional(v.boolean()),
      comments: v.optional(v.boolean()),
      follows: v.optional(v.boolean()),
      signals: v.optional(v.boolean()),
      competitions: v.optional(v.boolean()),
      news: v.optional(v.boolean()),
      marketing: v.optional(v.boolean()),
    })),
    quietHours: v.optional(v.object({
      enabled: v.optional(v.boolean()),
      start: v.optional(v.string()),
      end: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("user_preferences")
      .withIndex("by_user", (q) => q.eq("oderId", args.oderId))
      .first();

    if (!existing) return null;

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.pushEnabled !== undefined) updates.pushEnabled = args.pushEnabled;
    if (args.emailEnabled !== undefined) updates.emailEnabled = args.emailEnabled;
    if (args.notificationPreferences) {
      updates.notificationPreferences = {
        ...existing.notificationPreferences,
        ...args.notificationPreferences,
      };
    }
    if (args.quietHours) {
      updates.quietHours = {
        ...existing.quietHours,
        ...args.quietHours,
      };
    }

    await ctx.db.patch(existing._id, updates);
    return existing._id;
  },
});
