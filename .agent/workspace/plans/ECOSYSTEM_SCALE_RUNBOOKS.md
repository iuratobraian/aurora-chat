# Ecosystem Scale Runbooks

## Objetivo

Dejar instrucciones ejecutables para integraciones complejas, mantenimiento y crecimiento sin depender de memoria oral.

## Frentes complejos y como atacarlos

### 1. Pagos y suscripciones

Archivos esperados:

- backend runtime
- adapters de provider
- webhooks
- reconciliacion
- admin financiero

Checklist:

1. separar secrets browser/server
2. definir contrato comun de pago
3. agregar idempotencia
4. persistir payment events
5. reconciliar estados
6. agregar alertas y dashboard minimo
7. documentar rollback manual

Salida minima:

- pagar no depende del frontend
- webhook duplicado no rompe estado
- una suscripcion queda trazable extremo a extremo

### 2. Sala de IA y agentes externos

Archivos esperados:

- provider registry
- relay server-side
- presets
- auditoria
- admin UI

Checklist:

1. provider con adapter y timeout
2. routing por tarea
3. rate limit
4. auditoria de prompts y respuestas
5. fallback entre providers
6. policy de datos sensibles
7. panel de estado

Salida minima:

- IA usable incluso si un provider cae
- claves no expuestas
- logs suficientes para debugging

### 3. Comunidad y feed

Checklist:

1. contratos de post y comentario consistentes
2. adapters de datos sin `unknown[]`
3. estados live y ads tipados
4. ranking contract separado de UI
5. fallback visual si falla un bloque

### 4. Auth e identidad

Checklist:

1. sesion validada server-side en acciones criticas
2. permisos por rol y capacidad
3. refresh/expiry claro
4. logout y revocacion reales
5. audit trail minimo

### 5. Observabilidad

Checklist:

1. request id
2. logs estructurados
3. errores cliente y servidor
4. panel de fallos por integracion
5. release gate

### 6. Mantenimiento y migraciones

Checklist:

1. snapshot del estado previo
2. plan de migracion
3. ventana de riesgo
4. rollback
5. validacion post-migracion
6. nota en decisions y learning log

## Orden de ataque cuando entre una nueva integracion

1. definir tipo de integracion
2. crear dossier en template
3. reclamar tarea
4. definir source of truth
5. implementar adapter
6. agregar fallback
7. agregar validacion
8. registrar decisiones
9. cerrar con runbook operativo

## Señales de que no se puede avanzar

- el provider no tiene contrato claro
- el flujo depende de secretos del cliente
- no existe owner real
- no existe rollback
- no existe criterio de aceptacion observable

## Deuda que debe evitarse siempre

- logica de negocio en componentes
- tipos externos crudos circulando en UI
- hardcodes de URLs o deployments
- `VITE_*` usados en servidor
- tareas abiertas sin cierre formal

## Trabajo para agentes

### AGENT-INTEGRATION

- usa `../templates/INTEGRATION_DOSSIER_TEMPLATE.md`
- deja contrato, riesgos y fallback

### AGENT-MAINTENANCE

- usa `../templates/MAINTENANCE_RUNBOOK_TEMPLATE.md`
- deja diagnostico, procedimiento y rollback

### AGENT-GROWTH

- usa `../templates/GROWTH_LOOP_TEMPLATE.md`
- deja hipotesis, surface, metricas y riesgos

## Resultado esperado

Ningun frente complejo debe volver a depender de intuicion dispersa.
