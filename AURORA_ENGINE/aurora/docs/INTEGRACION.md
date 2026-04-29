# Aurora × Agente — Integración Completa

## 🌊 Sistema de Coordinación Unificada

Esta integración une **Aurora Mente Maestra** con el **Agente de Trabajo** en un solo sistema coordinado que opera como equipo de alto rendimiento.

---

## 📁 Arquitectura

```
aurora/scripts/
├── aurora-inicio-shared.mjs    ← Punto de entrada unificado (npm run aurora:shared)
├── aurora-context-bridge.mjs   ← Puente de contexto compartido (módulo importable)
├── aurora-team-coordinator.mjs ← Coordinación en tiempo real (módulo importable)
└── aurora-agent-protocol.mjs   ← Protocolo de comunicación (módulo importable)
```

---

## 🚀 Inicio Rápido

### 1. Iniciar sesión compartida
```bash
npm run aurora:shared
```

Esto ejecuta el **inicio compartido** que:
- Sincroniza con Git (pull)
- Conecta con Notion (fuente de verdad)
- Carga el estado completo de Aurora (surfaces, skills, knowledge)
- Verifica la salud del sistema
- Construye el contexto compartido
- Muestra el dashboard completo

### 2. Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run aurora:shared` | Inicio compartido completo |
| `npm run aurora:status` | Estado del sistema |
| `npm run aurora:tasks` | Tareas pendientes |
| `npm run aurora:shell` | Shell interactiva de Aurora |
| `npm run aurora:scorecard` | Scorecard diario |
| `npm run aurora:knowledge` | Base de conocimiento |
| `npm run aurora:surfaces` | Surfaces de Aurora |
| `npm run aurora:drift` | Detección de drift |
| `npm run aurora:health-snapshot` | Health snapshot |
| `npm run aurora:session-brief` | Brief de sesión |
| `npm run aurora:conectores` | APIs y MCPs configurados |
| `npm run aurora:product` | Product intelligence |
| `npm run aurora:daily-ops` | Operaciones diarias |
| `npm run aurora:doctor` | Diagnóstico del sistema |
| `npm run aurora:intelligence` | Intelligence pipeline |
| `npm run aurora:memory-sync` | Sincronizar memoria |
| `npm run aurora:task-router` | Router de tareas |
| `npm run aurora:notion` | Sync con Notion |
| `npm run aurora:api` | Levantar API local |
| `npm run aurora:desktop` | UI de escritorio |
| `npm run kimi` | Chat con Kimi K2.5 |
| `npm run hf:agents` | HF Agents registry |

---

## 🧠 Componentes del Sistema

### 1. aurora-inicio-shared.mjs
**Punto de entrada unificado** que sincroniza todo el sistema al inicio de cada sesión.

**Módulos:**
- Git Sync → Sincroniza con el repositorio
- Notion Sync → Conecta con la fuente de verdad
- Aurora Core State → Carga surfaces, skills, knowledge
- System Health → Verifica salud del sistema
- Shared Context Builder → Construye contexto compartido
- Dashboard → Muestra estado completo

### 2. aurora-context-bridge.mjs
**Puente de contexto** que permite compartir información entre Aurora y el agente.

**Funciones exportadas:**
- `getContext()` → Obtiene contexto compartido
- `getTaskContext(taskId)` → Contexto mínimo para una tarea
- `injectKnowledge(type, entry)` → Inyecta nuevo conocimiento
- `syncContext()` → Sincroniza con estado actual
- `searchKnowledge(query)` → Busca en la base de conocimiento
- `getRelevantSurfaces(domain)` → Surfaces relevantes
- `getApplicableSkills(taskType)` → Skills aplicables
- `getExecutiveSummary()` → Resumen ejecutivo

### 3. aurora-team-coordinator.mjs
**Coordinación en tiempo real** entre Aurora y el agente.

**Funciones exportadas:**
- `claimTask(taskId, agent)` → Reclamar tarea
- `completeTask(taskId, agent, notes)` → Completar tarea
- `createHandoff(from, to, taskId, context)` → Handoff entre agentes
- `getAvailableTasks(limit)` → Tareas disponibles
- `getTeamStatus()` → Estado del equipo
- `generateProductivityReport()` → Reporte de productividad
- `syncWithNotion()` → Sync con Notion
- `updateNotionTask(taskId, status)` → Actualizar tarea en Notion

### 4. aurora-agent-protocol.mjs
**Protocolo de comunicación** estandarizado.

**Tipos de mensaje:**
- Aurora → Agente: task_assign, context_inject, skill_trigger, risk_alert, next_step
- Agente → Aurora: task_claim, task_complete, task_blocked, knowledge_contribute
- Bidireccional: sync_request, heartbeat

**Funciones exportadas:**
- `taskAssign(taskId, context)` → Asignar tarea
- `taskClaim(taskId, agent, reasoning)` → Reclamar tarea
- `taskComplete(taskId, agent, results)` → Completar tarea
- `knowledgeContribute(type, entry)` → Contribuir conocimiento
- `sendMessage(message)` → Enviar y loguear mensaje
- `handleMessage(message)` → Procesar mensaje recibido
- `startSession(agentName)` → Iniciar sesión
- `endSession(sessionId, agentName)` → Finalizar sesión

---

## 🔄 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────┐
│  INICIO DE SESIÓN COMPARTIDA                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. npm run aurora:shared                                │
│     → Git pull + Notion sync + Aurora state + Health     │
│     → Contexto compartido generado                       │
│     → Dashboard mostrado                                 │
│                                                          │
│  2. Elegir tarea                                         │
│     → De pendingTasks o Notion                           │
│     → claimTask(taskId)                                  │
│                                                          │
│  3. Implementar con Aurora como copiloto                 │
│     → getTaskContext(taskId) para contexto               │
│     → searchKnowledge(query) para patrones               │
│     → getApplicableSkills(type) para skills              │
│                                                          │
│  4. Validar                                              │
│     → npm run lint                                       │
│     → npm test                                           │
│                                                          │
│  5. Cerrar tarea                                         │
│     → completeTask(taskId, agent, notes)                 │
│     → knowledgeContribute(patterns, heuristics)          │
│     → updateNotionTask(taskId, 'Listo')                  │
│     → git push                                           │
│                                                          │
│  6. Loop infinito → Volver al paso 2                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Surfaces de Aurora

| Surface | Goal | Core/Support |
|---------|------|--------------|
| control_plane | Verdad operativa de Aurora | Core |
| memory_system | Memoria útil y reusable | Core |
| retrieval_engine | Context pack mínimo por tarea | Core |
| reasoning_layer | Reasoning operativo estructurado | Core |
| execution_support | Acelerar trabajo real | Core |
| eval_observability | Medir utilidad y salud | Core |
| connectors_mcp | Extensibilidad con MCPs | Support |
| operator_experience | Visibilidad instantánea | Support |

---

## 🎯 Skills de Aurora

| Skill | Dominios | Auto-Trigger |
|-------|----------|--------------|
| Auth Security Checker | security, convex, backend | mutation, auth |
| Rate Limiter | security, backend, convex | mutation, public |
| React Performance | frontend, react, performance | component, handler |
| Test Isolation | testing, vitest | test, spec, mock |
| Knowledge Destiller | aurora, knowledge | knowledge, heuristic |
| Context Pack Generator | aurora, context | context, prompt |
| Drift Detector | coordination, aurora | board, task |
| Contract Validator | aurora, quality | contract, schema |
| Surface Monitor | aurora, observability | surface, health |
| Knowledge Validator | aurora, knowledge | knowledge, validate |

---

## 📂 Archivos de Coordinación

Todos los archivos de estado compartido viven en:
```
.agent/workspace/coordination/
├── shared-context.json      ← Contexto compartido (generado automáticamente)
├── TASK_BOARD.md            ← Tablero de tareas
├── CURRENT_FOCUS.md         ← Foco actual del agente
├── AGENT_LOG.md             ← Historial de actividades
├── HANDOFFS.md              ← Transiciones entre agentes
├── DECISIONS.md             ← Decisiones arquitecturales
├── RELEASE_BLOCKERS.md      ← Bloqueos de release
├── agent-actions.jsonl      ← Log de acciones del agente
├── message-log.jsonl        ← Log de mensajes del protocolo
└── sessions.json            ← Historial de sesiones
```

---

## 🤖 Integración con Kimi K2.5

Kimi K2.5 está disponible como asistente estratégico:

```bash
npm run kimi
```

O como módulo:
```javascript
import { askKimi, askKimiWithContext } from './scripts/aurora-kimi-agent.mjs';

const result = await askKimi("Genera un componente React para mostrar precios");
```

---

## 📈 Métricas de Productividad

El sistema genera automáticamente:
- **Completion rate** → % de tareas completadas
- **Tasks completed today** → Tareas completadas hoy
- **Knowledge growth** → Crecimiento de la base de conocimiento
- **Health score** → Salud del sistema
- **Drift detection** → Inconsistencias detectadas

---

## 🔐 Configuración Requerida

### .env.local
```
NOTION_API_KEY=ntn_xxx
NOTION_DATABASE_ID=xxx
```

### .env.aurora
```
NVIDIA_API_KEY=nvapi-xxx
OPENROUTER_API_KEY=sk-or-xxx
```

---

## ⚡ Reglas de Oro

1. **Siempre iniciar con `npm run aurora:shared`** antes de trabajar
2. **Cada tarea debe cerrar con conocimiento contribuido** a la base de Aurora
3. **No hay placeholders ni mocks** — todo debe ser real o degradación explícita
4. **Git push cada 5 tareas** completadas
5. **Loop infinito** — no detenerse si hay tareas pendientes
6. **Doble verificación** antes de marcar cualquier tarea como done

---

## 🚀 Potencia del Sistema

Esta integración multiplica la productividad porque:

1. **Contexto compartido** → Aurora y el agente operan con la misma información
2. **Knowledge base** → Patrones, heurísticas y anti-patrones disponibles al instante
3. **Skills auto-trigger** → Detección automática de qué aplicar en cada situación
4. **Protocolo estandarizado** → Comunicación limpia y trazable
5. **Coordinación en tiempo real** → Handoffs limpios sin pérdida de información
6. **Surfaces definidas** → Cada área del producto tiene métricas y objetivos claros
7. **Health monitoring** → El sistema se auto-diagnostica constantemente
8. **Notion sync** → Fuente de verdad siempre actualizada

---

**Versión del protocolo:** 1.0.0
**Última actualización:** 2026-04-01
