import React, { memo } from 'react';

interface PostCardAIAgentProps {
    post: {
        titulo?: string;
        contenido: string;
        categoria?: string;
        sentiment?: string;
        par?: string;
        fuente?: string;
        tags?: string[];
        etiquetas?: string[];
        tiempo?: string;
    };
}

export const PostCardAIAgent: React.FC<PostCardAIAgentProps> = memo(({ post }) => {
    const getSentimentStyles = (sentiment?: string) => {
        switch (sentiment) {
            case 'Bullish':
                return {
                    bg: 'bg-gradient-to-br from-emerald-900/50 via-teal-900/40 to-emerald-800/50',
                    border: 'border-emerald-500/20',
                    icon: 'text-emerald-300',
                    text: 'text-emerald-400',
                    bar: 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                };
            case 'Bearish':
                return {
                    bg: 'bg-gradient-to-br from-red-900/50 via-rose-900/40 to-red-800/50',
                    border: 'border-red-500/20',
                    icon: 'text-red-300',
                    text: 'text-red-400',
                    bar: 'bg-gradient-to-b from-red-400 to-red-600'
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-purple-900/40',
                    border: 'border-white/10',
                    icon: 'text-indigo-300',
                    text: 'text-indigo-300',
                    bar: 'bg-gradient-to-b from-indigo-400 to-indigo-600'
                };
        }
    };

    const styles = getSentimentStyles(post.sentiment);

    const getCategoryStyle = (categoria?: string) => {
        switch (categoria) {
            case 'Crypto': return 'bg-orange-500/20 text-orange-400';
            case 'Forex': return 'bg-blue-500/20 text-blue-400';
            case 'Commodities': return 'bg-amber-500/20 text-amber-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getSentimentLabel = (sentiment?: string) => {
        switch (sentiment) {
            case 'Bullish': return '📈 Tendencia Alcista';
            case 'Bearish': return '📉 Tendencia Bajista';
            default: return '📰 Análisis IA';
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl">
            <div className={`absolute inset-0 backdrop-blur-xl border ${styles.bg} ${styles.border}`} />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl" />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`size-11 rounded-xl flex items-center justify-center shadow-lg ${
                            post.sentiment === 'Bullish' ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 shadow-emerald-500/20' :
                            post.sentiment === 'Bearish' ? 'bg-gradient-to-br from-red-500/30 to-rose-500/30 border border-red-500/30 shadow-red-500/20' :
                            'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/20 shadow-indigo-500/20'
                        }`}>
                            <span className={`material-symbols-outlined text-lg ${styles.icon}`}>newspaper</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${styles.text}`}>
                                    {getSentimentLabel(post.sentiment)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400">{post.tiempo}</span>
                                <span className="size-1 rounded-full bg-gray-500" />
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getCategoryStyle(post.categoria)}`}>
                                    {post.categoria}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {post.par && (
                            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-gray-300">{post.par}</span>
                            </span>
                        )}
                        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <span className="text-[10px] font-bold text-gray-300">Resumen</span>
                        </span>
                    </div>
                </div>

                {/* Breaking News Badge */}
                {(post.etiquetas?.includes('Breaking') || post.etiquetas?.includes('Urgente')) && (
                    <div className="mb-4 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2">
                        <span className="animate-pulse">
                            <span className="size-2 rounded-full bg-red-500" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Última Hora</span>
                    </div>
                )}

                {/* Title */}
                <div className="flex items-start gap-3 mb-4">
                    <div className={`mt-1 flex-shrink-0 w-1.5 h-12 rounded-full ${styles.bar}`} />
                    <h3 className="font-black text-xl text-white leading-tight tracking-tight flex-1">
                        {post.titulo}
                    </h3>
                </div>

                {/* Content */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 backdrop-blur-sm mb-4">
                    <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {post.contenido}
                    </p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="size-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400 text-xs">source</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Fuente</span>
                            <p className="text-xs text-gray-300 font-medium">{post.fuente || 'Investing.com'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors group">
                        <span className="text-xs font-semibold">Ver análisis</span>
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PostCardAIAgent;