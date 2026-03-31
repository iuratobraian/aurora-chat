import { mutation } from "./_generated/server";

const SIGNAL_PLANS = [
  {
    name: "Básico",
    slug: "basico",
    signalsPerDay: 1,
    signalsPerWeek: 5,
    signalsPerMonth: 15,
    signalTypes: ["forex"],
    hasVIPSignals: false,
    hasEntryConfirmation: false,
    hasExitTiming: false,
    hasRiskAnalysis: false,
    hasTradeManagement: false,
    hasDailyReport: false,
    priceMonthly: 29,
    priceYearly: 290,
    currency: "USD",
    isFeatured: false,
  },
  {
    name: "Premium",
    slug: "premium",
    signalsPerDay: 5,
    signalsPerWeek: 25,
    signalsPerMonth: 100,
    signalTypes: ["forex", "crypto", "indices"],
    hasVIPSignals: false,
    hasEntryConfirmation: true,
    hasExitTiming: true,
    hasRiskAnalysis: true,
    hasTradeManagement: false,
    hasDailyReport: true,
    priceMonthly: 79,
    priceYearly: 790,
    currency: "USD",
    isFeatured: true,
  },
  {
    name: "VIP",
    slug: "vip",
    signalsPerDay: 10,
    signalsPerWeek: 50,
    signalsPerMonth: 200,
    signalTypes: ["forex", "crypto", "indices", "commodities", "stocks"],
    hasVIPSignals: true,
    hasEntryConfirmation: true,
    hasExitTiming: true,
    hasRiskAnalysis: true,
    hasTradeManagement: true,
    hasDailyReport: true,
    priceMonthly: 149,
    priceYearly: 1490,
    currency: "USD",
    isFeatured: false,
  },
];

const SAMPLE_SIGNALS = [
  {
    type: "forex" as const,
    priority: "premium" as const,
    pair: "EURUSD",
    pairCategory: "Major",
    direction: "buy" as const,
    entryPrice: 1.0875,
    entryRangeMin: 1.0865,
    entryRangeMax: 1.0885,
    entryType: "limit" as const,
    stopLoss: 1.0825,
    stopLossPips: 50,
    stopLossPercentage: 2.1,
    takeProfits: [
      { level: 1, price: 1.0925, percentage: 0.46, reached: false },
      { level: 2, price: 1.0975, percentage: 0.92, reached: false },
      { level: 3, price: 1.1025, percentage: 1.38, reached: false },
    ],
    timeframe: "H4" as const,
    sentiment: "bullish" as const,
    analysis: "El EURUSD muestra fuerza en el gráfico diario con un patrón de doble suelo confirmado. La EMA 50 actúa como soporte dinámico. Esperando pullback hacia la zona de demanda para entrar en compra con favorable relación riesgo/beneficio.",
    reason: "Soporte en 1.0850 con confirmación de volumen. Divergencia RSI positiva en H4.",
    tags: ["eurusd", "forex", "compra", "soporte"],
  },
  {
    type: "forex" as const,
    priority: "vip" as const,
    pair: "XAUUSD",
    pairCategory: "Commodities",
    direction: "sell" as const,
    entryPrice: 2345.50,
    entryRangeMin: 2343.00,
    entryRangeMax: 2348.00,
    entryType: "limit" as const,
    stopLoss: 2360.00,
    stopLossPips: 145,
    stopLossPercentage: 3.1,
    takeProfits: [
      { level: 1, price: 2310.00, percentage: 1.51, reached: false },
      { level: 2, price: 2285.00, percentage: 2.58, reached: false },
      { level: 3, price: 2250.00, percentage: 4.07, reached: false },
    ],
    timeframe: "H1" as const,
    sentiment: "bearish" as const,
    analysis: "El Oro presenta una estructura de tendencia bajista clara en H1 con máximos decrecientes. Resistencia clave en 2350 zona de oferta. Recomendamos venta en el rebote hacia 2345-2350 con objetivo en 2310.",
    reason: "Resistencia fuerte en 2350. Patrón H&S en formación. Momentum negativo.",
    tags: ["gold", "xauusd", "venta", "resistencia"],
  },
  {
    type: "crypto" as const,
    priority: "premium" as const,
    pair: "BTCUSD",
    pairCategory: "Crypto Major",
    direction: "buy" as const,
    entryPrice: 67500,
    entryRangeMin: 67000,
    entryRangeMax: 68000,
    entryType: "limit" as const,
    stopLoss: 65000,
    stopLossPips: 2500,
    stopLossPercentage: 3.7,
    takeProfits: [
      { level: 1, price: 70000, percentage: 3.70, reached: false },
      { level: 2, price: 72500, percentage: 7.41, reached: false },
      { level: 3, price: 75000, percentage: 11.11, reached: false },
    ],
    timeframe: "D1" as const,
    sentiment: "bullish" as const,
    analysis: "Bitcoin mantiene estructura alcista en semanal con soporte en 65000. Elhalving recientes sugiere momentum positivo para los próximos meses. Entrada en zona de demanda histórica.",
    reason: "Soporte histórico en 65000. Post-halving bullish. Acumulación institucional.",
    tags: ["bitcoin", "btc", "compra", "halving"],
  },
  {
    type: "forex" as const,
    priority: "standard" as const,
    pair: "GBPUSD",
    pairCategory: "Major",
    direction: "sell" as const,
    entryPrice: 1.2680,
    entryRangeMin: 1.2660,
    entryRangeMax: 1.2700,
    entryType: "limit" as const,
    stopLoss: 1.2750,
    stopLossPips: 70,
    stopLossPercentage: 2.8,
    takeProfits: [
      { level: 1, price: 1.2580, percentage: 0.79, reached: false },
      { level: 2, price: 1.2520, percentage: 1.26, reached: false },
    ],
    timeframe: "H1" as const,
    sentiment: "bearish" as const,
    analysis: "GBPUSD rechazado en resistencia 1.2700 con formación de patrón de vuelta bajista. Datos económicos del Reino Unido débiles sugieren debilidad adicional.",
    reason: "Rechazo en 1.27. PMI manufacturing débil. Tendencia bajista confirmada.",
    tags: ["gbpusd", "forex", "venta", "rechazo"],
  },
  {
    type: "forex" as const,
    priority: "free" as const,
    pair: "USDJPY",
    pairCategory: "Major",
    direction: "buy" as const,
    entryPrice: 157.50,
    entryRangeMin: 157.20,
    entryRangeMax: 157.80,
    entryType: "limit" as const,
    stopLoss: 156.50,
    stopLossPips: 100,
    stopLossPercentage: 1.9,
    takeProfits: [
      { level: 1, price: 158.50, percentage: 0.63, reached: false },
      { level: 2, price: 159.50, percentage: 1.27, reached: false },
    ],
    timeframe: "H4" as const,
    sentiment: "bullish" as const,
    analysis: "USDJPY en tendencia alcista con soporte en 156.50. El diferencial de tasas entre EE.UU. y Japón continúa apoyando al dólar.",
    reason: "Tendencia alcista. Soporte en 156.50. FED hawkish.",
    tags: ["usdjpy", "forex", "compra", "tasas"],
  },
];

const SAMPLE_PROVIDERS = [
  {
    userId: "provider_1",
    isVerified: true,
    verificationLevel: "advanced" as const,
    avgWinRate: 78.5,
    totalPipsGenerated: 15420,
    avgRating: 4.8,
    totalRatings: 156,
  },
  {
    userId: "provider_2",
    isVerified: true,
    verificationLevel: "basic" as const,
    avgWinRate: 72.3,
    totalPipsGenerated: 8950,
    avgRating: 4.5,
    totalRatings: 89,
  },
  {
    userId: "provider_3",
    isVerified: false,
    verificationLevel: "basic" as const,
    avgWinRate: 68.9,
    totalPipsGenerated: 5620,
    avgRating: 4.2,
    totalRatings: 45,
  },
];

export const seedSignalPlans = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let totalSeeded = 0;

    for (const plan of SIGNAL_PLANS) {
      const existing = await ctx.db
        .query("signal_plans")
        .filter((q) => q.eq(q.field("slug"), plan.slug))
        .collect();

      if (existing.length === 0) {
        await ctx.db.insert("signal_plans", {
          name: plan.name,
          slug: plan.slug,
          signalsPerDay: plan.signalsPerDay,
          signalsPerWeek: plan.signalsPerWeek,
          signalsPerMonth: plan.signalsPerMonth,
          signalTypes: plan.signalTypes,
          hasVIPSignals: plan.hasVIPSignals,
          hasEntryConfirmation: plan.hasEntryConfirmation,
          hasExitTiming: plan.hasExitTiming,
          hasRiskAnalysis: plan.hasRiskAnalysis,
          hasTradeManagement: plan.hasTradeManagement,
          hasDailyReport: plan.hasDailyReport,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          currency: plan.currency as "USD" | "EUR",
          subscriberCount: 0,
          avgRating: 0,
          isActive: true,
          isFeatured: plan.isFeatured,
          createdAt: now,
          updatedAt: now,
        });
        totalSeeded++;
      } else {
        // Update existing plan
        await ctx.db.patch(existing[0]._id, {
          name: plan.name,
          signalsPerDay: plan.signalsPerDay,
          signalsPerWeek: plan.signalsPerWeek,
          signalsPerMonth: plan.signalsPerMonth,
          signalTypes: plan.signalTypes,
          hasVIPSignals: plan.hasVIPSignals,
          hasEntryConfirmation: plan.hasEntryConfirmation,
          hasExitTiming: plan.hasExitTiming,
          hasRiskAnalysis: plan.hasRiskAnalysis,
          hasTradeManagement: plan.hasTradeManagement,
          hasDailyReport: plan.hasDailyReport,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          currency: plan.currency as "USD" | "EUR",
          subscriberCount: 0,
          avgRating: 0,
          isActive: true,
          isFeatured: plan.isFeatured,
          createdAt: now,
          updatedAt: now,
        });
        totalSeeded++;
      }
    }

    const existingProviders = await ctx.db.query("signal_providers").collect();
    if (existingProviders.length === 0) {
      for (const provider of SAMPLE_PROVIDERS) {
        await ctx.db.insert("signal_providers", {
          userId: provider.userId,
          isVerified: provider.isVerified,
          verificationLevel: provider.verificationLevel,
          totalSignalsSent: Math.floor(Math.random() * 100) + 50,
          totalSignalsActive: Math.floor(Math.random() * 5) + 1,
          avgWinRate: provider.avgWinRate,
          totalPipsGenerated: provider.totalPipsGenerated,
          subscribersCount: Math.floor(Math.random() * 200) + 20,
          avgRating: provider.avgRating,
          totalRatings: provider.totalRatings,
          earningsThisMonth: Math.floor(Math.random() * 5000) + 1000,
          totalEarnings: Math.floor(Math.random() * 30000) + 5000,
          pendingPayout: Math.floor(Math.random() * 2000),
          signalsPerDayLimit: 5,
          signalsPerWeekLimit: 20,
          isActive: true,
          isSuspended: false,
          createdAt: now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: now,
        });
        totalSeeded++;
      }
    }

    const providers = await ctx.db.query("signal_providers").collect();
    if (providers.length > 0) {
      for (let i = 0; i < SAMPLE_SIGNALS.length; i++) {
        const signal = SAMPLE_SIGNALS[i];
        const provider = providers[i % providers.length];
        const signalId = `signal_${now}_${i}_${Math.random().toString(36).substr(2, 9)}`;

        await ctx.db.insert("signals", {
          signalId,
          providerId: provider.userId,
          type: signal.type,
          priority: signal.priority,
          pair: signal.pair,
          pairCategory: signal.pairCategory,
          direction: signal.direction,
          entryPrice: signal.entryPrice,
          entryRangeMin: signal.entryRangeMin,
          entryRangeMax: signal.entryRangeMax,
          entryType: signal.entryType,
          stopLoss: signal.stopLoss,
          stopLossPips: signal.stopLossPips,
          stopLossPercentage: signal.stopLossPercentage,
          takeProfits: signal.takeProfits,
          timeframe: signal.timeframe,
          sentiment: signal.sentiment,
          analysis: signal.analysis,
          reason: signal.reason,
          status: "active",
          scheduledFor: undefined,
          sentAt: now - Math.floor(Math.random() * 6 * 60 * 60 * 1000),
          expiresAt: now + 18 * 60 * 60 * 1000,
          totalSubscribersNotified: Math.floor(Math.random() * 50) + 10,
          subscribersActed: Math.floor(Math.random() * 20) + 5,
          subscribersWon: Math.floor(Math.random() * 15) + 3,
          subscribersLost: Math.floor(Math.random() * 5) + 1,
          tags: signal.tags,
          createdAt: now - Math.floor(Math.random() * 6 * 60 * 60 * 1000),
          updatedAt: now,
        });
        totalSeeded++;
      }
    }

    return { totalSeeded };
  },
});
