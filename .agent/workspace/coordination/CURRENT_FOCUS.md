# CURRENT FOCUS - OpenCode

## TSK-080: News Truth ✅ COMPLETADO
- **Fecha:** 2026-03-28
- **Completado:** 
  - ✅ SAMPLE_NEWS eliminado de newsService.ts
  - ✅ NOTICIAS_MOCK eliminated as fallback in storage.ts and storage/media.ts
  - ✅ API corrected to `api.market.marketNews.getRecentNews`
  - ✅ newsAgentService.ts now uses Convex instead of DEMO_NEWS/mockAnalysis
  - ✅ useNews.ts now uses Convex instead of rss2json

## TSK-081: Creator Metrics ✅ COMPLETADO
- **Fecha:** 2026-03-28
- **Completado:**
  - ✅ activeMembers now uses real data from communityMembers (subscriptionStatus)
  - ✅ growthRate shows "N/A" instead of fake estimated numbers

## TSK-082: Instagram Convex ✅ COMPLETADO
- **Fecha:** 2026-03-28
- **Completado:**
  - ✅ Eliminated legacy fetch path in publishInstagramPostNow (was calling /api/instagram/publish)
  - ✅ Instagram functions now use Convex exclusively
