export type Plan = 'free' | 'pro' | 'elite';

export interface FeatureConfig {
  name: string;
  plans: Plan[];
  description: string;
}

const FEATURES: Record<string, FeatureConfig> = {
  signals_feed: {
    name: 'signals_feed',
    plans: ['pro', 'elite'],
    description: 'Acceso al feed de señales de trading'
  },
  private_communities: {
    name: 'private_communities',
    plans: ['pro', 'elite'],
    description: 'Crear comunidades privadas'
  },
  mentoring_1v1: {
    name: 'mentoring_1v1',
    plans: ['elite'],
    description: 'Mentoría 1:1 con expertos'
  },
  api_access: {
    name: 'api_access',
    plans: ['elite'],
    description: 'Acceso a la API del platform'
  },
  advanced_analytics: {
    name: 'advanced_analytics',
    plans: ['pro', 'elite'],
    description: 'Analíticas avanzadas'
  },
  priority_support: {
    name: 'priority_support',
    plans: ['pro', 'elite'],
    description: 'Soporte prioritario'
  },
  ai_pattern_scanner: {
    name: 'ai_pattern_scanner',
    plans: ['elite'],
    description: 'Escáner de patrones IA'
  },
  real_time_data: {
    name: 'real_time_data',
    plans: ['pro', 'elite'],
    description: 'Datos de mercado en tiempo real'
  }
};

export const PLAN_LIMITS: Record<Plan, {
  maxCommunities: number;
  maxPostsPerDay: number;
  maxStorage: number;
}> = {
  free: {
    maxCommunities: 1,
    maxPostsPerDay: 10,
    maxStorage: 50 * 1024 * 1024
  },
  pro: {
    maxCommunities: 5,
    maxPostsPerDay: 100,
    maxStorage: 500 * 1024 * 1024
  },
  elite: {
    maxCommunities: -1,
    maxPostsPerDay: -1,
    maxStorage: -1
  }
};

export function getMaxPrivateCommunities(plan: Plan): number {
  return plan === 'elite' ? -1 : PLAN_LIMITS[plan].maxCommunities;
}

export function isFeatureEnabled(feature: string, plan: Plan): boolean {
  const config = FEATURES[feature];
  if (!config) return false;
  return config.plans.includes(plan);
}

export function getPlanFeatures(plan: Plan): string[] {
  return Object.values(FEATURES)
    .filter(f => f.plans.includes(plan))
    .map(f => f.name);
}

export function canAccessFeature(feature: string, plan: Plan): boolean {
  return isFeatureEnabled(feature, plan);
}

export { FEATURES };
