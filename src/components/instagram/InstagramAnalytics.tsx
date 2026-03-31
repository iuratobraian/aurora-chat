import React from 'react';

export interface InstagramStats {
    followers: number;
    followersChange: number;
    posts: number;
    postsChange: number;
    engagement: number;
    engagementChange: number;
    reach: number;
    reachChange: number;
    impressions: number;
    impressionsChange: number;
    profileViews: number;
    profileViewsChange: number;
    topPosts: TopPost[];
    weeklyData: WeeklyData[];
}

export interface TopPost {
    id: string;
    imageUrl: string;
    likes: number;
    comments: number;
    caption: string;
}

export interface WeeklyData {
    day: string;
    followers: number;
    engagement: number;
}

interface InstagramAnalyticsProps {
    stats: InstagramStats;
    username: string;
    period?: '7d' | '30d' | '90d';
    onPeriodChange?: (period: '7d' | '30d' | '90d') => void;
    onExport?: (format: 'csv' | 'json') => void;
    className?: string;
}

export default function InstagramAnalytics({ 
    stats,
    username,
    period = '30d',
    onPeriodChange,
    onExport,
    className = '' 
}: InstagramAnalyticsProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    };

    const StatCard = ({ icon, label, value, change }: { icon: string; label: string; value: number; change: number }) => (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {formatChange(change)}
                </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(value)}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    );

    const maxEngagement = Math.max(...stats.weeklyData.map(d => d.engagement));

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-bold text-xl">Analytics</h2>
                    <p className="text-sm text-gray-400">@{username}</p>
                </div>

                {/* Period Selector */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                    {(['7d', '30d', '90d'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange?.(p)}
                            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                                period === p ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon="👥" label="Seguidores" value={stats.followers} change={stats.followersChange} />
                <StatCard icon="📝" label="Publicaciones" value={stats.posts} change={stats.postsChange} />
                <StatCard icon="❤️" label="Engagement" value={stats.engagement} change={stats.engagementChange} />
                <StatCard icon="👁️" label="Alcance" value={stats.reach} change={stats.reachChange} />
                <StatCard icon="📊" label="Impresiones" value={stats.impressions} change={stats.impressionsChange} />
                <StatCard icon="👀" label="Visitas Perfil" value={stats.profileViews} change={stats.profileViewsChange} />
            </div>

            {/* Chart */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold mb-4">Rendimiento semanal</h3>
                <div className="h-48 flex items-end gap-2">
                    {stats.weeklyData.map((data, index) => {
                        const height = maxEngagement > 0 ? (data.engagement / maxEngagement) * 100 : 0;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center h-36">
                                    <div 
                                        className="w-full max-w-8 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400">{data.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Posts */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold mb-4">Top Publicaciones</h3>
                <div className="space-y-3">
                    {stats.topPosts.map((post, index) => (
                        <div key={post.id} className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
                            <span className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                ${index === 0 ? 'bg-yellow-500 text-black' : ''}
                                ${index === 1 ? 'bg-gray-400 text-black' : ''}
                                ${index === 2 ? 'bg-orange-600 text-white' : ''}
                                ${index > 2 ? 'bg-gray-700 text-gray-300' : ''}
                            `}>
                                {index + 1}
                            </span>
                            <img 
                                src={post.imageUrl} 
                                alt="" 
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{post.caption}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    ❤️ {formatNumber(post.likes)} • 💬 {formatNumber(post.comments)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Export Button */}
            <div className="flex gap-2">
                <button 
                    onClick={() => onExport?.('csv')}
                    className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <span>📥</span>
                    <span>Exportar CSV</span>
                </button>
                <button 
                    onClick={() => onExport?.('json')}
                    className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <span>📄</span>
                    <span>Exportar JSON</span>
                </button>
            </div>
        </div>
    );
}
