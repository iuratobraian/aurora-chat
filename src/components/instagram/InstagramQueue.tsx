import React from 'react';

export interface QueuedPost {
    id: string;
    caption: string;
    mediaUrl?: string;
    scheduledAt: number;
    accountUsername: string;
    status: 'pending' | 'processing' | 'failed';
    errorMessage?: string;
}

interface InstagramQueueProps {
    posts: QueuedPost[];
    onCancel?: (postId: string) => void;
    onRetry?: (postId: string) => void;
    onEdit?: (postId: string) => void;
    className?: string;
}

export default function InstagramQueue({ 
    posts,
    onCancel,
    onRetry,
    onEdit,
    className = '' 
}: InstagramQueueProps) {
    const formatDateTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeUntil = (timestamp: number) => {
        const diff = timestamp - Date.now();
        if (diff < 0) return 'Ahora';
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `En ${minutes} min`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `En ${hours}h`;
        
        const days = Math.floor(hours / 24);
        return `En ${days}d`;
    };

    const getStatusBadge = (status: QueuedPost['status']) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">Pendiente</span>;
            case 'processing':
                return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs animate-pulse">Procesando...</span>;
            case 'failed':
                return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">Fallido</span>;
        }
    };

    const pendingPosts = posts.filter(p => p.status === 'pending');
    const processingPosts = posts.filter(p => p.status === 'processing');
    const failedPosts = posts.filter(p => p.status === 'failed');

    return (
        <div className={`rounded-xl border border-gray-600 bg-gray-800/50 ${className}`}>
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-lg">Cola de Publicaciones</h2>
                        <p className="text-sm text-gray-400">
                            {pendingPosts.length} programada(s) • {processingPosts.length} procesando
                        </p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-700">
                {posts.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="text-4xl mb-3 block">📭</span>
                        <p className="text-gray-400">No hay publicaciones en cola</p>
                        <p className="text-sm text-gray-500">Crea una publicación para programarla</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="p-4">
                            <div className="flex gap-4">
                                {/* Media Preview */}
                                <div className="w-16 h-16 rounded-lg bg-gray-700 flex-shrink-0 overflow-hidden">
                                    {post.mediaUrl ? (
                                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            📝
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium">@{post.accountUsername}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                                {post.caption || 'Sin caption'}
                                            </p>
                                        </div>
                                        {getStatusBadge(post.status)}
                                    </div>

                                    {/* Schedule Info */}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span>📅 {formatDateTime(post.scheduledAt)}</span>
                                        {post.status === 'pending' && (
                                            <span className="text-purple-400 font-medium">
                                                {getTimeUntil(post.scheduledAt)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {post.status === 'failed' && post.errorMessage && (
                                        <p className="text-xs text-red-400 mt-2">
                                            ⚠️ {post.errorMessage}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3">
                                        {post.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => onEdit?.(post.id)}
                                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => onCancel?.(post.id)}
                                                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    🗑 Cancelar
                                                </button>
                                            </>
                                        )}
                                        {post.status === 'failed' && (
                                            <button
                                                onClick={() => onRetry?.(post.id)}
                                                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs font-medium rounded-lg transition-colors"
                                            >
                                                🔄 Reintentar
                                            </button>
                                        )}
                                        {post.status === 'processing' && (
                                            <span className="px-3 py-1.5 bg-gray-700 text-gray-400 text-xs font-medium rounded-lg">
                                                ⏳ Procesando...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
