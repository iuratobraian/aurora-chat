# 🔥 PROTOCOLO KIMI - BIG-PICKLE

> Guía de invocación optimizada para Kimi 2.5

---

## 🚀 Invocación Estándar

Cuando necesites ayuda de Kimi, usa este formato:

```bash
node scripts/aurora-kimi-agent.mjs "KIMI_MODE: [skills]
[ARCHIVOS DE CONTEXTO]:
- @ruta/archivo1.ts
- @ruta/archivo2.ts

[TAREA]: [describe qué necesitas]

[REQUISITOS ESPECÍFICOS]:
- [detalle 1]
- [detalle 2]

[CONSTRAINTS]:
- [restricciones]"
```

---

## 📚 Skills Recomendados por Kimi

### Skills obligatorios para contexto:
| Skill | Función |
|-------|---------|
| `vercel-react-best-practices` | Patrones React |
| `next-best-practices` | Next.js patterns |
| `systematic-debugging` | Debugging estructurado |
| `context7-mcp` | Docs en tiempo real |

### Skills opcionales según tarea:
| Tarea | Skill |
|-------|-------|
| UI/Glassmorphism | `web-design-guidelines` |
| Testing | `playwright-best-practices`, `test-driven-development` |
| Admin/Security | `vercel-composition-patterns` |
| Deploy | `deploy-to-vercel` |

---

## 📂 Archivos de Contexto por Tipo

### Siempre incluir:
```
- @src/lib/utils.ts        # Helpers (cn(), formateo)
- @tailwind.config.ts      # Tema glassmorphism
```

### Por tipo de tarea:

| Tarea | Archivos de contexto |
|-------|---------------------|
| **Nuevo componente** | `@src/components/ui/` (2-3 existentes) |
| **Nueva query/mutation** | `@convex/` (ejemplos similares) |
| **Bugfix** | Archivos del error + hooks relacionados |
| **Auth** | `@convex/auth.ts` + schema |
| **PWA** | `@vite.config.ts` + `manifest.json` |

---

## 📝 Plantillas de Prompt

### Para nueva funcionalidad:
```
KIMI_MODE: vercel-react-best-practices, web-design-guidelines

[ARCHIVOS]:
- @src/components/ui/Card.tsx
- @src/components/ui/Button.tsx
- @tailwind.config.ts

[TAREA]: Crear componente TradingCard con:
- Glassmorphism: backdrop-blur-xl, bg-white/10
- Props: symbol, price, change, onTrade
- Animación hover scale
- Usar existing Avatar component

[CONSTRAINTS]:
- No nuevas dependencias
- Seguir patrones existentes
- TypeScript strict
```

### Para debugging:
```
KIMI_MODE: systematic-debugging, convex-mutations

[ARCHIVOS]:
- @convex/users.ts
- @src/hooks/useUser.ts

[ERROR]:
[pegar error de consola]

[COMPORTAMIENTO ESPERADO]:
[qué debería pasar]

[COMPORTAMIENTO ACTUAL]:
[qué está pasando]
```

### Para arquitectura:
```
KIMI_MODE: vercel-composition-patterns, context7-mcp

[CONTEXTO]:
- Proyecto: TradeShare (React + Convex + TypeScript)
- Tarea: Diseñar sistema de notificaciones real-time

[REQUISITOS]:
- Múltiples canales (in-app, email, push)
- Optimistic updates
- Offline support

[PREGUNTA]:
Cómo estructurarías las tablas en Convex y qué patterns usarías?
```

---

## ⚡ Atajos Rápidos

### Debugging rápido:
```bash
node scripts/aurora-kimi-agent.mjs "debug: [error] en [archivo]. Expected [X], got [Y]"
```

### Patrón desconocido:
```bash
node scripts/aurora-kimi-agent.mjs "patrón: cómo implementar [funcionalidad] en React+Convex?"
```

### Revisión de código:
```bash
node scripts/aurora-kimi-agent.mjs "review: analiza [archivo] y sugiere mejoras de performance y type-safety"
```

---

## 🔄 Workflow Kimi + BIG-PICKLE

```
1. YO: Identifico tarea compleja
         ↓
2. YO: Selecciono skills relevantes
         ↓
3. YO: Preparo archivos de contexto
         ↓
4. YO: Invoco con prompt estructurado
         ↓
5. KIMI: Analiza + propone solución
         ↓
6. YO: Implemento + verifico
         ↓
7. YO: Agrego al registro de soluciones
```

---

## 📌 Reglas de Oro

1. **Siempre pasa contexto** - Archivos relevantes = respuesta mejor
2. **Usa KIMI_MODE** - Indica skills activos al inicio
3. **Sé específico** - Requisitos claros = respuestas precisas
4. **Itera** - Si no está perfecto, puedes refinar

---

*Actualizado: 2026-03-27*
*Versión: 1.0*
