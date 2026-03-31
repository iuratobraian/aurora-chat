# Integración de Aurora como agente colaborativo

## Objetivo
Convertir a Aurora en un agente “más” dentro de Antigravity/OpenCode: auto-training, knowledge sharing, connectors y documentación que cualquiera del equipo puede usar sin conocer el backend.

## Componentes
1. **Documentación operativa**: `EXPONENTIAL_GROWTH_PLAN.md`, `OSS_AI_GROWTH_PLAN.md`, `GPU_ACCELERATION.md`, `OPEN_SOURCE_AI_REPO_ACTIONS.md`, `OPEN_SOURCE_AI_REPO_GUIDE.md`.
2. **Entradas obligatorias**: cada slash command se registra en `activity_log.jsonl`; el auto learn en `oss_ai_repos` y `teamwork_knowledge`.
3. **Health check**: `scripts/aurora-ensure-port`, `aurora-gpu-check`, `models:status`, `ops:activity`, `ops:auto-learn` sirven como pruebas diarias.
4. **Integración de flujo**: `scripts/start-aurora-all.ps1`, `run-aurora-shell.ps1`, `Start-Aurora` (perfil) auto instalan la API-shell.
5. **Onboarding de agentes**: `scripts/aurora-choose-repo`, `/agent add`, `agent-registry`, `ai_models` se usan para registrar nuevos agentes e indicar repos activos.

## Acciones recomendadas
1. Cada sprint de Antigravity/OpenCode inicia con `npm run aurora:models:status`, `npm run gpu:check` y `npm run ops:activity`.
2. Los equipos usan `/research owner/repo` y `/learn <hecho>` para alimentar el conocimiento común.
3. Las integraciones se registran en `AGENT_INTEGRATION_PLAN.md` y las entradas se mantienen en `.agent/brain/db`.
4. Cada onboarding nuevo ejecuta `scripts/register-aurora-function.ps1` para tener la función `Start-Aurora` automática.
