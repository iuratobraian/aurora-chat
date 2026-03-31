import React, { useState, useEffect, useCallback, memo } from 'react';
import { Usuario, Publicacion, Comentario } from '../types';
import { StorageService } from '../services/storage';
import { PostimgService } from '../services/postimg';
import PostCard from '../components/PostCard';
import { XPBar, LevelBadge, AchievementBadge, AchievementInfo, AchievementUnlockAnimation, AchievementProgress } from '../components/Gamification';
import { useToast } from '../components/ToastProvider';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import LanguageSelector from '../components/LanguageSelector';
import AppearancePanel from '../components/AppearancePanel';
import { BookReader } from '../components/BookReader';
import logger from '../utils/logger';
import { Avatar } from '../components/Avatar';
import { 
    ProfilePostsTab,
    ProfileMedalsTab, 
    ProfileCommunitiesTab, 
    ProfileConfigTab, 
    ProfileModTab,
    ProfileComprasTab,
    ProfileBibliotecaTab
} from './profile';

interface PerfilProps {
    usuario: Usuario;
    onUpdate: (u: Usuario) => void;
    viewingUserId?: string;
    onNavigate?: (tab: string) => void;
}

const PerfilView: React.FC<PerfilProps> = ({ usuario, onUpdate, viewingUserId, onNavigate }) => {
    const [profileUser, setProfileUser] = useState<Usuario>(usuario);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'medallas' | 'comunidades' | 'config' | 'mod' | 'compras' | 'biblioteca'>('posts');
    const [userPosts, setUserPosts] = useState<Publicacion[]>([]);
    const [allPlatformPosts, setAllPlatformPosts] = useState<Publicacion[]>([]);
    const [selectedBook, setSelectedBook] = useState<{ title: string; fileUrl: string } | null>(null);
    const isAdminMode = usuario.rol === 'admin' || usuario.rol === 'ceo';
    const isOwnProfile = !viewingUserId || viewingUserId === usuario.id;
    const { showToast } = useToast();

    const [isFollowingLocal, setIsFollowingLocal] = useState((usuario.siguiendo || []).includes(viewingUserId || ''));

    const userCommunitiesQuery = useQuery(api.communities.getUserCommunities, { userId: profileUser?.id || '' });
    const creatorCommunities = userCommunitiesQuery?.filter((c: any) => c.ownerId === profileUser?.id) || [];
    const traderVerification = useQuery(api.traderVerification.getVerificationStatus, { oderId: profileUser?.id || '' });
    const userBookLibrary = useQuery(api.strategies.getUserBookLibrary, { userId: usuario?.id || '' });

    const [userProgress, setUserProgress] = useState<any>(null);
    const [userAchievements, setUserAchievements] = useState<AchievementInfo[]>([]);
    const [achievementsProgress, setAchievementsProgress] = useState<AchievementInfo[]>([]);
    const [unlockingAchievement, setUnlockingAchievement] = useState<AchievementInfo | null>(null);

    const [nombre, setNombre] = useState('');
    const [biografia, setBiografia] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [bannerUrl, setBannerUrl] = useState('');
    const [instagram, setInstagram] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [seedSearch, setSeedSearch] = useState('');
    const [instagramUserForAvatar, setInstagramUserForAvatar] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            let targetUser = usuario;

            if (viewingUserId && viewingUserId !== usuario.id) {
                setLoading(true);
                const found = await StorageService.getUserById(viewingUserId);
                if (found) {
                    targetUser = found;
                }
                setLoading(false);
            }

            setProfileUser(targetUser);
            if (isOwnProfile) {
                setNombre(targetUser.nombre);
                setBiografia(targetUser.biografia || '');
                setAvatarUrl(targetUser.avatar);
                setBannerUrl(targetUser.banner || '');
                setInstagram(targetUser.instagram || '');
            }

            const allPosts = await StorageService.getPosts();
            setUserPosts(allPosts.filter(p => p.idUsuario === targetUser.id));
            if (usuario.rol === 'admin' || usuario.rol === 'ceo') {
                setAllPlatformPosts(allPosts);
            }
        };
        fetchProfile();
    }, [viewingUserId, usuario.id, isOwnProfile]);

    useEffect(() => {
        setIsFollowingLocal((usuario.siguiendo || []).includes(profileUser.id));
    }, [usuario.siguiendo, profileUser.id]);

    useEffect(() => {
        const fetchGamification = async () => {
            if (!isOwnProfile) return;
            
            const progress = await StorageService.getUserProgress(usuario.id);
            setUserProgress(progress);

            const achievements = await StorageService.getUserAchievements(usuario.id);
            const unlockedAchievements = achievements.map((a: any) => ({
                id: a.achievementId,
                name: a.achievement?.name || 'Logro',
                icon: a.achievement?.icon || '🏆',
                desc: a.achievement?.description || a.achievement?.desc || '',
                category: a.achievement?.category,
                points: a.achievement?.points,
                rarity: a.achievement?.rarity || 'common',
                unlocked: true,
                unlockedAt: a.unlockedAt
            }));
            setUserAchievements(unlockedAchievements);

            const progressData = await StorageService.getAchievementProgress(usuario.id);
            setAchievementsProgress(
                progressData.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    icon: a.icon,
                    desc: a.description,
                    category: a.category,
                    points: a.points,
                    rarity: a.rarity || 'common',
                    unlocked: false,
                    progress: a.progress,
                    current: a.current,
                    target: a.target,
                }))
            );
        };
        fetchGamification();
    }, [isOwnProfile, usuario.id]);

    const guardarCambios = async () => {
        if (!isOwnProfile) return;
        const updated = {
            ...usuario,
            nombre,
            biografia,
            avatar: avatarUrl,
            banner: bannerUrl,
            instagram,
        };

        await StorageService.updateUser(updated);
        onUpdate(updated);
        setSaveStatus('Perfil Actualizado');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleFollowToggle = useCallback(async () => {
        if (!usuario || !profileUser || loadingFollow) return;
        setLoadingFollow(true);
        try {
            await StorageService.toggleFollowUser(usuario.id, profileUser.id);
            setIsFollowingLocal(!isFollowingLocal);
            const updatedUser = await StorageService.getCurrentSession();
            if (updatedUser) onUpdate(updatedUser);
        } finally {
            setTimeout(() => setLoadingFollow(false), 800);
        }
    }, [usuario, profileUser, loadingFollow, onUpdate]);

    const avatarSeeds = ['Felix', 'Aneka', 'Zac', 'Lola', 'Jack', 'Eden', 'Maria', 'Max', 'Luna', 'Oliver'];
    const filteredSeeds = seedSearch ? avatarSeeds.concat(seedSearch) : avatarSeeds;

    const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const url = await PostimgService.uploadImage(file);
            setAvatarUrl(url);
        } catch (error) {
            logger.error("Error al subir avatar:", error);
            showToast('error', "Error al subir la imagen. Por favor intenta de nuevo.");
        } finally {
            setIsUploadingAvatar(false);
        }
    }, [showToast]);

    const handleFetchInstagramAvatar = useCallback(() => {
        if (instagramUserForAvatar.trim()) {
            setAvatarUrl(instagramUserForAvatar.replace('@', ''));
            showToast('info', "Políticas de Meta bloquean la extracción directa. Se ha generado un avatar en su lugar.");
        }
    }, [instagramUserForAvatar, showToast]);

    const handleDeletePost = useCallback(async (postId: string) => {
        if (!window.confirm('¿Eliminar esta publicación?')) return;
        try {
            await StorageService.deletePost(postId);
            setUserPosts(prev => prev.filter(p => p.id !== postId));
            showToast('success', 'Publicación eliminada');
        } catch (error) {
            logger.error('Error al eliminar post:', error);
            showToast('error', 'Error al eliminar la publicación');
        }
    }, [showToast]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="glass rounded-2xl p-8 text-center">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60 font-bold animate-pulse">Cargando perfil...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto px-4 pt-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header - Premium Glass Style */}
            <div className="glass rounded-3xl overflow-hidden mb-6 group/profile shadow-2xl shadow-black/50">
                {/* Banner with Logros Overlay - Taller for wider layout */}
                <div 
                    className="h-56 md:h-72 w-full relative bg-cover bg-center"
                    style={{ backgroundImage: profileUser.banner ? `url(${profileUser.banner})` : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-signal-green/5" />
                    
                    {/* Floating Achievements in Banner */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {profileUser.medallas?.slice(0, 3).map(m => (
                            <div 
                                key={m.id} 
                                title={m.nombre} 
                                className="size-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg shadow-black/50 hover:scale-110 hover:border-primary/30 transition-all duration-300 cursor-pointer group/badge"
                            >
                                <span className="text-2xl group-hover/badge:scale-110 transition-transform">{m.icono}</span>
                            </div>
                        ))}
                        {(profileUser.medallas?.length || 0) > 3 && (
                            <div className="size-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-black/50 hover:scale-110 transition-all">
                                +{(profileUser.medallas?.length || 0) - 3}
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Info - Enhanced for wider layout */}
                <div className="px-6 md:px-12 pb-8 relative -mt-20">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6 relative z-10">
                        <div className="relative group/avatar-container">
                            <Avatar
                                src={isOwnProfile ? avatarUrl : profileUser.avatar}
                                name={profileUser.nombre}
                                seed={profileUser.usuario}
                                size="2xl"
                                rounded="full"
                                frame={profileUser.avatarFrame}
                                className="border-4 border-white/10 shadow-[0_0_40px_rgba(0,122,255,0.3)] hover:scale-105 transition-all duration-500 group-hover/avatar-container:shadow-[0_0_60px_rgba(0,122,255,0.5)]"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover/avatar-container:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                                        <h1 className="text-2xl md:text-4xl font-black text-white">{profileUser.nombre}</h1>
                                        <div className="flex items-center gap-2">
                                            {profileUser.esPro && (
                                                <span className="bg-signal-green/20 text-signal-green px-3 py-1 rounded-xl text-xs font-black border border-signal-green/30 shadow-lg shadow-signal-green/10">PRO</span>
                                            )}
                                            {profileUser.rol !== 'user' && (
                                                <span className="bg-primary/20 text-primary px-3 py-1 rounded-xl text-xs font-black border border-primary/30 shadow-lg shadow-primary/10 uppercase">
                                                    {profileUser.rol.replace('_', ' ')}
                                                </span>
                                            )}
                                            {traderVerification?.kycStatus === 'approved' && (
                                                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-xl text-xs font-black border border-purple-500/30 shadow-lg shadow-purple-500/10 flex items-center gap-1">
                                                    <span>✓</span> KYC
                                                </span>
                                            )}
                                            {traderVerification?.brokerConnected && (
                                                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-xl text-xs font-black border border-yellow-500/30 shadow-lg shadow-yellow-500/10 flex items-center gap-1.5 animate-pulse-slow">
                                                    <div className="size-1.5 bg-yellow-400 rounded-full animate-pulse" />
                                                    <span>🏅</span> Trading
                                                    {traderVerification.brokerName && (
                                                        <span className="text-yellow-400/60 font-normal ml-1">
                                                            • {traderVerification.brokerName}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                            {traderVerification?.level === 'institutional' && (
                                                <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-xl text-xs font-black border border-amber-500/30 shadow-lg shadow-amber-500/10 flex items-center gap-1">
                                                    <span>🏛️</span> Institucional
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-white/50">@{profileUser.usuario}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    {isOwnProfile ? (
                                        <button
                                            onClick={() => setActiveTab('config')}
                                            className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/5 text-white font-bold rounded-xl text-sm transition-all border border-white/10 hover:border-white/20 shadow-lg shadow-black/20 hover:scale-105"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                Editar Perfil
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={loadingFollow}
                                            className={`flex-1 md:flex-none px-8 py-3 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${loadingFollow ? 'animate-electric ring-2 ring-primary/50 cursor-wait' : ''} ${isFollowingLocal
                                                ? 'bg-signal-green/20 text-signal-green hover:bg-red-500/20 hover:text-red-400 border border-signal-green/30 shadow-signal-green/20 hover:scale-105'
                                                : 'bg-primary hover:bg-blue-600 text-white shadow-primary/30 hover:shadow-primary/50 hover:scale-105 border border-primary/50'
                                                }`}
                                        >
                                            {loadingFollow ? (
                                                <><span className="material-symbols-outlined text-[18px] animate-spin">sync</span> Procesando...</>
                                            ) : isFollowingLocal ? (
                                                <><span className="material-symbols-outlined text-[18px]">check_circle</span> Siguiendo</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-[18px]">person_add</span> Seguir</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="flex justify-center md:justify-start gap-4 mb-4">
                                <div className="glass px-6 py-4 rounded-2xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all group/stat cursor-default">
                                    <span className="block text-2xl font-black text-white group-hover/stat:text-primary transition-colors">{userPosts.length}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Posts</span>
                                </div>
                                <div className="glass px-6 py-4 rounded-2xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all group/stat cursor-default">
                                    <span className="block text-2xl font-black text-white group-hover/stat:text-primary transition-colors">{profileUser.seguidores?.length || 0}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Seguidores</span>
                                </div>
                                <div className="glass px-6 py-4 rounded-2xl border border-white/10 hover:border-signal-green/30 hover:bg-white/5 transition-all group/stat cursor-default" title="Días totales que has iniciado sesión en la plataforma">
                                    <span className="block text-2xl font-black px-2 flex items-center gap-1 text-signal-green group-hover/stat:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                        {profileUser.diasActivos || 1}
                                    </span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Días App</span>
                                </div>
                            </div>

                            {/* Bio and Instagram */}
                            <div className="text-center md:text-left">
                                <p className="text-sm text-white/60 whitespace-pre-wrap">{profileUser.biografia || 'Sin biografía.'}</p>
                                {profileUser.instagram && (
                                    <a 
                                        href={profileUser.instagram.startsWith('http') ? profileUser.instagram : `https://instagram.com/${profileUser.instagram.replace('@', '')}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-black uppercase text-pink-500 hover:bg-pink-500/20 hover:border-pink-500/30 transition-all hover:scale-105 shadow-lg shadow-pink-500/10"
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" className="size-4" alt="Instagram" />
                                        <span>{profileUser.instagram.replace('https://', '').replace('instagram.com/', '').replace('@', '')}</span>
                                    </a>
                                )}
                            </div>

                            {/* Gamification - XP Bar */}
                            {isOwnProfile && userProgress && (
                                <div className="mt-6 max-w-xl">
                                    <XPBar
                                        currentXP={userProgress.xp || 0}
                                        levelInfo={userProgress.level || {
                                            level: 1,
                                            name: 'Newbie',
                                            xpForCurrentLevel: 0,
                                            xpNeeded: 500,
                                            progress: 0,
                                            nextLevel: 'Trader'
                                        }}
                                        showPercentage
                                    />
                                </div>
                            )}

                            {/* Asset Analysis Counts */}
                            {userPosts.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                                    {Object.entries(
                                        userPosts.reduce((acc, p) => {
                                            if (p.par) acc[p.par] = (acc[p.par] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).map(([par, count]) => (
                                        <div key={par} className="glass px-4 py-2 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all group/stat flex items-center gap-3">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{par}</span>
                                            <div className="h-5 w-px bg-white/5" />
                                            <span className="text-[10px] font-black text-white">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - Glass Navigation */}
            <div className="glass rounded-2xl p-1.5 flex border border-white/10 mb-6">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'posts' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-lg">grid_on</span>
                    Publicaciones
                </button>
                <button
                    onClick={() => setActiveTab('medallas')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'medallas' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-lg">military_tech</span>
                    Logros
                </button>
                <button
                    onClick={() => setActiveTab('comunidades')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'comunidades' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-lg">groups</span>
                    Comunidades
                </button>
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'config' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-lg">settings</span>
                        Configuración
                    </button>
                )}
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('compras')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'compras' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-lg">shopping_bag</span>
                        Mis Compras
                    </button>
                )}
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('biblioteca')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'biblioteca' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-amber-400/50 hover:text-amber-400 hover:bg-amber-500/10'}`}
                    >
                        <span className="material-symbols-outlined text-lg">menu_book</span>
                        Biblioteca
                    </button>
                )}
                {isAdminMode && !isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('mod')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'mod' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-red-500/50 hover:text-red-400 hover:bg-red-500/10'}`}
                    >
                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                        Moderar
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'posts' && (
                    <ProfilePostsTab
                        userPosts={userPosts}
                        usuario={usuario}
                        isOwnProfile={isOwnProfile}
                        onDeletePost={handleDeletePost}
                    />
                )}

                {activeTab === 'medallas' && (
                    <ProfileMedalsTab
                        profileUser={profileUser}
                        userAchievements={userAchievements}
                        achievementsProgress={achievementsProgress}
                    />
                )}

                {activeTab === 'comunidades' && (
                    <ProfileCommunitiesTab
                        profileUser={profileUser}
                        userCommunitiesQuery={userCommunitiesQuery || []}
                        creatorCommunities={creatorCommunities}
                        isOwnProfile={isOwnProfile}
                        onNavigate={onNavigate}
                    />
                )}
                
                {activeTab === 'mod' && isAdminMode && (
                    <ProfileModTab
                        profileUser={profileUser}
                        allPlatformPosts={allPlatformPosts}
                    />
                )}

                {activeTab === 'config' && isOwnProfile && (
                    <div className="glass rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Editar Perfil
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Nombre</label>
                                <input
                                    value={nombre} onChange={e => setNombre(e.target.value)}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                    placeholder="Tu nombre..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Biografía</label>
                                <textarea
                                    value={biografia} onChange={e => setBiografia(e.target.value)}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all resize-none h-32"
                                    placeholder="Escribe sobre ti..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Avatar Personalizado</label>
                                <div className="flex gap-4 mt-2 mb-4 items-center">
                                    <div className="relative group/avatar cursor-pointer">
                                        <Avatar 
                                            src={avatarUrl}
                                            name={nombre}
                                            seed={usuario?.usuario || 'default'}
                                            size="2xl"
                                            rounded="full"
                                            frame={usuario?.avatarFrame}
                                            className={`border-2 border-white/10 group-hover/avatar:border-primary/50 transition-all ${isUploadingAvatar ? 'opacity-50' : ''}`}
                                        />
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-white text-xl">upload</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={isUploadingAvatar}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            title="Subir imagen desde PC"
                                        />
                                        {isUploadingAvatar && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">O ingresa URL:</p>
                                        <input
                                            value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                                            className="w-full bg-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                            placeholder="URL de imagen..."
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/40 font-bold uppercase mt-4 mb-2">Generar desde Instagram:</p>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={instagramUserForAvatar} onChange={e => setInstagramUserForAvatar(e.target.value)}
                                        className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                        placeholder="Usuario sin @"
                                    />
                                    <button 
                                        onClick={handleFetchInstagramAvatar} 
                                        className="px-5 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-pink-500/30 hover:scale-105 shadow-lg shadow-pink-500/10"
                                    >
                                        Extraer
                                    </button>
                                </div>

                                <p className="text-[10px] text-white/40 font-bold uppercase mt-4 mb-3">O busca un estilo de avatar:</p>
                                <input
                                    value={seedSearch} onChange={e => setSeedSearch(e.target.value)}
                                    className="w-full bg-white/5 rounded-xl px-4 py-2 mb-4 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                    placeholder="Escribe cualquier nombre para ver opciones..."
                                />
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {filteredSeeds.map(seed => (
                                        <Avatar
                                            key={seed}
                                            name={seed}
                                            seed={seed}
                                            size="lg"
                                            rounded="full"
                                            className="cursor-pointer hover:ring-2 ring-primary hover:scale-110 transition-all border border-white/10 hover:border-primary/50"
                                            onClick={() => setAvatarUrl(seed)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Banner de Perfil</label>
                                <input
                                    value={bannerUrl} onChange={e => setBannerUrl(e.target.value)}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                    placeholder="URL de imagen de fondo..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Instagram</label>
                                <div className="relative mt-2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</span>
                                    <input
                                        value={instagram.replace('https://instagram.com/', '')}
                                        onChange={e => setInstagram(`https://instagram.com/${e.target.value}`)}
                                        className="w-full bg-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                        placeholder="usuario"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary">language</span>
                                            <div>
                                                <p className="text-sm font-bold text-white">Idioma</p>
                                                <p className="text-xs text-white/40">Selecciona tu idioma preferido</p>
                                            </div>
                                        </div>
                                    </div>
                                    <LanguageSelector variant="buttons" className="flex-wrap" />
                                </div>

                                <div className="mb-4">
                                    <AppearancePanel
                                        userId={usuario.id}
                                    />
                                </div>

                                <button
                                    onClick={guardarCambios}
                                    className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] border border-primary/50"
                                >
                                    Guardar Cambios
                                </button>
                                {saveStatus && (
                                    <div className="text-center mt-4 text-signal-green text-xs font-black uppercase animate-pulse flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        {saveStatus}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Achievement Unlock Animation */}
            {unlockingAchievement && (
                <AchievementUnlockAnimation
                    achievement={unlockingAchievement}
                    onClose={() => setUnlockingAchievement(null)}
                />
            )}

            {/* Mis Compras Tab */}
            {activeTab === 'compras' && isOwnProfile && (
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">shopping_bag</span>
                            Mis Compras
                        </h3>
                        
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-white/20 mb-2">receipt_long</span>
                            <p className="text-white/40 text-sm">No tienes compras realizadas</p>
                            <p className="text-white/20 text-xs mt-2">Explora el Marketplace para encontrar estrategias y recursos</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'biblioteca' && isOwnProfile && (
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-400">menu_book</span>
                            Mi Biblioteca
                        </h3>
                        
                        {userBookLibrary && userBookLibrary.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {userBookLibrary.map((book: any) => (
                                    <div
                                        key={book._id}
                                        onClick={() => setSelectedBook({ title: book.title, fileUrl: book.fileUrl })}
                                        className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer group hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10"
                                    >
                                        <div className="relative h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                            {book.coverUrl ? (
                                                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-6xl text-amber-400/50 group-hover:scale-110 transition-transform">auto_stories</span>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <p className="text-white font-bold text-xs line-clamp-2 leading-tight">{book.title}</p>
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-amber-400 bg-black/50 rounded-full p-1">play_arrow</span>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[10px] text-white/40 line-clamp-1">
                                                {book.authorName || 'Autor desconocido'}
                                            </p>
                                            <p className="text-[9px] text-amber-400/60 mt-1">
                                                Añadido {new Date(book.addedAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="size-20 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <span className="material-symbols-outlined text-4xl text-amber-400/50">menu_book</span>
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">Tu biblioteca está vacía</h3>
                                <p className="text-sm text-white/40 mb-4">Los libros que compres aparecerán aquí</p>
                                <button
                                    onClick={() => onNavigate?.('marketplace')}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                                >
                                    <span className="material-symbols-outlined">store</span>
                                    Explorar Marketplace
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedBook && (
                <BookReader
                    fileUrl={selectedBook.fileUrl}
                    title={selectedBook.title}
                    onClose={() => setSelectedBook(null)}
                />
            )}
        </div>
    );
};

export default memo(PerfilView);
