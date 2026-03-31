const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; waitSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  
  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, waitSeconds: 0 };
  }
  
  if (now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, waitSeconds: 0 };
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    const waitMs = WINDOW_MS - (now - record.lastAttempt);
    return { allowed: false, remaining: 0, waitSeconds: Math.ceil(waitMs / 1000) };
  }
  
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count, waitSeconds: 0 };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  
  if (!record || now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return;
  }
  
  record.count += 1;
  record.lastAttempt = now;
}

export function clearRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}
