# Error Prevention Canon

## Objetivo

Dejar una base explícita de errores que el sistema debe evitar para no repetir fallas previsibles.

## Regla principal

No basta con corregir errores.
Hay que catalogarlos para no volver a producirlos.

## Familias de errores

### 1. Errores de entendimiento

- arrancar sin entender el pedido
- confundir objetivo con implementación
- no detectar restricciones
- responder a algo distinto de lo pedido

### 2. Errores de proceso

- trabajar sin task
- trabajar sin focus
- no dejar log
- no dejar handoff
- cerrar sin validar

### 3. Errores de arquitectura

- mezclar dominios
- no declarar source of truth
- acoplar UI a contratos externos crudos
- hardcodear URLs o deployments
- usar `VITE_*` en servidor

### 4. Errores de calidad

- no definir fallback
- no contemplar estados vacíos
- no manejar errores
- dejar tipos `unknown[]` circular
- dejar handlers incompatibles

### 5. Errores de seguridad

- exponer secretos
- confiar en el cliente para acciones críticas
- no validar webhooks
- no usar idempotencia
- no separar browser/server config

### 6. Errores de conocimiento

- guardar ruido
- documentar teoría sin impacto
- duplicar documentación
- mezclar hecho con inferencia
- usar fuentes no confiables como si fueran canónicas

### 7. Errores de producto

- agregar features sin foco
- crecer navegación sin jerarquía
- medir vanity metrics
- monetizar rompiendo confianza
- copiar patrones tóxicos

## Reglas de prevención

1. toda tarea empieza con clasificación correcta
2. todo módulo importante tiene contrato
3. toda integración tiene dossier
4. todo cambio sensible tiene validación
5. todo aprendizaje útil entra curado al cerebro

## Señal de alerta

Si algo:

- aumenta complejidad sin aumentar valor
- no deja cierre
- no puede explicarse en una secuencia corta
- no tiene owner

probablemente va a fallar.

## Regla final

Un error catalogado que se repite es falla del sistema, no solo del agente.
