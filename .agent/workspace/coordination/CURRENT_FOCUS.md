# CURRENT FOCUS - OpenCode Agent

## 🎯 MISSION: Sprint 5 - Resilience & UI Foundation

### Session Start: 2026-04-01 13:27:00

**Progress:** TSK-100 COMPLETE, TSK-101 IN PROGRESS

---

## Active Tasks:

### ✅ TSK-100 - AUTO FALLBACK (COMPLETE)
- **Owner:** OpenCode
- **Status:** done
- **Delivered:**
  - `src/lib/fallback.ts` - Core fallback orchestration with circuit breaker + retry + cache
  - `src/hooks/useFallback.ts` - React hooks for fallback state and per-service status
  - `src/components/AdminErrorToast.tsx` - Admin-only corner error notification
  - `src/services/fallbackWrappers.ts` - High-order service wrappers
  - `src/lib/eventBus.ts` - Added SERVICE_ERROR and FALLBACK_STATE_CHANGE events
  - `src/hooks/index.ts` - Exported new hooks
  - `src/App.tsx` - Integrated AdminErrorToast at root level

### 🔄 TSK-101 - AUTH REDESIGN (IN PROGRESS)
- **Owner:** OpenCode
- **Status:** in_progress
- **Objective:** Redesign login/register with Tailwind components, fix Convex registration flow, integrate Google Sign-In, password recovery, referral codes
- **Files to touch:**
  - `src/components/AuthModal.tsx`
  - `src/services/auth/authService.ts`
  - `convex/auth.ts`
- **Forbidden files:**
  - `src/App.tsx` (read-only for auth context)
  - `src/views/Navigation.tsx`
- **Exit criteria:** Premium auth UI, working Convex registration, Google Sign-In functional, password recovery flow, referral code support

### ⏳ TSK-114 - UI KIT (CLAIMED - QUEUE)
- **Owner:** OpenCode
- **Status:** claimed
- **Objective:** Create 21 Tailwind components for the design system
- **Files to touch:**
  - `src/components/ui/*` (create all 21 components)
  - `src/styles/patterns.css` (create)

---

## Files Being Modified:

### Analyzing:
- `src/components/AuthModal.tsx` - Current auth modal structure
- `src/services/auth/authService.ts` - Auth service implementation
- `convex/auth.ts` - Convex auth functions

---

## Forbidden Files (DO NOT MODIFY):

| File | Reason |
|------|--------|
| `src/views/Navigation.tsx` | Core TradeShare navigation |
| `convex/schema.ts` | Database schema |
| `.env.local` | Shared config (read-only) |

---

## Quick Commands:

```bash
# Check Aurora status
npm run aurora:status

# Test aurora-inicio
npm run inicio

# List Aurora files
dir aurora /s /b

# Sync with Notion
npm run aurora:notion
```

---

*Last updated: 2026-04-01 13:35:00*
