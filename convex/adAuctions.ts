import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActiveAuctions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const auctions = await ctx.db
      .query("ad_auctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(limit);
    return auctions;
  },
});

export const getUserBids = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bids = await ctx.db
      .query("ad_bids")
      .withIndex("by_bidder", (q) => q.eq("bidderId", args.userId))
      .order("desc")
      .collect();
    return bids;
  },
});

export const placeBid = mutation({
  args: {
    userId: v.string(),
    auctionId: v.id("ad_auctions"),
    amount: v.number(),
    campaignId: v.optional(v.id("ad_campaigns")),
  },
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) throw new Error("Subasta no encontrada");
    if (auction.status !== "active") throw new Error("Subasta no está activa");
    if (args.amount <= auction.currentBid) {
      throw new Error(`La puja debe ser mayor a $${auction.currentBid.toFixed(2)}`);
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Perfil no encontrado");

    const currentSaldo = (profile as any).saldo || 0;
    const deposit = args.amount - auction.currentBid;
    if (currentSaldo < deposit) {
      throw new Error(`Saldo insuficiente. Necesitas $${deposit.toFixed(2)}`);
    }

    await ctx.db.patch(profile._id, {
      saldo: currentSaldo - deposit,
    });

    await ctx.db.insert("ad_bids", {
      auctionId: args.auctionId,
      bidderId: args.userId,
      campaignId: args.campaignId || "_j2k3l4m5n6p7q8r9s0t1" as any,
      amount: args.amount,
      bidType: "fixed",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.auctionId, {
      currentBid: args.amount,
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: "🎯 Puja Realizada",
      body: `Has pujado $${args.amount.toFixed(2)}`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, newBalance: currentSaldo - deposit };
  },
});

export const closeAuction = mutation({
  args: {
    auctionId: v.id("ad_auctions"),
    adminUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminUserId))
      .unique();

    if (!admin || (admin.role || 0) < 5) {
      throw new Error("Solo admins pueden cerrar subastas");
    }

    const auction = await ctx.db.get(args.auctionId);
    if (!auction) throw new Error("Subasta no encontrada");

    const bids = await ctx.db
      .query("ad_bids")
      .withIndex("by_auction", (q) => q.eq("auctionId", args.auctionId))
      .collect();

    if (bids.length === 0) {
      await ctx.db.patch(args.auctionId, { status: "completed" as any });
      return { success: true, winner: null };
    }

    const winningBid = bids.reduce((max, bid) => bid.amount > max.amount ? bid : max, bids[0]);

    await ctx.db.patch(args.auctionId, {
      status: "completed" as any,
      winnerId: winningBid.bidderId,
      winnerBid: winningBid.amount,
    });

    return { success: true, winner: winningBid.bidderId, amount: winningBid.amount };
  },
});
