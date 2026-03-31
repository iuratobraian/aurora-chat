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
