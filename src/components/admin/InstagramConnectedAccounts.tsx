import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const InstagramConnectedAccounts: React.FC = () => {
    const allAccounts = useQuery(api["instagram/accounts"]?.getAllConnectedAccounts);
    const stats = useQuery(api["instagram/accounts"]?.getInstagramStats);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    if (stats === undefined) {
        return (
            <div className="p-4 text-center text-gray-400">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <p className="mt-2 text-sm">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                        <span className="text-xs uppercase text-gray-400">Total</span>
                    </div>
                    <p className="text-2xl font-black text-white">{stats.totalAccounts}</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <span className="text-xs uppercase text-green-400">Conectadas</span>
                    </div>
                    <p className="text-2xl font-black text-green-400">{stats.connectedAccounts}</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <span className="text-xs uppercase text-red-400">Desconectadas</span>
                    </div>
                    <p className="text-2xl font-black text-red-400">{stats.disconnectedAccounts}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-yellow-400">group</span>
                        <span className="text-xs uppercase text-gray-400">Seguidores</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        {stats.totalFollowers >= 1000000 
                            ? `${(stats.totalFollowers / 1000000).toFixed(1)}M` 
                            : stats.totalFollowers >= 1000 
                                ? `${(stats.totalFollowers / 1000).toFixed(1)}K` 
                                : stats.totalFollowers}
                    </p>
                </div>
            </div>

            {/* Connected Accounts List */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">link</span>
                    Cuentas Conectadas
                </h3>

                {allAccounts && allAccounts.length > 0 ? (
                    <div className="space-y-2">
                        {allAccounts.map((account: any) => (
                            <div
                                key={account._id}
                                className={`bg-white/5 rounded-xl p-4 border transition-all cursor-pointer ${
                                    selectedAccount === account._id 
                                        ? 'border-primary/50 bg-primary/10' 
                                        : 'border-white/10 hover:border-white/20'
                                }`}
                                onClick={() => setSelectedAccount(
                                    selectedAccount === account._id ? null : account._id
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative">
                                        {account.profilePicture ? (
                                            <img 
                                                src={account.profilePicture} 
                                                alt={account.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {account.username?.[0]?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0f1115] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-xs">check</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white truncate">
                                                @{account.username}
                                            </p>
                                            {account.isBusiness && (
                                                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[8px] font-bold">
                                                    BUSINESS
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {account.biography || 'Sin biografía'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">group</span>
                                                {account.followers?.toLocaleString() || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">image</span>
                                                {account.totalPosts || 0}
                                            </span>
                                            {account.autoPostEnabled && (
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                                    AutoPost
                                                </span>
                                            )}
                                            {account.aiAutoReply && (
                                                <span className="flex items-center gap-1 text-purple-400">
                                                    <span className="material-symbols-outlined text-xs">psychology</span>
                                                    AI Reply
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <span className="material-symbols-outlined text-gray-500">
                                        {selectedAccount === account._id ? 'expand_less' : 'expand_more'}
                                    </span>
                                </div>

                                {/* Expanded Info */}
                                {selectedAccount === account._id && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-gray-500">User ID:</span>
                                                <p className="text-gray-300 font-mono truncate">{account.userId}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Instagram ID:</span>
                                                <p className="text-gray-300 font-mono truncate">{account.instagramId}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Creado:</span>
                                                <p className="text-gray-300">
                                                    {account.createdAt 
                                                        ? new Date(account.createdAt).toLocaleDateString('es-ES')
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Última sincronización:</span>
                                                <p className="text-gray-300">
                                                    {account.updatedAt 
                                                        ? new Date(account.updatedAt).toLocaleDateString('es-ES')
                                                        : 'Nunca'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/20">
                        <span className="material-symbols-outlined text-4xl text-gray-600">link_off</span>
                        <p className="mt-2 text-sm text-gray-400">No hay cuentas conectadas</p>
                        <p className="text-xs text-gray-500">Los usuarios pueden conectar sus cuentas de Instagram desde su perfil</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstagramConnectedAccounts;
