import React, { useState, useEffect, useRef } from 'react';
import { Usuario } from '../types';
import { UserSignalsService } from '../services/analytics/userSignals';
import { ExperienceSelector } from './onboarding/ExperienceSelector';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  cta?: string;
  upgradeCta?: {
    label: string;
    position: string;
  };
}

const STEPS: OnboardingStep[] = [
  { id: 0, title: "Tu Experiencia", description: "Selecciona tu nivel para personalizar tu feed y cursos.", icon: "🎓", cta: "Siguiente" },
  { id: 1, title: "Bienvenido a TradeHub", description: "La comunidad de trading social donde los mejores analistas comparten sus estrategias.", icon: "🎯", cta: "Descubre más" },
  { id: 2, title: "Análisis en tiempo real", description: "Ve las mejores ideas de trading publicadas por nuestra comunidad.", icon: "📊", cta: "Ver análisis", upgradeCta: { label: "Desbloquear señales Pro", position: "signals_cta" } },
  { id: 3, title: "Sigue a traders exitosos", description: "Descubre traders verificados con historial de precisión.", icon: "👥", cta: "Explorar traders" },
  { id: 4, title: "Comunidades exclusivas", description: "Únete a comunidades de forex, crypto, opciones y más.", icon: "🏘️", cta: "Ver comunidades", upgradeCta: { label: "Ver comunidades privadas", position: "communities_cta" } },
  { id: 5, title: "Tu perfil profesional", description: "Completa tu perfil y empieza a compartir tu conocimiento.", icon: "✨", cta: "Completar perfil" }
];

interface OnboardingFlowProps {
  usuario: Usuario | null;
  onComplete: () => void;
  onUpgradeRequest?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ usuario, onComplete, onUpgradeRequest }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const hasTrackedStart = useRef(false);
  const stepsViewedRef = useRef(0);
  const userId = usuario?.id || 'guest';

  useEffect(() => {
    if (usuario && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      stepsViewedRef.current = 1;
      UserSignalsService.trackOnboardingStarted(userId, STEPS.length);
      UserSignalsService.trackOnboardingStep(userId, 1, STEPS.length);
    }
  }, [usuario, userId]);

  useEffect(() => {
    if (usuario && hasTrackedStart.current && currentStep > 0) {
      stepsViewedRef.current = currentStep + 1;
      UserSignalsService.trackOnboardingStep(userId, currentStep + 1, STEPS.length);
    }
  }, [currentStep, usuario, userId]);

  useEffect(() => {
    const step = STEPS[currentStep];
    if (usuario && step.upgradeCta && onUpgradeRequest) {
      UserSignalsService.trackUpgradeCtaViewed(userId, step.id, step.upgradeCta.position);
    }
  }, [currentStep, usuario, userId, onUpgradeRequest]);

  const handleUpgradeClick = () => {
    if (usuario) {
      UserSignalsService.trackUpgradeCtaClicked(userId, STEPS[currentStep].id, STEPS[currentStep].upgradeCta?.position || 'unknown');
    }
    onUpgradeRequest?.();
  };

  const handleComplete = () => {
    if (usuario) {
      UserSignalsService.trackOnboardingCompleted(userId, stepsViewedRef.current, STEPS.length);
    }
    onComplete();
  };

  const handleSkip = () => {
    if (usuario) {
      UserSignalsService.trackOnboardingDropped(userId, currentStep + 1, STEPS.length, 'skip');
    }
    onComplete();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] rounded-3xl p-8 max-w-md w-full border border-primary/30 shadow-2xl shadow-primary/10">
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>Paso {currentStep + 1} de {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {currentStep === 0 ? (
          <ExperienceSelector 
            userId={userId} 
            onSelect={(level) => {
              // We'll update the profile experience here
              // For now, just go to the next step
              handleNext();
            }} 
          />
        ) : (
          <div className="text-center mb-6">
            <span className="text-7xl mb-6 block animate-bounce">{step.icon}</span>
            <h2 className="text-2xl font-black text-white mb-3">{step.title}</h2>
            <p className="text-gray-400 leading-relaxed">{step.description}</p>
          </div>
        )}

        {step.upgradeCta && onUpgradeRequest && (
          <div className="mb-6">
            <button
              onClick={handleUpgradeClick}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-amber-500/20 border border-amber-400/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">workspace_premium</span>
              {step.upgradeCta.label}
            </button>
            <p className="text-[8px] text-gray-500 text-center mt-1.5">Incluido en Plan Pro — 1 clic</p>
          </div>
        )}
        
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-primary scale-125' : i < currentStep ? 'bg-primary/50' : 'bg-gray-600'}`} 
            />
          ))}
        </div>
        
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button 
              onClick={handlePrev} 
              className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}
          <button 
            onClick={handleSkip} 
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-all"
          >
            Omitir todo
          </button>
          <button 
            onClick={handleNext} 
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            {currentStep === STEPS.length - 1 ? '¡Comenzar!' : step.cta || 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};
