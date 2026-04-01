# 🧠 AURORA EN EL CHAT - GUÍA DE USO

## ¿CÓMO USAR AURORA EN ESTE CHAT?

### **Opción 1: Comandos @aurora (Recomendado)**

Escribí en el chat:

```
@aurora review src/App.tsx
@aurora analyze ./src/components
@aurora optimize src/lib/utils.ts
@aurora memory check
@aurora status
```

### **Opción 2: API HTTP**

1. Iniciar API server:
```bash
npm run aurora:api
```

2. Usar desde cualquier cliente HTTP:
```bash
curl -X POST http://localhost:4310/chat \
  -H "Authorization: Bearer aurora_key" \
  -H "Content-Type: application/json" \
  -d '{"message": "Review this file", "file": "src/App.tsx"}'
```

### **Opción 3: Terminal Interactivo**

```bash
npm run aurora:shell
```

Luego escribir comandos directamente:
```
> review src/App.tsx
> analyze ./src
> exit
```

---

## 🤖 PROVIDERS CONFIGURADOS

| Provider | API Key | Estado |
|----------|---------|--------|
| **Gemini** | AIzaSyA2qQ5ZRUwjcNJQ3lrh0rm3OY4BAayUwGU | ✅ ACTIVO |
| **Groq** | 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 | ✅ ACTIVO |
| **DeepSeek** | sk-7b01205c6cde4a248541d4f83582b558 | ✅ ACTIVO |
| **NVIDIA/Kimi** | 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 | ✅ ACTIVO |
| **OpenRouter** | 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 | ✅ ACTIVO |

---

## 📋 COMANDOS DISPONIBLES

### Code Review
```
@aurora review <archivo>
@aurora review:security <archivo>
@aurora review:performance <archivo>
```

### Analysis
```
@aurora analyze <path>
@aurora analyze:architecture
@aurora analyze:dependencies
```

### Optimization
```
@aurora optimize <archivo>
@aurora optimize:bundle
@aurora optimize:memory
```

### Memory
```
@aurora memory check
@aurora memory report
@aurora memory clear
```

### System
```
@aurora status
@aurora tasks
@aurora providers
@aurora help
```

---

## 🔧 CONFIGURACIÓN ACTUAL

```bash
# Providers activos: 5
# Strategy: quality_first
# Auto-fallback: enabled
# Cache: enabled
```

---

## 💡 EJEMPLOS DE USO EN CHAT

### Ejemplo 1: Code Review
```
Usuario: @aurora review src/App.tsx

Aurora: 🔍 Code Review: src/App.tsx

✅ Puntos Fuertes:
- Componente bien estructurado
- Hooks usados correctamente

⚠️ Mejoras Sugeridas:
- Línea 45: Considerar useCallback
- Línea 78: Agregar error handling

📊 Score: 8.5/10
```

### Ejemplo 2: Analysis
```
Usuario: @aurora analyze ./src/components

Aurora: 📊 Architecture Analysis

Componentes encontrados: 15
Patrones detectados:
- Container/Presentational: 8 componentes
- Custom Hooks: 5 hooks
- Context Providers: 2

Recomendaciones:
- Extraer lógica repetida en hooks
- Considerar memoización en listas largas
```

### Ejemplo 3: Optimization
```
Usuario: @aurora optimize src/lib/utils.ts

Aurora: 🚀 Optimization Suggestions

1. Función `debounce`:
   - Usar lodash/debounce (más performante)
   - Impacto: -30% CPU usage

2. Función `formatDate`:
   - Cachear resultados (same input → same output)
   - Impacto: -50% llamadas a date-fns

Estimated Improvement: 40% faster
```

---

## 🚀 PARA EMPEZAR AHORA

Escribí en el chat:

```
@aurora help
```

O directamente:

```
@aurora status
```

---

**Listo para trabajar juntos! 🎯**
