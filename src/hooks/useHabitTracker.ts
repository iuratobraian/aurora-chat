import { useState, useCallback, useEffect } from 'react';
import {
  HabitService,
  type HabitProfile,
  type StreakData,
  type HabitMetrics,
  type HabitGoal,
  type DailyActivity,
} from '../../lib/habitTracker';
import logger from '../utils/logger';

interface UseHabitTrackerOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseHabitTrackerReturn {
  streak: StreakData;
  metrics: HabitMetrics;
  goals: HabitGoal[];
  profile: HabitProfile | null;
  completedGoals: HabitGoal[];
  pendingGoals: HabitGoal[];
  pendingXp: number;
  streakMessage: string;
  isLoading: boolean;
  recordLogin: () => void;
  recordPostCreated: () => void;
  recordComment: () => void;
  recordSignalView: () => void;
  recordTimeSpent: (minutes: number) => void;
  refresh: () => void;
  clearProfile: () => void;
}

export function useHabitTracker({
  userId,
  enabled = true,
}: UseHabitTrackerOptions = {}): UseHabitTrackerReturn {
  const [profile, setProfile] = useState<HabitProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(() => {
    if (!enabled || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = HabitService.getHabitProfile(userId);
      setProfile(data);
    } catch (err) {
      logger.error('[useHabitTracker] Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const recordLogin = useCallback(() => {
    if (!userId) return;
    HabitService.recordLogin(userId);
    loadProfile();
  }, [userId, loadProfile]);

  const recordPostCreated = useCallback(() => {
    if (!userId) return;
    HabitService.recordPostCreated(userId);
    loadProfile();
  }, [userId, loadProfile]);

  const recordComment = useCallback(() => {
    if (!userId) return;
    HabitService.recordComment(userId);
    loadProfile();
  }, [userId, loadProfile]);

  const recordSignalView = useCallback(() => {
    if (!userId) return;
    HabitService.recordSignalView(userId);
    loadProfile();
  }, [userId, loadProfile]);

  const recordTimeSpent = useCallback((minutes: number) => {
    if (!userId) return;
    HabitService.recordTimeSpent(userId, minutes);
    loadProfile();
  }, [userId, loadProfile]);

  const refresh = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  const clearProfile = useCallback(() => {
    if (!userId) return;
    HabitService.clearProfile(userId);
    loadProfile();
  }, [userId, loadProfile]);

  const completedGoals = profile?.goals.filter(g => g.completed) || [];
  const pendingGoals = profile?.goals.filter(g => !g.completed) || [];
  const pendingXp = pendingGoals.reduce((sum, g) => sum + g.xpReward, 0);
  const streakMessage = profile?.streak ? HabitService.getStreakMessage(profile.streak) : '';

  return {
    streak: profile?.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isActiveToday: false,
      streakStartDate: null,
    },
    metrics: profile?.metrics || {
      dailyReturnRate: 0,
      avgSessionDuration: 0,
      avgDailyActions: 0,
      topActiveDays: [],
      weeklyConsistency: 0,
      monthlyConsistency: 0,
    },
    goals: profile?.goals || [],
    profile,
    completedGoals,
    pendingGoals,
    pendingXp,
    streakMessage,
    isLoading,
    recordLogin,
    recordPostCreated,
    recordComment,
    recordSignalView,
    recordTimeSpent,
    refresh,
    clearProfile,
  };
}

export default useHabitTracker;
