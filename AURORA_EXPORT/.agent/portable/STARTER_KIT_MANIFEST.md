# Starter Kit Manifest

## Copiar siempre

- `.agent/project-os.config.json`
- `.agent/security-baseline.json`
- `.agent/skills/`
- `.agent/prompt-library/`
- `.agent/templates/`
- `.agent/brain/`
- `.agent/workspace/`
- `scripts/validate-project-os.mjs`
- `scripts/agent-preflight.mjs`
- `scripts/check-release-gate.mjs`
- `scripts/detect-hardcodes-and-secrets.mjs`
- `scripts/report-critical-changes.mjs`
- `scripts/enforce-immutable-core.mjs`
- `scripts/project-os-status.mjs`
- `scripts/project-os-open-work.mjs`
- `scripts/project-os-scorecard.mjs`
- `scripts/project-os-templates.mjs`
- `scripts/project-os-prompts.mjs`
- `scripts/project-os-finish-check.mjs`
- `scripts/brain-sync.mjs`
- `scripts/project-brain-status.mjs`
- `.github/workflows/ci.yml`
- `.github/workflows/release-gate.yml`
- `.github/workflows/repo-guardian.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

## Reescribir al crear proyecto nuevo

- `PROJECT_CHARTER.md`
- `PRODUCT_SCOPE.md`
- `ATTACK_PRIORITY.md`
- `TASK_BOARD.md`
- `CURRENT_FOCUS.md`
- `DECISIONS.md`
- `RELEASE_BLOCKERS.md`
- `AGENT_ASSIGNMENTS.md`
- `LEARNING_LOG.md`
- `PROJECT_BRAIN.md`
- `WORKTABLE_PLAYBOOK.md`

## Ajustar configuración

- `project_name`
- `critical_files`
- `guarded_paths`
- `required_files_on_code_change`
- baseline de seguridad
