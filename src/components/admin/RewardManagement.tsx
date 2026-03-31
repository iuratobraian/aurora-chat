import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface RewardsManagementProps {
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface Reward {
    _id: string;
    name: string;
    description: string;
    tokenCost: number;
    imageUrl?: string;
    category: 'course' | 'signal' | 'subscription' | 'merchandise' | 'mentoring' | 'other';
    stock: number;
    isActive: boolean;
    createdAt: number;
}

interface TokenTransaction {
    _id: string;
    userId: string;
    amount: number;
    type: 'earned' | 'spent' | 'bonus' | 'refund';
    reason: string;
    createdAt: number;
}

const RewardManagement: React.FC<RewardsManagementProps> = ({ showToast }) => {
    const rewards = useQuery(api.rewards?.getAllRewards) || [];
    const transactions = useQuery(api.rewards?.getRecentTransactions) || [];
    const userTokens = useQuery(api.rewards?.getGlobalTokenStats) || { totalDistributed: 0, totalRedeemed: 0, activeUsers: 0 };

    const createReward = useMutation(api.rewards?.createReward);
    const updateReward = useMutation(api.rewards?.updateReward);
    const deleteReward = useMutation(api.rewards?.deleteReward);
    const seedRewards = useMutation(api.rewards?.seedRewards);

    const [activeTab, setActiveTab] = useState<'rewards' | 'transactions' | 'stats'>('rewards');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [seeding, setSeeding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tokenCost: 100,
        imageUrl: '',
        category: 'course' as Reward['category'],
        stock: 100,
        isActive: true,
    });

    const categories = [
        { id: 'course', label: 'Cursos', icon: 'school', color: 'from-blue-500 to-cyan-500' },
        { id: 'signal', label: 'Señales', icon: 'trending_up', color: 'from-green-500 to-emerald-500' },
        { id: 'subscription', label: 'Suscripciones', icon: 'card_membership', color: 'from-purple-500 to-pink-500' },
        { id: 'merchandise', label: 'Merchandise', icon: 'shopping_bag', color: 'from-amber-500 to-orange-500' },
        { id: 'mentoring', label: 'Mentoring', icon: 'psychology', color: 'from-rose-500 to-red-500' },
        { id: 'other', label: 'Otro', icon: 'redeem', color: 'from-gray-500 to-slate-500' },
    ];

    const handleSeed = async () => {
        try {
            setSeeding(true);
            await seedRewards({});
            showToast('success', '¡Recompensas de ejemplo creadas!');
        } catch (error) {
            showToast('error', 'Error al crear recompensas');
        } finally {
            setSeeding(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createReward({
                name: formData.name,
                description: formData.description,
                tokenCost: formData.tokenCost,
                imageUrl: formData.imageUrl || undefined,
                category: formData.category,
                stock: formData.stock,
                isActive: formData.isActive,
            });
            showToast('success', 'Recompensa creada');
            setShowCreateModal(false);
            setFormData({ name: '', description: '', tokenCost: 100, imageUrl: '', category: 'course', stock: 100, isActive: true });
        } catch (error: any) {
            showToast('error', error.message || 'Error al crear');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReward) return;
        try {
            await updateReward({
                id: editingReward._id,
                name: formData.name,
                description: formData.description,
                tokenCost: formData.tokenCost,
                imageUrl: formData.imageUrl || undefined,
                category: formData.category,
                stock: formData.stock,
                isActive: formData.isActive,
            });
            showToast('success', 'Recompensa actualizada');
            setEditingReward(null);
            setFormData({ name: '', description: '', tokenCost: 100, imageUrl: '', category: 'course', stock: 100, isActive: true });
        } catch (error: any) {
            showToast('error', error.message || 'Error al actualizar');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta recompensa?')) {
            try {
                await deleteReward({ id });
                showToast('success', 'Recompensa eliminada');
            } catch (error) {
                showToast('error', 'Error al eliminar');
            }
        }
    };

    const openEdit = (reward: Reward) => {
        setEditingReward(reward);
        setFormData({
            name: reward.name,
            description: reward.description,
            tokenCost: reward.tokenCost,
            imageUrl: reward.imageUrl || '',
            category: reward.category,
            stock: reward.stock,
            isActive: reward.isActive,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e5e2e1' }}>
                        <span className="material-symbols-outlined" style={{ color: '#facc15' }}>workspace_premium</span>
                        Gestión de Recompensas
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>
                        {rewards.length} recompensas | {userTokens.activeUsers} usuarios activos
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                        style={{ background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' }}
                    >
                        <span className="material-symbols-outlined text-sm">{seeding ? 'hourglass' : 'auto_awesome'}</span>
                        {seeding ? 'Creando...' : 'Seed Datos'}
                    </button>
                    <button
                        onClick={() => { setShowCreateModal(true); setEditingReward(null); setFormData({ name: '', description: '', tokenCost: 100, imageUrl: '', category: 'course', stock: 100, isActive: true }); }}
                        className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                        style={{ background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' }}
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nueva Recompensa
                    </button>
                </div>
            </div>

            <div className="flex gap-2 border-b border-white/10">
                {[
                    { id: 'rewards', label: 'Recompensas', icon: 'redeem' },
                    { id: 'transactions', label: 'Transacciones', icon: 'receipt_long' },
                    { id: 'stats', label: 'Estadísticas', icon: 'analytics' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                            activeTab === tab.id
                                ? 'border-yellow-400 text-yellow-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'rewards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.map((reward: any) => {
                        const cat = categories.find(c => c.id === reward.category) || categories[5];
                        return (
                            <div
                                key={reward._id}
                                className="rounded-xl overflow-hidden"
                                style={{ background: 'rgba(32, 31, 31, 0.8)', border: '1px solid rgba(73, 68, 84, 0.15)' }}
                            >
                                <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.color.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : cat.color.includes('green') ? 'rgba(34, 197, 94, 0.2)' : cat.color.includes('purple') ? 'rgba(168, 85, 247, 0.2)' : cat.color.includes('amber') ? 'rgba(251, 191, 36, 0.2)' : cat.color.includes('rose') ? 'rgba(244, 63, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)'}, transparent)` }}>
                                    <span className="material-symbols-outlined text-5xl" style={{ color: 'rgba(255,255,255,0.3)' }}>{cat.icon}</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-gradient-to-r ${cat.color} text-white`}>{cat.label}</span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${reward.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {reward.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1" style={{ color: '#e5e2e1' }}>{reward.name}</h3>
                                    <p className="text-xs line-clamp-2 mb-3" style={{ color: '#86868B' }}>{reward.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm text-yellow-400">toll</span>
                                            <span className="font-black text-yellow-400">{reward.tokenCost}</span>
                                            <span className="text-xs text-gray-500">tokens</span>
                                        </div>
                                        <span className="text-xs" style={{ color: '#86868B' }}>Stock: {reward.stock}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(73, 68, 84, 0.15)' }}>
                                        <button onClick={() => openEdit(reward)} className="flex-1 py-1.5 rounded text-[10px] font-bold transition-all" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}>Editar</button>
                                        <button onClick={() => handleDelete(reward._id)} className="px-3 py-1.5 rounded text-[10px] font-bold transition-all" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {rewards.length === 0 && (
                        <div className="col-span-full text-center py-16" style={{ background: 'rgba(32, 31, 31, 0.6)', borderRadius: '12px' }}>
                            <span className="material-symbols-outlined text-6xl mb-4" style={{ color: '#494454' }}>redeem</span>
                            <p className="text-lg font-bold" style={{ color: '#86868B' }}>No hay recompensas</p>
                            <p className="text-sm mt-1" style={{ color: '#494454' }}>Crea recompensas para que los usuarios canjeen sus tokens</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(32, 31, 31, 0.8)', border: '1px solid rgba(73, 68, 84, 0.15)' }}>
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] uppercase font-bold text-gray-500" style={{ background: 'rgba(73, 68, 84, 0.1)' }}>
                                <th className="p-3 text-left">Usuario</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-left">Cantidad</th>
                                <th className="p-3 text-left">Razón</th>
                                <th className="p-3 text-left">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx._id} className="border-t border-white/5 text-xs">
                                    <td className="p-3 text-gray-400">{tx.userId?.slice(0, 8)}...</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            tx.type === 'earned' ? 'bg-green-500/20 text-green-400' :
                                            tx.type === 'spent' ? 'bg-red-500/20 text-red-400' :
                                            tx.type === 'bonus' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>{tx.type}</span>
                                    </td>
                                    <td className={`p-3 font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </td>
                                    <td className="p-3 text-gray-400">{tx.reason}</td>
                                    <td className="p-3 text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Sin transacciones</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(32, 31, 31, 0.8)', border: '1px solid rgba(73, 68, 84, 0.15)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-yellow-400">toll</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Tokens Distribuidos</p>
                                <p className="text-2xl font-black text-yellow-400">{userTokens.totalDistributed?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(32, 31, 31, 0.8)', border: '1px solid rgba(73, 68, 84, 0.15)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-green-400">shopping_cart</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Tokens Canjeados</p>
                                <p className="text-2xl font-black text-green-400">{userTokens.totalRedeemed?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(32, 31, 31, 0.8)', border: '1px solid rgba(73, 68, 84, 0.15)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-blue-400">group</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Usuarios Activos</p>
                                <p className="text-2xl font-black text-blue-400">{userTokens.activeUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(showCreateModal || editingReward) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
                    <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(32, 31, 31, 0.95)', border: '1px solid rgba(73, 68, 84, 0.3)' }}>
                        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(73, 68, 84, 0.15)' }}>
                            <h2 className="text-lg font-black uppercase flex items-center gap-2" style={{ color: '#e5e2e1' }}>
                                <span className="material-symbols-outlined text-yellow-400">redeem</span>
                                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
                            </h2>
                            <button onClick={() => { setShowCreateModal(false); setEditingReward(null); }} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={editingReward ? handleUpdate : handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nombre *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Descripción *</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 focus:outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Costo (tokens) *</label>
                                    <input type="number" min="1" value={formData.tokenCost} onChange={e => setFormData({ ...formData, tokenCost: parseInt(e.target.value) || 0 })} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Stock *</label>
                                    <input type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 focus:outline-none">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">URL Imagen (opcional)</label>
                                <input type="url" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 focus:outline-none" />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="size-5 rounded bg-white/5 border-white/20 text-yellow-400 focus:ring-yellow-400" />
                                <span className="text-sm text-gray-300">Activo (visible para usuarios)</span>
                            </label>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowCreateModal(false); setEditingReward(null); }}
                                    className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-bold hover:bg-white/10 transition-all">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-lg font-bold transition-all"
                                    style={{ background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                                    {editingReward ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardManagement;
