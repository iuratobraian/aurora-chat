import { useState, useCallback } from 'react';

interface UseMercadoPagoOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

interface PaymentResult {
  init_point?: string;
  preferenceId?: string;
  error?: string;
}

export function useMercadoPago({ onSuccess, onError }: UseMercadoPagoOptions = {}) {
  const [loading, setLoading] = useState(false);

  const createPreference = useCallback(async ({
    userId,
    amount,
    description,
    plan,
    courseId,
  }: {
    userId: string;
    amount: number;
    description: string;
    plan?: string;
    courseId?: string;
  }): Promise<PaymentResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          description,
          plan,
          courseId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear preferencia');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const deposit = useCallback(async ({
    userId,
    amount,
  }: {
    userId: string;
    amount: number;
  }): Promise<PaymentResult> => {
    const description = `Depósito en TradePortal - ${new Date().toLocaleDateString('es-AR')}`;
    return createPreference({ userId, amount, description });
  }, [createPreference]);

  const buySubscription = useCallback(async ({
    userId,
    plan,
  }: {
    userId: string;
    plan: string;
  }): Promise<PaymentResult> => {
    const planNames: Record<string, string> = {
      basic: 'Plan Basic',
      pro: 'Plan Pro',
      elite: 'Plan Elite',
      vip: 'Plan VIP',
    };
    const description = `Suscripción ${planNames[plan] || plan}`;
    return createPreference({ userId, amount: 0, description, plan });
  }, [createPreference]);

  const buyCourse = useCallback(async ({
    userId,
    courseId,
    courseName,
    price,
  }: {
    userId: string;
    courseId: string;
    courseName: string;
    price: number;
  }): Promise<PaymentResult> => {
    const description = `Curso: ${courseName}`;
    return createPreference({ userId, amount: price, description, courseId });
  }, [createPreference]);

  const getPaymentStatus = useCallback(async (preferenceId: string) => {
    try {
      const response = await fetch(`/api/mercadopago/status?preferenceId=${preferenceId}`);
      return await response.json();
    } catch (error) {
      onError?.('Error al verificar estado del pago');
      return { error: 'Error al verificar estado' };
    }
  }, [onError]);

  return {
    createPreference,
    deposit,
    buySubscription,
    buyCourse,
    getPaymentStatus,
    loading,
  };
}
