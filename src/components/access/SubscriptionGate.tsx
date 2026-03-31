import { useState, useEffect } from 'react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  title?: string;
}

export function SubscriptionGate({ children, feature, title }: SubscriptionGateProps) {
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    // Aquí podrías hacer una llamada a la API para verificar acceso
    // Por ahora siempre tiene acceso
    setHasAccess(true);
  }, [feature]);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full bg-gray-900 rounded-xl p-6 border border-white/10 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {title || "Necesitas una suscripción"}
        </h3>
        <p className="text-gray-400 mb-6">
          {getFeatureMessage(feature)}
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/subscription'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Ver Planes
          </button>
          <button 
            onClick={() => window.location.href = '/credits'}
            className="w-full border border-white/20 text-gray-300 hover:bg-white/5 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Comprar Créditos
          </button>
        </div>
      </div>
    </div>
  );
}

function getFeatureMessage(feature: string): string {
  switch (feature) {
    case 'premium-signals':
      return "Accede a señales premium y análisis avanzados";
    case 'community-access':
      return "Únete a comunidades exclusivas de traders";
    case 'api-access':
      return "Integra nuestra API con tu sistema de trading";
    default:
      return "Desbloquea todas las funciones premium";
  }
}
