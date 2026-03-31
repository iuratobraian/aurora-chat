import React, { useState, useMemo } from 'react';
import { Usuario } from '../types';
import { useToast } from '../components/ToastProvider';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { isFeatureEnabled } from '../../lib/features';
import logger from '../../lib/utils/logger';

interface CreatorViewProps {
  usuario: Usuario | null;
  onLoginRequest?: () => void;
  onNavigate?: (tab: string) => void;
}

type PlanTier = 'starter' | 'growth' | 'scale';

interface PlanInfo {
  name: string;
  minMembers: number;
  maxMembers: number;
  pricePerMember: number;
  commission: number;
}

const planTiers: Record<PlanTier, PlanInfo> = {
  starter: {
    name: 'Starter',
    minMembers: 1,
    maxMembers: 100,
    pricePerMember: 4.99,
    commission: 20,
  },
  growth: {
    name: 'Growth',
    minMembers: 101,
    maxMembers: 500,
    pricePerMember: 3.99,
    commission: 15,
  },
  scale: {
    name: 'Scale',
    minMembers: 501,
    maxMembers: Infinity,
    pricePerMember: 2.99,
    commission: 10,
  },
};

const benefits = [
  {
    icon: 'monetization_on',
    title: 'Ingresos Pasivos',
    description: 'Genera ingresos recurrentes mensuales de tu comunidad de trading.',
  },
  {
    icon: 'people',
    title: 'Gestión Simple',
    description: 'Herramientas integradas para administrar miembros y contenido.',
  },
  {
    icon: 'analytics',
    title: 'Analytics Detallados',
    description: 'Métricas de engagement, retención y crecimiento de tu comunidad.',
  },
  {
    icon: 'content_cut',
    title: 'Contenido Exclusivo',
    description: 'Comparte análisis, señales y educación solo para tus miembros.',
  },
  {
    icon: 'chat',
    title: 'Chat Privado',
    description: 'Comunidad privada con chat en tiempo real para tus seguidores.',
  },
  {
    icon: 'school',
    title: 'Mentoring 1:1',
    description: 'Acceso a sesiones de mentoring con traders Elite.',
    eliteOnly: true,
  },
  {
    icon: 'api',
    title: 'API Access',
    description: 'Integraciones avanzadas para automatizar tu comunidad.',
    eliteOnly: true,
  },
];

const CreatorView: React.FC<CreatorViewProps> = ({ usuario, onLoginRequest, onNavigate }) => {
  const [members, setMembers] = useState(50);
  const [pricePerMember, setPricePerMember] = useState(9.99);
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const createCheckoutMutation = useMutation(api.payments.createCheckoutSession);

  const currentPlan = useMemo(() => {
    if (members <= planTiers.starter.maxMembers) return 'starter';
    if (members <= planTiers.growth.maxMembers) return 'growth';
    return 'scale';
  }, [members]);

  const planInfo = planTiers[currentPlan];
  
  const grossRevenue = members * pricePerMember;
  const platformFee = grossRevenue * (planInfo.commission / 100);
  const netRevenue = grossRevenue - platformFee;
  const creatorFee = 49.99 * (isYearly ? 0.8 : 1);
  const profit = netRevenue - creatorFee;

  const handleStartCreating = async () => {
    if (!usuario || usuario.id === 'guest') {
      onLoginRequest?.();
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCheckoutMutation({
        plan: 'creator',
        billingCycle: isYearly ? 'yearly' : 'monthly',
        userId: usuario.id,
      });
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        showToast('error', 'Error al iniciar checkout. Intenta de nuevo.');
      }
    } catch (error: any) {
      logger.error('Creator checkout error:', error);
      showToast('error', error.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">
          <span className="material-symbols-outlined text-sm">groups</span>
          Comunidad Creator
        </span>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
          Monetiza tu <span className="text-emerald-400">Comunidad</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Convierte tu conocimiento en ingresos. Crea una comunidad de trading privada 
          y monetiza tu contenido con herramientas profesionales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">workspace_premium</span>
            Beneficios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.filter(b => !b.eliteOnly || isFeatureEnabled(b.icon === 'api' ? 'api_access' : 'mentoring', usuario.plan as 'free' | 'pro' | 'elite')).map((benefit, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                  <span className="material-symbols-outlined text-emerald-400 text-xl">{benefit.icon}</span>
                </div>
                <h3 className="text-sm font-black text-white mb-1">{benefit.title}</h3>
                <p className="text-xs text-gray-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#0f1115] to-[#1a1d21] border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">calculate</span>
                Calculadora de Ingresos
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    !isYearly ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all relative ${
                    isYearly ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Anual
                  <span className="absolute -top-2 -right-2 px-1 py-0.5 bg-signal-green text-[7px] font-black text-black rounded">-20%</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Miembros de la Comunidad
              </label>
              <input
                type="number"
                value={members}
                onChange={(e) => setMembers(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-emerald-500/50 transition-colors"
              />
              <input
                type="range"
                min="1"
                max="1000"
                value={members}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  setMembers(isNaN(parsed) ? 1 : Math.max(1, parsed));
                }}
                className="w-full mt-2 accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Precio por Miembro ($/mes)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerMember}
                onChange={(e) => setPricePerMember(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="p-4 rounded-xl bg-black/20 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-bold uppercase">Plan Actual</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                  currentPlan === 'starter' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  currentPlan === 'growth' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {planInfo.name} ({planInfo.commission}% comisión)
                </span>
              </div>
              <p className="text-[10px] text-gray-600">
                {currentPlan === 'starter' && 'Ideal para comenzar (1-100 miembros)'}
                {currentPlan === 'growth' && 'Para comunidades en crecimiento (101-500 miembros)'}
                {currentPlan === 'scale' && 'Para comunidades grandes (500+ miembros)'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-signal-green/5 border border-signal-green/10">
                <span className="text-xs text-gray-400 font-bold uppercase">Ingreso Bruto</span>
                <span className="text-lg font-black text-signal-green">${grossRevenue.toFixed(2)}/mes</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="text-xs text-gray-400 font-bold uppercase">Comisión Platform ({planInfo.commission}%)</span>
                <span className="text-sm font-bold text-red-400">-${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-gray-400 font-bold uppercase">Fee Creator</span>
                <span className="text-sm font-bold text-gray-300">${creatorFee.toFixed(2)}/mes</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-transparent border border-emerald-500/30">
                <span className="text-xs font-black uppercase text-emerald-400">Ganancia Neta</span>
                <span className="text-2xl font-black text-emerald-400">${profit.toFixed(2)}/mes</span>
              </div>
            </div>

            <button
              onClick={handleStartCreating}
              disabled={isLoading}
              className="w-full py-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Comenzar como Creator
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-600 text-center">
              * Los ingresos shown son estimados. Los fees de pago (Stripe) aplican adicionalmente.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 text-center flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">info</span>
          Cómo Funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '1',
              title: 'Regístrate',
              desc: 'Crea tu cuenta Creator y configura tu comunidad.',
            },
            {
              step: '2',
              title: 'Personaliza',
              desc: 'Agrega tu branding, contenido y establece el precio.',
            },
            {
              step: '3',
              title: 'Invita Miembros',
              desc: 'Comparte tu comunidad y acepta miembros pagos.',
            },
            {
              step: '4',
              title: 'Recibe Pagos',
              desc: 'Los ingresos se depositan automáticamente cada mes.',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 size-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-sm">
                {item.step}
              </div>
              <h3 className="text-sm font-black text-white mt-4 mb-2">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 text-center">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">
          ¿Listo para Monetizar?
        </h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          Únete a cientos de traders que ya están generando ingresos con sus comunidades.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStartCreating}
            disabled={isLoading}
            className="px-8 py-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? 'Procesando...' : 'Comenzar Ahora'}
          </button>
          <button
            onClick={() => onNavigate?.('pricing')}
            className="px-8 py-4 bg-white/5 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all border border-white/10"
          >
            Ver Todos los Planes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorView;
