import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import logger from "../logger";

export const getNewsByCategory = query({
  args: {
    category: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("commodities"),
      v.literal("indices"),
      v.literal("stocks"),
      v.literal("general")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const news = await ctx.db
      .query("market_news")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .take(limit);
    
    return news;
  },
});

export const getTrendingNews = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const news = await ctx.db
      .query("market_news")
      .order("desc")
      .take(limit * 2);
    
    return news
      .sort((a, b) => b.views - a.views || b.likes.length - a.likes.length)
      .slice(0, limit);
  },
});

export const getRecentNews = query({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const news = await ctx.db
      .query("market_news")
      .withIndex("by_publishedAt")
      .filter((q) => q.gte(q.field("publishedAt"), cutoff))
      .order("desc")
      .take(50);
    
    return news;
  },
});

export const getAINews = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const news = await ctx.db
      .query("market_news")
      .filter((q) => q.eq(q.field("isAIGenerated"), true))
      .order("desc")
      .take(limit);
    
    return news;
  },
});

export const getNewsByPair = query({
  args: {
    pair: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const news = await ctx.db
      .query("market_news")
      .order("desc")
      .take(100);
    
    return news
      .filter(n => n.relatedPairs.includes(args.pair))
      .slice(0, limit);
  },
});

export const getNewsById = query({
  args: { newsId: v.id("market_news") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.newsId);
  },
});

export const searchNews = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const lowerQuery = args.query.toLowerCase();
    
    const news = await ctx.db
      .query("market_news")
      .order("desc")
      .take(100);
    
    let filtered = news.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) ||
      n.summary.toLowerCase().includes(lowerQuery) ||
      n.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
    
    if (args.category) {
      filtered = filtered.filter(n => n.category === args.category);
    }
    
    return filtered.slice(0, limit);
  },
});

export const syncNewsFromSources = action({
  args: {},
  handler: async (ctx) => {
    const sources = [
      { 
        name: "CryptoCompare", 
        url: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Blockchain",
        category: "crypto" as const 
      },
      {
        name: "Investing Forex",
        url: "https://www.investing.com/rss/news_forex.rss",
        category: "forex" as const
      },
      {
        name: "Investing Commodities",
        url: "https://www.investing.com/rss/commodities.rss",
        category: "commodities" as const
      },
    ];
    
    const now = Date.now();
    const insertedIds: any[] = [];
    
    for (const source of sources) {
      try {
        if (source.url.includes('cryptocompare')) {
          const response = await fetch(source.url);
          const data = await response.json();
          const articles = data.Data || [];
          
          for (const article of articles.slice(0, 15)) {
            const newsId = await ctx.runMutation(api.market.marketNews.syncNewsArticle, {
              title: article.title,
              summary: article.body?.substring(0, 200) || '',
              content: article.body || '',
              source: source.name,
              sourceUrl: article.url,
              category: source.category,
              imageUrl: article.imageurl || '',
              tags: article.categories?.split('|')?.slice(0, 5) || [],
              publishedAt: article.published_on * 1000,
            });
            
            if (newsId) insertedIds.push(newsId);
          }
        } else {
          const response = await fetch(source.url);
          const xmlText = await response.text();
          const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
          
          for (const item of items.slice(0, 15)) {
            const getTag = (tag: string) => {
              const match = item.match(new RegExp(`<${tag}[^>]*><!\[CDATA\[([\s\S]*?)\]\]></${tag}>`)) ||
                            item.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)</${tag}>`));
              return match ? match[1].trim() : '';
            };
            
            const title = getTag('title');
            const link = getTag('link');
            const description = getTag('description');
            const pubDate = getTag('pubDate');
            
            if (!title) continue;
            
            const newsId = await ctx.runMutation(api.market.marketNews.syncNewsArticle, {
              title: title.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code)),
              summary: description.replace(/<[^>]+>/g, '').substring(0, 200),
              content: description,
              source: source.name,
              sourceUrl: link,
              category: source.category,
              imageUrl: '',
              tags: [],
              publishedAt: new Date(pubDate).getTime() || now,
            });
            
            if (newsId) insertedIds.push(newsId);
          }
        }
      } catch (error) {
        logger.error(`Error fetching ${source.name}:`, error);
      }
    }
    
    return { success: true, inserted: insertedIds.length, ids: insertedIds };
  },
});

export const syncNewsArticle = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    content: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    category: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("commodities"),
      v.literal("indices"),
      v.literal("stocks"),
      v.literal("general")
    ),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("market_news")
      .collect();
    
    const duplicate = existing.find(
      n => n.sourceUrl === args.sourceUrl || 
          (n.title === args.title && Math.abs(n.publishedAt - args.publishedAt) < 60000)
    );
    
    if (duplicate) {
      await ctx.db.patch(duplicate._id, {
        views: duplicate.views + 1,
      });
      return null;
    }
    
    const sentiment = analyzeSentiment(args.title + ' ' + args.summary);
    
    const pairs = extractPairs(args.title + ' ' + args.summary);
    
    const id = await ctx.db.insert("market_news", {
      title: args.title,
      summary: args.summary,
      content: args.content,
      source: args.source,
      sourceUrl: args.sourceUrl,
      sourceLogo: undefined,
      category: args.category,
      sentiment,
      relatedPairs: pairs,
      relatedAssets: [],
      imageUrl: args.imageUrl || "",
      author: undefined,
      isAIGenerated: false,
      publishedAt: args.publishedAt,
      views: 1,
      likes: [],
      tags: args.tags,
      createdAt: Date.now(),
    });
    
    return id;
  },
});

function analyzeSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const lower = text.toLowerCase();
  
  const bullish = ['bullish', 'rising', 'up', 'growth', 'gain', 'surge', 'rally', 'high', 'positive', 'increase', 'profit', 'soar', 'climb'];
  const bearish = ['bearish', 'falling', 'down', 'decline', 'loss', 'drop', 'plunge', 'low', 'negative', 'decrease', 'risk', 'crash', 'sink'];
  
  let bullishCount = 0;
  let bearishCount = 0;
  
  for (const word of bullish) {
    if (lower.includes(word)) bullishCount++;
  }
  for (const word of bearish) {
    if (lower.includes(word)) bearishCount++;
  }
  
  if (bullishCount > bearishCount + 1) return 'bullish';
  if (bearishCount > bullishCount + 1) return 'bearish';
  return 'neutral';
}

function extractPairs(text: string): string[] {
  const pairs: string[] = [];
  const pairPatterns = [
    /\b[A-Z]{3}\/[A-Z]{3}\b/g,
    /\b[A-Z]{6}\b/g,
    /\b(BTC|ETH|XRP|SOL|ADA|DOT|AVAX|MATIC)\b/gi,
    /\b(EUR|USD|GBP|JPY|AUD|CAD|CHF|NZD)\b/gi,
  ];
  
  for (const pattern of pairPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      pairs.push(...matches.slice(0, 5));
    }
  }
  
  return [...new Set(pairs)].slice(0, 10);
}

export const likeNews = mutation({
  args: {
    newsId: v.id("market_news"),
    oderId: v.string(),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);
    
    if (!news) throw new Error("News not found");
    
    const alreadyLiked = news.likes.includes(args.oderId);
    
    if (alreadyLiked) {
      await ctx.db.patch(args.newsId, {
        likes: news.likes.filter(id => id !== args.oderId),
      });
      return { liked: false };
    } else {
      await ctx.db.patch(args.newsId, {
        likes: [...news.likes, args.oderId],
      });
      return { liked: true };
    }
  },
});

export const getNewsSentiment = query({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const news = await ctx.db
      .query("market_news")
      .filter((q) => q.gte(q.field("publishedAt"), cutoff))
      .collect();
    
    const sentiment = {
      bullish: news.filter(n => n.sentiment === 'bullish').length,
      bearish: news.filter(n => n.sentiment === 'bearish').length,
      neutral: news.filter(n => n.sentiment === 'neutral').length,
    };
    
    const total = sentiment.bullish + sentiment.bearish + sentiment.neutral;
    
    return {
      ...sentiment,
      total,
      percentages: {
        bullish: total > 0 ? (sentiment.bullish / total) * 100 : 0,
        bearish: total > 0 ? (sentiment.bearish / total) * 100 : 0,
        neutral: total > 0 ? (sentiment.neutral / total) * 100 : 0,
      },
    };
  },
});

export const getActiveSources = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db
      .query("news_sources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    return sources.sort((a, b) => a.priority - b.priority);
  },
});

export const addNewsSource = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    type: v.union(
      v.literal("rss"),
      v.literal("api"),
      v.literal("webhook")
    ),
    feedUrl: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    fetchInterval: v.number(),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("news_sources", {
      name: args.name,
      url: args.url,
      type: args.type,
      feedUrl: args.feedUrl || undefined,
      apiKey: args.apiKey || undefined,
      isActive: true,
      lastFetched: undefined,
      fetchInterval: args.fetchInterval,
      priority: 10,
      categories: args.categories,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

export const generateAINews = action({
  args: {
    category: v.optional(v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("commodities"),
      v.literal("indices"),
      v.literal("stocks"),
      v.literal("general")
    )),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const count = args.count || 3;
    const categories = args.category 
      ? [args.category]
      : ["forex", "crypto", "commodities", "indices", "stocks"];
    
    const insertedIds: string[] = [];
    
    const categoryPrompts: Record<string, string> = {
      forex: "Trading forex news for EUR/USD, GBP/USD, USD/JPY pairs. Include technical analysis insights.",
      crypto: "Cryptocurrency market news for Bitcoin, Ethereum, altcoins. Include on-chain metrics insights.",
      commodities: "Commodities market news for gold, silver, oil. Include supply/demand analysis.",
      indices: "Stock indices news for S&P 500, Nasdaq, Dow Jones. Include market sentiment.",
      stocks: "Individual stock market news. Include earnings and fundamental analysis.",
      general: "General financial market news and macro economic updates."
    };

    for (const category of categories.slice(0, count)) {
      try {
        const prompt = `Generate a brief, factual trading news headline and summary in Spanish. 
Format as JSON: {"title": "headline", "summary": "2-3 sentence summary", "sentiment": "bullish/bearish/neutral"}
Focus on ${categoryPrompts[category] || "general trading news"}.
Keep it professional and based on common market patterns.
Respond ONLY with valid JSON, no markdown or additional text.`;

        const response = await fetch(process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              
              const newsId = await ctx.runMutation(api.market.marketNews.createAINews, {
                title: parsed.title || `Noticias ${category}`,
                summary: parsed.summary || "Resumen de noticias generado por IA",
                sentiment: parsed.sentiment || "neutral",
                category: category as any,
                source: "AI Agent",
              });
              
              if (newsId) insertedIds.push(newsId);
            }
          }
        }
      } catch (error) {
        logger.error(`Error generating AI news for ${category}:`, error);
      }
    }
    
    return { success: true, generated: insertedIds.length, ids: insertedIds };
  },
});

export const createAINews = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    sentiment: v.union(
      v.literal("bullish"),
      v.literal("bearish"),
      v.literal("neutral")
    ),
    category: v.union(
      v.literal("forex"),
      v.literal("crypto"),
      v.literal("commodities"),
      v.literal("indices"),
      v.literal("stocks"),
      v.literal("general")
    ),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const id = await ctx.db.insert("market_news", {
      title: args.title,
      summary: args.summary,
      content: args.summary,
      source: args.source || "AI News Agent",
      sourceUrl: "",
      sourceLogo: undefined,
      category: args.category,
      sentiment: args.sentiment,
      relatedPairs: extractPairs(args.title + ' ' + args.summary),
      relatedAssets: [],
      imageUrl: "",
      author: undefined,
      isAIGenerated: true,
      publishedAt: now,
      views: 0,
      likes: [],
      tags: ["AI", "News", "Trading"],
      createdAt: now,
    });
    
    return id;
  },
});

export const getLastSyncTime = query({
  args: {},
  handler: async (ctx) => {
    const news = await ctx.db
      .query("market_news")
      .order("desc")
      .first();
    
    return news?.createdAt || null;
  },
});
