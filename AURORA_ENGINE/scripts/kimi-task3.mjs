import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea UI-021: Revisar componentes SkeletonCard y SkeletonList que acabo de crear.

Código de SkeletonCard.tsx:
\`\`\`typescript
import { memo } from 'react';

export interface SkeletonCardProps {
  variant?: 'post' | 'product' | 'user' | 'leaderboard';
  lines?: number;
  className?: string;
}

const shimmer = 'bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]';

export const SkeletonCard = memo(({ variant = 'post', lines = 3, className = '' }: SkeletonCardProps) => {
  return (
    <div className={\`rounded-2xl border border-white/10 bg-card-dark p-4 space-y-3 \${className}\`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={\`rounded-full \${shimmer} \${variant === 'user' ? 'w-12 h-12' : 'w-10 h-10'}\`} />
        <div className="flex-1 space-y-2">
          <div className={\`h-3 w-24 rounded-full \${shimmer}\`} />
          <div className={\`h-2 w-16 rounded-full \${shimmer}\`} />
        </div>
      </div>
      {/* ... variantes ... */}
    </div>
  );
});
\`\`\`

Código de SkeletonList.tsx:
\`\`\`typescript
import { memo } from 'react';
import { SkeletonCard, SkeletonCardProps } from './SkeletonCard';

export interface SkeletonListProps {
  count?: number;
  variant?: SkeletonCardProps['variant'];
  layout?: 'vertical' | 'grid';
  className?: string;
}

export const SkeletonList = memo(({ count = 5, variant = 'post', layout = 'vertical', className = '' }: SkeletonListProps) => {
  return (
    <div className={layout === 'grid' ? \`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 \${className}\` : \`space-y-4 \${className}\`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
});
\`\`\`

PREGUNTAS:
1. La animación shimmer es correcta o debo usar @keyframes en CSS?
2. Hay problemas de performance o accesibilidad?
3. Falta algo importante en la implementación?
4. Los componentes siguen buenas prácticas de React/Tailwind?

Responde conciso con mejoras críticas si las hay.`;

const result = await askKimi(prompt, { timeout: 300000 }); // 5 minutos para KIMI

console.log("\n💜 Respuesta de Kimi - UI-021:");
console.log(result.answer);
