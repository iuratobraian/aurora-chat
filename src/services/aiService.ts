/**
 * AI SERVICE MULTI-PROVIDER
 * 
 * Este servicio orquestar múltiples proveedores (OpenRouter, Groq, HuggingFace)
 * para garantizar alta disponibilidad y acceso a los mejores modelos gratuitos.
 */

import { aiOrchestrator } from './ai/aiOrchestrator';
import { AIProviderId, AIResponse } from './ai/types';
import { isHuggingFaceAvailable } from '../lib/externalServices';

export interface AIRequest {
  prompt: string;
  model?: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
  };
  providerId?: AIProviderId; // NUEVO: Permite elegir proveedor si se desea
}

/**
 * Obtener respuesta de IA con múltiples proveedores y fallback
 * 
 * @param request - Request de IA
 * @returns Respuesta de IA
 */
export async function getAIResponse(
  request: AIRequest
): Promise<AIResponse> {
  const result = await aiOrchestrator.generate({
    prompt: request.prompt,
    model: request.model,
    maxTokens: request.parameters?.max_length,
    temperature: request.parameters?.temperature
  }, request.providerId);

  return result;
}

/**
 * Generar análisis de sentimiento
 */
export async function generateSentimentAnalysis(
  text: string
): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; confidence: number }> {
  const prompt = `Analyze the sentiment of the following trading text and respond ONLY with one of these words: positive, negative, neutral.
Text: "${text.substring(0, 500)}"`;
  
  const result = await getAIResponse({ prompt, model: 'llama3-8b-8192' });
  
  const rawSentiment = result.generatedText.toLowerCase();
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  
  if (rawSentiment.includes('positive')) sentiment = 'positive';
  else if (rawSentiment.includes('negative')) sentiment = 'negative';
  
  return {
    sentiment,
    confidence: result.confidence || 0.9
  };
}

/**
 * Generar resumen de texto
 */
export async function generateSummary(
  text: string,
  maxLength: number = 100
): Promise<string> {
  const prompt = `Resúme este texto en español en máximo 100 caracteres centrándote en lo esencial para un trader: "${text.substring(0, 1000)}"`;
  
  const result = await getAIResponse({ 
    prompt, 
    parameters: { max_length: maxLength }
  });
  
  return result.generatedText.trim();
}

/**
 * Generar sugerencias de trading
 */
export async function generateTradingSuggestion(
  marketData: { symbol: string; price: number; trend: string },
  context: string
): Promise<string> {
  const prompt = `Eres un experto trader. Basado en estos datos:
Activo: ${marketData.symbol}
Precio: $${marketData.price}
Tendencia: ${marketData.trend}
Contexto: ${context}

Genera un tip de trading rápido y profesional en español (máximo 280 caracteres). Directo al punto.`;
  
  const result = await getAIResponse({ prompt });
  
  return result.generatedText.trim() || 'No suggestion available at this moment.';
}

/**
 * Limpiar cache de IA (Legacy support)
 */
export function clearAICache(): void {
  // En la nueva v2, el cache se maneja por proveedor si es necesario.
  // Por ahora mantenemos el signature. No tenemos un cache global en v2 aún.
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('ai_response_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Verificar si HuggingFace está disponible (Legacy support)
 */
export function isHuggingFaceAvailableService(): boolean {
  return isHuggingFaceAvailable();
}

/**
 * Obtener estadísticas del cache (Legacy support)
 */
export function getAICacheStats(): { size: number; oldest: number } {
  return {
    size: 0,
    oldest: 0
  };
}

// NUEVO: Métodos para saber qué proveedores tenemos activos
export function getActiveProviders(): string[] {
  return aiOrchestrator.getAvailableProviders();
}

