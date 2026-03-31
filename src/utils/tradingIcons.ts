export const TRADING_ICONS = {
  // Core Trading
  chart: 'candlestick_chart',
  trendingUp: 'trending_up',
  trendingDown: 'trending_down',
  lineChart: 'show_chart',
  barChart: 'bar_chart',
  pieChart: 'pie_chart',
  
  // Markets & Assets
  crypto: 'currency_bitcoin',
  forex: 'currency_exchange',
  stocks: 'stacked_line_chart',
  commodities: 'inventory_2',
  
  // Trading Actions
  buy: 'shopping_cart',
  sell: 'sell',
  exchange: 'swap_horiz',
  wallet: 'account_balance_wallet',
  savings: 'savings',
  
  // Analysis
  analysis: 'analytics',
  insights: 'insights',
  research: 'biotech',
  patterns: 'pattern',
  
  // Community & Social
  community: 'groups',
  members: 'group',
  leaderboard: 'emoji_events',
  rank: 'military_tech',
  
  // Education
  school: 'school',
  course: 'menu_book',
  psychology: 'psychology',
  coach: 'support_agent',
  
  // Signals & Alerts
  signal: 'signal_cellular_alt',
  alert: 'notifications_active',
  bell: 'notifications',
  
  // Tools & Tech
  robot: 'smart_toy',
  expertAdvisor: 'precision_manufacturing',
  calculator: 'calculate',
  calendar: 'event',
  
  // Business & Money
  business: 'storefront',
  money: 'payments',
  premium: 'workspace_premium',
  crown: 'military_tech',
  verified: 'verified',
  
  // Status
  live: 'sensors',
  online: 'wifi',
  pending: 'hourglass_empty',
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  
  // Navigation
  home: 'home',
  explore: 'explore',
  search: 'search',
  settings: 'settings',
  menu: 'apps',
  close: 'close',
  back: 'chevron_left',
  forward: 'chevron_right',
  up: 'expand_less',
  down: 'expand_more',
  
  // Actions
  add: 'add',
  edit: 'edit',
  paint: 'brush',
  share: 'share',
  copy: 'content_copy',
  download: 'download',
  upload: 'upload',
  refresh: 'refresh',
  filter: 'filter_list',
  sort: 'swap_vert',
  
  // User
  person: 'person',
  profile: 'badge',
  login: 'login',
  logout: 'logout',
  register: 'person_add',
  
  // Admin
  admin: 'admin_panel_settings',
  manage: 'tune',
  security: 'security',
  reports: 'assessment',
  
  // Gaming
  games: 'sports_esports',
  play: 'play_arrow',
  trophy: 'emoji_events',
  
  // Marketing
  marketing: 'campaign',
  content: 'edit_note',
  video: 'videocam',
  voice: 'mic',
  image: 'image',
  
  // Prop Firms
  capital: 'account_balance',
  funding: 'paid',
  profit: 'trending_up',
  loss: 'trending_down',
  
  // Misc
  star: 'star',
  favorite: 'favorite',
  bookmark: 'bookmark',
  help: 'help',
  info: 'info',
  link: 'link',
  external: 'open_in_new',
};

export type TradingIconKey = keyof typeof TRADING_ICONS;

export const getIcon = (key: TradingIconKey): string => {
  return TRADING_ICONS[key] || 'help';
};

export const NAV_ICONS = {
  comunidad: 'groups',
  discover: 'explore',
  leaderboard: 'emoji_events',
  grafico: 'candlestick_chart',
  signals: 'trending_up',
  'expert-advisors': 'smart_toy',
  propfirms: 'account_balance',
  exness: 'account_balance_wallet',
  bitacora: 'menu_book',
  academia: 'school',
  psicotrading: 'psychology',
  marketplace: 'shopping_cart',
  referidos: 'group_add',
  creator: 'storefront',
  pricing: 'workspace_premium',
  juegos: 'sports_esports',
  marketing: 'campaign',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Análisis': 'analytics',
  'Señales': 'trending_up',
  'Estrategias': 'psychology',
  'Educación': 'school',
  'Herramientas': 'build',
  '讨论': 'chat',
  'Novedades': 'new_releases',
  'Soporte': 'support_agent',
  'Ayuda': 'help',
  'General': 'forum',
  'Indicadores': 'show_chart',
  'Psicología': 'psychology',
  'Gestión': 'pie_chart',
  'Sistemas': 'settings',
  'Brokers': 'account_balance',
};

export const TIER_ICONS: Record<string, string> = {
  free: 'star',
  bronze: 'workspace_premium',
  silver: 'workspace_premium',
  gold: 'workspace_premium',
  platinum: 'workspace_premium',
  vip: 'military_tech',
  elite: 'shield',
  creator: 'storefront',
  pro: 'verified',
};

export const getCategoryIcon = (category: string): string => {
  return CATEGORY_ICONS[category] || 'forum';
};
