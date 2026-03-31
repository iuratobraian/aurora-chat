import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';
import { StorageService } from '../services/storage';
import logger from '../utils/logger';

interface Referral {
  _id: any;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  rewardType: 'xp' | 'subscription_days' | 'badge' | 'cash';
  referrerReward: number;
  referredReward: number;
  referrerClaimed: boolean;
  referredClaimed: boolean;
  claimedAt?: number;
  createdAt: number;
  completedAt?: number;
  referredProfile?: any;
}

interface ReferralCode {
  _id: any;
  userId: string;
  code: string;
  uses: number;
  maxUses?: number;
  rewardXp: number;
  rewardDays?: number;
  isActive: boolean;
  createdAt: number;
  expiresAt?: number;
}

interface ReferralStats {
  totalReferrals: number;
  pending: number;
  completed: number;
  expired: number;
  totalXpEarned: number;
}

interface ReferralPanelProps {
  usuario?: Usuario | null;
  onLoginRequest?: () => void;
}

export const ReferralPanel: React.FC<ReferralPanelProps> = ({ usuario, onLoginRequest }) => {
  const isAuth = !!usuario && usuario.id !== 'guest';
  const [activeTab, setActiveTab] = useState<'my-code' | 'use-code' | 'history'>(isAuth ? 'my-code' : 'use-code');
  const [codeInput, setCodeInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myCodeData, setMyCodeData] = useState<ReferralCode | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  
  const canFetchData = isAuth;
   
  const createCode = useMutation(api.referrals.getOrCreateReferralCode);
  const myReferrals = useQuery(
    api.referrals.getMyReferrals,
    {},
  );
  const referralStats = useQuery(
    api.referrals.getReferralStats, 
    { userId: myCodeData?.userId || '' }
  );
  
  const applyCode = useMutation(api.referrals.applyReferralCode);
  const claimReward = useMutation(api.referrals.claimReferralReward);

  useEffect(() => {
    if (!isAuth) {
      setMyCodeData(null);
      return;
    }
    
    const fetchCode = async () => {
      try {
        setLoading(true);
        const code = await createCode({});
        setMyCodeData(code as ReferralCode | null);
      } catch (e) {
        logger.error('Error creating referral code:', e);
        setMyCodeData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [isAuth, createCode]);

  const handleCopyCode = async () => {
    if (myCodeData?.code) {
      const referralUrl = `${window.location.origin}?ref=${myCodeData.code}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShareCode = async () => {
    if (!myCodeData?.code) return;
    
    const referralUrl = `${window.location.origin}?ref=${myCodeData.code}`;
    const shareText = `🚀 ¡Únete a TradeShare con mi código: ${myCodeData.code}!\n\n🎁 Recibe ${myCodeData.rewardXp} XP de bienvenida\n📈 Accede a señales exclusivas y estrategias probadas\n💎 Comunidad de trading profesional\n\n${referralUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TradeShare - Invitación VIP',
          text: shareText,
          url: referralUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(referralUrl);
        }
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${referralUrl}`);
    }
  };

  const handleApplyCode = async () => {
    if (!codeInput.trim()) {
      setError('Por favor ingresa un código');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await applyCode({ code: codeInput.trim() });
      setCodeInput('');
      setActiveTab('history');
    } catch (e: any) {
      setError(e.message || 'Error al aplicar código');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (referralId: any) => {
    setLoading(true);
    try {
      await claimReward({ referralId });
    } catch (e: any) {
      setError(e.message || 'Error al reclamar recompensa');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-2xl p-6 border border-white/10 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <span className="material-symbols-outlined text-sm">stars</span>
              Programa VIP
            </div>
            <h2 className="text-2xl font-black text-white">Sistema de Afiliados</h2>
            <p className="text-sm text-white/60 mt-1">Invita traders profesionales y gana comisiones recurrentes</p>
          </div>
          <span className="material-symbols-outlined text-5xl text-primary/60">diversity_3</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-black text-white">{referralStats?.totalReferrals || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Pendientes</p>
          <p className="text-2xl font-black text-yellow-400">{referralStats?.pending || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-4 border border-green-500/20">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Completados</p>
          <p className="text-2xl font-black text-green-400">{referralStats?.completed || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">XP Ganado</p>
          <p className="text-2xl font-black text-purple-400">{referralStats?.totalXpEarned || 0}</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => isAuth && setActiveTab('my-code')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'my-code'
              ? 'bg-primary text-white'
              : isAuth ? 'text-white/60 hover:text-white cursor-pointer' : 'text-white/30 cursor-not-allowed'
          }`}
        >
          Mi Código
        </button>
        <button
          onClick={() => setActiveTab('use-code')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'use-code'
              ? 'bg-primary text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Usar Código
        </button>
        <button
          onClick={() => isAuth && setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-white'
              : isAuth ? 'text-white/60 hover:text-white cursor-pointer' : 'text-white/30 cursor-not-allowed'
          }`}
        >
          Historial
        </button>
      </div>

      {activeTab === 'my-code' && (
        <div className="space-y-4">
          {myCodeData ? (
            <>
              <div className="bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Tu código de referido</p>
                  {usuario?.userNumber && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      #{usuario.userNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-white tracking-wider">
                    {myCodeData.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {copySuccess ? (
                      <span className="material-symbols-outlined text-green-400">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-white">content_copy</span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">stars</span>
                    <span className="text-white/80">+{myCodeData.rewardXp} XP por referido</span>
                  </div>
                  {myCodeData.rewardDays && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-400">calendar_month</span>
                      <span className="text-white/80">+{myCodeData.rewardDays} días Pro</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white">Estadísticas</p>
                  <span className="text-xs text-white/60">
                    {myCodeData.uses} / {myCodeData.maxUses || '∞'} usos
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all"
                    style={{
                      width: myCodeData.maxUses
                        ? `${(myCodeData.uses / myCodeData.maxUses) * 100}%`
                        : '100%',
                    }}
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm font-medium text-white mb-2">Comparte tu código</p>
                <p className="text-xs text-white/60 mb-4">
                  Cada amigo que use tu código y complete el registro recibirá XP de bienvenida.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 py-2 px-4 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    {copySuccess ? '¡Copiado!' : 'Copiar enlace'}
                  </button>
                  <button
                    onClick={handleShareCode}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">share</span>
                    Compartir
                  </button>
                </div>
              </div>
            </>
          ) : !isAuth ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-white font-bold mb-2">Inicia sesión para ver tu código</h3>
              <p className="text-white/60 text-sm">
                Para generar tu código de referido, necesitas tener una cuenta en TradeHub.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      )}

      {activeTab === 'use-code' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-primary/10 rounded-2xl p-6 border border-purple-500/20">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">¿Tienes un código?</p>
            <p className="text-sm text-white/80 mb-4">
              {isAuth
                ? 'Ingresa el código de referido de un amigo para reclamar tu recompensa de bienvenida.'
                : 'Ingresa el código de referido de un amigo — se aplicará automáticamente al registrarte.'}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.toUpperCase());
                  if (e.target.value.trim()) {
                    StorageService.setPendingReferralCode(e.target.value.toUpperCase().trim());
                  } else {
                    StorageService.setPendingReferralCode(null);
                  }
                  setApplyMessage('');
                  setError('');
                }}
                placeholder="Ej: TP-ABC123"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary text-center font-mono tracking-wider uppercase"
                maxLength={12}
              />
              {codeInput && (
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold px-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Código guardado — se aplicará al registrarte
                </div>
              )}
              <button
                onClick={() => {
                  if (!isAuth) {
                    setApplyMessage('Regístrate para reclamar tu recompensa de referido.');
                    if (onLoginRequest) onLoginRequest();
                  } else {
                    handleApplyCode();
                  }
                }}
                disabled={loading || !codeInput.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Aplicando...
                  </span>
                ) : isAuth ? (
                  'Aplicar Código'
                ) : (
                  'Registrarme con este código'
                )}
              </button>
            </div>
            {applyMessage && (
              <p className="mt-2 text-xs text-yellow-400 text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                {applyMessage}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/20">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">bolt</span>
              ¿Por qué unirte?
            </p>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex-shrink-0">1</span>
                <span>Ingresa el código VIP y recibe <span className="text-amber-400 font-bold">+{myCodeData?.rewardXp || 0} XP</span> instantáneos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex-shrink-0">2</span>
                <span>Accede a <span className="text-green-400 font-bold">señales exclusivas</span> y estrategias premium</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0">3</span>
                <span>Únete a la comunidad de traders más profesional</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {myReferrals && myReferrals.length > 0 ? (
            myReferrals.map((referral: Referral) => (
              <div
                key={referral._id}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-lg">
                        person
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {referral.referredProfile?.nombre || 'Usuario nuevo'}
                      </p>
                      <p className="text-xs text-white/60">
                        {referral.referredProfile?.usuario || 'usuario'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[referral.status]}`}>
                    {referral.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60">
                      <span className="text-yellow-400">+{referral.referrerReward} XP</span> para ti
                    </span>
                    {referral.rewardType === 'subscription_days' && (
                      <span className="text-white/60">
                        <span className="text-green-400">+{referral.referredReward} días</span> para amigo
                      </span>
                    )}
                  </div>
                  <span className="text-white/40">
                    {formatDate(referral.createdAt)}
                  </span>
                </div>

                {!referral.referrerClaimed && referral.status === 'pending' && (
                  <button
                    onClick={() => handleClaimReward(referral._id)}
                    disabled={loading}
                    className="w-full mt-3 py-2 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-sm font-medium text-yellow-400 transition-colors disabled:opacity-50"
                  >
                    Reclamar {referral.referrerReward} XP
                  </button>
                )}

                {referral.referrerClaimed && referral.status === 'completed' && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-green-400 text-sm">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Recompensa reclamada
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-white/20 mb-4">history</span>
              <p className="text-white/60 text-sm">No tienes referidos aún</p>
              <p className="text-white/40 text-xs mt-1">
                Comparte tu código para empezar a ganar XP
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralPanel;
