import { AIProvider, AIProviderId, AIRequest, AIResponse } from './types';
import { HuggingFaceProvider } from './providers/huggingface';
import { OpenRouterProvider } from './providers/openrouter';
import { GroqProvider } from './providers/groq';
import { GeminiProvider } from './providers/gemini';
import { getEnv } from './env';

class AIOrchestrator {
  private providers: Map<AIProviderId, AIProvider> = new Map();
  private defaultProvider: AIProviderId = 'huggingface';

  constructor() {
    this.registerProvider(new HuggingFaceProvider());
    this.registerProvider(new OpenRouterProvider());
    this.registerProvider(new GroqProvider());
    this.registerProvider(new GeminiProvider());
    
    // Configurar default si hay mejores opciones disponibles
    if (!!getEnv('VITE_GROQ_API_KEY')) {
      this.defaultProvider = 'groq'; // Groq es el más rápido
    } else if (!!getEnv('VITE_OPENROUTER_API_KEY')) {
      this.defaultProvider = 'openrouter';
    } else if (!!getEnv('VITE_GEMINI_API_KEY')) {
      this.defaultProvider = 'gemini';
    }
  }

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  async generate(request: AIRequest, providerId?: AIProviderId): Promise<AIResponse> {
    const id = providerId || this.defaultProvider;
    const provider = this.providers.get(id);

    if (!provider || !provider.isAvailable()) {
      // Fallback a cualquier disponible
      const fallback = Array.from(this.providers.values()).find(p => p.isAvailable());
      if (!fallback) {
        return {
          generatedText: '',
          model: request.model || 'unknown',
          provider: id,
          status: 'failed',
          error: 'No available AI providers'
        };
      }
      return fallback.generate(request);
    }

    return provider.generate(request);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.values())
      .filter(p => p.isAvailable())
      .map(p => p.id);
  }
}

export const aiOrchestrator = new AIOrchestrator();
