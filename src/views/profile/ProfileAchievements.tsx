import React from 'react';
import { AchievementInfo } from '../../components/Gamification';
import { AchievementProgress } from '../../components/Gamification';

interface ProfileAchievementsProps {
  unlockedAchievements: AchievementInfo[];
  lockedAchievements: AchievementInfo[];
  userProgress?: any;
  isOwnProfile: boolean;
}

export const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({
  unlockedAchievements,
  lockedAchievements,
  userProgress,
  isOwnProfile
}) => {
  const totalAchievements = unlockedAchievements.length + lockedAchievements.length;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black uppercase tracking-wider">
            Progreso de Logros
          </h3>
          <span className="text-primary font-bold">
            {unlockedAchievements.length} / {totalAchievements}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
            style={{ 
              width: `${totalAchievements > 0 
                ? (unlockedAchievements.length / totalAchievements) * 100 
                : 0}%` 
            }}
          />
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">
            Desbloqueados
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="text-white font-bold text-sm mb-1">{achievement.name}</h4>
                <p className="text-white/40 text-xs">{achievement.desc}</p>
                {achievement.points && (
                  <span className="inline-block mt-2 px-2 py-1 bg-primary/20 rounded-full text-primary text-xs font-bold">
                    +{achievement.points} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">
            Bloqueados
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass rounded-2xl p-4 text-center opacity-50"
              >
                <div className="text-4xl mb-2 grayscale">🔒</div>
                <h4 className="text-white font-bold text-sm mb-1">{achievement.name}</h4>
                <p className="text-white/40 text-xs mb-2">{achievement.desc}</p>
                {userProgress && (
                  <AchievementProgress achievement={achievement} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAchievements;
