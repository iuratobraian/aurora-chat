/**
 * HuggingFace Provider (Legacy)
 * 
 * Basado en la implementación actual de aiService.ts
 */

import { AIProvider, AIProviderId, AIRequest, AIResponse } from '../types';
import { getAIResponseOrCache, isHuggingFaceAvailable } from '../../../lib/externalServices';
import { getEnv } from '../env';

export class HuggingFaceProvider implements AIProvider {
  readonly id: AIProviderId = 'huggingface';
  readonly name = 'HuggingFace (Legacy)';

  isAvailable(): boolean {
    return !!getEnv('VITE_HUGGINGFACE_TOKEN');
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const defaultModel = request.model || 'facebook/bart-large-cnn';
    const token = getEnv('VITE_HUGGINGFACE_TOKEN') || '';

    try {
      const response = await getAIResponseOrCache(
        request.prompt,
        async () => {
          const res = await fetch(`https://api-inference.huggingface.co/models/${defaultModel}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              inputs: request.prompt,
              parameters: {
                max_length: request.maxTokens || 200,
                temperature: request.temperature || 0.7
              }
            })
          });

          if (!res.ok) {
            throw new Error(`HuggingFace API failed: ${res.statusText}`);
          }

          const data = await res.json();
          // Algunos modelos devuelven array, otros objeto
          const generatedText = Array.isArray(data) 
            ? (data[0]?.generated_text || data[0]?.summary_text || JSON.stringify(data[0]))
            : (data.generated_text || data.summary_text || JSON.stringify(data));

          return {
            generatedText,
            confidence: 0.9,
            model: defaultModel,
            provider: 'huggingface' as AIProviderId,
            status: 'success' as const
          };
        }
      );

      return {
        ...response,
        status: 'success'
      };
    } catch (error: any) {
      return {
        generatedText: '',
        model: defaultModel,
        provider: 'huggingface',
        status: 'failed',
        error: error.message
      };
    }
  }
}
