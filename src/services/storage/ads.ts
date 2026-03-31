import { Ad } from '../../types';
import { PROMOTIONAL_ADS, PromotionalAd } from '../../../data/promotionalAds';
import { api } from "../../../convex/_generated/api";
import logger from '../../../lib/utils/logger';
import { convex } from './sync';
import { getLocalItem, setLocalItem } from './helpers';

export const getAds = async (): Promise<Ad[]> => {
    try {
        if (convex) {
            const data = await convex.query(api.ads.getAds);
            if (data && data.length > 0) {
                const mapped = data.map((ad: any) => ({ ...ad, id: ad._id }));
                setLocalItem('local_ads_db', mapped);
                return mapped;
            }
        }
    } catch (err) {
        logger.error("Convex Get Ads Error:", err);
    }
    
    const local = getLocalItem<Ad[]>('local_ads_db', []);
    if (local.length > 0) return local;

    try {
        const { STATIC_ADS } = await import('../../data/staticData');
        return STATIC_ADS as Ad[];
    } catch {
        return [];
    }
};

export const saveAd = async (ad: Ad): Promise<void> => {
    const ads = getLocalItem<Ad[]>('local_ads_db', []);
    const index = ads.findIndex(a => a.id === ad.id);
    if (index !== -1) { ads[index] = ad; } else { ads.push(ad); }
    setLocalItem('local_ads_db', ads);

    try {
        if (convex) {
            const isConvexId = ad.id && ad.id.length > 10 && !ad.id.includes('-') && !ad.id.startsWith('ad-') && !ad.id.startsWith('default-');
            const convexId = isConvexId ? ad.id : undefined;

            logger.info("Syncing Ad to Convex:", {
                id: ad.id,
                isConvexId,
                convexId,
                titulo: ad.titulo,
                sector: ad.sector
            });

            const result = await convex.mutation(api.ads.saveAd, {
                ...(convexId ? { id: convexId } : {}),
                titulo: ad.titulo || 'Sin título',
                descripcion: ad.descripcion || '',
                imagenUrl: ad.imagenUrl || '',
                link: ad.link || '',
                sector: ad.sector || 'sidebar',
                activo: ad.activo ?? true,
                subtitle: ad.subtitle,
                extra: ad.extra
            });

            if (!convexId && result) {
                const currentAds = getLocalItem<Ad[]>('local_ads_db', []);
                const idx = currentAds.findIndex(a => a.id === ad.id);
                if (idx !== -1) {
                    currentAds[idx].id = result as string;
                    setLocalItem('local_ads_db', currentAds);
                }
            }
        }
    } catch (err) {
        logger.error("Convex Save Ad Error:", err);
        throw err;
    }
};

export const deleteAd = async (id: string): Promise<void> => {
    const ads = getLocalItem<Ad[]>('local_ads_db', []);
    setLocalItem('local_ads_db', ads.filter(a => a.id !== id));
    try {
        if (convex && id && id.length > 10 && !id.startsWith('ad-') && !id.startsWith('default-') && !id.includes('-')) {
            await convex.mutation(api.ads.deleteAd, { id });
        }
    } catch (err) {
        logger.error("Convex Delete Ad Error:", err);
    }
};

export const updateAd = async (ad: Ad): Promise<void> => {
    await saveAd(ad);
};

export const getPromotionalAds = (): PromotionalAd[] => {
    return PROMOTIONAL_ADS;
};

export const getPromotionalAdsBySector = (sector: 'feed' | 'sidebar'): PromotionalAd[] => {
    return PROMOTIONAL_ADS.filter(ad => ad.sector === sector);
};

export const convertPromoAdToAd = (promoAd: PromotionalAd): Partial<Ad> => {
    return {
        titulo: promoAd.title,
        descripcion: promoAd.description,
        imagenUrl: promoAd.imageUrl,
        link: promoAd.link,
        sector: promoAd.sector,
        activo: true,
        subtitle: promoAd.subtitle,
        extra: promoAd.badge ? `${promoAd.badge}${promoAd.currentPrice ? `|${promoAd.currentPrice}` : ''}` : undefined,
    };
};
