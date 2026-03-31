import React, { useState } from 'react';
import { Publicacion } from '../../types';

interface PostManagementProps {
    posts: Publicacion[];
    trashPosts?: Publicacion[];
    onRefresh: () => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
    onDelete: (postId: string) => void;
    onRestore: (postId: string) => void;
    onPermanentDelete?: (postId: string) => void;
    onUpdate: (postId: string, updates: { titulo?: string; contenido?: string; categoria?: string }) => void;
    onPin?: (postId: string, pinned: boolean) => void;
    onBump?: (postId: string) => void;
    onReward?: (postId: string) => void;
}

const PostManagement: React.FC<PostManagementProps> = ({ 
    posts, trashPosts = [], onRefresh, showToast, onDelete, onRestore, onPermanentDelete, onUpdate, 
    onPin, onBump, onReward 
}) => {
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'trash'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPost, setEditingPost] = useState<Publicacion | null>(null);
    const [editForm, setEditForm] = useState({ titulo: '', contenido: '', categoria: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'comments'>('recent');

    const displayedPosts = filterStatus === 'trash' ? trashPosts : posts;

    const filteredPosts = displayedPosts.filter(post => {
        const matchesSearch = !searchTerm ||
            post.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.contenido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.idUsuario?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (sortBy === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0);
        if (sortBy === 'comments') return (b.comentarios?.length || 0) - (a.comentarios?.length || 0);
        return b.ultimaInteraccion - a.ultimaInteraccion;
    });

    const handleEdit = (post: Publicacion) => {
        setEditingPost(post);
        setEditForm({
            titulo: post.titulo || '',
            contenido: post.contenido || '',
            categoria: post.categoria || '',
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!editingPost) return;
        onUpdate(editingPost.id, {
            titulo: editForm.titulo,
            contenido: editForm.contenido,
            categoria: editForm.categoria,
        });
        showToast('success', 'Publicación actualizada');
        setShowEditModal(false);
        setEditingPost(null);
    };

    const handleDelete = (postId: string) => {
        if (window.confirm('¿Eliminar esta publicación?')) {
            onDelete(postId);
            showToast('success', 'Publicación eliminada');
        }
    };

    const handleBulkDelete = () => {
        if (selectedPosts.size === 0) return;
        if (window.confirm(`¿Eliminar ${selectedPosts.size} publicaciones?`)) {
            selectedPosts.forEach(id => onDelete(id));
            setSelectedPosts(new Set());
            showToast('success', 'Publicaciones eliminadas');
        }
    };

    const toggleSelect = (postId: string) => {
        const newSelected = new Set(selectedPosts);
        if (newSelected.has(postId)) {
            newSelected.delete(postId);
        } else {
            newSelected.add(postId);
        }
        setSelectedPosts(newSelected);
    };

    const selectAll = () => {
        if (selectedPosts.size === filteredPosts.length) {
            setSelectedPosts(new Set());
        } else {
            setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
        }
    };

    const getEngagementScore = (post: Publicacion) => {
        const likes = post.likes?.length || 0;
        const comments = post.comentarios?.length || 0;
        return likes * 2 + comments * 3;
    };

    const isTrashView = filterStatus === 'trash';

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 
                        className="text-xl font-bold flex items-center gap-2"
                        style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
                    >
                        <span className="material-symbols-outlined" style={{ color: isTrashView ? '#f87171' : '#a78bfa' }}>
                            {isTrashView ? 'delete' : 'article'}
                        </span>
                        {isTrashView ? 'Papelera de Posts' : 'Gestión de Publicaciones'}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>
                        {isTrashView 
                            ? `${filteredPosts.length} posts en papelera`
                            : `${filteredPosts.length} publicaciones`
                        }
                        {selectedPosts.size > 0 && ` • ${selectedPosts.size} seleccionadas`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedPosts.size > 0 && !isTrashView && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Eliminar ({selectedPosts.size})
                        </button>
                    )}
                    {isTrashView && selectedPosts.size > 0 && onPermanentDelete && (
                        <button
                            onClick={() => {
                                if (window.confirm(`¿Eliminar PERMANENTEMENTE ${selectedPosts.size} posts? Esta acción no se puede deshacer.`)) {
                                    selectedPosts.forEach(id => onPermanentDelete(id));
                                    setSelectedPosts(new Set());
                                    showToast('error', `${selectedPosts.size} posts eliminados permanentemente`);
                                }
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-red-600/20 text-red-500 hover:bg-red-600/40 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">delete_forever</span>
                            Eliminar Definitivo ({selectedPosts.size})
                        </button>
                    )}
                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                        style={{
                            background: 'rgba(32, 31, 31, 0.8)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(73, 68, 84, 0.2)',
                            color: '#86868B',
                        }}
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
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
                                placeholder="Buscar por título, contenido o autor..."
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
                    {/* Status Filter */}
                    <div className="flex gap-1 bg-black/20 rounded-lg p-1">
                        {[
                            { id: 'all' as const, label: 'Todas', color: '#86868B' },
                            { id: 'active' as const, label: 'Activas', color: '#34d399' },
                            { id: 'trash' as const, label: 'Papelera', color: '#f87171' },
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => setFilterStatus(status.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={filterStatus === status.id 
                                    ? { background: status.color, color: status.id === 'active' ? 'black' : 'white' } 
                                    : { background: 'transparent', color: '#86868B' }
                                }
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/20 text-gray-400 outline-none cursor-pointer"
                        style={{ border: '1px solid rgba(73, 68, 84, 0.2)' }}
                    >
                        <option value="recent">Más Recientes</option>
                        <option value="likes">Más Likes</option>
                        <option value="comments">Más Comentarios</option>
                    </select>

                    {/* Select All */}
                    <button
                        onClick={selectAll}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/20 text-gray-400 hover:text-white transition-all"
                        style={{ border: '1px solid rgba(73, 68, 84, 0.2)' }}
                    >
                        {selectedPosts.size === filteredPosts.length ? 'Deseleccionar' : 'Seleccionar Todo'}
                    </button>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid gap-3">
                {filteredPosts.slice(0, 50).map(post => (
                    <div 
                        key={post.id} 
                        className={`rounded-xl p-4 transition-all ${
                            selectedPosts.has(post.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        style={{
                            background: 'rgba(32, 31, 31, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${selectedPosts.has(post.id) ? 'rgba(160, 120, 255, 0.5)' : 'rgba(73, 68, 84, 0.15)'}`,
                        }}
                    >
                        <div className="flex items-start gap-4">
                            {/* Selection */}
                            <button
                                onClick={() => toggleSelect(post.id)}
                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    selectedPosts.has(post.id) 
                                        ? 'bg-primary border-primary' 
                                        : 'border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                {selectedPosts.has(post.id) && (
                                    <span className="material-symbols-outlined text-white text-sm">check</span>
                                )}
                            </button>

                            {/* Thumbnail */}
                            <div className="relative">
                                <img 
                                    src={post.imagenUrl || 'https://picsum.photos/seed/post/100/100'} 
                                    className="w-20 h-20 rounded-lg object-cover" 
                                    alt="" 
                                />
                                {post.imagenUrl && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                                        <span className="material-symbols-outlined text-white text-xs">image</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-sm truncate" style={{ color: '#e5e2e1' }}>
                                        {post.titulo || 'Sin título'}
                                    </h3>
                                    {post.status === 'trash' && (
                                        <span 
                                            className="px-2 py-0.5 rounded text-[8px] font-bold"
                                            style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#f87171' }}
                                        >
                                            PAPELERA
                                        </span>
                                    )}
                                    {(post as any).pinned && (
                                        <span 
                                            className="px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1"
                                            style={{ background: 'rgba(160, 120, 255, 0.2)', color: '#d0bcff' }}
                                        >
                                            <span className="material-symbols-outlined text-xs">push_pin</span>
                                            FIJO
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs truncate mb-2" style={{ color: '#86868B' }}>
                                    {post.contenido?.substring(0, 100)}...
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span 
                                        className="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                                        style={{ background: 'rgba(19, 19, 19, 0.6)', color: '#86868B' }}
                                    >
                                        {post.categoria || 'General'}
                                    </span>
                                    {post.par && (
                                        <span className="text-[8px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                                            {post.par}
                                        </span>
                                    )}
                                    <span className="text-[8px]" style={{ color: '#494454' }}>
                                        {post.tiempo}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-center px-4">
                                <div className="text-lg font-black" style={{ color: '#e5e2e1' }}>
                                    {getEngagementScore(post)}
                                </div>
                                <div className="text-[8px] uppercase" style={{ color: '#494454' }}>
                                    Score
                                </div>
                                <div className="flex gap-2 mt-1 text-xs" style={{ color: '#86868B' }}>
                                    <span title="Likes">❤️ {post.likes?.length || 0}</span>
                                    <span title="Comentarios">💬 {post.comentarios?.length || 0}</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-col gap-1">
                                {post.status === 'trash' ? (
                                    <>
                                        <button
                                            onClick={() => { onRestore(post.id); showToast('success', 'Publicación restaurada'); }}
                                            className="px-3 py-1.5 bg-signal-green/20 text-signal-green rounded-lg text-[10px] font-bold hover:bg-signal-green/30 transition-all flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-xs">restore</span>
                                            Restaurar
                                        </button>
                                        {onPermanentDelete && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('¿Eliminar PERMANENTEMENTE? Esta acción no se puede deshacer.')) {
                                                        onPermanentDelete(post.id);
                                                        showToast('error', 'Publicación eliminada permanentemente');
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-red-600/20 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-600/40 transition-all flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-xs">delete_forever</span>
                                                Eliminar Definitivo
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {onReward && (
                                            <button
                                                onClick={() => { onReward(post.id); showToast('success', 'Premio aplicado'); }}
                                                className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-bold hover:bg-yellow-500/30 transition-all flex items-center gap-1"
                                                title="Premiar publicación"
                                            >
                                                <span className="material-symbols-outlined text-xs">stars</span>
                                                Premio
                                            </button>
                                        )}
                                        {onPin && (
                                            <button
                                                onClick={() => { onPin(post.id, !(post as any).pinned); showToast('info', (post as any).pinned ? 'Desfijado' : 'Fijado'); }}
                                                className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] font-bold hover:bg-purple-500/30 transition-all flex items-center gap-1"
                                                title={(post as any).pinned ? 'Desfijar' : 'Fijar arriba'}
                                            >
                                                <span className="material-symbols-outlined text-xs">push_pin</span>
                                                {(post as any).pinned ? 'Desfijar' : 'Fijar'}
                                            </button>
                                        )}
                                        {onBump && (
                                            <button
                                                onClick={() => { onBump(post.id); showToast('success', 'Subido arriba'); }}
                                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold hover:bg-blue-500/30 transition-all flex items-center gap-1"
                                                title="Traer arriba"
                                            >
                                                <span className="material-symbols-outlined text-xs">arrow_upward</span>
                                                Subir
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-[10px] font-bold hover:bg-white/10 hover:text-white transition-all flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-xs">edit</span>
                                            Editar
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-500/30 transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-20 rounded-xl" style={{ background: 'rgba(32, 31, 31, 0.5)' }}>
                    <span className="material-symbols-outlined text-6xl mb-4 text-gray-600">article</span>
                    <p className="text-lg font-bold" style={{ color: '#86868B' }}>No hay publicaciones</p>
                    <p className="text-sm" style={{ color: '#494454' }}>Intenta con otro filtro o búsqueda</p>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingPost && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" 
                    onClick={() => setShowEditModal(false)}
                >
                    <div 
                        className="bg-[#0f1115] rounded-2xl p-6 w-full max-w-lg border border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit</span>
                                Editar Publicación
                            </h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Título</label>
                                <input
                                    value={editForm.titulo}
                                    onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Categoría</label>
                                <input
                                    value={editForm.categoria}
                                    onChange={e => setEditForm({ ...editForm, categoria: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Contenido</label>
                                <textarea
                                    value={editForm.contenido}
                                    onChange={e => setEditForm({ ...editForm, contenido: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors h-32 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setShowEditModal(false)} 
                                className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit} 
                                className="flex-1 py-3 bg-primary rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagement;
