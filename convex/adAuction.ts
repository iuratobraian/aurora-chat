import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActiveAuctions = query({
  args: {},
  handler: async (ctx) => {
    const auctions = await ctx.db
      .query("ad_auctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const slots = await ctx.db.query("ad_slots").collect();
    const slotMap = new Map(slots.map(s => [s._id, s]));
    
    return auctions.map(auction => ({
      ...auction,
      slot: slotMap.get(auction.slotId),
    }));
  },
});

export const getAuctionById = query({
  args: { auctionId: v.id("ad_auctions") },
  handler: async (ctx, { auctionId }) => {
    const auction = await ctx.db.get(auctionId);
    if (!auction) return null;
    
    const slot = await ctx.db.get(auction.slotId);
    const bids = await ctx.db
      .query("ad_bids")
      .withIndex("by_auction", (q) => q.eq("auctionId", auctionId))
      .order("desc")
      .take(20);
    
    return { auction, slot, bids };
  },
});

export const getAuctionsBySlot = query({
  args: { slotId: v.id("ad_slots") },
  handler: async (ctx, { slotId }) => {
    return await ctx.db
      .query("ad_auctions")
      .withIndex("by_slot", (q) => q.eq("slotId", slotId))
      .collect();
  },
});

export const getAllSlots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ad_slots").collect();
  },
});

export const getActiveSlots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("ad_slots")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const placeBid = mutation({
  args: {
    auctionId: v.id("ad_auctions"),
    campaignId: v.id("ad_campaigns"),
    amount: v.number(),
    bidType: v.union(
      v.literal("cpc"),
      v.literal("cpm"),
      v.literal("fixed")
    ),
    bidderId: v.string(),
  },
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.status !== "active") throw new Error("Auction not active");
    if (auction.endsAt < Date.now()) throw new Error("Auction ended");
    if (args.amount <= auction.currentBid) {
      throw new Error("Bid must be higher than current bid");
    }

    const bidId = await ctx.db.insert("ad_bids", {
      auctionId: args.auctionId,
      bidderId: args.bidderId,
      campaignId: args.campaignId,
      amount: args.amount,
      bidType: args.bidType,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.auctionId, {
      currentBid: args.amount,
      winnerId: args.bidderId,
      winnerBid: args.amount,
    });

    return bidId;
  },
});

export const createCampaign = mutation({
  args: {
    advertiserId: v.string(),
    name: v.string(),
    ads: v.array(v.object({
      adId: v.string(),
      title: v.string(),
      description: v.string(),
      imageUrl: v.string(),
      link: v.string(),
      ctaText: v.optional(v.string()),
    })),
    budget: v.number(),
    budgetType: v.union(
      v.literal("daily"),
      v.literal("total")
    ),
    targeting: v.any(),
  },
  handler: async (ctx, args) => {
    const campaignId = await ctx.db.insert("ad_campaigns", {
      advertiserId: args.advertiserId,
      name: args.name,
      status: "active",
      ads: args.ads,
      budget: args.budget,
      budgetType: args.budgetType,
      spent: 0,
      targeting: args.targeting,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return campaignId;
  },
});

export const getCampaignsByAdvertiser = query({
  args: { advertiserId: v.string() },
  handler: async (ctx, { advertiserId }) => {
    return await ctx.db
      .query("ad_campaigns")
      .withIndex("by_advertiser", (q) => q.eq("advertiserId", advertiserId))
      .collect();
  },
});

export const updateCampaign = mutation({
  args: {
    campaignId: v.id("ad_campaigns"),
    updates: v.object({
      name: v.optional(v.string()),
      status: v.optional(v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("rejected")
      )),
      budget: v.optional(v.number()),
      ads: v.optional(v.array(v.object({
        adId: v.string(),
        title: v.string(),
        description: v.string(),
        imageUrl: v.string(),
        link: v.string(),
        ctaText: v.optional(v.string()),
      }))),
    }),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    await ctx.db.patch(args.campaignId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const createSlot = mutation({
  args: {
    slotId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("banner"),
      v.literal("sidebar"),
      v.literal("feed"),
      v.literal("popup")
    ),
    width: v.number(),
    height: v.number(),
    positions: v.array(v.number()),
    page: v.string(),
    floorPrice: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const slotId = await ctx.db.insert("ad_slots", {
      slotId: args.slotId,
      name: args.name,
      type: args.type,
      size: {
        width: args.width,
        height: args.height,
      },
      positions: args.positions,
      page: args.page,
      floorPrice: args.floorPrice,
      currency: args.currency,
      isActive: true,
      createdAt: Date.now(),
    });
    return slotId;
  },
});

export const createAuction = mutation({
  args: {
    slotId: v.id("ad_slots"),
    auctionType: v.union(
      v.literal("cpc"),
      v.literal("cpm"),
      v.literal("fixed")
    ),
    startsAt: v.number(),
    endsAt: v.number(),
    maxDuration: v.number(),
    targeting: v.any(),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) throw new Error("Slot not found");

    const auctionId = await ctx.db.insert("ad_auctions", {
      auctionId: `auction_${Date.now()}`,
      slotId: args.slotId,
      auctionType: args.auctionType,
      currentBid: slot.floorPrice,
      currency: slot.currency,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      maxDuration: args.maxDuration,
      targeting: args.targeting,
      status: "scheduled",
      createdAt: Date.now(),
    });
    return auctionId;
  },
});

export const startAuction = mutation({
  args: { auctionId: v.id("ad_auctions") },
  handler: async (ctx, { auctionId }) => {
    const auction = await ctx.db.get(auctionId);
    if (!auction) throw new Error("Auction not found");

    await ctx.db.patch(auctionId, {
      status: "active",
    });
  },
});

export const endAuction = mutation({
  args: { auctionId: v.id("ad_auctions") },
  handler: async (ctx, { auctionId }) => {
    const auction = await ctx.db.get(auctionId);
    if (!auction) throw new Error("Auction not found");

    await ctx.db.patch(auctionId, {
      status: "completed",
    });
  },
});

export const getAuctionStats = query({
  args: {},
  handler: async (ctx) => {
    const auctions = await ctx.db.query("ad_auctions").collect();
    const campaigns = await ctx.db.query("ad_campaigns").collect();
    
    const now = Date.now();
    const activeAuctions = auctions.filter(a => a.status === "active");
    const totalBids = await ctx.db.query("ad_bids").collect();
    
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);

    return {
      activeAuctions: activeAuctions.length,
      totalAuctions: auctions.length,
      totalCampaigns: campaigns.length,
      totalBids: totalBids.length,
      totalSpent,
      totalImpressions,
      totalClicks,
      avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : "0",
    };
  },
});
