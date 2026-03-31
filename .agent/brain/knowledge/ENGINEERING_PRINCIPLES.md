# Engineering Principles

## Objetivo

Dar al cerebro local criterio técnico de alto valor, no solo memoria histórica.

## Principios operativos

1. La estabilidad manda.
2. La claridad gana sobre la complejidad elegante.
3. La fuente de verdad debe ser explícita.
4. La seguridad no se delega al cliente.
5. La arquitectura no se improvisa bajo presión.
6. Una feature sin salida clara no debe abrirse.
7. Un refactor útil reduce acoplamiento visible.
8. Un cambio bueno deja mejor trazabilidad que antes.

## Principios de implementación

- hacer el cambio mínimo que resuelve el problema correcto
- no mezclar demasiadas intenciones en un mismo PR o task
- si un componente mezcla datos, layout, side effects y permisos, está pidiendo separación
- si un flujo depende de demasiados supuestos invisibles, debe documentarse o simplificarse

## Principios de producto

- el usuario compra claridad, no complejidad
- menos superficies, más profundidad
- toda pantalla principal debe justificar su existencia
- toda feature visible debe ayudar a activar, retener o monetizar

## Principios de coordinación

- una sola verdad operativa
- un owner por scope activo
- handoff mejor que pisar trabajo ajeno
- blocked formal mejor que fake done
