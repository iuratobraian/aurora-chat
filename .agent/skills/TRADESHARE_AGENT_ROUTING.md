---
name: tradeshare_agent_routing
description: Tabla maestra de routing de agentes para TradeShare. Referencia rápida para saber qué agentes instanciar por tipo de tarea, con topología y estrategia recomendada.
---

# TradeShare Agent Routing — Referencia Maestra

Basado en Ruflo v3.5 Anti-Drift Coding Swarm. Siempre usar topología `hierarchical` y estrategia `specialized` para tareas de código.

## Tabla de Routing

| Código | Tipo de Tarea | Agentes a Instanciar | Topología | Consenso |
|--------|--------------|----------------------|-----------|----------|
| **1** | Bug Fix crítico | coordinator, researcher, coder, tester | hierarchical | raft |
| **3** | Nueva Feature | coordinator, architect, coder, tester, reviewer | hierarchical | raft |
| **5** | Refactor de módulo | coordinator, architect, coder, reviewer | hierarchical | raft |
| **7** | Performance / Bundle | coordinator, perf-engineer, coder | hierarchical | raft |
| **9** | Seguridad / Auth | coordinator, security-architect, security-auditor | hierarchical | byzantine |
| **11** | Convex / Schema DB | coordinator, researcher, backend-dev, tester | hierarchical | raft |
| **13** | Trading / Señales | coordinator, researcher, backend-dev, tester | hierarchical | raft |
| **15** | Aurora / IA / LLM | coordinator, ml-developer, coder, tester | hierarchical | raft |
| **17** | Marketing / Growth | coordinator, researcher, coder | mesh | balanced |
| **19** | Docs / Skills | researcher, api-docs | mesh | balanced |
| **21** | Mobile / PWA | coordinator, mobile-dev, coder, tester | hierarchical | raft |
| **23** | Tests / Coverage | coordinator, tester, reviewer | hierarchical | raft |

## Cómo usar esta tabla

1. Identificar tipo de tarea → elegir código
2. Ejecutar `swarm init` con la topología y consenso de la tabla
3. Hacer spawn de los agentes listados en un solo mensaje Task
4. Guardar estado en memoria con namespace `tradeshare-swarm`

```bash
# Ejemplo: Nueva Feature (código 3)
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

```javascript
// Spawn en un solo mensaje
Task("Coordinator", "Coordinar swarm para nueva feature. Inicializar sesión.", "hierarchical-coordinator")
Task("Architect", "Diseñar arquitectura de la feature. Documentar en memoria.", "system-architect")
Task("Coder", "Implementar según diseño.", "coder")
Task("Tester", "Escribir tests. Reportar cobertura.", "tester")
Task("Reviewer", "Revisar calidad y seguridad.", "reviewer")
```

## Agentes Disponibles en TradeShare

### Core
- `coordinator` / `hierarchical-coordinator` — Orquestación
- `researcher` — Análisis de código y requerimientos
- `architect` / `system-architect` — Diseño técnico
- `coder` / `sparc-coder` — Implementación
- `tester` — Tests unitarios e integración
- `reviewer` — Code review

### Especializados TradeShare
- `backend-dev` — Convex mutations/queries, Express endpoints, webhooks
- `ml-developer` — Aurora embeddings, reasoning layer, fine-tuning
- `mobile-dev` — Capacitor, PWA, Android build, service workers
- `security-architect` — Auth, rate limiting, input validation
- `security-auditor` — Auditoría de permisos Convex, CORS, CSP
- `perf-engineer` — Bundle size, N+1 queries, HNSW search
- `api-docs` — Documentación de skills, workflows, endpoints

## Regla Anti-Drift

> Siempre asignar roles claros. Nunca dos agentes con el mismo rol en el mismo swarm.
> El coordinator es el único que puede escribir en `TASK_BOARD.md` y `CURRENT_FOCUS.md`.

## Detección Automática de Complejidad

```
IF archivos_afectados >= 3 OR tarea == "nueva feature" OR tarea == "seguridad"
  → INVOCAR SWARM (elegir código de tabla)
ELSE
  → Edición directa sin swarm
```
