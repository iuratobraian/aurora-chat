import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createInvite = mutation({
  args: {
    subcommunityId: v.id("subcommunities"),
    invitedBy: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subcommunityId);
    if (!sub) throw new Error("Subcomunidad no encontrada");

    const subData = sub as any;
    if (subData.ownerId !== args.invitedBy) {
      const membership = await ctx.db
        .query("subcommunityMembers")
        .withIndex("by_subcommunity_user", (q) =>
          q.eq("subcommunityId", args.subcommunityId).eq("userId", args.invitedBy)
        )
        .first();
      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Solo owner o admin pueden invitar");
      }
    }

    const existing = await ctx.db
      .query("subcommunityInvites")
      .withIndex("by_subcommunity", (q) => q.eq("subcommunityId", args.subcommunityId))
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) throw new Error("Ya existe una invitación pendiente para este email");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const inviteId = await ctx.db.insert("subcommunityInvites", {
      subcommunityId: args.subcommunityId,
      invitedBy: args.invitedBy,
      email: args.email,
      userId: profile?.userId,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    if (profile) {
      await ctx.db.insert("notifications", {
        userId: profile.userId,
        type: "system",
        title: "Invitación a Subcomunidad",
        body: `Te han invitado a unirte a "${subData.name}"`,
        data: { subcommunityId: args.subcommunityId, inviteId },
        read: false,
        createdAt: Date.now(),
      });
    }

    return inviteId;
  },
});

export const getPendingInvites = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return [];

    const invites = await ctx.db
      .query("subcommunityInvites")
      .withIndex("by_email", (q) => q.eq("email", profile.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const enriched = await Promise.all(
      invites.map(async (invite) => {
        if (invite.expiresAt && invite.expiresAt < Date.now()) {
          return { ...invite, expired: true };
        }
        const sub = await ctx.db.get(invite.subcommunityId);
        return { ...invite, subcommunity: sub };
      })
    );

    return enriched.filter(Boolean);
  },
});

export const acceptInvite = mutation({
  args: {
    inviteId: v.id("subcommunityInvites"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invitación no encontrada");
    if (invite.status !== "pending") throw new Error("Invitación ya procesada");
    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      await ctx.db.patch(args.inviteId, { status: "expired" });
      throw new Error("Invitación expirada");
    }

    const existing = await ctx.db
      .query("subcommunityMembers")
      .withIndex("by_subcommunity_user", (q) =>
        q.eq("subcommunityId", invite.subcommunityId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(args.inviteId, { status: "accepted" });
      throw new Error("Ya eres miembro de esta subcomunidad");
    }

    await ctx.db.insert("subcommunityMembers", {
      subcommunityId: invite.subcommunityId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    const sub = await ctx.db.get(invite.subcommunityId);
    if (sub) {
      await ctx.db.patch(invite.subcommunityId, {
        currentMembers: (sub as any).currentMembers + 1,
      });
    }

    const channel = await ctx.db
      .query("chatChannels")
      .filter((q) => q.eq(q.field("slug"), `sub_${invite.subcommunityId}`))
      .first();

    if (channel) {
      const participants = [...(channel as any).participants];
      if (!participants.includes(args.userId)) {
        participants.push(args.userId);
        await ctx.db.patch(channel._id, { participants });
      }
    }

    await ctx.db.patch(args.inviteId, { status: "accepted", userId: args.userId });

    return { success: true };
  },
});

export const declineInvite = mutation({
  args: {
    inviteId: v.id("subcommunityInvites"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invitación no encontrada");
    if (invite.status !== "pending") throw new Error("Invitación ya procesada");

    await ctx.db.patch(args.inviteId, { status: "declined", userId: args.userId });
    return { success: true };
  },
});
