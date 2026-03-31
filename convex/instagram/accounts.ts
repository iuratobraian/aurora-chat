// @ts-nocheck
import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const getByInstagramId = query({
  args: { instagramId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("instagram_accounts")
      .withIndex("by_instagramId", (q) => q.eq("instagramId", args.instagramId))
      .first();
  },
});

export const getById = query({
  args: { accountId: v.id("instagram_accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

export const updateStats = mutation({
  args: {
    accountId: v.id("instagram_accounts"),
    followers: v.number(),
    totalPosts: v.number(),
    biography: v.optional(v.string()),
    website: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { updatedAt: Date.now() };
    updates.followers = args.followers;
    updates.totalPosts = args.totalPosts;
    if (args.biography !== undefined) updates.biography = args.biography;
    if (args.website !== undefined) updates.website = args.website;
    if (args.profilePicture !== undefined) updates.profilePicture = args.profilePicture;

    await ctx.db.patch(args.accountId, updates);
    return { success: true };
  },
});

// Las variables se leerán dentro de los handlers para asegurar frescura

export const getInstagramAuthUrl = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const appId = '774728925442791';
    const redirectUri = 'https://tradeportal-2025-platinum.vercel.app/api/instagram/callback';
    // Se utiliza business_management para simplificar la gestión de cuentas comerciales sin errores de scope personalizados.
    const scope = 'pages_show_list,pages_read_engagement,business_management';
    
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${args.userId}`;
  },
});

export const checkConfig = query({
  args: {},
  handler: async (ctx) => {
    return {
      hasAppId: !!process.env.INSTAGRAM_APP_ID,
      hasAppSecret: !!process.env.INSTAGRAM_APP_SECRET,
      hasRedirectUri: !!process.env.INSTAGRAM_REDIRECT_URI,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'No configurado',
    };
  },
});

export const exchangeCodeForToken = action({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    // Credenciales oficiales de TradeHub en Meta
    const appId = '774728925442791';
    const appSecret = '8909efb45f4668013e28bb9931016afa';
    const redirectUri = 'https://tradeportal-2025-platinum.vercel.app/api/instagram/callback';

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', args.code);

    const response = await fetch(tokenUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  },
});

export const getInstagramBusinessAccount = action({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const accountsUrl = new URL('https://graph.facebook.com/v18.0/me/accounts');
    accountsUrl.searchParams.set('access_token', args.accessToken);

    const accountsResponse = await fetch(accountsUrl.toString());
    const accountsData = await accountsResponse.json();

    if (accountsData.error) {
      throw new Error(accountsData.error.message);
    }

    const page = accountsData.data?.[0];
    if (!page) {
      throw new Error('No Facebook Page found');
    }

    const igUrl = new URL(`https://graph.facebook.com/v18.0/${page.id}`);
    igUrl.searchParams.set('access_token', page.access_token);
    igUrl.searchParams.set('fields', 'instagram_business_account');

    const igResponse = await fetch(igUrl.toString());
    const igData = await igResponse.json();

    if (igData.error) {
      throw new Error(igData.error.message);
    }

    const igAccount = igData.instagram_business_account;
    if (!igAccount) {
      throw new Error('No Instagram Business account found');
    }

    const detailsUrl = new URL(`https://graph.facebook.com/v18.0/${igAccount.id}`);
    detailsUrl.searchParams.set('access_token', page.access_token);
    detailsUrl.searchParams.set('fields', 'id,username,name,profile_picture_url,biography,website,followers_count,media_count');

    const detailsResponse = await fetch(detailsUrl.toString());
    const details = await detailsResponse.json();

    return {
      instagramId: igAccount.id,
      username: details.username,
      name: details.name,
      profilePicture: details.profile_picture_url,
      biography: details.biography,
      website: details.website,
      followers: details.followers_count,
      mediaCount: details.media_count,
      pageAccessToken: page.access_token,
    };
  },
});

export const connectInstagramAccount = mutation({
  args: {
    userId: v.string(),
    instagramId: v.string(),
    username: v.string(),
    accessToken: v.string(),
    pageAccessToken: v.string(),
    profilePicture: v.optional(v.string()),
    biography: v.optional(v.string()),
    website: v.optional(v.string()),
    followers: v.optional(v.number()),
    isBusiness: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("instagram_accounts")
      .withIndex("by_instagramId", (q) => q.eq("instagramId", args.instagramId))
      .first();

    const now = Date.now();
    const encryptedToken = Buffer.from(args.accessToken).toString('base64');
    const encryptedPageToken = Buffer.from(args.pageAccessToken).toString('base64');

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        accessToken: encryptedToken,
        encryptedRefreshToken: encryptedPageToken,
        isConnected: true,
        username: args.username,
        profilePicture: args.profilePicture,
        biography: args.biography,
        website: args.website,
        followers: args.followers,
        updatedAt: now,
      });
      return existing._id;
    }

    const accountId = await ctx.db.insert("instagram_accounts", {
      userId: args.userId,
      instagramId: args.instagramId,
      username: args.username,
      accessToken: encryptedToken,
      encryptedRefreshToken: encryptedPageToken,
      isBusiness: args.isBusiness,
      isConnected: true,
      permissions: ["pages_show_list", "pages_read_engagement", "business_management"],
      autoPostEnabled: false,
      watermarkEnabled: false,
      aiAutoReply: false,
      totalPosts: 0,
      totalReplies: 0,
      profilePicture: args.profilePicture,
      biography: args.biography,
      website: args.website,
      followers: args.followers,
      createdAt: now,
      updatedAt: now,
    });

    return accountId;
  },
});

export const disconnectInstagramAccount = mutation({
  args: { userId: v.string(), accountId: v.id("instagram_accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    
    if (!account || account.userId !== args.userId) {
      throw new Error("Account not found or unauthorized");
    }

    await ctx.db.patch(args.accountId, {
      isConnected: false,
      accessToken: '',
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getUserInstagramAccounts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("instagram_accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return accounts.map(account => ({
      _id: account._id,
      instagramId: account.instagramId,
      username: account.username,
      isBusiness: account.isBusiness,
      isConnected: account.isConnected,
      followers: account.followers,
      autoPostEnabled: account.autoPostEnabled,
      aiAutoReply: account.aiAutoReply,
      profilePicture: account.profilePicture,
      biography: account.biography,
      totalPosts: account.totalPosts,
      totalReplies: account.totalReplies,
      createdAt: account.createdAt,
    }));
  },
});

export const getAllConnectedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db
      .query("instagram_accounts")
      .collect();

    const connected = accounts.filter(a => a.isConnected);
    
    return connected.map(account => ({
      _id: account._id,
      userId: account.userId,
      instagramId: account.instagramId,
      username: account.username,
      isBusiness: account.isBusiness,
      isConnected: account.isConnected,
      followers: account.followers || 0,
      autoPostEnabled: account.autoPostEnabled,
      aiAutoReply: account.aiAutoReply,
      profilePicture: account.profilePicture,
      totalPosts: account.totalPosts || 0,
      totalReplies: account.totalReplies || 0,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  },
});

export const getInstagramStats = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db
      .query("instagram_accounts")
      .collect();

    const connected = accounts.filter(a => a.isConnected);
    const disconnected = accounts.filter(a => !a.isConnected);
    
    const totalFollowers = connected.reduce((sum, a) => sum + (a.followers || 0), 0);
    const totalPosts = connected.reduce((sum, a) => sum + (a.totalPosts || 0), 0);

    return {
      totalAccounts: accounts.length,
      connectedAccounts: connected.length,
      disconnectedAccounts: disconnected.length,
      totalFollowers,
      totalPosts,
    };
  },
});

export const updateAccountSettings = mutation({
  args: {
    accountId: v.id("instagram_accounts"),
    userId: v.string(),
    autoPostEnabled: v.optional(v.boolean()),
    defaultHashtags: v.optional(v.array(v.string())),
    watermarkEnabled: v.optional(v.boolean()),
    watermarkPosition: v.optional(v.string()),
    aiAutoReply: v.optional(v.boolean()),
    aiReplyLanguage: v.optional(v.string()),
    aiReplyDelay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    
    if (!account || account.userId !== args.userId) {
      throw new Error("Account not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    
    if (args.autoPostEnabled !== undefined) updates.autoPostEnabled = args.autoPostEnabled;
    if (args.defaultHashtags !== undefined) updates.defaultHashtags = args.defaultHashtags;
    if (args.watermarkEnabled !== undefined) updates.watermarkEnabled = args.watermarkEnabled;
    if (args.watermarkPosition !== undefined) updates.watermarkPosition = args.watermarkPosition;
    if (args.aiAutoReply !== undefined) updates.aiAutoReply = args.aiAutoReply;
    if (args.aiReplyLanguage !== undefined) updates.aiReplyLanguage = args.aiReplyLanguage;
    if (args.aiReplyDelay !== undefined) updates.aiReplyDelay = args.aiReplyDelay;

    await ctx.db.patch(args.accountId, updates);

    return { success: true };
  },
});

export const refreshAccountStats = action({
  args: { accountId: v.id("instagram_accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(api["instagram/accounts"].getById, { accountId: args.accountId });
    
    if (!account) {
      throw new Error("Account not found");
    }

    const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf8');

    const statsUrl = new URL(`https://graph.facebook.com/v18.0/${account.instagramId}`);
    statsUrl.searchParams.set('access_token', accessToken);
    statsUrl.searchParams.set('fields', 'followers_count,media_count');

    const response = await fetch(statsUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    await ctx.runMutation(api["instagram/accounts"].updateStats, {
      accountId: args.accountId,
      followers: data.followers_count,
      totalPosts: data.media_count,
    });

    return {
      followers: data.followers_count,
      mediaCount: data.media_count,
    };
  },
});

export const deleteInstagramAccount = mutation({
  args: { userId: v.string(), accountId: v.id("instagram_accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    
    if (!account || account.userId !== args.userId) {
      throw new Error("Account not found or unauthorized");
    }

    await ctx.db.delete(args.accountId);

    const scheduledPosts = await ctx.db
      .query("instagram_scheduled_posts")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();

    for (const post of scheduledPosts) {
      await ctx.db.delete(post._id);
    }

    const replyRules = await ctx.db
      .query("instagram_auto_reply_rules")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();

    for (const rule of replyRules) {
      await ctx.db.delete(rule._id);
    }

    return { success: true };
  },
});
