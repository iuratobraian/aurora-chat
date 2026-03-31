import { api } from "../../convex/_generated/api";
import { Ad, Publicacion, Usuario, Curso, Herramienta, Recurso, LiveStatus } from '../types';
import { PROMOTIONAL_ADS, PromotionalAd } from '../../data/promotionalAds';
import { EVENTOS_MOCK } from '../constants';
<<<<<<< HEAD
=======

const NEWS_DEGRADATION_WARNING = '⚠️ Sistema de noticias en modo degradado. Configure fuentes de noticias en el panel de administración.';
>>>>>>> 07110acb043ded23499a598b89179b0713ea1f5f
import logger from '../../lib/utils/logger';
import { getConvexClient } from '../../lib/convex/client';
import { extractTags } from '../utils/postMapper';
import { AuthService } from './auth/authService';
import { UserService } from './users/userService';
import { PostService } from './posts/postService';
import { NotificationService } from './notifications/notificationService';
import { BackupManager, SyncService } from './backup/syncService';

const convex = getConvexClient();

const getLocalItem = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};

const setLocalItem = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const SUBSCRIPTION_PLANS = {
    free: { name: 'Gratis', price: 0, yearlyPrice: 0, features: ['Acceso básico', 'Feed público', '3 posts/día'] },
    basic: { name: 'Básico', price: 9.99, yearlyPrice: 95.88, features: ['Todo lo de Gratis', 'Acceso a herramientas', 'Posts ilimitados', 'Análisis básicos'] },
    pro: { name: 'PRO', price: 29.99, yearlyPrice: 287.88, features: ['Todo lo de Básico', 'Análisis avanzados', 'Alertas en tiempo real', 'Comunidad VIP'] },
    vip: { name: 'VIP', price: 99.99, yearlyPrice: 959.88, features: ['Todo lo de PRO', 'Acceso exclusivo', 'Consultorías 1:1', 'Contenido premium'] },
} as const;

export const COURSE_PRICES = { 'masterclass-trading': 149, 'bot-institucional': 299 } as const;

export const COURSE_DETAILS = {
    'masterclass-trading': { name: 'Masterclass de Trading', price: 149, currency: 'USD', description: 'Aprende estrategias de trading profesionales', duration: '12 horas', modules: 8 },
    'bot-institucional': { name: 'Bot Institucional', price: 299, currency: 'USD', description: 'Construye tu propio bot de trading automatizado', duration: '20 horas', modules: 15 },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
export type CourseType = keyof typeof COURSE_PRICES;

export const StorageService = {
    uploadFile: async (file: File): Promise<string> => {
        const cloudName = "dpm4bnral";
        const uploadPreset = "ml_default";
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
            if (response.ok) { const data = await response.json(); return data.secure_url; }
        } catch (err) { logger.warn("Cloudinary Upload Error, falling back:", err); }
        if (!convex) return URL.createObjectURL(file);
        try {
            const uploadUrl = await convex.mutation(api.files.generateUploadUrl);
            const result = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
            const { storageId } = await result.json();
            const url = await convex.query(api.files.getImageUrl, { storageId });
            return url || '';
        } catch (err) { logger.error("Convex Upload Error:", err); return URL.createObjectURL(file); }
    },

    uploadImageUrl: async (url: string): Promise<string> => url,

    getAds: async (): Promise<Ad[]> => {
        try {
            if (convex) {
                const data = await convex.query(api.ads.getAds);
                if (data && data.length > 0) { const mapped = data.map((ad: any) => ({ ...ad, id: ad._id })); setLocalItem('local_ads_db', mapped); return mapped; }
            }
        } catch (err) { logger.error("Convex Get Ads Error:", err); }
        const local = getLocalItem<Ad[]>('local_ads_db', []);
        if (local.length > 0) return local;
        try { const { STATIC_ADS } = await import('../data/staticData'); return STATIC_ADS as Ad[]; } catch { return []; }
    },

    saveAd: async (ad: Ad): Promise<void> => {
        const ads = getLocalItem<Ad[]>('local_ads_db', []);
        const index = ads.findIndex(a => a.id === ad.id);
        if (index !== -1) { ads[index] = ad; } else { ads.push(ad); }
        setLocalItem('local_ads_db', ads);
        try {
            if (convex) {
                const isConvexId = ad.id && ad.id.length > 10 && !ad.id.includes('-') && !ad.id.startsWith('ad-') && !ad.id.startsWith('default-');
                const convexId = isConvexId ? ad.id : undefined;
                const result = await convex.mutation(api.ads.saveAd, { ...(convexId ? { id: convexId } : {}), titulo: ad.titulo || 'Sin título', descripcion: ad.descripcion || '', imagenUrl: ad.imagenUrl || '', link: ad.link || '', sector: ad.sector || 'sidebar', activo: ad.activo ?? true, subtitle: ad.subtitle, extra: ad.extra });
                if (!convexId && result) { const currentAds = getLocalItem<Ad[]>('local_ads_db', []); const idx = currentAds.findIndex(a => a.id === ad.id); if (idx !== -1) { currentAds[idx].id = result as string; setLocalItem('local_ads_db', currentAds); } }
            }
        } catch (err) { logger.error("Convex Save Ad Error:", err); throw err; }
    },

    deleteAd: async (id: string): Promise<void> => {
        const ads = getLocalItem<Ad[]>('local_ads_db', []);
        setLocalItem('local_ads_db', ads.filter(a => a.id !== id));
        try { if (convex && id && id.length > 10 && !id.startsWith('ad-') && !id.startsWith('default-') && !id.includes('-')) { await convex.mutation(api.ads.deleteAd, { id }); } } catch (err) { logger.error("Convex Delete Ad Error:", err); }
    },

    updateAd: async (ad: Ad): Promise<void> => { await StorageService.saveAd(ad); },

    getCurrentSession: () => AuthService.getCurrentSession(),
    login: (identifier: string, password: string) => AuthService.login(identifier, password),
    register: (datos: any) => AuthService.register(datos, AuthService.getPendingReferralCode()),
    logout: () => AuthService.logout(),
    handleGoogleSignIn: (credentialRes: any) => AuthService.handleGoogleSignIn(credentialRes),
    sendPasswordResetEmail: (email: string) => AuthService.sendPasswordResetEmail(email),
    resetPassword: (email: string, newPass: string) => AuthService.resetPassword(email, newPass),
    captureReferralFromUrl: () => AuthService.captureReferralFromUrl(),
    getPendingReferralCode: () => AuthService.getPendingReferralCode(),
    setPendingReferralCode: (code: string | null) => AuthService.setPendingReferralCode(code),
    clearPendingReferralCode: () => AuthService.clearPendingReferralCode(),
    recordLogin: (userId: string) => AuthService.recordLogin(userId),

    getAllUsers: () => UserService.getAllUsers(),
    getUserById: (id: string) => UserService.getUserById(id),
    updateUser: (usuario: Usuario) => UserService.updateUser(usuario),
    deleteUser: (id: string) => UserService.deleteUser(id),
    blockUser: (userId: string, isBlocked: boolean, ipToBlock?: string) => UserService.blockUser(userId, isBlocked, ipToBlock),
    toggleFollowUser: (myId: string, targetId: string) => UserService.toggleFollowUser(myId, targetId),
    getTopTraders: (filter?: 'likes' | 'posts' | 'comments') => UserService.getTopTraders(filter),
    mergeUsers: (primaryId: string, secondaryId: string) => UserService.mergeUsers(primaryId, secondaryId),
    seedAdmin: () => UserService.seedAdmin(),
    clearLocalUsersCache: () => UserService.clearLocalUsersCache(),

    getPosts: () => PostService.getPosts(),
    createPost: (postPartial: Partial<Publicacion>, userId: string): Promise<{ error: string | null; post?: Publicacion }> => PostService.createPost(postPartial, userId),
    updatePost: (post: Publicacion) => PostService.updatePost(post),
    deletePost: (id: string) => PostService.deletePost(id),
    getTrashPosts: () => PostService.getTrashPosts(),
    restorePost: (id: string, userId: string) => PostService.restorePost(id, userId),
    permanentDeletePost: (id: string, userId: string) => PostService.permanentDeletePost(id, userId),
    toggleLikePost: (postId: string, userId: string, authorId: string) => PostService.toggleLikePost(postId, userId, authorId),
    toggleLikeComment: (postId: string, commentId: string, userId: string) => PostService.toggleLikeComment(postId, commentId, userId),
    ratePost: (postId: string, userId: string, score: number) => PostService.ratePost(postId, userId, score),
    givePointsToPost: (postId: string, points: number, userId?: string) => PostService.givePointsToPost(postId, points, userId),

    getNotifications: (userId: string) => NotificationService.getNotifications(userId),
    getNewNotifications: (userId: string) => NotificationService.getNewNotifications(userId),
    getUnreadNotificationCount: (userId: string) => NotificationService.getUnreadNotificationCount(userId),
    addNotification: (userId: string, notif: any) => NotificationService.addNotification(userId, notif),
    markNotificationRead: (notifId: string) => NotificationService.markNotificationRead(notifId),
    markAllNotificationsRead: (userId: string) => NotificationService.markAllNotificationsRead(userId),
    deleteNotification: (notifId: string) => NotificationService.deleteNotification(notifId),
    cleanupOldNotifications: (userId: string, daysOld?: number) => NotificationService.cleanupOldNotifications(userId, daysOld),

    getLiveStatus: async (): Promise<LiveStatus> => {
        try { if (convex) { const config = await convex.query(api.config.getConfig, { key: 'live_status' }); if (config) return config.value; } } catch (err) { logger.error("Convex Get Live Status Error:", err); }
        return { isLive: false, url: '', lastUpdated: new Date().toISOString() };
    },

    updateLiveStatus: async (status: LiveStatus): Promise<void> => {
        try { if (convex) { await convex.mutation(api.config.setConfig, { key: 'live_status', value: status }); } } catch (err) { logger.error("Convex Update Live Status Error:", err); }
    },

    getCursos: async (): Promise<Curso[]> => {
        try { if (convex) { const data = await convex.query(api.config.getConfig, { key: "academia_cursos" }); if (data && data.value) return data.value; } } catch (err) { logger.error("Convex getCursos Error:", err); }
        const local = getLocalItem<Curso[]>('local_cursos_db', []);
        if (local.length > 0) return local;
        try { const { STATIC_CURSOS } = await import('../data/staticData'); return STATIC_CURSOS as Curso[]; } catch { return []; }
    },

    saveCurso: async (curso: Curso): Promise<void> => {
        const cursos = await StorageService.getCursos();
        const index = cursos.findIndex(c => c.id === curso.id);
        if (index !== -1) { cursos[index] = curso; } else { cursos.push(curso); }
        setLocalItem('local_cursos_db', cursos);
        if (convex) { try { await convex.mutation(api.config.setConfig, { key: "academia_cursos", value: cursos }); } catch (err) { logger.error("Convex Save Curso Error:", err); } }
    },

    deleteCurso: async (id: string): Promise<void> => {
        const cursos = await StorageService.getCursos();
        const updated = cursos.filter(c => c.id !== id);
        setLocalItem('local_cursos_db', updated);
        if (convex) { try { await convex.mutation(api.config.setConfig, { key: "academia_cursos", value: updated }); } catch (err) { logger.error("Convex Delete Curso Error:", err); } }
    },

    getHerramientas: async (): Promise<Herramienta[]> => {
        try { if (convex) { const data = await convex.query(api.config.getConfig, { key: "academia_herramientas" }); if (data && data.value) return data.value; } } catch (err) { logger.error("Convex getHerramientas Error:", err); }
        const local = getLocalItem<Herramienta[]>('local_herramientas_db', []);
        if (local.length > 0) return local;
        try { const { STATIC_HERRAMIENTAS } = await import('../data/staticData'); return STATIC_HERRAMIENTAS as Herramienta[]; } catch { return []; }
    },

    saveHerramienta: async (tool: Herramienta): Promise<void> => {
        const tools = await StorageService.getHerramientas();
        const index = tools.findIndex(t => t.id === tool.id);
        if (index !== -1) { tools[index] = tool; } else { tools.push(tool); }
        setLocalItem('local_herramientas_db', tools);
        if (convex) { try { await convex.mutation(api.config.setConfig, { key: "academia_herramientas", value: tools }); } catch (err) { logger.error("Convex Save Herramienta Error:", err); } }
    },

    deleteHerramienta: async (id: string): Promise<void> => {
        const tools = await StorageService.getHerramientas();
        const updated = tools.filter(t => t.id !== id);
        setLocalItem('local_herramientas_db', updated);
        if (convex) { try { await convex.mutation(api.config.setConfig, { key: "academia_herramientas", value: updated }); } catch (err) { logger.error("Convex Delete Herramienta Error:", err); } }
    },

    getGraficoConfig: async (): Promise<any> => {
        try { if (convex) { const data = await convex.query(api.config.getConfig, { key: "grafico_assets" }); if (data && data.value) return { id: data._id, key: "grafico_assets", assets: data.value }; } } catch (err) { logger.error("Convex Get Grafico Config Error:", err); }
        return getLocalItem('local_grafico_config', null);
    },

    saveGraficoConfig: async (config: { assets: any[] }): Promise<void> => {
        setLocalItem('local_grafico_config', config);
        if (convex) { try { await convex.mutation(api.config.setConfig, { key: "grafico_assets", value: config.assets }); } catch (err) { logger.error("Convex Save Grafico Config Error:", err); } }
    },

    toggleResourceProgress: async (userId: string, resourceId: string) => {
        const user = await UserService.getUserById(userId);
        if (!user) return null;
        const currentProgress = user.progreso || {};
        const newStatus = !currentProgress[resourceId];
        const updatedUser = { ...user, progreso: { ...currentProgress, [resourceId]: newStatus } };
        await UserService.updateUser(updatedUser);
        return updatedUser;
    },

    getVideos: async (): Promise<any[]> => {
        try { if (convex) { const data = await convex.query(api.videos.getVideos); if (data) return data.map((v: any) => ({ ...v, id: v._id })); } } catch (err) { logger.error("Convex Get Videos Error:", err); }
        return getLocalItem<any[]>('local_videos_db', []);
    },

    saveVideo: async (video: any): Promise<void> => {
        const videos = getLocalItem<any[]>('local_videos_db', []);
        const index = videos.findIndex(v => v.id === video.id);
        if (index !== -1) { videos[index] = video; } else { videos.unshift(video); }
        setLocalItem('local_videos_db', videos);
        try { if (convex) { const convexId = video.id && video.id.length > 15 && !video.id.includes('-') ? video.id : undefined; await convex.mutation(api.videos.saveVideo, { ...(convexId ? { id: convexId } : {}), tipo: video.tipo, titulo: video.titulo, autor: video.autor, descripcion: video.descripcion, thumbnail: video.thumbnail, embedUrl: video.embedUrl, duracion: video.duracion, categoria: video.categoria }); } } catch (err) { logger.error("Convex Save Video Error:", err); }
    },

    deleteVideo: async (id: string): Promise<void> => {
        const videos = getLocalItem<any[]>('local_videos_db', []);
        setLocalItem('local_videos_db', videos.filter(v => v.id !== id));
        try { if (convex && id && id.length > 15 && !id.includes('-')) { await convex.mutation(api.videos.deleteVideo, { id }); } } catch (err) { logger.error("Convex Delete Video Error:", err); }
    },

    getResources: async (): Promise<Recurso[]> => { return getLocalItem<Recurso[]>('local_resources_db', []); },
    saveResource: async (resource: Recurso): Promise<void> => { const resources = getLocalItem<Recurso[]>('local_resources_db', []); const index = resources.findIndex(r => r.id === resource.id); if (index !== -1) { resources[index] = resource; } else { resources.unshift(resource); } setLocalItem('local_resources_db', resources); },
    deleteResource: async (id: string): Promise<void> => { const resources = getLocalItem<Recurso[]>('local_resources_db', []); setLocalItem('local_resources_db', resources.filter(r => r.id !== id)); },

    getEventos: async () => EVENTOS_MOCK,
    getNoticias: async () => {
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
                        pares: n.relatedPairs || ['MERCADO'],
                        urlImagen: n.imageUrl || '',
                        url: n.sourceUrl || ''
                    }));
                }
                console.warn(NEWS_DEGRADATION_WARNING);
            }
        } catch (err) {
            logger.error("Convex news fetch failed:", err);
            console.warn(NEWS_DEGRADATION_WARNING);
        }
        return [];
    },

    seedSmartData: async () => {
        const dummyNames = ['Alex Forex', 'Bullish King', 'Pau Trading', 'Market Maker', 'Crypto Queen'];
        const dummyUsers = dummyNames.map(name => {
            const handle = name.toLowerCase().replace(' ', '');
            return { id: crypto.randomUUID?.() || 'xxx', nombre: name, usuario: handle, email: `${handle}@dummy.com`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`, esPro: Math.random() > 0.5, esVerificado: Math.random() > 0.7, rol: 'trader_experimentado', role: 0, xp: 0, level: 1, biografia: 'Trader profesional.', seguidores: [], siguiendo: [], aportes: Math.floor(Math.random() * 20), accuracy: 60 + Math.random() * 30, watchlist: ['BTC/USD', 'ETH/USD'], estadisticas: { tasaVictoria: 65, factorBeneficio: 1.8, pnlTotal: 5000 }, saldo: 5000, reputation: 0, badges: [], fechaRegistro: new Date().toISOString() } as Usuario;
        });
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        setLocalItem('local_users_db', [...localUsers, ...dummyUsers]);
        for (const user of dummyUsers) { await PostService.createPost({ titulo: `Análisis de ${user.watchlist[0]}`, contenido: 'Veo una oportunidad clara en este nivel. #trading #analisis', categoria: 'Idea', par: user.watchlist[0], tipo: 'Compra', datosGrafico: [10, 20, 15, 30, 25, 40] }, user.id); }
        return dummyUsers.length;
    },

    sendBrandEmail: async ({ to, nombre, subject, body }: { to: string; nombre: string; subject: string; body: string }) => {
        const serviceId = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID;
        const templateId = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY;
        if (!serviceId || !publicKey) { logger.warn('[EMAIL] EmailJS not configured.'); return false; }
        try {
            const payload = {
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                template_params: {
                    to_email: to,
                    to_name: nombre,
                    subject,
                    message: body,
                    from_name: 'TradeShare',
                    reply_to: 'noreply@tradeshare.io'
                }
            };
            const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            return res.ok;
        } catch (err) { logger.error('[EMAIL] Error sending email:', err); return false; }
    },

    sendWelcomeEmail: async (user: Usuario) => {
        if (!user.email) return false;
        return StorageService.sendBrandEmail({ to: user.email, nombre: user.nombre, subject: '¡Bienvenido a TradeShare Ecosystem! 🚀', body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f18;color:#fff;border-radius:16px"><div style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:40px 32px;text-align:center"><h1 style="margin:0;font-size:28px;font-weight:900">TradeShare<br><span style="color:#93c5fd">Ecosystem</span></h1></div><div style="padding:40px 32px"><h2 style="font-size:22px">¡Hola ${user.nombre}!</h2><p>Tu cuenta ha sido creada exitosamente.</p><p style="font-size:18px;font-weight:900;color:#3b82f6">@${user.usuario}</p></div></div>` });
    },

    getUserProgress: async (userId: string) => { try { return await convex.query(api.gamification.getUserProgress as any, { userId }); } catch (err) { logger.error("Get User Progress Error:", err); return null; } },
    getGlobalLeaderboard: async (limit?: number) => { try { return await convex.query(api.gamification.getLeaderboard as any, { limit }); } catch (err) { logger.error("Get Leaderboard Error:", err); return []; } },
    getWeeklyLeaderboard: async (limit?: number) => { try { return await convex.query(api.gamification.getWeeklyLeaderboard as any, { limit }); } catch (err) { logger.error("Get Weekly Leaderboard Error:", err); return []; } },
    getMonthlyLeaderboard: async (limit?: number) => { try { return await convex.query(api.gamification.getMonthlyLeaderboard as any, { limit }); } catch (err) { logger.error("Get Monthly Leaderboard Error:", err); return []; } },
    getUserAchievements: async (userId: string) => { try { return await convex.query(api.gamification.getUserAchievements as any, { userId }); } catch (err) { logger.error("Get User Achievements Error:", err); return []; } },
    checkAchievements: async (userId: string) => { try { return await convex.mutation(api.gamification.checkAchievements as any, { userId }); } catch (err) { logger.error("Check Achievements Error:", err); return []; } },
    awardXP: async (userId: string, amount: number, reason: string) => { try { return await convex.mutation(api.gamification.awardXP as any, { userId, amount, reason }); } catch (err) { logger.error("Award XP Error:", err); return null; } },
    getAchievementProgress: async (userId: string) => { try { return await convex.query(api.achievements.getAchievementProgress as any, { userId }); } catch (err) { logger.error("Get Achievement Progress Error:", err); return []; } },
    getAllAchievements: async () => { try { return await convex.query(api.achievements.getAllAchievements as any, {}); } catch (err) { logger.error("Get All Achievements Error:", err); return []; } },
    getAchievementStats: async (userId: string) => { try { return await convex.query(api.achievements.getAchievementStats as any, { userId }); } catch (err) { logger.error("Get Achievement Stats Error:", err); return null; } },
    getAchievementLeaderboard: async (limit?: number) => { try { return await convex.query(api.achievements.getLeaderboardByAchievements as any, { limit }); } catch (err) { logger.error("Get Achievement Leaderboard Error:", err); return []; } },
    triggerAchievementCheck: async (userId: string, action: string, metadata?: any) => { try { return await convex.mutation(api.achievements.checkAndAwardAchievements as any, { userId, action, metadata }); } catch (err) { logger.error("Trigger Achievement Check Error:", err); return null; } },

    getSesion: () => AuthService.getCurrentSession(),
    trackActiveDay: (userId: string) => AuthService.recordLogin(userId),
    cerrarSesion: () => AuthService.logout(),

    saveItem: async (key: string, data: any) => setLocalItem(key, data),
    getItem: async (key: string) => getLocalItem(key, null),
    removeItem: async (key: string) => localStorage.removeItem(key),

    getPatterns: async () => getLocalItem<any[]>('ai_patterns', []),
    savePattern: async (pattern: any) => { const patterns = await StorageService.getPatterns(); const existing = patterns.findIndex(p => p.id === pattern.id); if (existing >= 0) { patterns[existing] = pattern; } else { patterns.push(pattern); } setLocalItem('ai_patterns', patterns); },

    hasCompletedOnboarding: async () => localStorage.getItem('onboarding_completed') === 'true',
    setOnboardingCompleted: async () => { localStorage.setItem('onboarding_completed', 'true'); },

    getBackupHistory: (itemId: string, itemType: string) => BackupManager.getBackupHistory(itemId, itemType),
    getBackupById: (itemId: string, itemType: string, backupId: string) => BackupManager.getBackupById(itemId, itemType, backupId),
    restoreFromBackup: async (itemId: string, itemType: string, backupId: string): Promise<boolean> => {
        const backup = BackupManager.restoreFromBackup(itemId, itemType, backupId);
        if (!backup || !backup.previousData) return false;
        if (itemType === 'post') { const post = backup.previousData as Publicacion; delete (post as any).id; await PostService.updatePost(post as Publicacion); return true; }
        if (itemType === 'profile') { await UserService.updateUser(backup.previousData as Usuario); return true; }
        return false;
    },

    getSyncStatus: () => SyncService.getSyncStatus(),
    forceSyncNow: () => SyncService.forceSyncNow(),
    clearOldLocalBackups: (daysOld?: number) => BackupManager.clearOldBackups(daysOld),
    getBackupStats: () => BackupManager.getBackupStats(),

    getPromotionalAds: () => PROMOTIONAL_ADS,
    getPromotionalAdsBySector: (sector: 'feed' | 'sidebar') => PROMOTIONAL_ADS.filter(ad => ad.sector === sector),
    convertPromoAdToAd: (promoAd: PromotionalAd): Partial<Ad> => ({ titulo: promoAd.title, descripcion: promoAd.description, imagenUrl: promoAd.imageUrl, link: promoAd.link, sector: promoAd.sector, activo: true, subtitle: promoAd.subtitle, extra: promoAd.badge ? `${promoAd.badge}${promoAd.currentPrice ? `|${promoAd.currentPrice}` : ''}` : undefined }),

    getInstagramAccounts: async (userId: string) => { try { if (convex) return await convex.query(api.instagram.accounts.getUserInstagramAccounts as any, { userId }); } catch (err) { logger.error("Convex Get IG Accounts Error:", err); } return []; },
    disconnectInstagramAccount: async (userId: string, accountId: string) => { try { if (convex) return await convex.mutation(api.instagram.accounts.disconnectInstagramAccount as any, { userId, accountId }); } catch (err) { logger.error("Convex Disconnect IG Error:", err); throw err; } },
    getScheduledInstagramPosts: async (userId: string, accountId?: string) => { try { if (convex) return await convex.query(api.instagram.posts.getScheduledPosts as any, { userId, accountId: accountId || undefined }); } catch (err) { logger.error("Convex Get IG Posts Error:", err); } return []; },
    createScheduledInstagramPost: async (postData: any) => { try { if (convex) return await convex.mutation(api.instagram.posts.createScheduledPost as any, postData); } catch (err) { logger.error("Convex Create IG Post Error:", err); throw err; } },
    deleteScheduledInstagramPost: async (userId: string, postId: string) => { try { if (convex) return await convex.mutation(api.instagram.posts.deleteScheduledPost as any, { userId, postId }); } catch (err) { logger.error("Convex Delete IG Post Error:", err); throw err; } },
    publishInstagramPostNow: async (userId: string, postId: string) => { try { if (convex) { return await convex.mutation(api.instagram.posts.publishPostNow as any, { userId, postId }); } } catch (err) { logger.error("Convex Publish IG Post Error:", err); throw err; } },
    getInstagramStats: async (userId: string, accountId?: string) => { try { if (convex) return await convex.query(api.instagram.posts.getPostStats as any, { userId, accountId }); } catch (err) { logger.error("Convex Get IG Stats Error:", err); } return null; },
    updateInstagramSettings: async (settings: any) => { try { if (convex) return await convex.mutation(api.instagram.accounts.updateAccountSettings as any, settings); } catch (err) { logger.error("Convex Update IG Settings Error:", err); throw err; } },
    refreshInstagramStats: async (accountId: string) => { try { if (convex) return await convex.action(api.instagram.accounts.refreshAccountStats as any, { accountId }); } catch (err) { logger.error("Convex Refresh IG Stats Error:", err); throw err; } },
};
