import React from 'react';

interface CheckoutSuccessViewProps {
  usuario: any;
  onNavigate: (tab: string) => void;
}

const CheckoutSuccessView: React.FC<CheckoutSuccessViewProps> = ({ usuario, onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass rounded-3xl border border-signal-green/30 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-signal-green/20 flex items-center justify-center mx-auto mb-8 animate-bounce-in">
          <span className="material-symbols-outlined text-6xl text-signal-green">check_circle</span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-4 animate-pulse">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Tu suscripción ha sido procesada correctamente. Ya puedes disfrutar de todos los beneficios de tu nuevo plan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate('comunidad')}
            className="px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/30"
          >
            Ir a Comunidad
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className="px-8 py-4 bg-white/5 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/10"
          >
            Ver Mi Plan
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-500">
            ¿Preguntas? Contacta a soporte en soporte@tradshare.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessView;
