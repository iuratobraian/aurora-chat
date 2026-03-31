import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentOrchestrator, MercadoPagoProvider, ZenobankProvider, PaymentData, Plan } from '../../src/services/paymentOrchestrator';
import { mercadopagoProvider } from '../../convex/lib/mercadopago';

vi.mock('../../convex/lib/mercadopago', () => ({
  mercadopagoProvider: {
    processPayment: vi.fn().mockResolvedValue({
      success: true,
      transactionId: 'mp_tx_123',
      status: 'approved'
    }),
    createSubscription: vi.fn().mockResolvedValue({
      success: true,
      subscriptionId: 'mp_sub_123',
      checkoutUrl: 'https://mercadopago.com/checkout'
    }),
    createPreference: vi.fn().mockResolvedValue({
      init_point: 'https://mercadopago.com/preference'
    })
  }
}));

vi.mock('../../convex/lib/zenobank', () => ({
  zenobankProvider: {
    processPayment: vi.fn().mockResolvedValue({
      success: true,
      transactionId: 'zb_tx_123',
      status: 'completed',
      paymentUrl: 'https://zenobank.com/pay'
    }),
    createSubscription: vi.fn().mockResolvedValue({
      success: true,
      subscriptionId: 'zb_sub_123',
      checkoutUrl: 'https://zenobank.com/subscribe'
    })
  }
}));

describe('PaymentOrchestrator', () => {
  let orchestrator: PaymentOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new PaymentOrchestrator();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment with MercadoPago', async () => {
      const paymentData: PaymentData = {
        amount: 1000,
        currency: 'ARS',
        description: 'Premium subscription',
        userId: 'user_123',
        email: 'user@example.com',
        metadata: { orderId: 'order_123' }
      };

      const result = await orchestrator.processPayment('mercadopago', paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should process payment with Zenobank', async () => {
      const paymentData: PaymentData = {
        amount: 50,
        currency: 'USDT',
        description: 'Elite subscription',
        userId: 'user_123',
        email: 'user@example.com'
      };

      const result = await orchestrator.processPayment('zenobank', paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should return error for unsupported payment method', async () => {
      const paymentData: PaymentData = {
        amount: 100,
        currency: 'EUR',
        description: 'Test',
        userId: 'user_123',
        email: 'user@example.com'
      };

      const result = await orchestrator.processPayment('unknown' as any, paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });
  });

  describe('createSubscription', () => {
  it('should create subscription with MercadoPago', async () => {
    const plan: Plan = {
      id: 'pro',
      name: 'Pro Plan',
      price: 29.99,
        interval: 'monthly',
        features: ['user@example.com', 'user_123']
      };

      const result = await orchestrator.createSubscription('mercadopago', plan);

      expect(result.success).toBe(true);
      expect(result.subscriptionId).toBeDefined();
    });

    it('should create subscription with Zenobank', async () => {
      const plan: Plan = {
        id: 'elite',
        name: 'Elite Plan',
        price: 79.99,
        interval: 'monthly',
        features: ['user@example.com', 'user_123']
      };

      const result = await orchestrator.createSubscription('zenobank', plan);

      expect(result.success).toBe(true);
      expect(result.subscriptionId).toBeDefined();
    });

    it('should return error for unsupported payment method', async () => {
      const plan: Plan = {
        id: 'test',
        name: 'Test Plan',
        price: 9.99,
        interval: 'monthly',
        features: []
      };

      const result = await orchestrator.createSubscription('unknown' as any, plan);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });
  });

  describe('generateCheckoutUrl', () => {
    it('should generate checkout URL for MercadoPago', async () => {
      const url = await orchestrator.generateCheckoutUrl('mercadopago', 1000, 'Test payment');

      expect(url).toContain('mercadopago.com');
    });

    it('should throw error for unsupported payment method', async () => {
      await expect(
        orchestrator.generateCheckoutUrl('unknown' as any, 100, 'Test')
      ).rejects.toThrow('not supported');
    });
  });

  describe('getAvailableMethods', () => {
    it('should return all available payment methods', () => {
      const methods = orchestrator.getAvailableMethods();

      expect(methods).toContain('mercadopago');
      expect(methods).toContain('zenobank');
      expect(methods.length).toBe(2);
    });
  });

  describe('getProvider', () => {
    it('should return MercadoPago provider', () => {
      const provider = orchestrator.getProvider('mercadopago');

      expect(provider).toBeInstanceOf(MercadoPagoProvider);
    });

    it('should return Zenobank provider', () => {
      const provider = orchestrator.getProvider('zenobank');

      expect(provider).toBeInstanceOf(ZenobankProvider);
    });

    it('should return undefined for unknown provider', () => {
      const provider = orchestrator.getProvider('unknown' as any);

      expect(provider).toBeUndefined();
    });
  });
});

describe('MercadoPagoProvider', () => {
  let provider: MercadoPagoProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new MercadoPagoProvider();
  });

  it('should process payment', async () => {
    const result = await provider.processPayment(1000, 'ARS', {
      email: 'user@example.com',
      description: 'Test payment'
    });

    expect(result.success).toBe(true);
  });

  it('should create subscription', async () => {
    const plan: Plan = {
      id: 'pro',
      name: 'Pro Plan',
      price: 29.99,
      interval: 'monthly',
      features: ['user@example.com', 'user_123']
    };

    const result = await provider.createSubscription(plan);

    expect(result.success).toBe(true);
    expect(vi.mocked(mercadopagoProvider.createSubscription)).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 29.99,
        description: 'Pro Plan',
        billingCycle: 'monthly',
      })
    );
  });

  it('should generate checkout URL', async () => {
    const url = await provider.generateCheckoutUrl(1000, 'Test payment');

    expect(url).toContain('mercadopago.com');
  });
});

describe('ZenobankProvider', () => {
  let provider: ZenobankProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new ZenobankProvider();
  });

  it('should process payment', async () => {
    const result = await provider.processPayment(50, 'USDT', {
      email: 'user@example.com',
      userId: 'user_123'
    });

    expect(result.success).toBe(true);
  });

  it('should create subscription', async () => {
    const plan: Plan = {
      id: 'elite',
      name: 'Elite Plan',
      price: 79.99,
      interval: 'monthly',
      features: ['user@example.com', 'user_123']
    };

    const result = await provider.createSubscription(plan);

    expect(result.success).toBe(true);
  });
});
