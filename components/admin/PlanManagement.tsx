import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PlanDetails {
  name: string;
  price: string;
  maxSubcommunities: number;
  maxMembersPerSub: number;
  adsAllowed: boolean;
  canDisableAds: boolean;
  tvAllowed: boolean;
  tvMaxViewers: number;
  chatAllowed: boolean;
  analyticsEnabled: boolean;
  customBranding: boolean;
  features: string[];
}

const PLANS: Record<string, PlanDetails> = {
  free: {
    name: 'Free', price: '$0', maxSubcommunities: 2, maxMembersPerSub: 50,
    adsAllowed: true, canDisableAds: false, tvAllowed: false, tvMaxViewers: 0,
    chatAllowed: true, analyticsEnabled: false, customBranding: false,
    features: ['2 subcomunidades', '50 miembros c/u', 'Publicidad forzada'],
  },
  starter: {
    name: 'Starter', price: '$29/mes', maxSubcommunities: 3, maxMembersPerSub: 200,
    adsAllowed: true, canDisableAds: true, tvAllowed: true, tvMaxViewers: 50,
    chatAllowed: true, analyticsEnabled: false, customBranding: false,
    features: ['3 subcomunidades', '200 miembros c/u', 'TV básica', 'Ads opcionales'],
  },
  growth: {
    name: 'Growth', price: '$79/mes', maxSubcommunities: 10, maxMembersPerSub: 1000,
    adsAllowed: true, canDisableAds: true, tvAllowed: true, tvMaxViewers: 200,
    chatAllowed: true, analyticsEnabled: true, customBranding: false,
    features: ['10 subcomunidades', '1000 miembros c/u', 'TV HD', 'Analytics'],
  },
  scale: {
    name: 'Scale', price: '$199/mes', maxSubcommunities: 999, maxMembersPerSub: 5000,
    adsAllowed: true, canDisableAds: true, tvAllowed: true, tvMaxViewers: 1000,
    chatAllowed: true, analyticsEnabled: true, customBranding: true,
    features: ['Ilimitadas', '5000 miembros c/u', 'TV 4K', 'Whitelabel'],
  },
  enterprise: {
    name: 'Enterprise', price: 'Custom', maxSubcommunities: 9999, maxMembersPerSub: 99999,
    adsAllowed: true, canDisableAds: true, tvAllowed: true, tvMaxViewers: 99999,
    chatAllowed: true, analyticsEnabled: true, customBranding: true,
    features: ['Todo ilimitado', 'API access', 'Soporte 24/7'],
  },
};

interface Community { _id: string; name: string; slug: string; plan: string; ownerId: string; }
interface Props { comunidad: Community; onClose: () => void; }

const PlanManagement: React.FC<Props> = ({ comunidad, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const planSettings = useQuery(api.communityPlans.getPlanSettings, { communityId: comunidad._id as any });
  const updatePlan = useMutation(api.communityPlans.updatePlan);

  const handleUpgrade = async (newPlan: string) => {
    setLoading(true);
    try {
      await updatePlan({ communityId: comunidad._id as any, newPlan, userId: comunidad.ownerId });
      setShowConfirm(null);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };

  const currentPlan = PLANS[comunidad.plan] || PLANS.free;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Plan de Comunidad</h2>
          <p className="text-sm text-white/50 mt-1">Gestión para <span className="text-primary">{comunidad.name}</span></p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined text-white/60">close</span></button>
      </div>

      <div className="bg-gradient-to-r from-primary/20 to-purple-500/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Plan Actual</p>
            <h3 className="text-2xl font-black text-white mt-1">{currentPlan.name}</h3>
            <p className="text-primary font-bold">{currentPlan.price}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
            comunidad.plan === 'free' ? 'bg-gray-500/20 text-gray-400' :
            comunidad.plan === 'starter' ? 'bg-blue-500/20 text-blue-400' :
            comunidad.plan === 'growth' ? 'bg-purple-500/20 text-purple-400' :
            comunidad.plan === 'scale' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
          }`}>{comunidad.plan.toUpperCase()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrent = key === comunidad.plan;
          const isUpgrade = Object.keys(PLANS).indexOf(key) > Object.keys(PLANS).indexOf(comunidad.plan);
          return (
            <div key={key} className={`relative rounded-2xl border p-5 ${isCurrent ? 'bg-primary/10 border-primary/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
              {isCurrent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-full">ACTUAL</span>}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-white">{plan.name}</h4>
                <span className="text-sm font-bold text-white/60">{plan.price}</span>
              </div>
              <ul className="space-y-2 mb-6">{plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-white/70">
                  <span className="material-symbols-outlined text-green-400 text-sm">check</span>{f}</li>
              ))}</ul>
              {isCurrent ? (
                <button disabled className="w-full py-2 bg-white/10 text-white/40 rounded-lg text-sm font-bold cursor-not-allowed">Plan Actual</button>
              ) : showConfirm === key ? (
                <div className="space-y-2">
                  <button onClick={() => handleUpgrade(key)} disabled={loading} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold">{loading ? 'Cambiando...' : `Confirmar ${plan.name}`}</button>
                  <button onClick={() => setShowConfirm(null)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setShowConfirm(key)} disabled={!isUpgrade} className={`w-full py-2 rounded-lg text-sm font-bold ${isUpgrade ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}>{isUpgrade ? 'Mejorar Plan' : 'Ver Detalles'}</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-bold text-white mb-3">Límites Actuales</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-[10px] text-white/50 uppercase">Subcomunidades</p><p className="text-lg font-black text-white">{planSettings?.maxSubcommunities || currentPlan.maxSubcommunities}</p></div>
          <div><p className="text-[10px] text-white/50 uppercase">Miembros/Sub</p><p className="text-lg font-black text-white">{planSettings?.maxMembersPerSub || currentPlan.maxMembersPerSub}</p></div>
          <div><p className="text-[10px] text-white/50 uppercase">TV Viewers</p><p className="text-lg font-black text-white">{planSettings?.tvMaxViewers || currentPlan.tvMaxViewers}</p></div>
          <div><p className="text-[10px] text-white/50 uppercase">Analytics</p><p className="text-lg font-black text-white">{planSettings?.analyticsEnabled ? '✓' : '✗'}</p></div>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;
