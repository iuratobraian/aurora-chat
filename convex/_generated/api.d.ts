/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as adAuction from "../adAuction.js";
import type * as adAuctions from "../adAuctions.js";
import type * as adTargeting from "../adTargeting.js";
import type * as adminFindings from "../adminFindings.js";
import type * as ads from "../ads.js";
import type * as aiAgent from "../aiAgent.js";
import type * as analytics from "../analytics.js";
import type * as apps from "../apps.js";
import type * as auditUtils from "../auditUtils.js";
import type * as auroraHive from "../auroraHive.js";
import type * as auth from "../auth.js";
import type * as auth_actions from "../auth_actions.js";
import type * as backup from "../backup.js";
import type * as chat from "../chat.js";
import type * as communities from "../communities.js";
import type * as communityMonetization from "../communityMonetization.js";
import type * as communityPlans from "../communityPlans.js";
import type * as competitions from "../competitions.js";
import type * as config from "../config.js";
import type * as creatorDashboard from "../creatorDashboard.js";
import type * as crons from "../crons.js";
import type * as dailyPolls from "../dailyPolls.js";
import type * as dataExport from "../dataExport.js";
import type * as files from "../files.js";
import type * as gamification from "../gamification.js";
import type * as gaming from "../gaming.js";
import type * as importSnapshot from "../importSnapshot.js";
import type * as instagram_accounts from "../instagram/accounts.js";
import type * as instagram_analytics from "../instagram/analytics.js";
import type * as instagram_analyticsOps from "../instagram/analyticsOps.js";
import type * as instagram_autoReply from "../instagram/autoReply.js";
import type * as instagram_messages from "../instagram/messages.js";
import type * as instagram_posts from "../instagram/posts.js";
import type * as instagram_scheduler from "../instagram/scheduler.js";
import type * as instagram_templates from "../instagram/templates.js";
import type * as lib_achievements from "../lib/achievements.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_gamification from "../lib/gamification.js";
import type * as lib_index from "../lib/index.js";
import type * as lib_mercadopago from "../lib/mercadopago.js";
import type * as lib_moderation from "../lib/moderation.js";
import type * as lib_paymentFactory from "../lib/paymentFactory.js";
import type * as lib_paymentProvider from "../lib/paymentProvider.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_stripe from "../lib/stripe.js";
import type * as lib_zenobank from "../lib/zenobank.js";
import type * as logger from "../logger.js";
import type * as market_economicCalendar from "../market/economicCalendar.js";
import type * as market_marketNews from "../market/marketNews.js";
import type * as mercadopagoApi from "../mercadopagoApi.js";
import type * as moderation from "../moderation.js";
import type * as notifications from "../notifications.js";
import type * as paymentOrchestrator from "../paymentOrchestrator.js";
import type * as payments from "../payments.js";
import type * as pendingOperations from "../pendingOperations.js";
import type * as platformConfig from "../platformConfig.js";
import type * as posts from "../posts.js";
import type * as products from "../products.js";
import type * as profiles from "../profiles.js";
import type * as propFirms from "../propFirms.js";
import type * as push from "../push.js";
import type * as pushActions from "../pushActions.js";
import type * as qa from "../qa.js";
import type * as queries_instagramAccountQueries from "../queries/instagramAccountQueries.js";
import type * as recursos from "../recursos.js";
import type * as referrals from "../referrals.js";
import type * as reviews from "../reviews.js";
import type * as rewards from "../rewards.js";
import type * as savedPosts from "../savedPosts.js";
import type * as seedAdminBraiurato from "../seedAdminBraiurato.js";
import type * as seedProducts from "../seedProducts.js";
import type * as seedSignals from "../seedSignals.js";
import type * as seedSubscriptionPlans from "../seedSubscriptionPlans.js";
import type * as seed_all from "../seed_all.js";
import type * as signalNotifications from "../signalNotifications.js";
import type * as signals from "../signals.js";
import type * as socialAgents from "../socialAgents.js";
import type * as social_cron from "../social_cron.js";
import type * as stats from "../stats.js";
import type * as strategies from "../strategies.js";
import type * as subcommunities from "../subcommunities.js";
import type * as subcommunityChat from "../subcommunityChat.js";
import type * as subcommunityInvites from "../subcommunityInvites.js";
import type * as subcommunityTV from "../subcommunityTV.js";
import type * as subscriptions from "../subscriptions.js";
import type * as systemErrors from "../systemErrors.js";
import type * as traderVerification from "../traderVerification.js";
import type * as userPreferences from "../userPreferences.js";
import type * as videos from "../videos.js";
import type * as webhooks from "../webhooks.js";
import type * as whatsappCron from "../whatsappCron.js";
import type * as whatsappNotifications from "../whatsappNotifications.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  adAuction: typeof adAuction;
  adAuctions: typeof adAuctions;
  adTargeting: typeof adTargeting;
  adminFindings: typeof adminFindings;
  ads: typeof ads;
  aiAgent: typeof aiAgent;
  analytics: typeof analytics;
  apps: typeof apps;
  auditUtils: typeof auditUtils;
  auroraHive: typeof auroraHive;
  auth: typeof auth;
  auth_actions: typeof auth_actions;
  backup: typeof backup;
  chat: typeof chat;
  communities: typeof communities;
  communityMonetization: typeof communityMonetization;
  communityPlans: typeof communityPlans;
  competitions: typeof competitions;
  config: typeof config;
  creatorDashboard: typeof creatorDashboard;
  crons: typeof crons;
  dailyPolls: typeof dailyPolls;
  dataExport: typeof dataExport;
  files: typeof files;
  gamification: typeof gamification;
  gaming: typeof gaming;
  importSnapshot: typeof importSnapshot;
  "instagram/accounts": typeof instagram_accounts;
  "instagram/analytics": typeof instagram_analytics;
  "instagram/analyticsOps": typeof instagram_analyticsOps;
  "instagram/autoReply": typeof instagram_autoReply;
  "instagram/messages": typeof instagram_messages;
  "instagram/posts": typeof instagram_posts;
  "instagram/scheduler": typeof instagram_scheduler;
  "instagram/templates": typeof instagram_templates;
  "lib/achievements": typeof lib_achievements;
  "lib/auth": typeof lib_auth;
  "lib/gamification": typeof lib_gamification;
  "lib/index": typeof lib_index;
  "lib/mercadopago": typeof lib_mercadopago;
  "lib/moderation": typeof lib_moderation;
  "lib/paymentFactory": typeof lib_paymentFactory;
  "lib/paymentProvider": typeof lib_paymentProvider;
  "lib/permissions": typeof lib_permissions;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/stripe": typeof lib_stripe;
  "lib/zenobank": typeof lib_zenobank;
  logger: typeof logger;
  "market/economicCalendar": typeof market_economicCalendar;
  "market/marketNews": typeof market_marketNews;
  mercadopagoApi: typeof mercadopagoApi;
  moderation: typeof moderation;
  notifications: typeof notifications;
  paymentOrchestrator: typeof paymentOrchestrator;
  payments: typeof payments;
  pendingOperations: typeof pendingOperations;
  platformConfig: typeof platformConfig;
  posts: typeof posts;
  products: typeof products;
  profiles: typeof profiles;
  propFirms: typeof propFirms;
  push: typeof push;
  pushActions: typeof pushActions;
  qa: typeof qa;
  "queries/instagramAccountQueries": typeof queries_instagramAccountQueries;
  recursos: typeof recursos;
  referrals: typeof referrals;
  reviews: typeof reviews;
  rewards: typeof rewards;
  savedPosts: typeof savedPosts;
  seedAdminBraiurato: typeof seedAdminBraiurato;
  seedProducts: typeof seedProducts;
  seedSignals: typeof seedSignals;
  seedSubscriptionPlans: typeof seedSubscriptionPlans;
  seed_all: typeof seed_all;
  signalNotifications: typeof signalNotifications;
  signals: typeof signals;
  socialAgents: typeof socialAgents;
  social_cron: typeof social_cron;
  stats: typeof stats;
  strategies: typeof strategies;
  subcommunities: typeof subcommunities;
  subcommunityChat: typeof subcommunityChat;
  subcommunityInvites: typeof subcommunityInvites;
  subcommunityTV: typeof subcommunityTV;
  subscriptions: typeof subscriptions;
  systemErrors: typeof systemErrors;
  traderVerification: typeof traderVerification;
  userPreferences: typeof userPreferences;
  videos: typeof videos;
  webhooks: typeof webhooks;
  whatsappCron: typeof whatsappCron;
  whatsappNotifications: typeof whatsappNotifications;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
