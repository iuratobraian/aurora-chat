import { action } from "./_generated/server";
import { v } from "convex/values";
import { stripe } from "./lib/stripe";
import logger from "./logger";

const roleMap: Record<string, number> = {
  'pro': 1,
  'elite': 2,
  'creator': 3
};

async function updateUserSubscription(ctx: any, userId: string, plan: string, active: boolean) {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (profile) {
    await ctx.db.patch(profile._id, {
      role: active ? (roleMap[plan] || profile.role || 0) : 0,
      esPro: active && (plan === 'pro' || plan === 'elite' || plan === 'creator'),
      rol: active ? plan : 'free'
    });
  }
}

async function createSubscriptionRecord(ctx: any, subscription: any, userId: string, plan: string) {
  const existing = await ctx.db
    .query("stripeSubscriptions")
    .withIndex("by_subscriptionId", (q: any) => q.eq("subscriptionId", subscription.id))
    .first();

  if (existing) return;

  const priceId = subscription.items?.data?.[0]?.price?.id;
  const billingCycle = subscription.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';

  await ctx.db.insert("stripeSubscriptions", {
    userId,
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    priceId: priceId || "",
    plan,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    createdAt: subscription.created,
    updatedAt: Date.now(),
    metadata: { billingCycle }
  });
}

async function updateSubscriptionRecord(ctx: any, subscription: any) {
  const existing = await ctx.db
    .query("stripeSubscriptions")
    .withIndex("by_subscriptionId", (q: any) => q.eq("subscriptionId", subscription.id))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: Date.now()
    });
  }
}

async function deleteSubscriptionRecord(ctx: any, subscriptionId: string) {
  const existing = await ctx.db
    .query("stripeSubscriptions")
    .withIndex("by_subscriptionId", (q: any) => q.eq("subscriptionId", subscriptionId))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      status: 'canceled',
      updatedAt: Date.now()
    });
  }
}

async function sendNotification(ctx: any, userId: string, title: string, body: string, type: string = 'system') {
  await ctx.db.insert("notifications", {
    userId,
    type: type as any,
    title,
    body,
    read: false,
    createdAt: Date.now()
  });
}

async function createAuditLog(ctx: any, userId: string, action: string, details?: any) {
  await ctx.db.insert("auditLogs", {
    userId,
    action: action as any,
    details,
    timestamp: Date.now()
  });
}

const handleCheckoutComplete = async (ctx: any, session: any) => {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as string;
  if (!userId || !plan) return;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) return;

  if (session.customer) {
    try {
      const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
      if (customers.data.length === 0) {
        await stripe.customers.update(session.customer, {
          metadata: { userId, plan }
        });
      }
    } catch (e) {
      logger.error('Error updating customer metadata:', e);
    }
  }

  await updateUserSubscription(ctx, userId, plan, true);

  if (session.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await createSubscriptionRecord(ctx, subscription, userId, plan);
    } catch (e) {
      logger.error('Error retrieving subscription:', e);
    }
  }

  await createAuditLog(ctx, userId, 'payment_completed', {
    plan,
    sessionId: session.id,
    customerId: session.customer
  });

  await sendNotification(
    ctx,
    userId,
    `¡Bienvenido a ${plan.toUpperCase()}! 🎉`,
    "Tu suscripción ha sido activada exitosamente. ¡Disfruta todas las funcionalidades premium!"
  );
};

const handleSubscriptionUpdated = async (ctx: any, subscription: any) => {
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan || 'pro';
  if (!userId) return;

  const existing = await ctx.db
    .query("stripeSubscriptions")
    .withIndex("by_subscriptionId", (q: any) => q.eq("subscriptionId", subscription.id))
    .first();

  const status = subscription.status;

  if (status === 'active' || status === 'trialing') {
    await updateUserSubscription(ctx, userId, plan, true);
    
    if (existing) {
      await updateSubscriptionRecord(ctx, subscription);
    } else {
      await createSubscriptionRecord(ctx, subscription, userId, plan);
    }

    await sendNotification(
      ctx,
      userId,
      'Suscripción activada',
      `Tu plan ${plan.toUpperCase()} está activo. ¡Gracias por tu preferencia!`
    );
  } else if (status === 'past_due') {
    await ctx.db.patch(existing?._id || '', {
      status: 'past_due',
      updatedAt: Date.now()
    });

    await sendNotification(
      ctx,
      userId,
      '⚠️ Pago pendiente',
      'Tu pago está pendiente. Por favor actualiza tu método de pago para evitar la cancelación.'
    );
  } else if (status === 'canceled') {
    await updateUserSubscription(ctx, userId, plan, false);
    await deleteSubscriptionRecord(ctx, subscription.id);

    await createAuditLog(ctx, userId, 'subscription_change', {
      action: 'canceled',
      plan,
      subscriptionId: subscription.id
    });
  } else if (status === 'unpaid') {
    await updateUserSubscription(ctx, userId, plan, false);

    await sendNotification(
      ctx,
      userId,
      '⚠️ Suscripción pausada',
      'Tu suscripción ha sido pausada por falta de pago. Actualiza tu método de pago.'
    );
  }
};

const handleSubscriptionDeleted = async (ctx: any, subscription: any) => {
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan || 'free';

  if (userId) {
    await updateUserSubscription(ctx, userId, plan, false);
  }

  await deleteSubscriptionRecord(ctx, subscription.id);

  if (userId) {
    await sendNotification(
      ctx,
      userId,
      'Suscripción cancelada',
      'Tu suscripción ha sido cancelada. Puedes suscribirte nuevamente cuando lo desees.'
    );

    await createAuditLog(ctx, userId, 'subscription_change', {
      action: 'deleted',
      plan,
      subscriptionId: subscription.id
    });
  }
};

const handleInvoicePaymentSucceeded = async (ctx: any, invoice: any) => {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const userId = invoice.customer_email;
  if (!userId) return;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_email", (q: any) => q.eq("email", userId))
    .first();

  if (profile) {
    await createAuditLog(ctx, profile.userId, 'payment_completed', {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency
    });
  }
};

const handleInvoicePaymentFailed = async (ctx: any, invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  if (!subscriptionId) return;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_email", (q: any) => q.eq("email", invoice.customer_email || ""))
    .first();

  if (profile) {
    await ctx.db.insert("notifications", {
      userId: profile.userId,
      type: "system",
      title: "⚠️ Pago fallido",
      body: "Tu pago no pudo ser procesado. Por favor actualiza tu método de pago para evitar la cancelación de tu suscripción.",
      read: false,
      createdAt: Date.now()
    });

    await createAuditLog(ctx, profile.userId, 'payment_failed', {
      invoiceId: invoice.id,
      attemptCount: invoice.attempt_count
    });
  }
};

const handleCustomerSubscriptionCreated = async (ctx: any, subscription: any) => {
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan || 'pro';
  
  if (userId) {
    await createSubscriptionRecord(ctx, subscription, userId, plan);
  }
};

export const handleWebhook = action({
  args: {
    signature: v.string(),
    payload: v.bytes()
  },
  handler: async (ctx, args) => {
    const event = stripe.webhooks.constructEvent(
      Buffer.from(args.payload),
      args.signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );



    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(ctx, event.data.object);
        break;

      case 'customer.subscription.created':
        await handleCustomerSubscriptionCreated(ctx, event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(ctx, event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(ctx, event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(ctx, event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(ctx, event.data.object);
        break;

      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }

    return { received: true, type: event.type };
  }
});

export const createWebhookEndpoint = action({
  args: {},
  handler: async () => {
    const webhookUrl = process.env.STRIPE_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('STRIPE_WEBHOOK_URL environment variable is not set');
    }

    try {
      const existingEndpoints = await stripe.webhookEndpoints.list({ limit: 100 });
      const existing = existingEndpoints.data.find(e => e.url === webhookUrl);
      
      if (existing) {
        return {
          success: true,
          endpointId: existing.id,
          message: 'Webhook endpoint already exists'
        };
      }

      const endpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [
          'checkout.session.completed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed'
        ],
        description: 'TradePortal Stripe Webhook'
      });

      return {
        success: true,
        endpointId: endpoint.id,
        secret: endpoint.secret,
        message: 'Webhook endpoint created successfully'
      };
    } catch (error: any) {
      logger.error('Error creating webhook endpoint:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});
