# Aurora Core Multi Agent Orchestration

## Objetivo

Definir cómo dejar múltiples IAs trabajando juntas bajo Aurora Core para avanzar de forma continua sobre objetivos reales del proyecto.

## Verdad importante

No se debe buscar “trabajo infinito”.
Se debe buscar:

- trabajo continuo
- objetivos claros
- colas ordenadas
- checkpoints
- validación
- cierre

## Rol de Aurora Core

Aurora Core actúa como:

- coordinador central
- memoria operativa
- priorizador
- filtro de ruido
- enrutador de trabajo
- guardián de calidad

Aurora Core no hace todo.
Aurora Core decide quién hace qué, en qué orden y bajo qué criterio.

## Jerarquía operativa

### Nivel 1: Aurora Core

Responsable de:

- leer backlog
- priorizar
- asignar
- detectar bloqueos
- consolidar aprendizaje
- aprobar cierre

### Nivel 2: Supervisores

Ejemplos:

- `gpt-5 nano`
- `Gemini Flash`

Responsables de:

- ordenar tareas
- monitorear estado
- pedir handoffs
- detectar duplicación

### Nivel 3: Especialistas

Ejemplos:

- frontend
- backend
- infra
- marketing
- growth
- game design
- web factory

Responsables de:

- ejecutar tareas concretas
- devolver artefactos claros
- validar su parte

### Nivel 4: Revisores

Responsables de:

- revisar outputs críticos
- encontrar riesgos
- evitar cierres falsos

## Regla principal

Ningún agente trabaja “por intuición libre”.
Todo agente trabaja desde:

- task
- focus
- template
- prompt
- aceptación

## Ciclo operativo continuo

### Paso 1: Intake

Aurora Core toma:

- backlog
- blockers
- objetivos activos
- estado del repo

### Paso 2: Priorización

Ordena por:

1. estabilidad
2. seguridad
3. bloqueos
4. impacto
5. dependencia

### Paso 3: Asignación

Cada tarea se asigna a:

- un owner
- un scope
- una plantilla
- un prompt
- una señal de salida

### Paso 4: Ejecución

Los agentes:

- reclaman
- ejecutan
- registran
- validan

### Paso 5: Revisión

Aurora Core o un revisor:

- verifica cierre
- detecta deuda
- decide `done`, `blocked` o `cut`

### Paso 6: Aprendizaje

El hallazgo se destila y entra al cerebro solo si tiene señal alta.

## Cómo dejarlas trabajando “sin parar”

La forma correcta no es loop infinito ciego.
Es:

- cola de tareas
- objetivos activos
- handoffs automáticos
- checkpoints frecuentes
- reglas de stop

## Reglas de stop obligatorias

Un agente debe detenerse y devolver estado si:

- falta contexto crítico
- la tarea invadiría otro scope
- el riesgo sube demasiado
- no puede validar
- detecta contradicción con el Project OS

## Modo de continuidad

Aurora Core debe operar con tres listas:

### 1. Now

- bloqueantes
- crítico
- tareas activas

### 2. Next

- siguiente lote listo
- dependencias resueltas

### 3. Later

- investigación
- expansión
- optimización

## Modo de ejecución por lote

Cada lote debe tener:

- objetivo del lote
- tareas incluidas
- dependencias
- criterio de cierre
- aprendizaje esperado

## Handoffs obligatorios

Toda continuidad entre agentes debe dejar:

- qué se hizo
- qué falta
- riesgos
- archivos
- validación pendiente

## Cómo evitar que se destruyan entre sí

1. un owner por scope
2. handoff explícito
3. current focus actualizado
4. no editar archivos reclamados por otro
5. revisión antes de merge lógico

## Qué automatizar primero

### 1. Selección de tarea abierta

- leer board
- elegir por prioridad
- sugerir siguiente owner

### 2. Selección de plantilla

- según task type

### 3. Selección de prompt

- según rol y nivel de riesgo

### 4. Registro de aprendizaje

- al cierre de cada tarea relevante

## Señales de que el sistema está funcionando

- menos tareas zombie
- menos duplicación
- mejores handoffs
- más cierres reales
- menos ruido en memoria

## Regla final

Aurora Core debe coordinar una fuerza de trabajo continua, no una multitud caótica.
