import logger from '../../utils/logger';

export interface SignalItem {
    _id: string;
    pair: string;
    direction: 'buy' | 'sell';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number[];
    providerName: string;
    providerAvatar: string;
    providerXp: number;
    winRate: number;
    createdAt: number;
    timeframe?: string;
    status?: string;
}

export interface RankedSignal {
    item: SignalItem;
    score: number;
    boosted: boolean;
    reason: string;
}

export interface SignalsSurface {
    items: RankedSignal[];
    surface: 'signals';
    total: number;
    minWinRate: number;
    signal: 'live' | 'disabled' | 'error';
    error?: string;
}

export interface SignalsRankingConfig {
    minWinRate: number;
    maxSignals: number;
    userXp: number;
    userInterests: string[];
    includeClosed: boolean;
}

const DEFAULT_CONFIG: SignalsRankingConfig = {
    minWinRate: 50,
    maxSignals: 20,
    userXp: 0,
    userInterests: [],
    includeClosed: false,
};

function calculateSignalScore(signal: SignalItem, config: SignalsRankingConfig): number {
    let score = 50;

    score += Math.min(signal.providerXp / 100, 20);
    score += (signal.winRate - 50) * 0.5;

    const ageHours = (Date.now() - signal.createdAt) / (1000 * 60 * 60);
    if (ageHours < 1) score += 15;
    else if (ageHours < 4) score += 10;
    else if (ageHours < 12) score += 5;
    else if (ageHours < 24) score += 2;

    const interestBoost = config.userInterests.reduce((sum, interest) => {
        if (signal.pair?.toLowerCase().includes(interest.toLowerCase())) {
            return sum + 10;
        }
        return sum;
    }, 0);
    score += interestBoost;

    return Math.max(0, Math.min(100, score));
}

function getSignalReason(signal: SignalItem): string {
    if (signal.winRate >= 70) return `Alto win rate (${signal.winRate}%)`;
    if (signal.providerXp >= 1000) return `Proveedor experimentado (${signal.providerXp} XP)`;
    if (signal.direction === 'buy') return 'Señal de compra activa';
    return 'Señal de venta activa';
}

export const SignalsRanker = {
    async fetchSignals(
        fetchFn: () => Promise<SignalItem[]>,
        config: Partial<SignalsRankingConfig> = {}
    ): Promise<SignalsSurface> {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };

        try {
            const raw = await fetchFn();
            const filtered = raw.filter(s => s.winRate >= fullConfig.minWinRate);

            const ranked: RankedSignal[] = filtered.map(signal => {
                const score = calculateSignalScore(signal, fullConfig);
                return {
                    item: signal,
                    score,
                    boosted: score > 75,
                    reason: getSignalReason(signal),
                };
            });

            ranked.sort((a, b) => b.score - a.score);
            const limited = ranked.slice(0, fullConfig.maxSignals);

            return {
                items: limited,
                surface: 'signals',
                total: filtered.length,
                minWinRate: fullConfig.minWinRate,
                signal: 'live',
            };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error('[SignalsRanker] fetchSignals failed:', message);
            return {
                items: [],
                surface: 'signals',
                total: 0,
                minWinRate: fullConfig.minWinRate,
                signal: 'error',
                error: message,
            };
        }
    },

    surface(
        signals: SignalItem[],
        config: Partial<SignalsRankingConfig> = {}
    ): SignalsSurface {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };

        const filtered = signals
            .filter(s => s.winRate >= fullConfig.minWinRate)
            .filter(s => fullConfig.includeClosed || s.status !== 'closed');

        const ranked: RankedSignal[] = filtered.map(signal => {
            const score = calculateSignalScore(signal, fullConfig);
            return {
                item: signal,
                score,
                boosted: score > 75,
                reason: getSignalReason(signal),
            };
        });

        ranked.sort((a, b) => b.score - a.score);
        const limited = ranked.slice(0, fullConfig.maxSignals);

        return {
            items: limited,
            surface: 'signals',
            total: filtered.length,
            minWinRate: fullConfig.minWinRate,
            signal: 'live',
        };
    },

    disabled(): SignalsSurface {
        return {
            items: [],
            surface: 'signals',
            total: 0,
            minWinRate: 50,
            signal: 'disabled',
        };
    },

    getTopSignals(signals: SignalItem[], limit: number, config?: Partial<SignalsRankingConfig>): RankedSignal[] {
        return this.surface(signals, config).items.slice(0, limit);
    },
};
