import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

interface TargetingRules {
  countries?: string[];
  languages?: string[];
  subscriptionTiers?: string[];
  interests?: string[];
  excludeCountries?: string[];
  schedule?: {
    days?: number[];
    hours?: number[];
  };
}

interface UserProfile {
  country?: string;
  language?: string;
  subscriptionTier?: 'free' | 'pro';
  interests?: string[];
  esPro?: boolean;
}

function matchesTargeting(targeting: TargetingRules, userProfile: UserProfile): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  if (targeting.countries && targeting.countries.length > 0) {
    if (!userProfile.country || !targeting.countries.includes(userProfile.country)) {
      return false;
    }
  }

  if (targeting.excludeCountries && targeting.excludeCountries.length > 0) {
    if (userProfile.country && targeting.excludeCountries.includes(userProfile.country)) {
      return false;
    }
  }

  if (targeting.languages && targeting.languages.length > 0) {
    if (!userProfile.language || !targeting.languages.includes(userProfile.language)) {
      return false;
    }
  }

  if (targeting.subscriptionTiers && targeting.subscriptionTiers.length > 0) {
    const userTier = userProfile.esPro ? 'pro' : 'free';
    if (!targeting.subscriptionTiers.includes(userTier)) {
      return false;
    }
  }

  if (targeting.schedule) {
    if (targeting.schedule.days && targeting.schedule.days.length > 0) {
      if (!targeting.schedule.days.includes(currentDay)) {
        return false;
      }
    }
    
    if (targeting.schedule.hours && targeting.schedule.hours.length > 0) {
      const hourMatch = targeting.schedule.hours.some(h => {
        if (h === currentHour) return true;
        if (h === 24 && currentHour >= 0 && currentHour < 6) return true;
        if (h === 25 && currentHour >= 6 && currentHour < 12) return true;
        if (h === 26 && currentHour >= 12 && currentHour < 18) return true;
        if (h === 27 && currentHour >= 18 && currentHour < 24) return true;
        return false;
      });
      if (!hourMatch) return false;
    }
  }

  return true;
}

function scoreTargeting(targeting: TargetingRules, userProfile: UserProfile): number {
  let score = 0;

  if (targeting.countries && targeting.countries.length > 0) {
    if (userProfile.country && targeting.countries.includes(userProfile.country)) {
      score += 30;
    }
  }

  if (targeting.languages && targeting.languages.length > 0) {
    if (userProfile.language && targeting.languages.includes(userProfile.language)) {
      score += 25;
    }
  }

  if (targeting.subscriptionTiers && targeting.subscriptionTiers.length > 0) {
    const userTier = userProfile.esPro ? 'pro' : 'free';
    if (targeting.subscriptionTiers.includes(userTier)) {
      score += 20;
    }
  }

  if (targeting.interests && targeting.interests.length > 0 && userProfile.interests) {
    const matchingInterests = targeting.interests.filter(i => 
      userProfile.interests?.includes(i)
    );
    score += Math.min(matchingInterests.length * 5, 15);
  }

  if (targeting.schedule) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    if (targeting.schedule.days?.includes(currentDay)) {
      score += 5;
    }

    const scheduleHours = targeting.schedule?.hours;
    if (scheduleHours && scheduleHours.length > 0) {
      const timeSlots: Record<number, boolean> = {
        24: currentHour >= 0 && currentHour < 6,
        25: currentHour >= 6 && currentHour < 12,
        26: currentHour >= 12 && currentHour < 18,
        27: currentHour >= 18 && currentHour < 24,
      };
      
      if (scheduleHours.some(h => timeSlots[h])) {
        score += 5;
      }
    }
  }

  return score;
}

export const getTargetedAds = query({
  args: {
    slotId: v.optional(v.string()),
    page: v.optional(v.string()),
    limit: v.optional(v.number()),
    userCountry: v.optional(v.string()),
    userLanguage: v.optional(v.string()),
    userIsPro: v.optional(v.boolean()),
    userInterests: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    
    const activeAuctions = await ctx.db
      .query("ad_auctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const now = Date.now();
    const validAuctions = activeAuctions.filter(
      a => a.startsAt <= now && a.endsAt >= now
    );

    const slots = await ctx.db.query("ad_slots").collect();
    const slotMap = new Map(slots.map(s => [s._id, s]));

    const winningCampaignIds = validAuctions
      .filter(a => a.winnerId)
      .map(a => a.winnerId as string);

    if (winningCampaignIds.length === 0) {
      const fallbackAds = await ctx.db
        .query("ads")
        .filter((q) => q.eq(q.field("activo"), true))
        .take(limit);
      return { ads: fallbackAds, type: 'fallback' };
    }

    const campaigns = await ctx.db
      .query("ad_campaigns")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const winningCampaigns = campaigns.filter(c => 
      winningCampaignIds.includes(c._id) ||
      winningCampaignIds.includes(c.advertiserId)
    );

    if (winningCampaigns.length === 0) {
      const fallbackAds = await ctx.db
        .query("ads")
        .filter((q) => q.eq(q.field("activo"), true))
        .take(limit);
      return { ads: fallbackAds, type: 'fallback' };
    }

    const userProfile: UserProfile = {
      country: args.userCountry,
      language: args.userLanguage,
      esPro: args.userIsPro,
      interests: args.userInterests,
    };

    const targetedCampaigns = winningCampaigns
      .map(campaign => {
        const targeting = campaign.targeting as TargetingRules;
        const isMatch = matchesTargeting(targeting, userProfile);
        const score = scoreTargeting(targeting, userProfile);
        const auction = validAuctions.find(
          a => a.winnerId === campaign._id || a.winnerId === campaign.advertiserId
        );
        
        return {
          campaign,
          isMatch,
          score,
          currentBid: auction?.currentBid ?? 0,
          ad: campaign.ads[0],
        };
      })
      .filter(item => item.isMatch)
      .sort((a, b) => b.score - a.score || b.currentBid - a.currentBid)
      .slice(0, limit);

    if (targetedCampaigns.length === 0) {
      const fallbackAds = await ctx.db
        .query("ads")
        .filter((q) => q.eq(q.field("activo"), true))
        .take(limit);
      return { ads: fallbackAds, type: 'fallback' };
    }

    return {
      ads: targetedCampaigns.map(item => ({
        ...item.ad,
        campaignId: item.campaign._id,
        advertiserId: item.campaign.advertiserId,
        score: item.score,
        ctr: item.campaign.ctr,
      })),
      type: 'targeted',
    };
  },
});

export const getTargetingPreview = query({
  args: {
    auctionId: v.id("ad_auctions"),
  },
  handler: async (ctx, { auctionId }) => {
    const auction = await ctx.db.get(auctionId);
    if (!auction) return null;

    const slot = await ctx.db.get(auction.slotId);
    const campaign = auction.winnerId
      ? await ctx.db
          .query("ad_campaigns")
          .filter((q) => q.eq(q.field("advertiserId"), auction.winnerId!))
          .first()
      : null;

    const targeting = campaign?.targeting as TargetingRules | undefined;

    const sampleProfiles: { name: string; profile: UserProfile; match: boolean }[] = [
      { name: 'US Free User', profile: { country: 'US', language: 'en', esPro: false }, match: false },
      { name: 'US Pro User', profile: { country: 'US', language: 'en', esPro: true }, match: false },
      { name: 'ES Free User', profile: { country: 'ES', language: 'es', esPro: false }, match: false },
      { name: 'ES Pro User', profile: { country: 'ES', language: 'es', esPro: true }, match: false },
      { name: 'BR Free User', profile: { country: 'BR', language: 'pt', esPro: false }, match: false },
      { name: 'BR Pro User', profile: { country: 'BR', language: 'pt', esPro: true }, match: false },
    ];

    sampleProfiles.forEach(sample => {
      sample.match = targeting ? matchesTargeting(targeting, sample.profile) : true;
    });

    return {
      auction,
      slot,
      campaign,
      targeting,
      preview: sampleProfiles,
    };
  },
});

export const updateAdImpression = mutation({
  args: {
    campaignId: v.id("ad_campaigns"),
  },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    await ctx.db.patch(campaignId, {
      impressions: campaign.impressions + 1,
      updatedAt: Date.now(),
    });
  },
});

export const updateAdClick = mutation({
  args: {
    campaignId: v.id("ad_campaigns"),
  },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const newClicks = campaign.clicks + 1;
    const newImpressions = campaign.impressions || 1;
    const newCtr = (newClicks / newImpressions) * 100;

    await ctx.db.patch(campaignId, {
      clicks: newClicks,
      ctr: parseFloat(newCtr.toFixed(2)),
      updatedAt: Date.now(),
    });
  },
});

export const getAudienceInsights = query({
  args: {
    campaignId: v.id("ad_campaigns"),
  },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) return null;

    const allCampaigns = await ctx.db
      .query("ad_campaigns")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const avgImpressions = allCampaigns.reduce((sum, c) => sum + c.impressions, 0) / allCampaigns.length;
    const avgClicks = allCampaigns.reduce((sum, c) => sum + c.clicks, 0) / allCampaigns.length;
    const avgCtr = allCampaigns.reduce((sum, c) => sum + c.ctr, 0) / allCampaigns.length;

    const targeting = campaign.targeting as TargetingRules;
    
    return {
      campaign: {
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr: campaign.ctr,
        budget: campaign.budget,
        spent: campaign.spent,
      },
      benchmarks: {
        avgImpressions: Math.round(avgImpressions),
        avgClicks: Math.round(avgClicks),
        avgCtr: parseFloat(avgCtr.toFixed(2)),
      },
      estimatedReach: targeting.countries 
        ? targeting.countries.length * 10000 
        : 50000,
      targetingDetails: targeting,
    };
  },
});
