import { aiService, type AIRequest, type AIResponse } from './aiService';
import logger from '../utils/logger';

export interface CommunityContext {
    communityId?: string;
    communityName?: string;
    category?: string;
    userRole?: 'member' | 'moderator' | 'admin';
    memberCount?: number;
}

export interface SupportQuery {
    query: string;
    context?: 'general' | 'trading' | 'technical' | 'account' | 'content';
    communityContext?: CommunityContext;
    userXp?: number;
}

export interface SupportResponse {
    content: string;
    suggestedActions?: string[];
    relatedArticles?: string[];
    escalationNeeded: boolean;
    confidence: number;
}

const COMMUNITY_SUPPORT_PROMPT = `Eres el asistente de soporte comunitario de TradePortal. Ayudas a usuarios en comunidades de trading.

RESPONSABILIDADES:
- Responder dudas sobre trading, estrategias y análisis técnico
- Guiar en el uso de features de la comunidad
- Detectar preguntas que requieren intervención humana
- Mantener tono profesional pero amigable

REGLAS:
1. Si preguntan sobre dinero real o inversiones específicas, recomienda consultar un asesor financiero
2. Si reportan contenido inapropiado, sugiere usar el botón de reporte
3. Si hay problemas técnicos, ofrece soluciones básicas y escalación si no funciona
4. Nunca des consejos financieros específicos ni garantices ganancias
5. Para preguntas complejas sobre la plataforma, sugiere contactar soporte@tradeportal.com

IDIOMA: Responde siempre en español, salvo que el usuario escriba en otro idioma.`;

const TRADING_CONTEXT_PROMPT = `CONOCIMIENTO DE TRADING:
- Análisis técnico: soporte/resistencia, tendencias, patrones chartistas
- Gestión de riesgo: ratio riesgo/beneficio, position sizing
- Pares populares: EUR/USD, GBP/USD, BTC/USD, ETH/USD
- Timeframes: scalping (1-5m), day trading (15m-1h), swing (4h-daily)

INFORMACIÓN DE LA PLATAFORMA:
- Señales: operaciones de traders pro con entry, SL, TP
- Comunidades: grupos temáticos de trading
- XP: sistema de puntos por actividad
- Streaks: racha diaria de login`;

export class CommunitySupportAgent {
    private static instance: CommunitySupportAgent;

    static getInstance(): CommunitySupportAgent {
        if (!CommunitySupportAgent.instance) {
            CommunitySupportAgent.instance = new CommunitySupportAgent();
        }
        return CommunitySupportAgent.instance;
    }

    async getResponse(query: SupportQuery): Promise<SupportResponse> {
        try {
            const contextPrompt = this.buildContextPrompt(query);
            
            const request: AIRequest = {
                messages: [
                    { role: 'system', content: `${COMMUNITY_SUPPORT_PROMPT}\n\n${contextPrompt}` },
                    { role: 'user', content: query.query },
                ],
                temperature: 0.7,
                maxTokens: 800,
            };

            const result = await aiService.complete(request);
            
            return {
                content: result.content,
                suggestedActions: this.extractActions(result.content),
                escalationNeeded: this.shouldEscalate(query.query),
                confidence: this.calculateConfidence(query),
            };
        } catch (error) {
            logger.error('[CommunitySupportAgent] Error:', error);
            return {
                content: 'Lo siento, tuve un problema al procesar tu consulta. ¿Podrías reformular tu pregunta?',
                escalationNeeded: false,
                confidence: 0,
            };
        }
    }

    private buildContextPrompt(query: SupportQuery): string {
        let prompt = '';

        if (query.userXp !== undefined) {
            prompt += `\nNivel del usuario: ${query.userXp} XP\n`;
            if (query.userXp < 100) {
                prompt += '- Usuario nuevo: dar respuestas más detalladas y orientadas\n';
            }
        }

        if (query.communityContext) {
            const ctx = query.communityContext;
            prompt += `\nContexto de comunidad:\n`;
            if (ctx.communityName) prompt += `- Nombre: ${ctx.communityName}\n`;
            if (ctx.category) prompt += `- Categoría: ${ctx.category}\n`;
            if (ctx.memberCount) prompt += `- Miembros: ${ctx.memberCount}\n`;
            if (ctx.userRole) prompt += `- Tu rol: ${ctx.userRole}\n`;
        }

        if (query.context) {
            prompt += `\nÁrea de consulta: ${query.context}\n`;
            if (query.context === 'trading') {
                prompt += `${TRADING_CONTEXT_PROMPT}\n`;
            }
        }

        return prompt;
    }

    private extractActions(content: string): string[] {
        const actions: string[] = [];
        
        if (content.includes('contactar') || content.includes('soporte@')) {
            actions.push('Contactar soporte');
        }
        if (content.includes('reportar') || content.includes('reporte')) {
            actions.push('Reportar contenido');
        }
        if (content.includes('comunidad')) {
            actions.push('Explorar comunidades');
        }
        if (content.includes('señal')) {
            actions.push('Ver señales');
        }

        return actions.slice(0, 3);
    }

    private shouldEscalate(query: string): boolean {
        const escalatePatterns = [
            /problema.*grave/i,
            /error.*serio/i,
            /no.*funciona.*nada/i,
            /estafa/i,
            /dinero.*perdido/i,
            /cuenta.*hackeada/i,
        ];

        return escalatePatterns.some(pattern => pattern.test(query));
    }

    private calculateConfidence(query: SupportQuery): number {
        let confidence = 0.7;

        if (query.context === 'trading') confidence += 0.1;
        if (query.context === 'technical') confidence += 0.15;
        if (query.userXp && query.userXp > 500) confidence += 0.05;

        return Math.min(confidence, 0.95);
    }

    getQuickHelp(category: string): string {
        const quickHelp: Record<string, string> = {
            trading: '📈 ¿Buscas ayuda con trading?\n\n• **Señales**: Operaciones de traders pro con entry, SL y TP\n• **Estrategias**: Explora comunidades de estrategias\n• **Análisis**: Aprende de otros traders en el feed',
            technical: '🔧 ¿Problemas técnicos?\n\n1. Recarga la página\n2. Limpia caché del navegador\n3. Prueba otro navegador\n\nSi persiste: soporte@tradeportal.com',
            account: '👤 ¿Problemas con tu cuenta?\n\n• Cambiar contraseña: Perfil > Configuración\n• Recuperar cuenta: soporte@tradeportal.com\n• Verificar cuenta: Perfil > Verificación',
            content: '📝 ¿Dudas sobre contenido?\n\n• Crear post: Botón "+" en Comunidad\n• Reportar: Menú > Reportar\n• Guardar: Icono de marcador',
        };

        return quickHelp[category] || quickHelp.general || '¿En qué puedo ayudarte?';
    }
}

export const communitySupportAgent = CommunitySupportAgent.getInstance();
