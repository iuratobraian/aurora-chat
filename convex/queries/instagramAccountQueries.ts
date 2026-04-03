import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getAccountDataForRefresh = internalQuery({
  args: { accountId: v.id("instagram_accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) return null;
    return {
      instagramId: account.instagramId,
      accessTokenEncrypted: account.accessToken,
    };
  },
});
