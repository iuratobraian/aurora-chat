export interface FeedbackSubmission {
  userId: string;
  rating: number;
  category: FeedbackCategory;
  comments?: string;
  featuresUsed: string[];
  wouldRecommend: boolean;
  timestamp: number;
}

export type FeedbackCategory = 
  | 'general'
  | 'ux'
  | 'performance'
  | 'features'
  | 'support'
  | 'community';

export interface FeedbackConfig {
  daysSinceRegistration: number;
  minPostsCreated: number;
  minCommentsMade: number;
  minCommunitiesJoined: number;
}

export const DEFAULT_FEEDBACK_CONFIG: FeedbackConfig = {
  daysSinceRegistration: 7,
  minPostsCreated: 1,
  minCommentsMade: 3,
  minCommunitiesJoined: 1,
};

export function shouldShowFeedback(
  userStats: {
    daysSinceRegistration: number;
    postsCreated: number;
    commentsMade: number;
    communitiesJoined: number;
  },
  config: FeedbackConfig = DEFAULT_FEEDBACK_CONFIG,
  lastFeedbackShown?: number
): boolean {
  if (lastFeedbackShown) {
    const daysSinceLastFeedback = (Date.now() - lastFeedbackShown) / (1000 * 60 * 60 * 24);
    if (daysSinceLastFeedback < 30) return false;
  }

  const { daysSinceRegistration, postsCreated, commentsMade, communitiesJoined } = userStats;

  return (
    daysSinceRegistration >= config.daysSinceRegistration &&
    postsCreated >= config.minPostsCreated &&
    commentsMade >= config.minCommentsMade &&
    communitiesJoined >= config.minCommunitiesJoined
  );
}

export async function submitFeedback(
  submission: FeedbackSubmission,
  storage: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = `feedback_${submission.userId}_${Date.now()}`;
    await storage.setItem(key, JSON.stringify({
      ...submission,
      submittedAt: Date.now(),
    }));

    const userFeedbackCount = await storage.getItem(`feedback_count_${submission.userId}`) || '0';
    await storage.setItem(
      `feedback_count_${submission.userId}`,
      String(parseInt(userFeedbackCount, 10) + 1)
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFeedbackStats(
  userId: string,
  storage: any
): Promise<{
  totalFeedback: number;
  lastFeedbackAt?: number;
  averageRating?: number;
}> {
  try {
    const countKey = `feedback_count_${userId}`;
    const count = await storage.getItem(countKey) || '0';
    const lastKey = `feedback_last_${userId}`;
    const lastFeedbackAt = await storage.getItem(lastKey);
    const avgKey = `feedback_avg_${userId}`;
    const averageRating = await storage.getItem(avgKey);

    return {
      totalFeedback: parseInt(count, 10),
      lastFeedbackAt: lastFeedbackAt ? parseInt(lastFeedbackAt, 10) : undefined,
      averageRating: averageRating ? parseFloat(averageRating) : undefined,
    };
  } catch {
    return { totalFeedback: 0 };
  }
}

export async function setFeedbackShown(
  userId: string,
  storage: any
): Promise<void> {
  await storage.setItem(`feedback_last_${userId}`, Date.now().toString());
}

export function getFeedbackQuestions(): {
  id: string;
  question: string;
  type: 'rating' | 'select' | 'text';
  options?: string[];
  required: boolean;
}[] {
  return [
    {
      id: 'overall',
      question: '¿Cómo calificarías tu experiencia general en TradeHub?',
      type: 'rating',
      required: true,
    },
    {
      id: 'ease',
      question: '¿Qué tan fácil fue navegar y usar la plataforma?',
      type: 'select',
      options: ['Muy difícil', 'Difícil', 'Neutral', 'Fácil', 'Muy fácil'],
      required: true,
    },
    {
      id: 'features',
      question: '¿Qué funciones usaste más?',
      type: 'select',
      options: [
        'Feed de publicaciones',
        'Comunidades',
        'Chat en vivo',
        'Trading signals',
        'Perfil de traders',
        'Leaderboard',
        'TV en vivo',
        'Marketplace'
      ],
      required: false,
    },
    {
      id: 'missing',
      question: '¿Qué funciones extrañarías si no estuvieran?',
      type: 'text',
      required: false,
    },
    {
      id: 'recommend',
      question: '¿Recomendarías TradeHub a otros traders?',
      type: 'select',
      options: ['Definitivamente sí', 'Probablemente sí', 'No estoy seguro', 'Probablemente no', 'Definitivamente no'],
      required: true,
    },
    {
      id: 'comments',
      question: '¿Tienes sugerencias para mejorar?',
      type: 'text',
      required: false,
    },
  ];
}
