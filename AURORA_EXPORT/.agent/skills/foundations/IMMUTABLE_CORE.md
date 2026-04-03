# Immutable Core

## Propósito

Definir la infraestructura sagrada del equipo. Esta capa no debe modificarse durante trabajo normal.

## Regla absoluta

La infraestructura del Project OS es inmutable para los agentes de trabajo.

Nadie puede modificar, borrar o degradar esta capa salvo mediante proceso de override explícito.

## Core protegido

- `.agent/project-os.config.json`
- `.agent/security-baseline.json`
- `.agent/skills/README.md`
- `.agent/skills/WORKSPACE_RULES.md`
- `.agent/skills/NON_NEGOTIABLES.md`
- `.agent/skills/ATTACK_PRIORITY.md`
- `.agent/skills/AGENT_TASK_DIVISION.md`
- `.agent/skills/AGENT_BOOTCAMP.md`
- `.agent/skills/ENFORCEMENT.md`
- `.agent/skills/IMMUTABLE_CORE.md`
- `.agent/skills/PROJECT_OS_REUSE.md`
- `.agent/skills/PROMPT_LIBRARY.md`
- `.agent/workspace/coordination/TASK_BOARD.md`
- `.agent/workspace/coordination/CURRENT_FOCUS.md`
- `.agent/workspace/coordination/DECISIONS.md`
- `.agent/workspace/coordination/RELEASE_BLOCKERS.md`
- `.github/workflows/ci.yml`
- `.github/workflows/release-gate.yml`
- `.github/workflows/repo-guardian.yml`
- `scripts/validate-project-os.mjs`
- `scripts/check-release-gate.mjs`
- `scripts/detect-hardcodes-and-secrets.mjs`
- `scripts/report-critical-changes.mjs`

## Override

Si de verdad hay que cambiar el core:

1. Abrir decisión en `DECISIONS.md`.
2. Actualizar `ARCHITECT_OVERRIDE.md`.
3. Explicar:
   - qué se cambia
   - por qué
   - riesgo
   - rollback

## Regla de interpretación

El equipo debe actuar como si solo el arquitecto del sistema pudiera aprobar cambios aquí.
