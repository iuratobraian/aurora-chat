import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from '../../components/Avatar';

interface CommunityAdminPanelProps {
    usuario: any;
    onNavigate?: (tab: string) => void;
}

interface CommunityPost {
    _id: string;
    userId: string;
    titulo?: string;
    contenido: string;
    createdAt: number;
    likes: string[];
    likesCount: number;
    profile?: {
        nombre: string;
        usuario: string;
        avatar?: string;
    };
}

interface PendingUser {
    userId: string;
    email?: string;
    joinedAt: number;
    status: 'pending' | 'awaiting_payment';
    profile?: {
        nombre: string;
        usuario: string;
        avatar?: string;
    };
}

type AdminTab = 'overview' | 'members' | 'pending' | 'posts' | 'settings';

export const CommunityAdminPanel: React.FC<CommunityAdminPanelProps> = ({ usuario, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const myCommunities = useQuery(api.communities.getUserCommunities, { userId: usuario?.id || '' });
    const ownedCommunities = myCommunities?.filter((c: any) => c.ownerId === usuario?.id) || [];
    
    const communityPosts = useQuery(
        api.communities.getCommunityPosts,
        selectedCommunityId ? { communityId: selectedCommunityId as any } : "skip"
    ) as CommunityPost[] | undefined;
    
    const deletePost = useMutation(api.communities.deletePost);
    const updatePost = useMutation(api.communities.updatePost);
    const removeMember = useMutation(api.communities.removeMember);
    const approveMember = useMutation(api.communities.approveMember);
    const inviteUser = useMutation(api.communities.inviteUser);

    const stats = useMemo(() => {
        if (!communityPosts) return { totalPosts: 0, totalLikes: 0, activePosts: 0 };
        return {
            totalPosts: communityPosts.length,
            totalLikes: communityPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0),
            activePosts: communityPosts.filter(p => Date.now() - p.createdAt < 7 * 24 * 60 * 60 * 1000).length,
        };
    }, [communityPosts]);

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: 'dashboard' },
        { id: 'members', label: 'Miembros', icon: 'group' },
        { id: 'pending', label: 'Pendientes', icon: 'pending_actions' },
        { id: 'posts', label: 'Publicaciones', icon: 'article' },
        { id: 'settings', label: 'Configuración', icon: 'settings' },
    ];

    const handleDeletePost = async (postId: string) => {
        if (confirm('¿Eliminar esta publicación?')) {
            await deletePost({ postId });
        }
    };

    const handleInviteUser = async () => {
        const email = prompt('Ingresa el email del usuario a invitar:');
        if (email && selectedCommunityId) {
            await inviteUser({ communityId: selectedCommunityId as any, email, invitedBy: usuario.id });
        }
    };

    if (ownedCommunities.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-primary">group_add</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Sin comunidades propias</h2>
                <p className="text-gray-400 mb-6">Crea una comunidad para administrar sus miembros y publicaciones.</p>
                <button
                    onClick={() => onNavigate?.('creator')}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl"
                >
                    Crear Comunidad
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white">Admin Panel</h1>
                    <p className="text-sm text-gray-400">Administra tu comunidad</p>
                </div>
                <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                >
                    {ownedCommunities.map((c: any) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AdminTab)}
                        className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Miembros', value: ownedCommunities.find((c: any) => c._id === selectedCommunityId)?.currentMembers || 0, icon: 'group', color: 'blue' },
                            { label: 'Posts', value: stats.totalPosts, icon: 'article', color: 'purple' },
                            { label: 'Likes', value: stats.totalLikes, icon: 'favorite', color: 'red' },
                            { label: 'Activos (7d)', value: stats.activePosts, icon: 'trending_up', color: 'green' },
                        ].map(stat => (
                            <div key={stat.label} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                <span className="material-symbols-outlined text-2xl text-gray-400 mb-2 block">{stat.icon}</span>
                                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-2xl text-amber-400">insights</span>
                            <h3 className="text-lg font-bold text-white">Métricas de Crecimiento</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-black text-emerald-400">+15%</p>
                                <p className="text-xs text-gray-500">Crecimiento semanal</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-blue-400">45%</p>
                                <p className="text-xs text-gray-500">Engagement rate</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-purple-400">$12.5</p>
                                <p className="text-xs text-gray-500">ARPU</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Members */}
            {activeTab === 'members' && (
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Buscar miembro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        </div>
                        <button
                            onClick={handleInviteUser}
                            className="px-4 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">person_add</span>
                            Invitar
                        </button>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr className="text-xs uppercase text-gray-500">
                                    <th className="p-4 text-left">Miembro</th>
                                    <th className="p-4 text-left">Rol</th>
                                    <th className="p-4 text-left">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {communityPosts?.slice(0, 5).map((post) => (
                                    <tr key={post._id} className="border-t border-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={post.profile?.avatar}
                                                    name={post.profile?.nombre || 'User'}
                                                    seed={post.userId}
                                                    size="sm"
                                                    rounded="full"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-white">{post.profile?.nombre || 'Usuario'}</p>
                                                    <p className="text-xs text-gray-500">@{post.profile?.usuario}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-white/10 text-gray-400">Miembro</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400">Activo</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                                Expulsar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pending */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl text-amber-400">pending_actions</span>
                            <div>
                                <h3 className="font-bold text-white">Solicitudes Pendientes</h3>
                                <p className="text-sm text-gray-400">Usuarios esperando aprobación o confirmación de pago</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: 'María García', user: 'mariagarcia', status: 'pending' },
                            { name: 'Carlos López', user: 'carloslopez', status: 'awaiting_payment' },
                            { name: 'Ana Martínez', user: 'anamartinez', status: 'pending' },
                        ].map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-white font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{user.name}</p>
                                        <p className="text-sm text-gray-500">@{user.user}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {user.status === 'awaiting_payment' ? (
                                        <>
                                            <button className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm">
                                                Verificar Pago
                                            </button>
                                            <button className="px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-xl text-sm">
                                                Rechazar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm">
                                                Aprobar
                                            </button>
                                            <button className="px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-xl text-sm">
                                                Rechazar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Posts */}
            {activeTab === 'posts' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Publicaciones</h3>
                        <span className="text-sm text-gray-500">{communityPosts?.length || 0} posts</span>
                    </div>

                    <div className="space-y-3">
                        {communityPosts?.slice(0, 10).map((post) => (
                            <div key={post._id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar
                                            src={post.profile?.avatar}
                                            name={post.profile?.nombre || 'User'}
                                            seed={post.userId}
                                            size="sm"
                                            rounded="full"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-white">{post.profile?.nombre || 'Usuario'}</p>
                                            <p className="text-xs text-gray-500">@{post.profile?.usuario}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400">
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-3">{post.contenido}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">favorite</span>
                                        {post.likesCount || 0}
                                    </span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4">Configuración de Comunidad</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    defaultValue={ownedCommunities.find((c: any) => c._id === selectedCommunityId)?.name || ''}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Descripción</label>
                                <textarea
                                    rows={3}
                                    defaultValue={ownedCommunities.find((c: any) => c._id === selectedCommunityId)?.description || ''}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2">Visibilidad</label>
                                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                                        <option value="public">Pública</option>
                                        <option value="unlisted">No listada</option>
                                        <option value="private">Privada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2">Precio Mensual ($)</label>
                                    <input
                                        type="number"
                                        defaultValue={ownedCommunities.find((c: any) => c._id === selectedCommunityId)?.priceMonthly || 0}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-primary text-white font-bold rounded-xl">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityAdminPanel;
