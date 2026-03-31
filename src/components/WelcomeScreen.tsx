import React, { useState, useEffect } from 'react';
import ElectricLoader from './ElectricLoader';

interface WelcomeScreenProps {
  onComplete?: () => void;
}

const TRADER_PHRASES = [
  "El mercado no te quita dinero, te cobra por tus errores.",
  "No operes por necesidad, la necesidad nubla el juicio.",
  "La paciencia paga, la ansiedad cuesta.",
  "Planifica tu trade y tradea tu plan.",
  "El trading es 90% psicología y 10% técnica.",
  "Domina tu mente, dominarás el mercado.",
  "La disciplina es el puente entre tus metas y tus logros.",
  "El mejor trade es el que sigue tu plan, no el que gana más."
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [phrase, setPhrase] = useState('');

  useEffect(() => {
    setPhrase(TRADER_PHRASES[Math.floor(Math.random() * TRADER_PHRASES.length)]);
    
    // Auto-complete after 3.5 seconds if onComplete provided
    if (onComplete) {
        const timer = setTimeout(onComplete, 3500);
        return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#050608] flex items-center justify-center z-[1000] overflow-hidden">
      {/* Background Orbs to match the theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      <div className="relative text-center px-6 max-w-lg animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-12">
            <ElectricLoader size="lg" text="" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter italic">
            TRADE<span className="text-primary">SHARE</span>
        </h1>
        
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8 opacity-50"></div>
        
        <p className="text-gray-400 text-sm md:text-base font-bold uppercase tracking-[0.2em] leading-relaxed animate-in slide-in-from-bottom-4 duration-1000 delay-500">
            {phrase}
        </p>
        
        <div className="mt-12 flex items-center justify-center gap-2">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sincronizando con el servidor</span>
            <div className="flex gap-1">
                <div className="size-1 bg-primary rounded-full animate-bounce"></div>
                <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
