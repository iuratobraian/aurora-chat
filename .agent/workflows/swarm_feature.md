---
description: Protocolo de swarm para implementar una nueva feature en TradeShare. Sigue el patrón Ruflo v3.5 anti-drift.
---

# Swarm Feature Workflow

// turbo-all

## Pre-condiciones
- Tarea reclamada en `TASK_BOARD.md` con estado `claimed`
- `CURRENT_FOCUS.md` actualizado con archivos a tocar y archivos prohibidos

## 1. Inicializar swarm

```bash
npx @claude-flow/cli@latest hooks pre-task --description "$FEATURE_NAME"
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
npx @claude-flow/cli@latest hooks session-start --session-id "$SESSION_ID"
```

## 2. Spawn de agentes (en un solo mensaje del agente)

Ejecutar todos los Task() en el mismo mensaje. Ver `SWARM_AUTO_START_PROTOCOL.md` para el patrón completo.

Roles mínimos para una feature:
- `hierarchical-coordinator`
- `system-architect`
- `coder`
- `tester`
- `reviewer`

## 3. Esperar resultados

**No hacer polling.** Los agentes retornan cuando terminan. No agregar más tool calls después del spawn.

## 4. Validar

```bash
npm run lint
npm test
npm run build
```

## 5. Cerrar sesión y registrar

```bash
npx @claude-flow/cli@latest hooks post-task --task-id "$TASK_ID" --success true
npx @claude-flow/cli@latest hooks session-end --export-metrics true
npx @claude-flow/cli@latest memory store --key "feature-$FEATURE_NAME" --value "$SUMMARY" --namespace tradeshare-patterns
```

## 6. Actualizar coordination files

- `TASK_BOARD.md` → estado `done`
- `AGENT_LOG.md` → entry corta con fecha, archivos cambiados, validación
- `CURRENT_FOCUS.md` → limpiar si ya no hay tarea activa
