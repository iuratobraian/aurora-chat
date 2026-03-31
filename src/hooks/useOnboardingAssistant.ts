import { useState, useCallback, useMemo } from 'react';
import { onboardingAgent, type OnboardingStep, type OnboardingProgress, type OnboardingContext } from '../../lib/ai/onboardingAgent';
import type { Usuario } from '../types';

interface UseOnboardingAssistantOptions {
    user?: Partial<Usuario> | null;
    tradingExperience?: 'beginner' | 'intermediate' | 'advanced';
    enabled?: boolean;
}

interface UseOnboardingAssistantReturn {
    isLoading: boolean;
    guidance: string;
    error: string | null;
    steps: OnboardingStep[];
    progress: OnboardingProgress;
    currentStep: OnboardingStep | null;
    nextStep: OnboardingStep | null;
    completeStep: (stepId: string) => void;
    resetOnboarding: () => void;
    getCelebration: () => Promise<string>;
    recommendedContent: string[];
}

export function useOnboardingAssistant({
    user,
    tradingExperience = 'beginner',
    enabled = true,
}: UseOnboardingAssistantOptions = {}): UseOnboardingAssistantReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [guidance, setGuidance] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    const context: OnboardingContext = useMemo(() => ({
        user,
        previousSteps: completedSteps,
        tradingExperience,
    }), [user, completedSteps, tradingExperience]);

    const steps = useMemo(() => {
        const allSteps = onboardingAgent.getSteps(context);
        return allSteps.map(step => ({
            ...step,
            completed: completedSteps.includes(step.id),
        }));
    }, [context, completedSteps]);

    const progress = useMemo(() => ({
        ...onboardingAgent.getProgress(context),
        xpEarned: completedSteps.length * 10,
    }), [context, completedSteps.length]);

    const currentStep = useMemo(() => {
        return steps.find(s => !s.completed) || null;
    }, [steps]);

    const nextStep = useMemo(() => {
        const currentIndex = steps.findIndex(s => !s.completed);
        return currentIndex >= 0 && currentIndex < steps.length - 1 
            ? steps[currentIndex + 1] 
            : null;
    }, [steps]);

    const recommendedContent = useMemo(() => {
        return onboardingAgent.getRecommendedContent(context);
    }, [context]);

    const completeStep = useCallback((stepId: string) => {
        setCompletedSteps(prev => {
            if (prev.includes(stepId)) return prev;
            return [...prev, stepId];
        });
        setGuidance('');
    }, []);

    const resetOnboarding = useCallback(() => {
        setCompletedSteps([]);
        setGuidance('');
        setError(null);
    }, []);

    const fetchGuidance = useCallback(async (stepId: string) => {
        if (!enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const guidanceText = await onboardingAgent.getPersonalizedGuidance(stepId, context);
            setGuidance(guidanceText);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al obtener guía');
        } finally {
            setIsLoading(false);
        }
    }, [enabled, context]);

    const getCelebration = useCallback(async () => {
        return onboardingAgent.celebrateCompletion(context);
    }, [context]);

    return {
        isLoading,
        guidance,
        error,
        steps,
        progress,
        currentStep,
        nextStep,
        completeStep,
        resetOnboarding,
        getCelebration,
        recommendedContent,
    };
}

export default useOnboardingAssistant;
