import { describe, it, expect } from 'vitest';
import { SignalsRanker } from '../../src/services/ranking/signalsRanker';
import type { SignalItem } from '../../src/services/ranking/signalsRanker';

const makeSignal = (overrides: Partial<SignalItem> = {}): SignalItem => ({
    _id: 'signal_1',
    pair: 'EUR/USD',
    direction: 'buy',
    entryPrice: 1.1000,
    stopLoss: 1.0950,
    takeProfit: [1.1050],
    providerName: 'TraderPro',
    providerAvatar: '',
    providerXp: 100,
    winRate: 70,
    createdAt: Date.now() - 60 * 60 * 1000,
    timeframe: 'H1',
    status: 'active',
    ...overrides,
});

describe('SignalsRanker - surface()', () => {
    it('should filter signals below minWinRate', () => {
        const signals = [
            makeSignal({ _id: 's1', winRate: 60 }),
            makeSignal({ _id: 's2', winRate: 49 }),
            makeSignal({ _id: 's3', winRate: 80 }),
        ];
        const result = SignalsRanker.surface(signals, { minWinRate: 50 });
        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    it('should filter closed signals by default', () => {
        const signals = [
            makeSignal({ _id: 's1', status: 'active' }),
            makeSignal({ _id: 's2', status: 'closed' }),
        ];
        const result = SignalsRanker.surface(signals);
        expect(result.items).toHaveLength(1);
        expect(result.items[0].item._id).toBe('s1');
    });

    it('should include closed signals when includeClosed is true', () => {
        const signals = [
            makeSignal({ _id: 's1', status: 'active' }),
            makeSignal({ _id: 's2', status: 'closed' }),
        ];
        const result = SignalsRanker.surface(signals, { includeClosed: true });
        expect(result.items).toHaveLength(2);
    });

    it('should sort signals by score descending', () => {
        const now = Date.now();
        const signals = [
            makeSignal({ _id: 's1', providerXp: 50, winRate: 55, createdAt: now }),
            makeSignal({ _id: 's2', providerXp: 500, winRate: 80, createdAt: now - 30 * 60 * 1000 }),
        ];
        const result = SignalsRanker.surface(signals);
        expect(result.items[0].score).toBeGreaterThanOrEqual(result.items[1].score);
    });

    it('should limit to maxSignals', () => {
        const signals = Array.from({ length: 30 }, (_, i) =>
            makeSignal({ _id: `s${i}`, winRate: 60 + (i % 10) })
        );
        const result = SignalsRanker.surface(signals, { maxSignals: 5 });
        expect(result.items).toHaveLength(5);
    });

    it('should mark signals with score > 75 as boosted', () => {
        const now = Date.now();
        const signals = [
            makeSignal({ _id: 's1', providerXp: 10000, winRate: 95, createdAt: now }),
            makeSignal({ _id: 's2', providerXp: 10, winRate: 51, createdAt: now }),
        ];
        const result = SignalsRanker.surface(signals);
        const boosted = result.items.filter(i => i.boosted);
        expect(boosted.length).toBeGreaterThan(0);
    });

    it('should return correct surface metadata', () => {
        const signals = [makeSignal({ _id: 's1', winRate: 75 })];
        const result = SignalsRanker.surface(signals, { minWinRate: 60 });
        expect(result.surface).toBe('signals');
        expect(result.signal).toBe('live');
        expect(result.minWinRate).toBe(60);
    });

    it('should return empty for empty signals array', () => {
        const result = SignalsRanker.surface([]);
        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.signal).toBe('live');
    });

    it('should boost signals matching user interests', () => {
        const signals = [
            makeSignal({ _id: 's1', pair: 'BTC/USD', providerXp: 100, winRate: 60, createdAt: Date.now() }),
        ];
        const result = SignalsRanker.surface(signals, { userInterests: ['btc'] });
        expect(result.items[0].score).toBeGreaterThan(60);
    });
});

describe('SignalsRanker - calculateSignalScore via surface()', () => {
    it('should give higher score to newer signals (fresh < 1h)', () => {
        const now = Date.now();
        const fresh = makeSignal({ _id: 's1', createdAt: now - 30 * 60 * 1000, winRate: 60, providerXp: 100 });
        const old = makeSignal({ _id: 's2', createdAt: now - 20 * 60 * 60 * 1000, winRate: 60, providerXp: 100 });
        const result = SignalsRanker.surface([fresh, old]);
        expect(result.items.find(i => i.item._id === 's1')!.score)
            .toBeGreaterThan(result.items.find(i => i.item._id === 's2')!.score);
    });

    it('should give higher score to higher provider XP', () => {
        const signals = [
            makeSignal({ _id: 's1', providerXp: 2000, winRate: 60, createdAt: Date.now() }),
            makeSignal({ _id: 's2', providerXp: 100, winRate: 60, createdAt: Date.now() }),
        ];
        const result = SignalsRanker.surface(signals);
        expect(result.items.find(i => i.item._id === 's1')!.score)
            .toBeGreaterThan(result.items.find(i => i.item._id === 's2')!.score);
    });

    it('should give higher score to higher win rate', () => {
        const signals = [
            makeSignal({ _id: 's1', winRate: 90, createdAt: Date.now() }),
            makeSignal({ _id: 's2', winRate: 55, createdAt: Date.now() }),
        ];
        const result = SignalsRanker.surface(signals);
        expect(result.items.find(i => i.item._id === 's1')!.score)
            .toBeGreaterThan(result.items.find(i => i.item._id === 's2')!.score);
    });

    it('should cap score at 100', () => {
        const signals = [
            makeSignal({ _id: 's1', providerXp: 100000, winRate: 100, createdAt: Date.now() }),
        ];
        const result = SignalsRanker.surface(signals);
        expect(result.items[0].score).toBeLessThanOrEqual(100);
    });

    it('should not go below 0', () => {
        const signals = [
            makeSignal({ _id: 's1', providerXp: 0, winRate: 50, createdAt: Date.now() - 100 * 60 * 60 * 1000 }),
        ];
        const result = SignalsRanker.surface(signals);
        expect(result.items[0].score).toBeGreaterThanOrEqual(0);
    });
});

describe('SignalsRanker - disabled()', () => {
    it('should return disabled signal surface', () => {
        const result = SignalsRanker.disabled();
        expect(result.items).toHaveLength(0);
        expect(result.signal).toBe('disabled');
        expect(result.surface).toBe('signals');
        expect(result.total).toBe(0);
        expect(result.minWinRate).toBe(50);
    });
});

describe('SignalsRanker - getTopSignals()', () => {
    it('should return limited top signals', () => {
        const signals = Array.from({ length: 10 }, (_, i) =>
            makeSignal({ _id: `s${i}`, winRate: 55 + i, createdAt: Date.now() })
        );
        const result = SignalsRanker.getTopSignals(signals, 3);
        expect(result).toHaveLength(3);
        expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
        expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });

    it('should return all if limit exceeds count', () => {
        const signals = [makeSignal({ _id: 's1' }), makeSignal({ _id: 's2' })];
        const result = SignalsRanker.getTopSignals(signals, 10);
        expect(result).toHaveLength(2);
    });
});

describe('SignalsRanker - fetchSignals error handling', () => {
    it('should return error surface when fetch fails', async () => {
        const failingFetch = async () => { throw new Error('Network error'); };
        const result = await SignalsRanker.fetchSignals(failingFetch);
        expect(result.signal).toBe('error');
        expect(result.error).toBe('Network error');
        expect(result.items).toHaveLength(0);
    });

    it('should apply config overrides in fetchSignals', async () => {
        const signals = [
            makeSignal({ _id: 's1', winRate: 60 }),
            makeSignal({ _id: 's2', winRate: 40 }),
        ];
        const result = await SignalsRanker.fetchSignals(async () => signals, { minWinRate: 55 });
        expect(result.items).toHaveLength(1);
        expect(result.minWinRate).toBe(55);
    });
});
