import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../types';
import { PremiumCard } from '../components/ui/PremiumCard';
import { GlowCard } from '../components/ui/GlowCard';
import { GalaxyButton } from '../components/ui/GalaxyButton';
import { StarRating } from '../components/ui/StarRating';
import { GoldButton } from '../components/ui/GoldButton';
import { Starfield } from '../components/ui/Starfield';

interface CapitalizeViewProps {
  usuario: Usuario | null;
  onLoginRequest: () => void;
}

const LEVELS = [
  { name: 'Bronce', min: 0, color: 'from-amber-700 to-amber-900', icon: 'workspace_premium', commission: 5 },
  { name: 'Plata', min: 5, color: 'from-gray-400 to-gray-600', icon: 'military_tech', commission: 10 },
  { name: 'Oro', min: 15, color: 'from-yellow-400 to-amber-500', icon: 'emoji_events', commission: 15 },
  { name: 'Diamante', min: 30, color: 'from-cyan-400 to-blue-500', icon: 'diamond', commission: 20 },
];

const TEMPLATES = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'twitter', label: 'Twitter/X', icon: 'tag', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'telegram', label: 'Telegram', icon: 'send', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { id: 'copy', label: 'Copiar Link', icon: 'content_copy', color: 'bg-white/10 text-white border-white/20' },
];

export default function CapitalizeView({ usuario, onLoginRequest }: CapitalizeViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'templates'>('dashboard');

  const referrals = usuario ? (useQuery(api.referrals.getReferrals, { userId: usuario.id }) || []) : [];
  const referralStats = usuario ? (useQuery(api.referrals.getReferralStats, { userId: usuario.id }) || null) : null;

  const referralCode = usuario?.usuario || 'TRADE';
  const referralLink = `https://tradeshare.com/?ref=${referralCode}`;
  const totalReferrals = referrals.length || (referralStats as any)?.totalReferrals || 0;
  const totalEarnings = (referralStats as any)?.totalEarnings || 0;

  const currentLevel = LEVELS.reduce((acc, level) => {
    if (totalReferrals >= level.min) return level;
    return acc;
  }, LEVELS[0]);

  const nextLevel = LEVELS.find(l => l.min > totalReferrals);
  const progressToNext = nextLevel
    ? ((totalReferrals - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Starfield count={30} speed="slow" />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">trending_up</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
            Capitalízate
          </h2>
          <p className="text-gray-400 mb-6">Inicia sesión para acceder a tu dashboard de afiliados</p>
          <GoldButton onClick={onLoginRequest}>Iniciar Sesión</GoldButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 relative">
      <Starfield count={20} speed="slow" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-amber-500/5 to-transparent" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30 flex items-center justify-center shadow-xl shadow-yellow-400/10">
                <span className="material-symbols-outlined text-yellow-400 text-2xl">trending_up</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">
                  Capitalízate
                </h1>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  Gana comisiones invitando traders a TradeShare
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-5 py-3 rounded-xl bg-gradient-to-r ${currentLevel.color} bg-opacity-20 border border-white/10`}>
                <p className="text-xs text-gray-300 uppercase tracking-wider">Tu Nivel</p>
                <p className="text-lg font-black text-white">{currentLevel.name}</p>
              </div>
              <div className="px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Comisión</p>
                <p className="text-lg font-black text-green-400">{currentLevel.commission}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
          { id: 'templates', label: 'Marketing', icon: 'campaign' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Referral Link */}
          <GlowCard glowColor="rgba(234, 179, 8, 0.3)">
            <h3 className="text-sm font-bold text-white mb-3">Tu Link de Referido</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary hover:bg-primary/80 text-white'
                }`}
              >
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Código: <span className="text-primary font-bold">{referralCode}</span>
            </p>
          </GlowCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PremiumCard title="Referidos" badge={`${totalReferrals}`} className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-blue-400">group</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{totalReferrals}</p>
                  <p className="text-xs text-gray-400">personas invitadas</p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard title="Ganancias" badge={`$${totalEarnings.toFixed(2)}`} className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-green-400">payments</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">${totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">ganancias totales</p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard title="Nivel Actual" badge={currentLevel.name} className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-yellow-400">{currentLevel.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{currentLevel.commission}%</p>
                  <p className="text-xs text-gray-400">de comisión</p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard title="Progreso" badge={nextLevel ? `${Math.round(progressToNext)}%` : 'MAX'} className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{currentLevel.name}</span>
                  <span className="text-white font-bold">{nextLevel?.name || 'Máximo'}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                {nextLevel && (
                  <p className="text-[10px] text-gray-500">
                    {nextLevel.min - totalReferrals} referidos más para {nextLevel.name}
                  </p>
                )}
              </div>
            </PremiumCard>
          </div>

          {/* Levels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {LEVELS.map(level => {
              const isCurrent = level.name === currentLevel.name;
              const isUnlocked = totalReferrals >= level.min;
              return (
                <div
                  key={level.name}
                  className={`p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? `bg-gradient-to-br ${level.color} bg-opacity-20 border-white/20 shadow-lg`
                      : isUnlocked
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`material-symbols-outlined text-2xl ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                      {level.icon}
                    </span>
                    <h4 className={`font-black ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                      {level.name}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{level.min}+ referidos</p>
                  <p className="text-lg font-black text-green-400">{level.commission}% comisión</p>
                  {isCurrent && (
                    <div className="mt-2 px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider text-center">
                      Nivel Actual
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'leaderboard' && (
        <GlowCard glowColor="rgba(234, 179, 8, 0.3)">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
            Top Afiliados
          </h3>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">leaderboard</span>
              <p className="text-gray-400">Aún no hay referidos. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.slice(0, 10).map((ref: any, i) => (
                <div key={ref._id || i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-500 text-black' :
                    i === 1 ? 'bg-gray-400 text-black' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{ref.nombre || 'Usuario'}</p>
                    <p className="text-gray-400 text-xs">@{ref.usuario || 'user'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{ref.referrals || 0} referidos</p>
                    <p className="text-gray-400 text-xs">${(ref.earnings || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlowCard>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  if (template.id === 'copy') {
                    handleCopyLink();
                  } else {
                    const text = `¡Únete a TradeShare con mi link! ${referralLink}`;
                    const encoded = encodeURIComponent(text);
                    const urls: Record<string, string> = {
                      whatsapp: `https://wa.me/?text=${encoded}`,
                      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
                      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encoded}`,
                    };
                    window.open(urls[template.id], '_blank');
                  }
                }}
                className={`p-6 rounded-xl border ${template.color} hover:opacity-80 transition-all flex items-center gap-4`}
              >
                <span className="material-symbols-outlined text-3xl">{template.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-white">{template.label}</p>
                  <p className="text-xs text-gray-400">Compartir link de referido</p>
                </div>
              </button>
            ))}
          </div>

          <GlowCard glowColor="rgba(59, 130, 246, 0.3)">
            <h3 className="text-sm font-bold text-white mb-3">Mensaje Predeterminado</h3>
            <textarea
              readOnly
              value={`🚀 ¡Únete a TradeShare, la comunidad de trading más grande! Aprende, comparte y gana con traders profesionales.\n\n🔗 Usa mi link: ${referralLink}\n💰 ¡Obtén beneficios exclusivos!`}
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm resize-none"
            />
            <button
              onClick={handleCopyLink}
              className="mt-3 px-6 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-bold rounded-xl transition-all"
            >
              {copied ? '¡Copiado!' : 'Copiar Mensaje'}
            </button>
          </GlowCard>
        </div>
      )}
    </div>
  );
}
