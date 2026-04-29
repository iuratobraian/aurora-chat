import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea UI-022: Revisar componente EmptyState que creé.

Código:
\`\`\`typescript
import { memo } from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: string;
  variant?: 'default' | 'search' | 'error' | 'offline' | 'empty-folder';
  className?: string;
}

const VARIANT_CONFIG = {
  default: { icon: 'inbox', title: 'Nada aquí por ahora' },
  search: { icon: 'search_off', title: 'Sin resultados' },
  error: { icon: 'error_outline', title: 'Algo salió mal' },
  offline: { icon: 'wifi_off', title: 'Sin conexión' },
  'empty-folder': { icon: 'folder_off', title: 'Carpeta vacía' },
};

export const EmptyState = memo(({ icon, title, description, actionText, onAction, actionIcon = 'add', variant = 'default', className = '' }: EmptyStateProps) => {
  const config = VARIANT_CONFIG[variant];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;

  return (
    <div className={\`flex flex-col items-center justify-center min-h-[50vh] p-8 text-center \${className}\`}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-white/20">{displayIcon}</span>
        </div>
      </div>
      <h3 className="text-lg font-black text-white/80 mb-2 tracking-wide">{displayTitle}</h3>
      {description && <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">{description}</p>}
      {actionText && onAction && (
        <button onClick={onAction} className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">{actionIcon}</span>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
});
\`\`\`

PREGUNTAS:
1. Accesibilidad: falta aria-live o roles?
2. El diseño sigue buenas prácticas?
3. Hay algo crítico que deba corregir?
4. Faltaría alguna variante útil?

Responde conciso con correcciones críticas.`;

const result = await askKimi(prompt, { timeout: 300000 }); // 5 minutos para KIMI

console.log("\n💜 Respuesta de Kimi - UI-022:");
console.log(result.answer);
