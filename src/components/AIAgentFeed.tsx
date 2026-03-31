import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import logger from '../utils/logger';

interface AIPost {
    _id: any;
    titulo: string;
    contenido: string;
    categoria: string;
    par?: string;
    imagenUrl?: string;
    sentiment?: string;
    createdAt: number;
    likes: string[];
    comentarios: any[];
    views?: number;
}

const sentimentConfig = {
    Bullish: { color: 'text-signal-green', bg: 'bg-signal-green/10', icon: '📈' },
    Bearish: { color: 'text-alert-red', bg: 'bg-alert-red/10', icon: '📉' },
    Neutral: { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: '➡️' },
};

const categoryConfig: Record<string, { icon: string; color: string }> = {
    'Crypto': { icon: '₿', color: 'text-orange-400' },
    'Forex': { icon: '💱', color: 'text-blue-400' },
    'Commodities': { icon: '🛢️', color: 'text-amber-400' },
    'Indices': { icon: '📊', color: 'text-green-400' },
    'IA Analysis': { icon: '🤖', color: 'text-purple-400' },
    'News': { icon: '📰', color: 'text-cyan-400' },
    'default': { icon: '📈', color: 'text-gray-400' },
};

export default function AIAgentFeed() {
    const [filter, setFilter] = useState<'all' | 'crypto' | 'forex' | 'analysis'>('all');
    const [showPending, setShowPending] = useState(false);
    const [selectedPost, setSelectedPost] = useState<AIPost | null>(null);

    const publishedPosts = useQuery(api.aiAgent.getPublishedPosts) || [];
    const pendingPosts = useQuery(api.aiAgent.getPendingPosts) || [];
    const agentConfig = useQuery(api.aiAgent.getAIAgentConfig);
    
    const generateNewsAction = useMutation(api.aiAgent.toggleAgentStatus);
    const approvePostMutation = useMutation(api.aiAgent.approvePendingPost);
    const rejectPostMutation = useMutation(api.aiAgent.rejectPendingPost);

    const filteredPosts = publishedPosts.filter((post: AIPost) => {
        if (filter === 'all') return true;
        if (filter === 'crypto') return post.categoria === 'Crypto';
        if (filter === 'forex') return post.categoria === 'Forex';
        if (filter === 'analysis') return post.categoria === 'IA Analysis';
        return true;
    });

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    const handleApprove = async (postId: any) => {
        try {
            await approvePostMutation({ id: postId });
        } catch (e) {
            logger.error('Error approving post:', e);
        }
    };

    const handleReject = async (postId: any) => {
        try {
            await rejectPostMutation({ id: postId });
        } catch (e) {
            logger.error('Error rejecting post:', e);
        }
    };

    const getSentimentStyle = (sentiment?: string) => {
        const key = (sentiment as keyof typeof sentimentConfig) || 'Neutral';
        return sentimentConfig[key] || sentimentConfig.Neutral;
    };

    const getCategoryStyle = (categoria: string) => {
        return categoryConfig[categoria] || categoryConfig.default;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-white">AI Agent Feed</h2>
                        <p className="text-xs text-gray-400">
                            {agentConfig?.enabled ? (
                                <span className="text-signal-green">● Activo</span>
                            ) : (
                                <span className="text-gray-500">○ Inactivo</span>
                            )}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPending(!showPending)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            showPending 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Pendientes ({pendingPosts.length})
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'crypto', label: '₿ Crypto' },
                    { id: 'forex', label: '💱 Forex' },
                    { id: 'analysis', label: '🤖 Análisis' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                            filter === f.id
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Pending Posts Panel */}
            {showPending && pendingPosts.length > 0 && (
                <div className="glass rounded-xl border border-orange-500/20 p-4 space-y-3">
                    <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        Posts Pendientes de Aprobación
                    </h3>
                    {pendingPosts.map((post: any) => (
                        <div key={post._id} className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white line-clamp-1">{post.titulo}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">{post.contenido}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                    Programado: {new Date(post.programedAt).toLocaleString('es-ES')}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(post._id)}
                                        className="px-3 py-1 bg-signal-green/20 text-signal-green rounded-lg font-bold hover:bg-signal-green/30 transition-colors"
                                    >
                                        ✓ Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleReject(post._id)}
                                        className="px-3 py-1 bg-alert-red/20 text-alert-red rounded-lg font-bold hover:bg-alert-red/30 transition-colors"
                                    >
                                        ✗ Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-3">
                {filteredPosts.length === 0 ? (
                    <div className="glass rounded-xl border border-white/5 p-8 text-center">
                        <span className="text-4xl mb-3 block">🤖</span>
                        <p className="text-gray-400 text-sm">No hay posts de AI Agent todavía</p>
                        <p className="text-gray-500 text-xs mt-1">Los posts aparecerán automáticamente según la programación</p>
                    </div>
                ) : (
                    filteredPosts.map((post: AIPost) => {
                        const sentimentStyle = getSentimentStyle(post.sentiment);
                        const categoryStyle = getCategoryStyle(post.categoria);
                        
                        return (
                            <div
                                key={post._id}
                                onClick={() => setSelectedPost(post)}
                                className="glass rounded-[1.5rem] border border-white/5 p-5 bg-black/40 backdrop-blur-2xl hover:bg-white/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-500 cursor-pointer group relative overflow-hidden"
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                            <span className="text-sm">🤖</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white">AI Agent</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${sentimentStyle.bg} ${sentimentStyle.color}`}>
                                                    {sentimentStyle.icon} {post.sentiment || 'Neutral'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`${categoryStyle.color} text-xs`}>
                                            {categoryStyle.icon} {post.categoria}
                                        </span>
                                        {post.par && (
                                            <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                                                {post.par}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    {post.titulo}
                                </h3>
                                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                                    {post.contenido}
                                </p>

                                {/* Image */}
                                {post.imagenUrl && (
                                    <div className="mt-3 rounded-lg overflow-hidden">
                                        <img
                                            src={post.imagenUrl}
                                            alt=""
                                            className="w-full h-32 object-cover"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors">
                                            <span className="text-sm">❤️</span>
                                            <span className="text-xs">{post.likes?.length || 0}</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                                            <span className="text-sm">💬</span>
                                            <span className="text-xs">{post.comentarios?.length || 0}</span>
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-gray-500">
                                        {post.views || 0} vistas
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="glass rounded-2xl border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                        <span className="text-xl">🤖</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-white">AI Agent</span>
                                        <p className="text-xs text-gray-500">{new Date(selectedPost.createdAt).toLocaleString('es-ES')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Sentiment Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getSentimentStyle(selectedPost.sentiment).bg} ${getSentimentStyle(selectedPost.sentiment).color}`}>
                                    {getSentimentStyle(selectedPost.sentiment).icon} {selectedPost.sentiment || 'Neutral'}
                                </span>
                                <span className={`${getCategoryStyle(selectedPost.categoria).color} text-xs`}>
                                    {getCategoryStyle(selectedPost.categoria).icon} {selectedPost.categoria}
                                </span>
                                {selectedPost.par && (
                                    <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                                        {selectedPost.par}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-bold text-white mb-3">{selectedPost.titulo}</h2>

                            {/* Image */}
                            {selectedPost.imagenUrl && (
                                <img
                                    src={selectedPost.imagenUrl}
                                    alt=""
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                            )}

                            {/* Content */}
                            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {selectedPost.contenido}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">❤️</span>
                                    <span className="text-sm text-gray-400">{selectedPost.likes?.length || 0} likes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">💬</span>
                                    <span className="text-sm text-gray-400">{selectedPost.comentarios?.length || 0} comentarios</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">👁️</span>
                                    <span className="text-sm text-gray-400">{selectedPost.views || 0} vistas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
