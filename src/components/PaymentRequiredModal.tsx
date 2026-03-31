import React from 'react';
import { Usuario } from '../types';

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
  usuario: Usuario | null;
  onLoginRequest?: () => void;
  onSubscribe?: () => void;
}

export const PaymentRequiredModal: React.FC<PaymentRequiredModalProps> = ({
  isOpen,
  onClose,
  title = 'Contenido Premium',
  message = 'Este contenido es exclusivo para miembros Pro.',
  feature,
  usuario,
  onLoginRequest,
  onSubscribe,
}) => {
  if (!isOpen) return null;

  const isLoggedIn = usuario && usuario.id !== 'guest';

  const handleAction = () => {
    if (!isLoggedIn) {
      onLoginRequest?.();
    } else {
      onSubscribe?.();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-black rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />

        <div className="relative p-6 text-center">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 border border-primary/30">
            <span className="material-symbols-outlined text-3xl text-primary">lock</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-black text-white uppercase tracking-wide mb-2">
            {title}
          </h2>

          {/* Feature badge */}
          {feature && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-sm text-primary">star</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{feature}</span>
            </div>
          )}

          {/* Message */}
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAction}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              {isLoggedIn ? 'Actualizar a Pro' : 'Iniciar Sesión'}
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-2 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentRequiredModal;
