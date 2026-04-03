# 🐛 AURORA - Prompt de Bug Fix

> Usar para: debugging, fix errores, troubleshooting

## Metodología

### 1. Reproducir
- Leer el error completo
- Identificar stack trace
- Encontrar archivo y línea exacta

### 2. Diagnosticar
- Buscar en el código fuentes del error
- Verificar tipos y argumentos
- Revisar lógica de flujo

### 3. Corregir
- Fix mínimo y específico
- No introducir nuevos bugs
- Probar mentalmente el fix

### 4. Verificar
- `npm run lint` pasa
- `npm run build` pasa
- Si hay tests, ejecutarlos

## Patterns de Errores Comunes

### TypeScript
```typescript
// Error: Cannot read property of undefined
// Solución: Optional chaining o null check
const value = obj?.prop?.nested;

// Error: Type 'X' not assignable to 'Y'
// Solución: Usar type assertion o validar

// Error: Parameter implicitly has 'any' type
// Solución: Tipar explícitamente
```

### React
```typescript
// Error: Too many re-renders
// Solución:useCallback, useMemo, o corregir dependency array

// Error: Hook called outside component
// Solución: Mover hook dentro del componente

// Error: Cannot update during render
// Solución: Usar useEffect para updates
```

### Convex
```typescript
// Error: Mutation called outside provider
// Solución: Asegurar que el componente está dentro de ConvexProvider

// Error: Query returns undefined
// Solución: Verificar que el query existe y tiene datos

// Error: Permission denied
// Solución: Agregar ctx.auth.getUserIdentity()
```

## Checklist de Bug Fix

- [ ] Error identificado y reproducido
- [ ] Causa raíz encontrada
- [ ] Fix aplicado
- [ ] lint pasa
- [ ] build pasa
- [ ] No hay efectos secundarios

## Errores del Proyecto (KNOWN BUGS)

| Error | Causa | Fix |
|-------|-------|-----|
| `adminId` no existe en tipo | argumento obsoleto | Usar ctx.auth |
| showToast no definido | Falta import | Importar de ToastProvider |
| localStorage como source | Legacy | Migrar a Convex |
