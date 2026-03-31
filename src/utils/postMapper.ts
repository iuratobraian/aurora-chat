import { Publicacion, CategoriaPost, Comentario, ConvexPost } from '../types';

const DEFAULT_AVATAR_URL = (seed: string) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export function extractTags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
}

export function mapConvexPost(p: ConvexPost): Publicacion {
    const contenido = p.contenido || '';
    const userId = p.userId;
    
    return {
        id: p._id,
        idUsuario: userId,
        nombreUsuario: 'Usuario',
        usuarioManejo: 'user',
        avatarUsuario: DEFAULT_AVATAR_URL(userId),
        esPro: false,
        esVerificado: false,
        esAnuncio: p.esAnuncio || false,
        categoria: (p.categoria || 'General') as CategoriaPost,
        accuracyUser: 50,
        authorFollowers: 0,
        titulo: p.titulo || '',
        par: p.par || 'GENERAL',
        tipo: (p.tipo as 'Compra' | 'Venta' | 'Neutral') || 'Neutral',
        contenido,
        datosGrafico: p.datosGrafico || [],
        tiempo: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recién',
        ultimaInteraccion: p.ultimaInteraccion || p.createdAt || Date.now(),
        likes: p.likes || [],
        seguidoresPost: [],
        comentarios: (p.comentarios || []) as Comentario[],
        compartidos: p.compartidos || 0,
        tradingViewUrl: p.tradingViewUrl,
        imagenUrl: p.imagenUrl,
        videoUrl: undefined,
        tags: p.tags || extractTags(contenido),
        zonaOperativa: p.zonaOperativa as Publicacion['zonaOperativa'],
        status: (p.status as 'active' | 'trash') || 'active',
        isAiAgent: p.isAiAgent,
        fuente: undefined,
        sentiment: p.sentiment,
    };
}
