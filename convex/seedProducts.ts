import { mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { internal } from "./_generated/api";

const MQL5_EAS = [
  {
    mql5Id: "70796",
    mql5Url: "https://www.mql5.com/en/code/70796",
    title: "OHLCMTF Scalper EA",
    description: "Multi-Timeframe Price Action Expert Advisor que opera basado en condiciones OHLC precisas en múltiples timeframes simultáneamente.",
    longDescription: "OHLCMTF Scalper EA es un Expert Advisor de price action estricto que opera basado en condiciones OHLC precisas a través de diferentes timeframes simultáneamente. Cuenta con entradas de órdenes pendientes, reversiones de rol y gestión de riesgo dinámica sin usar indicadores rezagados.",
    images: ["https://picsum.photos/seed/ohlc/400/300"],
    price: 49,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "USDJPY"],
    timeframe: ["M5", "M15", "H1"],
    riskLevel: "Medium",
    tags: ["scalping", "price-action", "multi-timeframe", "mt5"]
  },
  {
    mql5Id: "70465",
    mql5Url: "https://www.mql5.com/en/code/70465",
    title: "VR RSI Robot",
    description: "Estrategia de trading multi-timeframe usando RSI para filtrar ruido y capturar reversiones en zonas de sobrecompra/sobreventa.",
    longDescription: "Solo dos timeframes — H1 y D1 — trabajan sincrónicamente para filtrar el ruido y capturar solo fuertes reversiones RSI de zonas de sobrecompra y sobreventa. Sin entradas aleatorias, solo confirmación clara de dirección del 'hermano mayor'.",
    images: ["https://picsum.photos/seed/vr-rsi/400/300"],
    price: 35,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "AUDUSD", "USDCAD"],
    timeframe: ["H1", "D1"],
    riskLevel: "Medium",
    tags: ["rsi", "reversal", "swing-trading", "mt5"]
  },
  {
    mql5Id: "68934",
    mql5Url: "https://www.mql5.com/en/code/68934",
    title: "SilviosEAbest26",
    description: "EA de alta precisión para MetaTrader 5, diseñado para operar reversiones de mercado usando canales de precio dinámicos y filtros de momentum.",
    longDescription: "SilviosEAbest26 es un Expert Advisor de alta precisión para MetaTrader 5, diseñado para operar reversiones de mercado usando una combinación sofisticada de canales de precio dinámicos y filtros de momentum. El sistema está diseñado para rendimientos consistentes mientras mantiene protocolos estrictos de gestión de riesgo.",
    images: ["https://picsum.photos/seed/silvios/400/300"],
    price: 79,
    currency: "USD",
    platform: "MT5",
    pairs: ["XAUUSD", "EURUSD", "GBPUSD"],
    timeframe: ["H1", "H4"],
    riskLevel: "Medium",
    tags: ["gold", "momentum", "reversal", "mt5"]
  },
  {
    mql5Id: "70052",
    mql5Url: "https://www.mql5.com/en/code/70052",
    title: "ExMachina SafeScalping",
    description: "EA profesional para scalping conservador en breakout para Gold (XAUUSD), Silver (XAGUSD) y majors de Forex.",
    longDescription: "ExMachina Safe Scalping es un Expert Advisor de grado profesional construido para scalping conservador en breakout en Gold (XAUUSD), Silver (XAGUSD) y majors de Forex. Diseñado para traders que buscan operaciones conservadoras con mínimo drawdown.",
    images: ["https://picsum.photos/seed/exmachina-safe/400/300"],
    price: 89,
    currency: "USD",
    platform: "MT5",
    pairs: ["XAUUSD", "XAGUSD", "EURUSD", "GBPUSD"],
    timeframe: ["M5", "M15"],
    riskLevel: "Low",
    tags: ["scalping", "gold", "conservative", "mt5"]
  },
  {
    mql5Id: "70266",
    mql5Url: "https://www.mql5.com/en/code/70266",
    title: "ExMachina TradePilot",
    description: "Panel profesional de gestión de operaciones: Buy/Sell con lotaje automático, trailing stop inteligente, breakeven automático y sistema multi-TP.",
    longDescription: "Panel profesional de gestión de operaciones: Buy/Sell con lotaje automático, trailing stop inteligente (ATR/Fixed/Candle), breakeven automático, sistema de cierre parcial multi-TP (TP1/TP2/TP3) y órdenes pendientes con un clic. Todo en uno para traders serios.",
    images: ["https://picsum.photos/seed/exmachina-pilot/400/300"],
    price: 59,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY"],
    timeframe: ["M5", "M15", "H1", "H4"],
    riskLevel: "Low",
    tags: ["panel", "trade-management", "trailing-stop", "mt5"]
  },
  {
    mql5Id: "69712",
    mql5Url: "https://www.mql5.com/en/code/69712",
    title: "MASTER-WINNERFX-Asim",
    description: "EA grid trend-based para MetaTrader 5 usando EMA y RSI. Lotaje dinámico calculado desde balance con protección min/max.",
    longDescription: "EA grid trend-based para MetaTrader 5 usando EMA y RSI. El lotaje dinámico se calcula desde el balance de la cuenta con protección mínima y máxima. Órdenes iniciales se abren cuando el precio confirma dirección de tendencia relativa a EMA y niveles RSI. Órdenes grid se agregan a distancia fija usando multiplicador controlado.",
    images: ["https://picsum.photos/seed/master-winner/400/300"],
    price: 45,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY"],
    timeframe: ["H1", "H4"],
    riskLevel: "High",
    tags: ["grid", "ema", "rsi", "mt5"]
  },
  {
    mql5Id: "70383",
    mql5Url: "https://www.mql5.com/en/code/70383",
    title: "ExMachina Telegram Bridge",
    description: "Conecta tu cuenta MetaTrader 5 a Telegram. Recibe notificaciones instantáneas de cada operación abierta, cerrada o modificada.",
    longDescription: "Conecta tu cuenta MetaTrader 5 a Telegram. Recibe notificaciones instantáneas cada vez que una operación se abre, cierra o modifica — directamente en tu teléfono. Este es un Expert Advisor solo de notificaciones. No coloca, modifica o cierra operaciones.",
    images: ["https://picsum.photos/seed/exmachina-telegram/400/300"],
    price: 29,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"],
    timeframe: ["M1", "M5", "M15", "H1", "H4", "D1"],
    riskLevel: "Low",
    tags: ["telegram", "notifications", "monitoring", "mt5"]
  },
  {
    mql5Id: "68704",
    mql5Url: "https://www.mql5.com/en/code/68704",
    title: "Price Action Intraday Trading",
    description: "EA robusto trend-following para trading intraday. Se enfoca en patrones de price action de alta probabilidad: Pin Bars, Engulfing, Inside Bar Breakouts.",
    longDescription: "Price Action Day Trader es un MQL5 Expert Advisor robusto de trend-following diseñado para trading intraday. Se enfoca en patrones de price action de alta probabilidad — Pin Bars, Engulfing Candles e Inside Bar Breakouts — mientras filtra operaciones a través de un filtro dual de Media Móvil.",
    images: ["https://picsum.photos/seed/price-action/400/300"],
    price: 55,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
    timeframe: ["M15", "H1"],
    riskLevel: "Medium",
    tags: ["price-action", "intraday", "pin-bar", "mt5"]
  },
  {
    mql5Id: "69545",
    mql5Url: "https://www.mql5.com/en/code/69545",
    title: "VR Breakdown Level",
    description: "Estrategia simple basada en breakout de High o Low previos.",
    longDescription: "Una estrategia de trading simple basada en breakouts de Highs y Lows previos. El EA monitorea niveles clave de precio y ejecuta órdenes cuando el precio rompe estos niveles con confirmación de volumen.",
    images: ["https://picsum.photos/seed/vr-breakdown/400/300"],
    price: 25,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
    timeframe: ["H1", "H4", "D1"],
    riskLevel: "Medium",
    tags: ["breakout", "levels", "mt5"]
  },
  {
    mql5Id: "68535",
    mql5Url: "https://www.mql5.com/en/code/68535",
    title: "Market Structure Onnx",
    description: "Expert Advisor de Estructura de Mercado usando LightGBM (Light Gradient Boosting Machine).",
    longDescription: "Market Structure Expert Advisor que usa LightGBM (Light Gradient Boosting Machine) para identificar estructura de mercado y generar señales de trading. Modelo de ML entrenado para detectar cambios de tendencia.",
    images: ["https://picsum.photos/seed/market-structure/400/300"],
    price: 129,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD"],
    timeframe: ["M15", "H1"],
    riskLevel: "Medium",
    tags: ["ai", "machine-learning", "onnx", "mt5"]
  },
  {
    mql5Id: "68082",
    mql5Url: "https://www.mql5.com/en/code/68082",
    title: "4 Hour Range Strategy",
    description: "EA para testear una estrategia popular de 4 Hour Range. Backtest incluido.",
    longDescription: "Este EA está diseñado para testear una estrategia popular de trading. Mi propio backtest muestra que esta estrategia no funciona como se pretendía. Útil para estudiar y entender por qué ciertas estrategias no funcionan.",
    images: ["https://picsum.photos/seed/hour-range/400/300"],
    price: 0,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "AUDUSD"],
    timeframe: ["H4"],
    riskLevel: "Medium",
    tags: ["range", "backtest", "educational", "mt5"]
  },
  {
    mql5Id: "11637",
    mql5Url: "https://www.mql5.com/en/code/11637",
    title: "Heads or Tails Strategy",
    description: "La versión clásica de la estrategia de trading Heads or Tails con análisis del código del bloque de señales.",
    longDescription: "La versión clásica de la estrategia Heads or Tails con análisis del bloque de señales. Estrategia simple basada en principios de martingale adaptada para trading de forex.",
    images: ["https://picsum.photos/seed/heads-tails/400/300"],
    price: 0,
    currency: "USD",
    platform: "MT4",
    pairs: ["EURUSD", "GBPUSD"],
    timeframe: ["M5", "M15"],
    riskLevel: "High",
    tags: ["classic", "martingale", "mt4"]
  },
  {
    mql5Id: "67691",
    mql5Url: "https://www.mql5.com/en/code/67691",
    title: "Professional Order Manager",
    description: "EA profesional para gestión eficiente de operaciones con control de posición con un clic.",
    longDescription: "Fox Wave Clean - Professional Order Manager. EA profesional para gestión eficiente de operaciones con control de posición con un clic. Diseño limpio, funcionalidad poderosa.",
    images: ["https://picsum.photos/seed/order-manager/400/300"],
    price: 69,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"],
    timeframe: ["M1", "M5", "M15", "H1", "H4", "D1"],
    riskLevel: "Low",
    tags: ["order-management", "panel", "mt5"]
  },
  {
    mql5Id: "67355",
    mql5Url: "https://www.mql5.com/en/code/67355",
    title: "Grid Master",
    description: "Sistema de trading automatizado que implementa una estrategia grid bidireccional.",
    longDescription: "Grid Master EA es un sistema de trading automatizado que implementa una estrategia grid bidireccional. Coloca múltiples órdenes pendientes arriba y abajo del precio actual del mercado, capturando profits de oscilaciones en ambas direcciones.",
    images: ["https://picsum.photos/seed/grid-master/400/300"],
    price: 99,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
    timeframe: ["M15", "H1"],
    riskLevel: "High",
    tags: ["grid", "bidirectional", "mt5"]
  },
  {
    mql5Id: "67011",
    mql5Url: "https://www.mql5.com/en/code/67011",
    title: "Professional Close All Panel",
    description: "Panel profesional para cerrar posiciones con 6 filtros inteligentes.",
    longDescription: "Panel profesional para cerrar posiciones con 6 filtros inteligentes. Cierra todo, por tipo, por símbolo o por profit/loss. Display P&L en tiempo real. Perfecto para salidas de emergencia y gestión de riesgo.",
    images: ["https://picsum.photos/seed/close-all/400/300"],
    price: 39,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD", "ETHUSD"],
    timeframe: ["M1", "M5", "M15", "H1", "H4", "D1"],
    riskLevel: "Low",
    tags: ["close-panel", "risk-management", "mt5"]
  },
  {
    mql5Id: "68450",
    mql5Url: "https://www.mql5.com/en/code/68450",
    title: "Position Size Pro Lite",
    description: "Panel interactivo para cálculo instantáneo de lotaje y riesgo.",
    longDescription: "Panel profesional en chart para cálculo instantáneo de lotaje y riesgo. Esencial para traders manuales que usan gestión de riesgo estricta.",
    images: ["https://c.mql5.com/mq5/6/8/4/5/0/Position_Size_Pro.png"],
    price: 0,
    currency: "USD",
    platform: "MT5",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"],
    timeframe: ["M1", "M5", "M15", "H1", "H4", "D1"],
    riskLevel: "Low",
    tags: ["risk-calculator", "lot-size", "mt5"]
  }
];

export const seedMQL5EAsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let seededCount = 0;

    for (const ea of MQL5_EAS) {
      const existing = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("mql5Id"), ea.mql5Id))
        .collect();

      if (existing.length === 0) {
        await ctx.db.insert("products", {
          authorId: "system",
          authorName: "MQL5 Code Base",
          authorAvatar: "https://c.mql5.com/i/menu/mt.svg",
          title: ea.title,
          description: ea.description,
          longDescription: ea.longDescription,
          category: "ea",
          attributes: {
            platform: ea.platform,
            pairs: ea.pairs,
            timeframe: ea.timeframe,
            riskLevel: ea.riskLevel,
          },
          price: ea.price,
          currency: ea.currency as "USD" | "EUR" | "XP",
          images: ea.images,
          demoFile: undefined,
          mainFile: undefined,
          fileName: undefined,
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
          ratingCount: Math.floor(Math.random() * 50),
          salesCount: Math.floor(Math.random() * 100),
          views: Math.floor(Math.random() * 500),
          tags: ea.tags,
          isPublished: true,
          isFeatured: ea.price > 50,
          isDeleted: false,
          reviews: [],
          createdAt: now,
          updatedAt: now,
          mql5Id: ea.mql5Id,
          mql5Url: ea.mql5Url,
        });
        seededCount++;
      }
    }

    return { seeded: seededCount, total: MQL5_EAS.length };
  },
});

export const seedSampleProductsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sampleProducts = [
      {
        authorId: "system",
        authorName: "TradeShare Team",
        title: "Ultimate Scalping System",
        description: "Sistema completo de scalping con gestión de riesgo avanzada",
        longDescription: "El sistema de scalping definitivo con múltiples indicadores personalizados, gestión de riesgo avanzada y panel de control completo. Diseñado para operar en timeframe M1-M5 con alta precisión.",
        category: "ea",
        attributes: { platform: "MT5", pairs: ["EURUSD", "GBPUSD", "USDJPY"], timeframe: ["M1", "M5"], riskLevel: "Medium" },
        price: 149,
        currency: "USD" as const,
        images: ["https://picsum.photos/seed/scalping/600/400"],
        tags: ["scalping", "complete-system", "mt5"],
        isFeatured: true,
      },
      {
        authorId: "system",
        authorName: "TradeShare Team",
        title: "Trend Catcher Pro",
        description: "EA trend-following con filtros avanzados de volatilidad",
        longDescription: "Trend Catcher Pro captura tendencias fuertes mientras evita whipsaws usando filtros de volatilidad propietarios. Perfecto para traders que prefieren seguir el trend.",
        category: "ea",
        attributes: { platform: "MT5", pairs: ["EURUSD", "AUDUSD", "NZDUSD"], timeframe: ["H1", "H4"], riskLevel: "Low" },
        price: 89,
        currency: "USD" as const,
        images: ["https://picsum.photos/seed/trend/600/400"],
        tags: ["trend", "following", "mt5"],
        isFeatured: false,
      },
      {
        authorId: "system",
        authorName: "TradeShare Team",
        title: "Super RSI Divergence Indicator",
        description: "Indicador avanzado de divergencia RSI con alertas",
        longDescription: "Detecta divergencias regulares y ocultas en RSI con alta precisión. Incluye alertas configurables para todos los timeframes.",
        category: "indicator",
        attributes: { platform: "MT4/MT5", pairs: ["EURUSD", "GBPUSD", "XAUUSD"], timeframe: ["M15", "H1", "H4", "D1"], riskLevel: "Low" },
        price: 49,
        currency: "USD" as const,
        images: ["https://picsum.photos/seed/indicator/600/400"],
        tags: ["indicator", "rsi", "divergence"],
        isFeatured: true,
      },
      {
        authorId: "system",
        authorName: "TradeShare Team",
        title: "Professional Trading Template",
        description: "Template profesional con múltiples indicadores sincronizados",
        longDescription: "Template de trading completo con múltiples indicadores sincronizados, panel de información y herramientas de dibujo automáticas.",
        category: "template",
        attributes: { platform: "MT5", pairs: ["EURUSD", "GBPUSD", "XAUUSD"], timeframe: ["M15", "H1"], riskLevel: "Low" },
        price: 29,
        currency: "USD" as const,
        images: ["https://picsum.photos/seed/template/600/400"],
        tags: ["template", "chart-setup"],
        isFeatured: false,
      },
      {
        authorId: "system",
        authorName: "TradeShare Team",
        title: "Complete Trading Course",
        description: "Curso completo de trading desde básico hasta avanzado",
        longDescription: "Aprende trading desde cero hasta nivel profesional. Incluye video tutoriales, PDFs, templates y acceso a comunidad privada.",
        category: "course",
        attributes: { platform: "Online", level: "All Levels", duration: "40 hours" },
        price: 199,
        currency: "USD" as const,
        images: ["https://picsum.photos/seed/course/600/400"],
        tags: ["course", "education", "trading"],
        isFeatured: true,
      },
    ];

    let seededCount = 0;
    for (const product of sampleProducts) {
      await ctx.db.insert("products", {
        authorId: product.authorId,
        authorName: product.authorName,
        authorAvatar: undefined,
        title: product.title,
        description: product.description,
        longDescription: product.longDescription,
        category: product.category as "ea" | "indicator" | "template" | "course" | "signal" | "vps" | "tool",
        attributes: product.attributes,
        price: product.price,
        currency: product.currency,
        images: product.images,
        demoFile: undefined,
        mainFile: undefined,
        fileName: undefined,
        rating: Math.round((4 + Math.random()) * 10) / 10,
        ratingCount: Math.floor(Math.random() * 30),
        salesCount: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 200),
        tags: product.tags,
        isPublished: true,
        isFeatured: product.isFeatured,
        isDeleted: false,
        reviews: [],
        createdAt: now,
        updatedAt: now,
        mql5Id: undefined,
        mql5Url: undefined,
      });
      seededCount++;
    }

    return { seeded: seededCount };
  },
});

// Public wrappers removed to avoid circular type references
// Use internal versions directly: npx convex run seedProducts:seedMQL5EAsInternal
