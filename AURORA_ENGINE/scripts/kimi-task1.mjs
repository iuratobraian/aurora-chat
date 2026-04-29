import { askKimi } from "./aurora-kimi-agent.mjs";

const subscriptionSliderCode = `import { useState, useEffect, useCallback } from 'react';

export interface PlanSlide {
  name: string;
  price: number;
  period: string;
  features: string[];
  color: string;
  gradient: string;
  icon: string;
  badge?: string;
}

const PLANS: PlanSlide[] = [
  { name: 'FREE', price: 0, period: 'para siempre', features: ['Feed público', 'Chat general', '1 EA básico', 'Comunidad'], color: 'from-gray-500 to-gray-600', gradient: 'from-gray-500/20 to-gray-600/10', icon: 'person' },
  { name: 'PRO', price: 29, period: '/mes', features: ['Señales ilimitadas', 'Chat privado', 'Todos los EAs', 'Soporte priority'], color: 'from-primary to-blue-600', gradient: 'from-primary/20 to-blue-600/10', icon: 'workspace_premium', badge: 'Popular' },
  { name: 'ELITE', price: 79, period: '/mes', features: ['Todo Pro +', 'Mentoría 1:1', 'EAs exclusivos', 'Acceso anticipado'], color: 'from-amber-500 to-orange-500', gradient: 'from-amber-500/20 to-orange-500/10', icon: 'diamond', badge: 'Mejor valor' },
  { name: 'CREATOR', price: 49, period: '/mes', features: ['Todo Pro +', 'Revenue share', 'Analytics pro', 'Marketing tools'], color: 'from-violet-500 to-purple-600', gradient: 'from-violet-500/20 to-purple-600/10', icon: 'storefront' },
];

export function SubscriptionSlider({ onNavigate, autoPlayInterval = 4000, className = '' }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % PLANS.length);
  }, []);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + PLANS.length) % PLANS.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [next, autoPlayInterval, isPaused]);

  const plan = PLANS[current];

  return (
    <div
      className={\`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br \${plan.gradient} p-3 transition-all duration-500 \${className}\`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Contenido del slider... */}
      <button onClick={prev}>Anterior</button>
      <button onClick={next}>Siguiente</button>
      {/* Dots navigation */}
    </div>
  );
}`;

const prompt = `Analiza este código de SubscriptionSlider.tsx y dime si el auto-play cada 4s con pausa al hover está bien implementado o tiene bugs:

\`\`\`typescript
${subscriptionSliderCode}
\`\`\`

Verifica:
1. El setInterval se limpia correctamente?
2. La pausa al hover funciona bien?
3. Hay memory leaks?
4. El efecto se recrea innecesariamente?
5. Qué mejoras específicas necesitas?

Da una respuesta concisa y directa con los problemas encontrados (si los hay).`;

const result = await askKimi(prompt, { timeout: 300000 }); // 5 minutos para KIMI

console.log("\n💜 Respuesta de Kimi - FIX-006 (Análisis completo):");
console.log(result.answer);
