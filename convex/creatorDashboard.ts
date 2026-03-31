import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCreatorStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const ownerCommunities = memberships.filter((m) => m.role === "owner");
    const ownedCommunityIds = ownerCommunities.map((m) => m.communityId);

    let totalMembers = 0;
    let totalRevenue = 0;
    let activeCommunities = 0;
    const communityStats: Array<{
      name: string;
      members: number;
      revenue: number;
      visibility: string;
    }> = [];

    for (const communityId of ownedCommunityIds) {
      const community = await ctx.db.get(communityId);
      if (community && community.status === "active") {
        totalMembers += community.currentMembers;
        totalRevenue += community.totalRevenue;
        activeCommunities++;
        communityStats.push({
          name: community.name,
          members: community.currentMembers,
          revenue: community.totalRevenue,
          visibility: community.visibility,
        });
      }
    }

    const memberOfCommunities = memberships.filter((m) => m.role !== "owner").length;

    return {
      totalCommunities: ownerCommunities.length,
      activeCommunities,
      totalMembers,
      totalRevenue,
      memberOfCommunities,
      communityStats,
    };
  },
});

export const getTopCreators = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const allCommunities = await ctx.db
      .query("communities")
      .filter((q) => q.eq(q.field("status"), "active"))
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .collect();

    const sorted = allCommunities
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    const enriched = await Promise.all(
      sorted.map(async (c) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", c.ownerId))
          .first();
        return {
          ...c,
          owner: profile
            ? {
                nombre: profile.nombre,
                usuario: profile.usuario,
                avatar: profile.avatar,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});
