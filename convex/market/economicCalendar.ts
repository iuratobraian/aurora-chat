import { query, mutation, action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAdmin, requireUser } from "../lib/auth";
import logger from "../logger";

export const isAdminUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    if (identity.subject !== args.userId) return false;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .unique();
    return !!profile && (profile.role || 0) >= 5;
  },
});

export const getEventsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("economic_calendar")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    
    return events.sort((a, b) => a.datetime - b.datetime);
  },
});

export const getEventsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("economic_calendar")
      .withIndex("by_date")
      .filter((q) => 
        q.gte(q.field("date"), args.startDate) && 
        q.lte(q.field("date"), args.endDate)
      )
      .collect();
    
    return events.sort((a, b) => a.datetime - b.datetime);
  },
});

export const getUpcomingHighImpact = query({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const now = Date.now();
    const future = now + (hours * 60 * 60 * 1000);
    
    const events = await ctx.db
      .query("economic_calendar")
      .filter((q) => 
        q.gte(q.field("datetime"), now) &&
        q.lte(q.field("datetime"), future) &&
        q.eq(q.field("impact"), "high")
      )
      .collect();
    
    return events.sort((a, b) => a.datetime - b.datetime);
  },
});

export const getEventsByCountry = query({
  args: {
    country: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const events = await ctx.db
      .query("economic_calendar")
      .withIndex("by_country", (q) => q.eq("country", args.country))
      .filter((q) => 
        q.gte(q.field("date"), startDate.toISOString().split('T')[0]) &&
        q.lte(q.field("date"), endDate.toISOString().split('T')[0])
      )
      .collect();
    
    return events.sort((a, b) => a.datetime - b.datetime);
  },
});

export const getEventDetails = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("economic_calendar")
      .collect();
    
    return events.find(e => e.eventId === args.eventId);
  },
});

export const syncEconomicCalendar = action({
  args: {},
  handler: async (ctx) => {
    // Actions are server-side only, but we can still check auth via runQuery
    // For now, this is an admin-only action that should be called from admin panel
    // The admin panel should have its own auth checks
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Please login to sync calendar");
    }
    // Note: Full admin check would require a query to get the user's role
    // This is a simplified check for now

    const now = Date.now();
    
    const investingRSS = [
      { name: "Investing USD", url: "https://www.investing.com/rss/calendar.rss" },
      { name: "Investing EUR", url: "https://www.investing.com/rss/news_forex.rss" },
      { name: "Investing Crypto", url: "https://www.investing.com/rss/news_crypto.rss" },
    ];
    
    const impactKeywords: Record<string, "high" | "medium" | "low"> = {
      'non-farm': 'high',
      'fed': 'high',
      'ecb': 'high',
      'boe': 'high',
      'gdp': 'high',
      'cpi': 'high',
      'pce': 'high',
      'nfp': 'high',
      'unemployment': 'high',
      'retail sales': 'medium',
      'pmi': 'medium',
      'ism': 'medium',
      'industrial': 'medium',
      'housing': 'low',
      'consumer': 'low',
      'confidence': 'low',
    };
    
    const countryMap: Record<string, { code: string; currency: string }> = {
      'US': { code: 'USA', currency: 'USD' },
      'EU': { code: 'EUR', currency: 'EUR' },
      'GB': { code: 'GBR', currency: 'GBP' },
      'JP': { code: 'JPN', currency: 'JPY' },
      'CA': { code: 'CAN', currency: 'CAD' },
      'AU': { code: 'AUS', currency: 'AUD' },
      'CH': { code: 'CHE', currency: 'CHF' },
      'NZ': { code: 'NZL', currency: 'NZD' },
    };
    
    for (const source of investingRSS) {
      try {
        const response = await fetch(source.url);
        const xmlText = await response.text();
        
        const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
        
        for (const item of items.slice(0, 20)) {
          const getTag = (tag: string) => {
            const match = item.match(new RegExp(`<${tag}[^>]*><!\[CDATA\[([\s\S]*?)\]\]></${tag}>`)) ||
                          item.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)</${tag}>`));
            return match ? match[1].trim() : '';
          };
          
          const title = getTag('title');
          const pubDate = getTag('pubDate');
          const link = getTag('link');
          
          if (!title) continue;
          
          const lowerTitle = title.toLowerCase();
          let impact: "high" | "medium" | "low" = "medium";
          for (const [keyword, level] of Object.entries(impactKeywords)) {
            if (lowerTitle.includes(keyword)) {
              impact = level;
              break;
            }
          }
          
          let country = 'US';
          if (lowerTitle.includes('euro') || lowerTitle.includes('ecb')) {
            country = 'EU';
          } else if (lowerTitle.includes('uk') || lowerTitle.includes('boe') || lowerTitle.includes('bank of england')) {
            country = 'GB';
          } else if (lowerTitle.includes('japan') || lowerTitle.includes('boj')) {
            country = 'JP';
          } else if (lowerTitle.includes('australia') || lowerTitle.includes('rba')) {
            country = 'AU';
          } else if (lowerTitle.includes('canada') || lowerTitle.includes('boc')) {
            country = 'CA';
          } else if (lowerTitle.includes('switzerland') || lowerTitle.includes('snb')) {
            country = 'CH';
          }
          
          const countryInfo = countryMap[country] || countryMap['US'];
          const pubDateObj = new Date(pubDate);
          
          if (isNaN(pubDateObj.getTime())) continue;
          
          const eventId = `${source.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          await ctx.runMutation(api["market/economicCalendar"].syncEvent, {
            eventId,
            source: "investing",
            datetime: pubDateObj.getTime(),
            date: pubDateObj.toISOString().split('T')[0],
            time: pubDateObj.toTimeString().split(' ')[0].substring(0, 5),
            country,
            countryCode: countryInfo.code,
            currency: countryInfo.currency,
            event: title.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code)),
            eventSlug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            impact,
            isLive: lowerTitle.includes('now') || lowerTitle.includes('actual'),
          });
        }
      } catch (error) {
        logger.error(`Error fetching ${source.name}:`, error);
      }
    }
    
    return { success: true, timestamp: now };
  },
});

export const syncEvent = internalMutation({
  args: {
    eventId: v.string(),
    source: v.union(
      v.literal("investing"),
      v.literal("myfxbook"),
      v.literal("forexfactory")
    ),
    datetime: v.number(),
    date: v.string(),
    time: v.string(),
    country: v.string(),
    countryCode: v.string(),
    currency: v.string(),
    event: v.string(),
    eventSlug: v.string(),
    impact: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    actual: v.optional(v.string()),
    forecast: v.optional(v.string()),
    previous: v.optional(v.string()),
    isLive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("economic_calendar")
      .collect();
    
    const duplicate = existing.find(
      e => e.event === args.event && e.date === args.date && e.time === args.time
    );
    
    if (duplicate) {
      await ctx.db.patch(duplicate._id, {
        actual: args.actual,
        forecast: args.forecast,
        previous: args.previous,
        isLive: args.isLive,
        updatedAt: Date.now(),
      });
      return duplicate._id;
    }
    
    const id = await ctx.db.insert("economic_calendar", {
      eventId: args.eventId,
      source: args.source,
      datetime: args.datetime,
      timezone: 'UTC',
      date: args.date,
      time: args.time,
      country: args.country,
      countryCode: args.countryCode,
      currency: args.currency,
      event: args.event,
      eventSlug: args.eventSlug,
      impact: args.impact,
      actual: args.actual,
      forecast: args.forecast,
      previous: args.previous,
      revised: undefined,
      isLive: args.isLive,
      sentiment: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

export const syncFromMyFXBook = action({
  args: {},
  handler: async (ctx) => {
    // Actions are server-side only, check auth identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Please login to sync calendar");
    }
    // Note: Full admin check would require a query to get the user's role
    // This is a simplified check for now
    
    const now = Date.now();

    const MYFXBOOK_API_KEY = process.env.MYFXBOOK_API_KEY;

    if (!MYFXBOOK_API_KEY) {
      logger.warn("MyFXBook API key not configured");
      return { success: false, reason: "API key not configured" };
    }
    
    try {
      const response = await fetch(
        `https://api.myfxbook.com/api/calendar/get?key=${MYFXBOOK_API_KEY}`,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (!response.ok) {
        throw new Error(`MyFXBook API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return { success: false, reason: data.error || "API returned error" };
      }
      
      const events = data.events || [];
      let inserted = 0;
      let updated = 0;
      
      for (const evt of events.slice(0, 50)) {
        try {
          const eventDate = new Date(evt.date);
          const dateStr = eventDate.toISOString().split('T')[0];
          const timeStr = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          
          const impactMap: Record<string, "high" | "medium" | "low"> = {
            "high": "high",
            "medium": "medium",
            "low": "low",
          };
          
          const countryMap: Record<string, { country: string; countryCode: string; currency: string }> = {
            "US": { country: "US", countryCode: "USA", currency: "USD" },
            "EU": { country: "EU", countryCode: "EUR", currency: "EUR" },
            "GB": { country: "GB", countryCode: "GBR", currency: "GBP" },
            "JP": { country: "JP", countryCode: "JPN", currency: "JPY" },
            "CA": { country: "CA", countryCode: "CAN", currency: "CAD" },
            "AU": { country: "AU", countryCode: "AUS", currency: "AUD" },
            "CH": { country: "CH", countryCode: "CHE", currency: "CHF" },
            "NZ": { country: "NZ", countryCode: "NZD", currency: "NZD" },
          };
          
          const countryInfo = countryMap[evt.country] || { country: evt.country || "XX", countryCode: evt.country || "XX", currency: "USD" };
          
          await ctx.runMutation(api.market.economicCalendar.syncEvent, {
            eventId: `myfxbook-${evt.id || evt.event}`,
            source: "myfxbook" as const,
            datetime: eventDate.getTime(),
            date: dateStr,
            time: timeStr,
            country: countryInfo.country,
            countryCode: countryInfo.countryCode,
            currency: countryInfo.currency,
            event: evt.event || "Economic Event",
            eventSlug: (evt.event || "event").toLowerCase().replace(/\s+/g, "-"),
            impact: impactMap[evt.impact?.toLowerCase()] || "low",
            actual: evt.actual,
            forecast: evt.forecast,
            previous: evt.previous,
            isLive: evt.isLive || false,
          });
          
          inserted++;
        } catch (e) {
          logger.error("Error syncing MyFXBook event:", e);
        }
      }
      
      return {
        success: true,
        eventsProcessed: events.length,
        eventsInserted: inserted,
        timestamp: now,
      };
    } catch (e) {
      logger.error("MyFXBook sync error:", e);
      return { success: false, reason: String(e) };
    }
  },
});

export const getCalendarStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const events = await ctx.db
      .query("economic_calendar")
      .collect();
    
    const filtered = events.filter(
      e => e.date >= startDate.toISOString().split('T')[0] && 
           e.date <= endDate.toISOString().split('T')[0]
    );
    
    const stats = {
      total: filtered.length,
      high: filtered.filter(e => e.impact === 'high').length,
      medium: filtered.filter(e => e.impact === 'medium').length,
      low: filtered.filter(e => e.impact === 'low').length,
      byCountry: {} as Record<string, number>,
      upcomingHigh: filtered
        .filter(e => e.impact === 'high' && e.datetime > Date.now())
        .sort((a, b) => a.datetime - b.datetime)
        .slice(0, 5),
    };
    
    for (const event of filtered) {
      stats.byCountry[event.country] = (stats.byCountry[event.country] || 0) + 1;
    }
    
    return stats;
  },
});
