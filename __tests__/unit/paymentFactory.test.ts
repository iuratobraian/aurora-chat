import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPaymentProvider,
  getAvailableProviders,
  getProviderByCurrency,
  mercadoPagoAdapter,
  zenobankAdapter,
} from '../../convex/lib/paymentFactory';

describe('paymentFactory', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPaymentProvider', () => {
    it('should return mercadopago adapter when specified', () => {
      const provider = getPaymentProvider('mercadopago');
      expect(provider?.id).toBe('mercadopago');
      expect(provider?.name).toBe('MercadoPago');
    });

    it('should return zenobank adapter when specified', () => {
      const provider = getPaymentProvider('zenobank');
      expect(provider?.id).toBe('zenobank');
      expect(provider?.name).toBe('Zenobank');
    });

    it('should have all required methods', () => {
      const provider = getPaymentProvider('mercadopago');
      expect(provider).toBeDefined();
      expect(typeof provider?.processPayment).toBe('function');
      expect(typeof provider?.createSubscription).toBe('function');
      expect(typeof provider?.cancelSubscription).toBe('function');
      expect(typeof provider?.getPaymentStatus).toBe('function');
      expect(typeof provider?.refundPayment).toBe('function');
      expect(typeof provider?.generateCheckoutUrl).toBe('function');
    });

    it('should expose supported currencies', () => {
      expect(mercadoPagoAdapter.supportedCurrencies).toContain('ARS');
      expect(zenobankAdapter.supportedCurrencies).toContain('USDT');
    });
  });

  describe('PaymentProvider interface', () => {
    it('should return consistent result shape on processPayment', async () => {
      const provider = mercadoPagoAdapter;
      
      const result = await provider.processPayment({
        amount: 100,
        currency: 'ARS',
        email: 'test@example.com',
        userId: 'user123',
        description: 'Test payment',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(typeof result.success).toBe('boolean');
    });

    it('should return consistent result shape on createSubscription', async () => {
      const provider = mercadoPagoAdapter;
      
      const result = await provider.createSubscription({
        plan: 'pro',
        email: 'test@example.com',
        userId: 'user123',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(typeof result.success).toBe('boolean');
    });

    it('should generate checkout URL', async () => {
      const url = await mercadoPagoAdapter.generateCheckoutUrl(100, 'Test');
      expect(typeof url).toBe('string');
    });
  });

  describe('getProviderByCurrency', () => {
    it('should check if provider supports currency', () => {
      const mpProvider = mercadoPagoAdapter;
      expect(mpProvider.supportedCurrencies).toContain('ARS');
      expect(mpProvider.supportedCurrencies).toContain('USD');
    });

    it('should have zenobank with crypto support', () => {
      const zbProvider = zenobankAdapter;
      expect(zbProvider.supportedCurrencies).toContain('USDT');
      expect(zbProvider.supportedCurrencies).toContain('BTC');
      expect(zbProvider.supportedCurrencies).toContain('ETH');
    });
  });
});
