export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  xp: number;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
  referralsCount: number;
  loginStreak: number;
  daysActive: number;
  totalXP: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_post",
    name: "Voz Propia",
    desc: "Crea tu primer post",
    icon: "✍️",
    xp: 25,
    condition: (s) => s.postsCount >= 1
  },
  {
    id: "prolific_writer",
    name: "Escritor Prolífico",
    desc: "Crea 10 posts",
    icon: "📝",
    xp: 100,
    condition: (s) => s.postsCount >= 10
  },
  {
    id: "influencer",
    name: "Influencer",
    desc: "Crea 50 posts",
    icon: "⭐",
    xp: 500,
    condition: (s) => s.postsCount >= 50
  },
  {
    id: "streak_3",
    name: "En Racha",
    desc: "3 días consecutivos de login",
    icon: "🌟",
    xp: 50,
    condition: (s) => s.loginStreak >= 3
  },
  {
    id: "streak_7",
    name: "Consistente",
    desc: "7 días consecutivos de login",
    icon: "🔥",
    xp: 100,
    condition: (s) => s.loginStreak >= 7
  },
  {
    id: "streak_30",
    name: "Dedicado",
    desc: "30 días consecutivos de login",
    icon: "💎",
    xp: 500,
    condition: (s) => s.loginStreak >= 30
  },
  {
    id: "streak_60",
    name: "Elite Dedicado",
    desc: "60 días consecutivos de login",
    icon: "🔥",
    xp: 1500,
    condition: (s) => s.loginStreak >= 60
  },
  {
    id: "streak_100",
    name: "Leyenda",
    desc: "100 días consecutivos de login",
    icon: "👑",
    xp: 5000,
    condition: (s) => s.loginStreak >= 100
  },
  {
    id: "popular",
    name: "Popular",
    desc: "Recibe 10 likes en posts",
    icon: "❤️",
    xp: 50,
    condition: (s) => s.likesReceived >= 10
  },
  {
    id: "celebrity",
    name: "Celebridad",
    desc: "Recibe 100 likes en posts",
    icon: "🏆",
    xp: 250,
    condition: (s) => s.likesReceived >= 100
  },
  {
    id: "referrer_1",
    name: "Referidor",
    desc: "Referencia a 1 usuario",
    icon: "🤝",
    xp: 50,
    condition: (s) => s.referralsCount >= 1
  },
  {
    id: "referrer_5",
    name: "Embajador Junior",
    desc: "Referencia a 5 usuarios",
    icon: "🎖️",
    xp: 200,
    condition: (s) => s.referralsCount >= 5
  },
  {
    id: "referrer_10",
    name: "Embajador",
    desc: "Referencia a 10 usuarios",
    icon: "👑",
    xp: 500,
    condition: (s) => s.referralsCount >= 10
  },
  {
    id: "xp_1000",
    name: "Mil Puntos",
    desc: "Alcanza 1000 XP",
    icon: "💯",
    xp: 0,
    condition: (s) => s.totalXP >= 1000
  },
  {
    id: "xp_5000",
    name: "Trader Expert",
    desc: "Alcanza 5000 XP",
    icon: "📈",
    xp: 0,
    condition: (s) => s.totalXP >= 5000
  },
  {
    id: "xp_15000",
    name: "Elite Trader",
    desc: "Alcanza 15000 XP",
    icon: "🚀",
    xp: 0,
    condition: (s) => s.totalXP >= 15000
  },
  {
    id: "xp_30000",
    name: "Legend",
    desc: "Alcanza 30000 XP",
    icon: "👑",
    xp: 0,
    condition: (s) => s.totalXP >= 30000
  },
  {
    id: "social_butterfly",
    name: "Mariposa Social",
    desc: "Deja 20 comentarios",
    icon: "💬",
    xp: 75,
    condition: (s) => s.commentsCount >= 20
  }
];

export const XP_VALUES = {
  DAILY_LOGIN: 10,
  CREATE_POST: 25,
  POST_LIKED: 2,
  COMMENT: 5,
  REFERRAL: 100,
  STREAK_7: 100,
  STREAK_30: 500,
  STREAK_60: 1500,
  STREAK_100: 5000,
};

export const LEVELS = [
  { level: 1, name: "Newbie", minXP: 0 },
  { level: 10, name: "Trader", minXP: 500 },
  { level: 20, name: "Expert", minXP: 1500 },
  { level: 35, name: "Master", minXP: 5000 },
  { level: 50, name: "Elite", minXP: 15000 },
  { level: 75, name: "Legend", minXP: 30000 }
];

export function getLevelFromXP(xp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const xpForCurrentLevel = xp - currentLevel.minXP;
  const xpNeeded = nextLevel.minXP - currentLevel.minXP;
  const progress = nextLevel.minXP === currentLevel.minXP ? 100 : Math.floor((xpForCurrentLevel / xpNeeded) * 100);

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    xpForCurrentLevel,
    xpNeeded,
    progress,
    nextLevel: nextLevel.name
  };
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
