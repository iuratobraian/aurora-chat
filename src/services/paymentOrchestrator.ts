export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status?: string;
  paymentUrl?: string;
  error?: string;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface PaymentProvider {
  processPayment(amount: number, currency: string, metadata: any): Promise<PaymentResult>;
  createSubscription(plan: Plan): Promise<SubscriptionResult>;
  generateCheckoutUrl(amount: number, description: string): Promise<string>;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
}

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  email: string;
  metadata?: Record<string, any>;
  plan?: string;
  courseId?: string;
}

export interface CourseData {
  courseId: string;
  courseName: string;
  amount: number;
  userId: string;
  email: string;
}

type PaymentMethod = 'mercadopago' | 'zenobank';

export class MercadoPagoProvider implements PaymentProvider {
  async processPayment(amount: number, currency: string, metadata: any): Promise<PaymentResult> {
    const { mercadopagoProvider } = await import('../../convex/lib/mercadopago');
    
    const result = await mercadopagoProvider.processPayment({
      transactionAmount: amount,
      description: metadata.description || 'TradeShare Payment',
      paymentMethodId: metadata.paymentMethodId,
      payer: {
        email: metadata.email,
        identification: metadata.identification,
      },
      metadata,
    });

    return {
      success: result.success,
      transactionId: result.transactionId,
      status: result.status,
      error: result.error,
    };
  }

  async createSubscription(plan: Plan): Promise<SubscriptionResult> {
    const { mercadopagoProvider } = await import('../../convex/lib/mercadopago');
    
    const mpPlanIds: Record<string, string> = {
      basic: process.env.MP_PLAN_BASIC || '',
      pro: process.env.MP_PLAN_PRO || '',
      vip: process.env.MP_PLAN_VIP || '',
    };

    return await mercadopagoProvider.createSubscription({
      plan_id: mpPlanIds[plan.id] || '',
      payer_email: plan.features[0] || '',
      userId: plan.features[1] || '',
      plan: plan.id,
      amount: plan.price,
      description: plan.name,
      billingCycle: plan.interval,
    });
  }

  async generateCheckoutUrl(amount: number, description: string): Promise<string> {
    const { mercadopagoProvider } = await import('../../convex/lib/mercadopago');
    
    const preference = await mercadopagoProvider.createPreference({
      amount,
      description,
      externalReference: `${Date.now()}`,
      userId: '',
    });

    return preference.init_point;
  }
}

export class ZenobankProvider implements PaymentProvider {
  async processPayment(amount: number, currency: string, metadata: any): Promise<PaymentResult> {
    const { zenobankProvider } = await import('../../convex/lib/zenobank');
    
    const result = await zenobankProvider.processPayment({
      amount,
      currency,
      email: metadata.email,
      userId: metadata.userId,
      metadata,
    });

    return {
      success: result.success,
      transactionId: result.transactionId,
      status: result.status,
      paymentUrl: result.paymentUrl,
      error: result.error,
    };
  }

  async createSubscription(plan: Plan): Promise<SubscriptionResult> {
    const { zenobankProvider } = await import('../../convex/lib/zenobank');
    
    return await zenobankProvider.createSubscription({
      plan: plan.id,
      email: plan.features[0] || '',
      userId: plan.features[1] || '',
      interval: plan.interval,
    });
  }

  async generateCheckoutUrl(amount: number, description: string): Promise<string> {
    const { zenobankProvider } = await import('../../convex/lib/zenobank');
    
    const result = await zenobankProvider.processPayment({
      amount,
      currency: 'USDT',
      email: '',
      userId: '',
      metadata: { description },
    });

    return result.paymentUrl || '';
  }
}

export class PaymentOrchestrator {
  private providers: Map<PaymentMethod, PaymentProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set('mercadopago', new MercadoPagoProvider());
    this.providers.set('zenobank', new ZenobankProvider());
  }

  async processPayment(method: PaymentMethod, data: PaymentData): Promise<PaymentResult> {
    const provider = this.providers.get(method);
    
    if (!provider) {
      return {
        success: false,
        error: `Payment method ${method} not supported`,
      };
    }

    try {
      return await provider.processPayment(data.amount, data.currency, {
        ...data.metadata,
        userId: data.userId,
        email: data.email,
        description: data.description,
        plan: data.plan,
        courseId: data.courseId,
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }

  async createSubscription(method: PaymentMethod, plan: Plan): Promise<SubscriptionResult> {
    const provider = this.providers.get(method);
    
    if (!provider) {
      return {
        success: false,
        error: `Payment method ${method} not supported`,
      };
    }

    try {
      return await provider.createSubscription(plan);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Subscription creation failed',
      };
    }
  }

  async generateCheckoutUrl(method: PaymentMethod, amount: number, description: string): Promise<string> {
    const provider = this.providers.get(method);
    
    if (!provider) {
      throw new Error(`Payment method ${method} not supported`);
    }

    return await provider.generateCheckoutUrl(amount, description);
  }

  getAvailableMethods(): PaymentMethod[] {
    return Array.from(this.providers.keys());
  }

  getProvider(method: PaymentMethod): PaymentProvider | undefined {
    return this.providers.get(method);
  }
}

export const paymentOrchestrator = new PaymentOrchestrator();
