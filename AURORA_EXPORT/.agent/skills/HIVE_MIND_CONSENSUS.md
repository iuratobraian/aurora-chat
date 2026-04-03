---
name: hive_mind_consensus
description: Referencia de topologías y estrategias de consenso para swarms de múltiples agentes. Basado en Ruflo v3.5 Hive-Mind con tolerancia a fallos Byzantine, Raft y CRDT. Usar cuando se coordinen 4+ agentes o haya riesgo de drift.
---

# Hive-Mind Consensus — Referencia TradeShare

## Qué es Hive-Mind

Sistema de coordinación distribuida para swarms de agentes donde un "líder" (o quórum) mantiene el estado autoritativo del sistema, evitando que agentes individuales tomen decisiones contradictorias.

---

## Topologías

| Topología | Descripción | Cuándo usar |
|-----------|-------------|-------------|
| `hierarchical` | Queen dirige workers directamente | Tareas de código (anti-drift default) |
| `mesh` | Red completamente conectada entre pares | Research, docs, sin dependencias fuertes |
| `hierarchical-mesh` | Híbrido (recomendado para TradeShare) | Features complejas con sub-equipos |
| `adaptive` | Dinámica según carga | Tareas de duración imprevisible |

## Estrategias de Consenso

| Estrategia | Tolerancia a Fallos | Uso en TradeShare |
|------------|--------------------|--------------------|
| `raft` | f < n/2 agentes caídos | **Default para swarms de código** |
| `byzantine` | f < n/3 agentes maliciosos | Revisiones de seguridad críticas |
| `gossip` | Eventual consistency | Sincronización de memoria entre sesiones |
| `crdt` | Conflict-free (sin coordinador) | Actualizaciones paralelas a TASK_BOARD |
| `quorum` | Configurable (mayoría simple) | Decisiones de arquitectura en equipo |

---

## Configuración Recomendada por Escenario

### Coding Swarm (default)
```bash
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --max-agents 8 \
  --strategy specialized \
  --consensus raft
```

### Security Audit Swarm
```bash
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --max-agents 6 \
  --strategy specialized \
  --consensus byzantine
```

### Research / Docs Swarm
```bash
npx @claude-flow/cli@latest swarm init \
  --topology mesh \
  --max-agents 4 \
  --strategy balanced \
  --consensus gossip
```

---

## Hive-Mind CLI Commands

```bash
# Inicializar hive-mind
npx @claude-flow/cli@latest hive-mind init --topology hierarchical

# Ver estado del consenso
npx @claude-flow/cli@latest hive-mind status

# Forzar re-elección de líder (si el coordinator falla)
npx @claude-flow/cli@latest hive-mind elect

# Ver log de decisiones distribuidas
npx @claude-flow/cli@latest hive-mind log --last 20
```

---

## Coordinación de Memoria (Shared Namespace)

Todos los agentes del swarm **DEBEN** usar el mismo namespace:

```bash
# Agente escribe
npx @claude-flow/cli@latest memory store \
  --key "decision-[tema]" \
  --value "[decisión]" \
  --namespace tradeshare-swarm

# Agente lee
npx @claude-flow/cli@latest memory search \
  --query "[tema]" \
  --namespace tradeshare-swarm
```

---

## Checkpoint Automático con Post-Task Hooks

El coordinator debe ejecutar checkpoints frecuentes para garantizar que el estado no se pierda:

```bash
# Después de cada tarea de agente
npx @claude-flow/cli@latest hooks post-task \
  --task-id "[id]" \
  --success true \
  --namespace tradeshare-swarm
```

---

## Reglas Anti-Drift en Hive-Mind

1. **Un solo líder** por swarm (el coordinator) — nunca dos coordinators
2. **Estado compartido en memoria** — no en variables locales de agentes
3. **Checkpoints frecuentes** — post-task hooks obligatorios
4. **Máximo 8 agentes** — más agentes = más drift potencial
5. **Roles especializados** — sin solapamiento de responsabilidades
6. **Consenso raft para código** — leader mantiene estado autoritativo

---

## Ejemplo: Swarm con Hive-Mind para Feature Compleja

```javascript
// 1. Init con hive-mind
mcp__ruv-swarm__swarm_init({
  topology: "hierarchical",
  maxAgents: 8,
  strategy: "specialized",
  consensus: "raft"
})

// 2. Leader (coordinator) establece estado inicial
mcp__claude-flow__memory_usage({
  action: "store",
  namespace: "tradeshare-swarm",
  key: "session-state",
  value: JSON.stringify({ phase: "init", leader: "coordinator", task: "..." })
})

// 3. Workers leen y actualizan estado vía shared memory
// (Cada agente lee el estado antes de actuar)
mcp__claude-flow__memory_usage({
  action: "retrieve",
  namespace: "tradeshare-swarm",
  key: "session-state"
})
```
