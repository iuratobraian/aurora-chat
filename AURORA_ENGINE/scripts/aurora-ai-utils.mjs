/**
 * 🛠️ AURORA AI UTILS
 * 
 * Utilidades para balanceo de carga, aleatoriedad y suavizado de peticiones (throttling).
 */

import { setTimeout } from 'node:timers/promises';

// ============================================================================
// CONFIGURACIÓN DE BALANCEO Y SUAVIZADO
// ============================================================================

export const AI_CONFIG = {
  // Retraso global mínimo entre CUALQUIER petición (evita ráfagas)
  GLOBAL_MIN_DELAY: 500, 
  
  // Retrasos específicos por proveedor (ms)
  PROVIDER_LIMITS: {
    groq: 800,           // Muy rápido, pero preventivo
    kimi: 1000,          // NVIDIA suele aguantar bien
    openrouter: 2500,    // OpenRouter/Alibaba es sensible
    deepseek: 1200,      // DeepSeek tiene límites por minuto estrictos
    claude: 1500,        // Anthropic suele ser estable
    glm: 1000            // NVIDIA/GLM
  },

  // Pesos para aleatoriedad (Probabilidad de ser elegido como alternativa)
  RANDOM_WEIGHTS: {
    groq: 0.4,           // Alta disponibilidad
    kimi: 0.3,           // Alta calidad
    openrouter: 0.2,     // Qwen/Llama
    deepseek: 0.1        // Gran calidad pero a veces offline
  }
};

/**
 * ⚡ AIThrottler: Suavizador de peticiones
 * Garantiza que no se saturen los proveedores enviando peticiones muy rápido.
 */
class AIThrottler {
  constructor() {
    this.lastRequestTime = 0;
    this.providerLastRequest = {};
    this.queue = Promise.resolve();
  }

  /**
   * Espera el tiempo necesario antes de permitir la siguiente petición
   * @param {string} provider Nombre del proveedor
   */
  async throttle(provider) {
    const now = Date.now();
    const globalDelay = AI_CONFIG.GLOBAL_MIN_DELAY;
    const providerDelay = AI_CONFIG.PROVIDER_LIMITS[provider] || 1000;

    // Calcular cuánto tiempo debemos esperar
    const timeSinceGlobal = now - this.lastRequestTime;
    const timeSinceProvider = now - (this.providerLastRequest[provider] || 0);

    const waitGlobal = Math.max(0, globalDelay - timeSinceGlobal);
    const waitProvider = Math.max(0, providerDelay - timeSinceProvider);
    
    const waitTime = Math.max(waitGlobal, waitProvider);

    if (waitTime > 0) {
      if (process.env.DEBUG_AI) {
        console.error(`\x1b[90m[Throttler] Esperando ${waitTime}ms para ${provider}...\x1b[0m`);
      }
      await setTimeout(waitTime);
    }

    this.lastRequestTime = Date.now();
    this.providerLastRequest[provider] = Date.now();
  }

  /**
   * Ejecuta una función dentro de la cola del throttler
   */
  async enqueue(provider, fn) {
    this.queue = this.queue.then(async () => {
      await this.throttle(provider);
      return fn();
    });
    return this.queue;
  }
}

export const aiThrottler = new AIThrottler();

/**
 * 🎯 ProviderSelector: Selección inteligente y aleatoria
 */
export const providerSelector = {
  /**
   * Elige un proveedor basado en el recomendado y alternativas
   * @param {string} primary El proveedor recomendado para la tarea
   * @param {string[]} alternatives Lista de proveedores alternativos válidos
   * @param {Object} availability Mapa de disponibilidad (API keys configuradas)
   * @param {number} randomness Factor de aleatoriedad (0 a 1)
   */
  select(primary, alternatives = [], availability = {}, randomness = 0.3) {
    // Si no hay API key para el primario, buscar en alternativas
    if (!availability[primary]) {
      const availableAlt = alternatives.find(alt => availability[alt]);
      if (availableAlt) return availableAlt;
      
      // Si nada funciona, devolver el primario y que el agente maneje el error de API Key
      return primary;
    }

    // Aplicar aleatoriedad si se solicita y hay alternativas disponibles
    if (Math.random() < randomness && alternatives.length > 0) {
      const validAlts = alternatives.filter(alt => availability[alt]);
      if (validAlts.length > 0) {
        // Elegir una alternativa aleatoria
        const chosen = validAlts[Math.floor(Math.random() * validAlts.length)];
        if (process.env.DEBUG_AI) {
          console.error(`\x1b[90m[LoadBalancer] Switch aleatorio: ${primary} → ${chosen}\x1b[0m`);
        }
        return chosen;
      }
    }

    return primary;
  }
};
