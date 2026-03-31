import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { StorageService } from '../services/storage';
import { PostimgService } from '../services/postimg';
import { useToast } from '../components/ToastProvider';
import { PushPreferences } from '../components/PushPreferences';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { InstagramConnect, InstagramAccountCard } from '../components/instagram';

interface ConfiguracionProps {
    usuario: Usuario | null;
    onUpdateUser?: (u: Usuario) => void;
}

const ConfiguracionView: React.FC<ConfiguracionProps> = ({ usuario, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'perfil' | 'seguridad' | 'notificaciones' | 'conexiones'>('general');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const { showToast } = useToast();

    // Profile State
    const [nombre, setNombre] = useState(usuario?.nombre || '');
    const [biografia, setBiografia] = useState(usuario?.biografia || '');
    const [avatarUrl, setAvatarUrl] = useState(usuario?.avatar || '');
    const [instagram, setInstagram] = useState(usuario?.instagram || '');
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre);
            setBiografia(usuario.biografia || '');
            setAvatarUrl(usuario.avatar);
            setInstagram(usuario.instagram || '');
        }
    }, [usuario]);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        const root = document.documentElement;
        if (newTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
            root.classList.toggle('light', !prefersDark);
        } else {
            root.classList.toggle('dark', newTheme === 'dark');
            root.classList.toggle('light', newTheme === 'light');
        }
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                const root = document.documentElement;
                root.classList.toggle('dark', e.matches);
                root.classList.toggle('light', !e.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const handleSaveProfile = async () => {
        if (!usuario) return;
        const updated = {
            ...usuario,
            nombre,
            biografia,
            avatar: avatarUrl,
            instagram
        };
        await StorageService.updateUser(updated);
        if (onUpdateUser) onUpdateUser(updated);
        setSaveStatus('Perfil actualizado correctamente');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    if (!usuario) return <div className="p-10 text-center text-gray-500">Inicia sesión para configurar tu cuenta.</div>;

    return (
        <div className="max-w-[1600px] mx-auto px-4 pt-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Ajustes</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'perfil' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('seguridad')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'seguridad' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Seguridad
                    </button>
                    <button
                        onClick={() => setActiveTab('notificaciones')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'notificaciones' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Notificaciones
                    </button>
                    <button
                        onClick={() => setActiveTab('conexiones')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'conexiones' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Conexiones
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <div className="bg-white dark:bg-black/40 rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm">

                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-4">Apariencia</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            onClick={() => handleThemeChange('light')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                                        >
                                            <span className="material-symbols-outlined text-2xl text-orange-500">light_mode</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">Claro</span>
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('dark')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                                        >
                                            <span className="material-symbols-outlined text-2xl text-blue-400">dark_mode</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">Oscuro</span>
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('system')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                                        >
                                            <span className="material-symbols-outlined text-2xl text-purple-500">contrast</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">Sistema</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'perfil' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-4">Información Pública</h3>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre Visible</label>
                                    <input
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Biografía</label>
                                    <textarea
                                        value={biografia}
                                        onChange={(e) => setBiografia(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none h-24 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Avatar URL</label>
                                    <div className="flex gap-4 mt-1">
                                        <img src={avatarUrl} className="size-10 rounded-full bg-gray-100 dark:bg-white/5" alt="" />
                                        <input
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
                                            placeholder="URL de la imagen o sube una..."
                                        />
                                        <input 
                                            type="file" 
                                            id="avatar-upload"
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const url = await PostimgService.uploadImage(file);
                                                        setAvatarUrl(url);
                                                    } catch (err) {
                                                        showToast('error', 'Error al subir la imagen');
                                                    }
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="avatar-upload"
                                            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">upload</span>
                                            Subir
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Instagram Link</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            placeholder="https://instagram.com/usuario"
                                            className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                if (!instagram) return;
                                                const match = instagram.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/);
                                                const username = match ? match[1] : instagram.replace('@', '');
                                                if (username) {
                                                    setAvatarUrl(`https://unavatar.io/instagram/${username}`);
                                                }
                                            }}
                                            className="px-4 py-2 bg-pink-600/20 text-pink-500 hover:bg-pink-600 hover:text-white border border-pink-600/30 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                                            title="Extraer foto de perfil de Instagram"
                                        >
                                            <span className="material-symbols-outlined text-[14px] align-middle mr-1">photo_camera</span>
                                            Usar Foto
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
                                >
                                    Guardar Cambios
                                </button>
                                {saveStatus && <p className="text-xs text-green-500 font-bold mt-2">{saveStatus}</p>}
                            </div>
                        )}

                        {activeTab === 'seguridad' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-4">Seguridad de la Cuenta</h3>
                                <p className="text-xs text-gray-500">La gestión de contraseñas y sesiones se realiza localmente. Próximamente podrás cambiar tu contraseña desde aquí.</p>
                                <button className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5">
                                    Cambiar Contraseña
                                </button>
                            </div>
                        )}

                        {activeTab === 'notificaciones' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-4">Notificaciones Push</h3>
                                <p className="text-xs text-gray-500 mb-4">Recibe alertas en tiempo real directamente en tu navegador cuando recibas nuevas notificaciones.</p>
                                {usuario && (
                                    <PushPreferences userId={usuario.id} />
                                )}
                            </div>
                        )}

                        {activeTab === 'conexiones' && (
                            <ConnectionsSection usuario={usuario} />
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

const ConnectionsSection: React.FC<{ usuario: Usuario | null }> = ({ usuario }) => {
    const [connecting, setConnecting] = useState(false);
    const authUrl = useQuery(api["instagram/accounts"].getInstagramAuthUrl, {});
    const instagramAccounts = useQuery(api["instagram/accounts"].getUserInstagramAccounts, { 
        userId: usuario?.id || 'skip',
    });

    const handleConnectInstagram = () => {
        if (!authUrl || authUrl.includes('undefined')) {
            alert('⚠️ Instagram no está configurado.\n\nPara conectar Instagram necesitas:\n1. Crear una app en https://developers.facebook.com\n2. Agregar el producto "Instagram Graph API"\n3. Configurar estas variables en Vercel:\n   • INSTAGRAM_APP_ID\n   • INSTAGRAM_APP_SECRET\n   • INSTAGRAM_REDIRECT_URI\n\nConsulta .env.example para ver las variables requeridas.');
            return;
        }
        setConnecting(true);
        sessionStorage.setItem('postAuthRedirectPath', window.location.pathname + window.location.search);
        window.location.href = authUrl;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-2">Cuentas Vinculadas</h3>
                <p className="text-xs text-gray-500 mb-6">Gestiona las conexiones de tus redes sociales para automatizar tu marketing.</p>
                
                <div className="grid grid-cols-1 gap-6">
                    {/* Instagram Connection */}
                    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                                    <span className="material-symbols-outlined text-2xl">camera</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Instagram Business</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Estado: {instagramAccounts && instagramAccounts.length > 0 ? 'Conectado' : 'No vinculado'}</p>
                                </div>
                            </div>
                        </div>

                                {instagramAccounts && instagramAccounts.length > 0 ? (
                            <div className="space-y-3">
                                {instagramAccounts.map((acc: any) => (
                                    <InstagramAccountCard 
                                        key={acc._id} 
                                        account={{
                                            id: acc._id,
                                            username: acc.username,
                                            avatarUrl: acc.profilePicture,
                                            followers: acc.followers || 0,
                                            posts: acc.posts || 0,
                                            status: acc.isConnected ? 'connected' : 'disconnected'
                                        }} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl">
                                <p className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-widest">Conecta tu cuenta para empezar</p>
                                <button
                                    onClick={handleConnectInstagram}
                                    disabled={connecting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50"
                                >
                                    {connecting ? 'Redirigiendo...' : 'Vincular Instagram'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Meta Threads (Placeholder) */}
                    <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 opacity-60">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                                    <span className="material-symbols-outlined text-2xl">alternate_email</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Meta Threads</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Próximamente</p>
                                </div>
                            </div>
                            <button disabled className="px-4 py-2 border border-gray-300 dark:border-white/20 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Inactivo</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionView;
