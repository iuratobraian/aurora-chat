import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../components/Avatar';
import { soundManager } from '../utils/soundManager';
import { StorageService } from '../services/storage';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface LeaderboardUser {
  oderId?: string;
  userId: string;
  nombre: string;
  usuario: string;
  avatar?: string;
  avatarUrl?: string;
  xp: number;
  level: {
    level: number;
    name: string;
  };
  score?: number;
  metrics?: {
    posts?: number;
  };
}

interface LeaderboardViewProps {
  usuario: any;
}

const RANKS = [
  { name: 'Hierro', icon: '⚔️', color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-400/30' },
  { name: 'Bronce', icon: '🪨', color: 'from-amber-600 to-amber-800', bgColor: 'bg-amber-600/10', borderColor: 'border-amber-600/30' },
  { name: 'Plata', icon: '🥈', color: 'from-gray-300 to-gray-400', bgColor: 'bg-gray-300/10', borderColor: 'border-gray-300/30' },
  { name: 'Oro', icon: '🥇', color: 'from-yellow-400 to-amber-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-400/30' },
  { name: 'Platino', icon: '💎', color: 'from-cyan-400 to-blue-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-400/30' },
  { name: 'Diamante', icon: '💠', color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-400/30' },
  { name: 'Maestro', icon: '🔥', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  { name: 'Legend', icon: '👑', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
];

const ACHIEVEMENTS = [
  { id: 'first_post', name: 'Primera Publicación', icon: '📝', desc: 'Crea tu primer post', xp: 50 },
  { id: 'streak_7', name: 'Racha de 7 Días', icon: '🔥', desc: 'Inicia sesión 7 días seguidos', xp: 100 },
  { id: 'influencer', name: 'Influencer', icon: '⭐', desc: 'Llega a 100 seguidores', xp: 200 },
  { id: 'collector', name: 'Coleccionista', icon: '🏆', desc: 'Participa en 10 competencias', xp: 150 },
];

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ usuario }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [selectedRank, setSelectedRank] = useState<number>(0);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'intro' | 'ready'>('loading');
  const [period, setPeriod] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [claimingReward, setClaimingReward] = useState(false);
  const audioPlayed = useRef(false);

  const claimMilestoneReward = useMutation(api.referrals.claimMilestoneReward);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const leaderboard = period === 'weekly'
          ? await StorageService.getWeeklyLeaderboard(100)
          : period === 'monthly'
          ? await StorageService.getMonthlyLeaderboard(100)
          : await StorageService.getGlobalLeaderboard(100);
        setUsers(leaderboard || []);
        
        if (usuario && usuario.id !== 'guest') {
          const progress = await StorageService.getUserProgress(usuario.id);
          setUserProgress(progress);
          const index = (leaderboard || []).findIndex(u => u.userId === usuario.id || u.oderId === usuario.id);
          setUserPosition(index >= 0 ? index + 1 : null);
          
          const userRank = getUserRank((progress?.xp || usuario?.xp || 0));
          setSelectedRank(userRank);
        }
        
        setTimeout(() => {
          setAnimationPhase('intro');
          setTimeout(() => setAnimationPhase('ready'), 1500);
        }, 500);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [usuario?.id, period]);

  useEffect(() => {
    if (animationPhase === 'intro' && !audioPlayed.current) {
      soundManager.playNotification('achievement');
      audioPlayed.current = true;
    }
  }, [animationPhase]);

  const getUserRank = (xp: number): number => {
    const rankThresholds = [0, 500, 1500, 4000, 10000, 25000, 50000, 100000];
    for (let i = rankThresholds.length - 1; i >= 0; i--) {
      if (xp >= rankThresholds[i]) return i;
    }
    return 0;
  };

  const getRankForPosition = (position: number): typeof RANKS[0] => {
    if (position === 1) return { name: 'Champion', icon: '🏆', color: 'from-yellow-400 to-amber-500', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-400/50' };
    if (position === 2) return { name: 'Runner Up', icon: '🥈', color: 'from-gray-300 to-gray-400', bgColor: 'bg-gray-300/20', borderColor: 'border-gray-300/50' };
    if (position === 3) return { name: 'Third Place', icon: '🥉', color: 'from-amber-600 to-amber-800', bgColor: 'bg-amber-600/20', borderColor: 'border-amber-600/50' };
    return RANKS[selectedRank];
  };

  const getTopThree = () => users.slice(0, 3);
  const getRest = () => users.slice(3);

  const currentRank = RANKS[selectedRank];

  if (loading || animationPhase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#0f0f18]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-400 border-l-primary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-pulse">🎮</span>
            </div>
          </div>
          <p className="text-lg font-bold text-white/80 tracking-widest animate-pulse">
            CARGANDO RANKING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] p-4 md:p-6 pb-24">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className={`relative mb-8 transition-all duration-1000 ${animationPhase === 'intro' ? 'translate-y-[-20px] opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-4xl md:text-5xl animate-bounce">🏆</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider">
                ARENA DE TRADERS
              </h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase">
                {users.length} Guerreros en la arena
              </p>
            </div>
          </div>
          
          {/* Season Badge */}
          <div className="glass rounded-xl px-4 py-2 border border-primary/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Temporada</p>
            <p className="text-sm font-black text-primary">2025 - I</p>
          </div>
        </div>

        {/* User Stats Bar */}
        {usuario && usuario.id !== 'guest' && userProgress && (
          <div className="glass rounded-2xl p-4 border border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center gap-4">
              <Avatar 
                src={usuario.avatar} 
                name={usuario.nombre}
                size="lg"
                className="ring-2 ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">{usuario.nombre}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r ${currentRank.color} text-black`}>
                    {currentRank.icon} {currentRank.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>XP: <span className="text-white font-bold">{userProgress.xp?.toLocaleString() || 0}</span></span>
                  <span>Nivel: <span className="text-white font-bold">{userProgress.level?.level || 1}</span></span>
                  {userPosition && (
                    <span className="text-primary">#{userPosition}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tu Progreso</p>
                <p className="text-2xl font-black text-white">#{userPosition || '?'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Podium */}
      <div className={`relative mb-8 transition-all duration-1000 delay-300 ${animationPhase === 'intro' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="flex items-end justify-center gap-2 md:gap-4">
          {/* 2nd Place */}
          {getTopThree()[1] && (
            <div className="flex-1 max-w-[140px]">
              <div className="bg-gradient-to-t from-gray-500/20 to-transparent rounded-t-2xl p-4 text-center">
                <div className="relative inline-block mb-2">
                  <Avatar 
                    src={getTopThree()[1].avatar || getTopThree()[1].avatarUrl}
                    name={getTopThree()[1].nombre}
                    size="lg"
                    className="ring-2 ring-gray-300 shadow-lg shadow-gray-400/20"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">🥈</span>
                </div>
                <p className="text-sm font-bold text-white truncate">{getTopThree()[1].nombre}</p>
                <p className="text-xs text-gray-400">{getTopThree()[1].xp?.toLocaleString() || getTopThree()[1].xp} XP</p>
              </div>
              <div className="h-[60px] bg-gradient-to-t from-gray-500/30 to-gray-500/10 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-black text-gray-300">2</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {getTopThree()[0] && (
            <div className="flex-1 max-w-[180px]">
              <div className="bg-gradient-to-t from-yellow-500/20 to-transparent rounded-t-2xl p-4 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <span className="text-4xl">👑</span>
                </div>
                <div className="relative inline-block mb-2 mt-2">
                  <Avatar 
                    src={getTopThree()[0].avatar || getTopThree()[0].avatarUrl}
                    name={getTopThree()[0].nombre}
                    size="xl"
                    className="ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">🥇</span>
                </div>
                <p className="text-sm font-black text-yellow-400 truncate">{getTopThree()[0].nombre}</p>
                <p className="text-xs text-yellow-400/80">{(getTopThree()[0].xp || 0).toLocaleString()} XP</p>
              </div>
              <div className="h-[100px] bg-gradient-to-t from-yellow-500/40 to-yellow-500/10 rounded-t-lg flex items-center justify-center border-t-2 border-yellow-400/30">
                <span className="text-4xl font-black text-yellow-400">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {getTopThree()[2] && (
            <div className="flex-1 max-w-[140px]">
              <div className="bg-gradient-to-t from-amber-600/20 to-transparent rounded-t-2xl p-4 text-center">
                <div className="relative inline-block mb-2">
                  <Avatar 
                    src={getTopThree()[2].avatar || getTopThree()[2].avatarUrl}
                    name={getTopThree()[2].nombre}
                    size="lg"
                    className="ring-2 ring-amber-600 shadow-lg shadow-amber-600/20"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">🥉</span>
                </div>
                <p className="text-sm font-bold text-white truncate">{getTopThree()[2].nombre}</p>
                <p className="text-xs text-gray-400">{getTopThree()[2].xp?.toLocaleString() || getTopThree()[2].xp} XP</p>
              </div>
              <div className="h-[40px] bg-gradient-to-t from-amber-600/30 to-amber-600/10 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-black text-amber-600">3</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className={`space-y-2 transition-all duration-1000 delay-500 ${animationPhase === 'intro' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">military_tech</span>
            Tabla de Clasificación {period === 'weekly' ? '- Semanal' : period === 'monthly' ? '- Mensual' : ''}
          </h2>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {([['global', 'Global'], ['weekly', 'Semanal'], ['monthly', 'Mensual']] as const).map(([p, label]) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  period === p
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {RANKS.map((rank, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRank(idx)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  selectedRank === idx 
                    ? `bg-gradient-to-br ${rank.color} text-black` 
                    : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
                title={rank.name}
              >
                <span className="text-sm">{rank.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List Items */}
        <div className="space-y-1">
          {getRest().map((user, index) => {
            const position = index + 4;
            const isCurrentUser = usuario && (user.userId === usuario.id || user.oderId === usuario.id);
            const rank = getRankForPosition(position);
            const userXP = user.xp || user.score || 0;
            const level = user.level?.level || 1;
            
            return (
              <div
                key={user.userId || user.oderId || index}
                onMouseEnter={() => {
                  setHoveredUser(user.userId || user.oderId);
                  soundManager.playNotification('chat');
                }}
                onMouseLeave={() => setHoveredUser(null)}
                className={`
                  relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer
                  ${isCurrentUser 
                    ? 'bg-gradient-to-r from-primary/20 to-transparent border border-primary/30 shadow-lg shadow-primary/10' 
                    : hoveredUser === (user.userId || user.oderId)
                      ? 'bg-white/10 border border-white/10 scale-[1.02]'
                      : 'bg-white/5 border border-white/5 hover:bg-white/5'
                  }
                `}
              >
                {/* Position */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg
                  ${position <= 3 
                    ? `bg-gradient-to-br ${rank.color} text-black` 
                    : 'bg-white/10 text-white/80'
                  }
                `}>
                  {position}
                </div>

                {/* Avatar */}
                <Avatar 
                  src={user.avatar || user.avatarUrl}
                  name={user.nombre}
                  size="md"
                  className={`
                    transition-all duration-300
                    ${isCurrentUser ? 'ring-2 ring-primary' : ''}
                    ${hoveredUser === (user.userId || user.oderId) ? 'scale-110' : ''}
                  `}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate">{user.nombre}</p>
                    {isCurrentUser && (
                      <span className="px-1.5 py-0.5 bg-primary text-[9px] font-black rounded uppercase">
                        Tú
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>@{user.usuario}</span>
                    <span>•</span>
                    <span>Nivel {level}</span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-black text-white text-lg">{userXP.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">XP</p>
                </div>

                {/* Rank Icon */}
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  bg-gradient-to-br ${rank.color} bg-opacity-20 border ${rank.borderColor}
                `}>
                  <span className="text-lg">{rank.icon}</span>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/40">
                  <div 
                    className={`h-full bg-gradient-to-r ${rank.color} transition-all duration-500`}
                    style={{ width: `${Math.min(100, (userXP % 1000) / 10)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎮</span>
            <p className="text-lg font-bold text-white">¡Sé el primer guerrero!</p>
            <p className="text-sm text-gray-400">La arena está vacía. ¡Participa y比别人先得奖励!</p>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      {usuario && usuario.id !== 'guest' && (
        <div className={`mt-8 transition-all duration-1000 delay-700 ${animationPhase === 'intro' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">workspace_premium</span>
            Logros Disponibles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((achievement) => (
              <div 
                key={achievement.id}
                className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all hover:scale-105 cursor-pointer"
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="text-xs font-bold text-white">{achievement.name}</p>
                <p className="text-[10px] text-gray-400 mb-2">{achievement.desc}</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">+{achievement.xp}</span>
                  <span className="text-[10px] text-gray-500">XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Rewards Section */}
      {usuario && usuario.id !== 'guest' && (
        <div className={`mt-8 transition-all duration-1000 delay-800 ${animationPhase === 'intro' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">card_membership</span>
            Premios de Referidos
          </h2>
          
          <div className="glass rounded-2xl p-6 border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{userProgress?.referralStats?.completedReferrals || 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Referidos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-yellow-400">20%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Comisión</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-primary">${userProgress?.referralStats?.totalCommission || 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Ganado</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-purple-400">{userProgress?.referralStats?.purchaseCount || 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Compras</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Progreso Milestone</span>
                <span className="text-xs text-gray-400">10 referidos = 100%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (userProgress?.referralStats?.milestoneProgress || 0))}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {userProgress?.referralStats?.milestoneProgress || 0}% - {userProgress?.referralStats?.completedReferrals || 0}/10 referidos completados
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-primary/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Premio Milestone</p>
                  <p className="text-xs text-gray-400">Al completar 10 referidos:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-400 text-xs">✓ Suscripción PRO gratis</span>
                    <span className="text-primary text-xs">✓ Cuenta de fondeo $5k</span>
                  </div>
                </div>
                {(userProgress?.referralStats?.hasMilestoneReward) ? (
                  <span className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold text-green-400">
                    ✓ Desbloqueado
                  </span>
                ) : (
                  <button 
                    onClick={async () => {
                      if (claimingReward) return;
                      setClaimingReward(true);
                      try {
                        await claimMilestoneReward({});
                        soundManager.playNotification('achievement');
                        const progress = await StorageService.getUserProgress(usuario?.id);
                        setUserProgress(progress);
                      } catch (err) {
                        console.error('Error claiming milestone reward:', err);
                      } finally {
                        setClaimingReward(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/80 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                    disabled={(userProgress?.referralStats?.completedReferrals || 0) < 10 || claimingReward}
                  >
                    {claimingReward ? '...' : 'Reclamar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action for Guests */}
      {(!usuario || usuario.id === 'guest') && (
        <div className="mt-8 glass rounded-2xl p-6 border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent text-center">
          <span className="text-4xl mb-3 block">🎯</span>
          <h3 className="text-lg font-black text-white mb-2">¡Únete a la Arena!</h3>
          <p className="text-sm text-gray-400 mb-4">Regístrate para competir, ganar XP y desbloquear recompensas exclusivas.</p>
          <button 
            onClick={() => soundManager.playNotification('achievement')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            Registrarse Ahora
          </button>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LeaderboardView;
