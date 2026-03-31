import React from 'react';
import { Avatar } from '../Avatar';

export interface InstagramAccount {
    id: string;
    username: string;
    avatarUrl: string;
    followers: number;
    posts: number;
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: number;
}

interface InstagramAccountCardProps {
    account: InstagramAccount;
    onDisconnect?: () => void;
    onRefresh?: () => void;
    onManage?: () => void;
    className?: string;
}

export default function InstagramAccountCard({ 
    account, 
    onDisconnect, 
    onRefresh,
    onManage,
    className = '' 
}: InstagramAccountCardProps) {
    const formatLastSync = (timestamp?: number) => {
        if (!timestamp) return 'Nunca';
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${Math.floor(hours / 24)}d`;
    };

    const getStatusBadge = () => {
        switch (account.status) {
            case 'connected':
                return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">✓ Conectado</span>;
            case 'disconnected':
                return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">Desconectado</span>;
            case 'error':
                return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">⚠ Error</span>;
        }
    };

    return (
        <div className={`rounded-xl border bg-gray-800/50 p-4 ${account.status === 'error' ? 'border-red-500/50' : 'border-gray-600'} ${className}`}>
            <div className="flex items-start gap-4">
                <div className="relative">
                    <Avatar 
                        src={account.avatarUrl}
                        name={account.username}
                        seed={account.username}
                        size="2xl"
                        rounded="full"
                        className="border-2 border-gray-600"
                    />
                    {account.status === 'connected' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg truncate">@{account.username}</h3>
                        {getStatusBadge()}
                    </div>

                    <div className="flex gap-4 text-sm text-gray-400 mb-3">
                        <span><strong className="text-white">{account.followers.toLocaleString()}</strong> seguidores</span>
                        <span><strong className="text-white">{account.posts.toLocaleString()}</strong> posts</span>
                    </div>

                    <p className="text-xs text-gray-500">
                        Última sincronización: {formatLastSync(account.lastSync)}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                    onClick={onManage}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Gestionar
                </button>
                <button
                    onClick={onRefresh}
                    disabled={account.status !== 'connected'}
                    className="py-2 px-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    title="Sincronizar"
                >
                    🔄
                </button>
                <button
                    onClick={onDisconnect}
                    className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                    title="Desconectar"
                >
                    🔗
                </button>
            </div>
        </div>
    );
}
