import type {
  PaymentProvider,
  PaymentProviderType,
  PaymentData,
  SubscriptionData,
  PaymentResult,
  SubscriptionResult,
  PaymentStatus,
  RefundResult,
} from './paymentProvider';

import { MercadoPagoProvider } from './mercadopago';
import { ZenobankProvider } from './zenobank';

const mercadoPagoProvider = new MercadoPagoProvider();
const zenobankProvider = new ZenobankProvider();

function normalizeStatus(status: string | undefined): PaymentStatus {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'active':
    case 'paid':
      return 'approved';
    case 'pending':
    case 'in_progress':
    case 'processing':
      return 'pending';
    case 'rejected':
    case 'refunded':
    case 'chargeback':
      return 'refunded';
    case 'cancelled':
    case 'expired':
      return 'cancelled';
    default:
      return 'pending';
  }
}

class MercadoPagoAdapter implements PaymentProvider {
  readonly id = 'mercadopago';
  readonly name = 'MercadoPago';
  readonly supportedCurrencies = ['ARS', 'USD', 'BRL'];
  
  get isConfigured(): boolean {
    return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    const result = await mercadoPagoProvider.processPayment({
      transactionAmount: data.amount,
      description: data.description || '',
      paymentMethodId: 'pix',
      payer: { email: data.email },
      metadata: data.metadata,
    });

    return {
      success: result.success,
      transactionId: result.transactionId,
      status: normalizeStatus(result.status),
      error: result.error,
    };
  }

  async createSubscription(data: SubscriptionData): Promise<SubscriptionResult> {
    const result = await mercadoPagoProvider.createSubscription({
      plan_id: data.plan,
      payer_email: data.email,
      userId: data.userId,
      plan: data.plan,
    });

    return {
      success: result.subscriptionId ? true : false,
      subscriptionId: result.subscriptionId,
      checkoutUrl: result.init_point,
      status: result.subscriptionId ? 'pending' : undefined,
      error: result.error,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<RefundResult> {
    return { success: false, error: 'Cancelación via API no implementada para MercadoPago' };
  }

  async getPaymentStatus(transactionId: string): Promise<{ success: boolean; status?: PaymentStatus; error?: string }> {
    const result = await mercadoPagoProvider.getPaymentStatus(transactionId);
    return {
      success: result.success,
      status: normalizeStatus(result.status),
      error: result.error,
    };
  }

  async refundPayment(transactionId: string): Promise<RefundResult> {
    const result = await mercadoPagoProvider.refundPayment(transactionId);
    return { success: result.success, error: result.error };
  }

  async generateCheckoutUrl(amount: number, description: string): Promise<string> {
    return mercadoPagoProvider.generateCheckoutUrl(amount, description);
  }
}

class ZenobankAdapter implements PaymentProvider {
  readonly id = 'zenobank';
  readonly name = 'Zenobank';
  readonly supportedCurrencies = ['USDT', 'BTC', 'ETH'];
  
  get isConfigured(): boolean {
    return Boolean(process.env.ZENOBANK_API_KEY);
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    const result = await zenobankProvider.processPayment({
      amount: data.amount,
      currency: data.currency,
      email: data.email,
      userId: data.userId,
      metadata: data.metadata,
    });

    return {
      success: result.success,
      transactionId: result.transactionId,
      status: normalizeStatus(result.status),
      checkoutUrl: result.paymentUrl,
      error: result.error,
    };
  }

  async createSubscription(data: SubscriptionData): Promise<SubscriptionResult> {
    const result = await zenobankProvider.createSubscription({
      plan: data.plan,
      email: data.email,
      userId: data.userId,
      interval: data.interval || 'monthly',
    });

    return {
      success: result.subscriptionId ? true : false,
      subscriptionId: result.subscriptionId,
      checkoutUrl: result.checkoutUrl,
      status: result.subscriptionId ? 'pending' : undefined,
      error: result.error,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<RefundResult> {
    return zenobankProvider.cancelSubscription(subscriptionId);
  }

  async getPaymentStatus(transactionId: string): Promise<{ success: boolean; status?: PaymentStatus; error?: string }> {
    const result = await zenobankProvider.getPaymentStatus(transactionId);
    return {
      success: result.success,
      status: normalizeStatus(result.status),
      error: result.error,
    };
  }

  async refundPayment(transactionId: string): Promise<RefundResult> {
    return { success: false, error: 'Reembolso via API no implementado para Zenobank' };
  }

  async generateCheckoutUrl(amount: number, description: string): Promise<string> {
    return zenobankProvider.generateCheckoutUrl(amount, description);
  }
}

const mercadoPagoAdapter = new MercadoPagoAdapter();
const zenobankAdapter = new ZenobankAdapter();

export function getPaymentProvider(type: PaymentProviderType = 'auto'): PaymentProvider | null {
  switch (type) {
    case 'mercadopago':
      return mercadoPagoAdapter;
    case 'zenobank':
      return zenobankAdapter;
    case 'auto':
      if (mercadoPagoAdapter.isConfigured) return mercadoPagoAdapter;
      if (zenobankAdapter.isConfigured) return zenobankAdapter;
      return null;
    default:
      return null;
  }
}

export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = [];
  if (mercadoPagoAdapter.isConfigured) providers.push(mercadoPagoAdapter);
  if (zenobankAdapter.isConfigured) providers.push(zenobankAdapter);
  return providers;
}

export function getProviderByCurrency(currency: string): PaymentProvider | null {
  for (const provider of getAvailableProviders()) {
    if (provider.supportedCurrencies.includes(currency.toUpperCase())) {
      return provider;
    }
  }
  return getPaymentProvider('auto');
}

export { mercadoPagoAdapter, zenobankAdapter };
export type { MercadoPagoAdapter, ZenobankAdapter };
