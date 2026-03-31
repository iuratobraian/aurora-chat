import { Publicacion, Comentario } from '../../types';
import { getConvexClient } from '../../../lib/convex/client';
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import logger from '../../../lib/utils/logger';
import { extractTags } from '../../utils/postMapper';
import { SyncManager, BackupManager } from '../backup/syncService';
import { UserService } from '../users/userService';
import { NotificationService } from '../notifications/notificationService';
import { getSessionUser } from '../../utils/sessionManager';

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

const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

const withRetry = async <T>(
    operation: () => Promise<T>,
    context: string,
    options: { retries?: number; delay?: number } = {}
): Promise<{ data?: T; error?: string }> => {
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

function compressData(data: any): string {
    try {
        return JSON.stringify(data);
    } catch {
        return JSON.stringify({ _compressed: true, data: String(data) });
    }
}

export const PostService = {
    getPosts: async (): Promise<Publicacion[]> => {
        let localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        try {
            if (convex) {
                const remotePosts = await convex.query(api.posts.getPosts);
                if (remotePosts && remotePosts.length > 0) {
                    const mapped: Publicacion[] = remotePosts.map((row: any) => ({
                        id: row._id,
                        idUsuario: row.userId,
                        nombreUsuario: row.nombreUsuario || 'Usuario',
                        usuarioManejo: row.usuarioManejo || 'user',
                        avatarUsuario: row.avatarUsuario || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.userId}`,
                        esPro: row.esPro || false,
                        esVerificado: row.esVerificado || false,
                        accuracyUser: row.accuracyUser || 50,
                        authorFollowers: row.authorFollowers || 0,
                        esAnuncio: row.esAnuncio || false,
                        categoria: row.categoria || 'General',
                        titulo: row.titulo,
                        par: row.par || 'GENERAL',
                        tipo: row.tipo || 'Neutral',
                        contenido: row.contenido,
                        datosGrafico: row.datosGrafico || [],
                        tiempo: row.tiempo || new Date(row.createdAt).toLocaleString(),
                        ultimaInteraccion: row.ultimaInteraccion || row.createdAt,
                        likes: row.likes || [],
                        seguidoresPost: [],
                        comentarios: (row.comentarios || []) as import('../../types').Comentario[],
                        compartidos: row.compartidos || 0,
                        tradingViewUrl: row.tradingViewUrl,
                        imagenUrl: row.imagenUrl,
                        tags: row.tags || extractTags(row.contenido || ''),
                        reputationSnapshot: row.reputationSnapshot,
                        badgesSnapshot: row.badgesSnapshot,
                        zonaOperativa: row.zonaOperativa,
                    }));
                    setLocalItem('local_posts_db', mapped);
                    return mapped;
                }
            }
        } catch (err) {
            logger.error("Convex Get Posts Error:", err);
        }
        return localPosts.sort((a, b) => {
            if (a.esAnuncio && !b.esAnuncio) return -1;
            if (!a.esAnuncio && b.esAnuncio) return 1;
            return (b.ultimaInteraccion || 0) - (a.ultimaInteraccion || 0);
        });
    },

    createPost: async (postPartial: Partial<Publicacion>, userId: string) => {
        const user = await UserService.getUserById(userId);
        if (!user) return { error: 'Usuario no encontrado' };

        const timestamp = Date.now();
        const newPost: Publicacion = {
            id: postPartial.id || timestamp.toString(),
            idUsuario: userId,
            nombreUsuario: user.nombre,
            usuarioManejo: user.usuario,
            avatarUsuario: user.avatar,
            esPro: user.esPro,
            esVerificado: user.esVerificado,
            accuracyUser: user.accuracy,
            authorFollowers: user.seguidores?.length || 0,
            esAnuncio: postPartial.esAnuncio || false,
            categoria: postPartial.categoria || 'General',
            titulo: postPartial.titulo,
            par: postPartial.par || 'GENERAL',
            tipo: postPartial.tipo || 'Neutral',
            contenido: postPartial.contenido || '',
            datosGrafico: postPartial.datosGrafico || [],
            tiempo: 'Ahora',
            ultimaInteraccion: timestamp,
            likes: [], seguidoresPost: [], comentarios: [], compartidos: 0,
            tradingViewUrl: postPartial.tradingViewUrl,
            imagenUrl: postPartial.imagenUrl,
            tags: extractTags(postPartial.contenido || ''),
            reputationSnapshot: user.reputation,
            badgesSnapshot: user.badges,
            comentariosCerrados: postPartial.comentariosCerrados || false,
            zonaOperativa: postPartial.zonaOperativa
        };

        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        localPosts.unshift(newPost);
        setLocalItem('local_posts_db', localPosts);

        user.aportes += 1;
        await UserService.updateUser(user);

        if (userId !== 'guest') {
            const postData = {
                userId,
                titulo: newPost.titulo,
                par: newPost.par,
                tipo: newPost.tipo,
                contenido: newPost.contenido,
                categoria: newPost.categoria,
                esAnuncio: newPost.esAnuncio,
                datosGrafico: newPost.datosGrafico,
                tradingViewUrl: newPost.tradingViewUrl,
                imagenUrl: newPost.imagenUrl,
                zonaOperativa: newPost.zonaOperativa,
                tags: newPost.tags,
                reputationSnapshot: newPost.reputationSnapshot,
                badgesSnapshot: newPost.badgesSnapshot as string[],
                comentariosCerrados: newPost.comentariosCerrados,
                isSignal: postPartial.isSignal,
                signalDetails: postPartial.signalDetails
            };

            BackupManager.createBackup(newPost.id, 'post', 'create', null, compressData(postData), userId);

            if (isOnline) {
                const result = await withRetry(async () => {
                    if (convex) {
                        return await convex.mutation(api.posts.createPost, postData);
                    }
                    throw new Error('Convex no disponible');
                }, `createPost ${newPost.id}`);

                if (result.error) {
                    const isNetworkErr = result.error.includes('no disponible') || result.error.toLowerCase().includes('fetch') || result.error.toLowerCase().includes('network');
                    if (!isNetworkErr) {
                        // Es un error de la aplicación (ej. límite excedido, spam), revertir cambios locales
                        const currentPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
                        setLocalItem('local_posts_db', currentPosts.filter(p => p.id !== newPost.id));
                        
                        // Revertir contadores
                        user.aportes = Math.max(0, user.aportes - 1);
                        await UserService.updateUser(user);

                        return { error: result.error };
                    }

                    await SyncManager.addToQueue({
                        operation: 'create',
                        itemType: 'post',
                        itemId: newPost.id,
                        data: postData,
                    });
                } else if (result.data && (result.data as any).pendingReview) {
                    // Revert local optimistic update since it's going to moderation
                    const currentPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
                    setLocalItem('local_posts_db', currentPosts.filter(p => p.id !== newPost.id));
                    
                    return { error: null, pendingReview: true, reason: (result.data as any).reason };
                }
            } else {
                await SyncManager.addToQueue({
                    operation: 'create',
                    itemType: 'post',
                    itemId: newPost.id,
                    data: postData,
                });
            }
        }
        return { error: null, pendingReview: false };
    },

    updatePost: async (post: Publicacion) => {
        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        const original = localPosts.find(p => p.id === post.id);
        if (original && (post.comentarios?.length || 0) > (original.comentarios?.length || 0)) {
            post.ultimaInteraccion = Date.now();
        }
        
        if (original) {
            BackupManager.createBackup(post.id, 'post', 'update', original, post, 'user');
        }
        
        const updatedLocal = localPosts.map(p => p.id === post.id ? post : p);
        if (!localPosts.find(p => p.id === post.id)) { updatedLocal.unshift(post); }
        setLocalItem('local_posts_db', updatedLocal);

        const isConvexId = post.id && post.id.length >= 15 && !post.id.includes('-');
        if (isConvexId) {
            const postData = {
                id: post.id as Id<"posts">,
                titulo: post.titulo,
                contenido: post.contenido,
                categoria: post.categoria,
                comentarios: post.comentarios as any[],
                comentariosCerrados: post.comentariosCerrados,
                par: post.par,
                tipo: post.tipo,
                zonaOperativa: post.zonaOperativa,
                tags: post.tags,
                imagenUrl: post.imagenUrl,
                isSignal: (post as any).isSignal,
                signalDetails: (post as any).signalDetails
            };

            if (isOnline) {
                const result = await withRetry(async () => {
                    if (convex) {
                        return await convex.mutation(api.posts.updatePost, postData as any);
                    }
                    throw new Error('Convex no disponible');
                }, `updatePost ${post.id}`);

                if (result.error) {
                    await SyncManager.addToQueue({
                        operation: 'update',
                        itemType: 'post',
                        itemId: post.id,
                        data: postData,
                    });
                }
            } else {
                await SyncManager.addToQueue({
                    operation: 'update',
                    itemType: 'post',
                    itemId: post.id,
                    data: postData,
                });
            }
        }
        return { error: null };
    },

    deletePost: async (id: string) => {
        const currentUser = getSessionUser();
        const userId = currentUser?.id;
        
        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        const post = localPosts.find(p => p.id === id);
        if (post) {
            BackupManager.createBackup(id, 'post', 'delete', post, null, 'user');
            const updated = localPosts.map(p => p.id === id ? { ...p, status: 'trash' } : p);
            setLocalItem('local_posts_db', updated);
        }

        const isConvexId = id && id.length >= 15 && !id.includes('-');
        if (isConvexId) {
            if (isOnline) {
                const result = await withRetry(async () => {
                    if (convex) {
                        return await convex.mutation("posts:deletePost" as any, { id, userId });
                    }
                    throw new Error('Convex no disponible');
                }, `deletePost ${id}`);

                if (result.error) {
                    await SyncManager.addToQueue({
                        operation: 'delete',
                        itemType: 'post',
                        itemId: id,
                        data: { id },
                    });
                }
            } else {
                await SyncManager.addToQueue({
                    operation: 'delete',
                    itemType: 'post',
                    itemId: id,
                    data: { id },
                });
            }
        }
    },

    getTrashPosts: async (): Promise<Publicacion[]> => {
        try {
            if (convex) {
                const data = await convex.query(api.posts.getTrashPosts);
                if (data) return data.map((row: any) => ({ id: row._id, ...row }));
            }
        } catch (err) {
            logger.error("Convex Get Trash Posts Error:", err);
        }
        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        return localPosts.filter(p => (p as any).status === 'trash');
    },

    restorePost: async (id: string, userId: string) => {
        const isConvexId = id && id.length >= 15 && !id.includes('-');
        if (convex && isConvexId) {
            try {
                await convex.mutation(api.posts.restorePost, { id: id as Id<"posts">, userId } as any);
            } catch (err) {
                logger.error("Convex Restore Post Error:", err);
            }
        }
    },

    permanentDeletePost: async (id: string, userId: string) => {
        const isConvexId = id && id.length >= 15 && !id.includes('-');
        if (convex && isConvexId) {
            try {
                await convex.mutation(api.posts.permanentDeletePost, { id: id as Id<"posts">, userId } as any);
            } catch (err) {
                logger.error("Convex Permanent Delete Post Error:", err);
            }
        }
    },

    toggleLikePost: async (postId: string, userId: string, authorId: string) => {
        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        const postIndex = localPosts.findIndex(p => p.id === postId);

        const isConvexId = postId && postId.length >= 15 && !postId.includes('-');
        if (convex && isConvexId) {
            try {
                await convex.mutation(api.posts.toggleLike, { id: postId as Id<"posts">, userId } as any);
            } catch (err) {
                logger.error("Convex Toggle Like Error:", err);
            }
        }

        if (postIndex !== -1) {
            const post = localPosts[postIndex];
            const hasLiked = (post.likes || []).includes(userId);
            const newLikes = hasLiked ? post.likes.filter(id => id !== userId) : [...(post.likes || []), userId];
            post.likes = newLikes;
            localPosts[postIndex] = post;
            setLocalItem('local_posts_db', localPosts);

            if (authorId !== userId && !hasLiked) {
                const likerUser = await UserService.getUserById(userId);
                await NotificationService.addNotification(authorId, {
                    tipo: 'like',
                    mensaje: `${likerUser?.nombre || 'Alguien'} le dio like a tu análisis.`,
                    link: postId
                });
            }
        }
    },

    toggleLikeComment: async (postId: string, commentId: string, userId: string) => {
        const isConvexId = postId && postId.length >= 15 && !postId.includes('-');
        if (convex && isConvexId) {
            try {
                await convex.mutation(api.posts.toggleLikeComment, { postId: postId as Id<"posts">, commentId, userId } as any);
            } catch (err) {
                logger.error("Convex Toggle Like Comment Error:", err);
            }
        }

        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        const postIndex = localPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            const post = localPosts[postIndex];
            const updateC = (comments: Comentario[]): Comentario[] =>
                comments.map(c => {
                    if (c.id === commentId) {
                        const hasLiked = (c.likes || []).includes(userId);
                        const newLikes = hasLiked ? c.likes.filter(id => id !== userId) : [...(c.likes || []), userId];
                        return { ...c, likes: newLikes };
                    }
                    if ((c as any).respuestas?.length) return { ...c, respuestas: updateC((c as any).respuestas) };
                    return c;
                });
            post.comentarios = updateC(post.comentarios || []);
            localPosts[postIndex] = post;
            setLocalItem('local_posts_db', localPosts);
        }
    },

    ratePost: async (postId: string, userId: string, score: number): Promise<void> => {
        const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
        const post = localPosts.find(p => p.id === postId);
        if (post) {
            const ratings = (post as any).ratings || [];
            const existingIndex = ratings.findIndex((r: any) => r.userId === userId);
            if (existingIndex > -1) { ratings[existingIndex].score = score; } else { ratings.push({ userId, score }); }
            (post as any).ratings = ratings;
            setLocalItem('local_posts_db', localPosts);
        }
    },

    givePointsToPost: async (postId: string, points: number, userId?: string): Promise<{ success: boolean; newTotal?: number; error?: string }> => {
        try {
            if (convex) {
                const result = await convex.mutation(api.posts.givePoints, { 
                    postId, 
                    points,
                    userId: userId || 'unknown'
                });
                return { success: true, newTotal: result?.newTotal };
            }
            const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
            const postIndex = localPosts.findIndex(p => p.id === postId);
            if (postIndex > -1) {
                const currentPoints = localPosts[postIndex].puntos || 0;
                localPosts[postIndex] = { ...localPosts[postIndex], puntos: currentPoints + points };
                setLocalItem('local_posts_db', localPosts);
                return { success: true, newTotal: currentPoints + points };
            }
            return { success: false, error: 'Post no encontrado' };
        } catch (err: any) {
            logger.error('[PostService] givePointsToPost error:', err);
            return { success: false, error: err.message };
        }
    },
};
