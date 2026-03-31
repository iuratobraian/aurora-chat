import { Usuario } from '../../types';
import { api } from "../../../convex/_generated/api";
import logger from '../../utils/logger';
import { convex, isOnline, SyncManager, BackupManager } from './sync';
import { withRetry } from './sync';
import { getLocalItem, setLocalItem } from './helpers';
import { calculateReputation } from './constants';
import { mapConvexProfileToUsuario } from './reputation';

export const getAllUsers = async (): Promise<Usuario[]> => {
    const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
    try {
        if (convex) {
            const remoteProfilesResult = await convex.query(api.profiles.getAllProfiles);
            const remoteProfiles = remoteProfilesResult?.profiles || [];
            if (remoteProfiles && remoteProfiles.length > 0) {
                const remoteUsers = remoteProfiles.map(mapConvexProfileToUsuario);
                const usersMap = new Map<string, Usuario>();
                localUsers.forEach(u => usersMap.set(u.id, u));
                remoteUsers.forEach(u => {
                    const existing = usersMap.get(u.id);
                    if (existing) {
                        usersMap.set(u.id, {
                            ...existing,
                            ...u,
                            rol: u.rol || existing.rol,
                            esVerificado: u.esVerificado !== undefined ? u.esVerificado : existing.esVerificado,
                            esPro: u.esPro !== undefined ? u.esPro : existing.esPro,
                            nombre: u.nombre || existing.nombre,
                            avatar: u.avatar || existing.avatar,
                        });
                    } else {
                        usersMap.set(u.id, u);
                    }
                });
                const merged = Array.from(usersMap.values());
                setLocalItem('local_users_db', merged);
                return merged;
            }
        }
    } catch (err) {
        logger.error("Convex Get All Users Error:", err);
    }
    return localUsers;
};

export const updateUser = async (usuario: Usuario): Promise<Usuario> => {
    const updatedUserWithRep = calculateReputation(usuario);
    const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
    const original = localUsers.find(u => u.id === updatedUserWithRep.id);
    
    if (original) {
        BackupManager.createBackup(updatedUserWithRep.id, 'profile', 'update', original, updatedUserWithRep, updatedUserWithRep.id);
    }
    
    const updatedLocal = localUsers.map(u => u.id === updatedUserWithRep.id ? updatedUserWithRep : u);
    setLocalItem('local_users_db', updatedLocal);

    const currentLocal = getLocalItem<Usuario | null>('local_session_user', null);
    if (currentLocal && currentLocal.id === updatedUserWithRep.id) {
        setLocalItem('local_session_user', updatedUserWithRep);
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
        medianas: Array.isArray(updatedUserWithRep.medianas) ? updatedUserWithRep.medianas : [],
        progreso: updatedUserWithRep.progreso || {},
        fechaRegistro: updatedUserWithRep.fechaRegistro || new Date().toISOString()
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
};

export const deleteUser = async (id: string): Promise<void> => {
    const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
    setLocalItem('local_users_db', localUsers.filter(u => u.id !== id));
    
    try {
        if (convex) {
            await convex.mutation(api.profiles.deleteProfile, { userId: id });
        }
    } catch (err) {
        logger.error("Convex Delete User Error:", err);
    }
};

export const getUserById = async (id: string): Promise<Usuario | null> => {
    if (id === 'dev-admin-id' || id === '00000000-0000-0000-0000-000000000000') {
        return getLocalItem('dev_admin_session', null);
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
};

export const blockUser = async (userId: string, isBlocked: boolean, ipToBlock?: string): Promise<void> => {
    const { StorageService } = await import('./index');
    const user = await StorageService.getUserById(userId);
    if (!user) return;

    const updatedUser = {
        ...user,
        isBlocked,
        blockedIPs: ipToBlock 
            ? Array.from(new Set([...(user.blockedIPs || []), ipToBlock]))
            : user.blockedIPs
    };

    await StorageService.updateUser(updatedUser);

    if (convex) {
        try {
            await convex.mutation(api.profiles.updateProfile, {
                userId,
                isBlocked
            });
        } catch (err) {
            logger.error("Convex Block User Error:", err);
        }
    }
};
