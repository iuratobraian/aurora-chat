import Stripe from 'stripe';

// Lazy initialization to avoid module-level throw during Convex bundling
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  }
});

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
  billingCycle: 'monthly' | 'yearly';
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const { priceId, userId, userEmail, successUrl, cancelUrl, billingCycle, metadata } = params;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      billingCycle,
      ...metadata,
    },
    subscription_data: {
      metadata: {
        userId,
        billingCycle,
      },
    },
  };

  if (userEmail) {
    sessionParams.customer_email = userEmail;
  }

  return await stripe.checkout.sessions.create(sessionParams);
}

export interface CreateCreatorCheckoutParams {
  userId: string;
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
  billingCycle: 'monthly' | 'yearly';
}

export async function createCreatorCheckoutSession(params: CreateCreatorCheckoutParams): Promise<Stripe.Checkout.Session> {
  const creatorPriceId = process.env.STRIPE_CREATOR_PRICE_ID_MONTHLY;
  
  if (!creatorPriceId) {
    throw new Error('STRIPE_CREATOR_PRICE_ID_MONTHLY environment variable is not set');
  }

  const priceId = params.billingCycle === 'yearly'
    ? process.env.STRIPE_CREATOR_PRICE_ID_YEARLY || creatorPriceId
    : creatorPriceId;

  return createCheckoutSession({
    priceId,
    userId: params.userId,
    userEmail: params.userEmail,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    billingCycle: params.billingCycle,
    metadata: {
      type: 'creator',
    },
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = false
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export const PRICE_IDS = {
  FREE: process.env.STRIPE_PRICE_ID_FREE,
  PRO_MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
  PRO_YEARLY: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  ELITE_MONTHLY: process.env.STRIPE_PRICE_ID_ELITE_MONTHLY,
  ELITE_YEARLY: process.env.STRIPE_PRICE_ID_ELITE_YEARLY,
  CREATOR_MONTHLY: process.env.STRIPE_CREATOR_PRICE_ID_MONTHLY,
  CREATOR_YEARLY: process.env.STRIPE_CREATOR_PRICE_ID_YEARLY,
} as const;

export type PlanType = 'free' | 'pro' | 'elite' | 'creator';

export function getPriceIdForPlan(plan: PlanType, billingCycle: 'monthly' | 'yearly'): string | undefined {
  switch (plan) {
    case 'free':
      return PRICE_IDS.FREE;
    case 'pro':
      return billingCycle === 'monthly' ? PRICE_IDS.PRO_MONTHLY : PRICE_IDS.PRO_YEARLY;
    case 'elite':
      return billingCycle === 'monthly' ? PRICE_IDS.ELITE_MONTHLY : PRICE_IDS.ELITE_YEARLY;
    case 'creator':
      return billingCycle === 'monthly' ? PRICE_IDS.CREATOR_MONTHLY : PRICE_IDS.CREATOR_YEARLY;
  }
}
