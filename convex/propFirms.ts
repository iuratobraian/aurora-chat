import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUser } from "./lib/auth";

export const getPropFirms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("prop_firms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getAllPropFirms = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return await ctx.db
        .query("prop_firms")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    
    // Check if admin
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    
    if (profile && (profile.role || 0) >= 5) {
      return await ctx.db.query("prop_firms").collect();
    }
    
    return await ctx.db
        .query("prop_firms")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
  },
});

export const createPropFirm = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    affiliateLink: v.string(),
    isActive: v.boolean(),
    order: v.number(),
    characteristics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const firmId = await ctx.db.insert("prop_firms", {
      ...args,
      createdAt: Date.now(),
    });
    return firmId;
  },
});

export const updatePropFirm = mutation({
  args: {
    id: v.id("prop_firms"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    affiliateLink: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
    characteristics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deletePropFirm = mutation({
  args: { id: v.id("prop_firms") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});

const PROP_FIRMS_DATA = [
  {
    name: "FundedMax",
    description: "La plataforma de trading profesional con las mejores condiciones del mercado. Hasta 90% de profit split y evaluaciones rápidas.",
    logoUrl: "https://picsum.photos/seed/fundedmax/200",
    coverUrl: "https://picsum.photos/seed/fundedmax/800/400",
    affiliateLink: "https://fundedmax.com/?ref=tradeshare",
    characteristics: ["90% Profit Split", "Evaluación Rápida", "Sin Límites", "Soporte 24/7"],
    profitSplit: "Up to 90%",
    minDeposit: "$100",
    maxProfit: "Ilimitado",
  },
  {
    name: "MyFundedFX",
    description: "Trading con capital real desde $100. Programas diseñados para traders consistencia con payouts rápidos.",
    logoUrl: "https://picsum.photos/seed/myfundedfx/200",
    coverUrl: "https://picsum.photos/seed/myfundedfx/800/400",
    affiliateLink: "https://myfundedfx.com/?ref=tradeshare",
    characteristics: ["85% Profit Split", "Payouts Semanales", "1 Día de Evaluación", "Crypto Payouts"],
    profitSplit: "Up to 85%",
    minDeposit: "$100",
    maxProfit: "$150K",
  },
  {
    name: "TheFundedHub",
    description: "Únete a la comunidad de traders más grande. Programas para todos los niveles con condiciones flexibles.",
    logoUrl: "https://picsum.photos/seed/thefundedhub/200",
    coverUrl: "https://picsum.photos/seed/thefundedhub/800/400",
    affiliateLink: "https://thefundedhub.com/?ref=tradeshare",
    characteristics: ["80% Profit Split", "Multiplas Cuentas", "TradingView Included", "Education Resources"],
    profitSplit: "Up to 80%",
    minDeposit: "$200",
    maxProfit: "$50K",
  },
  {
    name: "ApexTrader Funding",
    description: "Capital de hasta $300K para traders exitosos. Proceso de evaluación transparente y payouts instantáneos.",
    logoUrl: "https://picsum.photos/seed/apextrader/200",
    coverUrl: "https://picsum.photos/seed/apextrader/800/400",
    affiliateLink: "https://apextrader.com/?ref=tradeshare",
    characteristics: ["90% Profit Split", "Capital Ilimitado", "Evaluación Flexible", "Instant Payouts"],
    profitSplit: "Up to 90%",
    minDeposit: "$150",
    maxProfit: "Ilimitado",
  },
  {
    name: "BrightFunds",
    description: "Trading sin riesgo con nuestro programa de evaluación avanzado. Soporte profesional y herramientas exclusivas.",
    logoUrl: "https://picsum.photos/seed/brightfunds/200",
    coverUrl: "https://picsum.photos/seed/brightfunds/800/400",
    affiliateLink: "https://brightfunds.io/?ref=tradeshare",
    characteristics: ["75% Profit Split", "Dashboard Avanzado", "Copy Trading", "Webinars Exclusivos"],
    profitSplit: "Up to 75%",
    minDeposit: "$100",
    maxProfit: "$100K",
  },
  {
    name: "TopTierTrader",
    description: "La mejor opción para scalpers y day traders. Sin restricciones de estilo de trading.",
    logoUrl: "https://picsum.photos/seed/toptiertrader/200",
    coverUrl: "https://picsum.photos/seed/toptiertrader/800/400",
    affiliateLink: "https://toptiertrader.com/?ref=tradeshare",
    characteristics: ["80% Profit Split", "No Restrictions", "Quick Scaling", "Weekly Payouts"],
    profitSplit: "Up to 80%",
    minDeposit: "$250",
    maxProfit: "$200K",
  },
];

export const seedPropFirms = internalMutation({
  args: {},
  handler: async (ctx) => {
    
    const now = Date.now();
    let seeded = 0;

    for (let i = 0; i < PROP_FIRMS_DATA.length; i++) {
      const firm = PROP_FIRMS_DATA[i];
      const existing = await ctx.db
        .query("prop_firms")
        .filter((q) => q.eq(q.field("name"), firm.name))
        .collect();

      if (existing.length === 0) {
        await ctx.db.insert("prop_firms", {
          name: firm.name,
          description: firm.description,
          logoUrl: firm.logoUrl,
          coverUrl: firm.coverUrl,
          affiliateLink: firm.affiliateLink,
          isActive: true,
          order: i + 1,
          characteristics: firm.characteristics,
          createdAt: now,
        });
        seeded++;
      }
    }

    return { seeded };
  },
});
