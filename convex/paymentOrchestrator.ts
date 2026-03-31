import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT,
  mercadopagoProvider,
  resolveMercadoPagoSubscriptionAmount,
} from "./lib/mercadopago";
import { zenobankProvider } from "./lib/zenobank";

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

export const createMercadoPagoPreference = action({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    plan: v.optional(v.string()),
    courseId: v.optional(v.string()),
    paymentType: v.optional(v.string()), // credits, subscription, community
    communityId: v.optional(v.string()),
    billingCycle: v.optional(v.string()), // monthly, quarterly, yearly
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[MercadoPagoAction] Creating preference for user:", args.userId, "amount:", args.amount, "type:", args.paymentType);
    
    try {
      const { 
        userId, 
        amount, 
        description, 
        plan, 
        courseId, 
        paymentType, 
        communityId, 
        billingCycle, 
        email 
      } = args;
      
      const type = paymentType || 'credits';
      let externalRef = `${userId}_${type}_${Date.now()}`;
      let finalAmount = Math.max(amount, MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT);

      console.log("[MercadoPagoAction] Resolved type:", type, "finalAmount:", finalAmount);

      if (type === 'subscription') {
        const subscriptionPlan = plan || 'pro';
        const resolvedAmount = resolveMercadoPagoSubscriptionAmount(subscriptionPlan, amount);
        
        console.log("[MercadoPagoAction] Subscription plan:", subscriptionPlan, "resolvedAmount:", resolvedAmount);
        
        if (!resolvedAmount) {
            throw new Error(`Monto inválido para suscripción. Mínimo: $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}`);
        }

        finalAmount = resolvedAmount;
        
        try {
          const subscription = await mercadopagoProvider.createSubscription({
            plan: subscriptionPlan,
            payer_email: email || '',
            userId,
            amount: finalAmount,
            description,
            billingCycle: (billingCycle || 'monthly') as any
          });

          if (subscription.success) {
            console.log("[MercadoPagoAction] Subscription success:", subscription.subscriptionId);
            return {
              init_point: subscription.init_point,
              subscriptionId: subscription.subscriptionId,
              type: 'subscription'
            };
          }
           console.warn("[MercadoPagoAction] Subscription provider failed, falling back to preference:", subscription.error);
        } catch (subErr) {
          console.error("[MercadoPagoAction] Subscrption error:", subErr);
          // Fallback to preference if it's not a hard error
        }
      }

      if (type === 'subscription' && plan) {
          externalRef = `${userId}_subscription_${plan}_${billingCycle || 'monthly'}_${Date.now()}`;
      } else if (type === 'community' && communityId) {
          externalRef = `${userId}_community_${communityId}_${Date.now()}`;
      } else if (type === 'course' && courseId) {
          externalRef = `${userId}_course_${courseId}_${Date.now()}`;
      }

      console.log("[MercadoPagoAction] Creating preference with Ref:", externalRef);

      const preference = await mercadopagoProvider.createPreference({
        amount: finalAmount,
        description,
        externalReference: externalRef,
        userId,
        plan,
        courseId,
      });

      console.log("[MercadoPagoAction] Preference CREATED:", preference.id);
      
      // Persistir registro de pago pendiente
      await ctx.runMutation(internal.paymentOrchestrator.savePaymentRecord, {
        userId,
        provider: "mercadopago",
        amount: finalAmount,
        currency: "ARS",
        status: "pending",
        externalReference: String(preference.id),
        description,
      });

      return { 
        init_point: preference.init_point, 
        preferenceId: preference.id 
      };
    } catch (err: any) {
      console.error("MERCADOPAGO ORCHESTRATOR ERROR:", err);
      throw new Error(`Checkout failed: ${err.message || String(err)}`);
    }
  },
});

export const savePaymentRecord = internalMutation({
  args: {
    userId: v.string(),
    provider: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    externalReference: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      userId: args.userId,
      provider: args.provider as any,
      amount: args.amount,
      currency: args.currency,
      status: args.status as any,
      externalReference: args.externalReference,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

export const createZenobankPayment = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
    email: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, amount, currency, email, description } = args;

    const result = await zenobankProvider.processPayment({
      amount,
      currency,
      email,
      userId,
      metadata: { description },
    });

    if (result.success && result.transactionId) {
      await ctx.db.insert("payments", {
        userId,
        provider: "zenobank",
        amount,
        currency,
        status: "pending",
        externalReference: result.transactionId,
        description: description || "Zenobank Payment",
        createdAt: Date.now(),
      });
    }

    return result;
  },
});

export const getUserPayments = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) return [];
    }

    const { userId } = args;

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return payments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },
});

export const getPaymentById = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) return null;
    
    if (payment.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) return null;
    }
    
    return payment;
  },
});

export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden actualizar el estado de pagos");
    
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.number(),
    esPro: v.boolean(),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden modificar roles de usuario");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        role: args.role,
        esPro: args.esPro,
      });
    }
  },
});

export const manualApprovePayment = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden aprobar pagos manualmente");
    
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Pago no encontrado");

    await ctx.db.patch(args.paymentId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        esPro: true,
        role: 2,
      });
    }

    return { success: true };
  },
});
