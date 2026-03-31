import React, { useRef, useState, useEffect } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  period: string;
  tagline: string;
  description: string;
  target: string;
  features: Array<{ text: string; included: boolean }>;
  popular?: boolean;
  recommended?: boolean;
  color: string;
  gradient: string;
  icon: string;
  cta: string;
  benefit: string;
}

interface SubscriptionSliderProps {
  plans: Plan[];
  billingCycle: 'monthly' | 'annual';
  onSelectPlan: (plan: Plan) => void;
}

export const SubscriptionSlider: React.FC<SubscriptionSliderProps> = ({
  plans,
  billingCycle,
  onSelectPlan,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      setMaxScroll(container.scrollWidth - container.clientWidth);
      
      const handleScroll = () => setScrollPosition(container.scrollLeft);
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getPrice = (plan: Plan) => billingCycle === 'annual' ? plan.annualPrice : plan.price;

  const formatPrice = (price: number) => {
    if (price === 0) return 'GRATIS';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Flechas de navegación */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 size-12 bg-black/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:bg-primary ${
          scrollPosition <= 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 size-12 bg-black/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:bg-primary ${
          scrollPosition >= maxScroll ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      {/* Contenedor del slider */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`relative flex-shrink-0 w-80 md:w-96 scroll-snap-align-start group perspective-1000`}
          >
            {/* Tarjeta con efecto 3D */}
            <div
              className={`relative h-full rounded-3xl overflow-hidden transition-all duration-500 transform-style-3d ${
                plan.popular || plan.recommended
                  ? 'ring-2 ring-primary shadow-2xl shadow-primary/20 hover:scale-[1.02] hover:-translate-y-2'
                  : 'ring-1 ring-white/10 hover:scale-[1.02] hover:-translate-y-1'
              }`}
              onClick={() => onSelectPlan(plan)}
            >
              {/* Animated glow border */}
              {(plan.popular || plan.recommended) && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 animate-pulse pointer-events-none" />
              )}

              {/* Popular Badge */}
              {(plan.popular || plan.recommended) && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-purple-500 py-2 text-center z-20 shadow-lg shadow-primary/50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      {plan.popular ? 'Más Popular' : 'Recomendado'}
                    </span>
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
              )}

              {/* Contenido de la tarjeta */}
              <div className={`relative h-full bg-gradient-to-br ${plan.gradient} p-6 ${(plan.popular || plan.recommended) ? 'pt-14' : ''}`}>
                {/* Icono y nombre */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`size-14 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-3xl ${plan.color}`}>{plan.icon}</span>
                  </div>
                  <div>
                    <h3 className={`font-black text-2xl ${plan.color}`}>{plan.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{plan.target}</p>
                  </div>
                </div>

                {/* Precio */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-white">{formatPrice(getPrice(plan))}</span>
                    {getPrice(plan) !== 0 && (
                      <span className="text-gray-400">/{plan.period}</span>
                    )}
                  </div>
                  {billingCycle === 'annual' && getPrice(plan) > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold">
                        Ahorras ${((plan.price * 12) - plan.annualPrice).toFixed(2)}/año
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full font-black">
                        -{Math.round(((plan.price * 12 - plan.annualPrice) / (plan.price * 12)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Tagline */}
                <p className="text-sm text-gray-300 mb-6 line-clamp-2">{plan.tagline}</p>

                {/* Beneficio principal */}
                <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Beneficio Principal</p>
                  <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                    {plan.benefit}
                  </p>
                </div>

                {/* Características */}
                <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                  {plan.features.slice(0, 6).map((feature, i) => (
                    <li 
                      key={i} 
                      className={`flex items-start gap-2 text-xs ${
                        feature.included ? 'text-gray-300' : 'text-gray-600 opacity-50'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-lg flex-shrink-0 ${
                        feature.included ? 'text-emerald-400' : 'text-gray-700'
                      }`}>
                        {feature.included ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="line-clamp-2">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(plan);
                  }}
                  className={`w-full py-4 rounded-xl font-black text-sm transition-all duration-300 transform group-hover:scale-[1.02] ${
                    plan.popular || plan.recommended
                      ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30 hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Ver beneficios link */}
                <p className="text-center text-xs text-gray-400 mt-3 group-hover:text-primary transition-colors cursor-pointer">
                  Ver todos los beneficios →
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de scroll */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <span className="text-xs text-gray-400">
            {scrollPosition <= 0 ? 'Primero' : scrollPosition >= maxScroll ? 'Último' : `${Math.round((scrollPosition / maxScroll) * 100)}%`}
          </span>
          <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
              style={{ width: `${maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSlider;
