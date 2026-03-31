import React, { memo, useState, useEffect } from 'react';

interface RetentionOverlayProps {
  onDismiss: () => void;
}

const MOTIVATIONAL_TIPS = [
  { icon: 'school', title: 'Aprende algo nuevo hoy', subtitle: 'El conocimiento compuesto es tu mayor ventaja' },
  { icon: 'trending_up', title: 'Los mercados no esperan', subtitle: 'Cada día trae nuevas oportunidades' },
  { icon: 'groups', title: 'Conecta con la comunidad', subtitle: 'El networking acelera tu aprendizaje' },
  { icon: 'psychology', title: 'La mente es tu herramienta', subtitle: 'Control emocional = control del trading' },
  { icon: 'workspace_premium', title: 'Tu progreso se acumula', subtitle: 'Cada operación es un paso hacia adelante' },
  { icon: 'insights', title: 'Los datos cuentan historias', subtitle: 'Revisa tu bitácora y aprende' },
];

export const RetentionOverlay: React.FC<RetentionOverlayProps> = memo(({ onDismiss }) => {
  const [tip] = useState(() => MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)]);
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const handleDismiss = () => {
    setShowContent(false);
    setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-[9997] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleDismiss}
    >
      <div 
        className={`relative max-w-md w-full mx-4 transform transition-all duration-500 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-violet-500 to-cyan-400 rounded-3xl blur-lg opacity-30 animate-pulse" />
        
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
                {tip.icon}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-wide">
              {tip.title}
            </h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              {tip.subtitle}
            </p>
          </div>

          {/* Quote */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-gray-500 font-light italic text-center">
              "La consistencia es más importante que la perfección. 
              Un paso al día te lleva lejos."
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleDismiss}
              className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              Continuar explorando
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'comunidad' }))}
              className="w-full py-3 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
            >
              Ir al feed
            </button>
          </div>

          {/* Motivational counter */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 font-light">
              247 traders están activos ahora mismo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

interface StayMotivatedWidgetProps {
  className?: string;
}

export const StayMotivatedWidget: React.FC<StayMotivatedWidgetProps> = memo(({ className = '' }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    { icon: 'local_fire_department', text: '3 posts nuevos esta semana', color: 'text-orange-400' },
    { icon: 'emoji_events', text: 'Top 10% de la comunidad', color: 'text-yellow-400' },
    { icon: 'trending_up', text: '+12% de engagement', color: 'text-green-400' },
    { icon: 'groups', text: '58 conexiones nuevas', color: 'text-blue-400' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`glass rounded-xl p-4 border border-white/5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${tips[tipIndex].color} animate-pulse`}>
          {tips[tipIndex].icon}
        </span>
        <p className="text-xs text-gray-400">{tips[tipIndex].text}</p>
      </div>
    </div>
  );
});
