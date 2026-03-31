import React, { memo, useState, useCallback } from 'react';
import { Publicacion } from '../types';
import { distributionService, type DistributionChannel, type DistributionTarget } from '../services/distribution';

interface DistributionPanelProps {
    content: Publicacion;
    onDistribute?: (targets: DistributionTarget[]) => void;
    compact?: boolean;
}

const ChannelCard: React.FC<{
    channel: DistributionChannel;
    selected: boolean;
    onToggle: () => void;
    estimatedReach: number;
}> = memo(({
    channel,
    selected,
    onToggle,
    estimatedReach,
}) => (
    <label className={`
        flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all
        ${selected
            ? 'bg-primary/10 border-2 border-primary'
            : 'bg-white/5 border border-white/10 hover:border-white/20'
        }
    `}>
        <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="mt-1 accent-primary"
        />
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{channel.name}</span>
                <span className="text-xs text-gray-400">{channel.reach.toLocaleString()} reach</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Engagement: {(channel.engagement * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
                Est. reach: {estimatedReach.toLocaleString()}
            </p>
        </div>
    </label>
));

ChannelCard.displayName = 'ChannelCard';

export const DistributionPanel: React.FC<DistributionPanelProps> = memo(({
    content,
    onDistribute,
    compact = false,
}) => {
    const channels = distributionService.getChannels();
    const enabledChannels = distributionService.getEnabledChannels();
    
    const [selectedChannels, setSelectedChannels] = useState<Set<string>>(
        new Set(['community-feed', 'communities'])
    );
    const [includeMedia, setIncludeMedia] = useState(true);
    const [isDistributing, setIsDistributing] = useState(false);
    const [distributeResult, setDistributeResult] = useState<{
        totalReach: number;
        totalEngagement: number;
    } | null>(null);

    const toggleChannel = useCallback((channelId: string) => {
        setSelectedChannels(prev => {
            const next = new Set(prev);
            if (next.has(channelId)) {
                next.delete(channelId);
            } else {
                next.add(channelId);
            }
            return next;
        });
    }, []);

    const handleDistribute = useCallback(async () => {
        setIsDistributing(true);
        setDistributeResult(null);

        try {
            const targets: DistributionTarget[] = Array.from(selectedChannels).map(channelId => ({
                channelId,
                includeMedia,
            }));

            const result = distributionService.distribute(content, targets);
            
            setDistributeResult({
                totalReach: result.totalReach,
                totalEngagement: result.totalEngagement,
            });

            onDistribute?.(targets);
        } catch (error) {
            console.error('Distribution error:', error);
        } finally {
            setIsDistributing(false);
        }
    }, [content, selectedChannels, includeMedia, onDistribute]);

    const calculateEstimatedReach = (channel: DistributionChannel): number => {
        let reach = channel.reach;

        if (content.par && content.par !== 'GENERAL') {
            reach *= 1.2;
        }

        if ((content.likes?.length || 0) > 10) {
            reach *= 1.5;
        }

        return Math.round(reach);
    };

    const totalEstimatedReach = enabledChannels
        .filter(c => selectedChannels.has(c.id))
        .reduce((sum, c) => sum + calculateEstimatedReach(c), 0);

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                    {selectedChannels.size} canales • ~{totalEstimatedReach.toLocaleString()} reach
                </span>
                <button
                    onClick={handleDistribute}
                    disabled={isDistributing || selectedChannels.size === 0}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                    {isDistributing ? 'Distributing...' : 'Share'}
                </button>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Distribuir Contenido
                </h3>
                <span className="text-xs text-gray-500">
                    ~{totalEstimatedReach.toLocaleString()} reach estimado
                </span>
            </div>

            <div className="space-y-2 mb-4">
                {channels.map(channel => (
                    <ChannelCard
                        key={channel.id}
                        channel={channel}
                        selected={selectedChannels.has(channel.id)}
                        onToggle={() => toggleChannel(channel.id)}
                        estimatedReach={calculateEstimatedReach(channel)}
                    />
                ))}
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={includeMedia}
                    onChange={(e) => setIncludeMedia(e.target.checked)}
                    className="accent-primary"
                />
                <span className="text-xs text-gray-400">Incluir imágenes y videos</span>
            </label>

            {distributeResult && (
                <div className="mb-4 p-3 rounded-xl bg-signal-green/10 border border-signal-green/20">
                    <p className="text-xs font-bold text-signal-green">
                        Distribuido exitosamente!
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Alcance: {distributeResult.totalReach.toLocaleString()} • 
                        Engagement: {(distributeResult.totalEngagement * 100).toFixed(1)}%
                    </p>
                </div>
            )}

            <button
                onClick={handleDistribute}
                disabled={isDistributing || selectedChannels.size === 0}
                className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
                {isDistributing ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        Distribuyendo...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">send</span>
                        Distribuir ahora
                    </span>
                )}
            </button>
        </div>
    );
});

DistributionPanel.displayName = 'DistributionPanel';

export default DistributionPanel;
