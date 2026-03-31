import logger from "../logger";

export const MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT = 5;
export const MERCADOPAGO_SUBSCRIPTION_PRICES = {
  basic: 9.99,
  pro: 29.99,
  vip: 99.99,
} as const;

export type MercadoPagoSubscriptionPlan = keyof typeof MERCADOPAGO_SUBSCRIPTION_PRICES;

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const MP_PLAN_BASIC = process.env.MP_PLAN_BASIC || '';
const MP_PLAN_PRO = process.env.MP_PLAN_PRO || '';
const MP_PLAN_VIP = process.env.MP_PLAN_VIP || '';
const VITE_APP_URL = process.env.VITE_APP_URL?.includes('localhost') 
  ? 'https://tradeportal-2025-platinum.vercel.app' 
  : (process.env.VITE_APP_URL || 'https://tradeportal-2025-platinum.vercel.app');
const VITE_MERCADOPAGO_PUBLIC_KEY = process.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';

const API_BASE = 'https://api.mercadopago.com';

export function isBelowMercadoPagoMinimum(amount: number): boolean {
  return !Number.isFinite(amount) || amount < MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT;
}

export function resolveMercadoPagoSubscriptionAmount(
  plan?: string,
  amount?: number
): number | null {
  if (Number.isFinite(amount) && amount !== undefined && amount >= MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT) {
    return amount;
  }

  if (plan && plan in MERCADOPAGO_SUBSCRIPTION_PRICES) {
    return MERCADOPAGO_SUBSCRIPTION_PRICES[plan as MercadoPagoSubscriptionPlan];
  }

  return null;
}

export interface MercadoPagoPaymentData {
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface MercadoPagoSubscriptionData {
  plan_id?: string;
  payer_email: string;
  userId: string;
  plan: string;
  amount?: number;
  description?: string;
  billingCycle?: any;
}

export interface MercadoPagoOrderData {
  items: Array<{
    sku_number?: string;
    category_id?: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
  external_reference?: string;
  notification_url?: string;
  metadata?: Record<string, any>;
}

function isConfigured(): boolean {
  return !!MERCADOPAGO_ACCESS_TOKEN;
}

async function mpFetch(endpoint: string, body: any): Promise<any> {
  const token = MERCADOPAGO_ACCESS_TOKEN;
  console.log('[MercadoPago] Calling endpoint:', endpoint);
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('[MercadoPago] Response status:', response.status);
    console.log('[MercadoPago] Response:', JSON.stringify(data).substring(0, 500));
    
    if (!response.ok) {
      console.error('[MercadoPago] Error response:', data);
      throw new Error(data.message || data.error || `API error: ${response.status}`);
    }
    
    return data;
  } catch (err) {
    console.error('[MercadoPago] Fetch error:', err);
    throw err;
  }
}

export class MercadoPagoProvider {
  async processPayment(data: MercadoPagoPaymentData): Promise<{
    success: boolean;
    transactionId?: string;
    status?: string;
    error?: string;
  }> {
    if (!isConfigured()) {
      return {
        success: false,
        error: 'MercadoPago no configurado. Define MERCADOPAGO_ACCESS_TOKEN',
      };
    }

    try {
      const result = await mpFetch('/v1/payments', {
        transaction_amount: data.transactionAmount,
        description: data.description,
        payment_method_id: data.paymentMethodId,
        payer: {
          email: data.payer.email,
          identification: data.payer.identification,
        },
        metadata: data.metadata,
        binary_mode: true,
      });

      return {
        success: result.status === 'approved',
        transactionId: result.id?.toString(),
        status: result.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'MercadoPago API error',
      };
    }
  }

  async createPreference(data: {
    amount: number;
    description: string;
    externalReference: string;
    userId: string;
    plan?: string;
    courseId?: string;
  }): Promise<{ init_point: string; id: string }> {
    if (!isConfigured()) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    if (isBelowMercadoPagoMinimum(data.amount)) {
      throw new Error(`MercadoPago requiere un mínimo de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`);
    }

    try {
      const result = await mpFetch('/checkout/preferences', {
        items: [
          {
            title: data.description,
            unit_price: data.amount,
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        external_reference: data.externalReference,
        metadata: {
          userId: data.userId,
          plan: data.plan,
          courseId: data.courseId,
        },
        back_urls: {
          success: `${VITE_APP_URL}/subscription/success`,
          failure: `${VITE_APP_URL}/subscription/cancel`,
          pending: `${VITE_APP_URL}/subscription/pending`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 12,
        },
      });

      console.log('[MercadoPago] Preference created:', result.id);
      
      return {
        init_point: result.init_point,
        id: result.id,
      };
    } catch (error: any) {
      console.error('[MercadoPago] createPreference error:', error);
      logger.error('MercadoPago createPreference error:', error);
      throw new Error('MercadoPago API error: ' + error.message);
    }
  }

  async createOrder(data: MercadoPagoOrderData): Promise<{
    success: boolean;
    orderId?: string;
    initPoint?: string;
    error?: string;
  }> {
    if (!isConfigured()) {
      return {
        success: false,
        error: 'MercadoPago not configured',
      };
    }

    try {
      const result = await mpFetch('/checkout/orders', {
        items: data.items,
        external_reference: data.external_reference,
        notification_url: data.notification_url || `${VITE_APP_URL}/api/webhooks/mercadopago`,
        metadata: data.metadata,
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 12,
        },
        back_urls: {
          success: `${VITE_APP_URL}/subscription/success`,
          failure: `${VITE_APP_URL}/subscription/cancel`,
          pending: `${VITE_APP_URL}/subscription/pending`,
        },
        auto_return: 'approved',
      });

      return {
        success: true,
        orderId: result.id,
        initPoint: result.init_point,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create order',
      };
    }
  }

  async getPayment(paymentId: string): Promise<{
    success: boolean;
    status?: string;
    amount?: number;
    transaction_amount?: number;
    external_reference?: string;
    error?: string;
  }> {
    if (!isConfigured()) {
      return { success: false, error: 'MercadoPago not configured' };
    }

    try {
      const response = await fetch(
        `${API_BASE}/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          status: result.status,
          amount: result.transaction_amount,
          transaction_amount: result.transaction_amount,
          external_reference: result.external_reference,
        };
      }

      return {
        success: false,
        error: result.message || 'Failed to get payment',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'MercadoPago API error',
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{
    success: boolean;
    status?: string;
    amount?: number;
    error?: string;
  }> {
    if (!isConfigured()) {
      return { success: false, error: 'MercadoPago not configured' };
    }

    try {
      const response = await fetch(
        `${API_BASE}/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          status: result.status,
          amount: result.transaction_amount,
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to get payment status',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'MercadoPago API error',
      };
    }
  }

    async getPreapproval(preapprovalId: string): Promise<any> {
    if (!isConfigured()) return null;
    try {
      return await mpFetch(`/preapproval/${preapprovalId}`, {});
    } catch (error: any) {
      console.error("[MercadoPago] getPreapproval error:", error);
      return null;
    }
  }

  async getOrderStatus(orderId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    if (!isConfigured()) {
      return { success: false, error: 'MercadoPago not configured' };
    }

    try {
      const response = await fetch(
        `${API_BASE}/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          status: result.status,
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to get order status',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'MercadoPago API error',
      };
    }
  }

  async createSubscription(data: MercadoPagoSubscriptionData & { 
    amount?: number, 
    description?: string,
    billingCycle?: 'monthly' | 'yearly' | 'month' | 'year'
    }): Promise<{
    success: boolean;
    subscriptionId?: string;
    init_point?: string;
    error?: string;
  }> {
    if (!isConfigured()) {
      return {
        success: false,
        error: 'MercadoPago not configured',
      };
    }

    const planIds: Record<string, string> = {
      basic: MP_PLAN_BASIC,
      pro: MP_PLAN_PRO,
      vip: MP_PLAN_VIP,
    };

    let planId = data.plan_id || planIds[data.plan];
    const resolvedAmount = resolveMercadoPagoSubscriptionAmount(data.plan, data.amount);
    const amount = resolvedAmount ?? data.amount ?? 0;
    
    // If no planId, we must use auto_recurring
    const body: any = {
      payer_email: data.payer_email,
      external_reference: data.userId,
      back_url: `${VITE_APP_URL}/subscription/success`,
      reason: data.description || `Suscripción TradePortal - ${data.plan}`,
    };

    if (planId) {
      body.preapproval_plan_id = planId;
    } else if (amount >= MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT) {
      // Direct recurring without plan
      const interval = (data.billingCycle === 'yearly' || data.billingCycle === 'year') ? 12 : 1;
      body.auto_recurring = {
        frequency: interval,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'ARS',
      };
    } else {
      return {
        success: false,
        error: `No se pudo determinar el precio para ${data.plan}. MercadoPago requiere un mínimo de $${MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT}.`,
      };
    }

    try {
      console.log('[MercadoPago] Creating preapproval:', body);
      const result = await mpFetch('/preapproval', body);

      return {
        success: true,
        subscriptionId: result.id,
        init_point: result.init_point,
      };
    } catch (error: any) {
      console.error('[MercadoPago] createSubscription error:', error);
      return {
        success: false,
        error: error.message || 'MercadoPago API error',
      };
    }
  }

  async refundPayment(paymentId: string): Promise<{ success: boolean; error?: string }> {
    if (!isConfigured()) {
      return { success: false, error: 'MercadoPago not configured' };
    }

    try {
      await mpFetch(`/v1/payments/${paymentId}/refunds`, {});
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }

  async getPublicKey(): Promise<string> {
    return VITE_MERCADOPAGO_PUBLIC_KEY;
  }

  generateCheckoutUrl(amount: number, description: string): Promise<string> {
    return this.createPreference({
      amount,
      description,
      externalReference: `checkout_${Date.now()}`,
      userId: '',
    }).then((result) => result.init_point);
  }
}

export const mercadopagoProvider = new MercadoPagoProvider();
