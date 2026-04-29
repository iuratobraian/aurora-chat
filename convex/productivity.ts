import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Reminders
export const createReminder = mutation({
  args: { userId: v.id("users"), text: v.string(), date: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reminders", {
      userId: args.userId,
      text: args.text,
      date: args.date,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const getReminders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const toggleReminder = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const r = await ctx.db.get(args.reminderId);
    if (r) await ctx.db.patch(args.reminderId, { completed: !r.completed });
  },
});

export const deleteReminder = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.reminderId);
  },
});

// Notes
export const createNote = mutation({
  args: { userId: v.id("users"), title: v.string(), content: v.string(), color: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      color: args.color,
      createdAt: Date.now(),
    });
  },
});

export const updateNote = mutation({
  args: { noteId: v.id("notes"), title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, { title: args.title, content: args.content });
  },
});


export const getNotes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
  },
});

// Passwords
export const createPassword = mutation({
  args: { userId: v.id("users"), site: v.string(), username: v.string(), encryptedPassword: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("passwords", {
      userId: args.userId,
      site: args.site,
      username: args.username,
      encryptedPassword: args.encryptedPassword,
      createdAt: Date.now(),
    });
  },
});

export const getPasswords = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passwords")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const deletePassword = mutation({
  args: { passwordId: v.id("passwords") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.passwordId);
  },
});

