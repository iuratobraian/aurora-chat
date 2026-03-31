// @ts-nocheck
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getUserTemplates = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("instagram_content_templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return templates;
  },
});

export const getTemplateById = query({
  args: { templateId: v.id("instagram_content_templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    return template;
  },
});

export const createTemplate = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    template: v.string(),
    variables: v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("date")),
      defaultValue: v.optional(v.string()),
    })),
    defaultHashtags: v.optional(v.array(v.string())),
    defaultImage: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const templateId = await ctx.db.insert("instagram_content_templates", {
      userId: args.userId,
      name: args.name,
      description: args.description || "",
      template: args.template,
      variables: args.variables,
      defaultHashtags: args.defaultHashtags || [],
      defaultImage: args.defaultImage || "",
      aiPrompt: args.aiPrompt || "",
      useCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return templateId;
  },
});

export const updateTemplate = mutation({
  args: {
    templateId: v.id("instagram_content_templates"),
    userId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    template: v.optional(v.string()),
    variables: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("date")),
      defaultValue: v.optional(v.string()),
    }))),
    defaultHashtags: v.optional(v.array(v.string())),
    defaultImage: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    
    if (!template || template.userId !== args.userId) {
      throw new Error("Template not found or unauthorized");
    }
    
    const updates: any = { updatedAt: Date.now() };
    
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.template !== undefined) updates.template = args.template;
    if (args.variables !== undefined) updates.variables = args.variables;
    if (args.defaultHashtags !== undefined) updates.defaultHashtags = args.defaultHashtags;
    if (args.defaultImage !== undefined) updates.defaultImage = args.defaultImage;
    if (args.aiPrompt !== undefined) updates.aiPrompt = args.aiPrompt;
    
    await ctx.db.patch(args.templateId, updates);
    
    return { success: true };
  },
});

export const deleteTemplate = mutation({
  args: {
    templateId: v.id("instagram_content_templates"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    
    if (!template || template.userId !== args.userId) {
      throw new Error("Template not found or unauthorized");
    }
    
    await ctx.db.delete(args.templateId);
    
    return { success: true };
  },
});

export const useTemplate = mutation({
  args: {
    templateId: v.id("instagram_content_templates"),
    userId: v.string(),
    variableValues: v.any(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    
    if (!template || template.userId !== args.userId) {
      throw new Error("Template not found or unauthorized");
    }
    
    let content = template.template;
    
    for (const variable of template.variables) {
      const value = args.variableValues[variable.name] || variable.defaultValue || '';
      content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), String(value));
    }
    
    const hashtags = [...(template.defaultHashtags || [])];
    
    await ctx.db.patch(args.templateId, {
      useCount: template.useCount + 1,
      lastUsedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return {
      content,
      hashtags,
      templateName: template.name,
    };
  },
});

export const getPopularTemplates = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("instagram_content_templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return templates
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, args.limit || 10);
  },
});

export const duplicateTemplate = mutation({
  args: {
    templateId: v.id("instagram_content_templates"),
    userId: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.templateId);
    
    if (!original || original.userId !== args.userId) {
      throw new Error("Template not found or unauthorized");
    }
    
    const now = Date.now();
    
    const newTemplateId = await ctx.db.insert("instagram_content_templates", {
      userId: args.userId,
      name: args.newName,
      description: original.description,
      template: original.template,
      variables: original.variables,
      defaultHashtags: original.defaultHashtags,
      defaultImage: original.defaultImage,
      aiPrompt: original.aiPrompt,
      useCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return newTemplateId;
  },
});
