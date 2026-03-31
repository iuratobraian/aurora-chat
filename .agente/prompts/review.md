# 🔍 AURORA - Prompt de Code Review

> Usar para: revisar código, auditorías, verificación

## Checklist de Review

### Seguridad
- [ ] `ctx.auth.getUserIdentity()` presente
- [ ] Validación de roles
- [ ] Ownership checks
- [ ] No datos sensibles expuestos
- [ ] No API keys en código

### Tipos
- [ ] TypeScript estrictamente tipado
- [ ] No `any` implícito
- [ ] Interfaces para objetos
- [ ] Tipos para argumentos

### React
- [ ] Componentes funcionales
- [ ] Hooks correctamente usados
- [ ] useQuery/useMutation de Convex
- [ ] Loading states
- [ ] Error states

### Convex
- [ ] Índices para queries
- [ ] No collect() innecesario
- [ ] Paginación si es necesario
- [ ] Validación de argumentos

### UX
- [ ] No alert/confirm
- [ ] showToast para feedback
- [ ] Loading indicators
- [ ] Empty states

## Patrones de Errores en Review

| Error | Severidad | Fix |
|-------|-----------|-----|
| `any` implícito | Alta | Tipar explícitamente |
| localStorage | Alta | Migrar a Convex |
| fetch legacy | Media | Usar Convex |
| alert/confirm | Baja | showToast |
| console.log prod | Baja | Usar logger |

## Questions to Ask

1. ¿Este código introduce vulnerabilities?
2. ¿Los tipos son correctos?
3. ¿Se manejan errores?
4. ¿Hay memory leaks?
5. ¿El código es mantenible?
6. ¿Sigue las convenciones del proyecto?
