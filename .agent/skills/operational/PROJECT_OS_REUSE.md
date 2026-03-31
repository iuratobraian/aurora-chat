# Project OS Reuse

## Objetivo

Usar este framework en proyectos futuros sin reconstruirlo desde cero.

## Componentes reutilizables

- `.agent/project-os.config.json`
- `.agent/skills/*`
- `.agent/prompt-library/*`
- `.agent/brain/*`
- `.agent/portable/*`
- `.agent/workspace/coordination/*`
- `scripts/validate-project-os.mjs`
- `scripts/agent-preflight.mjs`
- `scripts/check-release-gate.mjs`
- `scripts/brain-sync.mjs`
- `scripts/project-brain-status.mjs`
- `.github/workflows/release-gate.yml`

## Cómo portarlo a otro proyecto

1. Copiar:
   - `.agent/project-os.config.json`
   - `.agent/skills/`
   - `.agent/prompt-library/`
   - `.agent/brain/`
   - `.agent/portable/`
   - `.agent/workspace/`
   - `scripts/validate-project-os.mjs`
   - `scripts/agent-preflight.mjs`
   - `scripts/check-release-gate.mjs`
   - `scripts/brain-sync.mjs`
   - `scripts/project-brain-status.mjs`

2. Ajustar en `.agent/project-os.config.json`:
   - `project_name`
   - `coordination_dir`
   - `critical_files`
   - `guarded_paths`
   - `required_files_on_code_change`

3. Reescribir:
   - `PROJECT_CHARTER.md`
   - `PRODUCT_SCOPE.md`
   - `ATTACK_PRIORITY.md`
   - `TASK_BOARD.md`
   - `AGENT_ASSIGNMENTS.md`
   - `RELEASE_BLOCKERS.md`

4. Agregar scripts al `package.json`:
   - `validate:ops`
   - `agent:preflight`
   - `release:gate`
   - `brain:sync`
   - `brain:status`

5. Conectar workflows de CI.

## Mínimo viable reusable

Si querés una versión liviana para otro repo:

- `WORKSPACE_RULES.md`
- `NON_NEGOTIABLES.md`
- `AGENT_TASK_DIVISION.md`
- `CURRENT_FOCUS.md`
- `TASK_BOARD.md`
- `AGENT_LOG.md`
- `validate-project-os.mjs`

## Regla

No copiar este framework como plantilla muerta. Siempre hay que adaptarlo al runtime, archivos críticos y prioridades reales del proyecto nuevo.
