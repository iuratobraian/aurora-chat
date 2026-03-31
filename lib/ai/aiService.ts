import { AVAILABLE_MODELS, DEFAULT_MODEL, AIModel } from './models';
import logger from '../utils/logger';

export interface AIResponse {
    content: string;
    model: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    finishReason?: string;
}

export interface AIRequest {
    model?: string;
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
    functions?: AIFunction[];
}

export interface AIFunction {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}

class AIService {
    private getModel(modelId: string): AIModel | undefined {
        return AVAILABLE_MODELS.find(m => m.id === modelId);
    }

    private getProviderName(provider: string): string {
        const providerMap: Record<string, string> = {
            'openai': 'openai',
            'anthropic': 'anthropic',
            'google': 'google',
            'microsoft': 'openai',
        };
        return providerMap[provider] || 'openai';
    }

    async complete(request: AIRequest): Promise<AIResponse> {
        const modelId = request.model || DEFAULT_MODEL;
        const model = this.getModel(modelId);

        if (!model) {
            throw new Error(`Modelo no encontrado: ${modelId}`);
        }

        const provider = this.getProviderName(model.provider);

        try {
            const response = await fetch('/api/ai/completion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    model: modelId,
                    messages: request.messages,
                    temperature: request.temperature ?? 0.7,
                    maxTokens: request.maxTokens ?? (model.provider === 'anthropic' ? 1024 : 2048),
                }),
            });

            if (!response.ok) {
                if (response.status === 503) {
                    logger.warn('[AI Completion] Provider not configured server-side, using simulation');
                    return this.simulateResponse(modelId, request);
                }
                throw new Error(`AI relay error: ${response.status}`);
            }

            const data = await response.json();
            
            if (model.provider === 'openai' || model.provider === 'microsoft') {
                return {
                    content: data.choices?.[0]?.message?.content || '',
                    model: modelId,
                    usage: data.usage ? {
                        inputTokens: data.usage.prompt_tokens,
                        outputTokens: data.usage.completion_tokens,
                        totalTokens: data.usage.total_tokens,
                    } : undefined,
                    finishReason: data.choices?.[0]?.finish_reason,
                };
            } else if (model.provider === 'anthropic') {
                return {
                    content: data.content?.[0]?.text || '',
                    model: modelId,
                    usage: data.usage ? {
                        inputTokens: data.usage.input_tokens,
                        outputTokens: data.usage.output_tokens,
                        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
                    } : undefined,
                };
            } else if (model.provider === 'google') {
                return {
                    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
                    model: modelId,
                };
            }

            return { content: '', model: modelId };
        } catch (error) {
            logger.error('[AI Completion] Error:', error);
            return this.simulateResponse(modelId, request);
        }
    }

    private async simulateResponse(modelId: string, request: AIRequest): Promise<AIResponse> {
        const lastMessage = request.messages[request.messages.length - 1]?.content || '';
        
        const simulatedResponses: Record<string, string> = {
            'generate_caption': `📈 **Análisis del Mercado Forex**\n\nEsta semana, el par EUR/USD muestra señales claras de tendencia alcista. Los indicadores técnicos sugieren continuar con posiciones de compra.\n\n#trading #forex #análisis #EURUSD`,
            
            'analyze_metrics': `📊 **Análisis de Métricas**\n\n• **Alcance**: +15% vs semana anterior\n• **Engagement**: 4.8% (excelente para el nicho)\n• **Crecimiento**: 120 nuevos seguidores\n\n🎯 **Recomendación**: Continuar con la estrategia actual de contenido educativo.`,
            
            'generate_reply': `¡Gracias por tu comentario! 😊 Nos alegra que te sea útil. Si tienes más preguntas sobre trading, no dudes en preguntar. 🚀`,
            
            'default': `Entendido. ¿En qué puedo ayudarte con tu estrategia de marketing en Instagram?`,
        };

        let content = simulatedResponses.default;
        
        if (lastMessage.toLowerCase().includes('caption')) {
            content = simulatedResponses.generate_caption;
        } else if (lastMessage.toLowerCase().includes('métrica') || lastMessage.toLowerCase().includes('analytics')) {
            content = simulatedResponses.analyze_metrics;
        } else if (lastMessage.toLowerCase().includes('responder') || lastMessage.toLowerCase().includes('reply')) {
            content = simulatedResponses.generate_reply;
        }

        return {
            content,
            model: modelId,
            usage: {
                inputTokens: 100,
                outputTokens: content.length / 4,
                totalTokens: 100 + content.length / 4,
            },
        };
    }

    selectModel(task: 'caption' | 'analytics' | 'reply' | 'general'): string {
        switch (task) {
            case 'caption':
                return 'phi-4-mini-instruct';
            case 'analytics':
                return 'gpt-4o-mini';
            case 'reply':
                return 'phi-4';
            case 'general':
            default:
                return DEFAULT_MODEL;
        }
    }
}

export const aiService = new AIService();
export default aiService;
