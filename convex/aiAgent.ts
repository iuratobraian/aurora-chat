import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import logger from "./logger";

const AI_BOT_USER_ID = "ai_agent_system";

async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

const UNSPLASH_IMAGES = {
  crypto: [
    "photo-1518546305927-5a555bb7020d",
    "photo-1621761191319-c6fb62004040", 
    "photo-1639762681485-074b7f938ba0",
    "photo-1519710164239-da123dc03ef4",
  ],
  forex: [
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1590283603385-17ffb3a7f29f",
    "photo-1526304640581-d334cdbbf45e",
  ],
  commodities: [
    "photo-1610375461246-83df859d849d",
    "photo-1548199973-03cce0bbc87b",
    "photo-1610375461289-e8e3c3dc9e42",
  ],
  education: [
    "photo-1551288049-bebda4e38f71",
    "photo-1460925895917-afdab827c52f",
    "photo-1504868584819-f8e8b4b6d7e3",
  ],
  analysis: [
    "photo-1591696331111-ef9586a5b17a",
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1579532537598-459ecdaf39cc",
  ],
};

const DISCLAIMER = "\n\n⚠️ **Disclaimer:** Este contenido es informativo y generado automáticamente. No constituye consejo financiero. Opera con responsabilidad y gestiona tu riesgo.";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getTitleBasedImage(title: string, category: string): string {
  const images = UNSPLASH_IMAGES[category as keyof typeof UNSPLASH_IMAGES] || UNSPLASH_IMAGES.crypto;
  const seed = `${title}|TradePortal`;
  const index = hashString(seed) % images.length;
  return `https://images.unsplash.com/${images[index]}?auto=format&fit=crop&q=80&w=1200`;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
}

async function fetchPriceData(symbol: string): Promise<PriceData | null> {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      symbol,
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
    };
  } catch {
    return null;
  }
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
}

function generatePriceAnalysis(priceData: PriceData, assetName: string): { titulo: string; contenido: string; emoji: string; sentiment: string } {
  const { symbol, price, change24h, high24h, low24h, volume } = priceData;
  const isPositive = change24h >= 0;
  const emoji = isPositive ? "📈" : "📉";
  const sentiment = isPositive ? "Bullish" : "Bearish";
  const sign = isPositive ? "+" : "";
  
  const range = high24h - low24h;
  const position = (price - low24h) / range * 100;
  
  const titulo = `${emoji} ${assetName} | $${formatPrice(price)} (${sign}${change24h.toFixed(2)}%)`;
  
  const contenido = `📊 **Resumen Ejecutivo**

${assetName} cotiza actualmente en **$${formatPrice(price)}**, mostrando un movimiento de **${sign}${change24h.toFixed(2)}%** en las últimas 24 horas.

📈 **Análisis Técnico:**
• Máximo 24h: $${formatPrice(high24h)}
• Mínimo 24h: $${formatPrice(low24h)}
• Rango: $${formatPrice(range)} (${position.toFixed(1)}% del mínimo al máximo)
• Volumen: ${formatVolume(volume)} ${symbol.includes('USDT') ? 'USDT' : symbol.slice(-3)}

🎯 **Perspectiva:** ${sentiment}

${isPositive ? "El precio se mantiene por encima del mínimo diario, indicando presión compradora." : "El precio se aproxima al mínimo del día, sugiriendo presión vendedora."}

${DISCLAIMER}`;

  return { titulo, contenido, emoji, sentiment };
}

function generateNewsAnalysis(news: any, priceData?: PriceData): { titulo: string; contenido: string; sentiment: string } {
  const categoryEmojis: Record<string, string> = {
    Crypto: "₿",
    Forex: "💱",
    Commodities: "🛢️",
    Stocks: "📊",
    General: "📰",
  };
  
  const emoji = categoryEmojis[news.category] || "📰";
  const sentiment = analyzeNewsSentiment(news.title + " " + news.body);
  
  const titulo = `${emoji} ${news.title.substring(0, 80)}${news.title.length > 80 ? "..." : ""}`;
  
  const bodyPreview = news.body?.substring(0, 300) || "Sin descripción disponible.";
  
  let priceSection = "";
  if (priceData) {
    const isPositive = priceData.change24h >= 0;
    priceSection = `
📊 **Contexto de Mercado:**
• ${priceData.symbol}: $${formatPrice(priceData.price)} (${isPositive ? "+" : ""}${priceData.change24h.toFixed(2)}%)
• Rango 24h: $${formatPrice(priceData.low24h)} - $${formatPrice(priceData.high24h)}`;
  }
  
  const contenido = `**${news.title}**

${bodyPreview}${bodyPreview.length >= 300 ? "..." : ""}${priceSection}

🔗 *Fuente: ${news.source}*

${DISCLAIMER}`;

  return { titulo, contenido, sentiment };
}

function createEducationalPost(topic: string, content: string): { titulo: string; contenido: string; sentiment: string } {
  const titulo = `📚 ${topic}`;
  const contenido = `**${topic}**

${content}

${DISCLAIMER}`;
  return { titulo, contenido, sentiment: "Neutral" };
}

function generateTradingTips(): { titulo: string; contenido: string; sentiment: string } {
  const tips = [
    {
      topic: "Gestión de Riesgo: Regla del 1-2%",
      content: "Nunca arriesgues más del 1-2% de tu capital en una sola operación. Si tienes $10,000, tu pérdida máxima por trade debe ser $100-200.\n\n🎯 **¿Por qué es importante?**\nEsta regla te protege de pérdidas catastróficas y te permite sobrevivir en mercados adversos.",
    },
    {
      topic: "Señales de Reversión Alcista",
      content: "🔍 **Identifica estos patrones:**\n• Soporte histórico con volumen alto\n• Patrones de vela como Martillo o Envolvente Alcista\n• Divergencia positiva en RSI\n\n⚡ Combina al menos 2-3 señales para mayor probabilidad.",
    },
    {
      topic: "Psicología del Trading",
      content: "🧠 **Errores comunes a evitar:**\n• Reventar posiciones ganadoras prematuramente\n• Promediar a la baja sin plan\n• Operar por emociones (miedo/avaricia)\n\n✅ Establece reglas claras antes de operar y respétalas.",
    },
  ];
  
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return createEducationalPost(tip.topic, tip.content);
}

function analyzeNewsSentiment(text: string): string {
  const lower = text.toLowerCase();
  const bullish = ['sube', 'subida', 'alza', 'ganancia', 'positivo', 'crece', 'récord', 'alcanza', 'mejor', 'avanza', 'bullish', 'surge', 'rally', 'up', 'rise', 'gain'];
  const bearish = ['cae', 'caída', 'baja', 'pérdida', 'negativo', 'declive', 'mínimo', 'cae', 'peor', 'retrocede', 'bearish', 'drop', 'plunge', 'down', 'fall', 'loss'];
  
  let bullCount = bullish.filter(w => lower.includes(w)).length;
  let bearCount = bearish.filter(w => lower.includes(w)).length;
  
  if (bullCount > bearCount) return "Bullish";
  if (bearCount > bullCount) return "Bearish";
  return "Neutral";
}

function getTradingViewUrl(symbol: string): string {
  const cleanSymbol = symbol.replace('USDT', '').replace('USD', '');
  const exchange = symbol.includes('BTC') || symbol.includes('ETH') ? 'BINANCE' : 'FX';
  return `https://es.tradingview.com/chart/?symbol=${exchange}:${cleanSymbol}USDT`;
}

const POST_TYPES = ['price_analysis', 'news', 'educational', 'tips'] as const;
type PostType = typeof POST_TYPES[number];

export const getPendingPosts = query({
  args: {},
  handler: async (ctx) => {
    try {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) return [];
      
      return await ctx.db
        .query("pendingPosts")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .order("asc")
        .take(100);
    } catch (err) {
      console.error("Error in getPendingPosts:", err);
      return [];
    }
  },
});

export const getPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    try {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) return [];
      
      return await ctx.db
        .query("pendingPosts")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .take(50);
    } catch (err) {
      console.error("Error in getPublishedPosts:", err);
      return [];
    }
  },
});

export const getAIAgentConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("aiAgentConfig")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    
    if (!config) {
      return {
        enabled: false,
        schedules: [
          { period: "morning", hours: [6, 8, 10], enabled: true },
          { period: "afternoon", hours: [12, 14, 16], enabled: true },
          { period: "evening", hours: [18, 20, 22], enabled: true },
        ],
      };
    }
    
    return {
      enabled: config.enabled,
      schedules: config.schedules,
    };
  },
});

export const toggleAgentStatus = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden cambiar el estado del agente IA");
    
    const existing = await ctx.db
      .query("aiAgentConfig")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    const now = Date.now();
    const defaultSchedules = [
      { period: "morning" as const, hours: [6, 8, 10], enabled: true },
      { period: "afternoon" as const, hours: [12, 14, 16], enabled: true },
      { period: "evening" as const, hours: [18, 20, 22], enabled: true },
    ];

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("aiAgentConfig", {
        key: "main",
        enabled: args.enabled,
        schedules: defaultSchedules,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { success: true };
  },
});

export const updateSchedules = mutation({
  args: {
    schedules: v.array(v.object({
      period: v.union(v.literal('morning'), v.literal('afternoon'), v.literal('evening')),
      hours: v.array(v.number()),
      enabled: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden actualizar los horarios del agente IA");
    
    const existing = await ctx.db
      .query("aiAgentConfig")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    const now = Date.now();
    const defaultSchedules = [
      { period: "morning" as const, hours: [6, 8, 10], enabled: true },
      { period: "afternoon" as const, hours: [12, 14, 16], enabled: true },
      { period: "evening" as const, hours: [18, 20, 22], enabled: true },
    ];

    if (existing) {
      await ctx.db.patch(existing._id, {
        schedules: args.schedules,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("aiAgentConfig", {
        key: "main",
        enabled: true,
        schedules: args.schedules,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { success: true };
  },
});

export const generateNewsPosts = action({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const maxPosts = args.count || 5;
    const newsSources = [
      { name: "CryptoCompare", url: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&limit=15", category: "Crypto" },
    ];

    let allNews: any[] = [];

    for (const source of newsSources) {
      try {
        const resp = await fetch(source.url);
        const data = await resp.json();
        const news = (data.Data || []).map((n: any) => ({
          title: n.title,
          body: n.body,
          url: n.url,
          source: source.name,
          category: source.category,
          image: n.imageurl,
          published: n.published_on * 1000,
        }));
        allNews = [...allNews, ...news];
      } catch (e) {
        logger.error(`Error fetching ${source.name}:`, e);
      }
    }

    const config = await ctx.runQuery(api.aiAgent.getAIAgentConfig, {});
    const enabledSchedules = (config?.schedules || [])
      .filter((s: any) => s.enabled)
      .flatMap((s: any) => s.hours);

    const createdPosts: any[] = [];
    const priceSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    const priceDataPromises = priceSymbols.map(s => fetchPriceData(s));
    const priceResults = await Promise.all(priceDataPromises);
    const priceMap = new Map(priceSymbols.map((s, i) => [s, priceResults[i]]));

    const postTypes: PostType[] = ['price_analysis', 'news', 'news', 'educational', 'tips'];
    
    for (let i = 0; i < Math.min(maxPosts, allNews.length, postTypes.length); i++) {
      const postType = postTypes[i] || 'news';
      const news = allNews[i];
      const scheduleHour = enabledSchedules[i % enabledSchedules.length] || 12;
      const scheduledDate = new Date();
      scheduledDate.setHours(scheduleHour, 0, 0, 0);
      if (scheduledDate.getTime() < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      let titulo: string;
      let contenido: string;
      let sentiment: string;
      let imagenUrl: string;
      let par: string;
      let categoria: string;
      let tradingViewUrl = "";

      switch (postType) {
        case 'price_analysis': {
          const symbol = priceSymbols[i % priceSymbols.length];
          const pd = priceMap.get(symbol);
          if (pd) {
            const assetName = symbol.replace('USDT', '');
            const result = generatePriceAnalysis(pd, assetName);
            titulo = result.titulo;
            contenido = result.contenido;
            sentiment = result.sentiment;
            par = `${assetName}/USDT`;
            categoria = 'Crypto';
            tradingViewUrl = getTradingViewUrl(symbol);
          } else {
            const result = generateNewsAnalysis(news);
            titulo = result.titulo;
            contenido = result.contenido;
            sentiment = result.sentiment;
            par = 'BTC/USDT';
            categoria = 'Crypto';
          }
          imagenUrl = getTitleBasedImage(titulo, 'crypto');
          break;
        }
        case 'news': {
          const symbol = priceSymbols[Math.floor(Math.random() * priceSymbols.length)];
          const pd = priceMap.get(symbol) || undefined;
          const result = generateNewsAnalysis(news, pd);
          titulo = result.titulo;
          contenido = result.contenido;
          sentiment = result.sentiment;
          par = symbol.replace('USDT', '/USDT');
          categoria = news.category;
          imagenUrl = news.image || getTitleBasedImage(result.titulo, news.category.toLowerCase());
          break;
        }
        case 'educational': {
          const topics = [
            {
              topic: "¿Qué es el Dollar Index (DXY)?",
              content: "El DXY mide el valor del dólar estadounidense frente a una cesta de monedas principales:\n\n📊 **Composición:**\n• Euro (EUR): 57.6%\n• Yen japonés (JPY): 13.6%\n• Libra esterlina (GBP): 11.9%\n• Dólar canadiense (CAD): 9.1%\n• Corona sueca (SEK): 4.2%\n• Franco suizo (CHF): 3.6%\n\n🔑 **Importancia:**\nUn DXY fuerte suele presionar a commodities y cryptos a la baja."
            },
            {
              topic: "Soporte y Resistencia",
              content: "📍 **Soporte:** Zona donde la demanda supera a la oferta, deteniendo caídas.\n\n📍 **Resistencia:** Zona donde la oferta supera a la demanda, deteniendo subas.\n\n💡 **Tips:**\n• Soportes/resistencias anteriores se convierten en el opuesto al romperse\n• Cuantos más test, más fuerte la zona\n• Usa confluencia de timeframes para mayor precisión"
            },
          ];
          const eduTopic = topics[Math.floor(Math.random() * topics.length)];
          const result = createEducationalPost(eduTopic.topic, eduTopic.content);
          titulo = result.titulo;
          contenido = result.contenido;
          sentiment = result.sentiment;
          par = "";
          categoria = "Educación";
          imagenUrl = getTitleBasedImage(result.titulo, 'education');
          break;
        }
        case 'tips': {
          const result = generateTradingTips();
          titulo = result.titulo;
          contenido = result.contenido;
          sentiment = result.sentiment;
          par = "";
          categoria = "Tips";
          imagenUrl = getTitleBasedImage(result.titulo, 'analysis');
          break;
        }
        default: {
          const result = generateNewsAnalysis(news);
          titulo = result.titulo;
          contenido = result.contenido;
          sentiment = result.sentiment;
          par = news.category === "Crypto" ? "BTC/USDT" : "EUR/USD";
          categoria = news.category;
          imagenUrl = news.image || getTitleBasedImage(result.titulo, 'crypto');
        }
      }

      const postId = await ctx.runMutation(api.aiAgent.createPendingPost, {
        titulo,
        contenido,
        fuente: news.source || "AI Agent",
        categoria,
        par,
        imagenUrl,
        sentiment,
        programedAt: scheduledDate.getTime(),
        tradingViewUrl,
      } as any);

      createdPosts.push(postId);
    }

    return {
      success: true,
      createdCount: createdPosts.length,
      posts: createdPosts,
      postTypes,
    };
  },
});

export const createPendingPost = mutation({
  args: {
    titulo: v.string(),
    contenido: v.string(),
    fuente: v.string(),
    categoria: v.string(),
    par: v.optional(v.string()),
    imagenUrl: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    programedAt: v.number(),
    tradingViewUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const postId = await ctx.db.insert("pendingPosts", {
      titulo: args.titulo,
      contenido: args.contenido,
      fuente: args.fuente,
      categoria: args.categoria,
      par: args.par || "",
      imagenUrl: args.imagenUrl || "",
      sentiment: args.sentiment || "Neutral",
      programedAt: args.programedAt,
      createdAt: now,
      status: "pending",
      tradingViewUrl: args.tradingViewUrl,
    } as any);
    return postId;
  },
});

export const approvePendingPost = mutation({
  args: { id: v.id("pendingPosts") },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden aprobar posts del agente IA");
    
    const pendingPost = await ctx.db.get(args.id);
    if (!pendingPost) throw new Error("Post no encontrado");

    await ctx.db.patch(args.id, { status: "published" });

    const pp = pendingPost as any;

    const postId = await ctx.db.insert("posts", {
      userId: AI_BOT_USER_ID,
      titulo: pp.titulo,
      contenido: pp.contenido,
      categoria: pp.categoria,
      esAnuncio: false,
      par: pp.par || "",
      imagenUrl: pp.imagenUrl || "",
      isAiAgent: true,
      sentiment: pp.sentiment || "Neutral",
      likes: [],
      comentarios: [],
      tags: ["AI", "News", "Automatic"],
      createdAt: Date.now(),
      ultimaInteraccion: Date.now(),
      status: "active",
    });

    // Dual-Post: Also create in AI News community
    try {
      let aiNewsCommunity = await ctx.db
        .query("communities")
        .withIndex("by_slug", (q) => q.eq("slug", "ai-news"))
        .first();

      if (!aiNewsCommunity) {
        // Create AI News community as system community
        const communityId = await ctx.db.insert("communities", {
          ownerId: AI_BOT_USER_ID,
          name: "AI News",
          slug: "ai-news",
          description: "Noticias y análisis generados por IA automáticamente",
          visibility: "public",
          accessType: "free",
          priceMonthly: 0,
          maxMembers: 999999,
          currentMembers: 1,
          plan: "free",
          stripeAccountId: undefined,
          totalRevenue: 0,
          status: "active",
          createdAt: Date.now(),
        });

        // Add AI bot as owner member
        await ctx.db.insert("communityMembers", {
          communityId,
          userId: AI_BOT_USER_ID,
          role: "owner",
          subscriptionStatus: undefined,
          joinedAt: Date.now(),
        });

        aiNewsCommunity = await ctx.db.get(communityId);
      }

      if (aiNewsCommunity) {
        // Create duplicate post in AI News community
        await ctx.db.insert("communityPosts", {
          communityId: aiNewsCommunity._id,
          userId: AI_BOT_USER_ID,
          titulo: pp.titulo,
          contenido: pp.contenido,
          imagenUrl: pp.imagenUrl || "",
          tipo: "text",
          likes: [],
          commentsCount: 0,
          isPinned: false,
          isLocked: false,
          tags: ["AI", "News", "Automatic"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active",
        });

        logger.info(`[AI DUAL-POST] Post ${postId} replicated to AI News community`);
      }
    } catch (e) {
      logger.warn(`[AI DUAL-POST] Failed to create dual post: ${e}`);
    }

    return postId;
  },
});

export const rejectPendingPost = mutation({
  args: { id: v.id("pendingPosts") },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden rechazar posts del agente IA");
    
    const pendingPost = await ctx.db.get(args.id);
    if (!pendingPost) throw new Error("Post no encontrado");

    await ctx.db.patch(args.id, { status: "rejected" });
    return { success: true };
  },
});

export const deletePendingPost = mutation({
  args: { id: v.id("pendingPosts") },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden eliminar posts del agente IA");
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const reschedulePost = mutation({
  args: {
    id: v.id("pendingPosts"),
    newProgramedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden reprogramar posts del agente IA");
    
    await ctx.db.patch(args.id, {
      programedAt: args.newProgramedAt,
    });
    return { success: true };
  },
});

export const updatePendingPost = mutation({
  args: {
    id: v.id("pendingPosts"),
    titulo: v.optional(v.string()),
    contenido: v.optional(v.string()),
    categoria: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden actualizar posts del agente IA");
    
    const { id, ...updates } = args;
    const pendingPost = await ctx.db.get(id);
    if (!pendingPost) throw new Error("Post no encontrado");

    await ctx.db.patch(id, updates);
    return { success: true };
  },
});

export const publishScheduledPosts = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const posts = await ctx.runQuery(api.aiAgent.getPendingPosts, {});

    const toPublish = posts.filter((p: any) => p.programedAt <= now && p.status === "pending");
    const publishedIds: any[] = [];

    for (const post of toPublish) {
      try {
        await ctx.runMutation(api.aiAgent.approvePendingPost, { id: post._id });
        publishedIds.push(post._id);
      } catch (e) {
        logger.error("Error publishing post:", post._id, e);
      }
    }

    return {
      success: true,
      publishedCount: publishedIds.length,
      publishedIds,
    };
  },
});

export const generateMarketPost = action({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let marketNews: any[] = [];
    try {
      const newsResp = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN&limit=5");
      const newsData = await newsResp.json();
      marketNews = newsData.Data || [];
    } catch (e) {
      logger.error("News fetch error:", e);
    }

    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    const pricePromises = symbols.map(s => fetchPriceData(s));
    const prices = await Promise.all(pricePromises);
    const btcData = prices[0];
    
    let btcPrice = btcData?.price || 0;
    let btcChange = btcData?.change24h || 0;
    
    if (!btcData) {
      try {
        const fallbackResp = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD");
        const fallbackData = await fallbackResp.json();
        if (fallbackData.BTC?.USD) {
          btcPrice = fallbackData.BTC.USD;
        }
      } catch (e) {
        logger.error("Fallback price fetch failed:", e);
      }
    }

    const priceDisplay = btcPrice > 0 
      ? btcPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : "N/A";

    const sentiment = btcChange >= 0 ? "Bullish" : "Bearish";
    const emoji = btcChange >= 0 ? "📈" : "📉";

    const topNews = marketNews.slice(0, 3);
    const newsSection = topNews.length > 0
      ? `\n\n📰 **Noticias Destacadas:**\n` +
        topNews.map((n: any, idx: number) => `${idx + 1}. ${n.title.substring(0, 100)}${n.title.length > 100 ? '...' : ''}`).join('\n')
      : "";

    const preciosSection = prices.filter(p => p).length > 0
      ? `\n\n💹 **Rendimiento 24h:**\n` +
        prices.filter(p => p).map((p: any) => {
          const isPos = p.change24h >= 0;
          return `• ${p.symbol.replace('USDT', '/USDT')}: $${formatPrice(p.price)} (${isPos ? '+' : ''}${p.change24h.toFixed(2)}%)`;
        }).join('\n')
      : "";

    const titulo = `${emoji} Resumen de Mercado | BTC: ${priceDisplay}`;
    const contenido = `**Análisis del Mercado de Criptomonedas**

El sentimiento actual del mercado es **${sentiment}**, con Bitcoin mostrando un movimiento de **${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%** en las últimas 24 horas.${newsSection}${preciosSection}

🛠️ **Herramientas:**
• Gráfico TradingView (ver enlace)
• Calendario económico
• Análisis de sentimiento

${DISCLAIMER}`;

    const imagenUrl = marketNews[0]?.imageurl || getTitleBasedImage(titulo, 'crypto');

    await ctx.runMutation(api.posts.createPost, {
      userId: AI_BOT_USER_ID,
      titulo: titulo,
      contenido: contenido,
      categoria: "IA Analysis",
      esAnuncio: false,
      par: "BTC/USDT",
      tipo: sentiment === 'Bullish' ? 'Compra' : 'Venta',
      datosGrafico: prices.filter(p => p).length > 0 
        ? prices.filter(p => p).map((p: any) => parseFloat(p.change24h.toFixed(2)))
        : [40, 45, 42, 48, 50, 47, 52],
      tradingViewUrl: getTradingViewUrl('BTCUSDT'),
      imagenUrl: imagenUrl,
      isAiAgent: true,
      sentiment: sentiment,
      tags: ["AI", "BTC", "Mercado", "Resumen", "Análisis"]
    } as any);

    return { success: true, price: priceDisplay, sentiment, priceFetched: btcData !== null };
  },
});

export const generateForexAnalysis = action({
  args: {},
  handler: async (ctx) => {
    const forexPairs = [
      { symbol: 'EURUSD', name: 'EUR/USD', base: 'EUR', quote: 'USD' },
      { symbol: 'GBPUSD', name: 'GBP/USD', base: 'GBP', quote: 'USD' },
      { symbol: 'USDJPY', name: 'USD/JPY', base: 'USD', quote: 'JPY' },
    ];

    const pairData = await Promise.all(
      forexPairs.map(async (pair) => {
        try {
          const resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair.symbol}`);
          if (!resp.ok) return null;
          const data = await resp.json();
          return {
            ...pair,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            high: parseFloat(data.highPrice),
            low: parseFloat(data.lowPrice),
          };
        } catch {
          return null;
        }
      })
    );

    const validPairs = pairData.filter(p => p !== null);
    const overallSentiment = validPairs.filter(p => p!.change24h > 0).length > validPairs.length / 2 ? "Bullish" : "Bearish";

    const pairsSection = validPairs.map((p: any) => {
      const isPos = p.change24h >= 0;
      return `• ${p.name}: ${parseFloat(p.price).toFixed(p.quote === 'JPY' ? 3 : 5)} (${isPos ? '+' : ''}${p.change24h.toFixed(2)}%)`;
    }).join('\n');

    const titulo = `💱 Análisis Forex | ${overallSentiment}`;
    const contenido = `**Mercado de Divisas - Resumen**

📊 **Pares Principales:**
${pairsSection}

🎯 **Perspectiva:** ${overallSentiment}

El mercado forex muestra volatilidad moderada en los principales pares. El comportamiento del dólar estadounidense continúa siendo el factor más influyente.

${DISCLAIMER}`;

    const imagenUrl = getTitleBasedImage(titulo, 'forex');

    await ctx.runMutation(api.posts.createPost, {
      userId: AI_BOT_USER_ID,
      titulo,
      contenido,
      categoria: "Forex",
      esAnuncio: false,
      par: validPairs[0]?.name || "EUR/USD",
      imagenUrl,
      isAiAgent: true,
      sentiment: overallSentiment,
      tags: ["AI", "Forex", "Análisis", "Divisas"],
    } as any);

    return { success: true, pairs: validPairs.length };
  },
});

export const generateEducationalPost = action({
  args: {},
  handler: async (ctx) => {
    const lessons = [
      {
        titulo: "📚 Fundamentos del Trading: Tipos de Órdenes",
        contenido: `**Tipos de Órdenes en Trading**

Comprender los diferentes tipos de órdenes es esencial para una ejecución efectiva.

📌 **Órdenes Básicas:**
• **Market Order:** Ejecución inmediata al precio actual
• **Limit Order:** Se ejecuta solo si el precio alcanza el nivel especificado
• **Stop Loss:** Limita pérdidas automáticas
• **Take Profit:** Fija ganancias objetivo

📌 **Órdenes Avanzadas:**
• **Stop Limit:** Combina stop y limit
• **Trailing Stop:** Ajusta el stop dinámicamente
• **OCO (One Cancels Other):** Coloca dos órdenes simultáneas

💡 **Consejo:** Usa siempre stop loss. El trading sin gestión de riesgo es especulación pura.`
      },
      {
        titulo: "📊 Lectura de Velas Japonesas",
        contenido: `**Patrones de Velas Esenciales**

Las velas japonesas revelan la psicología del mercado.

📌 **Velas Alcistas:**
• **Martillo:** Señala reversión en mínimos - cuerpo pequeño, sombra inferior larga
• **Envolvente Alcista:** Una vela grande engloba la anterior a la baja

📌 **Velas Bajistas:**
• **Estrella Fugaz:** Señala reversión en máximos - cuerpo pequeño, sombra superior larga  
• **Envolvente Bajista:** Una vela grande engloba la anterior alcista

📌 **Doji:**
• Indica indecisión - precio apertura = cierre
• Requiere confirmación con siguiente vela

⚡ Combina patrones con soportes/resistencias para mayor precisión.`
      },
      {
        titulo: "🎯 Gestión del Capital: Tamaño de Posición",
        contenido: `**Cómo Calcular el Tamaño de Posición**

El tamaño de posición es crucial para la supervivencia a largo plazo.

📌 **Fórmula:**
Tamaño de Posición = Capital × Riesgo% / Distancia al Stop

📌 **Ejemplo Práctico:**
• Capital: $10,000
• Riesgo: 2% = $200
• Entry: $50 | Stop: $48
• Distancia: $2
• Tamaño: $200 / $2 = 100 acciones

📌 **Reglas de Oro:**
1. Nunca arriesgues más del 1-2% por trade
2. El riesgo total no debe exceder 6% en operaciones abiertas
3. Ajusta el tamaño según la volatilidad del activo

💡 Un buen sistema de gestión de capital es más importante que la estrategia de entrada.`
      },
    ];

    const lesson = lessons[Math.floor(Math.random() * lessons.length)];
    const imagenUrl = getTitleBasedImage(lesson.titulo, 'education');

    await ctx.runMutation(api.posts.createPost, {
      userId: AI_BOT_USER_ID,
      titulo: lesson.titulo,
      contenido: lesson.contenido + "\n\n" + DISCLAIMER,
      categoria: "Educación",
      esAnuncio: false,
      par: "",
      imagenUrl,
      isAiAgent: true,
      sentiment: "Neutral",
      tags: ["AI", "Educación", "Trading", "Lecciones"],
    } as any);

    return { success: true, lessonTitle: lesson.titulo.substring(2) };
  },
});

export const generateAgentPrompt = action({
  args: {
    userRequest: v.string(),
    additionalContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("No autorizado. Solo administradores pueden usar esta herramienta.");

    const apiKey = process.env.MOONSHOT_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Las API Keys de IA no están configuradas en el servidor." };
    }

    // Determine provider and model
    const isMoonshot = !!process.env.MOONSHOT_API_KEY;
    const isOpenRouter = !isMoonshot && !!process.env.OPENROUTER_API_KEY;
    
    const apiUrl = isMoonshot 
      ? "https://api.moonshot.cn/v1/chat/completions" 
      : isOpenRouter 
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

    const model = isMoonshot 
      ? (process.env.MOONSHOT_DEFAULT_MODEL || "kimi-v1-8k")
      : isOpenRouter 
        ? (process.env.OPENROUTER_DEFAULT_MODEL || "qwen/qwen-2.5-72b-instruct")
        : "gpt-4o-mini";

    const { userRequest, additionalContext } = args;

    const systemPrompt = `Eres un experto Ingeniero de Prompts (Prompt Engineer) de élite.
Tu tarea es convertir peticiones informales en instrucciones maestras (Prompts) para agentes de IA.
Crea prompts que sigan las mejores prácticas: claros, con contexto, con ejemplos, con formato de salida definido y con restricciones de seguridad.

Utiliza SIEMPRE esta estructura de salida en Markdown:
# MASTER PROMPT: [Nombre del Agente]

## 🤖 ROL
[Define de manera experta quién es el agente]

## 🎯 OBJETIVO
[Qué debe lograr específicamente]

## 📋 INSTRUCCIONES
[Lista numerada de pasos para la ejecución]

## 🎨 ESTILO Y TONO
[Describe cómo debe sonar el agente]

## 🚫 RESTRICCIONES
[Lo que el agente NO debe hacer bajo ninguna circunstancia]

## 📥 FORMATO DE SALIDA
[Cómo debe estructurar la respuesta final]

Responde únicamente con el prompt estructurado en español.`;

    const userPrompt = `Genera un Master Prompt basado en esta petición:
Petición: "${userRequest}"
${additionalContext ? `Contexto adicional: "${additionalContext}"` : ""}

Produce el mejor prompt posible para un agente de IA autónomo.`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          ...(isOpenRouter ? { "HTTP-Referer": "https://tradeshare.io", "X-Title": "TradeShare Admin" } : {})
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("AI Provider Error:", errorData);
        return { success: false, error: `Error del proveedor de IA: ${response.statusText}` };
      }

      const result = await response.json();
      const generatedPrompt = result.choices?.[0]?.message?.content;

      if (!generatedPrompt) {
        return { success: false, error: "La IA no devolvió ninguna respuesta válida." };
      }

      return {
        success: true,
        prompt: generatedPrompt,
        modelUsed: model
      };
    } catch (err) {
      console.error("Critical error calling AI Provider:", err);
      return { success: false, error: "Error crítico al conectar con el servicio de IA." };
    }
  },
});

