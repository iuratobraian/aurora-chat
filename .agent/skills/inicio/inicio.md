# Comando Maestro: `inicio` — Punto de Entrada TradeShare

## Propósito
El comando `inicio` es el **punto de entrada** para cualquier sesión de trabajo en TradeShare. Conecta a Notion (fuente de verdad), muestra las tareas organizadas y permite comenzar a trabajar de forma ordenada.

---

## Uso Rápido

```bash
# Ver tablero completo de tareas
npm run inicio

# Marcar tarea en progreso
node scripts/notion-task-action.mjs progress "Implementar login JWT"

# Marcar tarea como lista
node scripts/notion-task-action.mjs done "Crear tabla users"

# Ver todas las tareas
node scripts/notion-task-action.mjs list
```

---

## Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────┐
│                   CICLO DE TRABAJO                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. npm run inicio          → Ver tablero Notion        │
│  2. Elegir tarea            → Identificar qué hacer      │
│  3. Marcar "En progreso"    → node scripts/notion-task...│
│  4. Trabajar                → Implementar solución       │
│  5. Marcar "Listo"          → node scripts/notion-task...│
│  6. Git commit + push       → Guardar cambios            │
│  7. Repetir desde paso 1    → Siguiente tarea            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run inicio` | Ver tablero completo desde Notion |
| `node scripts/notion-task-action.mjs list` | Listar todas las tareas |
| `node scripts/notion-task-action.mjs progress "<tarea>"` | Marcar en progreso |
| `node scripts/notion-task-action.mjs done "<tarea>"` | Marcar como lista |
| `node scripts/notion-task-action.mjs ready "<tarea>"` | Marcar como ready |
| `node scripts/notion-task-action.mjs backlog "<tarea>"` | Devolver a backlog |

---

## Reglas

| Regla | Descripción |
|-------|-------------|
| **Notion es la verdad** | TASK_BOARD.md se genera desde Notion |
| **Una tarea a la vez** | No saltar entre tareas sin terminar |
| **Commit al terminar** | Siempre hacer commit y push |
| **Marcar en Notion** | Actualizar estado en Notion, no solo en local |

---

## Configuración Requerida

Variables en `.env.local`:
```
NOTION_API_KEY=ntn_...
NOTION_DATABASE_ID=33142b008df080f8b6b3db69d36e84d5
```

---

## URL de Referencia

- **Notion Board**: https://www.notion.so/33142b008df080f8b6b3db69d36e84d5
- **GitHub Repo**: https://github.com/iuratobraian/trade-share
