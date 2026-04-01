import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../types';
import { useToast } from '../components/ToastProvider';
import { PremiumCard } from '../components/ui/PremiumCard';
import { StarRating } from '../components/ui/StarRating';
import { GoldButton } from '../components/ui/GoldButton';
import { GlowCard } from '../components/ui/GlowCard';
import { NeonLoader } from '../components/ui/NeonLoader';

interface RewardsViewProps {
  usuario: Usuario | null;
  onNavigate?: (tab: string) => void;
  onLoginRequest?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  comunidad: 'groups',
  vip: 'workspace_premium',
  badge: 'emoji_events',
  boost: 'trending_up',
  herramienta: 'build',
};

const TIER_COLORS: Record<string, string> = {
  bronce: 'from-amber-700 to-amber-900',
  plata: 'from-gray-400 to-gray-600',
  oro: 'from-yellow-400 to-amber-500',
  diamante: 'from-cyan-400 to-blue-500',
};

export default function RewardsView({ usuario, onNavigate, onLoginRequest }: RewardsViewProps) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHistory, setShowHistory] = useState(false);

  const rewards = useQuery(api.rewards.getRewardsCatalog) || [];
  const userRewards = usuario ? (useQuery(api.rewards.getUserRewards, { userId: usuario.id }) || []) : [];
  const redeemMutation = useMutation(api.rewards.redeemReward);

  const userXp = usuario?.xp || 0;
  const userLevel = usuario?.level || 1;

  const filteredRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter((r: any) => r.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(rewards.map((r: any) => r.category)))];

  const handleRedeem = async (reward: any) => {
    if (!usuario) {
      onLoginRequest?.();
      return;
    }

    if (userXp < reward.xpCost) {
      showToast('warning', `Necesitas ${reward.xpCost} XP, tienes ${userXp} XP`);
      return;
    }

    try {
      await redeemMutation({ userId: usuario.id, rewardId: reward._id });
      showToast('success', `¡Has canjeado "${reward.name}"!`);
    } catch (e: any) {
      showToast('error', e.message || 'Error al canjear recompensa');
    }
  };

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">redeem</span>
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
          Inicia Sesión
        </h2>
        <p className="text-gray-400 mb-6">Accede a tu cuenta para ver y canjear recompensas</p>
        <GoldButton onClick={onLoginRequest}>Iniciar Sesión</GoldButton>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30 flex items-center justify-center shadow-xl shadow-yellow-400/10">
                <span className="material-symbols-outlined text-yellow-400 text-2xl">redeem</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">
                  Recompensas
                </h1>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  Canjea tus XP por beneficios exclusivos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-5 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Tu XP</p>
                <p className="text-xl font-black text-primary">{userXp.toLocaleString()}</p>
              </div>
              <div className="px-5 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Nivel</p>
                <p className="text-xl font-black text-violet-400">{userLevel}</p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-3 rounded-xl border transition-all ${showHistory ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-300'}`}
              >
                <span className="material-symbols-outlined">history</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* History */}
      {showHistory && (
        <GlowCard glowColor="rgba(168, 85, 247, 0.3)">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400">history</span>
            Historial de Canjes
          </h3>
          {userRewards.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Aún no has canjeado recompensas</p>
          ) : (
            <div className="space-y-3">
              {userRewards.map((r: any) => (
                <div key={r._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white font-semibold">{r.rewardName}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(r.redeemedAt).toLocaleDateString()} - {r.xpSpent} XP
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    r.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    r.status === 'activated' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlowCard>
      )}

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">redeem</span>
          <h3 className="text-xl font-bold text-white mb-2">No hay recompensas disponibles</h3>
          <p className="text-gray-400">Vuelve pronto para ver nuevas recompensas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward: any) => {
            const canAfford = userXp >= reward.xpCost;
            const tierColor = TIER_COLORS[reward.tier] || 'from-gray-500 to-gray-700';
            const icon = CATEGORY_ICONS[reward.category] || 'redeem';

            return (
              <PremiumCard
                key={reward._id}
                title={reward.name}
                description={reward.description}
                badge={reward.tier}
                className={`bg-gradient-to-br ${tierColor} bg-opacity-10`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300 uppercase tracking-wider">Costo</p>
                      <p className={`text-lg font-black ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                        {reward.xpCost.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                </div>

                {reward.expiresInDays && (
                  <p className="text-xs text-gray-400 mb-4">
                    Válido por {reward.expiresInDays} días
                  </p>
                )}

                <GoldButton
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford}
                  variant={canAfford ? 'solid' : 'outline'}
                  size="sm"
                  className="w-full"
                >
                  {canAfford ? 'Canjear' : 'XP Insuficiente'}
                </GoldButton>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
