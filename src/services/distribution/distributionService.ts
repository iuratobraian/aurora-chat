import { Publicacion } from '../../types';
import logger from '../../utils/logger';

export interface DistributionChannel {
    id: string;
    name: string;
    type: 'community' | 'social' | 'email' | 'rss';
    enabled: boolean;
    reach: number;
    engagement: number;
}

export interface DistributionTarget {
    channelId: string;
    scheduledAt?: number;
    message?: string;
    includeMedia: boolean;
}

export interface DistributionResult {
    channelId: string;
    success: boolean;
    url?: string;
    error?: string;
    reach?: number;
}

export interface CreatorFlywheel {
    contentId: string;
    distributionTargets: DistributionTarget[];
    results: DistributionResult[];
    totalReach: number;
    totalEngagement: number;
}

export interface FlywheelMetrics {
    totalPosts: number;
    totalReach: number;
    avgEngagement: number;
    topChannel: string;
    topContent: { id: string; reach: number };
    growthRate: number;
}

class DistributionService {
    private channels: Map<string, DistributionChannel> = new Map();

    constructor() {
        this.initializeDefaultChannels();
    }

    private initializeDefaultChannels() {
        this.channels.set('community-feed', {
            id: 'community-feed',
            name: 'Feed Principal',
            type: 'community',
            enabled: true,
            reach: 1000,
            engagement: 0.15,
        });
        this.channels.set('communities', {
            id: 'communities',
            name: 'Mis Comunidades',
            type: 'community',
            enabled: true,
            reach: 500,
            engagement: 0.25,
        });
        this.channels.set('trending', {
            id: 'trending',
            name: 'Trending',
            type: 'community',
            enabled: true,
            reach: 2000,
            engagement: 0.08,
        });
    }

    getChannels(): DistributionChannel[] {
        return Array.from(this.channels.values());
    }

    getEnabledChannels(): DistributionChannel[] {
        return this.getChannels().filter(c => c.enabled);
    }

    enableChannel(channelId: string): boolean {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.enabled = true;
            return true;
        }
        return false;
    }

    disableChannel(channelId: string): boolean {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.enabled = false;
            return true;
        }
        return false;
    }

    calculateReach(content: Publicacion, channels: DistributionChannel[]): number {
        let reach = 0;

        for (const channel of channels) {
            let channelReach = channel.reach;

            if (content.par && content.par !== 'GENERAL') {
                channelReach *= 1.2;
            }

            if (content.isAiAgent) {
                channelReach *= 0.8;
            }

            if (content.likes?.length && content.likes.length > 10) {
                channelReach *= 1.5;
            }

            reach += channelReach;
        }

        return Math.round(reach);
    }

    calculateEngagement(content: Publicacion, channels: DistributionChannel[]): number {
        let totalEngagement = 0;

        for (const channel of channels) {
            let channelEngagement = channel.engagement;

            const likes = content.likes?.length || 0;
            const comments = content.comentarios?.length || 0;
            const shares = content.compartidos || 0;

            const engagement = (likes + comments * 2 + shares * 3) / (channel.reach || 1);
            channelEngagement = Math.min(channelEngagement + engagement, 1);

            totalEngagement += channelEngagement;
        }

        return Math.round(totalEngagement / channels.length * 100) / 100;
    }

    distribute(content: Publicacion, targets: DistributionTarget[]): CreatorFlywheel {
        const results: DistributionResult[] = [];
        let totalReach = 0;
        let totalEngagement = 0;

        for (const target of targets) {
            const channel = this.channels.get(target.channelId);
            
            if (!channel || !channel.enabled) {
                results.push({
                    channelId: target.channelId,
                    success: false,
                    error: 'Channel not found or disabled',
                });
                continue;
            }

            const reach = this.calculateReach(content, [channel]);
            const engagement = this.calculateEngagement(content, [channel]);

            results.push({
                channelId: target.channelId,
                success: true,
                reach,
            });

            totalReach += reach;
            totalEngagement += engagement;
        }

        return {
            contentId: content.id,
            distributionTargets: targets,
            results,
            totalReach,
            totalEngagement,
        };
    }

    async autoDistribute(
        content: Publicacion,
        options?: {
            includeTrending?: boolean;
            includeCommunities?: boolean;
            customTargets?: DistributionTarget[];
        }
    ): Promise<CreatorFlywheel> {
        const targets: DistributionTarget[] = [];

        targets.push({
            channelId: 'community-feed',
            includeMedia: true,
        });

        if (options?.includeCommunities !== false) {
            targets.push({
                channelId: 'communities',
                includeMedia: true,
            });
        }

        if (options?.includeTrending) {
            targets.push({
                channelId: 'trending',
                includeMedia: true,
            });
        }

        if (options?.customTargets) {
            targets.push(...options.customTargets);
        }

        return this.distribute(content, targets);
    }

    getFlywheelMetrics(
        contents: Publicacion[],
        channelMetrics?: Map<string, { reach: number; engagement: number }>
    ): FlywheelMetrics {
        const metrics: FlywheelMetrics = {
            totalPosts: contents.length,
            totalReach: 0,
            avgEngagement: 0,
            topChannel: 'community-feed',
            topContent: { id: '', reach: 0 },
            growthRate: 0,
        };

        let totalEngagement = 0;

        for (const content of contents) {
            const reach = this.calculateReach(content, this.getEnabledChannels());
            const engagement = this.calculateEngagement(content, this.getEnabledChannels());

            metrics.totalReach += reach;
            totalEngagement += engagement;

            if (reach > metrics.topContent.reach) {
                metrics.topContent = { id: content.id, reach };
            }
        }

        if (contents.length > 0) {
            metrics.avgEngagement = Math.round(totalEngagement / contents.length * 100) / 100;
        }

        if (channelMetrics) {
            let maxReach = 0;
            for (const [channelId, data] of channelMetrics) {
                if (data.reach > maxReach) {
                    maxReach = data.reach;
                    metrics.topChannel = channelId;
                }
            }
        }

        const yesterdayReach = metrics.totalReach * 0.9;
        if (yesterdayReach > 0) {
            metrics.growthRate = Math.round(((metrics.totalReach - yesterdayReach) / yesterdayReach) * 100 * 10) / 10;
        }

        return metrics;
    }

    getDistributionRecommendations(
        content: Publicacion,
        metrics: FlywheelMetrics
    ): string[] {
        const recommendations: string[] = [];

        if (metrics.avgEngagement < 0.1) {
            recommendations.push('Consider adding images or charts to increase engagement');
        }

        if (content.par && content.par !== 'GENERAL') {
            recommendations.push('This content targets a specific pair - consider sharing in specialized communities');
        }

        if (!content.imagenUrl && !content.videoUrl && !content.tradingViewUrl) {
            recommendations.push('Adding visual content (chart, image, or video) could increase reach by 50%');
        }

        if ((content.likes?.length || 0) < 5) {
            recommendations.push('Early engagement is key - share within your own communities first');
        }

        if (content.categoria === 'Estrategia' || content.categoria === 'Idea') {
            recommendations.push('Trading ideas perform well in trending - consider boosting this post');
        }

        if (metrics.growthRate > 20) {
            recommendations.push('Great growth! Consider scaling distribution to more channels');
        }

        return recommendations;
    }
}

export const distributionService = new DistributionService();
export default distributionService;
