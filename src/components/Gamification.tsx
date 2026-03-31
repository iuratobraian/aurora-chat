import React, { useState, useEffect } from 'react';
import { LottieAnimation } from './ui/LottieAnimation';

export interface LevelInfo {
  level: number;
  name: string;
  xpForCurrentLevel: number;
  xpNeeded: number;
  progress: number;
  nextLevel: string;
}

export interface AchievementInfo {
  id: string;
  name: string;
  icon: string;
  desc: string;
  unlocked: boolean;
  unlockedAt?: number;
  category?: 'trading' | 'social' | 'learning' | 'special';
  points?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  current?: number;
  target?: number;
}

export interface AchievementUnlockAnimationProps {
  achievement: AchievementInfo;
  onClose: () => void;
}

export const AchievementUnlockAnimation: React.FC<AchievementUnlockAnimationProps> = ({ achievement, onClose }) => {
  const [phase, setPhase] = useState<'entering' | 'particles' | 'exiting'>('entering');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('particles'), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'particles') {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'particles') {
      const timer = setTimeout(() => setPhase('exiting'), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'exiting') {
      const timer = setTimeout(onClose, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, onClose]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-500 to-purple-700',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityBorder = {
    common: 'border-gray-400/50',
    rare: 'border-blue-400/50',
    epic: 'border-purple-400/50',
    legendary: 'border-yellow-400/50',
  };

  const rarityGlow = {
    common: 'shadow-gray-400/30',
    rare: 'shadow-blue-400/30',
    epic: 'shadow-purple-400/30',
    legendary: 'shadow-yellow-400/30',
  };

  const rarity = achievement.rarity || 'common';
  const colorClass = rarityColors[rarity];
  const borderClass = rarityBorder[rarity];
  const glowClass = rarityGlow[rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className={`
          relative glass rounded-3xl p-8 max-w-sm mx-4 text-center
          border-2 ${borderClass}
          shadow-2xl ${glowClass}
          transform transition-all duration-500
          ${phase === 'entering' ? 'scale-50 opacity-0 animate-bounce-in' : ''}
          ${phase === 'particles' ? 'scale-100 opacity-100' : ''}
          ${phase === 'exiting' ? 'scale-75 opacity-0' : ''}
        `}
      >
        {/* Lottie Confetti Layer */}
        {phase === 'particles' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <LottieAnimation 
              animationData={null} // We would pass the JSON here
              className="w-full h-full opacity-50"
            />
          </div>
        )}

        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${colorClass} p-1 shadow-xl ${glowClass} animate-pulse-slow`}>
            <div className="w-full h-full rounded-full bg-[#050608] flex items-center justify-center">
              <span className="text-5xl animate-bounce">{achievement.icon}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-4 relative z-10">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
            ¡Logro Desbloqueado!
          </p>
          <h3 className="text-2xl font-black text-white mb-2">{achievement.name}</h3>
          <p className="text-sm text-white/60">{achievement.desc}</p>
        </div>

        {achievement.points && (
          <div className="flex items-center justify-center gap-2 mb-6 relative z-10">
            <span className="material-symbols-outlined text-lg text-yellow-400">stars</span>
            <span className="text-lg font-black text-yellow-400">+{achievement.points} XP</span>
          </div>
        )}

        <span className={`
          relative z-10 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
          bg-gradient-to-r ${colorClass} text-white
        `}>
          {rarity}
        </span>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
        
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50px, -100px) scale(0); opacity: 0; }
        }
        .animate-particle { animation: particle 1s ease-out forwards; }
        
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 8px currentColor); }
          50% { filter: drop-shadow(0 0 16px currentColor); }
        }
      `}</style>
    </div>
  );
};

export const AchievementProgress = ({ achievement }: { achievement: AchievementInfo }) => {
  const progress = achievement.progress || 0;
  const current = achievement.current || 0;
  const target = achievement.target || 1;
  
  const rarityColors = {
    common: 'bg-gray-400',
    rare: 'bg-blue-400',
    epic: 'bg-purple-400',
    legendary: 'bg-yellow-400',
  };
  
  const rarity = achievement.rarity || 'common';
  const colorClass = rarityColors[rarity];

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{current} / {target}</span>
        <span className="font-black text-white">{progress}%</span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

interface XPBarProps {
  currentXP: number;
  levelInfo: LevelInfo;
  showPercentage?: boolean;
  compact?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXP, levelInfo, showPercentage = true, compact = false }) => {
  const percentage = Math.min(100, Math.max(0, levelInfo.progress));

  const getLevelColor = (level: number) => {
    if (level < 10) return { from: 'from-emerald-500', to: 'to-teal-500', glow: 'shadow-emerald-500/30', text: 'text-emerald-400', bar: 'from-emerald-500 to-teal-500' };
    if (level < 20) return { from: 'from-blue-500', to: 'to-indigo-500', glow: 'shadow-blue-500/30', text: 'text-blue-400', bar: 'from-blue-500 to-indigo-500' };
    if (level < 35) return { from: 'from-purple-500', to: 'to-violet-500', glow: 'shadow-purple-500/30', text: 'text-purple-400', bar: 'from-purple-500 to-violet-500' };
    if (level < 50) return { from: 'from-orange-500', to: 'to-amber-500', glow: 'shadow-orange-500/30', text: 'text-orange-400', bar: 'from-orange-500 to-amber-500' };
    if (level < 75) return { from: 'from-pink-500', to: 'to-rose-500', glow: 'shadow-pink-500/30', text: 'text-pink-400', bar: 'from-pink-500 to-rose-500' };
    return { from: 'from-yellow-400', to: 'to-amber-500', glow: 'shadow-yellow-400/40', text: 'text-yellow-400', bar: 'from-yellow-400 to-amber-500' };
  };

  const colors = getLevelColor(levelInfo.level);

  return (
    <div className={`glass rounded-2xl border border-white/10 p-4 ${compact ? 'p-3' : 'p-5'} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r ${colors.from}/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`relative`}>
            <LevelBadge level={levelInfo.level} size={compact ? 'sm' : 'md'} />
            <div className={`absolute -inset-1 bg-gradient-to-r ${colors.from} ${colors.to} rounded-xl blur-md opacity-20 -z-10`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-white ${compact ? 'text-xs' : 'text-sm'}`}>
                {levelInfo.name}
              </span>
              <span className={`${colors.text} font-black text-xs px-2 py-0.5 rounded-lg bg-white/5 border border-current/20`}>
                Lv.{levelInfo.level}
              </span>
            </div>
            {!compact && (
              <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs">arrow_upward</span>
                Siguiente: {levelInfo.nextLevel}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-yellow-400 animate-pulse-subtle">auto_awesome</span>
            <p className={`font-black text-white ${compact ? 'text-xs' : 'text-base'}`}>
              {currentXP.toLocaleString()}
            </p>
          </div>
          <p className={`${colors.text} font-medium uppercase tracking-widest ${compact ? 'text-[9px]' : 'text-[10px]'}`}>XP Total</p>
        </div>
      </div>
      
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} rounded-full blur-sm opacity-30`} style={{ width: `${percentage}%` }} />
        <div className="relative h-2.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-700 ease-out shadow-lg ${colors.glow}`}
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/20 to-transparent" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        {!compact && (
          <p className="text-[10px] text-white/40">
            {levelInfo.xpForCurrentLevel.toLocaleString()} / {levelInfo.xpNeeded.toLocaleString()} XP
          </p>
        )}
        {showPercentage && (
          <span className={`text-[10px] font-black ${colors.text} ml-auto`}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

const LEVEL_ICONS: Record<string, string> = {
  'Newbie': '🌱',
  'Trader': '📈',
  'Expert': '⚡',
  'Master': '🔥',
  'Elite': '💎',
  'Legend': '👑',
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md', showLevel = false }) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-lg',
    md: 'w-11 h-11 text-xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const getLevelInfo = () => {
    if (level < 10) return { name: 'Newbie', icon: LEVEL_ICONS['Newbie'], color: 'from-emerald-500/30 to-teal-500/30 border-emerald-500/50', glow: 'shadow-emerald-500/40', text: 'text-emerald-400' };
    if (level < 20) return { name: 'Trader', icon: LEVEL_ICONS['Trader'], color: 'from-blue-500/30 to-indigo-500/30 border-blue-500/50', glow: 'shadow-blue-500/40', text: 'text-blue-400' };
    if (level < 35) return { name: 'Expert', icon: LEVEL_ICONS['Expert'], color: 'from-purple-500/30 to-violet-500/30 border-purple-500/50', glow: 'shadow-purple-500/40', text: 'text-purple-400' };
    if (level < 50) return { name: 'Master', icon: LEVEL_ICONS['Master'], color: 'from-orange-500/30 to-amber-500/30 border-orange-500/50', glow: 'shadow-orange-500/40', text: 'text-orange-400' };
    if (level < 75) return { name: 'Elite', icon: LEVEL_ICONS['Elite'], color: 'from-pink-500/30 to-rose-500/30 border-pink-500/50', glow: 'shadow-pink-500/40', text: 'text-pink-400' };
    return { name: 'Legend', icon: LEVEL_ICONS['Legend'], color: 'from-yellow-500/30 to-amber-500/30 border-yellow-500/50', glow: 'shadow-yellow-500/50 animate-pulse-glow', text: 'text-yellow-400' };
  };

  const info = getLevelInfo();

  return (
    <div className={`relative group`}>
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br ${info.color} rounded-xl border flex items-center justify-center shadow-lg ${info.glow} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
        title={`${info.name} - Nivel ${level}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
        <span className="drop-shadow-lg relative z-10">{info.icon}</span>
        {showLevel && (
          <div className="absolute -bottom-1 -right-1 bg-black/80 rounded-full px-1.5 py-0.5 border border-white/20">
            <span className={`text-[8px] font-black ${info.text}`}>{level}</span>
          </div>
        )}
      </div>
      <div className={`absolute inset-0 bg-gradient-to-br ${info.color.replace('border', 'bg').split(' ')[0]} rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity -z-10`} />
    </div>
  );
};

interface AchievementBadgeProps {
  achievement: AchievementInfo;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, size = 'md', showTooltip = true }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const rarityStyles = {
    common: {
      unlocked: 'from-gray-400/20 to-gray-500/20 border-gray-400/40 hover:border-gray-300/60',
      glow: 'shadow-gray-400/20',
      badge: 'bg-gray-500/20 text-gray-400',
    },
    rare: {
      unlocked: 'from-blue-400/20 to-blue-600/20 border-blue-400/40 hover:border-blue-300/60',
      glow: 'shadow-blue-400/20',
      badge: 'bg-blue-500/20 text-blue-400',
    },
    epic: {
      unlocked: 'from-purple-400/20 to-purple-600/20 border-purple-400/40 hover:border-purple-300/60',
      glow: 'shadow-purple-400/20',
      badge: 'bg-purple-500/20 text-purple-400',
    },
    legendary: {
      unlocked: 'from-yellow-400/20 to-orange-500/20 border-yellow-400/50 hover:border-orange-400/60',
      glow: 'shadow-yellow-400/30',
      badge: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400',
    },
  };

  const rarity = achievement.rarity || 'common';
  const styles = rarityStyles[rarity];

  const containerClass = achievement.unlocked
    ? `${sizeClasses[size]} bg-gradient-to-br ${styles.unlocked} rounded-2xl flex items-center justify-center shadow-lg ${styles.glow} cursor-pointer hover:scale-110 hover:rotate-3 transition-all duration-300`
    : `${sizeClasses[size]} bg-gray-500/10 border-gray-500/20 rounded-2xl flex items-center justify-center grayscale opacity-50`;

  return (
    <div className="relative group">
      <div className={containerClass}>
        <span className={achievement.unlocked ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}>
          {achievement.icon}
        </span>
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-black text-white">{achievement.name}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${styles.badge}`}>
              {rarity}
            </span>
          </div>
          <p className="text-[10px] text-gray-400">{achievement.desc}</p>
          {achievement.points && (
            <p className="text-[9px] text-yellow-400 mt-1">+{achievement.points} XP</p>
          )}
          {achievement.unlocked && (
            <p className="text-[9px] text-signal-green mt-1">
              ✓ Desbloqueado
            </p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </div>
      )}
    </div>
  );
};

export interface LeaderboardUser {
  userId: string;
  nombre: string;
  usuario: string;
  avatar: string;
  xp: number;
  level: LevelInfo;
}

interface LeaderboardListProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  title?: string;
  showRank?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ 
  users, 
  currentUserId, 
  title = "Top Traders",
  showRank = true,
  maxItems = 10,
  compact = false 
}) => {
  const topThree = ['🥇', '🥈', '🥉'];
  const displayUsers = users.slice(0, maxItems);

  return (
    <div className="bg-[#0f1115] rounded-2xl border border-white/5 overflow-hidden">
      {!compact && (
        <div className="px-4 py-3 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">leaderboard</span>
            {title}
          </h3>
        </div>
      )}
      
      <div className={compact ? "divide-y divide-white/5" : ""}>
        {displayUsers.map((user, index) => {
          const isCurrentUser = user.userId === currentUserId;
          const isTopThree = index < 3;
          
          return (
            <div 
              key={user.userId}
              className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                isCurrentUser 
                  ? 'bg-primary/10 border-l-2 border-primary' 
                  : 'hover:bg-white/5'
              }`}
            >
              {showRank && (
                <div className={`w-8 text-center font-black text-sm ${
                  index === 0 ? 'text-yellow-400' : 
                  index === 1 ? 'text-gray-300' : 
                  index === 2 ? 'text-amber-600' : 
                  'text-gray-500'
                }`}>
                  {isTopThree ? topThree[index] : index + 1}
                </div>
              )}
              
              <img 
                src={user.avatar} 
                alt={user.nombre}
                className={`${compact ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} border ${
                  isTopThree 
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                    : 'border-white/10'
                }`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-white truncate ${compact ? 'text-xs' : 'text-sm'}`}>{user.nombre}</p>
                  {isCurrentUser && (
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded uppercase">
                      Tú
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500">@{user.usuario}</p>
              </div>
              
              <div className="text-right">
                <p className={`font-black text-white ${compact ? 'text-xs' : 'text-sm'}`}>{user.xp.toLocaleString()}</p>
                <p className="text-[9px] text-gray-500 uppercase">
                  {user.level.name} Lv.{user.level.level}
                </p>
              </div>
            </div>
          );
        })}
        
        {users.length === 0 && (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-600">leaderboard</span>
            <p className="text-sm text-gray-500 mt-2">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPBar;
