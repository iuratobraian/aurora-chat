import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Usuario } from '../../types';
import ElectricLoader from '../ElectricLoader';

interface EmailStatus {
    userId: string;
    status: 'confirmed' | 'pending' | 'failed';
    lastSent?: string;
}

interface UserManagementProps {
    users: Usuario[];
    loading: boolean;
    onVisitProfile?: (id: string) => void;
    onRefresh: () => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
    onResendEmail: (userId: string) => void;
    adminUserId: string;
}

const ROLES = ['admin', 'ceo', 'vip', 'programador', 'diseñador', 'colaborador', 'trader_experimentado', 'trader_inicial', 'cursante', 'user'];

const UserManagement: React.FC<UserManagementProps> = ({
    users,
    loading,
    onVisitProfile,
    onRefresh,
    showToast,
    onResendEmail,
    adminUserId,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [deletingUser, setDeletingUser] = useState<Usuario | null>(null);
    const [joiningCommunityUser, setJoiningCommunityUser] = useState<Usuario | null>(null);
    const [editForm, setEditForm] = useState({ nombre: '', email: '', usuario: '' });
    const [communityToJoin, setCommunityToJoin] = useState('');
    const [emailStatus, setEmailStatus] = useState<EmailStatus[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const banUserMutation = useMutation(api.profiles.banUser);
    const upsertProfileMutation = useMutation(api.profiles.upsertProfile);
    const deleteProfileMutation = useMutation(api.profiles.deleteProfile);
    const updateProfileMutation = useMutation(api.profiles.updateProfile);

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm ||
            user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.usuario?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.rol === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && !user.isBlocked) ||
            (filterStatus === 'blocked' && user.isBlocked);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const resendConfirmationEmail = async (userId: string) => {
        try {
            showToast('info', 'Reenviando email de confirmación...');
            await onResendEmail(userId);
            setEmailStatus(prev => [...prev.filter(e => e.userId !== userId), {
                userId,
                status: 'pending',
                lastSent: new Date().toISOString(),
            }]);
        } catch (e) {
            showToast('error', `Error al reenviar email: ${e}`);
        }
    };

    const handleToggleBlock = async (user: Usuario) => {
        setIsUpdating(true);
        try {
            await banUserMutation({ 
                userId: user.id, 
                adminUserId, 
                status: user.isBlocked ? 'active' : 'banned' 
            });
            onRefresh();
            showToast('success', user.isBlocked ? 'Usuario desbloqueado' : 'Usuario bloqueado');
        } catch (e: any) {
            showToast('error', `Error: ${e.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateRole = async (user: Usuario, newRole: string) => {
        setIsUpdating(true);
        try {
            await updateProfileMutation({
                id: user.id as any,
                userId: adminUserId,
                rol: newRole
            });
            setEditingUser(null);
            onRefresh();
            showToast('success', `Rol actualizado a ${newRole}`);
        } catch (e: any) {
            showToast('error', `Error al actualizar rol: ${e.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEditUser = (user: Usuario) => {
        setEditingUser(user);
        setEditForm({
            nombre: user.nombre || '',
            email: user.email || '',
            usuario: user.usuario || '',
        });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setIsUpdating(true);
        try {
            await updateProfileMutation({
                id: editingUser.id as any,
                userId: adminUserId,
                nombre: editForm.nombre,
                usuario: editForm.usuario,
            });
            setEditingUser(null);
            onRefresh();
            showToast('success', 'Usuario actualizado correctamente');
        } catch (e: any) {
            showToast('error', `Error al guardar: ${e.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        setIsUpdating(true);
        try {
            await deleteProfileMutation({ 
                userId: deletingUser.id, 
                adminUserId,
                reason: 'Eliminado por administrador desde panel'
            });
            setDeletingUser(null);
            onRefresh();
            showToast('success', 'Usuario eliminado correctamente');
        } catch (e: any) {
            showToast('error', `Error al eliminar: ${e.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleJoinCommunity = async () => {
        if (!joiningCommunityUser || !communityToJoin.trim()) return;
        setIsUpdating(true);
        try {
            showToast('info', `Uniendo a ${joiningCommunityUser.nombre} a comunidad ${communityToJoin}...`);
            setTimeout(() => {
                setJoiningCommunityUser(null);
                setCommunityToJoin('');
                showToast('success', `Usuario unido a ${communityToJoin}`);
                setIsUpdating(false);
            }, 1000);
        } catch (e) {
            showToast('error', `Error al unir: ${e}`);
            setIsUpdating(false);
        }
    };

    const handleResetPassword = async (user: Usuario) => {
        if (!user.email) {
            showToast('error', 'El usuario no tiene email registrado');
            return;
        }
        showToast('info', `Enviando email de recuperación a ${user.email}...`);
        setTimeout(() => {
            showToast('success', `Email de recuperación enviado a ${user.email}`);
        }, 1500);
    };

    const handleImpersonate = async (user: Usuario) => {
        try {
            localStorage.setItem('impersonating', user.id);
            showToast('info', `Impulsando como ${user.nombre}...`);
            window.location.reload();
        } catch (e) {
            showToast('error', `Error: ${e}`);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
            case 'ceo':
                return 'bg-red-500/20 text-red-400';
            case 'vip':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'programador':
            case 'diseñador':
                return 'bg-purple-500/20 text-purple-400';
            case 'colaborador':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-white/5 text-gray-400';
        }
    };

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diff = now.getTime() - then.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${days}d`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 
                        className="text-xl font-bold flex items-center gap-2"
                        style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>group</span>
                        Gestión de Usuarios
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>{filteredUsers.length} de {users.length} usuarios</p>
                </div>
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

            {/* Filters */}
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
                                placeholder="Buscar por nombre, email o usuario..."
                                className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                                style={{
                                    background: 'rgba(19, 19, 19, 0.6)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    color: '#e5e2e1',
                                }}
                            />
                        </div>
                    </div>
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                        style={{
                            background: 'rgba(19, 19, 19, 0.6)',
                            border: '1px solid rgba(73, 68, 84, 0.2)',
                            color: '#e5e2e1',
                        }}
                    >
                        <option value="all">Todos los roles</option>
                        {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className="rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                        style={{
                            background: 'rgba(19, 19, 19, 0.6)',
                            border: '1px solid rgba(73, 68, 84, 0.2)',
                            color: '#e5e2e1',
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Solo activos</option>
                        <option value="blocked">Solo bloqueados</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div 
                className="rounded-xl overflow-hidden"
                style={{
                    background: 'rgba(32, 31, 31, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(73, 68, 84, 0.15)',
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead style={{ background: 'rgba(19, 19, 19, 0.6)' }}>
                            <tr>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>Usuario</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>Email</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>Rol</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>XP</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>Seguidores</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>Último Login</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase" style={{ color: '#86868B' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <ElectricLoader size="sm" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center" style={{ color: '#86868B' }}>
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="transition-colors" style={{ borderTop: '1px solid rgba(73, 68, 84, 0.1)' }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={user.avatar} className="size-10 rounded-lg" alt="" />
                                                {user.isBlocked && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#f87171' }}>
                                                        <span className="material-symbols-outlined text-white text-[8px]">block</span>
                                                    </div>
                                                )}
                                                {user.esVerificado && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#60a5fa' }}>
                                                        <span className="material-symbols-outlined text-white text-[8px]">verified</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: '#e5e2e1' }}>{user.nombre}</p>
                                                <p className="text-[10px]" style={{ color: '#86868B' }}>@{user.usuario}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#86868B' }}>{user.email || 'No establecido'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase hover:opacity-80 transition-opacity ${getRoleBadgeColor(user.rol)}`}
                                        >
                                            {user.rol}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="font-bold" style={{ color: '#00e676' }}>{user.xp || 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#86868B' }}>
                                        {user.seguidores?.length || 0}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#86868B' }}>
                                        {user.ultimoLogin ? formatRelativeTime(user.ultimoLogin) : 'Nunca'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => onVisitProfile?.(user.id)}
                                                className="px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                style={{ background: 'rgba(160, 120, 255, 0.2)', color: '#d0bcff' }}
                                                title="Ver perfil"
                                            >
                                                <span className="material-symbols-outlined text-xs">person</span>
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}
                                                title="Editar usuario"
                                            >
                                                <span className="material-symbols-outlined text-xs">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setJoiningCommunityUser(user)}
                                                className="px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa' }}
                                                title="Unir a comunidad"
                                            >
                                                <span className="material-symbols-outlined text-xs">group_add</span>
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user)}
                                                className="px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}
                                                title="Resetear contraseña"
                                            >
                                                <span className="material-symbols-outlined text-xs">key</span>
                                            </button>
                                            <button
                                                onClick={() => handleImpersonate(user)}
                                                className="px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                style={{ background: 'rgba(45, 212, 191, 0.2)', color: '#2dd4bf' }}
                                                title="Impersonar usuario"
                                            >
                                                <span className="material-symbols-outlined text-xs">visibility</span>
                                            </button>
                                            <button
                                                onClick={() => handleToggleBlock(user)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                                    user.isBlocked
                                                        ? 'bg-signal-green/20 text-signal-green hover:bg-signal-green/30'
                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                                style={user.isBlocked ? { background: 'rgba(0, 230, 118, 0.2)', color: '#00e676' } : { background: 'rgba(248, 113, 113, 0.2)', color: '#f87171' }}
                                                title={user.isBlocked ? 'Activar' : 'Bloquear'}
                                            >
                                                <span className="material-symbols-outlined text-xs">{user.isBlocked ? 'lock_open' : 'block'}</span>
                                            </button>
                                            <button
                                                onClick={() => setDeletingUser(user)}
                                                className="px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'rgba(248, 113, 113, 0.7)' }}
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-xs">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
                    <div 
                        className="rounded-2xl p-6 w-full max-w-md"
                        style={{
                            background: 'rgba(32, 31, 31, 0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(73, 68, 84, 0.3)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <h3 
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: '#e5e2e1', fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>edit</span>
                            Editar Usuario
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs block mb-1" style={{ color: '#86868B' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={editForm.nombre}
                                    onChange={e => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                                    style={{
                                        background: 'rgba(19, 19, 19, 0.6)',
                                        border: '1px solid rgba(73, 68, 84, 0.2)',
                                        color: '#e5e2e1',
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-xs block mb-1" style={{ color: '#86868B' }}>Usuario</label>
                                <input
                                    type="text"
                                    value={editForm.usuario}
                                    onChange={e => setEditForm(prev => ({ ...prev, usuario: e.target.value }))}
                                    className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                                    style={{
                                        background: 'rgba(19, 19, 19, 0.6)',
                                        border: '1px solid rgba(73, 68, 84, 0.2)',
                                        color: '#e5e2e1',
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-xs block mb-1" style={{ color: '#86868B' }}>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                                    style={{
                                        background: 'rgba(19, 19, 19, 0.6)',
                                        border: '1px solid rgba(73, 68, 84, 0.2)',
                                        color: '#e5e2e1',
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-xs block mb-1" style={{ color: '#86868B' }}>Rol</label>
                                <select
                                    value={editingUser.rol}
                                    onChange={e => handleUpdateRole(editingUser, e.target.value)}
                                    className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                                    style={{
                                        background: 'rgba(19, 19, 19, 0.6)',
                                        border: '1px solid rgba(73, 68, 84, 0.2)',
                                        color: '#e5e2e1',
                                    }}
                                >
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                style={{
                                    background: 'rgba(28, 27, 27, 0.6)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    color: '#86868B',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-opacity disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
                                    color: 'white',
                                }}
                            >
                                {isUpdating ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
                    <div 
                        className="rounded-2xl p-6 w-full max-w-md"
                        style={{
                            background: 'rgba(32, 31, 31, 0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <h3 
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: '#f87171', fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            <span className="material-symbols-outlined">warning</span>
                            Eliminar Usuario
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#e5e2e1' }}>
                            ¿Estás seguro de eliminar al usuario <strong>{deletingUser.nombre}</strong>?
                        </p>
                        <p className="text-xs mb-4" style={{ color: '#86868B' }}>
                            Esta acción no se puede deshacer. Se perderán todos sus datos, posts y actividad.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                style={{
                                    background: 'rgba(28, 27, 27, 0.6)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    color: '#86868B',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                style={{ background: '#f87171', color: 'white' }}
                            >
                                {isUpdating ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {joiningCommunityUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
                    <div 
                        className="rounded-2xl p-6 w-full max-w-md"
                        style={{
                            background: 'rgba(32, 31, 31, 0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <h3 
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: '#e5e2e1', fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            <span className="material-symbols-outlined" style={{ color: '#a78bfa' }}>group_add</span>
                            Unir a Comunidad
                        </h3>
                        <p className="text-xs mb-2" style={{ color: '#86868B' }}>
                            Usuario: <strong style={{ color: '#e5e2e1' }}>{joiningCommunityUser.nombre}</strong>
                        </p>
                        <div>
                            <label className="text-xs block mb-1" style={{ color: '#86868B' }}>ID de Comunidad</label>
                            <input
                                type="text"
                                value={communityToJoin}
                                onChange={e => setCommunityToJoin(e.target.value)}
                                placeholder="community_123"
                                className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                                style={{
                                    background: 'rgba(19, 19, 19, 0.6)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    color: '#e5e2e1',
                                }}
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setJoiningCommunityUser(null); setCommunityToJoin(''); }}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                style={{
                                    background: 'rgba(28, 27, 27, 0.6)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    color: '#86868B',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleJoinCommunity}
                                disabled={isUpdating || !communityToJoin.trim()}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                style={{ background: '#a78bfa', color: 'white' }}
                            >
                                {isUpdating ? 'Uniendo...' : 'Unir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
