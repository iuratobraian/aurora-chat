import { aiService, type AIRequest } from './aiService';
import logger from '../utils/logger';
import type { Usuario } from '../types';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    action?: string;
    completed: boolean;
    estimatedTime?: string;
}

export interface OnboardingProgress {
    currentStep: number;
    totalSteps: number;
    completionPercent: number;
    recommendedNextStep: string;
    xpEarned: number;
    streakStarted: boolean;
}

export interface OnboardingContext {
    user?: Partial<Usuario>;
    currentStep?: string;
    previousSteps?: string[];
    interests?: string[];
    tradingExperience?: 'beginner' | 'intermediate' | 'advanced';
}

const ONBOARDING_AGENT_PROMPT = `Eres el asistente de onboarding de TradePortal. Tu misión es ayudar a nuevos usuarios a tener la mejor primera experiencia.

PERSONALIDAD:
- Amigable y entusiasta
- Breve y orientado a la acción
- Celebra cada paso completado
- No agobies con información

ETAPAS DE ONBOARDING:
1. Bienvenida - Presentación de la plataforma
2. Perfil - Configurar nombre, avatar y bio
3. Primer post - Crear una primera publicación
4. Explorar comunidades - Unirse a comunidades de interés
5. Seguir traders - Conectar con traders recomendados
6. Configurar watchlist - Añadir pares de interés
7. Probar señales - Ver ejemplos de señales de trading
8. Completar streak - Iniciar racha diaria

REGLAS:
1. Solo menciona 1-2 pasos a la vez, no agobies
2. Celebra cuando completan algo
3. Sugiere la siguiente acción específica
4. Si llevan >2 min en un paso, ofrece ayuda
5. Para usuarios con experiencia, acelera el onboarding`;

export class OnboardingAgent {
    private static instance: OnboardingAgent;

    static getInstance(): OnboardingAgent {
        if (!OnboardingAgent.instance) {
            OnboardingAgent.instance = new OnboardingAgent();
        }
        return OnboardingAgent.instance;
    }

    private readonly onboardingSteps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Bienvenido a TradePortal',
            description: 'Tu comunidad de trading favorita',
            completed: false,
            estimatedTime: '1 min',
        },
        {
            id: 'profile',
            title: 'Configura tu perfil',
            description: 'Añade tu nombre, avatar y una bio',
            action: '/profile',
            completed: false,
            estimatedTime: '2 min',
        },
        {
            id: 'first_post',
            title: 'Crea tu primer post',
            description: 'Comparte una idea o pregunta',
            action: '/comunidad',
            completed: false,
            estimatedTime: '3 min',
        },
        {
            id: 'join_community',
            title: 'Únete a comunidades',
            description: 'Encuentra traders con tus intereses',
            action: '/discover',
            completed: false,
            estimatedTime: '2 min',
        },
        {
            id: 'follow_traders',
            title: 'Sigue a traders',
            description: 'Conecta con traders que te inspiren',
            completed: false,
            estimatedTime: '2 min',
        },
        {
            id: 'watchlist',
            title: 'Configura tu watchlist',
            description: 'Añade los pares que te interesan',
            completed: false,
            estimatedTime: '1 min',
        },
        {
            id: 'try_signals',
            title: 'Explora las señales',
            description: 'Ve cómo funcionan las señales de trading',
            completed: false,
            estimatedTime: '2 min',
        },
        {
            id: 'streak',
            title: 'Inicia tu racha',
            description: 'Entra cada día para mantener tu streak',
            completed: false,
            estimatedTime: '1 min',
        },
    ];

    getSteps(context?: OnboardingContext): OnboardingStep[] {
        const steps = [...this.onboardingSteps];

        if (context?.tradingExperience === 'advanced') {
            return steps.filter(s => 
                ['profile', 'first_post', 'join_community', 'streak'].includes(s.id)
            );
        }

        if (context?.tradingExperience === 'intermediate') {
            return steps.filter(s => 
                !['welcome'].includes(s.id)
            );
        }

        return steps;
    }

    getProgress(context?: OnboardingContext): OnboardingProgress {
        const completedSteps = context?.previousSteps?.length || 0;
        const steps = this.getSteps(context);
        const totalSteps = steps.length;

        return {
            currentStep: Math.min(completedSteps + 1, totalSteps),
            totalSteps,
            completionPercent: Math.round((completedSteps / totalSteps) * 100),
            recommendedNextStep: steps[completedSteps]?.id || 'complete',
            xpEarned: completedSteps * 10,
            streakStarted: completedSteps >= 7,
        };
    }

    async getPersonalizedGuidance(
        stepId: string,
        context?: OnboardingContext
    ): Promise<string> {
        try {
            const step = this.onboardingSteps.find(s => s.id === stepId);
            if (!step) return '';

            let prompt = `${ONBOARDING_AGENT_PROMPT}\n\n`;
            prompt += `Paso actual: ${step.title}\n`;
            prompt += `Descripción: ${step.description}\n`;

            if (context?.user) {
                const user = context.user;
                prompt += `\nInformación del usuario:\n`;
                if (user.xp) prompt += `- XP: ${user.xp}\n`;
                if (user.nombre) prompt += `- Nombre: ${user.nombre}\n`;
                if (user.watchlist?.length) prompt += `- Watchlist: ${user.watchlist.join(', ')}\n`;
            }

            if (context?.tradingExperience) {
                prompt += `- Experiencia: ${context.tradingExperience}\n`;
            }

            prompt += `\nGenera una guía breve para completar este paso:`;

            const request: AIRequest = {
                messages: [
                    { role: 'system', content: ONBOARDING_AGENT_PROMPT },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.8,
                maxTokens: 400,
            };

            const result = await aiService.complete(request);
            return result.content;
        } catch (error) {
            logger.error('[OnboardingAgent] Error:', error);
            return this.getFallbackGuidance(stepId);
        }
    }

    private getFallbackGuidance(stepId: string): string {
        const guidance: Record<string, string> = {
            welcome: '👋 ¡Bienvenido! TradePortal es tu comunidad de trading. Aquí puedes compartir ideas, aprender de otros traders y descubrir nuevas estrategias.',
            profile: '📝 Ve a tu perfil y añade:\n• Tu nombre o apodo\n• Una foto de perfil\n• Una breve bio\n\nEsto ayuda a otros traders a conocerte.',
            first_post: '✍️ Tu primer post puede ser:\n• Una pregunta sobre trading\n• Una idea de análisis\n• Un recurso que te haya ayudado\n\nNo te preocupes por la perfección, ¡todos empezamos así!',
            join_community: '🏘️ Explora comunidades como:\n• Forex Beginners - Para aprender lo básico\n• Crypto Signals - Para ver ejemplos de señales\n• Day Trading - Para traders activos\n\nÚnete a 1-2 que te interesen.',
            follow_traders: '⭐ Busca traders con buen track record:\n• Mira su XP y badges\n• Revisa sus posts recientes\n• Comprueba su win rate\n\nSeguir traders te ayuda a aprender de sus decisiones.',
            watchlist: '📊 Añade a tu watchlist:\n• Los pares que operas\n• Los que estás estudiando\n• Los que te interesan\n\nAsí ves su precio fácilmente.',
            try_signals: '📈 Las señales muestran:\n• Entrada (precio de compra/venta)\n• Stop Loss (protección)\n• Take Profit (objetivo)\n\nEstúdialas para entender cómo operan los pros.',
            streak: '🔥 Mantén tu racha:\n• Entra al menos una vez al día\n• Cada día suma XP extra\n• Perderás tu racha si no entras en 24h\n\n¡Anímate a entrar cada día!',
        };

        return guidance[stepId] || 'Continúa con el siguiente paso.';
    }

    async celebrateCompletion(context?: OnboardingContext): Promise<string> {
        const userName = context?.user?.nombre || 'trader';
        const xpEarned = this.getProgress(context).xpEarned;

        return `🎉 ¡Felicidades, ${userName}!\n\nHas completado el onboarding.\n• XP ganada: ${xpEarned + 50}\n• Tu streak ha comenzado\n\nAhora eres parte de la comunidad. Explora, aprende y comparte tus ideas de trading.\n\n¿Listo para tu primera aventura?`;
    }

    getRecommendedContent(context?: OnboardingContext): string[] {
        if (!context) return [];

        const interests = context.interests || [];
        const watchlist = context.user?.watchlist || [];

        const allInterests = [...interests, ...watchlist].map(i => i.toLowerCase());

        if (allInterests.some(i => i.includes('forex') || i.includes('eur') || i.includes('gbp'))) {
            return [
                'Forex para principiantes',
                'Análisis EUR/USD semanal',
                'Gestión de riesgo en forex',
            ];
        }

        if (allInterests.some(i => i.includes('crypto') || i.includes('btc') || i.includes('eth'))) {
            return [
                'Introducción al trading de crypto',
                'Bitcoin: Análisis técnico',
                'DeFi para traders',
            ];
        }

        return [
            'Primeros pasos en trading',
            'Entender los gráficos',
            'Gestión de emociones',
        ];
    }
}

export const onboardingAgent = OnboardingAgent.getInstance();
