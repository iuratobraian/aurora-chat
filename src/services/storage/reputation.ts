import { Usuario, BadgeType } from '../../types';
import { calculateReputation } from './constants';

export const mapConvexProfileToUsuario = (profile: any): Usuario => {
    const basicUser: Usuario = {
        id: profile.userId || profile._id,
        nombre: profile.nombre || 'Usuario',
        usuario: profile.usuario || 'user',
        email: profile.email,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.userId}`,
        esPro: profile.esPro || false,
        esVerificado: profile.esVerificado || false,
        rol: profile.rol || 'visitante',
        role: profile.role ?? 0,
        xp: profile.xp ?? 0,
        level: profile.level ?? 1,
        biografia: profile.biografia || '',
        banner: profile.banner || '',
        instagram: profile.instagram || '',
        seguidores: profile.seguidores || [],
        siguiendo: profile.siguiendo || [],
        aportes: profile.aportes || 0,
        accuracy: profile.accuracy || 50,
        watchlist: profile.watchlist || ['BTC/USD', 'EUR/USD'],
        estadisticas: profile.estadisticas || { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 },
        saldo: profile.saldo || 0,
        reputation: profile.reputation || 50,
        badges: (profile.badges as BadgeType[]) || [],
        fechaRegistro: profile.fechaRegistro || new Date().toISOString(),
        diasActivos: profile.diasActivos || 1,
        ultimoLogin: profile.ultimoLogin || '',
        watchedClasses: profile.watchedClasses || [],
        medallas: profile.medallas || profile.medianas || [],
        medianas: profile.medianas || [],
        progreso: profile.progreso || {}
    };
    return calculateReputation(basicUser);
};
