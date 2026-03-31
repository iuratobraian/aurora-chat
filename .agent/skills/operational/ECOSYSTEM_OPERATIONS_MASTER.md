# Ecosystem Operations Master

## Objetivo

Convertir integraciones complejas, mantenimiento continuo y crecimiento del ecosistema en trabajo repetible, seguro y escalable.

Este documento existe para que ningun agente improvise cuando toque:

- pasarelas de pago
- IA externa
- auth y permisos
- realtime, colas y webhooks
- analytics, observabilidad y experimentos
- integraciones con terceros
- migraciones de datos
- mantenimiento operativo
- crecimiento del producto y de la red

## Regla principal

Toda integracion o cambio estructural debe nacer con:

1. spec
2. owner
3. source of truth
4. riesgos
5. fallback
6. plan de rollback
7. validacion
8. handoff o cierre

Sin esas 8 piezas, la tarea no esta lista.

## Capas del ecosistema

### 1. Product Surface

Lo que ve y usa el usuario.

- home
- comunidad
- perfil
- admin
- pricing
- academia
- sala de IA

Preguntas obligatorias:

- que valor obtiene el usuario en menos de 30 segundos
- que pasa si falla el dato
- que estado vacio, cargando y degradado existe
- cual es la salida segura si esta superficie explota

### 2. Core Domain

La logica que sostiene negocio y consistencia.

- usuarios
- comunidades
- posts
- comentarios
- reputacion
- pagos
- suscripciones
- permisos
- señales

Preguntas obligatorias:

- cual es la entidad canonica
- quien escribe
- quien lee
- quien puede mutar
- que invariantes no se rompen

### 3. Integration Layer

Conecta servicios externos con contratos internos.

- providers de IA
- pagos
- auth social
- email
- notificaciones
- storage
- analytics

Reglas:

- nunca exponer secretos al cliente
- nunca mezclar contrato externo con tipos internos sin adapter
- siempre tener timeout
- siempre tener error mapping
- siempre tener retry policy explicita
- siempre tener fallback o salida honesta

### 4. Runtime Layer

- frontend runtime
- backend runtime
- serverless/functions
- webhooks
- cron jobs
- colas

Reglas:

- un endpoint critico debe tener observabilidad
- un webhook debe ser idempotente
- un job debe poder reintentarse
- una dependencia externa no puede derribar la app entera

### 5. Governance Layer

- board
- focus
- logs
- decisions
- release blockers
- learning log

Nada estructural entra a produccion sin pasar por esta capa.

## Tipos de integracion y receta exacta

### Integracion tipo A: third-party read

Ejemplos:

- mercado de noticias
- datos publicos
- feeds externos

Necesario:

1. adapter de lectura
2. normalizador de respuesta
3. cache o memoizacion simple
4. timeout corto
5. modo degradado

No hacer:

- atar UI a la respuesta cruda del tercero
- asumir que siempre existe el campo

### Integracion tipo B: third-party write

Ejemplos:

- pagos
- CRM
- email transaccional
- tickets

Necesario:

1. request contract interno
2. response contract interno
3. idempotency key
4. event log
5. reconciliacion
6. alertas
7. rollback o compensacion

### Integracion tipo C: bidirectional sync

Ejemplos:

- sincronizacion de comunidades
- mirror de perfiles
- estados de onboarding

Necesario:

1. source of truth declarada
2. direccion de sync
3. conflictos esperados
4. estrategia de merge
5. reintentos
6. job de limpieza

### Integracion tipo D: realtime

Ejemplos:

- chat
- live
- estado de sala
- notificaciones en vivo

Necesario:

1. presencia opcional, no obligatoria para core UX
2. reconexion
3. backpressure
4. snapshot inicial
5. fallback polling o stale state visible

### Integracion tipo E: AI delegation

Ejemplos:

- sala de IA
- soporte
- onboarding
- busqueda asistida

Necesario:

1. provider registry
2. routing policy
3. costos y limites
4. logs operativos
5. redaccion de prompts con contratos claros
6. salida segura si el provider falla
7. no delegar decisiones de seguridad o pagos sin verificacion

## Plan de mantenimiento permanente

### Diario

- revisar blockers
- revisar errores nuevos
- revisar endpoints caidos
- revisar integraciones degradadas
- revisar tareas zombie

### Semanal

- limpiar deuda de observabilidad
- revisar tiempos de respuesta
- revisar fallos de providers externos
- cerrar o cortar tareas abiertas demasiado tiempo
- consolidar aprendizajes en `LEARNING_LOG.md`

### Quincenal

- auditar permisos
- revisar secrets y envs
- revisar contratos internos vs externos
- revisar eventos y telemetria basura
- recortar complejidad accidental

### Mensual

- hardening de flows de dinero
- disaster drill
- prueba de rollback
- validacion de backups y export
- poda de features sin adopcion

## Motores de crecimiento del ecosistema

### 1. Utility Engine

El usuario vuelve porque resuelve algo.

- aprende
- descubre
- se compara
- toma decisiones
- gestiona comunidad

### 2. Trust Engine

- reputacion
- historial
- validacion social
- transparencia
- contexto

### 3. Creator Engine

- herramientas para publicar mejor
- distribucion
- reputacion visible
- monetizacion
- analytics de creador

### 4. Community Engine

- subcomunidades
- moderacion
- onboarding de miembros
- eventos
- rituales semanales

### 5. AI Utility Engine

- soporte
- explicacion
- resumen
- analisis
- asistencia a admins y creators

Ningun motor de crecimiento debe romper:

- seguridad
- claridad
- performance
- confianza

## Preguntas obligatorias antes de escalar cualquier modulo

1. Si crece 10x, que rompe primero.
2. Si el provider externo cae, cual es la salida.
3. Si el dato llega corrupto, quien lo detiene.
4. Si el usuario no entiende el flujo, donde abandona.
5. Si falla el deploy, como vuelvo.
6. Si un agente toma esta tarea despues, entiende todo sin hablar con nadie.

## Contrato de calidad para integraciones complejas

Cada entrega debe dejar:

- resumen de arquitectura
- mapa de archivos
- variables necesarias
- contrato de entrada y salida
- errores esperables
- fallback
- pruebas minimas
- pasos de operacion
- pasos de rollback
- tareas siguientes

## Donde registrar cada cosa

- tarea y ownership: `../workspace/coordination/TASK_BOARD.md`
- intencion actual: `../workspace/coordination/CURRENT_FOCUS.md`
- decisiones tecnicas: `../workspace/coordination/DECISIONS.md`
- riesgo y seguridad: `../workspace/coordination/SECURITY_REGISTER.md`
- handoff: `../workspace/coordination/HANDOFFS.md`
- aprendizaje: `../workspace/coordination/LEARNING_LOG.md`
- plan concreto: `../workspace/plans/ECOSYSTEM_SCALE_RUNBOOKS.md`

## Regla final

El ecosistema crece solo si:

- cada parte tiene owner
- cada owner tiene contrato
- cada contrato tiene fallback
- cada fallback tiene validacion

Si falta una de esas piezas, no hay escalabilidad real.
