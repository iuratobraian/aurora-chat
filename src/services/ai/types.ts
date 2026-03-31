/**
 * AI SERVICE TYPES & INTERFACES
 */

export type AIProviderId = 'huggingface' | 'openrouter' | 'groq' | 'gemini';

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  generatedText: string;
  confidence?: number;
  model: string;
  provider: AIProviderId;
  cached?: boolean;
  status: 'success' | 'failed' | 'degraded';
  error?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface AIProvider {
  id: AIProviderId;
  name: string;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
}
