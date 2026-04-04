import { Usuario, BadgeType } from '../../types';
  import { api } from "../../../convex/_generated/api";
import { saveSession, getSession, saveSessionUser, getSessionUser, clearSession as clearSecureSession, isSessionExpired } from '../../utils/sessionManager';
import { isGooglePassword, hashPassword } from '../../utils/passwordHash';
import logger from '../../../lib/utils/logger';
import { getConvexClient } from '../../../lib/convex/client';

const convex = getConvexClient();

type GoogleCredentialPayload = {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
};

const normalizeEmail = (email?: string | null): string => (email || '').toLowerCase().trim();

const padBase64 = (value: string): string => {
    const remainder = value.length % 4;
    return remainder === 0 ? value : value.padEnd(value.length + (4 - remainder), '=');
};

const decodeGoogleCredential = (credentialRes: any): GoogleCredentialPayload => {
    const credential = credentialRes?.credential;
    if (!credential || typeof credential !== 'string') {
        throw new Error('La respuesta de Google no contiene un credential válido.');
    }

    const parts = credential.split('.');
    if (parts.length < 2 || !parts[1]) {
        throw new Error('El credential de Google tiene un formato inválido.');
    }

    const base64 = padBase64(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload) as GoogleCredentialPayload;
};

const buildGoogleUsername = (email: string): string => {
    const localPart = normalizeEmail(email).split('@')[0] || 'google-user';
    const safeLocalPart = localPart.replace(/[^a-z0-9._-]/g, '') || 'google-user';
    return `${safeLocalPart}${Math.floor(Math.random() * 1000)}`;
};

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const mapConvexProfileToUsuario = (profile: any): Usuario => {
    const calculateReputation = (user: Usuario): Usuario => {
        let score = 50;
        score += (user.aportes || 0) * 5;
        score += (user.accuracy || 50) - 50;
        
        const existingBadges = user.badges || [];
        const newBadges = new Set(existingBadges);
        
        if (user.rol === 'admin' || user.rol === 'ceo' || user.esVerificado) {
            newBadges.add('Verified');
        }
        
        if (user.accuracy > 80) newBadges.add('TopAnalyst');
        if (user.saldo > 5000) newBadges.add('Whale');
        if (user.reputation > 80) newBadges.add('Influencer');

        return { ...user, reputation: Math.min(100, Math.max(0, score)), badges: Array.from(newBadges) };
    };

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
        medallas: profile.medallas || [],
        progreso: profile.progreso || {}
    };
    return calculateReputation(basicUser);
};

export const AuthService = {
    getCurrentSession: async (): Promise<Usuario | null> => {
        if (isSessionExpired()) return null;
        
        const user = getSessionUser();
        if (!user) return null;

        (async () => {
            if (convex) {
                try {
                    const profile = await convex.query(api.profiles.getProfile, { userId: user.id });
                    
                    if (!profile) {
                        // If we are here, the query executed but returned nothing.
                        // This usually means the user was deleted or the userId is wrong.
                        logger.warn(`Background Auth: Profile for ${user.id} not found in Convex. Clearing invalid session.`);
                        clearSecureSession();
                        return;
                    }
                    
                    if ((profile as any).isBlocked) {
                        logger.warn("Background Auth: User is blocked. Cleaning session.");
                        clearSecureSession();
                        window.location.reload();
                        return;
                    }
                    
                    const updatedUser = mapConvexProfileToUsuario(profile);
                    saveSessionUser(updatedUser);
                } catch (err) {
                    logger.warn("Background Sync failed (silent):", err);
                }
            }
        })();

        return user;
    },

    login: async (identifier: string, password: string): Promise<{ user: Usuario | null, error: string | null }> => {
        try {
            if (convex) {
                const result = await (convex as any).action(api.auth_actions.validateLoginAction, { identifier, password });
                
                if (result.success && result.user) {
                    const user = mapConvexProfileToUsuario(result.user);
                    const token = `session_${user.id}_${Date.now()}`;
                    saveSession(token, user.id);
                    saveSessionUser(user);
                    return { user, error: null };
                } else {
                    return { user: null, error: result.error || 'Credenciales inválidas.' };
                }
            }
        } catch (err: any) {
            logger.error("Convex Login Error:", err);
            return { user: null, error: err.message || 'Error al iniciar sesión.' };
        }

        return { user: null, error: 'Credenciales inválidas. Si no tienes cuenta, por favor regístrate.' };
    },

    register: async (datos: any, referralCode?: string | null): Promise<{ user: Usuario | null, error: string | null }> => {
        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = datos.email?.toLowerCase()?.trim();
        if (!email || !emailRegex.test(email)) {
            return { user: null, error: 'El correo electrónico no es válido.' };
        }
        if (!datos.nombre || datos.nombre.trim().length < 2) {
            return { user: null, error: 'El nombre debe tener al menos 2 caracteres.' };
        }
        if (!datos.usuario || datos.usuario.trim().length < 3) {
            return { user: null, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(datos.usuario.trim())) {
            return { user: null, error: 'El usuario solo puede contener letras, números y guiones bajos.' };
        }
        if (!datos.password || datos.password.length < 6) {
            return { user: null, error: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        const userId = generateUUID();
        const normalizedUsuario = (datos.usuario || '').trim().toLowerCase();

        try {
            if (convex) {
                const existing = await convex.query(api.profiles.getProfileByUsuario, { usuario: normalizedUsuario });
                if (existing) {
                    const suggestion = `${normalizedUsuario}${Math.floor(Math.random() * 900) + 100}`;
                    return { user: null, error: `El usuario @${normalizedUsuario} ya existe. Prueba @${suggestion}` };
                }
                const existingEmail = await convex.query(api.profiles.getProfileByEmail, { email: datos.email?.toLowerCase()?.trim() });
                if (existingEmail) {
                    return { user: null, error: 'Ya existe una cuenta con ese correo electrónico.' };
                }
            }
        } catch (err: any) {
            logger.warn("Could not check uniqueness in Convex:", err);
        }

        const plainPassword = datos.password;
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

        let passwordHash: string | null = null;
        if (plainPassword) {
            passwordHash = await hashPassword(plainPassword);
        }

        const userForUI: Usuario = calculateReputation({
            id: userId,
            nombre: datos.nombre,
            usuario: normalizedUsuario,
            email: datos.email?.toLowerCase()?.trim(),
            password: passwordHash || plainPassword,
            avatar: datos.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedUsuario}`,
            esPro: datos.esPro || false,
            esVerificado: datos.esVerificado === true,
            rol: datos.rol || 'visitante',
            role: 0, xp: 0, level: 1,
            biografia: '',
            seguidores: [], siguiendo: [],
            aportes: 0, accuracy: 50,
            watchlist: ['BTC/USD', 'EUR/USD'],
            estadisticas: { tasaVictoria: 50, factorBeneficio: 1.2, pnlTotal: 0 },
            saldo: 0, reputation: 50, badges: [],
            fechaRegistro: new Date().toISOString(),
            watchedClasses: [], medallas: [], progreso: { 'is_new_user': true }
        });

        let syncSuccess = false;
        try {
            if (convex) {
                await convex.mutation(api.profiles.upsertProfile, {
                    userId,
                    nombre: userForUI.nombre,
                    usuario: userForUI.usuario,
                    email: userForUI.email,
                    password: userForUI.password,
                    avatar: userForUI.avatar,
                    esPro: userForUI.esPro,
                    esVerificado: userForUI.esVerificado,
                    rol: userForUI.rol,
                    role: userForUI.role || 0,
                    xp: userForUI.xp || 0,
                    level: userForUI.level || 1,
                    seguidores: userForUI.seguidores || [],
                    siguiendo: userForUI.siguiendo || [],
                    aportes: userForUI.aportes || 0,
                    accuracy: userForUI.accuracy || 50,
                    reputation: userForUI.reputation || 50,
                    badges: userForUI.badges || [],
                    estadisticas: userForUI.estadisticas || {},
                    saldo: userForUI.saldo || 0,
                    watchlist: userForUI.watchlist || ['BTC/USD', 'EUR/USD'],
                    watchedClasses: userForUI.watchedClasses || [],
                    progreso: userForUI.progreso || { is_new_user: true },
                    fechaRegistro: userForUI.fechaRegistro,
                    diasActivos: 1,
                    referredBy: referralCode || undefined,
                });
                syncSuccess = true;
                if (referralCode) {
                    logger.info(`[REFERRAL] User registered with referral code: ${referralCode}`);
                }
            }
        } catch (err: any) {
            logger.error("Convex Register Error:", err);
            if (err.message?.includes('ya existe')) {
                return { user: null, error: err.message };
            }
        }

        if (syncSuccess) {
            const token = `session_${userForUI.id}_${Date.now()}`;
            saveSession(token, userForUI.id);
            saveSessionUser(userForUI);
            return { user: userForUI, error: null };
        }

        return { user: null, error: "Error de sincronización con la base de datos. Por favor intenta de nuevo." };
    },

    logout: async () => {
        clearSecureSession();
    },

    handleGoogleSignIn: async (credentialRes: any): Promise<{ user: Usuario | null, error: string | null }> => {
        try {
            const googleUser = decodeGoogleCredential(credentialRes);
            const normalizedEmail = normalizeEmail(googleUser.email);

            if (!normalizedEmail || !googleUser.sub) {
                return { user: null, error: 'El token de Google no contiene los datos mínimos requeridos.' };
            }

            // User profile must exist in Convex (Remote DB)
            try {
                const profile = await convex.query(api.profiles.getProfileByEmail, { 
                    email: normalizedEmail
                });

                if (profile) {
                    logger.info("Google Sign-In: Found existing profile in Convex for", normalizedEmail);
                    const user = mapConvexProfileToUsuario(profile);
                    const token = `session_${user.id}_${Date.now()}`;
                    saveSession(token, user.id);
                    saveSessionUser(user);
                    return { user, error: null };
                }
            } catch (err) {
                logger.error("Google Sign-In: Error checking Convex profile:", err);
                // Continue to register if check fails, but register will likely fail too if user exists
            }

            // 3. Register as new user if not found
            const newUser = {
                nombre: googleUser.name || normalizedEmail.split('@')[0] || 'Usuario Google',
                usuario: buildGoogleUsername(normalizedEmail),
                email: normalizedEmail,
                password: null,
                avatar: googleUser.picture,
                esVerificado: true,
                rol: 'visitante'
            };

            return await AuthService.register(newUser);
        } catch (err: any) {
            return { user: null, error: 'Error en Google Sign-In: ' + (err?.message || 'token inválido') };
        }
    },

    sendPasswordResetEmail: async (email: string): Promise<{ success: boolean, error: string | null }> => {
        try {
            if (convex) {
                const profile = await convex.query(api.profiles.getProfileByEmail, { email });
                if (!profile) return { success: false, error: 'Correo no registrado.' };
                logger.info(`[RECOVERY] Código enviado a: ${email}`);
                return { success: true, error: null };
            }
        } catch (err) {
            logger.error("Recovery Error:", err);
        }
        return { success: false, error: 'Error al enviar código.' };
    },

    resetPassword: async (email: string, newPass: string): Promise<{ success: boolean, error: string | null }> => {
        try {
            if (convex) {
                const profile = await convex.query(api.profiles.getProfileByEmail, { email });
                if (!profile) return { success: false, error: 'Correo no registrado.' };
                const hashedPassword = await hashPassword(newPass);
                await convex.mutation(api.profiles.setNewPassword, { email, password: hashedPassword, userId: (profile as any).userId });
                return { success: true, error: null };
            }
        } catch (err) {
            logger.error("Reset Password Error:", err);
        }
        return { success: false, error: 'Error al actualizar contraseña.' };
    },

    recordLogin: async (userId: string) => {
        if (convex) {
            try {
                const result = await convex.mutation("profiles:recordLogin" as any, { userId });
                logger.info(`[RECORD_LOGIN] Success for userId: ${userId}`, result);
            } catch (err: any) {
                logger.warn("Convex Record Login Error (non-critical):", err?.message || err);
            }
        }
    },

    captureReferralFromUrl: (): string | null => {
        if (typeof window === 'undefined') return null;
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            sessionStorage.setItem('pending_referral_code', refCode);
            return refCode;
        }
        return null;
    },

    getPendingReferralCode: (): string | null => {
        return sessionStorage.getItem('pending_referral_code');
    },

    setPendingReferralCode: (code: string | null) => {
        if (code) {
            sessionStorage.setItem('pending_referral_code', code);
        } else {
            sessionStorage.removeItem('pending_referral_code');
        }
    },

    clearPendingReferralCode: () => {
        sessionStorage.removeItem('pending_referral_code');
    },
};
