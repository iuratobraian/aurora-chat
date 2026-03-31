/**
 * CSP Nonce Generator - AUD-011
 * 
 * Generates cryptographically secure nonces for Content Security Policy
 * to eliminate 'unsafe-inline' requirement for scripts and styles.
 */

import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure nonce
 * @returns Base64-encoded nonce string
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * Generates multiple nonces for different CSP directives
 * @param count Number of nonces to generate
 * @returns Array of nonce strings
 */
export function generateNonces(count: number = 3): Record<string, string> {
  const nonces: Record<string, string> = {};
  
  for (let i = 0; i < count; i++) {
    nonces[`nonce-${i + 1}`] = generateNonce();
  }
  
  return nonces;
}

/**
 * Creates CSP nonce attributes for HTML elements
 * @param nonce The nonce value
 * @returns HTML attribute string
 */
export function createNonceAttribute(nonce: string): string {
  return `nonce="${nonce}"`;
}

/**
 * Formats nonces for CSP header
 * @param nonces Array of nonce values
 * @returns Formatted string for CSP header
 */
export function formatNoncesForCSP(nonces: string[]): string {
  return nonces.map(n => `'nonce-${n}'`).join(' ');
}
