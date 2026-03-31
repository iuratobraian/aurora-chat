// @ts-nocheck
import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const getThreads = query({
  args: {
    accountId: v.string(),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("instagram_messages")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const threadMap = new Map<string, any>();
    
    for (const msg of messages) {
      const threadKey = msg.senderId;
      if (!threadMap.has(threadKey)) {
        threadMap.set(threadKey, {
          senderId: msg.senderId,
          senderUsername: msg.senderUsername,
          lastMessage: msg.text || '',
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          messages: [],
        });
      }
      
      const thread = threadMap.get(threadKey);
      if (msg.createdAt > thread.lastMessageAt) {
        thread.lastMessage = msg.text || '';
        thread.lastMessageAt = msg.createdAt;
      }
      if (!msg.isRead) {
        thread.unreadCount++;
      }
    }
    
    let threads = Array.from(threadMap.values());
    threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    
    if (args.unreadOnly) {
      threads = threads.filter(t => t.unreadCount > 0);
    }
    
    return threads;
  },
});

export const getThreadMessages = query({
  args: {
    accountId: v.string(),
    senderId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("instagram_messages")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const threadMessages = messages
      .filter(m => m.senderId === args.senderId)
      .sort((a, b) => a.createdAt - b.createdAt);
    
    return threadMessages.slice(-(args.limit || 50));
  },
});

export const markThreadAsRead = mutation({
  args: {
    accountId: v.string(),
    senderId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("instagram_messages")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const unreadMessages = messages.filter(
      m => m.senderId === args.senderId && !m.isRead
    );
    
    for (const msg of unreadMessages) {
      await ctx.db.patch(msg._id, {});
    }
    
    return { success: true, markedCount: unreadMessages.length };
  },
});

export const sendMessage = action({
  args: {
    accountId: v.string(),
    recipientId: v.string(),
    recipientUsername: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(
      api["instagram/accounts"].getById,
      { accountId: args.accountId }
    );
    
    if (!account || !account.isConnected) {
      throw new Error("Account not connected");
    }
    
    const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf8');
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account.instagramId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: args.recipientId },
          message: { text: args.text },
          messaging_type: 'MESSAGE',
        }),
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const now = Date.now();
    await ctx.db.insert("instagram_messages", {
      accountId: args.accountId,
      messageId: data.message_id,
      senderId: account.instagramId,
      senderUsername: account.username,
      recipientId: args.recipientId,
      messageType: "text",
      text: args.text,
      isRead: true,
      isFromBusiness: true,
      wasAutoReplied: false,
      createdAt: now,
    });
    
    return { success: true, messageId: data.message_id };
  },
});

export const saveSentMessage = mutation({
  args: {
    accountId: v.string(),
    messageId: v.string(),
    senderId: v.string(),
    senderUsername: v.string(),
    recipientId: v.string(),
    recipientUsername: v.string(),
    text: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("instagram_messages", {
      accountId: args.accountId,
      messageId: args.messageId,
      senderId: args.senderId,
      senderUsername: args.senderUsername,
      recipientId: args.recipientId,
      messageType: "text",
      text: args.text,
      isRead: true,
      isFromBusiness: true,
      wasAutoReplied: false,
      createdAt: args.createdAt,
    });
    
    return { success: true };
  },
});

export const getUnreadCount = query({
  args: { accountId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("instagram_messages")
      .withIndex("by_account_read", (q) => 
        q.eq("accountId", args.accountId).eq("isRead", false)
      )
      .collect();
    
    const uniqueSenders = new Set(messages.map(m => m.senderId));
    
    return {
      total: messages.length,
      threads: uniqueSenders.size,
    };
  },
});

export const processWebhook = action({
  args: {
    accountId: v.string(),
    entry: v.any(),
  },
  handler: async (ctx, args) => {
    const changes = args.entry.changes || [];
    
    for (const change of changes) {
      if (change.field === 'comments' && change.value) {
        const comment = change.value;
        const createdAt = new Date(comment.created_at).getTime();
        
        const existing = await ctx.db
          .query("instagram_messages")
          .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
          .collect();
        
        const exists = existing.some(m => m.messageId === comment.id);
        
        if (!exists) {
          await ctx.db.insert("instagram_messages", {
            accountId: args.accountId,
            messageId: comment.id,
            senderId: comment.from?.id || 'unknown',
            senderUsername: comment.from?.username || 'unknown',
            recipientId: args.accountId,
            messageType: "comment",
            text: comment.text,
            isRead: false,
            isFromBusiness: false,
            wasAutoReplied: false,
            createdAt,
          });
        }
      }
      
      if (change.field === 'mentions' && change.value) {
        const mention = change.value;
        const createdAt = new Date(mention.created_at).getTime();
        
        const existing = await ctx.db
          .query("instagram_messages")
          .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
          .collect();
        
        const exists = existing.some(m => m.messageId === mention.id);
        
        if (!exists) {
          await ctx.db.insert("instagram_messages", {
            accountId: args.accountId,
            messageId: mention.id,
            senderId: mention.from?.id || 'unknown',
            senderUsername: mention.from?.username || 'unknown',
            recipientId: args.accountId,
            messageType: "story_mention",
            text: mention.text,
            mediaUrl: mention.media?.media_url,
            isRead: false,
            isFromBusiness: false,
            wasAutoReplied: false,
            createdAt,
          });
        }
      }
    }
    
    return { success: true, processed: changes.length };
  },
});

export const saveComment = mutation({
  args: {
    accountId: v.string(),
    messageId: v.string(),
    senderId: v.string(),
    senderUsername: v.string(),
    text: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("instagram_messages")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const exists = existing.some(m => m.messageId === args.messageId);
    
    if (!exists) {
      await ctx.db.insert("instagram_messages", {
        accountId: args.accountId,
        messageId: args.messageId,
        senderId: args.senderId,
        senderUsername: args.senderUsername,
        recipientId: args.accountId,
        messageType: "comment",
        text: args.text,
        isRead: false,
        isFromBusiness: false,
        wasAutoReplied: false,
        createdAt: args.createdAt,
      });
    }
    
    return { success: true };
  },
});

export const saveMention = mutation({
  args: {
    accountId: v.string(),
    messageId: v.string(),
    senderId: v.string(),
    senderUsername: v.string(),
    text: v.string(),
    mediaUrl: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("instagram_messages")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
    
    const exists = existing.some(m => m.messageId === args.messageId);
    
    if (!exists) {
      await ctx.db.insert("instagram_messages", {
        accountId: args.accountId,
        messageId: args.messageId,
        senderId: args.senderId,
        senderUsername: args.senderUsername,
        recipientId: args.accountId,
        messageType: "story_mention",
        text: args.text,
        mediaUrl: args.mediaUrl,
        isRead: false,
        isFromBusiness: false,
        wasAutoReplied: false,
        createdAt: args.createdAt,
      });
    }
    
    return { success: true };
  },
});
