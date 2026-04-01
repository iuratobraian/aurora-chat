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
      .query("auction_bids")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
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
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) throw new Error("Subasta no encontrada");
    if (auction.status !== "active") throw new Error("Subasta no está activa");
    if (args.amount < auction.minBid) throw new Error(`Puja mínima: $${auction.minBid}`);

    const existingBids = await ctx.db
      .query("auction_bids")
      .withIndex("by_auctionId", (q) => q.eq("auctionId", args.auctionId))
      .collect();

    const highestBid = existingBids.length > 0
      ? Math.max(...existingBids.map(b => b.amount))
      : auction.startingPrice;

    if (args.amount <= highestBid) {
      throw new Error(`La puja debe ser mayor a $${highestBid.toFixed(2)}`);
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Perfil no encontrado");

    const currentSaldo = (profile as any).saldo || 0;
    if (currentSaldo < args.amount) {
      throw new Error(`Saldo insuficiente. Necesitas $${args.amount.toFixed(2)}, tienes $${currentSaldo.toFixed(2)}`);
    }

    await ctx.db.patch(profile._id, {
      saldo: currentSaldo - args.amount,
    });

    const bidId = await ctx.db.insert("auction_bids", {
      userId: args.userId,
      auctionId: args.auctionId,
      amount: args.amount,
      duration: args.duration,
      placedAt: Date.now(),
      status: "pending",
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: "🎯 Puja Realizada",
      body: `Has pujado $${args.amount.toFixed(2)} en la subasta`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, bidId, newBalance: currentSaldo - args.amount };
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
      .query("auction_bids")
      .withIndex("by_auctionId", (q) => q.eq("auctionId", args.auctionId))
      .collect();

    if (bids.length === 0) {
      await ctx.db.patch(args.auctionId, { status: "closed" });
      return { success: true, winner: null };
    }

    const winningBid = bids.reduce((max, bid) => bid.amount > max.amount ? bid : max, bids[0]);

    await ctx.db.patch(args.auctionId, {
      status: "closed",
      winnerId: winningBid.userId,
      winningAmount: winningBid.amount,
      closedAt: Date.now(),
    });

    await ctx.db.patch(winningBid._id, { status: "won" });

    for (const bid of bids) {
      if (bid._id !== winningBid._id) {
        await ctx.db.patch(bid._id, { status: "lost" });
        const bidder = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", bid.userId))
          .unique();
        if (bidder) {
          await ctx.db.patch(bidder._id, {
            saldo: (bidder as any).saldo + bid.amount,
          });
        }
      }
    }

    return { success: true, winner: winningBid.userId, amount: winningBid.amount };
  },
});
