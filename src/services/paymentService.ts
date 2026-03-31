/**
 * PAYMENT SERVICE CON CIRCUIT BREAKER
 * 
 * Servicio de pagos con fallback a cola cuando MercadoPago está caído.
 */

import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import { processPaymentOrQueue, retryPendingPayments, getPendingPaymentsCount } from '../lib/externalServices';

export interface PaymentData {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  plan?: string;
  billingCycle?: 'monthly' | 'yearly';
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  externalReference?: string;
  status?: string;
  queued?: boolean;
}

/**
 * Procesar pago con MercadoPago usando circuit breaker
 * Si MercadoPago está caído, el pago se encola para retry automático
 */
export async function processPayment(
  convex: ConvexReactClient,
  paymentData: PaymentData
): Promise<PaymentResult> {
  try {
    return await processPaymentOrQueue(
      paymentData,
      async (data: PaymentData) => {
        // Crear sesión de checkout en Convex/MercadoPago
        const result = await convex.mutation(api.payments.createCheckoutSession, {
          userId: data.userId,
          plan: (data.plan as 'pro' | 'elite' | 'creator') || 'pro',
          billingCycle: (data.billingCycle as 'monthly' | 'yearly') || 'monthly',
        });
        
        return {
          success: true,
          paymentId: result.sessionId,
          externalReference: result.url,
          status: 'pending',
          queued: false,
        };
      }
    );
  } catch (error: any) {
    console.error('[PaymentService] Payment failed:', error);
    return {
      success: false,
      queued: true,
    };
  }
}

/**
 * Reintentar pagos pendientes cuando MercadoPago se recupera
 * Debe llamarse periódicamente o cuando se detecte recuperación del servicio
 */
export async function retryPendingPaymentsService(
  convex: ConvexReactClient
): Promise<{ retried: number; failed: number }> {
  let retried = 0;
  let failed = 0;
  
  await retryPendingPayments(async (data: any) => {
    try {
      const result = await convex.mutation(api.payments.createCheckoutSession, {
        userId: data.userId,
        plan: (data.plan as 'pro' | 'elite' | 'creator') || 'pro',
        billingCycle: (data.billingCycle as 'monthly' | 'yearly') || 'monthly',
      });
      
      retried++;
      return result;
    } catch (error) {
      failed++;
      throw error;
    }
  });
  
  return { retried, failed };
}

/**
 * Obtener cantidad de pagos pendientes en cola
 */
export function getPendingPaymentsCountService(): number {
  return getPendingPaymentsCount();
}

/**
 * Verificar si MercadoPago está disponible
 */
export function isMercadoPagoAvailable(): boolean {
  const { isMercadoPagoAvailable: checkAvailability } = require('../lib/externalServices');
  return checkAvailability();
}
