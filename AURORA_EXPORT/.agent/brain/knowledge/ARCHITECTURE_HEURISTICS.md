# Architecture Heuristics

## Cuándo dividir un módulo

Dividir cuando:

- crece demasiado
- mezcla responsabilidades
- bloquea trabajo paralelo
- contiene demasiados estados o ramas
- empieza a esconder decisiones de negocio

## Cuándo no dividir todavía

No dividir solo por estética.

No dividir si:

- el módulo aún es simple
- la separación agrega más ruido que claridad
- no hay una frontera de responsabilidad real

## Señales de deuda

- un archivo raíz decide demasiado
- hay hardcodes de entorno repetidos
- la misma lógica de acceso a datos aparece en varios lugares
- el frontend confirma acciones que debería confirmar el backend
- se usa `localStorage` para ocultar carencias de arquitectura

## Regla de source of truth

Cada flujo debe responder claramente:

- quién sabe la verdad
- quién solo cachea
- quién solo presenta

Si eso no está claro, la arquitectura no está lista.
