# CURRENT FOCUS - OpenCode

## ✅ NOTION-025 VERIFIED COMPLETE

### Paywall System Status:

**NOTION-025: Solo Feed gratuito — todo lo demás requiere suscripción**
**Status:** ✅ VERIFIED COMPLETE

**Existing Implementation:**
- ✅ `lib/features.ts` - Feature flags system (signals_feed, private_communities, mentoring_1v1, api_access, etc.)
- ✅ `SignalsView.tsx` - Paywall for signals feed (free users see upgrade prompt)
- ✅ `CreatorView.tsx` - eliteOnly benefits filtered by isFeatureEnabled
- ✅ `SubcommunityView.tsx` - Full paywall modal for paid communities
- ✅ `Modals.tsx` - Plan validation for creating premium communities
- ✅ `PricingView.tsx` - 4 tiers (Bronze/Free, Silver, Gold, Platinum)

**Feature Flags Configured:**
- signals_feed → pro, elite
- private_communities → pro, elite
- mentoring_1v1 → elite
- api_access → elite
- advanced_analytics → pro, elite
- priority_support → pro, elite
- ai_pattern_scanner → elite
- real_time_data → pro, elite

**Plan Limits:**
- free: 1 community, 10 posts/day, 50MB storage
- pro: 5 communities, 100 posts/day, 500MB storage
- elite: unlimited

---

## Next Tasks (Claimed per Protocol):

**NOTION-027: Realtime señales — actualizaciones en tiempo real** [IN PROGRESS]
- **Tipo:** Feature | **Prioridad:** Critical
- **Objetivo:** Actualizaciones en tiempo real de señales via WebSockets/Convex
- **Files to touch:** `convex/signals.ts`, `src/views/SignalsView.tsx`, `lib/pushNotifications.ts`

**NOTION-030: Admin gestión de pagos y suscripciones** [CLAIMED]
- **Tipo:** Feature | **Prioridad:** Critical
- **Objetivo:** Admin dashboard para gestión de pagos y suscripciones

---

### Remaining After This Batch:
- NOTION-004: WebSockets base (High)
- NOTION-011: Optimizar performance (High)
- NOTION-017: Extractor YouTube (High)
- NOTION-018: Publicación posts (High)
- NOTION-021: Estilo Shorts Psicotrading (Medium)
- NOTION-024: npm audit (High)
- NOTION-026: Botones suscripción (High)
- NOTION-028: Notificaciones push (Medium)
- NOTION-029: Admin métricas globales (High)
- NOTION-031: Admin extractor YouTube (High)
- NOTION-032: Premios redención (Medium)
- NOTION-033: Sistema XP (Medium)

---
*Updated: 2026-03-31 | NOTION-025 verified complete - paywall fully implemented*
