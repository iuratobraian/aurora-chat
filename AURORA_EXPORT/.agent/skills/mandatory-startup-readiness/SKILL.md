---
name: mandatory-startup-readiness
description: Lectura y entrenamiento obligatorio al iniciar una sesión en este repo. Úsalo siempre al arrancar trabajo operativo, auditorías, hardening, tareas Convex, admin, pagos, feeds, noticias, creator, Instagram o cualquier cambio que pueda terminar marcado como done. Previene errores graves ya observados en TradePortal: mocks cerrados como reales, localStorage como fuente de verdad, RLS incompleto, contratos frontend/backend rotos, llamadas a internal mutations desde UI, y smoke insuficiente.
---

# Mandatory Startup Readiness

## Cuándo se usa

Siempre al iniciar una sesión o antes de reclamar una tarea.

## Flujo obligatorio

1. Leer `../README.md`.
2. Leer `references/critical-failures.md`.
3. Confirmar el source of truth de la superficie a tocar:
   - Convex real
   - servicio cliente oficial
   - endpoint backend oficial
   - env de producción correctas
4. Revisar que el frontend y el backend compartan el mismo contrato:
   - mismos args
   - mismos nombres de campos
   - mismas reglas de auth
5. Antes de marcar `done`, rechazar el cierre si existe alguno de estos anti-patrones:
   - mock/demo data activa
   - fallback silencioso a `localStorage`
   - `window.convex`
   - `adminId`, `moderatorId`, `userId` hardcodeados
   - `internalMutation` o `internalAction` llamados desde cliente
   - `fetch('/api/...')` legacy compitiendo con el orquestador oficial
   - `alert`, `confirm`, `showToast('info', '... en desarrollo')`
   - consultas Convex sin ownership/admin validation
   - `collect()` completo o N+1 en listados administrativos grandes
6. Validar con doble check:
   - lint/typecheck
   - smoke de flujo real y, si aplica, cross-browser

## Reglas de escritura

- Escribir desde el contrato backend hacia la UI, no al revés.
- Si el estado es compartido entre navegadores, no usar `localStorage` como fuente de verdad.
- Si una acción es admin-only, la validación vive en Convex, no en la vista.
- Si un mutation pide `userId` o `moderatorId`, la UI debe enviarlo y el backend debe además validar `ctx.auth`.
- Si existe un flujo oficial, no dejar un flujo legacy paralelo “por compatibilidad”.
- Si hay degradación, debe ser explícita y visible; no silenciosa.
- Si una tarea dice “real”, “cloud”, “prod” o “sync”, el criterio de cierre es comportamiento real, no UI bonita.

## Qué leer después

- `../foundations/README.md`
- `../agents/AGENT_TASK_DIVISION.md`
- `../../session/SESSION_START_PROTOCOL.md`
