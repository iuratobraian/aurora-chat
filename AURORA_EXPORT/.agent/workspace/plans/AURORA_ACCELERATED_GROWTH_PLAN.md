# Aurora Accelerated Growth Plan

## Objetivo

Volver el crecimiento de Aurora ejecutable ahora mismo dentro de este repo y alineado a una app de comunidades.

Aurora no debe limitarse a guardar texto. Debe aprender:

- que tareas ayudan a la comunidad y al producto
- que patrones aceleran entregas reales
- que errores se repiten
- que conocimiento vale la pena reutilizar

## Enfoque

Este plan prioriza tres capas:

1. evaluacion
2. retrieval util
3. aprendizaje curado

## Sprint 0: activar hoy

### 1. Salud del aprendizaje

- ejecutar `npm run aurora:speed-check`
- ejecutar `npm run aurora:scorecard`
- revisar si el auto-runner y el agent-learner estan escribiendo datos recientes
- revisar porcentaje de conocimiento estructurado

### 2. Calidad de ingestion

- toda nueva entrada de `teamwork_knowledge.jsonl` debe incluir:
  - `sourceType`
  - `taskId`
  - `confidence`
  - `reuseScore`
  - `validated`
  - `domain`
- la prioridad inicial de dominio para este repo es:
  - `community_product`
  - `aurora_ops`
  - `growth`
  - `security`
  - `payments`

### 3. Cierre operativo por tarea

- cada tarea importante cerrada debe dejar:
  - AGENT_LOG verificable
  - LEARNING_LOG resumido
  - hecho estructurado reutilizable
- no alcanza con describir lo hecho; hay que capturar patron reusable y riesgo

## Sprint 1: proximos 3 dias

### Resultado esperado

Aurora mide si esta aprendiendo bien y no solo si sigue viva.

### Entregables

- scorecard diario de Aurora
- speed-check con alertas de ingestion y estructura
- disciplina de metadata en aprendizaje nuevo
- tabla de dominios prioritarios

### KPI

- mas de 80% de entradas nuevas con metadata estructurada
- auto-runner actualizado en menos de 2 minutos
- conocimiento actualizado en menos de 5 minutos
- al menos 3 aprendizajes diarios reutilizables

## Sprint 2: proximos 7 dias

### Resultado esperado

Aurora encuentra mejor el contexto justo para una tarea de producto o comunidad.

### Entregables

- retrieval por `taskId`, `domain`, `tags`, `sourceType`, `validated`
- selector de contexto minimo antes de responder
- capa de deteccion de ruido para evitar duplicados y entradas vacias

### KPI

- menos de 5 resultados irrelevantes por consulta comun
- mas de 60% de consultas internas resueltas sin abrir web
- menos duplicacion de entradas en conocimiento

## Sprint 3: proximos 14 dias

### Resultado esperado

Aurora empieza a adaptarse al trabajo de una app de comunidades.

### Entregables

- clasificacion de aprendizaje por superficie:
  - feed
  - comentarios
  - onboarding
  - creators
  - moderacion
  - conversion
- scorecard especifico de comunidad
- registro de señales utiles para producto y growth

### KPI

- cada tarea de comunidad deja al menos un patron reusable
- cada tarea de growth deja al menos una hipotesis medible
- las superficies de comunidad tienen contexto historico recuperable

## Sprint 4: proximos 30 dias

### Resultado esperado

Aurora opera como control plane util para producto, comunidad y agentes.

### Entregables

- batches diarios con prioridad automatica
- score de utilidad por aprendizaje
- poda de conocimiento de baja señal
- panel de estado con salud, aprendizaje y riesgo

### KPI

- mas de 70% de tareas con contexto sugerido util
- menos errores repetidos en tareas similares
- base de conocimiento con poda semanal
- handoffs mas cortos y mas reutilizables

## Rutina diaria

1. `npm run aurora:status`
2. `npm run aurora:tasks`
3. `npm run aurora:speed-check`
4. `npm run aurora:scorecard`
5. ejecutar tarea
6. cerrar con AGENT_LOG + LEARNING_LOG + aprendizaje estructurado

## Regla para este repo

Como Aurora vive dentro de una app de comunidades, el aprendizaje de mayor prioridad es el que mejora:

- claridad del producto
- calidad del feed
- confianza entre usuarios
- retencion sana
- conversion sin humo

Todo lo que no impacte operacion, comunidad, seguridad o crecimiento real debe tener menor prioridad.
