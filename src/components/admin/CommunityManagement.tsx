import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Avatar } from '../Avatar';

interface CommunityManagementProps {
    communities: any[];
    seeding: boolean;
    onSeed: () => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
    onRemoveMember?: (communityId: string, userId: string) => void;
    currentUserId?: string;
}

const CommunityManagement: React.FC<CommunityManagementProps> = ({
    communities,
    seeding,
    onSeed,
    showToast,
    onRemoveMember,
    currentUserId = 'admin',
}) => {
    const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        slug: '',
        description: '',
        visibility: 'public' as 'public' | 'unlisted' | 'private',
        priceMonthly: 0,
        maxMembers: 500,
        plan: 'starter' as 'free' | 'starter' | 'growth' | 'scale' | 'enterprise',
    });
    const updateCommunity = useMutation(api.communities.updateCommunity);
    const deleteCommunity = useMutation(api.communities.deleteCommunity);
    const createCommunity = useMutation(api.communities.createCommunity);
    const setCommunityPromoted = useMutation(api.communities.setCommunityPromoted);

    const handleEdit = (community: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditForm({
            id: community._id,
            name: community.name,
            description: community.description,
            priceMonthly: community.priceMonthly || 0,
            accessType: community.accessType || 'paid',
            visibility: community.visibility || 'public',
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateCommunity({
                id: editForm.id,
                name: editForm.name,
                description: editForm.description,
                priceMonthly: Number(editForm.priceMonthly) || 0,
                accessType: editForm.accessType,
                visibility: editForm.visibility
            });
            showToast('success', 'Comunidad actualizada con éxito');
            setIsEditing(false);
            setEditForm(null);
        } catch (error) {
            showToast('error', 'Error actualizando comunidad');
        }
    };

    const handleDelete = async (community: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de eliminar la comunidad "${community.name}"? Esta acción es lógica y la oculta del público.`)) {
            try {
                await deleteCommunity({ id: community._id, userId: currentUserId });
                showToast('success', 'Comunidad eliminada con éxito');
            } catch (error: any) {
                console.error('Delete community error:', error);
                showToast('error', error?.message || 'Error al eliminar la comunidad');
            }
        }
    };

    const handleCreateCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.name || !createForm.slug || !createForm.description) {
            showToast('error', 'Completa todos los campos requeridos');
            return;
        }
        try {
            await createCommunity({
                ownerId: 'admin_initial_seed',
                name: createForm.name,
                slug: createForm.slug.toLowerCase().replace(/\s+/g, '-'),
                description: createForm.description,
                visibility: createForm.visibility,
                accessType: createForm.priceMonthly > 0 ? 'paid' : 'free',
                priceMonthly: createForm.priceMonthly,
                maxMembers: createForm.maxMembers,
                plan: createForm.plan,
            });
            showToast('success', 'Comunidad creada con éxito');
            setShowCreateModal(false);
            setCreateForm({ name: '', slug: '', description: '', visibility: 'public', priceMonthly: 0, maxMembers: 500, plan: 'starter' });
        } catch (error: any) {
            showToast('error', error.message || 'Error al crear comunidad');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 
                        className="text-xl font-bold flex items-center gap-2"
                        style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#34d399' }}>groups</span>
                        Comunidades
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>{communities?.length || 0} comunidades</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                        style={{
                            background: 'rgba(0, 230, 118, 0.2)',
                            color: '#00e676',
                            border: '1px solid rgba(0, 230, 118, 0.3)',
                        }}
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nueva Comunidad
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities?.map((community: any) => (
                    <div
                        key={community._id}
                        className="rounded-xl overflow-hidden cursor-pointer transition-all"
                        style={{
                            background: 'rgba(32, 31, 31, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(73, 68, 84, 0.15)',
                        }}
                        onClick={() => setSelectedCommunity(community)}
                    >
                        <div 
                            className="h-32 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(96, 165, 250, 0.2))' }}
                        >
                            <span className="material-symbols-outlined text-5xl" style={{ color: 'rgba(255,255,255,0.2)' }}>groups</span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold text-sm" style={{ color: '#e5e2e1' }}>{community.name}</h3>
                                    <span 
                                        className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase"
                                        style={community.accessType === 'free' 
                                            ? { background: 'rgba(0, 230, 118, 0.2)', color: '#00e676' } 
                                            : { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }
                                        }
                                    >
                                        {community.accessType === 'free' ? 'Gratis' : `Premium $${community.priceMonthly}`}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs line-clamp-2 mb-3" style={{ color: '#86868B' }}>{community.description}</p>
                            <div className="flex items-center justify-between text-[10px]" style={{ color: '#86868B' }}>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">group</span>
                                    {community.currentMembers}/{community.maxMembers} miembros
                                </span>
                                <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(19, 19, 19, 0.6)' }}>{community.visibility}</span>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(73, 68, 84, 0.15)' }}>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            const days = community.isPromoted ? 0 : 30;
                                            const endDate = days > 0 ? Date.now() + (days * 24 * 60 * 60 * 1000) : undefined;
                                            await setCommunityPromoted({
                                                communityId: community._id,
                                                isPromoted: !community.isPromoted,
                                                promotionPlan: community.isPromoted ? undefined : 'vip',
                                                promotionEndDate: endDate,
                                            });
                                            showToast('success', community.isPromoted ? 'Comunidad desmarcada de VIP' : 'Comunidad marcada como VIP');
                                        } catch (error) {
                                            showToast('error', 'Error al actualizar promoción');
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        community.isPromoted 
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                    }`}
                                >
                                    {community.isPromoted ? '★ VIP' : '○ VIP'}
                                </button>
                                <button
                                    onClick={(e) => handleEdit(community, e)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={(e) => handleDelete(community, e)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!communities || communities.length === 0) && (
                <div 
                    className="text-center py-20 rounded-xl"
                    style={{
                        background: 'rgba(32, 31, 31, 0.6)',
                        border: '1px solid rgba(73, 68, 84, 0.15)',
                    }}
                >
                    <span className="material-symbols-outlined text-6xl mb-4" style={{ color: '#494454' }}>groups</span>
                    <p className="text-lg font-bold" style={{ color: '#86868B' }}>No hay comunidades</p>
                    <p className="text-sm mt-1" style={{ color: '#494454' }}>Crea comunidades de ejemplo para probar</p>
                </div>
            )}

            {selectedCommunity && (
                <CommunityDetailModal
                    community={selectedCommunity}
                    onClose={() => setSelectedCommunity(null)}
                    showToast={showToast}
                    onRemoveMember={onRemoveMember}
                />
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
                    <div 
                        className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        style={{
                            background: 'rgba(32, 31, 31, 0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(73, 68, 84, 0.3)',
                        }}
                    >
                        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(73, 68, 84, 0.15)' }}>
                            <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2" style={{ color: '#e5e2e1' }}>
                                <span className="material-symbols-outlined text-signal-green">groups</span>
                                Nueva Comunidad
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCommunity} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nombre *</label>
                                <input type="text" value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder="Ej: Trading Elite"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-signal-green focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Slug *</label>
                                <input type="text" value={createForm.slug}
                                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                                    placeholder="Ej: trading-elite"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-signal-green focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Descripción *</label>
                                <textarea value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    placeholder="Describe tu comunidad..." rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-signal-green focus:outline-none resize-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Visibilidad</label>
                                    <select value={createForm.visibility}
                                        onChange={(e) => setCreateForm({ ...createForm, visibility: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white">
                                        <option value="public">Pública</option>
                                        <option value="unlisted">No listada</option>
                                        <option value="private">Privada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Plan</label>
                                    <select value={createForm.plan}
                                        onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white">
                                        <option value="free">Free</option>
                                        <option value="starter">Starter</option>
                                        <option value="growth">Growth</option>
                                        <option value="scale">Scale</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Precio USD</label>
                                    <input type="number" min="0" step="0.01" value={createForm.priceMonthly}
                                        onChange={(e) => setCreateForm({ ...createForm, priceMonthly: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Máx. Miembros</label>
                                    <input type="number" min="1" value={createForm.maxMembers}
                                        onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) || 500 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white/5 text-gray-400 rounded-lg text-sm font-bold hover:bg-white/10">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 bg-signal-green text-black rounded-lg text-sm font-bold hover:bg-signal-green/90">
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditing && editForm && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0a0c10] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Editar Comunidad</h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined block">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Nombre</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Descripción</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Acceso</label>
                                    <select
                                        value={editForm.accessType}
                                        onChange={(e) => setEditForm(prev => ({...prev, accessType: e.target.value}))}
                                        className="w-full bg-[#151821] border border-white/10 rounded-xl px-4 py-2 text-white"
                                    >
                                        <option value="paid">Premium (Pago)</option>
                                        <option value="free">Gratis</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Precio (USD/mes)</label>
                                    <input
                                        type="number"
                                        value={editForm.priceMonthly}
                                        onChange={(e) => setEditForm(prev => ({...prev, priceMonthly: e.target.value}))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        disabled={editForm.accessType === 'free'}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

interface CommunityDetailModalProps {
    community: any;
    onClose: () => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
    onRemoveMember: (communityId: string, userId: string) => void;
}

const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({ community, onClose, showToast, onRemoveMember }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'members'>('info');
    const membersResult = useQuery(api.communities.getCommunityMembers, { communityId: community._id, limit: 50 });
    const members = membersResult?.members;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
            <div className="bg-[#0f1115] rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{community.name}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'info' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
                    >
                        Información
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'members' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
                    >
                        Miembros ({members?.length || community.currentMembers})
                    </button>
                </div>

                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-2">Descripción</p>
                            <p className="text-sm">{community.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Acceso</p>
                                <p className="text-sm font-bold">{community.accessType === 'free' ? 'Gratis' : `Premium $${community.priceMonthly}`}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Visibilidad</p>
                                <p className="text-sm font-bold">{community.visibility}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Miembros</p>
                                <p className="text-sm font-bold">{community.currentMembers} / {community.maxMembers}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Creador</p>
                                <p className="text-sm font-bold">{community.creatorName || 'Sistema'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-2">
                        {members && members.length > 0 ? members.map((member: any) => (
                            <div key={member.userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <Avatar 
                                    src={member.profile?.avatar}
                                    name={member.profile?.nombre || 'Usuario'}
                                    seed={member.userId}
                                    size="sm"
                                    rounded="full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold">{member.profile?.nombre || 'Usuario'}</p>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                            member.role === 'owner' ? 'bg-yellow-500/20 text-yellow-400' :
                                            member.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-white/5 text-gray-400'
                                        }`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">@{member.profile?.usuario || member.userId}</p>
                                </div>
                                {member.role !== 'owner' && (
                                    <button
                                        onClick={() => onRemoveMember(community._id, member.userId)}
                                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-500/30 transition-colors"
                                    >
                                        Expulsar
                                    </button>
                                )}
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-8">No hay miembros registrados</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityManagement;
