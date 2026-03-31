export interface PromotionalAd {
  id: string;
  sector: 'feed' | 'sidebar';
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  link: string;
  cta: string;
  theme: 'blue' | 'purple' | 'emerald' | 'orange' | 'red' | 'yellow';
  badge?: string;
  originalPrice?: string;
  currentPrice?: string;
}

export const PROMOTIONAL_ADS: PromotionalAd[] = [
  {
    id: 'courses-master',
    sector: 'feed',
    title: 'Masterclass Trading',
    subtitle: '🎓 Oficial',
    description: 'Metodología Institucional para operar en cualquier mercado. Aprende de profesionales.',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
    link: 'https://portalib.vercel.app/cursos',
    cta: 'Inscribirme Ahora',
    theme: 'blue',
    badge: 'OFERTA',
    originalPrice: '$299',
    currentPrice: '$149'
  },
  {
    id: 'bot-vip',
    sector: 'feed',
    title: 'Bot Institucional VIP',
    subtitle: '🤖 Auto Trading',
    description: 'Algoritmos de alta precisión. Automatiza tus operativas y maximiza ganancias.',
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
    link: 'https://portalib.vercel.app/bot',
    cta: 'Obtener Licencia',
    theme: 'purple',
    badge: 'MÁS POPULAR'
  },
  {
    id: 'certification',
    sector: 'sidebar',
    title: 'Certificación Trader',
    subtitle: '🏆 Diploma Oficial',
    description: 'Obtén tu diploma certificando tus conocimientos. Reconocimiento internacional.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
    link: 'https://portalib.vercel.app/certificacion',
    cta: 'Certificarme',
    theme: 'emerald',
    badge: 'NUEVO'
  },
  {
    id: 'leaderboard',
    sector: 'sidebar',
    title: 'Top Traders',
    subtitle: '📊 Ranking Semanal',
    description: 'Compite con los mejores. Gana premios y reconocimiento. Únete al podium.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    link: 'https://tradeportal.vercel.app/leaderboard',
    cta: 'Ver Rankings',
    theme: 'orange'
  },
  {
    id: 'copy-trading',
    sector: 'feed',
    title: 'Copy Trading Pro',
    subtitle: '📈 Señales en Vivo',
    description: 'Copia las operaciones de traders exitosos en tiempo real. Sin experiencia necesaria.',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
    link: 'https://portalib.vercel.app/copy-trading',
    cta: 'Comenzar',
    theme: 'blue'
  },
  {
    id: 'rewards',
    sector: 'sidebar',
    title: 'Sistema de Recompensas',
    subtitle: '🎁 XP & Badges',
    description: 'Gana experiencia, desbloquea badges exclusivos y sube de nivel. Premiamos tu actividad.',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600',
    link: 'https://tradeportal.vercel.app/recompensas',
    cta: 'Ver Beneficios',
    theme: 'emerald'
  }
];

export const THEME_STYLES = {
  blue: {
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/50',
    badge: 'bg-blue-500/20 text-blue-300',
    accent: '#3b82f6'
  },
  purple: {
    gradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    glow: 'shadow-purple-500/50',
    badge: 'bg-purple-500/20 text-purple-300',
    accent: '#a855f7'
  },
  emerald: {
    gradient: 'from-emerald-600 via-teal-500 to-green-400',
    glow: 'shadow-emerald-500/50',
    badge: 'bg-emerald-500/20 text-emerald-300',
    accent: '#10b981'
  },
  orange: {
    gradient: 'from-orange-600 via-amber-500 to-yellow-400',
    glow: 'shadow-orange-500/50',
    badge: 'bg-orange-500/20 text-orange-300',
    accent: '#f97316'
  },
  red: {
    gradient: 'from-red-600 via-rose-500 to-pink-400',
    glow: 'shadow-red-500/50',
    badge: 'bg-red-500/20 text-red-300',
    accent: '#ef4444'
  },
  yellow: {
    gradient: 'from-yellow-600 via-amber-500 to-orange-400',
    glow: 'shadow-yellow-500/50',
    badge: 'bg-yellow-500/20 text-yellow-300',
    accent: '#eab308'
  }
};
