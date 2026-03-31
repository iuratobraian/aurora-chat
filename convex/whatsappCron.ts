import { internalAction, query, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  text?: { body: string };
}

async function sendWhatsAppMessage(to: string, message: WhatsAppMessage): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("WhatsApp credentials not configured");
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("WhatsApp API error:", error);
      return { success: false, error: error };
    }

    return { success: true };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: String(error) };
  }
}

export const checkExpiringMemberships = internalAction({
  args: {},
  handler: async () => {
    return { processed: 0, message: "Use processPendingNotifications to send" };
  },
});

export const sendDiplomaToUser = internalMutation({
  args: {
    userId: v.string(),
    courseName: v.string(),
    diplomaUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, courseName, diplomaUrl } = args;
    
    const profile = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", userId)).first();
    if (!profile || !profile.phone || !profile.whatsappOptIn) {
      return { success: false, message: "User not found or WhatsApp not enabled" };
    }

    await ctx.db.insert("pendingNotifications", {
      type: "diploma",
      phoneNumber: profile.phone,
      userId,
      userName: profile.nombre || "Usuario",
      data: { courseName, diplomaUrl },
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, message: "Queued" };
  },
});

export const notifyCourseCompletion = internalMutation({
  args: {
    userId: v.string(),
    courseName: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, courseName } = args;
    
    const profile = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", userId)).first();
    if (!profile || !profile.phone || !profile.whatsappOptIn) {
      return { success: false, message: "User not found or WhatsApp not enabled" };
    }

    await ctx.db.insert("pendingNotifications", {
      type: "course_completion",
      phoneNumber: profile.phone,
      userId,
      userName: profile.nombre || "Usuario",
      data: { courseName },
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, message: "Queued" };
  },
});

export const queueCustomNotification = internalMutation({
  args: {
    phoneNumber: v.string(),
    userName: v.string(),
    message: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { phoneNumber, userName, message, type } = args;
    
    await ctx.db.insert("pendingNotifications", {
      type: type || "custom",
      phoneNumber,
      userId: "admin",
      userName,
      data: { message },
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, message: "Queued" };
  },
});

export const processPendingNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db.query("pendingNotifications")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .take(50);

    if (pending.length === 0) {
      return { processed: 0, sent: 0, failed: 0, message: "No pending notifications" };
    }

    let sent = 0;
    let failed = 0;

    for (const notification of pending) {
      let message: WhatsAppMessage;

      if (notification.type === "custom") {
        message = {
          messaging_product: "whatsapp",
          to: notification.phoneNumber,
          type: "text",
          text: { body: notification.data?.message || "Mensaje de TradePortal" },
        };
      } else if (notification.type === "membership_reminder") {
        message = {
          messaging_product: "whatsapp",
          to: notification.phoneNumber,
          type: "template",
          template: {
            name: "membership_reminder",
            language: { code: "es" },
            components: [{
              type: "body",
              parameters: [
                { type: "text", text: notification.userName },
                { type: "text", text: notification.data?.planName || "Plan" },
                { type: "text", text: String(notification.data?.daysUntilExpiry || 7) },
              ],
            }],
          },
        };
      } else if (notification.type === "course_completion") {
        message = {
          messaging_product: "whatsapp",
          to: notification.phoneNumber,
          type: "template",
          template: {
            name: "course_completion",
            language: { code: "es" },
            components: [{
              type: "body",
              parameters: [
                { type: "text", text: notification.userName },
                { type: "text", text: notification.data?.courseName || "Curso" },
              ],
            }],
          },
        };
      } else if (notification.type === "diploma") {
        message = {
          messaging_product: "whatsapp",
          to: notification.phoneNumber,
          type: "template",
          template: {
            name: "diploma_notification",
            language: { code: "es" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: notification.userName },
                  { type: "text", text: notification.data?.courseName || "Curso" },
                ],
              },
            ],
          },
        };
      } else {
        message = {
          messaging_product: "whatsapp",
          to: notification.phoneNumber,
          type: "text",
          text: { body: `Notificación de TradePortal: ${notification.type}` },
        };
      }

      const result = await sendWhatsAppMessage(notification.phoneNumber, message);

      if (result.success) {
        await ctx.db.patch(notification._id, { status: "sent", sentAt: Date.now() });
        sent++;
      } else {
        await ctx.db.patch(notification._id, { status: "failed", errorAt: Date.now() });
        failed++;
      }
    }

    return { processed: pending.length, sent, failed, message: `Processed ${pending.length} notifications` };
  },
});

export const getPendingNotifications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pendingNotifications")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .order("desc")
      .take(100);
  },
});

export const getSentNotifications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pendingNotifications")
      .withIndex("by_status", q => q.eq("status", "sent"))
      .order("desc")
      .take(100);
  },
});

export const getFailedNotifications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pendingNotifications")
      .withIndex("by_status", q => q.eq("status", "failed"))
      .order("desc")
      .take(100);
  },
});

export const getNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("pendingNotifications").collect();
    const pending = all.filter(n => n.status === "pending").length;
    const sent = all.filter(n => n.status === "sent").length;
    const failed = all.filter(n => n.status === "failed").length;
    return { pending, sent, failed, total: all.length };
  },
});

export const getAllNotifications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pendingNotifications")
      .order("desc")
      .take(200);
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("pendingNotifications") },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden eliminar notificaciones");

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const retryFailedNotification = mutation({
  args: { id: v.id("pendingNotifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
    
    if (!profile || (profile.role || 0) < 4) {
      throw new Error("No tienes permisos para reintentar notificaciones");
    }

    await ctx.db.patch(args.id, { status: "pending" });
    return { success: true };
  },
});

export const deleteNotificationInternal = internalMutation({
  args: { id: v.id("pendingNotifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const retryFailedNotificationInternal = internalMutation({
  args: { id: v.id("pendingNotifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "pending" });
    return { success: true };
  },
});

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

export const queueCustomNotificationPublic = mutation({
  args: {
    phoneNumber: v.string(),
    userName: v.string(),
    message: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden enviar notificaciones");
    
    const { phoneNumber, userName, message, type } = args;
    
    await ctx.db.insert("pendingNotifications", {
      type: type || "custom",
      phoneNumber,
      userId: (await ctx.auth.getUserIdentity())?.subject || "admin",
      userName,
      data: { message },
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, message: "Notificación encolada" };
  },
});

export const processPendingNotificationsPublic = mutation({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden procesar notificaciones");
    
    const pending = await ctx.db
      .query("pendingNotifications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    let processed = 0;
    let failed = 0;

    for (const notif of pending) {
      try {
        const result = await sendWhatsAppMessage(notif.phoneNumber, {
          messaging_product: "whatsapp",
          to: notif.phoneNumber,
          type: "text",
          text: { body: notif.data?.message || "Notificación" }
        });

        if (result.success) {
          await ctx.db.patch(notif._id, { status: "sent", sentAt: Date.now() });
          processed++;
        } else {
          await ctx.db.patch(notif._id, { status: "failed", errorAt: Date.now() });
          failed++;
        }
      } catch {
        await ctx.db.patch(notif._id, { status: "failed", errorAt: Date.now() });
        failed++;
      }
    }

    return { processed, failed };
  },
});
