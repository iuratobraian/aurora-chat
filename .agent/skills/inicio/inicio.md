# Comando Maestro: `inicio` — Protocolo de Activación Ruflo v3.5

## Propósito
El comando `inicio` es el **punto de entrada obligatorio** para cualquier sesión de IA en TradeShare. Activa el swarm, carga contexto, ejecuta hooks de sesión y determina automáticamente la siguiente tarea de mayor prioridad.

---

## PASO 1 — Activar Hooks de Sesión (INMEDIATO)

Al ejecutar `inicio`, el agente corre estos comandos **en paralelo**:

```bash
# Hook de sesión
npx @claude-flow/cli@latest hooks session-start --session-id "tradeshare-$(date +%Y%m%d-%H%M)"

# Pre-task de recuperación de contexto
npx @claude-flow/cli@latest hooks pre-task --description "Context recovery + session init"

# Estado del sistema
node scripts/aurora-session-brief.mjs

# ⚡ AUTO-SYNC NOTION (Fuente de Verdad)
node scripts/aurora-notion-sync.mjs
```

> **NOTION es la fuente de verdad.** Al arrancar, siempre sincronizar con Notion para ver tareas en tiempo real.

---

## PASO 2 — Recuperación de Contexto (Lectura Crítica Paralela)

Leer **en paralelo** (no secuencial):

1. `.agent/skills/mandatory-startup-readiness/SKILL.md` — skill obligatoria de errores críticos a evitar
2. `.agent/skills/mandatory-startup-readiness/references/critical-failures.md` — fallas reales ya detectadas en el repo
3. `AGENTS.md` — leyes de autonomía y protocolo AMM + Ruflo v3.5
4. `CLAUDE.md` — configuración de swarm, topologías, agent routing
5. `.agent/workspace/coordination/CURRENT_FOCUS.md` — qué está activo
6. `.agent/workspace/coordination/AGENT_LOG.md` (últimas 3 entradas)
7. `.agent/workspace/coordination/TASK_BOARD.md` (tareas `pending` y `claimed`)
8. `.agent/workspace/coordination/NOTION_SYNC_PROTOCOL.md` — protocolo de coordinación Notion
9. `.agent/skills/SWARM_AUTO_START_PROTOCOL.md` — protocolo vigente
10. `.agent/skills/TRADESHARE_AGENT_ROUTING.md` — tabla de routing

> **Última salida de Notion:** Mostrar las tareas pendientes de Notion al inicio para que el equipo vea qué está disponible.

```bash
# Resumen rápido por consola
node scripts/aurora-context-recovery.mjs
node scripts/aurora-sovereign.mjs
```

---

## PASO 3 — Detección de Complejidad y Routing

Con el contexto cargado, evaluar la próxima tarea usando la tabla de routing de `TRADESHARE_AGENT_ROUTING.md`:

```
SI archivos_afectados >= 3 O tipo == "feature" O tipo == "security":
  → INVOCAR SWARM (ver Paso 4)
SINO:
  → Edición directa, sin swarm
```

---

## PASO 4 — Init Swarm (si aplica)

Ejecutar en **UN SOLO mensaje** (patrón Ruflo anti-drift):

```javascript
// 1. Inicializar swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

// 2. Spawn ALL agentes en el mismo mensaje via Task tool
Task("Coordinator", "Inicializar sesión. Coordinar agentes vía hooks.", "hierarchical-coordinator")
Task("Researcher", "Analizar codebase y requerimientos. Guardar en memoria.", "researcher")
Task("Architect", "Diseñar solución. Documentar en memoria.", "system-architect")
Task("Coder", "Implementar solución.", "coder")
Task("Tester", "Escribir tests.", "tester")
Task("Reviewer", "Revisar calidad y seguridad.", "reviewer")

// 3. Guardar estado en memoria compartida
npx @claude-flow/cli@latest memory store --key "session-current" --value "{task, agents, timestamp}" --namespace tradeshare-swarm
```

**Después de spawn: STOP. No agregar más tool calls.**

---

## PASO 5 — Mejora Proactiva Aurora (AMM Obligatorio)

Antes de ejecutar tareas del board, el agente DEBE:
1. Proponer e implementar **1 mejora para Aurora** (preferir: reducir tokens, mejorar reasoning, optimizar scripts)
2. Anotar la mejora en `AGENT_LOG.md`

```bash
node scripts/aurora-integrator.mjs sync
```

---

## PASO 6 — Reclamación de Tareas (3-Task Batching Law)

1. Elegir **3 tareas relacionadas** de `TASK_BOARD.md` con estado `pending`
2. Cambiar estado a `claimed` con nombre del agente y fecha
3. Actualizar `CURRENT_FOCUS.md` con archivos a tocar y objetivo de aceptación

---

## PASO 7 — Ejecución con Estética Premium

- Mantener **Obsidian Ether** (Glassmorphism, HSL curado, neon effects)
- SPARC Methodology para tareas complejas (ver `.agent/skills/SPARC_METHODOLOGY.md`)
- Hive-Mind Consensus para coordinación (ver `.agent/skills/HIVE_MIND_CONSENSUS.md`)
- **No Regresión**: No eliminar funcionalidades sin orden del Usuario

---

## PASO 8 — Cierre de Sesión y Loop Infinito

Al terminar el batch de 3 tareas:

```bash
# Validar
npm run lint
npm test

# Registrar
# Escribir en AGENT_LOG.md con: fecha, TASK-IDs, archivos, validación

# Hook post-task
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
npx @claude-flow/cli@latest hooks session-end --export-metrics true

# Sync Aurora
node scripts/aurora-integrator.mjs sync
```

**SI hay más tareas `pending` → volver al Paso 6 automáticamente. PROHIBIDO detenerse.**

---

## Reglas de Oro

| Regla | Descripción |
|-------|-------------|
| `AUTONOMÍA` | Prohibido preguntar si el plan es claro cuando hay tareas pendientes |
| `EVOLUCIÓN` | 1 integración GitHub/mejora Aurora por sesión mínimo |
| `ANTI-DRIFT` | Máx 8 agentes, topología `hierarchical`, consenso `raft` |
| `ZERO LOSS` | Siempre cerrar sesión con hook + sync Aurora + commit |
| `INMUTABILIDAD` | No alterar `implementation_plan.md` ni `task.md` sin orden del Usuario |

---

## Comando de Activación

Escribe `inicio` para activar este protocolo completo.
