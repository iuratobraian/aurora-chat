import { mutation, httpAction, query } from "./_generated/server";
import { v } from "convex/values";
import {
  MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT,
  mercadopagoProvider,
  resolveMercadoPagoSubscriptionAmount,
} from "./lib/mercadopago";
import { api } from "./_generated/api";

export const getPaymentStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const allPayments = await ctx.db.query("payments").collect();
    const recentPayments = allPayments.filter(p => p.createdAt >= thirtyDaysAgo);
    
    const totalDeposits = recentPayments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
    
    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const pendingPayments = allPayments.filter(p => p.status === "pending").length;
    
    return {
      totalDeposits,
      totalWithdrawals: 0,
      activeSubscriptions: activeSubscriptions.length,
      pendingPayments,
      totalPayments: allPayments.length,
      recentPaymentsCount: recentPayments.length,
    };
  },
});

export const getRecentPayments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const payments = await ctx.db.query("payments").collect();
    return payments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

export const getRecentSubscriptions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const subscriptions = await ctx.db.query("subscriptions").collect();
    return subscriptions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

export const getCreditBalances = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const credits = await ctx.db.query("userCredits").collect();
    return credits.sort((a, b) => b.credits - a.credits).slice(0, limit);
  },
});

export const createPaymentPreference = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    plan: v.optional(v.string()),
    courseId: v.optional(v.string()),
    paymentType: v.optional(v.string()),
    communityId: v.optional(v.string()),
    billingCycle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, amount, description, plan, courseId, paymentType, communityId, billingCycle } = args;
    let checkoutAmount = Number(amount) || 0;

    const type = paymentType || "credits";
    let externalRef = `${userId}_${type}_${Date.now()}`;

    if (type === "subscription") {
      const subscriptionPlan = plan || "pro";
      const resolvedAmount = resolveMercadoPagoSubscriptionAmount(plan, checkoutAmount);
      if (!resolvedAmount) {
        throw new Error(`La suscripción requiere un monto mínimo de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT} o un plan válido.`);
      }

      checkoutAmount = resolvedAmount;
      externalRef = `${userId}_subscription_${subscriptionPlan}_${billingCycle || "monthly"}_${Date.now()}`;
      const subscription = await mercadopagoProvider.createSubscription({
        plan: subscriptionPlan,
        payer_email: "",
        userId,
        amount: checkoutAmount,
        description,
        billingCycle: (billingCycle || "monthly") as any,
      });

      if (subscription.success && subscription.init_point) {
        return { init_point: subscription.init_point, preferenceId: subscription.subscriptionId };
      }
    } else if (type === "community" && communityId) {
      externalRef = `${userId}_community_${communityId}_${Date.now()}`;
    } else if (type === "course" && courseId) {
      externalRef = `${userId}_course_${courseId}_${Date.now()}`;
    }

    if (checkoutAmount < MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT) {
      throw new Error(`El pago mínimo con MercadoPago es de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`);
    }

    const preference = await mercadopagoProvider.createPreference({
      amount: checkoutAmount,
      description,
      externalReference: externalRef,
      userId,
      plan,
      courseId,
    });

    return { init_point: preference.init_point, preferenceId: preference.id };
  },
});

export const createMercadoPagoPreference = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const { userId, amount, description, plan, courseId, paymentType, communityId, billingCycle } = body;
    let checkoutAmount = Number(amount) || 0;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Faltan parámetros requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const type = paymentType || "credits";
    let externalRef = `${userId}_${type}_${Date.now()}`;

    if (type === "subscription") {
      const subscriptionPlan = plan || "pro";
      const resolvedAmount = resolveMercadoPagoSubscriptionAmount(plan, checkoutAmount);
      if (!resolvedAmount) {
        return new Response(JSON.stringify({
          error: `La suscripción requiere un monto mínimo de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT} o un plan válido.`,
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      checkoutAmount = resolvedAmount;
      externalRef = `${userId}_subscription_${subscriptionPlan}_${billingCycle || "monthly"}_${Date.now()}`;
      const subscription = await mercadopagoProvider.createSubscription({
        plan: subscriptionPlan,
        payer_email: "",
        userId,
        amount: checkoutAmount,
        description,
        billingCycle: (billingCycle || "monthly") as any,
      });

      if (subscription.success && subscription.init_point) {
        return new Response(JSON.stringify({ init_point: subscription.init_point, preferenceId: subscription.subscriptionId }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (type === "community" && communityId) {
      externalRef = `${userId}_community_${communityId}_${Date.now()}`;
    } else if (type === "course" && courseId) {
      externalRef = `${userId}_course_${courseId}_${Date.now()}`;
    }

    if (checkoutAmount < MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT) {
      return new Response(JSON.stringify({
        error: `El pago mínimo con MercadoPago es de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`,
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const preference = await mercadopagoProvider.createPreference({
      amount: checkoutAmount,
      description,
      externalReference: externalRef,
      userId,
      plan,
      courseId,
    });

    return new Response(JSON.stringify({ init_point: preference.init_point, preferenceId: preference.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

export const processPaymentWebhook = mutation({
  args: {
    userId: v.string(),
    paymentType: v.string(),
    paymentAmount: v.number(),
    paymentId: v.string(),
    planId: v.optional(v.string()),
    billingCycle: v.optional(v.string()),
    communityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, paymentType, paymentAmount, paymentId, planId, billingCycle, communityId } = args;
    const now = Date.now();
    
    if (paymentType === "credits") {
      const existing = await ctx.db
        .query("userCredits")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          credits: existing.credits + Math.floor(paymentAmount),
          lastUpdated: now,
        });
      } else {
        await ctx.db.insert("userCredits", {
          userId,
          credits: Math.floor(paymentAmount),
          lastUpdated: now,
        });
      }

      await ctx.db.insert("creditTransactions", {
        userId,
        type: "purchase",
        amount: Math.floor(paymentAmount),
        description: `Depósito via MercadoPago - ID: ${paymentId}`,
        referenceId: String(paymentId),
        timestamp: now,
      });

      console.log("[Webhook] Credits added to user:", { userId, amount: Math.floor(paymentAmount) });
    } else if (paymentType === "subscription") {
      const plan = planId || "basic";
      const cycle = billingCycle || "monthly";

      await ctx.db.insert("subscriptions", {
        userId,
        plan: plan,
        provider: "mercadopago",
        status: "active",
        externalReference: String(paymentId),
        currentPeriodEnd: cycle === "yearly" 
          ? Date.now() + 365 * 24 * 60 * 60 * 1000 
          : Date.now() + 30 * 24 * 60 * 60 * 1000,
        createdAt: now,
        updatedAt: now,
      });

      console.log("[Webhook] Subscription created:", { userId, plan });
    } else if (paymentType === "community" && communityId) {
      const existing = await ctx.db
        .query("communityAccess")
        .withIndex("by_user_community", (q) => q.eq("userId", userId).eq("communityId", communityId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: "active",
          purchaseDate: now,
          paymentId: String(paymentId),
        });
      } else {
        await ctx.db.insert("communityAccess", {
          userId,
          communityId,
          status: "active",
          purchaseDate: now,
          paymentId: String(paymentId),
        });
      }

      console.log("[Webhook] Community access granted:", { userId, communityId });
    }
    
    return { success: true };
  },
});

export const handleMercadoPagoWebhook = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const topic = body.topic || body.type;
    const paymentId = body.resource || body.data?.id;

    console.log("[Webhook] MercadoPago notification received:", { topic, paymentId });

    if ((topic === "preapproval" || topic === "subscription") && paymentId) {
      console.log("[Webhook] Preapproval notification received:", { paymentId });
      return new Response(JSON.stringify({ received: true, type: topic }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (topic === "payment" && paymentId) {
      try {
        const paymentData = await mercadopagoProvider.getPayment(String(paymentId));
        
        if (paymentData?.status === "approved") {
          const externalRef = paymentData?.external_reference || "";
          const parts = externalRef.split("_");
          const userId = parts[0];
          const paymentType = parts[1] || "credits";
          const paymentAmount = paymentData?.transaction_amount || paymentData?.amount || 0;

          console.log("[Webhook] Processing payment:", { userId, paymentType, paymentAmount });

          if (userId) {
            await ctx.runMutation(api.mercadopagoApi.processPaymentWebhook, {
              userId,
              paymentType,
              paymentAmount,
              paymentId: String(paymentId),
              planId: parts[2],
              billingCycle: parts[3],
              communityId: parts[2],
            });
          }
        }
      } catch (paymentError: any) {
        console.error("[Webhook] Error processing payment:", paymentError);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[Webhook] Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
