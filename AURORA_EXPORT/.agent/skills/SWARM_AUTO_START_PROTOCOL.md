---
name: swarm_auto_start_protocol
description: Protocolo obligatorio de inicio de swarm para tareas complejas (3+ archivos, nuevas features, refactors, cambios de seguridad, schema de Convex). Referencia directa de Ruflo v3.5.
---

# Swarm Auto-Start Protocol — TradeShare

## Cuándo activar el swarm

**SIEMPRE invocar swarm si la tarea implica:**
- 3 o más archivos modificados
- Nueva feature (componente, vista, ruta, mutación Convex)
- Refactor de módulos existentes
- Cambios de seguridad / auth
- Performance optimization
- Cambios de schema en Convex

**OMITIR swarm si:**
- Edición de un solo archivo (bug fix de 1-2 líneas)
- Actualización de documentación
- Cambio de configuración puntual
- Preguntas o exploración rápida

---

## Protocolo de 4 Pasos (ejecutar en UN SOLO mensaje)

### Paso 1 — Inicializar coordinación swarm vía MCP

```javascript
mcp__ruv-swarm__swarm_init({
  topology: "hierarchical",
  maxAgents: 8,
  strategy: "specialized"
})
```

### Paso 2 — Spawn de agentes vía Task tool (TODOS en el mismo mensaje)

```javascript
Task("Coordinator",
  "Eres el coordinador del swarm. Inicializa sesión y coordina agentes vía memory hooks. " +
  "Ejecuta: npx @claude-flow/cli@latest hooks session-start",
  "hierarchical-coordinator")

Task("Researcher",
  "Analiza requerimientos y patrones de código existentes. Guarda hallazgos en memoria.",
  "researcher")

Task("Architect",
  "Diseña el enfoque de implementación basado en el research. Documenta decisiones en memoria.",
  "system-architect")

Task("Coder",
  "Implementa la solución siguiendo el diseño del Architect. Usa post-edit hooks al terminar.",
  "coder")

Task("Tester",
  "Escribe tests para la implementación. Reporta cobertura vía hooks.",
  "tester")

Task("Reviewer",
  "Revisa calidad de código y seguridad. Documenta hallazgos.",
  "reviewer")
```

### Paso 3 — Batch de todos los todos en UN solo TodoWrite

```javascript
TodoWrite({ todos: [
  { content: "Init swarm coordination", status: "in_progress" },
  { content: "Research requirements", status: "in_progress" },
  { content: "Design architecture", status: "pending" },
  { content: "Implement solution", status: "pending" },
  { content: "Write tests", status: "pending" },
  { content: "Review and finalize", status: "pending" }
]})
```

### Paso 4 — Guardar estado en memoria

```javascript
mcp__claude-flow__memory_usage({
  action: "store",
  namespace: "swarm",
  key: "current-session",
  value: JSON.stringify({
    task: "[descripción de tarea]",
    agents: 6,
    startedAt: new Date().toISOString()
  })
})
```

---

## Routing de Agentes por Tipo de Tarea

| Código | Tipo | Agentes |
|--------|------|---------|
| 1 | Bug Fix | coordinator, researcher, coder, tester |
| 3 | Feature | coordinator, architect, coder, tester, reviewer |
| 5 | Refactor | coordinator, architect, coder, reviewer |
| 7 | Performance | coordinator, perf-engineer, coder |
| 9 | Seguridad | coordinator, security-architect, auditor |
| 11 | Convex/DB | coordinator, researcher, backend-dev, tester |
| 13 | Trading/Señales | coordinator, researcher, backend-dev, tester |
| 15 | Aurora/IA | coordinator, ml-developer, coder, tester |
| 17 | Marketing | coordinator, researcher, coder |

---

## Reglas de Ejecución Post-Spawn

1. **Después de hacer spawn: STOP.** No agregar más tool calls ni checar status
2. Los agentes retornan cuando terminan — confiar en el proceso
3. Al recibir resultados: revisar TODOS antes de continuar
4. Actualizar `AGENT_LOG.md` con entry corta y verificable
5. Cambiar `TASK_BOARD.md` a `done` solo cuando lint + tests pasan

---

## Comandos de Hook Esenciales

```bash
# Pre-task
npx @claude-flow/cli@latest hooks pre-task --description "[task]"

# Post-task (con resultado)
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true

# Post-edit (entrena patrones)
npx @claude-flow/cli@latest hooks post-edit --file "[archivo]" --train-patterns

# Session management
npx @claude-flow/cli@latest hooks session-start --session-id "[id]"
npx @claude-flow/cli@latest hooks session-end --export-metrics true
```
