import { useState, useCallback, useEffect } from 'react';
import { aiService, type AIRequest, type AIResponse } from '../../lib/ai/aiService';
import { CoachService, type CoachRecommendation } from '../../lib/ai/coach';
import type { Usuario } from '../types';

export type AIAssistantMode = 'onboarding' | 'support' | 'general' | 'coach';

interface UseAIAssistantOptions {
  userId?: string;
  mode?: AIAssistantMode;
  user?: Usuario | null;
  enabled?: boolean;
}

interface UseAIAssistantReturn {
  isLoading: boolean;
  response: string | null;
  error: string | null;
  mode: AIAssistantMode;
  sendMessage: (message: string) => Promise<void>;
  clearResponse: () => void;
  getOnboardingHelp: (step: string) => string;
  getSupportAnswer: (question: string) => string;
  coachRecommendations: CoachRecommendation[];
  topCoachRecommendation: CoachRecommendation | null;
}

const SYSTEM_PROMPTS: Record<AIAssistantMode, string> = {
  onboarding: `Eres un asistente amigable de TradePortal. Guía al usuario en su primera experiencia:
- Explica el propósito de la plataforma: comunidad de traders
- Sugiere crear un primer post o unirse a una comunidad
- Ayuda a configurar el perfil
- Sé breve y encouraging`,

  support: `Eres el soporte técnico de TradePortal. Ayudas a resolver dudas:
- Trading, señales, comunidades
- Errores técnicos comunes
- Uso de features
- Si no sabes algo, sugiere contactar soporte@tradeportal.com`,

  general: `Eres un asistente útil de TradePortal. Responde preguntas sobre:
- La comunidad y sus reglas
- Estrategias de trading
- Cómo usar las features
- Recomendaciones basadas en intereses del usuario`,

  coach: `Eres un coach de trading. Ayudas al usuario a mejorar:
- Analiza su progreso en la plataforma
- Sugiere siguiente mejor acción
- Motiva con streak y XP
- Recomienda contenido educativo`,
};

export function useAIAssistant({
  userId,
  mode = 'general',
  user,
  enabled = true,
}: UseAIAssistantOptions = {}): UseAIAssistantReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<AIAssistantMode>(mode);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const sendMessage = useCallback(async (message: string) => {
    if (!enabled || !message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: AIRequest = {
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[currentMode] },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        maxTokens: 500,
      };

      const result = await aiService.complete(request);
      setResponse(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar mensaje');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, currentMode]);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const getOnboardingHelp = useCallback((step: string): string => {
    const helpContent: Record<string, string> = {
      welcome: 'Bienvenido a TradePortal. Aquí puedes compartir ideas de trading, seguir a traders expertos y aprender.',
      profile: 'Ve a tu perfil y completa: nombre, avatar, bio y estadísticas de trading.',
      first_post: 'Crea tu primer post en la comunidad. Puedes compartir análisis, ideas o preguntas.',
      join_community: 'Explora comunidades como "Forex Beginners" o "Crypto Signals" y únete.',
      try_signals: 'Las señales muestran operaciones de traders pro. Puedes seguirlas para aprender.',
      invite_friends: 'Invita amigos y ambos ganan XP extra.',
    };

    return helpContent[step] || helpContent.welcome;
  }, []);

  const getSupportAnswer = useCallback((question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('error') || q.includes('no funciona')) {
      return '¿Encontraste un error? Prueba recargar la página. Si persiste, contacta soporte@tradeportal.com con una captura.';
    }
    if (q.includes('contraseña') || q.includes('password')) {
      return 'Para restablecer tu contraseña, ve a login y haz clic en "¿Olvidaste tu contraseña?"';
    }
    if (q.includes('señal') || q.includes('signal')) {
      return 'Las señales muestran operaciones de traders. Puedes verlas en la sección de Signals si tienes plan Pro.';
    }
    if (q.includes('comunidad')) {
      return 'Las comunidades agrupan traders con intereses similares. Únete a una para conectar y aprender.';
    }
    if (q.includes('pago') || q.includes('precio') || q.includes('pro')) {
      return 'Puedes ver los planes en /pricing. El plan Pro incluye señales, IA personalizada y comunidades ilimitadas.';
    }

    return 'Puedo ayudarte con dudas sobre trading, uso de la plataforma o problemas técnicos. ¿En qué puedo ayudarte?';
  }, []);

  const coachRecommendations = CoachService.getDailyRecommendations(user);
  const topCoachRecommendation = CoachService.getTopRecommendation(user);

  return {
    isLoading,
    response,
    error,
    mode: currentMode,
    sendMessage,
    clearResponse,
    getOnboardingHelp,
    getSupportAnswer,
    coachRecommendations,
    topCoachRecommendation,
  };
}

export default useAIAssistant;
