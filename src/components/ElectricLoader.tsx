import React, { useState, useEffect, useRef } from 'react';

interface Props {
  type?: 'welcome' | 'phrase' | 'bullbear';
  welcomeText?: string;
  phrase?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  minDuration?: number;
  direction?: 'buy' | 'sell';
}

const LOADING_MESSAGES = [
  "Conectando con los mercados...",
  "Sincronizando datos en tiempo real...",
  "Cargando análisis institucionales...",
  "Preparando tu experiencia...",
  "Estableciendo conexión segura...",
  "Optimizando rendimiento...",
  "Inicializando módulos...",
  "Verificando credenciales...",
];

const ElectricLoader: React.FC<Props> = ({ 
  type = 'phrase',
  welcomeText = 'Bienvenido a nuestra comunidad de trading',
  phrase = '',
  text = '',
  size = 'md',
  fullScreen = false,
  minDuration = 3500,
  direction = 'buy',
}) => {
  const [showText, setShowText] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState<'welcome' | 'loading' | 'ready'>('welcome');
  const startTimeRef = useRef<number>(Date.now());
  
  const finalText = type === 'welcome' ? welcomeText : (phrase || text || LOADING_MESSAGES[messageIndex]);

  useEffect(() => {
    setShowText(false);
    setTextContent('');
    setProgress(0);
    setMessageIndex(0);
    setPhase('welcome');
    startTimeRef.current = Date.now();
  }, [type]);

  useEffect(() => {
    if (!finalText) return;
    
    let index = 0;
    setShowText(true);
    
    const interval = setInterval(() => {
      if (index <= finalText.length) {
        setTextContent(finalText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    
    return () => clearInterval(interval);
  }, [finalText]);

  useEffect(() => {
    const elapsed = Date.now() - startTimeRef.current;
    
    const progressInterval = setInterval(() => {
      const now = Date.now();
      const totalElapsed = now - startTimeRef.current;
      const newProgress = Math.min((totalElapsed / minDuration) * 100, 95);
      setProgress(newProgress);
      
      if (totalElapsed >= minDuration && phase === 'welcome') {
        setPhase('ready');
        setProgress(100);
      }
    }, 50);
    
    return () => clearInterval(progressInterval);
  }, [minDuration, phase]);

  useEffect(() => {
    if (fullScreen) {
      const messageInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed < minDuration) return;
        
        setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(messageInterval);
    }
  }, [fullScreen, minDuration]);

  const sizeConfig = {
    sm: { ring: 'w-20 h-20', dot: 'w-1.5 h-1.5', icon: 'text-4xl' },
    md: { ring: 'w-28 h-28', dot: 'w-2 h-2', icon: 'text-5xl' },
    lg: { ring: 'w-36 h-36', dot: 'w-2.5 h-2.5', icon: 'text-6xl' }
  }[size];

  if (fullScreen) {
    const isReady = phase === 'ready';
    
    return (
      <div 
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#050608] to-black transition-opacity duration-700 ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative flex flex-col items-center gap-16 w-full max-w-xl px-8">
          <div className={`relative ${sizeConfig.ring}`}>
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-violet-500 animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-cyan-400 border-l-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
            <div className="absolute inset-4 rounded-full border border-transparent border-t-purple-400/50 border-r-pink-400/50 animate-spin" style={{ animationDuration: '2.5s' }} />
            <div className="absolute inset-6 rounded-full border border-transparent border-t-white/20 animate-spin" style={{ animationDuration: '3s' }} />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className={`${sizeConfig.icon} text-white/90 material-symbols-outlined font-black animate-pulse`}>
                  insights
                </div>
                <div className="absolute inset-0 blur-xl bg-blue-500/30 rounded-full animate-ping" />
              </div>
            </div>
            
            <div className="absolute -inset-4 rounded-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                   style={{ 
                     animation: 'orbit 3s linear infinite',
                     animationDelay: '0s'
                   }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                   style={{ 
                     animation: 'orbit 4s linear infinite reverse',
                     animationDelay: '0.5s'
                   }} />
            </div>
          </div>

          <div className="w-full text-center space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/70">TradeHub</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500/50" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide leading-relaxed">
                {textContent}
                <span className="inline-block w-1 h-8 bg-gradient-to-b from-blue-500 to-violet-500 ml-2 animate-pulse align-middle" />
              </h1>
            </div>

            <div className="space-y-4">
              <div className="w-full max-w-md mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  {Math.round(progress)}%
                </span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  {progress < 30 ? 'Inicializando...' : progress < 60 ? 'Conectando...' : progress < 90 ? 'Sincronizando...' : 'Casi listo...'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className={`${sizeConfig.dot} rounded-full bg-blue-500/60 animate-bounce`} style={{ animationDelay: '0ms', animationDuration: '1s' }} />
              <div className={`${sizeConfig.dot} rounded-full bg-violet-500/60 animate-bounce`} style={{ animationDelay: '150ms', animationDuration: '1s' }} />
              <div className={`${sizeConfig.dot} rounded-full bg-cyan-400/60 animate-bounce`} style={{ animationDelay: '300ms', animationDuration: '1s' }} />
            </div>

            <div className="pt-4 space-y-1">
              <p className="text-gray-600 text-[10px] font-medium tracking-widest">
                PREPARANDO TU EXPERIENCIA DE TRADING
              </p>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'bullbear') {
    const isBull = direction === 'buy';
    
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            isBull 
              ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/10 shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
              : 'bg-gradient-to-br from-red-500/30 to-orange-500/10 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
          } border ${isBull ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
            <span className={`material-symbols-outlined text-4xl ${isBull ? 'text-emerald-400' : 'text-red-400'} animate-pulse`}>
              {isBull ? 'trending_up' : 'trending_down'}
            </span>
          </div>
          <div className={`absolute -inset-2 rounded-xl ${isBull ? 'bg-emerald-500/20' : 'bg-red-500/20'} blur-xl animate-pulse`} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isBull ? 'bg-emerald-400' : 'bg-red-400'} animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`w-1.5 h-1.5 rounded-full ${isBull ? 'bg-emerald-400' : 'bg-red-400'} animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`w-1.5 h-1.5 rounded-full ${isBull ? 'bg-emerald-400' : 'bg-red-400'} animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <p className={`mt-3 text-sm font-medium ${isBull ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="relative flex flex-col items-center gap-8">
        <div className={`relative ${sizeConfig.ring}`}>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-transparent border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 animate-pulse" />
          </div>
        </div>

        <div className="text-center max-w-md space-y-4">
          <h2 className="text-xl font-bold text-white/80 tracking-wide leading-relaxed">
            {textContent}
            <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse align-middle" />
          </h2>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricLoader;
