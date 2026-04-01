# CURRENT_FOCUS.md

## AGENT: Antigravity
- TASK: Audit Remediations - Auth & Security
- Fecha: 2026-03-31
- Voy a hacer: Fix Convex config, move password hashing to server, and enforce owner/admin checks in signals and posts.
- Archivos que tocaré: convex.json, .env.local, convex/profiles.ts, convex/signals.ts, convex/posts.ts
- Archivos que no tocaré: App.tsx, Navigation.tsx
- Señal de salida: Convex auth is functional, hashing is server-side, and owner checks are passing.

## Current Task: TSK-104 - POST VIRAL RANKING

**Status:** `in_progress`

**Description:** Algoritmo tipo Instagram/TikTok: scoring por likes (1x), comentarios (2x), compartidos (3x), recencia (decaimiento). Toggle "Recientes" vs "Populares".

**Files to Modify:**
- `convex/schema.ts` - Add `gravityScore` index
- `convex/posts.ts` - Implement scoring mutation and hot query
- `src/views/ComunidadView.tsx` - Add "HOT" filter tab

**Execution Plan:**
1. Update `convex/schema.ts` with `gravityScore` field and index.
2. Create `convex/ranking.ts` for scoring logic calculations.
3. Add a background task (Cron) to recalculate scores every 10 minutes.
4. Modify `ComunidadView` to allow sorting by `gravityScore`.

---

## Next Task: TSK-105 - AURORA CURATOR

**Status:** `claimed`

**Description:** Sistema de IA proactiva: Moderación inteligente, Trend Spotting y Meritocracia.

**Files to Modify:**
- `convex/moderation.ts` - AI Guard implementation
- `convex/trends.ts` - Trend spotting logic
- `src/components/AuroraInsight.tsx` - Trends UI widget

**Execution Plan:**
1. **Aurora Guard**: Integrate LLM check in `createPost` mutation for real-time moderation.
2. **Aurora Scout**: Implement keyword frequency analysis in `convex/trends.ts`.
3. **Aurora Merit**: Add quality assessment logic to reward technical analysis posts.

---

## 📈 Status Summary

| Task | Status | Description |
|------|--------|-------------|
| TSK-102 | done | Menu Simplification |
| TSK-103 | done | Post Publish No-Reload |
| TSK-104 | in_progress | Post Viral Ranking (Gravity) |
| TSK-105 | claimed | Aurora Curator |
