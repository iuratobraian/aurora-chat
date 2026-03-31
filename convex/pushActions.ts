// @ts-nocheck
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import webpush from "web-push";
import { api } from "./_generated/api";
import logger from "./logger";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:notifications@tradehub.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  notificationId?: string;
  type?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

function createPayload(notification: PushPayload): string {
  return JSON.stringify({
    title: notification.title,
    body: notification.body,
    url: notification.url || "/",
    icon: notification.icon || "/logo.png",
    badge: notification.badge || "/badge-72.png",
    tag: notification.tag || "tradehub-notification",
    notificationId: notification.notificationId,
    type: notification.type,
    requireInteraction: notification.requireInteraction || false,
    silent: notification.silent || false,
    timestamp: Date.now()
  });
}

async function sendNotificationToSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  userId: string
): Promise<{ success: boolean; error?: string; shouldDelete?: boolean }> {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
      payload
    );
    return { success: true };
  } catch (err) {
    const error = err as { statusCode?: number; message?: string };
    logger.error(`Push notification failed for user ${userId}:`, error.message);
    
    const shouldDelete = error.statusCode === 404 || error.statusCode === 410;
    return { 
      success: false, 
      error: error.message || "Unknown error",
      shouldDelete
    };
  }
}

export const sendPushNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    icon: v.optional(v.string()),
    tag: v.optional(v.string()),
    notificationId: v.optional(v.string()),
    type: v.optional(v.string()),
    requireInteraction: v.optional(v.boolean()),
    silent: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      logger.warn("VAPID keys not configured, skipping push notification");
      return { success: false, error: "VAPID keys not configured" };
    }

    const subscription = await ctx.runQuery(api.push.getPushSubscription);

    if (!subscription) {
      logger.warn(`No push subscription found for user ${args.userId}`);
      return { success: false, error: "No subscription" };
    }

    const preferences = await ctx.runQuery(api.userPreferences.getPreferences, { oderId: args.userId });
    
    if (preferences) {
      if (!preferences.pushEnabled) {
        logger.info(`Push disabled by user ${args.userId}`);
        return { success: false, error: "Push disabled by user" };
      }

      const typeMap: Record<string, keyof typeof preferences.notificationPreferences> = {
        mention: "mentions",
        like: "likes",
        comment: "comments",
        follow: "follows",
        signal: "signals",
        competition: "competitions",
        news: "news",
        achievement: "marketing",
        level_up: "marketing",
        system: "marketing",
        message: "mentions",
        moderation: "marketing",
        suspension: "marketing",
        streak: "marketing",
        puntos: "marketing",
      };

      const prefKey = typeMap[args.type || ""];
      if (prefKey && preferences.notificationPreferences[prefKey] === false) {
        logger.info(`Push type '${prefKey}' disabled by user ${args.userId}`);
        return { success: false, error: `Push type disabled by user` };
      }

      if (preferences.quietHours?.enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const { start, end } = preferences.quietHours;
        
        const inQuietHours = start > end 
          ? currentTime >= start || currentTime < end
          : currentTime >= start && currentTime < end;
        
        if (inQuietHours) {
          logger.info(`Quiet hours active for user ${args.userId}, skipping push`);
          return { success: false, error: "Quiet hours active" };
        }
      }
    }

    const payload = createPayload({
      title: args.title,
      body: args.body,
      url: args.url,
      icon: args.icon,
      tag: args.tag,
      notificationId: args.notificationId,
      type: args.type,
      requireInteraction: args.requireInteraction,
      silent: args.silent
    });

    const result = await sendNotificationToSubscription(subscription, payload, args.userId);

    if (result.shouldDelete) {
      await ctx.runMutation(api.push.deleteInvalidSubscription, { endpoint: subscription.endpoint });
    }

    return result;
  }
});

export const sendBulkPushNotification = action({
  args: {
    userIds: v.array(v.string()),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    icon: v.optional(v.string()),
    tag: v.optional(v.string()),
    type: v.optional(v.string()),
    requireInteraction: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return { success: false, total: args.userIds.length, sent: 0, errors: ["VAPID keys not configured"] };
    }

    const payload = createPayload({
      title: args.title,
      body: args.body,
      url: args.url,
      icon: args.icon,
      tag: args.tag,
      type: args.type,
      requireInteraction: args.requireInteraction,
      silent: false
    });

    const results = {
      success: true,
      total: args.userIds.length,
      sent: 0,
      failed: 0,
      deleted: 0,
      errors: [] as string[]
    };

    for (const userId of args.userIds) {
      const subscription = await ctx.runQuery(api.push.getPushSubscription, { userId });
      
      if (!subscription) {
        results.failed++;
        continue;
      }

      const result = await sendNotificationToSubscription(subscription, payload, userId);
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(`${userId}: ${result.error}`);
        }
      }

      if (result.shouldDelete) {
        await ctx.runMutation(api.push.deleteInvalidSubscription, { endpoint: subscription.endpoint });
        results.deleted++;
      }
    }

    results.success = results.failed === 0;
    return results;
  }
});

export const sendPushToAll = action({
  args: {
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    tag: v.optional(v.string()),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return { success: false, total: 0, sent: 0, errors: ["VAPID keys not configured"] };
    }

    const subscriptions = await ctx.runQuery(api.push.getAllPushSubscriptions, {});
    
    if (subscriptions.length === 0) {
      return { success: true, total: 0, sent: 0, errors: [] };
    }

    const payload = createPayload({
      title: args.title,
      body: args.body,
      url: args.url,
      tag: args.tag,
      type: args.type
    });

    const results = {
      success: true,
      total: subscriptions.length,
      sent: 0,
      failed: 0,
      deleted: 0,
      errors: [] as string[]
    };

    for (const sub of subscriptions) {
      const result = await sendNotificationToSubscription(sub, payload, sub.userId);
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(`${sub.userId}: ${result.error}`);
        }
      }

      if (result.shouldDelete) {
        await ctx.runMutation(api.push.deleteInvalidSubscription, { endpoint: sub.endpoint });
        results.deleted++;
      }
    }

    results.success = results.failed === 0;

    return results;
  }
});

export const generateVapidKeys = action({
  args: {},
  handler: async () => {
    const vapidKeys = webpush.generateVAPIDKeys();
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey
    };
  }
});
