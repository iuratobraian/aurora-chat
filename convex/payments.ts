import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { stripe, getPriceIdForPlan, PRICE_IDS } from "./lib/stripe";
import type { Doc } from "./_generated/dataModel";
import logger from "./logger";

type Profile = Doc<"profiles">;

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

const roleMap: Record<string, number> = {
  'pro': 1,
  'elite': 2,
  'creator': 3
};

export const createCheckoutSession = mutation({
  args: {
    plan: v.union(v.literal("pro"), v.literal("elite"), v.literal("creator")),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para crear sesión de pago para otro usuario");
    }

    const { plan, billingCycle, userId } = args;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Usuario no encontrado");
    }

    const priceId = getPriceIdForPlan(plan, billingCycle);

    if (!priceId) {
      logger.error(`[Payments] Price ID no configurado para plan ${plan} ${billingCycle}`);
      throw new Error(`Pago no disponible temporalmente. El plan ${plan} está en mantenimiento. Intenta más tarde o contacta a soporte.`);
    }

    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';

    const existingSubscriptions = await ctx.db
      .query("stripeSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const activeSubscription = existingSubscriptions.find(
      s => s.status === 'active' || s.status === 'trialing' || s.status === 'past_due'
    );

    let customerId: string | undefined;
    if (activeSubscription) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1
      });
      customerId = customers.data[0]?.id;
    }

    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${baseUrl}/checkout/cancel?plan=${plan}`,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          billingCycle,
        },
      },
    };

    if (profile.email) {
      sessionParams.customer_email = profile.email;
    }

    if (customerId) {
      sessionParams.customer = customerId;
      delete sessionParams.customer_email;
    }

    await ctx.db.insert("auditLogs", {
      userId,
      action: "payment_initiated",
      details: {
        plan,
        billingCycle,
        priceId
      },
      timestamp: Date.now()
    });

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { url: session.url, sessionId: session.id };
  }
});

export const createCustomerPortal = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para acceder al portal de otro usuario");
    }

    const { userId } = args;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Usuario no encontrado");
    }

    if (!profile.email) {
      throw new Error("El usuario no tiene email asociado");
    }

    const customers = await stripe.customers.list({
      email: profile.email,
      limit: 1
    });

    const customerId = customers.data[0]?.id;

    if (!customerId) {
      throw new Error("No se encontró cliente de Stripe para este usuario");
    }

    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard`,
    });

    return { url: session.url };
  }
});

export const getUserSubscription = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para ver suscripción de otro usuario");
    }

    const { userId } = args;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      return null;
    }

    return {
      role: profile.role,
      esPro: profile.esPro,
      plan: profile.role === 1 ? 'pro' : profile.role === 2 ? 'elite' : profile.role === 3 ? 'creator' : 'free'
    };
  }
});

export const getPrices = query({
  handler: async () => {
    return {
      pro: {
        monthly: PRICE_IDS.PRO_MONTHLY,
        yearly: PRICE_IDS.PRO_YEARLY
      },
      elite: {
        monthly: PRICE_IDS.ELITE_MONTHLY,
        yearly: PRICE_IDS.ELITE_YEARLY
      },
      creator: {
        monthly: PRICE_IDS.CREATOR_MONTHLY,
        yearly: PRICE_IDS.CREATOR_YEARLY
      }
    };
  }
});

export const getUserSubscriptionDetails = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para ver detalles de suscripción de otro usuario");
    }

    const { userId } = args;

    const stripeSubscriptions = await ctx.db
      .query("stripeSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (stripeSubscriptions.length === 0) {
      return null;
    }

    const latestSubscription = stripeSubscriptions.sort(
      (a, b) => b.createdAt - a.createdAt
    )[0];

    return {
      subscriptionId: latestSubscription.subscriptionId,
      plan: latestSubscription.plan,
      status: latestSubscription.status,
      currentPeriodStart: latestSubscription.currentPeriodStart,
      currentPeriodEnd: latestSubscription.currentPeriodEnd,
      cancelAtPeriodEnd: latestSubscription.cancelAtPeriodEnd,
      billingCycle: (latestSubscription.metadata as any)?.billingCycle || 'monthly'
    };
  }
});

export const verifyCheckoutSession = mutation({
  args: {
    sessionId: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);
      
      if (session.payment_status === 'paid' || session.status === 'complete') {
        return {
          success: true,
          plan: session.metadata?.plan,
          customerId: session.customer,
          subscriptionId: session.subscription,
          status: session.status
        };
      }

      return {
        success: false,
        status: session.status,
        paymentStatus: session.payment_status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
});

export const cancelSubscription = mutation({
  args: {
    userId: v.string(),
    immediate: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para cancelar suscripción de otro usuario");
    }

    const { userId, immediate = false } = args;

    const subscription = await ctx.db
      .query("stripeSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      throw new Error("No se encontró suscripción activa");
    }

    try {
      if (immediate) {
        await stripe.subscriptions.cancel(subscription.subscriptionId);
      } else {
        await stripe.subscriptions.update(subscription.subscriptionId, {
          cancel_at_period_end: true
        });
      }

      await ctx.db.patch(subscription._id, {
        cancelAtPeriodEnd: true,
        updatedAt: Date.now()
      });

      await ctx.db.insert("auditLogs", {
        userId,
        action: "subscription_change",
        details: {
          action: immediate ? 'cancel_immediate' : 'cancel_at_period_end',
          subscriptionId: subscription.subscriptionId
        },
        timestamp: Date.now()
      });

      return { success: true };
    } catch (error: any) {
      throw new Error(`Error al cancelar suscripción: ${error.message}`);
    }
  }
});

export const reactivateSubscription = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado para reactivar suscripción de otro usuario");
    }

    const { userId } = args;

    const subscription = await ctx.db
      .query("stripeSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      throw new Error("No se encontró suscripción");
    }

    try {
      await stripe.subscriptions.update(subscription.subscriptionId, {
        cancel_at_period_end: false
      });

      await ctx.db.patch(subscription._id, {
        cancelAtPeriodEnd: false,
        updatedAt: Date.now()
      });

      await ctx.db.insert("auditLogs", {
        userId,
        action: "subscription_change",
        details: {
          action: 'reactivate',
          subscriptionId: subscription.subscriptionId
        },
        timestamp: Date.now()
      });

      return { success: true };
    } catch (error: any) {
      throw new Error(`Error al reactivar suscripción: ${error.message}`);
    }
  }
});
