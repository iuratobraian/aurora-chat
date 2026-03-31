import { useState, useCallback } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useToast } from '../components/ToastProvider';
import { Usuario } from '../types';
import logger from '../utils/logger';

type PlanId = 'pro' | 'elite' | 'creator';
type BillingCycle = 'monthly' | 'yearly';

interface PaymentHookOptions {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function usePayment(options: PaymentHookOptions = {}) {
  const { onSuccess, onCancel } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const createStripeCheckout = useMutation(api.payments.createCheckoutSession);
  const createMercadoPago = useAction(api.paymentOrchestrator.createMercadoPagoPreference);
  const createZenobankPayment = useMutation(api.paymentOrchestrator.createZenobankPayment);

  const subscribe = useCallback(async (
    plan: PlanId,
    billingCycle: BillingCycle,
    user: Usuario
  ) => {
    if (!user || user.id === 'guest') {
      showToast('error', 'Inicia sesión para suscribirte');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createStripeCheckout({
        plan,
        billingCycle,
        userId: user.id
      });

      if (result?.url) {
        window.location.href = result.url;
        onSuccess?.();
        return true;
      } else {
        throw new Error('No se pudo crear la sesión de pago');
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Error al procesar el pago';
      setError(errorMsg);
      showToast('error', errorMsg);
      logger.error('Payment error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [createStripeCheckout, showToast, onSuccess]);

  const payWithMercadoPago = useCallback(async (
    user: Usuario,
    amount: number,
    description: string,
    plan?: string,
    courseId?: string
  ) => {
    if (!user || user.id === 'guest') {
      showToast('error', 'Inicia sesión para pagar');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createMercadoPago({
        userId: user.id,
        amount,
        description,
        plan,
        courseId
      });

      if (result?.init_point) {
        window.location.href = result.init_point;
        onSuccess?.();
        return true;
      } else {
        throw new Error('No se pudo crear la preferencia de pago');
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Error con MercadoPago';
      setError(errorMsg);
      showToast('error', errorMsg);
      logger.error('MercadoPago error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [createMercadoPago, showToast, onSuccess]);

  const payWithZenobank = useCallback(async (
    user: Usuario,
    amount: number,
    currency: string,
    description?: string
  ) => {
    if (!user || user.id === 'guest') {
      showToast('error', 'Inicia sesión para pagar');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createZenobankPayment({
        userId: user.id,
        amount,
        currency,
        email: user.email || '',
        description
      });

      if (result?.success) {
        showToast('success', 'Pago procesado correctamente');
        onSuccess?.();
        return true;
      } else {
        throw new Error(result?.error || 'Error con Zenobank');
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Error con Zenobank';
      setError(errorMsg);
      showToast('error', errorMsg);
      logger.error('Zenobank error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [createZenobankPayment, showToast, onSuccess]);

  const redirectToPricing = useCallback(() => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: '/pricing' }));
  }, []);

  return {
    loading,
    error,
    subscribe,
    payWithMercadoPago,
    payWithZenobank,
    redirectToPricing
  };
}
