# Aurora Convex & Signals Repair Order
**Status**: Critical / Blocker
**Target**: Resolve "Could not find public function for signals:getActiveSignals"

## Findings context
1. **Deployment Success**: `npx convex deploy -v` confirms `signals.js` is bundled and pushed to `https://notable-sandpiper-279.convex.cloud`.
2. **Backend Code**: `convex/signals.ts` line 38 explicitly exports `getActiveSignals` as a public `query`.
3. **Frontend Error**: The Vercel app reports `Server Error: Could not find public function`.
4. **Desync Hypothesis**: The Vercel build is likely using `VITE_CONVEX_URL=https://quick-orca-372.convex.cloud` (the old one) instead of the actual production `notable-sandpiper-279`.

## Orders for Agents (Action required by owner/authorized agent)

### 1. Vercel Environment Sync
- **Action**: Check Vercel project settings for `tradeportal-2025-platinum`.
- **Action**: Ensure `VITE_CONVEX_URL` is set to `https://notable-sandpiper-279.convex.cloud`.
- **Action**: Ensure `CONVEX_SITE_URL` is set to `https://notable-sandpiper-279.convex.site`.
- **Action**: Trigger a "Redeploy" without cache.

### 2. Local Linking (Run by user or agent with auth)
- **Command**: `npx convex dev --env-file .env`
- **Validation**: Ensure `Generating TypeScript bindings...` completes and `signals:getActiveSignals` appears in `convex/_generated/api.d.ts`.
- **Commit**: Ensure `convex/_generated/*` changes are pushed to GitHub.

### 3. Backend Health Check
- **Command**: `npx convex run signals:getActiveSignals`
- **Expected**: JSON array (empty or with signals). 
- **Bug**: If it returns 401/404, the linkage in `convex.json` is corrupted.

## Feature Flag Management
- Aurora has temporarily disabled Signals via `VITE_FEATURE_SIGNALS=off`.
- **DO NOT** turn back `on` until the `getActiveSignals` query returns data via CLI.

---
**Reporter**: Antigravity (Pair Programming AI)
**Date**: 2026-03-20
