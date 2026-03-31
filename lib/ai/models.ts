export interface AIModel {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'microsoft' | 'meta' | 'google';
    capabilities: ('chat' | 'vision' | 'embedding' | 'function_calling')[];
    contextWindow: number;
    maxTokens: number;
    pricing?: {
        input: number;
        output: number;
    };
}

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        capabilities: ['chat', 'vision', 'function_calling'],
        contextWindow: 128000,
        maxTokens: 16384,
        pricing: { input: 5, output: 15 },
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        capabilities: ['chat', 'vision', 'function_calling'],
        contextWindow: 128000,
        maxTokens: 16384,
        pricing: { input: 0.15, output: 0.6 },
    },
    {
        id: 'o4-mini',
        name: 'OpenAI o4-mini',
        provider: 'openai',
        capabilities: ['chat', 'function_calling'],
        contextWindow: 100000,
        maxTokens: 65536,
        pricing: { input: 1.1, output: 4.4 },
    },
    {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        provider: 'anthropic',
        capabilities: ['chat', 'vision', 'function_calling'],
        contextWindow: 200000,
        maxTokens: 8192,
        pricing: { input: 3, output: 15 },
    },
    {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        capabilities: ['chat', 'vision', 'function_calling'],
        contextWindow: 200000,
        maxTokens: 8192,
        pricing: { input: 3, output: 15 },
    },
    {
        id: 'phi-4',
        name: 'Phi-4',
        provider: 'microsoft',
        capabilities: ['chat', 'function_calling'],
        contextWindow: 16000,
        maxTokens: 4096,
    },
    {
        id: 'phi-4-reasoning',
        name: 'Phi-4 Reasoning',
        provider: 'microsoft',
        capabilities: ['chat'],
        contextWindow: 16000,
        maxTokens: 4096,
    },
    {
        id: 'phi-4-mini-instruct',
        name: 'Phi-4 Mini Instruct',
        provider: 'microsoft',
        capabilities: ['chat', 'function_calling'],
        contextWindow: 16000,
        maxTokens: 4096,
    },
    {
        id: 'jamba-1-5-large',
        name: 'AI21 Jamba 1.5 Large',
        provider: 'meta',
        capabilities: ['chat', 'function_calling'],
        contextWindow: 256000,
        maxTokens: 4096,
    },
    {
        id: 'gemini-2-0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        capabilities: ['chat', 'vision', 'function_calling'],
        contextWindow: 1000000,
        maxTokens: 8192,
    },
    {
        id: 'gemini-2-5-pro-preview-06-05',
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        capabilities: ['chat', 'vision', 'function_calling'],
        contextWindow: 2000000,
        maxTokens: 32768,
    },
];

export const DEFAULT_MODEL = 'phi-4-mini-instruct';
export const PREMIUM_MODEL = 'gpt-4o-mini';
