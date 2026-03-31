# Structure Review Checklist

## Use

Aplicar antes de cerrar cualquier nueva sección, pantalla o feature.

## Visual

- hay una acción principal clara
- la jerarquía visual es evidente
- no hay ruido competitivo innecesario
- los estados loading, empty y error existen
- mobile está definido

## Functional

- source of truth definida
- auth y permisos definidos
- no depende de `localStorage` para negocio
- falla con degradación controlada
- otro agente puede entender el flujo sin adivinar

## Operative

- task reclamada
- focus declarado
- log actualizado
- decisiones actualizadas si tocó archivos críticos
