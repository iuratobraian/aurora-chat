import React from 'react';

interface CheckoutCancelViewProps {
  onNavigate: (tab: string) => void;
}

const CheckoutCancelView: React.FC<CheckoutCancelViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass rounded-3xl border border-red-500/30 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-6xl text-red-400">cancel</span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-4">
          Pago Cancelado
        </h1>
        
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          El pago fue cancelado. No se ha realizado ningún cargo a tu cuenta. Puedes intentar nuevamente cuando lo desees.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate('pricing')}
            className="px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/30"
          >
            Intentar de Nuevo
          </button>
          <button
            onClick={() => onNavigate('comunidad')}
            className="px-8 py-4 bg-white/5 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/10"
          >
            Volver a Inicio
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda? Contacta a soporte en soporte@tradshare.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelView;
