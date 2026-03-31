# Functional Structure Contract

## Objetivo

Definir cómo debe estructurarse una nueva feature para que no nazca acoplada o caótica.

## Regla base

Una feature nueva no es un componente suelto. Debe tener límites claros.

## Estructura funcional mínima

Toda feature nueva debe definir:

1. `Purpose`
   - qué resuelve
   - para quién
   - qué resultado visible produce

2. `Entry points`
   - desde dónde se invoca
   - qué eventos o pantallas la disparan

3. `Data contract`
   - qué lee
   - qué escribe
   - quién es la source of truth
   - qué puede ir a cache local

4. `State model`
   - idle
   - loading
   - success
   - empty
   - error
   - blocked si depende de configuración externa

5. `Permissions`
   - quién puede verla
   - quién puede usarla
   - quién puede mutarla

6. `Failure modes`
   - qué pasa si falta backend
   - qué pasa si falla auth
   - qué pasa si la integración externa no responde

## Distribución recomendada

- view o section container
- componentes presentacionales
- cliente o service de datos
- tipos o contracts
- test o checklist de validación

## Prohibido

- meter fetch, layout, permisos y side effects complejos en un mismo componente enorme
- usar `localStorage` como verdad de negocio
- aceptar identidad del cliente sin validación para acciones sensibles
- agregar feature sin ruta de rollback o al menos degradación controlada

## Señal de diseño sano

Otro agente debe poder leer la spec y entender:

- dónde vive
- qué toca
- qué depende de qué
- cómo se rompe
- cómo se valida
