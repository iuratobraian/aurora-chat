export const STRATEGY_CATEGORIES = [
  { id: 'ea', name: 'EAs & Robots', icon: 'smart_toy', description: 'Expert Advisors y Robots MT4/MT5', color: '#8b5cf6' },
  { id: 'scalping', name: 'Scalping', icon: 'speed', description: 'Operaciones de alta frecuencia', color: '#ef4444' },
  { id: 'swing', name: 'Swing Trading', icon: 'trending_up', description: 'Operaciones de mediano plazo', color: '#22c55e' },
  { id: 'long_term', name: 'Inversión Largo Plazo', icon: 'account_balance', description: 'Inversión a largo plazo', color: '#3b82f6' },
  { id: 'options', name: 'Opciones', icon: 'call_split', description: 'Estrategias con opciones', color: '#a855f7' },
  { id: 'crypto', name: 'Crypto', icon: 'currency_bitcoin', description: 'Criptomonedas', color: '#f59e0b' },
  { id: 'forex', name: 'Forex', icon: 'swap_horiz', description: 'Divisas y pares de monedas', color: '#06b6d4' },
  { id: 'indices', name: 'Índices', icon: 'bar_chart', description: 'Índices bursátiles', color: '#ec4899' },
  { id: 'commodities', name: 'Commodities', icon: 'inventory_2', description: 'Materias primas', color: '#84cc16' },
  { id: 'books', name: 'Libros', icon: 'menu_book', description: 'Libros y guías en PDF', color: '#f59e0b', isBook: true },
] as const;

export type StrategyCategory = typeof STRATEGY_CATEGORIES[number]['id'];

export const SORT_OPTIONS = [
  { id: 'popular', name: 'Más Populares' },
  { id: 'newest', name: 'Más Recientes' },
  { id: 'rating', name: 'Mejor Valoradas' },
  { id: 'price_asc', name: 'Precio: Menor a Mayor' },
  { id: 'price_desc', name: 'Precio: Mayor a Menor' },
] as const;

export const PRICE_FILTERS = [
  { id: 'all', name: 'Todos' },
  { id: 'free', name: 'Gratuitas', maxPrice: 0 },
  { id: 'under_10', name: 'Menos de 10', maxPrice: 10 },
  { id: 'under_50', name: 'Menos de 50', maxPrice: 50 },
  { id: 'under_100', name: 'Menos de 100', maxPrice: 100 },
  { id: 'over_100', name: 'Más de 100', minPrice: 100 },
] as const;

export const RATING_FILTERS = [
  { id: 'all', name: 'Todas', minRating: 0 },
  { id: '4_plus', name: '4+ Estrellas', minRating: 4 },
  { id: '3_plus', name: '3+ Estrellas', minRating: 3 },
] as const;

export const XP_REWARDS = {
  SALE_BONUS: 50,
  PURCHASE_BONUS: 10,
  STRATEGY_CREATED: 25,
} as const;
