# Structure Contract

## Objetivo

Definir cómo se construyen nuevas estructuras visuales y funcionales para que el equipo pueda replicarlas sin improvisar.

## Regla principal

No se crea una pantalla, sección, módulo o flujo nuevo sin pasar por este contrato.

## Tipos de estructura cubiertos

- sección visual nueva
- pantalla nueva
- feature funcional nueva
- integración nueva
- panel interno o admin

## Principio

Primero se define la estructura. Después se implementa.

## Flujo obligatorio

1. Crear spec con plantilla.
2. Declarar objetivo, usuario y resultado esperado.
3. Validar contra `NON_NEGOTIABLES.md` y `ATTACK_PRIORITY.md`.
4. Reclamar tarea en board.
5. Implementar respetando contratos visuales y funcionales.
6. Validar estados, responsive, errores y ownership.

## Prohibido

- inventar layouts sin spec
- mezclar demasiadas responsabilidades en una sola vista
- crear una pantalla sin CTA principal
- crear una feature sin estados de error, vacío y loading
- duplicar patrones existentes solo por velocidad
