type UserTier = 'FREE' | 'PRO' | 'ELITE';

interface RateLimitTierConfig {
  limit: number;
  windowMs: number;
}

const TIER_LIMITS: Record<string, { FREE: RateLimitTierConfig; PRO: RateLimitTierConfig; ELITE: RateLimitTierConfig }> = {
  'createPost': {
    FREE: { limit: 10, windowMs: 3600000 },
    PRO: { limit: -1, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'sendMessage': {
    FREE: { limit: 50, windowMs: 3600000 },
    PRO: { limit: 200, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'joinCommunity': {
    FREE: { limit: 20, windowMs: 3600000 },
    PRO: { limit: 50, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'joinSubcommunity': {
    FREE: { limit: 20, windowMs: 3600000 },
    PRO: { limit: 50, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'likePost': {
    FREE: { limit: 100, windowMs: 3600000 },
    PRO: { limit: 300, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'saveVideo': {
    FREE: { limit: 10, windowMs: 3600000 },
    PRO: { limit: 30, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'createRecurso': {
    FREE: { limit: 10, windowMs: 3600000 },
    PRO: { limit: 30, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'updateRecurso': {
    FREE: { limit: 30, windowMs: 3600000 },
    PRO: { limit: 100, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
  'deleteRecurso': {
    FREE: { limit: 10, windowMs: 3600000 },
    PRO: { limit: 30, windowMs: 3600000 },
    ELITE: { limit: -1, windowMs: 3600000 },
  },
};

export function getUserTier(role?: number): UserTier {
  if (role === undefined || role === null) return 'FREE';
  if (role >= 2) return 'ELITE';
  if (role === 1) return 'PRO';
  return 'FREE';
}

export async function checkRateLimit(
  ctx: any,
  userId: string,
  action: string
): Promise<boolean> {
  const tierConfig = TIER_LIMITS[action];
  if (!tierConfig) return true;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  const tier = getUserTier(profile?.role);
  const config = tierConfig[tier];

  if (config.limit === -1) return true;

  const key = `rate_limit:${userId}:${action}`;
  const now = Date.now();

  const entry = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();

  if (!entry) {
    await ctx.db.insert("rateLimits", {
      key,
      userId,
      action,
      count: 1,
      resetAt: now + config.windowMs
    });
    return true;
  }

  if (now > entry.resetAt) {
    await ctx.db.patch(entry._id, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return true;
  }

  if (entry.count >= config.limit) {
    return false;
  }

  await ctx.db.patch(entry._id, { count: entry.count + 1 });
  return true;
}

export async function checkRateLimitWithInfo(
  ctx: any,
  userId: string,
  action: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number; tier: UserTier }> {
  const tierConfig = TIER_LIMITS[action];
  if (!tierConfig) {
    return { allowed: true, remaining: -1, resetAt: 0, tier: 'FREE' };
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  const tier = getUserTier(profile?.role);
  const config = tierConfig[tier];

  if (config.limit === -1) {
    return { allowed: true, remaining: -1, resetAt: 0, tier };
  }

  const key = `rate_limit:${userId}:${action}`;
  const now = Date.now();

  const entry = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();

  if (!entry) {
    await ctx.db.insert("rateLimits", {
      key,
      userId,
      action,
      count: 1,
      resetAt: now + config.windowMs
    });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs, tier };
  }

  if (now > entry.resetAt) {
    await ctx.db.patch(entry._id, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs, tier };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, tier };
  }

  await ctx.db.patch(entry._id, { count: entry.count + 1 });
  return { allowed: true, remaining: config.limit - entry.count - 1, resetAt: entry.resetAt, tier };
}
