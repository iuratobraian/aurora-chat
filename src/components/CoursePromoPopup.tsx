import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from './ToastProvider';
import logger from '../utils/logger';

interface CoursePromoPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  usuario: any;
}

const COURSE_DATA = {
  title: 'Masterclass Trading Profesional',
  subtitle: 'Domina los mercados financieros',
  image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
  originalPrice: 299,
  salePrice: 149,
  discount: 50,
  features: [
    'Análisis técnico avanzado',
    'Gestión de riesgo profesional',
    'Psicología del trading',
    'Estrategias de scalp y swing',
    'Comunidad privada VIP',
    'Mentoring en vivo',
  ],
  paymentLink: '/pricing',
};

export const CoursePromoPopup: React.FC<CoursePromoPopupProps> = ({
  isVisible,
  onClose,
  onSubscribe,
  usuario,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { showToast } = useToast();
  
  const createCheckout = useMutation(api.payments.createCheckoutSession);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
        document.body.style.overflow = '';
      };
    }
  }, [isVisible]);

  const setConfigMutation = useMutation(api.platformConfig.setConfig);

  const handleClose = async () => {
    setIsClosing(true);
    try {
      await setConfigMutation({ key: 'coursePromoClosed', value: true, description: 'Course promo closed by user' });
      await setConfigMutation({ key: 'coursePromoLastShown', value: Date.now() });
    } catch (err) {
      logger.error('Failed to save promo state:', err);
    }
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubscribe = async () => {
    if (!usuario || usuario.id === 'guest') {
      showToast('info', 'Debes iniciar sesión para suscribirte');
      onClose();
      return;
    }

    try {
      const result = await createCheckout({
        plan: 'elite',
        billingCycle: 'yearly',
        userId: usuario.id,
      });
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        showToast('error', 'Error al iniciar checkout');
      }
    } catch (error) {
      logger.error('Checkout error:', error);
      showToast('error', 'Error de conexión');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      
      <div
        className={`relative w-full max-w-2xl bg-gradient-to-b from-[#0a0f18] via-[#0d1420] to-[#0a0f18] rounded-3xl overflow-hidden border border-primary/30 shadow-[0_0_80px_rgba(59,130,246,0.15),0_0_120px_rgba(139,92,246,0.1)] transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary opacity-80" />
        <div className="absolute top-0 left-1/4 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent animate-pulse" />
        
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative flex flex-col md:flex-row">
          <div className="md:w-2/5 relative">
            <div className="aspect-[4/3] md:aspect-auto md:h-full bg-gradient-to-br from-primary/20 to-violet-500/20 relative overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f18]">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={COURSE_DATA.image}
                alt={COURSE_DATA.title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-black uppercase tracking-wider text-black shadow-lg">
                ⭐ VIP Exclusive
              </div>
            </div>
          </div>

          <div className="md:w-3/5 p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-400 mb-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  Oferta Limitada
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                  {COURSE_DATA.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1">{COURSE_DATA.subtitle}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mb-5">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl md:text-4xl font-black text-white">
                  ${COURSE_DATA.salePrice}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${COURSE_DATA.originalPrice}
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded text-xs font-black text-red-400">
                  -{COURSE_DATA.discount}%
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                Oferta válida por {countdown > 0 ? `${countdown}s` : 'terminó'}
              </p>
            </div>

            <div className="hidden md:block flex-1 mb-6">
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-3">
                Qué incluye
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COURSE_DATA.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-signal-green text-sm">check_circle</span>
                    <span className="text-xs text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSubscribe}
                className="w-full py-4 bg-gradient-to-r from-primary via-blue-500 to-violet-600 hover:from-blue-600 hover:via-primary hover:to-primary text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">school</span>
                Inscribirme Ahora
              </button>
              
              <button
                onClick={handleClose}
                className="w-full py-3 bg-white/5 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                No сейчас
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="material-symbols-outlined text-sm text-signal-green">verified</span>
                Garantía 7 días
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="material-symbols-outlined text-sm text-amber-400">payments</span>
                MercadoPago
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="material-symbols-outlined text-sm text-primary">group</span>
                +2,500 estudiantes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePromoPopup;
