# CURRENT FOCUS - OpenCode

## NTN-019: Mi Comunidad/Observatory Integration (IN PROGRESS)
- **Fecha:** 2026-03-31
- **Objetivo:** Integrar natively Mi Comunidad/Observatory dentro del Creator Admin Panel
- **Files to touch:**
  - `src/views/CreatorDashboard.tsx` - Add Mi Comunidad/Observatory section
  - `src/views/CommunityDetailView.tsx` - Verify community tools integration
- **Files forbidden:** `App.tsx`, `Navigation.tsx`, `ComunidadView.tsx`, `PricingView.tsx`

## NTN-020: Marketplace → Negocios (CLAIMED)
- **Fecha:** 2026-03-31
- **Objetivo:** Renombrar Marketplace a Negocios y mover Publicidad dentro
- **Files to touch:**
  - `src/views/Navigation.tsx` - Update menu labels
  - `src/views/MarketplaceView.tsx` - Update title/branding
- **Files forbidden:** `App.tsx`, `ComunidadView.tsx`, `PricingView.tsx`

## NTN-021: Top Menu Reconfig (CLAIMED)
- **Fecha:** 2026-03-31
- **Objetivo:** Remove Aprender, move Psicotrading to Trading, remove Cursos, remove Voz IA
- **Files to touch:**
  - `src/views/Navigation.tsx` - Reconfigure top menu sections
- **Files forbidden:** `App.tsx`, `ComunidadView.tsx`, `PricingView.tsx`
