# Debugging Playbook

## Objetivo

Resolver bugs con método y no por intuición caótica.

## Secuencia

1. Reproducir.
2. Delimitar.
3. Aislar.
4. Confirmar hipótesis.
5. Corregir.
6. Verificar no-regresión.

## Preguntas de oro

- ¿el bug es de datos, estado, permisos, render o integración?
- ¿cuál es el primer punto donde el sistema se desvía?
- ¿qué cambió recientemente cerca de esa zona?
- ¿qué fuente de verdad se está usando?
- ¿hay fallback tapando un error real?

## Anti-patrones de debugging

- tocar muchas cosas a la vez
- asumir antes de reproducir
- “arreglar” solo el síntoma visual
- no dejar evidencia de qué causaba el fallo

## Regla

Un bug no está bien resuelto si no se entiende por qué ocurría.
