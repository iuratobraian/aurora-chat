/**
 * OpenRouter Provider - Multi-Model Gateway
 * 
 * Modelos disponibles:
 * - qwen/qwen-2.5-coder-32b-instruct: ⭐ Mejor código (económico)
 * - anthropic/claude-3.5-sonnet: ⭐ Premium (requiere créditos)
 * - meta-llama/llama-3.1-70b-instruct: ⭐ Calidad/precio
 * 
 * @see https://openrouter.ai/models
 */

import { AIProvider, AIProviderId, AIRequest, AIResponse } from '../types';
import { getEnv } from '../env';

export class OpenRouterProvider implements AIProvider {
  readonly id: AIProviderId = 'openrouter';
  readonly name = 'OpenRouter (Multi-Model)';

  /**
   * Modelos recomendados por caso de uso
   */
  private MODELS = {
    code: 'qwen/qwen-2.5-coder-32b-instruct',     // ⭐ Mejor código
    quality: 'anthropic/claude-3.5-sonnet',       // ⭐ Premium
    balanced: 'meta-llama/llama-3.1-70b-instruct' // ⭐ Calidad/precio
  } as const;

  isAvailable(): boolean {
    return !!getEnv('VITE_OPENROUTER_API_KEY') || !!getEnv('OPENROUTER_API_KEY') || !!getEnv('ANTHROPIC_AUTH_TOKEN');
  }

  /**
   * Obtiene la API key desde múltiples fuentes
   */
  private getApiKey(): string {
    return getEnv('VITE_OPENROUTER_API_KEY') || getEnv('OPENROUTER_API_KEY') || getEnv('ANTHROPIC_AUTH_TOKEN') || '';
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return {
        generatedText: '',
        model: this.MODELS.code,
        provider: 'openrouter',
        status: 'failed',
        error: 'OpenRouter API key no configurada. Agrega OPENROUTER_API_KEY o VITE_OPENROUTER_API_KEY a .env'
      };
    }

    // Seleccionar modelo según tipo de tarea o usar el especificado
    let model = request.model;
    if (!model || model === 'code') model = this.MODELS.code;
    else if (model === 'quality') model = this.MODELS.quality;
    else if (model === 'balanced') model = this.MODELS.balanced;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://tradeportal.io',
          'X-Title': 'TradePortal Aurora AI'
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
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || '';

      return {
        generatedText,
        confidence: 1.0,
        model: data.model || model,
        provider: 'openrouter',
        status: 'success',
        usage: data.usage
      };
    } catch (error: any) {
      return {
        generatedText: '',
        model,
        provider: 'openrouter',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Genera código con Qwen2.5 Coder (mejor calidad/precio)
   */
  async generateCode(request: AIRequest): Promise<AIResponse> {
    return this.generate({ ...request, model: 'code' });
  }

  /**
   * Genera con Claude 3.5 Sonnet (premium)
   */
  async generatePremium(request: AIRequest): Promise<AIResponse> {
    return this.generate({ ...request, model: 'quality' });
  }

  /**
   * Lista los modelos disponibles
   */
  getAvailableModels(): { id: string; name: string; description: string }[] {
    return [
      {
        id: this.MODELS.code,
        name: 'Qwen2.5 Coder 32B',
        description: '⭐ Mejor código (económico)'
      },
      {
        id: this.MODELS.quality,
        name: 'Claude 3.5 Sonnet',
        description: '⭐ Premium (requiere créditos)'
      },
      {
        id: this.MODELS.balanced,
        name: 'Llama 3.1 70B',
        description: '⭐ Calidad/precio'
      }
    ];
  }
}
