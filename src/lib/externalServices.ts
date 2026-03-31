/**
 * EXTERNAL SERVICE WRAPPERS CON CIRCUIT BREAKER
 *
 * Wrappers para servicios externos con fallback y degraded mode.
 */

import { CircuitBreaker } from '../lib/circuitBreaker';

// ==================== GOOGLE OAUTH ====================

const googleOAuthBreaker = new CircuitBreaker('GoogleOAuth', {
  failureThreshold: 3,
  resetTimeout: 60000,
  successThreshold: 2,
});

/**
 * Intenta login con Google OAuth, fallback a email/password si falla
 */
export async function loginWithGoogleOrFallback(
  googleToken: string,
  fallbackEmail: string,
  fallbackPassword: string,
  googleLoginFn: (token: string) => Promise<any>,
  emailLoginFn: (email: string, password: string) => Promise<any>
): Promise<any> {
  try {
    return await googleOAuthBreaker.execute(() => googleLoginFn(googleToken));
  } catch (error) {
    console.warn('[GoogleOAuth] Circuit breaker open, using email/password fallback');
    return emailLoginFn(fallbackEmail, fallbackPassword);
  }
}

/**
 * Verifica si Google OAuth está disponible
 */
export function isGoogleOAuthAvailable(): boolean {
  const state = googleOAuthBreaker.getState();
  return state.state !== 'OPEN';
}

/**
 * Obtiene estadísticas de Google OAuth
 */
export function getGoogleOAuthStats() {
  return googleOAuthBreaker.getState();
}

// ==================== MERCADOPAGO ====================

const mercadoPagoBreaker = new CircuitBreaker('MercadoPago', {
  failureThreshold: 3,
  resetTimeout: 30000,
  successThreshold: 2,
});

/**
 * Cola de pagos pendientes para cuando MercadoPago está caído
 */
let pendingPayments: Array<{
  userId: string;
  amount: number;
  description: string;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

/**
 * Procesa pago con MercadoPago, si falla lo encola para retry
 */
export async function processPaymentOrQueue(
  paymentData: { userId: string; amount: number; description: string },
  createPaymentFn: (data: any) => Promise<any>
): Promise<any> {
  try {
    return await mercadoPagoBreaker.execute(() => createPaymentFn(paymentData));
  } catch (error) {
    console.warn('[MercadoPago] Circuit breaker open, queueing payment for retry');

    // Encolar pago para retry automático
    return new Promise((resolve, reject) => {
      pendingPayments.push({
        ...paymentData,
        timestamp: Date.now(),
        resolve,
        reject,
      });
    });
  }
}

/**
 * Intenta reprocesar pagos pendientes cuando el servicio se recupera
 */
export async function retryPendingPayments(
  createPaymentFn: (data: any) => Promise<any>
): Promise<void> {
  if (pendingPayments.length === 0) return;

  console.log(`[MercadoPago] Retrying ${pendingPayments.length} pending payments`);

  const paymentsToRetry = [...pendingPayments];
  pendingPayments = [];

  for (const payment of paymentsToRetry) {
    try {
      const result = await createPaymentFn(payment);
      payment.resolve(result);
    } catch (error) {
      // Volver a encolar si falla
      pendingPayments.push(payment);
      payment.reject(error);
    }
  }
}

/**
 * Obtiene cantidad de pagos pendientes
 */
export function getPendingPaymentsCount(): number {
  return pendingPayments.length;
}

/**
 * Verifica si MercadoPago está disponible
 */
export function isMercadoPagoAvailable(): boolean {
  const state = mercadoPagoBreaker.getState();
  return state.state !== 'OPEN';
}

// ==================== INSTAGRAM API ====================

const instagramBreaker = new CircuitBreaker('Instagram', {
  failureThreshold: 3,
  resetTimeout: 60000,
  successThreshold: 2,
});

/**
 * Obtiene datos de Instagram con degraded mode si falla
 */
export async function getInstagramDataOrDegraded<T>(
  fetchFn: () => Promise<T>,
  degradedData: T
): Promise<T> {
  try {
    return await instagramBreaker.execute(() => fetchFn());
  } catch (error) {
    console.warn('[Instagram] Circuit breaker open, returning degraded data');
    return degradedData;
  }
}

/**
 * Verifica si Instagram API está disponible
 */
export function isInstagramAPIAvailable(): boolean {
  const state = instagramBreaker.getState();
  return state.state !== 'OPEN';
}

// ==================== HUGGINGFACE AI ====================

const huggingFaceBreaker = new CircuitBreaker('HuggingFace', {
  failureThreshold: 3,
  resetTimeout: 30000,
  successThreshold: 2,
});

/**
 * Cache de respuestas de IA para cuando el servicio está caído
 */
const aiResponseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene respuesta de IA con cache fallback
 */
export async function getAIResponseOrCache<T>(
  prompt: string,
  fetchFn: () => Promise<T>,
  cachedResponse?: T
): Promise<T> {
  try {
    return await huggingFaceBreaker.execute(() => fetchFn());
  } catch (error) {
    console.warn('[HuggingFace] Circuit breaker open, using cached response');

    // Intentar usar cache
    const cached = aiResponseCache.get(prompt);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.response as T;
    }

    // Si no hay cache, usar fallback proporcionado o error
    if (cachedResponse) {
      return cachedResponse;
    }

    throw new Error('AI service unavailable and no cache available');
  }
}

/**
 * Guarda respuesta en cache para fallback futuro
 */
export function cacheAIResponse(prompt: string, response: any): void {
  aiResponseCache.set(prompt, {
    response,
    timestamp: Date.now(),
  });
  
  // Limpiar cache vieja
  const now = Date.now();
  for (const [key, value] of aiResponseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      aiResponseCache.delete(key);
    }
  }
}

/**
 * Verifica si HuggingFace está disponible
 */
export function isHuggingFaceAvailable(): boolean {
  const state = huggingFaceBreaker.getState();
  return state.state !== 'OPEN';
}

// ==================== CONVEX ====================

const convexBreaker = new CircuitBreaker('Convex', {
  failureThreshold: 5,
  resetTimeout: 15000,
  successThreshold: 3,
});

/**
 * Ejecuta query/mutation de Convex con fallback a localStorage
 */
export async function convexWithLocalStorageFallback<T>(
  operationName: string,
  operationFn: () => Promise<T>,
  localStorageKey: string,
  parseFn: (data: string) => T
): Promise<T> {
  try {
    return await convexBreaker.execute(() => operationFn());
  } catch (error) {
    console.warn(`[Convex:${operationName}] Circuit breaker open, using localStorage fallback`);

    const cached = localStorage.getItem(localStorageKey);
    if (cached) {
      try {
        return parseFn(cached);
      } catch (e) {
        console.error(`[Convex:${operationName}] Failed to parse localStorage cache`);
      }
    }

    throw new Error(`Convex ${operationName} unavailable and no cache available`);
  }
}

/**
 * Verifica si Convex está disponible
 */
export function isConvexAvailable(): boolean {
  const state = convexBreaker.getState();
  return state.state !== 'OPEN';
}

/**
 * Obtiene estadísticas de todos los circuit breakers
 */
export function getAllCircuitBreakerStats() {
  return {
    googleOAuth: googleOAuthBreaker.getState(),
    mercadoPago: mercadoPagoBreaker.getState(),
    instagram: instagramBreaker.getState(),
    huggingFace: huggingFaceBreaker.getState(),
    convex: convexBreaker.getState(),
  };
}

/**
 * Resetea todos los circuit breakers manualmente
 */
export function resetAllCircuitBreakers(): void {
  googleOAuthBreaker.reset();
  mercadoPagoBreaker.reset();
  instagramBreaker.reset();
  huggingFaceBreaker.reset();
  convexBreaker.reset();
}
