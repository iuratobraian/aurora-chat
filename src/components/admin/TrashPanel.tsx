import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface TrashItem {
    _id: any;
    id: string;
    type: 'post' | 'community' | 'profile';
    titulo?: string;
    nombre?: string;
    username?: string;
    deletedAt?: number;
    deletedBy?: string;
    deleteReason?: string;
}

interface TrashPanelProps {
    onRestorePost: (id: string) => void;
    onPermanentDeletePost: (id: string) => void;
    onRestoreCommunity?: (id: string) => void;
    onPermanentDeleteCommunity?: (id: string) => void;
    onRestoreProfile?: (id: string) => void;
    onPermanentDeleteProfile?: (id: string) => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const TrashPanel: React.FC<TrashPanelProps> = ({
    onRestorePost,
    onPermanentDeletePost,
    onRestoreCommunity,
    onPermanentDeleteCommunity,
    onRestoreProfile,
    onPermanentDeleteProfile,
    showToast,
}) => {
    const trashPosts = useQuery(api.posts.getTrashPosts);
    const deletedCommunities = useQuery(api.communities.getDeletedCommunities);
    const deletedProfiles = useQuery(api.profiles.getDeletedProfiles);

    const [activeTab, setActiveTab] = useState<'posts' | 'communities' | 'profiles'>('posts');
    const [searchTerm, setSearchTerm] = useState('');

    const allTrashPosts = (trashPosts || []).map((p: any) => ({
        ...p,
        type: 'post' as const,
        titulo: p.titulo || p.title || 'Post sin título',
        id: p._id || p.id,
    }));

    const allTrashCommunities = (deletedCommunities || []).map((c: any) => ({
        ...c,
        type: 'community' as const,
        nombre: c.nombre || c.name || 'Comunidad',
        id: c._id || c.id,
    }));

    const allTrashProfiles = (deletedProfiles || []).map((p: any) => ({
        ...p,
        type: 'profile' as const,
        username: p.username || p.userId || p.nombre || 'Usuario',
        id: p._id || p.id,
    }));

    const filterItems = (items: TrashItem[]) => {
        return items.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            const title = item.titulo || item.nombre || item.username || '';
            return title.toLowerCase().includes(searchLower);
        });
    };

    const getCurrentItems = () => {
        switch (activeTab) {
            case 'posts': return filterItems(allTrashPosts);
            case 'communities': return filterItems(allTrashCommunities);
            case 'profiles': return filterItems(allTrashProfiles);
            default: return [];
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Fecha unknown';
        return new Date(timestamp).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleRestore = (item: TrashItem) => {
        switch (item.type) {
            case 'post':
                onRestorePost(item.id);
                showToast('success', 'Post restaurado');
                break;
            case 'community':
                onRestoreCommunity?.(item.id);
                showToast('success', 'Comunidad restaurada');
                break;
            case 'profile':
                onRestoreProfile?.(item.id);
                showToast('success', 'Perfil restaurado');
                break;
        }
    };

    const handlePermanentDelete = (item: TrashItem) => {
        if (!window.confirm(`¿Eliminar PERMANENTEMENTE? Esta acción no se puede deshacer.`)) return;
        
        switch (item.type) {
            case 'post':
                onPermanentDeletePost(item.id);
                showToast('error', 'Post eliminado permanentemente');
                break;
            case 'community':
                onPermanentDeleteCommunity?.(item.id);
                showToast('error', 'Comunidad eliminada permanentemente');
                break;
            case 'profile':
                onPermanentDeleteProfile?.(item.id);
                showToast('error', 'Perfil eliminado permanentemente');
                break;
        }
    };

    const currentItems = getCurrentItems();
    const tabCounts = {
        posts: allTrashPosts.length,
        communities: allTrashCommunities.length,
        profiles: allTrashProfiles.length,
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 
                        className="text-xl font-bold flex items-center gap-2"
                        style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#f87171' }}>delete</span>
                        Papelera
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>
                        {currentItems.length} elementos eliminados
                    </p>
                </div>
            </div>

            {/* Tabs & Search */}
            <div 
                className="rounded-xl p-4 space-y-4"
                style={{
                    background: 'rgba(28, 27, 27, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(73, 68, 84, 0.15)',
                }}
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#86868B' }}>search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar en papelera..."
                                className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                                style={{
                                    background: 'rgba(19, 19, 19, 0.6)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    color: '#e5e2e1',
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1 bg-black/20 rounded-lg p-1">
                        {[
                            { id: 'posts' as const, label: 'Posts', count: tabCounts.posts, color: '#f87171' },
                            { id: 'communities' as const, label: 'Comunidades', count: tabCounts.communities, color: '#fb923c' },
                            { id: 'profiles' as const, label: 'Perfiles', count: tabCounts.profiles, color: '#60a5fa' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                style={activeTab === tab.id 
                                    ? { background: tab.color, color: 'white' } 
                                    : { background: 'transparent', color: '#86868B' }
                                }
                            >
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                    activeTab === tab.id ? 'bg-white/20' : 'bg-black/40'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trash Items */}
            <div className="grid gap-3">
                {currentItems.map(item => (
                    <div 
                        key={item.id} 
                        className="rounded-xl p-4 transition-all"
                        style={{
                            background: 'rgba(32, 31, 31, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                        }}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ 
                                    background: item.type === 'post' ? 'rgba(248, 113, 113, 0.2)' :
                                               item.type === 'community' ? 'rgba(251, 146, 60, 0.2)' :
                                               'rgba(96, 165, 250, 0.2)'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ 
                                    color: item.type === 'post' ? '#f87171' :
                                          item.type === 'community' ? '#fb923c' : '#60a5fa'
                                }}>
                                    {item.type === 'post' ? 'article' : 
                                     item.type === 'community' ? 'groups' : 'person'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-sm truncate" style={{ color: '#e5e2e1' }}>
                                        {item.titulo || item.nombre || item.username || 'Sin título'}
                                    </h3>
                                    <span 
                                        className="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                                        style={{ 
                                            background: item.type === 'post' ? 'rgba(248, 113, 113, 0.2)' :
                                                       item.type === 'community' ? 'rgba(251, 146, 60, 0.2)' :
                                                       'rgba(96, 165, 250, 0.2)',
                                            color: item.type === 'post' ? '#f87171' :
                                                  item.type === 'community' ? '#fb923c' : '#60a5fa'
                                        }}
                                    >
                                        {item.type === 'post' ? 'Post' : 
                                         item.type === 'community' ? 'Comunidad' : 'Perfil'}
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: '#86868B' }}>
                                    Eliminado: {formatDate(item.deletedAt)}
                                    {item.deleteReason && ` • Razón: ${item.deleteReason}`}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => handleRestore(item)}
                                    className="px-3 py-1.5 bg-signal-green/20 text-signal-green rounded-lg text-[10px] font-bold hover:bg-signal-green/30 transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-xs">restore</span>
                                    Restaurar
                                </button>
                                <button
                                    onClick={() => handlePermanentDelete(item)}
                                    className="px-3 py-1.5 bg-red-600/20 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-600/40 transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-xs">delete_forever</span>
                                    Eliminar Definitivo
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {currentItems.length === 0 && (
                <div className="text-center py-20 rounded-xl" style={{ background: 'rgba(32, 31, 31, 0.5)' }}>
                    <span className="material-symbols-outlined text-6xl mb-4 text-gray-600">delete</span>
                    <p className="text-lg font-bold" style={{ color: '#86868B' }}>La papelera está vacía</p>
                    <p className="text-sm" style={{ color: '#494454' }}>Los elementos eliminados aparecerán aquí</p>
                </div>
            )}
        </div>
    );
};

export default TrashPanel;
