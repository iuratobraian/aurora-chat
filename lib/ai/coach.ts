import logger from '../utils/logger';
import { Usuario } from '../types';

export type CoachActionType = 
    | 'create_post'
    | 'join_community'
    | 'complete_profile'
    | 'try_signals'
    | 'invite_friends'
    | 'upgrade_pro'
    | 'explore_courses'
    | 'engage_more';

export interface CoachRecommendation {
    id: string;
    type: CoachActionType;
    title: string;
    description: string;
    action: string;
    xpReward: number;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    ctaLabel: string;
    ctaAction: string;
}

interface UserProgress {
    postsCreated: number;
    communitiesJoined: number;
    profileCompleteness: number;
    signalsViewed: number;
    referralsMade: number;
    isPro: boolean;
    coursesCompleted: number;
    loginStreak: number;
    daysSinceJoin: number;
}

const DEFAULT_PROGRESS: UserProgress = {
    postsCreated: 0,
    communitiesJoined: 0,
    profileCompleteness: 50,
    signalsViewed: 0,
    referralsMade: 0,
    isPro: false,
    coursesCompleted: 0,
    loginStreak: 1,
    daysSinceJoin: 0,
};

function getProgress(usuario: Usuario | null): UserProgress {
    if (!usuario) {
        return { ...DEFAULT_PROGRESS, profileCompleteness: 0 };
    }

    const watchedClasses = usuario.watchedClasses || [];
    const diasActivos = usuario.diasActivos || 1;
    
    return {
        postsCreated: (usuario.aportes || 0),
        communitiesJoined: 0,
        profileCompleteness: calculateProfileCompleteness(usuario),
        signalsViewed: 0,
        referralsMade: 0,
        isPro: usuario.esPro || false,
        coursesCompleted: watchedClasses.length,
        loginStreak: diasActivos,
        daysSinceJoin: usuario.fechaRegistro 
            ? Math.floor((Date.now() - new Date(usuario.fechaRegistro).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
    };
}

function calculateProfileCompleteness(usuario: Usuario): number {
    let completeness = 20;
    if (usuario.nombre) completeness += 15;
    if (usuario.avatar) completeness += 15;
    if (usuario.biografia) completeness += 15;
    if (usuario.watchlist?.length) completeness += 15;
    if (usuario.instagram) completeness += 10;
    if (usuario.estadisticas) completeness += 10;
    return Math.min(100, completeness);
}

function generateRecommendations(progress: UserProgress): CoachRecommendation[] {
    const recs: CoachRecommendation[] = [];

    if (progress.postsCreated === 0 && progress.daysSinceJoin >= 0) {
        recs.push({
            id: 'first-post',
            type: 'create_post',
            title: 'Crea tu primer post',
            description: 'Comparte tu análisis o idea de trading con la comunidad.',
            action: 'create_post',
            xpReward: 50,
            priority: 'high',
            icon: 'edit_note',
            ctaLabel: 'Crear Post',
            ctaAction: 'open_create_post',
        });
    } else if (progress.postsCreated > 0 && progress.postsCreated < 5) {
        recs.push({
            id: 'more-posts',
            type: 'create_post',
            title: 'Sigue publicando',
            description: `Llevas ${progress.postsCreated} posts. Publica más para ganar visibilidad.`,
            action: 'create_post',
            xpReward: 25,
            priority: 'medium',
            icon: 'trending_up',
            ctaLabel: 'Publicar Más',
            ctaAction: 'open_create_post',
        });
    }

    if (progress.communitiesJoined === 0) {
        recs.push({
            id: 'join-community',
            type: 'join_community',
            title: 'Únete a una comunidad',
            description: 'Encuentra comunidades de tu interés y conecta con traders.',
            action: 'join_community',
            xpReward: 30,
            priority: 'high',
            icon: 'group_add',
            ctaLabel: 'Explorar',
            ctaAction: 'navigate_communities',
        });
    } else if (progress.communitiesJoined < 3) {
        recs.push({
            id: 'more-communities',
            type: 'join_community',
            title: 'Expande tu red',
            description: `Ya estás en ${progress.communitiesJoined} comunidades. Únete a más para aprender más.`,
            action: 'join_community',
            xpReward: 20,
            priority: 'low',
            icon: 'diversity_3',
            ctaLabel: 'Ver Más',
            ctaAction: 'navigate_communities',
        });
    }

    if (progress.profileCompleteness < 70) {
        recs.push({
            id: 'complete-profile',
            type: 'complete_profile',
            title: 'Completa tu perfil',
            description: `Tu perfil está al ${progress.profileCompleteness}%. Complétalo para destacar.`,
            action: 'complete_profile',
            xpReward: 40,
            priority: 'high',
            icon: 'person',
            ctaLabel: 'Editar Perfil',
            ctaAction: 'navigate_profile',
        });
    }

    if (progress.signalsViewed < 3 && !progress.isPro) {
        recs.push({
            id: 'explore-signals',
            type: 'try_signals',
            title: 'Explora las señales',
            description: 'Mira cómo otros traders comparten sus operaciones.',
            action: 'try_signals',
            xpReward: 15,
            priority: 'medium',
            icon: 'show_chart',
            ctaLabel: 'Ver Señales',
            ctaAction: 'navigate_signals',
        });
    }

    if (progress.referralsMade === 0 && progress.daysSinceJoin >= 7) {
        recs.push({
            id: 'invite-friends',
            type: 'invite_friends',
            title: 'Invita amigos',
            description: 'Gana XP y beneficios invitando a otros traders.',
            action: 'invite_friends',
            xpReward: 100,
            priority: 'medium',
            icon: 'share',
            ctaLabel: 'Invitar',
            ctaAction: 'open_referral',
        });
    }

    if (!progress.isPro) {
        recs.push({
            id: 'upgrade-pro',
            type: 'upgrade_pro',
            title: 'Activa tu plan PRO',
            description: 'Accede a señales premium, IA personalizada y más.',
            action: 'upgrade_pro',
            xpReward: 0,
            priority: progress.signalsViewed > 5 ? 'high' : 'low',
            icon: 'workspace_premium',
            ctaLabel: 'Ir PRO',
            ctaAction: 'navigate_pricing',
        });
    }

    if (progress.coursesCompleted < 2) {
        recs.push({
            id: 'take-course',
            type: 'explore_courses',
            title: 'Aprende algo nuevo',
            description: 'Los traders que más aprenden, más ganan.',
            action: 'explore_courses',
            xpReward: 35,
            priority: 'medium',
            icon: 'school',
            ctaLabel: 'Ver Cursos',
            ctaAction: 'navigate_academia',
        });
    }

    if (progress.loginStreak < 3) {
        recs.push({
            id: 'login-streak',
            type: 'engage_more',
            title: 'Vuelve mañana',
            description: `Mantén tu racha: ${progress.loginStreak} día${progress.loginStreak > 1 ? 's' : ''} consecutiv${progress.loginStreak > 1 ? 'os' : 'o'}.`,
            action: 'engage_more',
            xpReward: 10,
            priority: 'low',
            icon: 'local_fire_department',
            ctaLabel: 'Seguir',
            ctaAction: 'login_tomorrow',
        });
    }

    return recs.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export const CoachService = {
    getDailyRecommendations(usuario: Usuario | null): CoachRecommendation[] {
        try {
            const progress = getProgress(usuario);
            return generateRecommendations(progress);
        } catch (err) {
            logger.error('[Coach] Error generating recommendations:', err);
            return [{
                id: 'default',
                type: 'engage_more',
                title: 'Explora la comunidad',
                description: 'Hay mucho por descubrir en TradePortal.',
                action: 'engage_more',
                xpReward: 10,
                priority: 'medium',
                icon: 'explore',
                ctaLabel: 'Explorar',
                ctaAction: 'navigate_feed',
            }];
        }
    },

    getTopRecommendation(usuario: Usuario | null): CoachRecommendation | null {
        const recs = this.getDailyRecommendations(usuario);
        return recs.length > 0 ? recs[0] : null;
    },

    getStreakMessage(streak: number): string {
        if (streak >= 30) return `¡${streak} días! ¡Eres un(a) profesional!`;
        if (streak >= 14) return `¡${streak} días! El compromiso paga.`;
        if (streak >= 7) return `${streak} días seguidos. ¡Vas bien!`;
        if (streak >= 3) return `${streak} días. ¡Sigue así!`;
        return 'Comienza tu racha hoy.';
    },

    calculateXPDaily(usuario: Usuario | null): number {
        if (!usuario) return 0;
        const recs = this.getDailyRecommendations(usuario);
        return recs
            .filter(r => r.type !== 'upgrade_pro')
            .reduce((sum, r) => sum + r.xpReward, 0);
    },
};

export const COACH_STORAGE_KEY = 'daily_coach_cache';

export function cacheCoachData(data: CoachRecommendation[]): void {
    try {
        const cache = {
            recommendations: data,
            timestamp: Date.now(),
            date: new Date().toDateString(),
        };
        localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(cache));
    } catch (err) {
        logger.warn('[Coach] Could not cache:', err);
    }
}

export function getCachedCoachData(): CoachRecommendation[] | null {
    try {
        const cached = localStorage.getItem(COACH_STORAGE_KEY);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        if (data.date !== new Date().toDateString()) {
            return null;
        }
        return data.recommendations;
    } catch {
        return null;
    }
}

export function isCoachDataStale(): boolean {
    try {
        const cached = localStorage.getItem(COACH_STORAGE_KEY);
        if (!cached) return true;
        
        const data = JSON.parse(cached);
        return data.date !== new Date().toDateString();
    } catch {
        return true;
    }
}
