# Agent Task Division

## Propósito

Esta skill es obligatoria para cualquier trabajo multiagente. Sirve para repartir ownership, evitar duplicación y dejar trazabilidad.

## Flujo obligatorio

1. Leer `../mandatory-startup-readiness/SKILL.md` y `../mandatory-startup-readiness/references/critical-failures.md`.
2. Leer `../workspace/coordination/TASK_BOARD.md`.
3. Elegir una tarea no reclamada.
4. Cambiar su estado a `claimed` con nombre del agente y fecha.
5. Registrar en `../workspace/coordination/CURRENT_FOCUS.md`:
   - tarea elegida
   - objetivo exacto
   - archivos a tocar
   - archivos prohibidos
   - criterio de salida
6. Registrar write scope exacto antes de editar.
7. Trabajar solo dentro de ese scope.
8. Al terminar, mover la tarea a `review` o `done`.
9. Dejar nota en `../workspace/coordination/HANDOFFS.md` si otro agente debe continuar.

## Ownership

Cada tarea debe declarar uno de estos scopes:

- `brand_and_shell`
- `navigation`
- `home_and_landing`
- `community_feed`
- `pricing_and_conversion`
- `auth_and_onboarding`
- `seo_and_metadata`
- `design_system`
- `qa_and_release`
- `backend_support`

## Reglas duras

- un solo owner por scope activo
- si dos tareas tocan el mismo archivo crítico, una debe esperar o abrir handoff
- no editar `App.tsx`, `Navigation.tsx`, `ComunidadView.tsx` o `PricingView.tsx` sin reclamarlo explícitamente
- si el scope cambia, actualizar board antes de seguir
- si el objetivo cambia, actualizar `CURRENT_FOCUS.md` antes de seguir
- entrar a trabajar sin claim + focus declarado cuenta como incumplimiento operativo
- entrar a trabajar sin leer el startup skill obligatorio cuenta como incumplimiento operativo

## Plantilla de reclamo

```md
| TASK-ID | Estado | Owner | Scope | Archivos | Objetivo | Aceptación |
| TP-XXX | claimed | AGENT-X | community_feed | views/ComunidadView.tsx, components/PostCard.tsx | Simplificar jerarquía del feed | Feed más legible, sin regresiones visuales obvias |
```

## Plantilla de focus

```md
## AGENT-X
- TASK-ID:
- Fecha:
- Voy a hacer:
- Archivos que tocaré:
- Archivos que no tocaré:
- Señal de salida:
```

## Plantilla de handoff

```md
## TP-XXX -> HANDOFF
- De: AGENT-X
- Para: AGENT-Y
- Estado actual: review
- Archivos tocados:
- Riesgos:
- Qué falta:
- Cómo validar:
```

## Qué hacer si la tarea ya está tomada

- no duplicar trabajo
- no abrir una versión paralela
- buscar otra tarea o esperar handoff
