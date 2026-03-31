import { Usuario } from '../../types';
import { api } from "../../../convex/_generated/api";
import logger from '../../../lib/utils/logger';
import { mapConvexProfileToUsuario } from '../auth/authService';
import { SyncManager } from '../backup/syncService';
import { getSessionUser, saveSessionUser } from '../../utils/sessionManager';
import { getConvexClient } from '../../../lib/convex/client';

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

export const UserService = {
    getAllUsers: async (): Promise<Usuario[]> => {
        try {
            if (convex) {
                const remoteProfilesResult = await convex.query(api.profiles.getAllProfiles, { limit: 100 });
                const remoteProfiles = remoteProfilesResult?.profiles || [];
                if (remoteProfiles && remoteProfiles.length > 0) {
                    const remoteUsers = remoteProfiles.map(mapConvexProfileToUsuario);
                    setLocalItem('local_users_db', remoteUsers);
                    return remoteUsers;
                }
            }
        } catch (err) {
            logger.error("Convex Get All Users Error:", err);
        }
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        return localUsers;
    },

    getUserById: async (id: string): Promise<Usuario | null> => {
        if (id === 'dev-admin-id' || id === '00000000-0000-0000-0000-000000000000') {
            return getLocalItem<Usuario | null>('dev_admin_session', null);
        }
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        const found = localUsers.find(u => u.id === id);
        if (found) return found;

        try {
            if (convex) {
                const profile = await convex.query(api.profiles.getProfile, { userId: id });
                return profile ? mapConvexProfileToUsuario(profile) : null;
            }
        } catch (err) {
            logger.error("Convex Get User By ID Error:", err);
        }
        return null;
    },

    updateUser: async (usuario: Usuario): Promise<Usuario> => {
        const calculateReputation = (user: Usuario): Usuario => {
            let score = 50;
            score += (user.aportes || 0) * 5;
            score += (user.accuracy || 50) - 50;
            const existingBadges = user.badges || [];
            const newBadges = new Set(existingBadges);
            if (user.rol === 'admin' || user.rol === 'ceo' || user.esVerificado) newBadges.add('Verified');
            if (user.accuracy > 80) newBadges.add('TopAnalyst');
            if (user.saldo > 5000) newBadges.add('Whale');
            if (user.reputation > 80) newBadges.add('Influencer');
            return { ...user, reputation: Math.min(100, Math.max(0, score)), badges: Array.from(newBadges) };
        };

        const updatedUserWithRep = calculateReputation(usuario);
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        const updatedLocal = localUsers.map(u => u.id === updatedUserWithRep.id ? updatedUserWithRep : u);
        setLocalItem('local_users_db', updatedLocal);

        const currentLocal = getSessionUser();
        if (currentLocal && currentLocal.id === updatedUserWithRep.id) {
            saveSessionUser(updatedUserWithRep);
        }
        const admin = getLocalItem<Usuario | null>('dev_admin_session', null);
        if (admin && admin.id === updatedUserWithRep.id) {
            setLocalItem('dev_admin_session', updatedUserWithRep);
        }

        const profileData = {
            userId: updatedUserWithRep.id,
            nombre: updatedUserWithRep.nombre || 'Usuario',
            usuario: updatedUserWithRep.usuario || 'user',
            avatar: updatedUserWithRep.avatar,
            banner: updatedUserWithRep.banner || '',
            esPro: !!updatedUserWithRep.esPro,
            esVerificado: !!updatedUserWithRep.esVerificado,
            rol: updatedUserWithRep.rol || 'user',
            email: updatedUserWithRep.email || '',
            password: updatedUserWithRep.password || undefined,
            biografia: updatedUserWithRep.biografia || '',
            instagram: updatedUserWithRep.instagram || '',
            seguidores: Array.isArray(updatedUserWithRep.seguidores) ? updatedUserWithRep.seguidores : [],
            siguiendo: Array.isArray(updatedUserWithRep.siguiendo) ? updatedUserWithRep.siguiendo : [],
            aportes: typeof updatedUserWithRep.aportes === 'number' && !isNaN(updatedUserWithRep.aportes) ? updatedUserWithRep.aportes : 0,
            accuracy: typeof updatedUserWithRep.accuracy === 'number' && !isNaN(updatedUserWithRep.accuracy) ? updatedUserWithRep.accuracy : 50,
            reputation: typeof updatedUserWithRep.reputation === 'number' && !isNaN(updatedUserWithRep.reputation) ? updatedUserWithRep.reputation : 50,
            badges: Array.isArray(updatedUserWithRep.badges) ? updatedUserWithRep.badges : [],
            estadisticas: updatedUserWithRep.estadisticas || { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 },
            saldo: typeof updatedUserWithRep.saldo === 'number' && !isNaN(updatedUserWithRep.saldo) ? updatedUserWithRep.saldo : 0,
            watchlist: Array.isArray(updatedUserWithRep.watchlist) ? updatedUserWithRep.watchlist : ["BTC/USD", "EUR/USD"],
            watchedClasses: Array.isArray(updatedUserWithRep.watchedClasses) ? updatedUserWithRep.watchedClasses : [],
            progreso: updatedUserWithRep.progreso || {},
            fechaRegistro: updatedUserWithRep.fechaRegistro || new Date().toISOString()
        };

        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        
        const withRetry = async <T>(
            operation: () => Promise<T>,
            context: string,
            options: { retries?: number; delay?: number } = {}
        ): Promise<{ data?: T; error?: string; localFallback?: boolean }> => {
            const retries = options.retries ?? 3;
            const delay = options.delay ?? 1000;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    const data = await operation();
                    return { data };
                } catch (err: any) {
                    logger.warn(`[RETRY] ${context} - Intento ${attempt}/${retries}:`, err.message);
                    if (attempt < retries) {
                        await new Promise(resolve => setTimeout(resolve, delay * attempt));
                    } else {
                        return { error: err.message };
                    }
                }
            }
            return { error: 'Máximo número de intentos alcanzado' };
        };

        if (isOnline) {
            const result = await withRetry(async () => {
                if (convex) {
                    return await convex.mutation(api.profiles.upsertProfile, profileData);
                }
                throw new Error('Convex no disponible');
            }, `updateUser ${updatedUserWithRep.id}`);

            if (result.error) {
                logger.warn(`[SYNC] Fallo updateUser ${updatedUserWithRep.id}, agregando a cola:`, result.error);
                await SyncManager.addToQueue({
                    operation: 'update',
                    itemType: 'profile',
                    itemId: updatedUserWithRep.id,
                    data: profileData,
                });
            }
        } else {
            await SyncManager.addToQueue({
                operation: 'update',
                itemType: 'profile',
                itemId: updatedUserWithRep.id,
                data: profileData,
            });
        }

        return updatedUserWithRep;
    },

    deleteUser: async (id: string): Promise<void> => {
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        setLocalItem('local_users_db', localUsers.filter(u => u.id !== id));
        
        try {
            if (convex) {
                await convex.mutation(api.profiles.deleteProfile, { userId: id });
            }
        } catch (err) {
            logger.error("Convex Delete User Error:", err);
        }
    },

    blockUser: async (userId: string, isBlocked: boolean, ipToBlock?: string): Promise<void> => {
        const user = await UserService.getUserById(userId);
        if (!user) return;

        const updatedUser = {
            ...user,
            isBlocked,
            blockedIPs: ipToBlock 
                ? Array.from(new Set([...(user as any).blockedIPs || [], ipToBlock]))
                : (user as any).blockedIPs
        };

        await UserService.updateUser(updatedUser as Usuario);

        if (convex) {
            try {
                await convex.mutation(api.profiles.updateProfile, {
                    userId,
                    isBlocked
                } as any);
            } catch (err) {
                logger.error("Convex Block User Error:", err);
            }
        }
    },

    toggleFollowUser: async (myId: string, targetId: string): Promise<void> => {
        const isMeConvex = myId && myId.length >= 5;
        const isTargetConvex = targetId && targetId.length >= 5;

        if (convex && isMeConvex && isTargetConvex) {
            try {
                await convex.mutation("profiles:toggleFollow" as any, { followerId: myId, targetId: targetId });
            } catch (err) {
                logger.error("Convex Toggle Follow Error:", err);
            }
        }

        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        let meIndex = localUsers.findIndex(u => u.id === myId);
        let targetIndex = localUsers.findIndex(u => u.id === targetId);

        if (meIndex === -1) {
            const fetchedMe = await UserService.getUserById(myId);
            if (fetchedMe) { localUsers.push(fetchedMe); meIndex = localUsers.length - 1; }
        }
        if (targetIndex === -1) {
            const fetchedTarget = await UserService.getUserById(targetId);
            if (fetchedTarget) { localUsers.push(fetchedTarget); targetIndex = localUsers.length - 1; }
        }

        if (meIndex !== -1 && targetIndex !== -1) {
            let me = localUsers[meIndex];
            let target = localUsers[targetIndex];

            const calculateReputation = (user: Usuario): Usuario => {
                let score = 50;
                score += (user.aportes || 0) * 5;
                score += (user.accuracy || 50) - 50;
                const newBadges = new Set(user.badges || []);
                if (user.rol === 'admin' || user.rol === 'ceo' || user.esVerificado) newBadges.add('Verified');
                if (user.accuracy > 80) newBadges.add('TopAnalyst');
                if (user.saldo > 5000) newBadges.add('Whale');
                if (user.reputation > 80) newBadges.add('Influencer');
                return { ...user, reputation: Math.min(100, Math.max(0, score)), badges: Array.from(newBadges) };
            };

            if ((me.siguiendo || []).includes(targetId)) {
                me.siguiendo = (me.siguiendo || []).filter(id => id !== targetId);
                target.seguidores = (target.seguidores || []).filter(id => id !== myId);
            } else {
                if (!(me.siguiendo || []).includes(targetId)) me.siguiendo = [...(me.siguiendo || []), targetId];
                if (!(target.seguidores || []).includes(myId)) target.seguidores = [...(target.seguidores || []), myId];
            }
            target = calculateReputation(target);
            localUsers[meIndex] = me;
            localUsers[targetIndex] = target;
            setLocalItem('local_users_db', localUsers);

            const localSession = getLocalItem<Usuario | null>('local_session_user', null);
            if (localSession && localSession.id === myId) { setLocalItem('local_session_user', me); }
            const devSession = getLocalItem<Usuario | null>('dev_admin_session', null);
            if (devSession && devSession.id === myId) { setLocalItem('dev_admin_session', me); }
        }
    },

    getTopTraders: async (filter: 'likes' | 'posts' | 'comments' = 'likes') => {
        const users = await UserService.getAllUsers();
        const localPosts = getLocalItem<any[]>('local_posts_db', []);
        const userStats: Record<string, any> = {};

        users.forEach(u => { userStats[u.id] = { ...u, totalLikes: 0, totalPosts: 0, totalComments: 0 }; });
        localPosts.forEach(p => {
            if (userStats[p.idUsuario]) {
                userStats[p.idUsuario].totalPosts++;
                userStats[p.idUsuario].totalLikes += p.likes?.length || 0;
                userStats[p.idUsuario].totalComments += p.comentarios?.length || 0;
            }
        });
        return Object.values(userStats).sort((a: any, b: any) => {
            if (filter === 'likes') return b.totalLikes - a.totalLikes;
            if (filter === 'posts') return b.totalPosts - a.totalPosts;
            if (filter === 'comments') return b.totalComments - a.totalComments;
            return 0;
        }).slice(0, 5);
    },

    mergeUsers: async (primaryId: string, secondaryId: string): Promise<{ success: boolean, error?: string }> => {
        try {
            logger.info(`[MERGE] Consolidating user ${secondaryId} into ${primaryId}`);
            const primary = await UserService.getUserById(primaryId);
            const secondary = await UserService.getUserById(secondaryId);

            if (!primary || !secondary) return { success: false, error: 'Uno de los usuarios no existe.' };

            const mergedSeguidores = Array.from(new Set([...(primary.seguidores || []), ...(secondary.seguidores || [])]));
            const mergedSiguiendo = Array.from(new Set([...(primary.siguiendo || []), ...(secondary.siguiendo || [])]));

            await UserService.updateUser({
                ...primary,
                seguidores: mergedSeguidores,
                siguiendo: mergedSiguiendo,
                aportes: (primary.aportes || 0) + (secondary.aportes || 0),
                saldo: (primary.saldo || 0) + (secondary.saldo || 0)
            });

            await UserService.deleteUser(secondaryId);

            if (convex) {
                await convex.mutation(api.profiles.mergeProfiles, { primaryId, secondaryId });
            }

            return { success: true };
        } catch (err: any) {
            logger.error("Merge Users Error:", err);
            return { success: false, error: err.message };
        }
    },

    seedAdmin: async () => {
        try {
            if (convex) {
                await convex.mutation(api.profiles.fixAdmin).catch(() => {});
                logger.info("Convex: Admin 'brai' profile assured.");
            }
        } catch (err) {
            logger.error("Convex Seed Admin Error", err);
        }

        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        const existingIndex = localUsers.findIndex(u => u.usuario === 'brai');
        
        const mockAdmin: Usuario = {
            id: 'admin_initial_seed',
            nombre: 'Admin', usuario: 'brai', email: 'admin@tradeportal.com', 
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brai',
            esPro: true, esVerificado: true, rol: 'admin', password: 'admin123',
            role: 5, xp: 10000, level: 50,
            biografia: 'Cuenta oficial de administracion.', seguidores: [], siguiendo: [],
            aportes: 999, accuracy: 100, watchlist: ['BTC/USD', 'XAU/USD', 'ETH/USD'],
            estadisticas: { tasaVictoria: 100, factorBeneficio: 99.9, pnlTotal: 1000000 },
            saldo: 1000000, reputation: 999, badges: ['Verified', 'TopAnalyst', 'Whale', 'EarlyBird']
        };
        
        if (existingIndex >= 0) {
            localUsers[existingIndex] = mockAdmin;
        } else {
            localUsers.unshift(mockAdmin);
        }
        setLocalItem('local_users_db', localUsers);
        logger.info("Local admin user created/updated");
    },

    clearLocalUsersCache: (): void => {
        localStorage.removeItem('local_users_db');
        logger.info("Local users cache cleared");
    },
};
