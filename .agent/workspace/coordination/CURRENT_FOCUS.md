# CURRENT FOCUS: Audit Cleanup - Type Guards & NeonLoader

## AGENT: @aurora
- TASK-ID: AUDIT-004, AUDIT-005
- Fecha: 2026-04-02
- Estado: **IN PROGRESS**

## Tasks
- [ ] **AUDIT-004**: Add type guards for ctx.db.get() across Convex files
- [ ] **AUDIT-005**: Fix NeonLoader size prop type

## Files Involved
- `convex/posts.ts` (type guards for ctx.db.get)
- `convex/*.ts` (type assertions)
- `src/components/AuthModal.tsx` (NeonLoader size prop)
- `src/components/ui/NeonLoader.tsx` (size prop definition)

## Forbidden Files
- `App.tsx`
- `Navigation.tsx`
- `ComunidadView.tsx`
- `PricingView.tsx`

## Output Signal
- `npm run lint` returns "Found 0 errors"
- `npm run build` exits with code 0
- AUDIT-004, AUDIT-005 marked as `done` in TASK_BOARD.md
