import { Ad, Herramienta, Curso } from '../types';

export const STATIC_ADS: Ad[] = [
    // Sidebar ads
    { 
        id: 'ad-courses', 
        titulo: 'Masterclass Trading', 
        descripcion: 'Metodología Institucional. 0 a 100.', 
        imagenUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'sidebar', 
        activo: true 
    },
    { 
        id: 'ad-bot', 
        titulo: 'Auto Trading Bot', 
        descripcion: 'Bot de Alta Frecuencia.', 
        imagenUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/bot', 
        sector: 'sidebar', 
        activo: true 
    },
    { 
        id: 'ad-certification', 
        titulo: 'Certificación Trader', 
        descripcion: 'Obtén tu diploma certificando conocimientos.', 
        imagenUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/certificacion', 
        sector: 'sidebar', 
        activo: true 
    },
    { 
        id: 'ad-rewards', 
        titulo: 'Sistema de Recompensas', 
        descripcion: 'Gana XP, desbloquea badges y sube de nivel.', 
        imagenUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80', 
        link: 'https://tradeportal.vercel.app/recompensas', 
        sector: 'sidebar', 
        activo: true 
    },
    // Cursos ads
    { 
        id: 'ad-curso-forex', 
        titulo: 'Forex 101: Fundamentos', 
        descripcion: 'Aprende desde cero. Mercado de divisas y gestión de riesgo.', 
        imagenUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'cursos', 
        activo: true 
    },
    { 
        id: 'ad-curso-smc', 
        titulo: 'Smart Money Concepts', 
        descripcion: 'Análisis institucional y liquidez. Nivel intermedio.', 
        imagenUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'cursos', 
        activo: true 
    },
    { 
        id: 'ad-curso-vip', 
        titulo: 'Trading Institucional VIP', 
        descripcion: 'Estrategias de alta probabilidad. Clase magistral.', 
        imagenUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'cursos', 
        activo: true 
    },
    // Noticias ads
    { 
        id: 'ad-bot-vip', 
        titulo: 'Bot Institucional VIP', 
        descripcion: 'Algoritmos de alta precisión. Automatiza tus operativas.', 
        imagenUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/bot', 
        sector: 'noticias', 
        activo: true 
    },
    { 
        id: 'ad-copytrading', 
        titulo: 'Copy Trading Pro', 
        descripcion: 'Copia operaciones de traders exitosos en tiempo real.', 
        imagenUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/copy-trading', 
        sector: 'noticias', 
        activo: true 
    },
    // Feed ads
    { 
        id: 'ad-feed-masterclass', 
        titulo: 'Masterclass Trading', 
        descripcion: 'Metodología Institucional para operar en cualquier mercado.', 
        imagenUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'feed', 
        activo: true 
    },
    { 
        id: 'ad-feed-bot', 
        titulo: 'Bot Institucional VIP', 
        descripcion: 'Algoritmos de alta precisión. Automatiza y maximiza.', 
        imagenUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/bot', 
        sector: 'feed', 
        activo: true 
    },
    // Dashboard ads
    { 
        id: 'ad-dashboard-copy', 
        titulo: 'Copy Trading Pro', 
        descripcion: 'Sin experiencia necesaria. Copia y gana.', 
        imagenUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/copy-trading', 
        sector: 'dashboard', 
        activo: true 
    },
    { 
        id: 'ad-dashboard-rewards', 
        titulo: 'Sistema de Recompensas', 
        descripcion: 'Gana experiencia y sube de nivel con cada aporte.', 
        imagenUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80', 
        link: 'https://tradeportal.vercel.app/recompensas', 
        sector: 'dashboard', 
        activo: true 
    },
    // Banner ads
    { 
        id: 'ad-banner-cursos', 
        titulo: 'Oferta Masterclass', 
        descripcion: 'De $299 a $149. Aprende trading institucional.', 
        imagenUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'banner', 
        activo: true 
    },
    // Post ads
    { 
        id: 'ad-post-bot', 
        titulo: 'Auto Trading Bot', 
        descripcion: 'Automatiza tu operativa con algoritmos verificados.', 
        imagenUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/bot', 
        sector: 'post', 
        activo: true 
    },
    { 
        id: 'ad-post-copy', 
        titulo: 'Copy Trading', 
        descripcion: 'Los mejores traders a tu disposición.', 
        imagenUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/copy-trading', 
        sector: 'post', 
        activo: true 
    },
    // Bitacora ads
    { 
        id: 'ad-bitacora-forex', 
        titulo: 'Forex 101', 
        descripcion: 'Todo lo que necesitas saber para empezar.', 
        imagenUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'bitacora', 
        activo: true 
    },
    { 
        id: 'ad-bitacora-smc', 
        titulo: 'Smart Money', 
        descripcion: 'Domina el mercado con análisis institucional.', 
        imagenUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 
        link: 'https://portalib.vercel.app/cursos', 
        sector: 'bitacora', 
        activo: true 
    },
];

export const STATIC_HERRAMIENTAS: Herramienta[] = [
    { id: 'h1', nombre: 'TradingView', categoria: 'Plataforma', descripcion: 'Graficación Profesional.', logo: '', link: 'https://tradingview.com', color: '#2962ff', beneficio: 'Gratis', tag: 'PARTNER', icon: 'candlestick_chart', activo: true },
    { id: 'h2', nombre: 'MetaTrader 4', categoria: 'Terminal', descripcion: 'Terminal de Operaciones.', logo: '', link: 'https://mt4.com', color: '#10b981', beneficio: 'Estándar', tag: 'RECOMENDADO', icon: 'account_balance', activo: true }
];

export const STATIC_CURSOS: Curso[] = [
    { id: 'c1', titulo: 'Forex 101: Fundamentos', nivel: 'Principiante', duracion: '12h', lecciones: 24, descripcion: 'Mercado de divisas y gestión de riesgo.', emoji: '📈', color: '#3b82f6', videoUrl: '#' },
    { id: 'c2', titulo: 'Smart Money Concepts', nivel: 'Intermedio', duracion: '20h', lecciones: 40, descripcion: 'Análisis institucional y liquidez.', emoji: '🎯', color: '#8b5cf6', videoUrl: '#' }
];
