import React, { memo } from 'react';
import { Usuario } from '../types';

interface SubscriptionGateProps {
  usuario: Usuario | null;
  children: React.ReactNode;
  /** Minimum role required (0=FREE, 1=PRO, 2=ELITE, 3=CREATOR, 4=MOD, 5=ADMIN) */
  minRole?: number;
  /** If false, show lock screen. If true, always show children. */
  allowGuest?: boolean;
  /** Label for the locked feature */
  featureLabel?: string;
  /** Description for the locked feature */
  featureDescription?: string;
  /** Called when user clicks "Ver Planes" */
  onUpgrade?: () => void;
}

/**
 * SubscriptionGate: Reusable component that gates content behind subscription.
 * 
 * Role scale: 0=FREE, 1=PRO, 2=ELITE, 3=CREATOR, 4=MOD, 5=ADMIN, 6=SUPERADMIN
 * 
 * Usage:
 * <SubscriptionGate usuario={user} minRole={1} featureLabel="Gráfico">
 *   <GraficoView />
 * </SubscriptionGate>
 */
const SubscriptionGate: React.FC<SubscriptionGateProps> = memo(({
  usuario,
  children,
  minRole = 1,
  allowGuest = false,
  featureLabel = 'Contenido Premium',
  featureDescription = 'Disponible con un plan Pro o superior',
  onUpgrade,
}) => {
  const isGuest = !usuario || usuario.id === 'guest';
  const hasAccess = isGuest
    ? allowGuest
    : (usuario.role ?? 0) >= minRole || usuario.rol === 'admin' || usuario.rol === 'ceo' || usuario.rol === 'vip';

  if (hasAccess) {
    return <>{children}</>;
  }

  const title = isGuest
    ? 'Inicia Sesión'
    : `Acceso Restringido: ${featureLabel}`;
  
  const description = isGuest
    ? 'Necesitas una cuenta para acceder a esta sección'
    : featureDescription;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="glass rounded-3xl p-10 text-center max-w-md w-full border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative size-20 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined text-4xl text-primary">lock</span>
          </div>
        </div>
        
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{description}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onUpgrade || (() => {
              const event = new CustomEvent('navigate', { detail: { path: '/pricing' } });
              window.dispatchEvent(event);
            })}
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm uppercase tracking-wider"
          >
            Ver Planes
          </button>
          {isGuest && (
            <button
              onClick={() => {
                const event = new CustomEvent('show-login');
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all text-sm"
            >
              Ingresar
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default SubscriptionGate;
