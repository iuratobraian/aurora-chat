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
│              CICLO DE TRABAJO INFINITO                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. npm run inicio          → Ver tablero Notion        │
│     (git pull automático)   → Sincronizar con lo último  │
│  2. Elegir tarea CRÍTICA    → Prioridad más alta         │
│  3. Marcar "En progreso"    → node scripts/notion-task...│
│  4. Trabajar                → Implementar solución       │
│  5. Marcar "Listo"          → node scripts/notion-task...│
│  6. Git commit              → Guardar cambios            │
│  7. VOLVER A NOTION         → Reclamar nueva tarea       │
│  8. REPETIR                 → Hasta que no haya más      │
│                                                          │
│  ⚠️  Cada 5 tareas → git push                            │
│  🚫 PROHIBIDO detenerse si hay tareas pendientes         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Reglas de Oro

| Regla | Descripción |
|-------|-------------|
| **Notion es la verdad** | TASK_BOARD.md se genera desde Notion |
| **Git pull al iniciar** | Siempre sincronizar antes de trabajar |
| **Git push cada 5 tareas** | Compartir avances con el equipo |
| **Loop infinito** | Terminar → Commit → Nueva tarea → Repetir |
| **Una tarea a la vez** | No saltar entre tareas sin terminar |
| **Marcar en Notion** | Actualizar estado en Notion, no solo en local |
| **PROHIBIDO detenerse** | Si hay tareas pendientes, seguir trabajando |

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run inicio` | Ver tablero completo desde Notion (con git pull) |
| `node scripts/notion-task-action.mjs list` | Listar todas las tareas |
| `node scripts/notion-task-action.mjs progress "<tarea>"` | Marcar en progreso |
| `node scripts/notion-task-action.mjs done "<tarea>"` | Marcar como lista |
| `node scripts/notion-task-action.mjs ready "<tarea>"` | Marcar como ready |
| `node scripts/notion-task-action.mjs backlog "<tarea>"` | Devolver a backlog |

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
