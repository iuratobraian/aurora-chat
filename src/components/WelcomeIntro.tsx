import React, { useState, useEffect } from 'react';

interface WelcomeIntroProps {
  onFinish: () => void;
}

const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [progress, setProgress] = useState(0);

  const phrases = [
    "La paciencia es el activo más valioso del trader.",
    "No operes lo que quieres que pase, opera lo que ves.",
    "El mercado es un dispositivo para transferir dinero de los impacientes a los pacientes.",
    "Tu disciplina determinará tu éxito en los mercados.",
    "El riesgo viene de no saber lo que estás haciendo."
  ];

  const randomQuote = phrases[Math.floor(Math.random() * phrases.length)];

  useEffect(() => {
    const totalDuration = 5000;
    const interval = 50;
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / totalDuration) * 100, 95));
      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
      }
    }, interval);

    const t1 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setPhase('done');
        setTimeout(onFinish, 300);
      }, 400);
    }, totalDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(t1);
    };
  }, [onFinish]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#05070a] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-primary/8 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 size-[300px] bg-violet-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-md">
        <div className="relative size-24">
          <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-t-2 border-primary/60 animate-spin-electric shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          <div className="absolute inset-3 rounded-full border border-primary/10 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary/70 animate-pulse">bolt</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Cargando mercados...
          </p>

          <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest">
            {randomQuote}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeIntro;
