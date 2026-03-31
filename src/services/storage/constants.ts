import { BadgeType, Usuario } from '../../types';

export const SUBSCRIPTION_PLANS = {
  free: { 
    name: 'Gratis', 
    price: 0,
    features: ['Acceso básico', 'Feed público', '3 posts/día']
  },
  basic: { 
    name: 'Básico', 
    price: 9.99,
    features: ['Todo lo de Gratis', 'Acceso a herramientas', 'Posts ilimitados', 'Análisis básicos']
  },
  pro: { 
    name: 'PRO', 
    price: 29.99,
    features: ['Todo lo de Básico', 'Análisis avanzados', 'Alertas en tiempo real', 'Comunidad VIP']
  },
  vip: { 
    name: 'VIP', 
    price: 99.99,
    features: ['Todo lo de PRO', 'Acceso exclusivo', 'Consultorías 1:1', 'Contenido premium']
  },
} as const;

export const COURSE_PRICES = {
  'masterclass-trading': 149,
  'bot-institucional': 299,
} as const;

export const COURSE_DETAILS = {
  'masterclass-trading': {
    name: 'Masterclass de Trading',
    price: 149,
    currency: 'USD',
    description: 'Aprende estrategias de trading profesionales',
    duration: '12 horas',
    modules: 8,
  },
  'bot-institucional': {
    name: 'Bot Institucional',
    price: 299,
    currency: 'USD',
    description: 'Construye tu propio bot de trading automatizado',
    duration: '20 horas',
    modules: 15,
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
export type CourseType = keyof typeof COURSE_PRICES;

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;
export const SYNC_QUEUE_KEY = 'pending_sync_queue';
export const BACKUP_PREFIX = 'local_backup_';

export const calculateReputation = (user: Usuario): Usuario => {
    let score = 50;
    score += (user.aportes || 0) * 5;
    score += (user.accuracy || 50) - 50;
    
    const existingBadges = user.badges || [];
    const newBadges = new Set<BadgeType>(existingBadges);
    
    if (user.rol === 'admin' || user.rol === 'ceo' || user.esVerificado) {
        newBadges.add('Verified');
    }
    
    if (user.accuracy > 80) newBadges.add('TopAnalyst');
    if (user.saldo > 5000) newBadges.add('Whale');
    if (user.reputation > 80) newBadges.add('Influencer');

    return { ...user, reputation: Math.min(100, Math.max(0, score)), badges: Array.from(newBadges) };
};
