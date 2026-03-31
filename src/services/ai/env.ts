
/**
 * Utility for environment variables
 * Supports both Vite (Browser) and Node.js
 */
export const getEnv = (name: string): string | undefined => {
  // Try Node.js process.env
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name]) return process.env[name];
    
    // Fallbacks
    if (name === 'VITE_OPENROUTER_API_KEY') {
        return process.env['OPENROUTER_API_KEY'] || process.env['ANTHROPIC_AUTH_TOKEN'] || process.env['OPENROUTER_TOKEN'];
    }
    if (name === 'VITE_GEMINI_API_KEY') {
        return process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];
    }
    if (name === 'VITE_HUGGINGFACE_TOKEN' || name === 'VITE_HUGGINGFACE_API_KEY') {
        return process.env['HUGGINGFACE_API_KEY'] || process.env['HUGGINGFACE_TOKEN'];
    }
    if (name === 'VITE_GROQ_API_KEY') {
        return process.env['GROQ_API_KEY'];
    }

    // Generic no-prefix fallback
    const noPrefix = name.startsWith('VITE_') ? name.replace('VITE_', '') : name;
    if (process.env[noPrefix]) return process.env[noPrefix];
  }

  // Try Vite import.meta.env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env[name]) return import.meta.env[name];
  }

  return undefined;
};
