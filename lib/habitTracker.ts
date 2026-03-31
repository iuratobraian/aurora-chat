import logger from './utils/logger';

export interface DailyActivity {
  date: string;
  login: boolean;
  postsCreated: number;
  commentsGiven: number;
  signalsViewed: number;
  timeSpentMinutes: number;
  xpEarned: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
  streakStartDate: string | null;
}

export interface HabitMetrics {
  dailyReturnRate: number;
  avgSessionDuration: number;
  avgDailyActions: number;
  topActiveDays: string[];
  weeklyConsistency: number;
  monthlyConsistency: number;
}

export interface HabitGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  xpReward: number;
  completed: boolean;
}

export interface HabitProfile {
  userId: string;
  streak: StreakData;
  metrics: HabitMetrics;
  goals: HabitGoal[];
  activityHistory: DailyActivity[];
  lastUpdated: number;
}

const HABIT_KEY = 'habit_profile';
const ACTIVITY_KEY = 'daily_activity';
const STREAK_KEY = 'streak_data';
const GOALS_KEY = 'habit_goals';
const MAX_HISTORY_DAYS = 90;

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch { return defaultVal; }
}

function setLocalItem(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    logger.warn('[HabitTracker] Failed to write to localStorage:', e);
  }
}

function calculateStreak(activityHistory: DailyActivity[]): StreakData {
  if (activityHistory.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isActiveToday: false,
      streakStartDate: null,
    };
  }

  const sortedDays = [...activityHistory]
    .filter(a => a.login)
    .map(a => a.date)
    .sort()
    .reverse();

  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  const lastActiveDate = sortedDays[0] || null;
  const isActiveToday = lastActiveDate === today;
  const wasActiveYesterday = sortedDays.includes(yesterday);

  let currentStreak = 0;
  let streakStartDate: string | null = null;

  if (isActiveToday || wasActiveYesterday) {
    currentStreak = 1;
    streakStartDate = lastActiveDate;

    for (let i = 1; i < sortedDays.length; i++) {
      const current = new Date(sortedDays[i - 1]);
      const prev = new Date(sortedDays[i]);
      const diffDays = (current.getTime() - prev.getTime()) / 86400000;

      if (diffDays === 1) {
        currentStreak++;
        streakStartDate = sortedDays[i];
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const current = new Date(sortedDays[i - 1]);
    const prev = new Date(sortedDays[i]);
    const diffDays = (current.getTime() - prev.getTime()) / 86400000;

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
    isActiveToday,
    streakStartDate,
  };
}

function calculateMetrics(activityHistory: DailyActivity[]): HabitMetrics {
  const last30Days = activityHistory.slice(-30);
  const last7Days = activityHistory.slice(-7);

  const activeDays = last30Days.filter(d => d.login).length;
  const dailyReturnRate = last30Days.length > 0 ? (activeDays / Math.min(30, last30Days.length)) * 100 : 0;

  const avgSessionDuration = last30Days.length > 0
    ? last30Days.reduce((sum, d) => sum + d.timeSpentMinutes, 0) / last30Days.length
    : 0;

  const avgDailyActions = last30Days.length > 0
    ? last30Days.reduce((sum, d) => sum + d.postsCreated + d.commentsGiven, 0) / last30Days.length
    : 0;

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayCounts: Record<number, number> = {};

  for (const activity of last30Days) {
    const dayIndex = new Date(activity.date).getDay();
    dayCounts[dayIndex] = (dayCounts[dayIndex] || 0) + 1;
  }

  const topActiveDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([idx]) => dayNames[parseInt(idx)]);

  const weeklyActiveDays = last7Days.filter(d => d.login).length;
  const weeklyConsistency = Math.min(100, (weeklyActiveDays / 7) * 100);

  const monthlyConsistency = dailyReturnRate;

  return {
    dailyReturnRate: Math.round(dailyReturnRate),
    avgSessionDuration: Math.round(avgSessionDuration),
    avgDailyActions: Math.round(avgDailyActions * 10) / 10,
    topActiveDays,
    weeklyConsistency: Math.round(weeklyConsistency),
    monthlyConsistency: Math.round(monthlyConsistency),
  };
}

function getDefaultGoals(): HabitGoal[] {
  return [
    {
      id: 'daily-login',
      name: 'Iniciar sesión',
      target: 1,
      current: 0,
      unit: 'vez',
      xpReward: 10,
      completed: false,
    },
    {
      id: 'create-post',
      name: 'Crear un post',
      target: 1,
      current: 0,
      unit: 'post',
      xpReward: 50,
      completed: false,
    },
    {
      id: 'comment',
      name: 'Comentar',
      target: 1,
      current: 0,
      unit: 'comentario',
      xpReward: 25,
      completed: false,
    },
    {
      id: 'view-signals',
      name: 'Ver señales',
      target: 3,
      current: 0,
      unit: 'señales',
      xpReward: 30,
      completed: false,
    },
    {
      id: 'engage',
      name: 'Interacciones',
      target: 5,
      current: 0,
      unit: 'interacciones',
      xpReward: 40,
      completed: false,
    },
  ];
}

export const HabitService = {
  recordActivity(
    userId: string,
    activity: Partial<DailyActivity>
  ): void {
    const today = getDateString();
    const history = getLocalItem<DailyActivity[]>(ACTIVITY_KEY, []);

    const todayActivity = history.find(a => a.date === today) || {
      date: today,
      login: false,
      postsCreated: 0,
      commentsGiven: 0,
      signalsViewed: 0,
      timeSpentMinutes: 0,
      xpEarned: 0,
    };

    if (activity.login) todayActivity.login = true;
    if (activity.postsCreated) todayActivity.postsCreated += activity.postsCreated;
    if (activity.commentsGiven) todayActivity.commentsGiven += activity.commentsGiven;
    if (activity.signalsViewed) todayActivity.signalsViewed += activity.signalsViewed;
    if (activity.timeSpentMinutes) todayActivity.timeSpentMinutes += activity.timeSpentMinutes;
    if (activity.xpEarned) todayActivity.xpEarned += activity.xpEarned;

    const existingIndex = history.findIndex(a => a.date === today);
    if (existingIndex >= 0) {
      history[existingIndex] = todayActivity;
    } else {
      history.push(todayActivity);
    }

    const cutoffDate = getDateString(new Date(Date.now() - MAX_HISTORY_DAYS * 86400000));
    const filteredHistory = history.filter(a => a.date >= cutoffDate);
    filteredHistory.sort((a, b) => b.date.localeCompare(a.date));

    setLocalItem(ACTIVITY_KEY, filteredHistory);

    this.updateStreakData(userId);
    this.updateGoals(filteredHistory);
  },

  updateStreakData(userId: string): void {
    const history = getLocalItem<DailyActivity[]>(ACTIVITY_KEY, []);
    const streak = calculateStreak(history);
    setLocalItem(`${STREAK_KEY}_${userId}`, streak);
  },

  updateGoals(activityHistory: DailyActivity[]): void {
    const today = getDateString();
    const todayActivity = activityHistory.find(a => a.date === today);

    const goals = getDefaultGoals();

    if (todayActivity) {
      for (const goal of goals) {
        switch (goal.id) {
          case 'daily-login':
            goal.current = todayActivity.login ? 1 : 0;
            break;
          case 'create-post':
            goal.current = Math.min(todayActivity.postsCreated, goal.target);
            break;
          case 'comment':
            goal.current = Math.min(todayActivity.commentsGiven, goal.target);
            break;
          case 'view-signals':
            goal.current = Math.min(todayActivity.signalsViewed, goal.target);
            break;
          case 'engage':
            goal.current = Math.min(
              todayActivity.postsCreated + todayActivity.commentsGiven,
              goal.target
            );
            break;
        }
        goal.completed = goal.current >= goal.target;
      }
    }

    setLocalItem(GOALS_KEY, goals);
  },

  getHabitProfile(userId: string): HabitProfile {
    const activityHistory = getLocalItem<DailyActivity[]>(ACTIVITY_KEY, []);
    const streak = getLocalItem<StreakData>(`${STREAK_KEY}_${userId}`, {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isActiveToday: false,
      streakStartDate: null,
    });
    const goals = getLocalItem<HabitGoal[]>(GOALS_KEY, getDefaultGoals());

    return {
      userId,
      streak,
      metrics: calculateMetrics(activityHistory),
      goals,
      activityHistory,
      lastUpdated: Date.now(),
    };
  },

  getStreakData(userId: string): StreakData {
    return getLocalItem<StreakData>(`${STREAK_KEY}_${userId}`, {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isActiveToday: false,
      streakStartDate: null,
    });
  },

  getGoals(): HabitGoal[] {
    const activityHistory = getLocalItem<DailyActivity[]>(ACTIVITY_KEY, []);
    this.updateGoals(activityHistory);
    return getLocalItem<HabitGoal[]>(GOALS_KEY, getDefaultGoals());
  },

  getCompletedGoalsToday(): HabitGoal[] {
    return this.getGoals().filter(g => g.completed);
  },

  getPendingGoalsToday(): HabitGoal[] {
    return this.getGoals().filter(g => !g.completed);
  },

  getXpFromCompletedGoals(): number {
    return this.getCompletedGoalsToday().reduce((sum, g) => sum + g.xpReward, 0);
  },

  recordLogin(userId: string): void {
    this.recordActivity(userId, { login: true });
  },

  recordPostCreated(userId: string): void {
    this.recordActivity(userId, { postsCreated: 1, xpEarned: 50 });
  },

  recordComment(userId: string): void {
    this.recordActivity(userId, { commentsGiven: 1, xpEarned: 25 });
  },

  recordSignalView(userId: string): void {
    this.recordActivity(userId, { signalsViewed: 1, xpEarned: 10 });
  },

  recordTimeSpent(userId: string, minutes: number): void {
    this.recordActivity(userId, { timeSpentMinutes: minutes });
  },

  getStreakMessage(streak: StreakData): string {
    if (streak.currentStreak === 0) {
      return '¡Comienza tu racha hoy!';
    }
    if (streak.currentStreak === 1) {
      return '¡Primer día! Sigue así.';
    }
    if (streak.currentStreak < 7) {
      return `${streak.currentStreak} días seguidos. ¡Vas bien!`;
    }
    if (streak.currentStreak < 14) {
      return `¡${streak.currentStreak} días! El compromiso paga.`;
    }
    if (streak.currentStreak < 30) {
      return `¡${streak.currentStreak} días! Impresionante.`;
    }
    return `¡${streak.currentStreak} días! ¡Eres un profesional!`;
  },

  clearProfile(userId: string): void {
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem(`${STREAK_KEY}_${userId}`);
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(HABIT_KEY);
  },
};
