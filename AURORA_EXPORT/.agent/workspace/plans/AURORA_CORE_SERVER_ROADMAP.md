# Aurora Core Server Roadmap

## Objetivo

Definir cómo Aurora Core podría evolucionar desde cerebro local de repo a servicio interno desplegado en servidor.

## Fase 1: Cerebro local fuerte

- skills y templates curados
- brain/db estructurado
- aprendizaje destilado
- prompts y playbooks

## Fase 2: Retrieval interno

- índice de conocimiento consultable
- búsqueda por tags, área y riesgo
- selección automática de fuentes internas

## Fase 3: Servicio interno

- API interna de Aurora Core
- endpoints para:
  - retrieve
  - summarize
  - suggest_next_step
  - classify_task
  - validate_output

## Fase 4: Orquestación

- runners por tipo de tarea
- cola de trabajos
- panel de estado
- rate limits
- logs

## Fase 5: Evaluación

- score de utilidad
- score de precisión
- score de reutilización
- catálogo de errores evitados

## Fase 6: Operación servida

- despliegue en servidor privado
- control de acceso
- backups
- métricas
- rollback

## Condición para “estar preparada”

Aurora Core no “se siente preparada”.
Se considera preparada cuando cumple:

1. conocimiento curado y consistente
2. retrieval útil
3. validación mínima confiable
4. observabilidad
5. control de acceso
6. rollback

## Qué implementar primero

1. retrieval sobre `brain/db`
2. selector automático de templates/prompts
3. API interna mínima
4. panel de health/status
5. evaluación periódica

## Regla final

Primero sistema confiable.
Después servidor.
