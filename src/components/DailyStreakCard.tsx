import React from 'react';
import type { StreakData, HabitGoal, HabitMetrics } from '../../lib/habitTracker';

interface DailyStreakCardProps {
  streak: StreakData;
  goals: HabitGoal[];
  metrics: HabitMetrics;
  pendingXp: number;
  streakMessage: string;
  onGoalClick?: (goal: HabitGoal) => void;
}

export function DailyStreakCard({
  streak,
  goals,
  metrics,
  pendingXp,
  streakMessage,
  onGoalClick,
}: DailyStreakCardProps) {
  const completedCount = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const progressPercent = totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold opacity-90">Racha Diaria</h3>
          <p className="text-sm opacity-75">{streakMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold">{streak.currentStreak}</span>
          <span className="text-xl opacity-75">días</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{metrics.dailyReturnRate}%</div>
          <div className="text-xs opacity-75">Retorno</div>
        </div>
        <div className="bg-white/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{metrics.avgSessionDuration}m</div>
          <div className="text-xs opacity-75">Sesión</div>
        </div>
        <div className="bg-white/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{metrics.weeklyConsistency}%</div>
          <div className="text-xs opacity-75">Esta semana</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Metas de hoy</span>
          <span>{completedCount}/{totalGoals}</span>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {pendingXp > 0 && (
          <p className="text-xs mt-1 opacity-75">
            +{pendingXp} XP disponibles
          </p>
        )}
      </div>

      <div className="space-y-2">
        {goals.slice(0, 4).map(goal => (
          <button
            key={goal.id}
            onClick={() => onGoalClick?.(goal)}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
              goal.completed
                ? 'bg-white/20 text-white/75'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {goal.completed ? '✅' : '⬜'}
              </span>
              <span className="text-sm">{goal.name}</span>
            </div>
            <span className="text-xs opacity-75">+{goal.xpReward} XP</span>
          </button>
        ))}
      </div>

      {streak.longestStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs opacity-75">
            🔥 Tu mejor racha: {streak.longestStreak} días
          </p>
        </div>
      )}
    </div>
  );
}

export default DailyStreakCard;
