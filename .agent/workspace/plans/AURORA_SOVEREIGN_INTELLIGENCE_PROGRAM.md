# Aurora Sovereign Intelligence Program

## Objetivo

Profesionalizar Aurora como super IA híbrida soberana y convertirla en control plane, memory system, retrieval engine, reasoning layer, execution support y eval/observability del sistema.

## Principios

- Aurora reduce fricción, evita errores y aumenta reuse.
- Aurora privilegia señal sobre volumen.
- Aurora siempre contrasta coordinación con código real.
- Aurora entrega contexto mínimo útil, no dumps largos.
- Aurora opera local-first con conectores y modelos externos solo cuando agregan valor real.

## Capas

### 1. Control plane

- health
- backlog
- focus
- blockers
- handoffs
- scorecards
- drift

### 2. Memory system

- memoria episódica
- memoria semántica
- aprendizaje reusable
- dedupe
- freshness
- reuse score

### 3. Retrieval engine

- context pack por tarea
- contexto por dominio
- contexto por superficie
- source of truth ranking

### 4. Reasoning layer

- classify_task
- detect_risk
- suggest_next_step
- suggest_validation
- retrieve_context_minimum
- summarize_handoff
- next_best_system_step

### 5. Execution support

- pre-task plan
- validation checklist
- task closure
- learning distillation

### 6. Eval + observability

- utilidad
- reuse
- drift detectado
- health
- cobertura de surfaces
- scorecard diario

## Artefactos soberanos

- `.agent/aurora/aurora_surface_registry.json`
- `.agent/aurora/contracts/aurora_health_snapshot.json`
- `.agent/aurora/contracts/aurora_task_context_pack.json`
- `.agent/aurora/contracts/aurora_risk_signal.json`
- `.agent/aurora/contracts/aurora_validation_checklist.json`
- `.agent/aurora/contracts/aurora_learning_record.json`
- `.agent/aurora/contracts/aurora_drift_report.json`
- `.agent/aurora/contracts/aurora_scorecard_daily.json`
- `.agent/aurora/contracts/aurora_next_best_step.json`
- `.agent/aurora/contracts/aurora_handoff_brief.json`

## Backlog oficial

- OPS-051: épica principal
- OPS-052: control plane
- OPS-053: memory architecture
- OPS-054: retrieval mínimo por tarea
- OPS-055: reasoning outputs estructurados
- OPS-056: drift detection
- OPS-057: MCP and connectors maturity
- OPS-058: product intelligence
- OPS-059: eval and scorecards
- OPS-060: always-on automation
- OPS-061: operator UI/API

## Orden

1. OPS-052
2. OPS-053
3. OPS-054
4. OPS-055
5. OPS-056
6. OPS-058
7. OPS-059
8. OPS-057
9. OPS-060
10. OPS-061

## Señal de éxito

Aurora puede decir qué pasa en el sistema, qué tarea conviene hacer, qué riesgo existe, qué validar, qué aprendizaje guardar y qué drift corregir sin depender de contexto difuso.
