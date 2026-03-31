import axios from 'axios';

const ZENOBANK_API_URL = 'https://api.zenobank.io/v1';

interface ZenobankPaymentData {
  amount: number;
  currency: string;
  email: string;
  userId: string;
  metadata?: Record<string, any>;
}

interface ZenobankSubscriptionData {
  plan: string;
  email: string;
  userId: string;
  interval: 'monthly' | 'yearly';
}

export class ZenobankProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ZENOBANK_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async processPayment(data: ZenobankPaymentData): Promise<{
    success: boolean;
    transactionId?: string;
    status?: string;
    paymentUrl?: string;
    error?: string;
  }> {
    if (!this.apiKey) {
      return { success: false, error: 'Zenobank API key not configured' };
    }

    try {
      const response = await axios.post(
        `${ZENOBANK_API_URL}/payments/create`,
        {
          amount: data.amount,
          currency: data.currency.toUpperCase(),
          email: data.email,
          metadata: {
            userId: data.userId,
            ...data.metadata,
          },
          callback_url: `${process.env.VITE_API_URL}/webhooks/zenobank`,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        transactionId: response.data.payment_id,
        status: response.data.status,
        paymentUrl: response.data.payment_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Zenobank payment failed',
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    if (!this.apiKey) {
      return { success: false, error: 'Zenobank API key not configured' };
    }

    try {
      const response = await axios.get(
        `${ZENOBANK_API_URL}/payments/${paymentId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        status: response.data.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get payment status',
      };
    }
  }

  async createSubscription(data: ZenobankSubscriptionData): Promise<{
    success: boolean;
    subscriptionId?: string;
    checkoutUrl?: string;
    error?: string;
  }> {
    if (!this.apiKey) {
      return { success: false, error: 'Zenobank API key not configured' };
    }

    try {
      const planPrices: Record<string, number> = {
        basic: 9.99,
        pro: 29.99,
        vip: 99.99,
      };

      const response = await axios.post(
        `${ZENOBANK_API_URL}/subscriptions`,
        {
          plan_id: data.plan,
          email: data.email,
          interval: data.interval,
          amount: planPrices[data.plan] || 0,
          currency: 'USDT',
          metadata: {
            userId: data.userId,
            plan: data.plan,
          },
          success_url: `${process.env.VITE_APP_URL}/subscription/success`,
          cancel_url: `${process.env.VITE_APP_URL}/subscription/cancel`,
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        subscriptionId: response.data.subscription_id,
        checkoutUrl: response.data.checkout_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription',
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'Zenobank API key not configured' };
    }

    try {
      await axios.delete(
        `${ZENOBANK_API_URL}/subscriptions/${subscriptionId}`,
        { headers: this.getHeaders() }
      );

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription',
      };
    }
  }

  generateCheckoutUrl(amount: number, description: string): Promise<string> {
    return this.processPayment({
      amount,
      currency: 'USDT',
      email: '',
      userId: '',
      metadata: { description },
    }).then((result) => result.paymentUrl || '');
  }
}

export const zenobankProvider = new ZenobankProvider();
