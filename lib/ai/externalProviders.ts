export interface ExternalAIProvider {
  id: 'auto' | 'groq' | 'openrouter' | 'cerebras' | 'moonshot';
  label: string;
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
  available: boolean;
  priority: number;
  notes: string;
}

const providerRegistry: ExternalAIProvider[] = [
  {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    defaultModel: process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
    available: Boolean(process.env.GROQ_API_KEY),
    priority: 1,
    notes: 'Baja latencia, útil como primera opción para soporte y diagnóstico rápido.',
  },
  {
    id: 'moonshot',
    label: 'Moonshot (Kimi)',
    baseUrl: 'https://api.moonshot.ai/v1',
    apiKey: process.env.MOONSHOT_API_KEY,
    defaultModel: process.env.MOONSHOT_DEFAULT_MODEL || 'kimi-k2-0905-preview',
    available: Boolean(process.env.MOONSHOT_API_KEY),
    priority: 2,
    notes: 'Kimi K2.5 - Modelo multimodal avanzado de Moonshot AI con soporte para visión y reasoning.',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'qwen/qwen3-coder:free',
    available: Boolean(process.env.OPENROUTER_API_KEY),
    priority: 3,
    notes: 'Buen router multi-modelo para fallback y modelos free.',
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    apiKey: process.env.CEREBRAS_API_KEY,
    defaultModel: process.env.CEREBRAS_DEFAULT_MODEL || 'gpt-oss-120b',
    available: Boolean(process.env.CEREBRAS_API_KEY),
    priority: 4,
    notes: 'Útil para contexto largo y razonamiento rápido vía infraestructura externa.',
  },
];

export function getExternalAIProviders(): ExternalAIProvider[] {
  return providerRegistry;
}

export function getAvailableExternalAIProviders(): ExternalAIProvider[] {
  return providerRegistry.filter((provider) => provider.available).sort((a, b) => a.priority - b.priority);
}

export function getExternalAIProviderById(id?: string): ExternalAIProvider | undefined {
  if (!id || id === 'auto') return undefined;
  return providerRegistry.find((provider) => provider.id === id);
}
