/**
 * Groq AI Provider - Ultra Fast LLM Inference
 * 
 * Modelos actuales (2024-2025):
 * - llama-3.3-70b-versatile: Mejor calidad, ~700ms
 * - llama-3.1-8b-instant: Más rápido, ~1300ms
 * 
 * @see https://console.groq.com/docs/models
 */

import { AIProvider, AIProviderId, AIRequest, AIResponse } from '../types';
import { getEnv } from '../env';

export class GroqProvider implements AIProvider {
  readonly id: AIProviderId = 'groq';
  readonly name = 'Groq (Ultra Fast)';

  /**
   * Modelos actuales de Groq (actualizado 2025)
   * Nota: mixtral-8x7b-32768 y gemma2-9b-it fueron descontinuados
   */
  private MODELS = {
    quality: 'llama-3.3-70b-versatile',  // ⭐ Mejor calidad-velocidad
    fast: 'llama-3.1-8b-instant'         // ⚡ Máxima velocidad
  } as const;

  isAvailable(): boolean {
    return !!getEnv('VITE_GROQ_API_KEY') || !!getEnv('GROQ_API_KEY');
  }

  /**
   * Obtiene la API key desde múltiples fuentes
   */
  private getApiKey(): string {
    return getEnv('VITE_GROQ_API_KEY') || getEnv('GROQ_API_KEY') || '';
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return {
        generatedText: '',
        model: this.MODELS.quality,
        provider: 'groq',
        status: 'failed',
        error: 'Groq API key no configurada. Agrega GROQ_API_KEY o VITE_GROQ_API_KEY a .env'
      };
    }

    // Seleccionar modelo: usar el especificado o default según preferencia
    const model = request.model === 'fast' 
      ? this.MODELS.fast 
      : this.MODELS.quality;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: request.prompt }],
          max_tokens: request.maxTokens || 4000,
          temperature: request.temperature || 0.7
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || '';

      return {
        generatedText,
        confidence: 1.0,
        model: data.model || model,
        provider: 'groq',
        status: 'success',
        usage: data.usage
      };
    } catch (error: any) {
      return {
        generatedText: '',
        model,
        provider: 'groq',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Genera código con el modelo fast (ultra-rápido)
   */
  async generateFast(request: AIRequest): Promise<AIResponse> {
    return this.generate({ ...request, model: 'fast' });
  }

  /**
   * Genera código con el modelo quality (mejor precisión)
   */
  async generateQuality(request: AIRequest): Promise<AIResponse> {
    return this.generate({ ...request, model: 'quality' });
  }

  /**
   * Lista los modelos disponibles
   */
  getAvailableModels(): { id: string; name: string; description: string }[] {
    return [
      {
        id: this.MODELS.quality,
        name: 'Llama 3.3 70B Versatile',
        description: '⭐ Mejor calidad-velocidad (~700ms)'
      },
      {
        id: this.MODELS.fast,
        name: 'Llama 3.1 8B Instant',
        description: '⚡ Máxima velocidad (~1300ms)'
      }
    ];
  }
}
