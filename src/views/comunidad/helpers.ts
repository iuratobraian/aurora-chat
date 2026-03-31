import React from 'react';
import { Ad, AdSector } from '../../types';

export const DEFAULT_AVATAR_URL = (seed: string) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export const buildAdPost = (ad: Ad): Partial<any> => ({
    id: `ad-${ad.id || (ad as any)._id}`,
    idUsuario: 'system',
    nombreUsuario: 'Patrocinado',
    usuarioManejo: 'sponsor',
    avatarUsuario: 'https://api.dicebear.com/7.x/bottts/svg?seed=sponsor',
    titulo: ad.titulo,
    contenido: `${ad.descripcion}\n\n[Ver más](${ad.link})`,
    categoria: 'Recurso',
    tiempo: 'Patrocinado',
    likes: [],
    comentarios: [],
    esAnuncio: true,
    adData: ad,
    tradingViewUrl: ad.imagenUrl,
    tags: ['Patrocinado'],
});

const generateOrganicPositions = (totalPosts: number, maxAds: number): number[] => {
    if (totalPosts < 8 || maxAds === 0) return [];
    
    const positions: number[] = [];
    const spacing = Math.floor(totalPosts / (maxAds + 1));
    
    let currentPos = spacing;
    for (let i = 0; i < maxAds && currentPos < totalPosts - 2; i++) {
        const variation = Math.floor(Math.random() * 3) - 1;
        const pos = Math.max(3, Math.min(currentPos + variation, totalPosts - 3));
        
        if (!positions.includes(pos) && !positions.includes(pos - 1) && !positions.includes(pos + 1)) {
            positions.push(pos);
        }
        
        currentPos += spacing + Math.floor(Math.random() * 4) - 2;
    }
    
    return positions.sort((a, b) => a - b);
};

export const injectAds = (posts: any[], ads: Ad[]): any[] => {
    if (!ads || ads.length === 0 || !posts || posts.length < 3) return posts;
    
    const feedAds = ads.filter(a => a.activo && (a.sector === 'feed' || a.sector === 'dashboard'));
    if (feedAds.length === 0) return posts;
    
    const result = [...posts];
    const adPositions = generateOrganicPositions(posts.length, Math.min(3, feedAds.length));
    
    adPositions.forEach((pos, index) => {
        const ad = feedAds[index % feedAds.length];
        const adPost = buildAdPost(ad) as any;
        result.splice(pos, 0, adPost);
    });
    
    return result;
};

export const injectStadiumAds = (posts: any[], ads: Ad[], maxAds: number = 3): any[] => {
    if (!ads || ads.length === 0 || !posts) return posts;
    const stadiumAds = ads.filter(a => a.activo && (a.sector === 'banner' || a.sector === 'noticias'));
    if (stadiumAds.length === 0) return posts;
    
    // Inyectar en posiciones clave
    const result = [...posts];
    const positions = [1, 5, 10].filter(p => p < posts.length);
    
    positions.forEach((pos, index) => {
        const ad = stadiumAds[index % stadiumAds.length];
        result.splice(pos, 0, { ...buildAdPost(ad), variant: 'stadium' });
    });
    
    return result;
};

export const FILTER_CATEGORIES: { label: string; icon: string }[] = [
    { label: 'General', icon: 'apps' },
    { label: 'Analisis', icon: 'bar_chart' },
    { label: 'Idea', icon: 'lightbulb' },
    { label: 'Estrategia', icon: 'trending_up' },
    { label: 'Psicología', icon: 'psychology' },
    { label: 'Noticia', icon: 'newspaper' },
    { label: 'Recurso', icon: 'folder' },
    { label: 'Ayuda', icon: 'help' },
    { label: 'Comunidad', icon: 'group' },
];

export const TAG_FILTERS = ['BTC', 'Crypto', 'Forex', 'Gold', 'Nasdaq', 'Scalping'];

export const DEFAULT_COURSES_AD: Ad = {
    id: 'default-courses',
    titulo: 'Masterclass Trading',
    descripcion: 'Metodología Institucional.',
    imagenUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070',
    link: '#',
    sector: 'cursos' as AdSector,
    activo: true
};

export const DEFAULT_BOT_AD: Ad = {
    id: 'default-bot',
    titulo: 'Auto Trading Bot',
    descripcion: 'Bot de Alta Frecuencia.',
    imagenUrl: '',
    link: '#',
    sector: 'noticias' as AdSector,
    activo: true
};
