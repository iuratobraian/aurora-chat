import React, { useEffect, useState } from 'react';
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from '../../components/ToastProvider';
import ElectricLoader from '../../components/ElectricLoader';

export const InstagramCallback = () => {
    const exchangeCode = useAction(api["instagram/accounts"].exchangeCodeForToken);
    const getBusinessAccount = useAction(api["instagram/accounts"].getInstagramBusinessAccount);
    const connectAccount = useMutation(api["instagram/accounts"].connectInstagramAccount);
    const { showToast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const storedUser = localStorage.getItem('user_session');
            const userId = storedUser ? JSON.parse(storedUser).id : null;

            if (!code) {
                setStatus('error');
                setErrorMsg('No se recibió código de autorización de Instagram.');
                return;
            }

            if (!userId) {
                setStatus('error');
                setErrorMsg('Sesión de usuario no encontrada.');
                return;
            }

            try {
                // 1. Intercambiar código por Access Token
                const tokenData = await exchangeCode({ code });
                
                // 2. Obtener cuenta de Instagram Business vinculada
                const igAccount = await getBusinessAccount({ accessToken: tokenData.accessToken });
                
                // 3. Conectar en Convex
                await connectAccount({
                    userId,
                    instagramId: igAccount.instagramId,
                    username: igAccount.username,
                    accessToken: tokenData.accessToken,
                    pageAccessToken: igAccount.pageAccessToken,
                    profilePicture: igAccount.profilePicture,
                    biography: igAccount.biography,
                    website: igAccount.website,
                    followers: igAccount.followers,
                    isBusiness: true,
                });

                setStatus('success');
                showToast('success', '¡Cuenta de Instagram conectada correctamente!');
                
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: { detail: 'conexiones' } }));
                }, 1500);

            } catch (err: any) {
                console.error('Error connecting Instagram:', err);
                setStatus('error');
                setErrorMsg(err.message || 'Error desconocido al conectar con Instagram.');
                showToast('error', 'Fallo al conectar con Instagram.');
            }
        };

        handleCallback();
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
                <ElectricLoader />
                <h2 className="mt-8 text-xl font-bold text-white animate-pulse">Sincronizando con Instagram...</h2>
                <p className="mt-2 text-gray-500 text-sm">Validando credenciales y obteniendo cuenta de Business.</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-vh-60 text-center p-10">
                <div className="size-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
                    <span className="material-symbols-outlined text-3xl">error</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Error de Conexión</h2>
                <p className="mt-2 text-gray-400 max-w-sm mx-auto">{errorMsg}</p>
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'configuracion' }))}
                    className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all text-xs uppercase"
                >
                    Volver a Ajustes
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-vh-60 text-center p-10 animate-in zoom-in duration-700">
            <div className="size-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-lg shadow-cyan-500/20">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                ¡Conexión Exitosa!
            </h2>
            <p className="mt-2 text-gray-400">Tu cuenta de Instagram ya está vinculada a TradeHub.</p>
            <p className="mt-6 text-[10px] text-cyan-500 font-black animate-pulse uppercase tracking-widest">
                Redirigiendo...
            </p>
        </div>
    );
};

export default InstagramCallback;
