# ✨ AURORA - Prompt de Nuevas Features

> Usar para: nuevas funcionalidades, extensión de código existente

## Metodología SPARC

### 1. Specification (Especificación)
- Entender qué hace la feature
- Definir inputs y outputs
- Identificar casos edge

### 2. Pseudocode (Pseudocódigo)
- Escribir lógica antes de código
- Definir estructura de datos
- Planificar funciones necesarias

### 3. Architecture (Arquitectura)
- Dónde va el código (frontend/backend)
- Base de datos necesaria
- API endpoints requeridos

### 4. Refinement (Refinamiento)
- Revisar con expertos
- Optimizar performance
- Considerar seguridad

### 5. Completion (Implementación)
- Código final
- Tests si aplica
- Documentación

## Estructura para Nuevas Features

### Frontend (React)
```
1. Crear componente en src/components/[feature]/
2. Crear tipo en src/types/[feature].ts
3. Integrar con Convex useQuery/useMutation
4. Agregar a ruta si es nueva vista
```

### Backend (Convex)
```
1. Agregar schema si es necesario
2. Crear queries en api/
3. Crear mutations en api/
4. Validar auth y permisos
```

## Checklist de Feature

- [ ] Specification clara
- [ ] Pseudocódigo escrito
- [ ] Backend implementado (si requiere)
- [ ] Frontend implementado
- [ ] Tipos definidos
- [ ] Auth considerado
- [ ] Casos edge manejados
- [ ] lint pasa
- [ ] build pasa
- [ ] No hay hardcoded values

## Patterns del Proyecto

### Componentes
- Usar TailwindCSS
- Props tipadas
- Loading states
- Error states
- Empty states

### Convex
- Siempre con validación de auth
- Queries lean (no collect() innecesario)
- Paginación si es lista grande
