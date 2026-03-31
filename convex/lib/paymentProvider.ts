export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';

export type PlanType = 'basic' | 'starter' | 'growth' | 'pro' | 'vip' | 'scale' | 'enterprise';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status?: PaymentStatus;
  checkoutUrl?: string;
  error?: string;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  checkoutUrl?: string;
  status?: PaymentStatus;
  error?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  email: string;
  userId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionData {
  plan: PlanType;
  email: string;
  userId: string;
  interval?: 'monthly' | 'yearly';
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  error?: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  readonly supportedCurrencies: string[];
  readonly isConfigured: boolean;

  processPayment(data: PaymentData): Promise<PaymentResult>;
  
  createSubscription(data: SubscriptionData): Promise<SubscriptionResult>;
  
  cancelSubscription(subscriptionId: string): Promise<RefundResult>;
  
  getPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    status?: PaymentStatus;
    error?: string;
  }>;
  
  refundPayment(transactionId: string): Promise<RefundResult>;
  
  generateCheckoutUrl(amount: number, description: string): Promise<string>;
}

export type PaymentProviderType = 'mercadopago' | 'zenobank' | 'stripe' | 'auto';

export interface PaymentProviderConfig {
  preferredProvider?: PaymentProviderType;
  fallbackEnabled?: boolean;
}
