# Aurora Core Always On Plan

## Objetivo

Definir cómo operar un sistema multiagente continuo sin perder control.

## Componentes

### 1. Control plane

- Aurora Core
- backlog
- assignments
- current focus
- release blockers

### 2. Worker plane

- agentes especialistas
- prompts por rol
- templates por tarea

### 3. Validation plane

- lint
- tests
- security checks
- ops validation

### 4. Learning plane

- learning log
- knowledge db
- heuristics
- anti-patterns

## Secuencia

1. leer objetivos activos
2. elegir lote
3. asignar agentes
4. ejecutar
5. revisar
6. cerrar
7. destilar aprendizaje
8. tomar siguiente lote

## Condición para seguir

El sistema sigue mientras haya:

- tareas priorizadas
- criterios de aceptación
- capacidad de validación

## Condición para cortar

Se corta si:

- no hay tarea clara
- no hay validación posible
- el riesgo supera el valor
- hay conflicto estructural

## Resultado esperado

Trabajo continuo, no descontrolado.
