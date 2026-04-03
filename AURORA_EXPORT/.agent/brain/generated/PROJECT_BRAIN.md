# Project Brain Snapshot

## Mission

Preservar y reutilizar el mejor conocimiento operativo y técnico del proyecto para que el equipo tome mejores decisiones con menos fricción.

## Current Role At The Worktable

Project Brain ya puede cumplir estas funciones:

1. recordar decisiones vigentes
2. advertir non-negotiables
3. sugerir qué atacar primero
4. recomendar qué agente conviene para cada tarea
5. detectar anti-patrones operativos
6. resumir cómo cerrar trabajo sin dejar código zombie

## Core Truths

- La fuente de verdad operativa del equipo es el Project OS.
- El backend objetivo del producto es Convex como source of truth de negocio.
- `localStorage` no debe usarse como verdad de negocio.
- El release no debe avanzar mientras existan blockers críticos abiertos.
- El core de infraestructura no se toca sin override explícito.

## Stable Recommendations

- Cuando haya dudas, gana estabilidad sobre velocidad.
- Cuando haya dudas, gana infraestructura sobre estética.
- Cuando haya dudas, gana tarea pequeña y verificable sobre tarea ambigua y grande.
- Cuando se cree una sección o feature nueva, primero se crea la spec.
- Cuando se cierre una tarea importante, debe dejar aprendizaje.

## Agent Routing

- `gpt-5 nano` o `Gemini Flash`: supervisión barata, orden, blockers, síntesis
- `Claude Code`: integración compleja, refactor largo, debugging profundo
- `Gemini Pro` o `Kimi-K2.5 Cloud`: análisis amplio y alternativas
- `MIMO V2 PRO FREE`: frontend con blueprint
- `minimax M2.5` / `minimax-m2.7 cloud`: auditoría técnica y refactor medio
- `bigpickle`, `Gemma 3 4B`, `Ollama Qwen 3.5`: ejecución corta, repetible y bien delimitada

## Anti-Patterns To Stop Immediately

- trabajo sin task reclamada
- trabajo sin focus declarado
- cambios críticos sin decisiones
- features nuevas sin spec
- tareas cerradas sin validación
- código parcial abandonado
- delegación ambigua a agentes free

## Immediate Priority Ladder

1. estabilidad
2. runtime real y backend
3. configuración y secretos
4. source of truth de datos
5. auth y confianza server-side
6. pagos y webhooks
7. observabilidad y QA
8. branding, navegación y home

## Distilled Learnings

- una sola fuente de verdad operativa reduce duplicación y caos
- las reglas importantes necesitan enforcement automático
- las nuevas estructuras salen mejor cuando nacen con spec
- los agentes free rinden mejor con scope corto y aceptación explícita
- la inteligencia local empieza como memoria curada, no como magia

## Knowledge References

- `knowledge/ENGINEERING_PRINCIPLES.md`
- `knowledge/ARCHITECTURE_HEURISTICS.md`
- `knowledge/DEBUGGING_PLAYBOOK.md`
- `knowledge/REVIEW_PLAYBOOK.md`
- `knowledge/DELEGATION_PLAYBOOK.md`
- `knowledge/PRODUCTION_PLAYBOOK.md`
- `knowledge/USER_ALIGNMENT_PLAYBOOK.md`
- `knowledge/NATIVE_DEVELOPMENT_STYLE.md`
