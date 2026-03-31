import { Usuario } from '../../types';
import { api } from "../../../convex/_generated/api";
import logger from '../../utils/logger';
import { hashPassword, verifyPassword, isHashed, isGooglePassword } from '../../utils/passwordHash';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '../../utils/rateLimiter';
import { convex } from './sync';
import { getLocalItem, setLocalItem, generateUUID } from './helpers';
import { calculateReputation } from './constants';
import { mapConvexProfileToUsuario } from './reputation';
import { getSessionUser, saveSessionUser, clearSession, saveSession } from '../../utils/sessionManager';

export const getCurrentSession = async (): Promise<Usuario | null> => {
    const user = getSessionUser();
    if (!user) return null;

    (async () => {
        if (convex) {
            try {
                const profile = await convex.query(api.profiles.getProfile, { userId: user.id });
                if (profile) {
                    if ((profile as any).isBlocked) {
                        logger.warn("Background Auth: User is blocked. Cleaning session.");
                        clearSession();
                        window.location.reload();
                        return;
                    }
                    const updatedUser = mapConvexProfileToUsuario(profile);
                    saveSessionUser(updatedUser);
                }
            } catch (err) {
                logger.warn("Background Sync failed (silent):", err);
            }
        }
    })();

    return user;
};

export const login = async (identifier: string, password: string): Promise<{ user: Usuario | null, error: string | null }> => {
    const rateLimitKey = identifier.trim().toLowerCase();
    const rateLimit = checkRateLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
        return { user: null, error: `Demasiados intentos. Espera ${rateLimit.waitSeconds} segundos.` };
    }
    
    try {
        if (convex) {
            const normalizedId = identifier.trim().toLowerCase();
            let profile = await convex.query(api.profiles.getProfileByUsuario, { usuario: normalizedId });
            if (!profile && normalizedId.includes('@')) {
                profile = await convex.query(api.profiles.getProfileByEmail, { email: normalizedId });
            }

            if (profile) {
                if ((profile as any).isBlocked) {
                    return { user: null, error: 'Tu cuenta ha sido bloqueada por violar los términos de servicio.' };
                }
                const storedPassword = profile.password;
                let passwordsMatch = false;
                
                if (storedPassword) {
                    if (isGooglePassword(storedPassword)) {
                        passwordsMatch = storedPassword === 'google_oauth_protected_' + (profile as any).googleSub || storedPassword === password;
                    } else if (isHashed(storedPassword)) {
                        passwordsMatch = await verifyPassword(password, storedPassword);
                    } else {
                        passwordsMatch = storedPassword === password || storedPassword.trim() === password.trim();
                    }
                }
                
                if (passwordsMatch) {
                    clearRateLimit(rateLimitKey);
                    const user = mapConvexProfileToUsuario(profile);
                    const token = `session_${user.id}_${Date.now()}`;
                    saveSession(token, user.id);
                    saveSessionUser(user);
                    return { user, error: null };
                } else {
                    recordFailedAttempt(rateLimitKey);
                    return { user: null, error: 'Contraseña incorrecta.' };
                }
            }
        }
    } catch (err) {
        logger.error("Convex Login Error:", err);
    }

    const lowerIdentifier = identifier.trim().toLowerCase();
    const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
    const localUser = localUsers.find(u => 
        u.email?.toLowerCase() === lowerIdentifier || 
        u.usuario?.toLowerCase() === lowerIdentifier
    );
    
    let localPasswordsMatch = false;
    if (localUser?.password) {
        if (isGooglePassword(localUser.password)) {
            localPasswordsMatch = localUser.password === 'google_oauth_protected_';
        } else if (isHashed(localUser.password)) {
            localPasswordsMatch = await verifyPassword(password, localUser.password);
        } else {
            localPasswordsMatch = localUser.password === password || localUser.password.trim() === password.trim();
        }
    }
    
    if (localUser && localPasswordsMatch) {
        clearRateLimit(rateLimitKey);
        const token = `session_${localUser.id}_${Date.now()}`;
        saveSession(token, localUser.id);
        saveSessionUser(localUser);
        return { user: localUser, error: null };
    }

    recordFailedAttempt(rateLimitKey);
    return { user: null, error: 'Credenciales inválidas. Si no tienes cuenta, por favor regístrate.' };
};

export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean, error: string | null }> => {
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
};

export const resetPassword = async (email: string, newPass: string): Promise<{ success: boolean, error: string | null }> => {
    try {
        if (convex) {
            const hashedPassword = await hashPassword(newPass);
            await convex.mutation(api.profiles.setNewPassword, { email, password: hashedPassword });
            return { success: true, error: null };
        }
    } catch (err) {
        logger.error("Reset Password Error:", err);
    }
    return { success: false, error: 'Error al actualizar contraseña.' };
};

export const register = async (datos: any): Promise<{ user: Usuario | null, error: string | null }> => {
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
    } catch (err) {
        logger.warn("Could not check uniqueness in Convex, falling back to local:", err);
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        if (localUsers.find(u => u.usuario?.toLowerCase() === normalizedUsuario)) {
            const suggestion = `${normalizedUsuario}${Math.floor(Math.random() * 900) + 100}`;
            return { user: null, error: `El usuario @${normalizedUsuario} ya existe. Prueba @${suggestion}` };
        }
    }

    const hashedPassword = datos.password ? await hashPassword(datos.password) : undefined;

    const userForUI: Usuario = calculateReputation({
        id: userId,
        nombre: datos.nombre,
        usuario: normalizedUsuario,
        email: datos.email?.toLowerCase()?.trim(),
        password: hashedPassword,
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
        watchedClasses: [], medallas: [], medianas: [], progreso: { 'is_new_user': true }
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
                rol: userForUI.rol,
                role: 0,
                xp: 0,
                level: 1,
                esPro: userForUI.esPro,
                esVerificado: userForUI.esVerificado === true,
                avatar: userForUI.avatar,
                biografia: '',
                seguidores: [], siguiendo: [],
                aportes: 0, accuracy: 50, reputation: 50, saldo: 0,
                estadisticas: userForUI.estadisticas,
                fechaRegistro: userForUI.fechaRegistro!,
                progreso: userForUI.progreso
            });
            syncSuccess = true;
        }
    } catch (err) {
        logger.error("Convex Register Error:", err);
    }

    if (syncSuccess || !convex) {
        const localUsers = getLocalItem<Usuario[]>('local_users_db', []);
        if (!localUsers.find(u => u.email === userForUI.email)) {
            localUsers.push(userForUI);
            setLocalItem('local_users_db', localUsers);
        }
        localStorage.setItem('local_session_user', JSON.stringify(userForUI));
        return { user: userForUI, error: null };
    }

    return { user: null, error: "Error de sincronización con la base de datos. Por favor intenta de nuevo." };
};

export const logout = async (): Promise<void> => {
    localStorage.removeItem('local_session_user');
};

export const recordLogin = async (userId: string) => {
    if (convex) {
        try {
            await convex.mutation(api.profiles.recordLogin, { userId });
        } catch (err) {
            logger.error("Convex Record Login Error:", err);
        }
    }
};

export const handleGoogleSignIn = async (credentialRes: any): Promise<{ user: Usuario | null, error: string | null }> => {
    try {
        const base64Url = credentialRes.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const googleUser = JSON.parse(jsonPayload);

        let profile = null;
        if (convex) {
            profile = await convex.query(api.profiles.getProfileByEmail, { email: googleUser.email });
        }

        if (!profile) {
            const registerResult = await register({
                nombre: googleUser.name,
                usuario: googleUser.email.split('@')[0],
                email: googleUser.email,
                password: null,
                avatar: googleUser.picture,
                esVerificado: true,
            });
            return registerResult;
        }

        const user = mapConvexProfileToUsuario(profile);
        localStorage.setItem('local_session_user', JSON.stringify(user));
        return { user, error: null };
    } catch (err) {
        logger.error("Google Sign-In Error:", err);
        return { user: null, error: 'Error al iniciar sesión con Google.' };
    }
};
