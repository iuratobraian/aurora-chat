# Review Playbook

## Prioridades de review

1. estabilidad
2. seguridad
3. source of truth
4. auth y permisos
5. deuda nueva
6. consistencia con contracts
7. trazabilidad

## Qué revisar siempre

- ¿se rompió algo crítico?
- ¿hay hardcodes nuevos?
- ¿la tarea realmente cierra?
- ¿la source of truth quedó más clara o más borrosa?
- ¿el cambio deja código zombie?
- ¿el agente respetó board, focus y log?

## Señales de mala entrega

- mucha explicación y poca evidencia
- `done` con “pendientes menores”
- integración sensible sin guardrails
- nueva estructura sin spec
- muchos cambios amplios sin decisión documentada
