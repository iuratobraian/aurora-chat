import crypto from 'crypto';

export interface WebhookValidationResult {
  valid: boolean;
  alreadyProcessed: boolean;
  error?: string;
}

export async function validateMercadoPagoWebhook({
  signature,
  data,
  secret,
  ctx,
}: {
  signature: string;
  data: unknown;
  secret: string;
  ctx: { db: any; query: any; get: any };
}): Promise<WebhookValidationResult> {
  try {
    const dataStr = JSON.stringify(data);
    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(dataStr)
      .digest('hex');

    const isValid = generatedHash === signature;
    
    if (!isValid) {
      return { valid: false, alreadyProcessed: false, error: 'Invalid signature' };
    }

    const paymentId = (data as any)?.data?.id;
    if (!paymentId) {
      return { valid: true, alreadyProcessed: false };
    }

    const existing = await ctx.db
      .query('paymentEvents')
      .withIndex('by_external_id', (q: any) => q.eq('externalId', String(paymentId)))
      .unique();

    if (existing) {
      return { valid: true, alreadyProcessed: true };
    }

    return { valid: true, alreadyProcessed: false };
  } catch (error) {
    return {
      valid: false,
      alreadyProcessed: false,
      error: error instanceof Error ? error.message : 'Validation error',
    };
  }
}

export interface ValidationError extends Error {
  code: string;
  details?: unknown;
}

export function createValidationError(message: string, code: string, details?: unknown): ValidationError {
  const error = new Error(message) as ValidationError;
  error.code = code;
  error.details = details;
  return error;
}

export const MAX_TRANSACTION_AMOUNT = 100000;
export const MIN_TRANSACTION_AMOUNT = 1;

export function sanitizeAmount(amount: unknown): number {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw createValidationError('Invalid amount', 'INVALID_AMOUNT');
  }

  if (!Number.isFinite(amount)) {
    throw createValidationError('Amount must be finite', 'INVALID_AMOUNT');
  }

  const sanitized = Math.round(amount * 100) / 100;

  if (sanitized < MIN_TRANSACTION_AMOUNT) {
    throw createValidationError(
      `Amount must be at least ${MIN_TRANSACTION_AMOUNT}`,
      'AMOUNT_TOO_LOW'
    );
  }

  if (sanitized > MAX_TRANSACTION_AMOUNT) {
    throw createValidationError(
      `Amount exceeds maximum limit of ${MAX_TRANSACTION_AMOUNT}`,
      'AMOUNT_TOO_HIGH'
    );
  }

  return sanitized;
}

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') {
    throw createValidationError('Invalid string input', 'INVALID_STRING');
  }

  const sanitized = input.trim().slice(0, maxLength);
  
  if (sanitized.length === 0) {
    throw createValidationError('String cannot be empty', 'EMPTY_STRING');
  }

  return sanitized;
}

export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw createValidationError('Invalid email', 'INVALID_EMAIL');
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw createValidationError('Invalid email format', 'INVALID_EMAIL');
  }

  return sanitized;
}
