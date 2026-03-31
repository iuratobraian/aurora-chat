import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '../ToastProvider';

interface SubscriptionBenefitsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    annualPrice: number;
    features: Array<{ text: string; included: boolean }>;
    description: string;
    benefit: string;
    color: string;
    gradient: string;
    icon: string;
  };
  billingCycle: 'monthly' | 'annual';
  onConfirm: () => void;
}

export const SubscriptionBenefitsPopup: React.FC<SubscriptionBenefitsPopupProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onConfirm,
}) => {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPrice = billingCycle === 'annual' ? plan.annualPrice : plan.price;
  const savings = billingCycle === 'annual' ? (plan.price * 12) - plan.annualPrice : 0;

  const includedFeatures = plan.features.filter(f => f.included);
  const excludedFeatures = plan.features.filter(f => !f.included);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error: any) {
      showToast('error', error.message || 'Error al procesar');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className={`relative h-48 bg-gradient-to-br ${plan.gradient} rounded-t-3xl overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 size-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="size-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <span className={`material-symbols-outlined text-3xl ${plan.color}`}>{plan.icon}</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">{plan.name}</h2>
                <p className="text-sm text-white/80">{plan.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {/* Precio y ahorro */}
          <div className="flex items-end justify-between mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Inversión {billingCycle === 'annual' ? 'Anual' : 'Mensual'}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">${currentPrice.toFixed(2)}</span>
                <span className="text-gray-500">/{billingCycle === 'annual' ? 'año' : 'mes'}</span>
              </div>
              {billingCycle === 'annual' && savings > 0 && (
                <p className="text-emerald-400 text-sm mt-2 font-bold">
                  💰 Ahorras ${savings.toFixed(2)} comparado con el plan mensual
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Beneficio Principal</p>
              <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                {plan.benefit}
              </p>
            </div>
          </div>

          {/* Características incluidas */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              Lo que obtienes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {includedFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20"
                >
                  <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                  <span className="text-sm text-gray-200 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Características no incluidas (si hay) */}
          {excludedFeatures.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-black text-gray-400 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">cancel</span>
                Disponible en planes superiores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {excludedFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30"
                  >
                    <span className="material-symbols-outlined text-gray-600 text-xl">cancel</span>
                    <span className="text-sm text-gray-500">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Garantía y seguridad */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">verified</span>
              </div>
              <div>
                <h4 className="font-black text-white mb-2">Garantía de 7 días</h4>
                <p className="text-sm text-gray-400">
                  Si no estás satisfecho con tu suscripción, te devolvemos el 100% de tu dinero dentro de los primeros 7 días. 
                  Sin preguntas.
                </p>
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Métodos de pago disponibles</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Tarjeta de Crédito', icon: 'credit_card' },
                { name: 'Tarjeta de Débito', icon: 'account_balance' },
                { name: 'MercadoPago', icon: 'payment' },
                { name: 'Transferencia', icon: 'account_balance_wallet' },
              ].map((method, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <span className="material-symbols-outlined text-gray-400 text-sm">{method.icon}</span>
                  <span className="text-sm text-gray-300">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-black rounded-xl transition-all disabled:opacity-50"
            >
              Seguir explorando
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`flex-1 py-4 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Suscribirse ahora - ${currentPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>

          {/* Nota de seguridad */}
          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 Pago seguro procesado por MercadoPago. Tus datos están protegidos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBenefitsPopup;
