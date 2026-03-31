/**
 * Google Gemini Provider
 * 
 * Enfoque en Gemini 1.5 Flash (Free Tier: 15 RPM)
 */

import { AIProvider, AIProviderId, AIRequest, AIResponse } from '../types';
import { getEnv } from '../env';

export class GeminiProvider implements AIProvider {
  readonly id: AIProviderId = 'gemini';
  readonly name = 'Google Gemini';

  isAvailable(): boolean {
    return !!getEnv('VITE_GEMINI_API_KEY');
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = getEnv('VITE_GEMINI_API_KEY') || '';
    const defaultModel = request.model || 'gemini-1.5-flash';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${defaultModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt }] }],
          generationConfig: {
            maxOutputTokens: request.maxTokens || 1000,
            temperature: request.temperature || 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        generatedText,
        confidence: 1.0,
        model: defaultModel,
        provider: 'gemini',
        status: 'success'
      };
    } catch (error: any) {
      return {
        generatedText: '',
        model: defaultModel,
        provider: 'gemini',
        status: 'failed',
        error: error.message
      };
    }
  }
}
