import { Publicacion, Usuario, Comentario } from '../../types';
import { api } from "../../../convex/_generated/api";
import logger from '../../utils/logger';
import { mapConvexPost, extractTags } from '../../utils/postMapper';
import { convex, isOnline, SyncManager, BackupManager } from './sync';
import { withRetry } from './sync';
import { getLocalItem, setLocalItem, compressData } from './helpers';
import { calculateReputation } from './constants';

export const getTopTraders = async (filter: 'likes' | 'posts' | 'comments' = 'likes'): Promise<Usuario[]> => {
    const { StorageService } = await import('./index');
    const users = await StorageService.getAllUsers();
    const posts = await StorageService.getPosts();
    const userStats: Record<string, any> = {};
    users.forEach(u => { userStats[u.id] = { ...u, totalLikes: 0, totalPosts: 0, totalComments: 0 }; });
    posts.forEach(p => {
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
    }).slice(0, 5) as Usuario[];
};

export const getPosts = async (): Promise<Publicacion[]> => {
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
                    comentarios: row.comentarios || [],
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
            } else {
                localPosts = [];
                setLocalItem('local_posts_db', []);
            }
        }
    } catch (err) {
        logger.error("Convex Get Posts Error:", err);
    }
    const filteredPosts = localPosts.filter((p: any) => {
        if (p.esAnuncio) return false;
        if (p.idUsuario === 'system') return false;
        if (p.idUsuario === 'admin_ads') return false;
        if (p.idUsuario === 'system_seed') return false;
        if (p.idUsuario === 'ai_agent_system') return false;
        if (p.idUsuario === 'ai_sentiment_agent') return false;
        return true;
    });
    return filteredPosts.sort((a, b) => {
        return (b.ultimaInteraccion || 0) - (a.ultimaInteraccion || 0);
    });
};

export const createPost = async (postPartial: Partial<Publicacion>, userId: string): Promise<{ error: string | null; post?: Publicacion }> => {
    const { StorageService } = await import('./index');
    const user = await StorageService.getUserById(userId);
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
    await StorageService.updateUser(user);

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
            comentariosCerrados: newPost.comentariosCerrados
        };

        BackupManager.createBackup(newPost.id, 'post', 'create', null, compressData(postData), userId);

        if (isOnline) {
            try {
                const result = await withRetry(async () => {
                    if (!convex) {
                        throw new Error('Convex client not initialized');
                    }
                    const response = await convex.mutation(api.posts.createPost, postData);
                    logger.info('[POSTS] Mutation response:', response);
                    return response;
                }, `createPost ${newPost.id}`);

                if (result.error) {
                    logger.warn(`[POSTS] Failed to sync post ${newPost.id}:`, result.error);
                    await SyncManager.addToQueue({
                        operation: 'create',
                        itemType: 'post',
                        itemId: newPost.id,
                        data: postData,
                    });
                } else if (result.data) {
                    logger.info(`[POSTS] Post ${newPost.id} synced successfully:`, result.data);
                }
            } catch (err: any) {
                logger.error(`[POSTS] Exception creating post:`, err);
                await SyncManager.addToQueue({
                    operation: 'create',
                    itemType: 'post',
                    itemId: newPost.id,
                    data: postData,
                });
            }

        } else {
            logger.info('[POSTS] Offline, adding post to queue');
            await SyncManager.addToQueue({
                operation: 'create',
                itemType: 'post',
                itemId: newPost.id,
                data: postData,
            });
        }
    }
    return { error: null, post: newPost };
};

export const updatePost = async (post: Publicacion): Promise<{ error: string | null }> => {
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
            id: post.id,
            titulo: post.titulo,
            contenido: post.contenido,
            categoria: post.categoria,
            comentarios: post.comentarios,
            comentariosCerrados: post.comentariosCerrados,
            par: post.par,
            tipo: post.tipo,
            zonaOperativa: post.zonaOperativa,
            tags: post.tags,
            imagenUrl: post.imagenUrl
        };

        if (isOnline) {
            const result = await withRetry(async () => {
                if (convex) {
                    return await convex.mutation(api.posts.updatePost, postData);
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
};

export const deletePost = async (id: string): Promise<void> => {
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
                    return await convex.mutation(api.posts.deletePost, { id });
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
};

export const getTrashPosts = async (): Promise<Publicacion[]> => {
    try {
        if (convex) {
            const data = await convex.query(api.posts.getTrashPosts);
            if (data) return data.map(mapConvexPost);
        }
    } catch (err) {
        logger.error("Convex Get Trash Posts Error:", err);
    }
    const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
    return localPosts.filter(p => (p as any).status === 'trash');
};

export const restorePost = async (id: string): Promise<void> => {
    const isConvexId = id && id.length >= 15 && !id.includes('-');
    if (convex && isConvexId) {
        try {
            await convex.mutation(api.posts.restorePost, { id });
        } catch (err) {
            logger.error("Convex Restore Post Error:", err);
        }
    }
};

export const permanentDeletePost = async (id: string): Promise<void> => {
    const isConvexId = id && id.length >= 15 && !id.includes('-');
    if (convex && isConvexId) {
        try {
            await convex.mutation(api.posts.permanentDeletePost, { id });
        } catch (err) {
            logger.error("Convex Permanent Delete Post Error:", err);
        }
    }
};

export const toggleLikePost = async (postId: string, userId: string, authorId: string): Promise<void> => {
    const { StorageService } = await import('./index');
    const localPosts = getLocalItem<Publicacion[]>('local_posts_db', []);
    const postIndex = localPosts.findIndex(p => p.id === postId);

    const isConvexId = postId && postId.length >= 15 && !postId.includes('-');
    if (convex && isConvexId) {
        try {
            await convex.mutation(api.posts.toggleLike, { id: postId, userId });
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
            const likerUser = await StorageService.getUserById(userId);
            await StorageService.addNotification(authorId, {
                tipo: 'like',
                mensaje: `${likerUser?.nombre || 'Alguien'} le dio like a tu análisis.`,
                link: postId
            });
        }
    }
};

export const toggleLikeComment = async (postId: string, commentId: string, userId: string): Promise<void> => {
    const isConvexId = postId && postId.length >= 15 && !postId.includes('-');
    if (convex && isConvexId) {
        try {
            await convex.mutation(api.posts.toggleLikeComment, { postId, commentId, userId });
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
                if (c.respuestas?.length) return { ...c, respuestas: updateC(c.respuestas) };
                return c;
            });
        post.comentarios = updateC(post.comentarios || []);
        localPosts[postIndex] = post;
        setLocalItem('local_posts_db', localPosts);
    }
};

export const toggleFollowUser = async (myId: string, targetId: string): Promise<void> => {
    const { StorageService } = await import('./index');
    const isMeConvex = myId && myId.length >= 5;
    const isTargetConvex = targetId && targetId.length >= 5;

    if (convex && isMeConvex && isTargetConvex) {
        try {
            await convex.mutation(api.profiles.toggleFollow, { followerId: myId, targetId: targetId });
        } catch (err) {
            logger.error("Convex Toggle Follow Error:", err);
        }
    }

    const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
    let meIndex = localUsers.findIndex(u => u.id === myId);
    let targetIndex = localUsers.findIndex(u => u.id === targetId);

    if (meIndex === -1) {
        const fetchedMe = await StorageService.getUserById(myId);
        if (fetchedMe) { localUsers.push(fetchedMe); meIndex = localUsers.length - 1; }
    }
    if (targetIndex === -1) {
        const fetchedTarget = await StorageService.getUserById(targetId);
        if (fetchedTarget) { localUsers.push(fetchedTarget); targetIndex = localUsers.length - 1; }
    }

    if (meIndex !== -1 && targetIndex !== -1) {
        let me = localUsers[meIndex];
        let target = localUsers[targetIndex];

        if ((me.siguiendo || []).includes(targetId)) {
            me.siguiendo = (me.siguiendo || []).filter(id => id !== targetId);
            target.seguidores = (target.seguidores || []).filter(id => id !== myId);
        } else {
            if (!(me.siguiendo || []).includes(targetId)) me.siguiendo = [...(me.siguiendo || []), targetId];
            if (!(target.seguidores || []).includes(myId)) target.seguidores = [...(target.seguidores || []), myId];
            StorageService.addNotification(targetId, {
                tipo: 'follow', mensaje: `${me.nombre} comenzó a seguirte.`, avatarUrl: me.avatar, link: myId
            });
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
};
