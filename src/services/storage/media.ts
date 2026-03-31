import { EVENTOS_MOCK } from '../../constants';
import { api } from "../../../convex/_generated/api";
import logger from '../../utils/logger';
import { convex } from './sync';
import { getLocalItem, setLocalItem } from './helpers';

const NEWS_DEGRADATION_WARNING = '⚠️ Sistema de noticias en modo degradado. Configure fuentes de noticias en el panel de administración.';

export const getEventos = async () => EVENTOS_MOCK;
export const getNoticias = async () => {
    try {
        if (convex) {
            const news = await convex.query(api.market.marketNews.getRecentNews, { limit: 20 });
            if (news && news.length > 0) {
                return news.map((n: any) => ({
                    id: n._id,
                    fuente: n.source || 'Unknown',
                    tiempo: n.publishedAt ? new Date(n.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
                    titulo: n.title || '',
                    resumen: n.summary || n.content?.substring(0, 150) || '',
                    contenidoExtenso: n.content || '',
                    sentimiento: n.sentiment || 'neutral',
                    pares: n.relatedAssets || ['MERCADO'],
                    urlImagen: n.imageUrl || '',
                    url: n.url || ''
                }));
            }
            console.warn(NEWS_DEGRADATION_WARNING);
        }
    } catch (err) {
        logger.error("Convex news fetch failed:", err);
        console.warn(NEWS_DEGRADATION_WARNING);
    }
    return [];
};

export const getVideos = async (): Promise<any[]> => {
    try {
        if (convex) {
            const data = await convex.query(api.videos.getVideos);
            if (data) return data.map((v: any) => ({ ...v, id: v._id }));
        }
    } catch (err) {
        logger.error("Convex Get Videos Error:", err);
    }
    return getLocalItem<any[]>('local_videos_db', []);
};

export const saveVideo = async (video: any): Promise<void> => {
    const videos = getLocalItem<any[]>('local_videos_db', []);
    const index = videos.findIndex(v => v.id === video.id);
    if (index !== -1) { videos[index] = video; } else { videos.unshift(video); }
    setLocalItem('local_videos_db', videos);

    try {
        if (convex) {
            const convexId = video.id && video.id.length > 15 && !video.id.includes('-') ? video.id : undefined;
            await convex.mutation(api.videos.saveVideo, {
                ...(convexId ? { id: convexId } : {}),
                tipo: video.tipo,
                titulo: video.titulo,
                autor: video.autor,
                descripcion: video.descripcion,
                thumbnail: video.thumbnail,
                embedUrl: video.embedUrl,
                duracion: video.duracion,
                categoria: video.categoria
            });
        }
    } catch (err) {
        logger.error("Convex Save Video Error:", err);
    }
};

export const deleteVideo = async (id: string): Promise<void> => {
    const videos = getLocalItem<any[]>('local_videos_db', []);
    setLocalItem('local_videos_db', videos.filter(v => v.id !== id));

    try {
        if (convex && id && id.length > 15 && !id.includes('-')) {
            await convex.mutation(api.videos.deleteVideo, { id });
        }
    } catch (err) {
        logger.error("Convex Delete Video Error:", err);
    }
};
