import { describe, expect, it } from 'vitest';
import {
  MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT,
  MERCADOPAGO_SUBSCRIPTION_PRICES,
  isBelowMercadoPagoMinimum,
  resolveMercadoPagoSubscriptionAmount,
} from '../../convex/lib/mercadopago';

describe('MercadoPago rules', () => {
  it('rejects checkout values below the minimum', () => {
    expect(isBelowMercadoPagoMinimum(MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT - 0.01)).toBe(true);
    expect(isBelowMercadoPagoMinimum(MERCADOPAGO_MINIMUM_CHECKOUT_AMOUNT)).toBe(false);
  });

  it('resolves known subscription plans to their configured price', () => {
    expect(resolveMercadoPagoSubscriptionAmount('basic', 0)).toBe(MERCADOPAGO_SUBSCRIPTION_PRICES.basic);
    expect(resolveMercadoPagoSubscriptionAmount('pro', 0)).toBe(MERCADOPAGO_SUBSCRIPTION_PRICES.pro);
    expect(resolveMercadoPagoSubscriptionAmount('vip', 0)).toBe(MERCADOPAGO_SUBSCRIPTION_PRICES.vip);
  });

  it('prefers explicit valid amounts when provided', () => {
    expect(resolveMercadoPagoSubscriptionAmount('custom', 12)).toBe(12);
  });

  it('returns null when no valid amount can be resolved', () => {
    expect(resolveMercadoPagoSubscriptionAmount('custom', 0)).toBeNull();
  });
});
