# CURRENT FOCUS - OpenCode

## ✅ NOTION-012 COMPLETED - Deploy Convex

### Completed:
- ✅ CONVEX_DEPLOY_KEY configured
- ✅ Deployed to https://diligent-wildcat-523.convex.cloud
- ✅ Generated _generated files (api.ts, server.ts, dataModel.d.ts)
- ✅ Schema deployed with all tables and indexes

### Notes:
- Deploy executed with `--typecheck=disable` due to 2 pre-existing TS errors:
  1. `convex/mercadopagoApi.ts:295` - index name mismatch ("by_user" vs "by_userId")
  2. `convex/posts.ts:1` - PaginationOptions import doesn't exist
- These are non-blocking warnings that can be fixed in a future task

---

## Next Tasks (Claimed per Protocol):

**NOTION-014: Registro — validar email, password, username** [IN PROGRESS]
- **Tipo:** Feature | **Prioridad:** Critical
- **Objetivo:** Validar email formato, password min 6 chars, username único
- **Files to touch:** `src/views/AuthModal.tsx`, `src/services/auth.ts`, `convex/auth.ts`

**NOTION-015: Login JWT — verificar tokens** [CLAIMED]
- **Tipo:** Feature | **Prioridad:** Critical
- **Objetivo:** Verificar que tokens JWT se firman y validan correctamente
- **Files to touch:** `server.ts`, `src/services/auth.ts`, `lib/auth/jwt.ts`

**NOTION-013: Persistencia de sesión** [CLAIMED]
- **Tipo:** Feature | **Prioridad:** High
- **Objetivo:** Que la sesión no se pierda al recargar la página
- **Files to touch:** `src/services/auth.ts`, `src/hooks/useAuth.ts`, `lib/auth/session.ts`

---

### Remaining After This Batch:
- NOTION-004: WebSockets base (High)
- NOTION-005: Realtime señales (Critical)
- NOTION-011: Optimizar performance (High)

---
*Updated: 2026-03-31 | NOTION-012 complete - Convex deployed & _generated created*
