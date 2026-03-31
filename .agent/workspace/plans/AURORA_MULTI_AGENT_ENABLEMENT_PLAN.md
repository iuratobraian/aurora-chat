# Aurora Multi-Agent Enablement Plan

## Objetivo

Hacer que Aurora crezca como agente fullstack del repo usando la misma informacion operativa que ya emplean los otros agentes de codigo.

Aurora no debe depender solo de memoria general.
Debe absorber:

- contexto tecnico reusable
- patrones de implementacion reales
- errores repetidos
- rutas de validacion
- handoffs concretos
- señales de producto y arquitectura

## Principio rector

Cada tarea ejecutada por cualquier agente debe dejar una huella util para Aurora.

No solo "que se hizo".
Tambien:

- donde tocar
- que archivos mirar primero
- que riesgo habia
- como validar
- que error evitar la proxima vez

## Fuentes que Aurora debe absorber

### 1. Conocimiento tecnico del repo

- `app-stack.json`
- `product-surfaces.json`
- `TASK_BOARD.md`
- `CURRENT_FOCUS.md`
- `AGENT_LOG.md`
- `HANDOFFS.md`
- `convex/schema.ts`
- `server.ts`
- `views/`
- `components/`
- `services/`
- `scripts/`

### 2. Conocimiento producido por agentes

- patrones reutilizables de implementacion
- contratos entre frontend, services, server y Convex
- listas de validacion por tipo de cambio
- bugs reales y su causa raiz
- handoffs claros con archivos tocados y riesgo restante

### 3. Telemetria operativa

- `speed-check`
- `scorecard`
- `drift report`
- `activity_log`
- `hook_log`

## Backlog recomendado

### Fase 1. Ingestion basica obligatoria

1. Crear un contrato comun para que cada agente deje un `task-context-pack` al cerrar una tarea.
Resultado esperado:
Aurora puede recuperar scope, archivos, validacion y riesgo por tarea sin releer todo el repo.

2. Destilar `AGENT_LOG.md` y `HANDOFFS.md` a registros JSONL reutilizables.
Resultado esperado:
Aurora consume conocimiento estructurado, no solo markdown largo.

3. Guardar por tarea un resumen `frontend impact / backend impact / data impact`.
Resultado esperado:
Aurora puede responder como fullstack en vez de solo sugerir archivos.

### Fase 2. Memoria confiable

1. Separar memoria en cuatro colecciones activas:
- implementation_patterns
- validation_playbooks
- error_preventions
- architecture_facts

2. Agregar validacion de confianza antes de aceptar nuevo conocimiento.
Resultado esperado:
Aurora distingue hechos confirmados de ideas o ruido.

3. Penalizar duplicados y entradas vagas.
Resultado esperado:
La memoria de Aurora sube en señal y baja en drift.

### Fase 3. Enablement por especialidad

1. Agente backend deja playbooks de:
- Convex mutations/queries
- schema changes
- webhooks
- auth
- payments

2. Agente frontend deja playbooks de:
- entrypoints de vistas
- componentes criticos
- empty/loading/error states
- smoke checks UI

3. Agente QA deja playbooks de:
- comandos minimos por scope
- flujos a probar
- regresiones tipicas

4. Agente reviewer deja playbooks de:
- code smells repetidos
- riesgos de merge
- archivos sensibles

Resultado esperado:
Aurora puede responder segun especialidad y no solo con heuristicas generales.

### Fase 4. Arranque inteligente

1. `inicio` debe sembrar:
- stack tecnico
- surfaces activas
- plan vigente
- ultimos errores validados

2. `aurora:shell` debe arrancar con:
- stack visible
- repo map
- comandos de kickoff fullstack
- tarea sugerida del board o del plan

Resultado esperado:
Aurora entra a la sesion lista para programar.

### Fase 5. Feedback loop multiagente

1. Cada agente debe dejar una mejora proactiva para Aurora junto con su cierre.
2. Las mejoras se clasifican por:
- memoria
- tooling
- validacion
- arquitectura
- runtime

3. Aurora prioriza mejoras por impacto y facilidad.
Resultado esperado:
Aurora crece en cada ciclo, no solo cuando alguien la toca manualmente.

## Contrato minimo para otros agentes

Cada agente que cierre una tarea deberia dejar estos campos para Aurora:

- `taskId`
- `scope`
- `goal`
- `filesChanged`
- `firstFilesToRead`
- `frontendImpact`
- `backendImpact`
- `dataImpact`
- `riskLevel`
- `validationCommands`
- `smokeChecks`
- `antiRegressionNotes`
- `knowledgeToReuse`

## Artefactos nuevos sugeridos

1. `.agent/brain/db/implementation_patterns.jsonl`
Uso:
patrones fullstack reutilizables por feature.

2. `.agent/brain/db/validation_playbooks.jsonl`
Uso:
validacion recomendada por tipo de cambio.

3. `.agent/brain/db/error_preventions.jsonl`
Uso:
errores reales con causa y prevencion.

4. `.agent/brain/db/task_context_packs.jsonl`
Uso:
brief compacto por tarea cerrada.

## Routing sugerido por agente

### Backend agent

- llena `backendImpact`
- documenta contratos de server y Convex
- registra side effects y payloads

### Frontend agent

- llena `frontendImpact`
- registra entrypoints, componentes y estados de UI
- deja smoke checks manuales

### QA agent

- llena `validationCommands`
- registra escenarios minimos felices y de error
- deja regresiones tipicas

### Reviewer agent

- llena `antiRegressionNotes`
- registra code smells y coupling oculto
- sube el nivel de confianza del conocimiento

### Aurora/Codex lead

- consolida registros
- valida consistencia
- activa seeds y comandos para exponer el conocimiento

## Metricas de exito

- Aurora responde una tarea tecnica con scope, archivos, plan y validacion correctos.
- Aurora reduce tiempo de arranque para una tarea nueva.
- Baja la cantidad de respuestas vagas del shell.
- Sube el reuseScore de conocimiento tecnico.
- Baja el drift entre board, focus, handoff y memoria.

## Regla final

Aurora mejora de verdad cuando los otros agentes dejan contexto operativo de alta señal.

El crecimiento no depende de mas texto.
Depende de mejores contratos de memoria entre agentes.
