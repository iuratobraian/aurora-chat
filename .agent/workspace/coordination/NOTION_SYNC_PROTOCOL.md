# COORDINATION PROTOCOL - Notion Real-Time Sync

## Flujo de Trabajo en Equipo

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE COORDINACIÓN                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐       │
│  │ NOTION   │◄───────►│ AGENTE   │◄───────►│ GIT      │       │
│  │ (REAL)   │  sync   │ LÍDER    │  push    │ REPO     │       │
│  │ Source   │         │ Integración│        │ Commits  │       │
│  │ of Truth │         │           │         │          │       │
│  └──────────┘         └──────────┘         └──────────┘       │
│       ▲                    │                    │              │
│       │                    │                    │              │
│       │         ┌──────────┴──────────┐        │              │
│       │         │    AGENTES          │        │              │
│       └────────►│   DE TRABAJO        │◄───────┘              │
│   pull tasks    │  (eligen de Notion) │   pull                 │
│                 └─────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Roles

### 1. AGENTE INTEGRADOR (1 persona)
- **Responsabilidad:** Sincronizar Notion ↔ TASK_BOARD.md
- **Acciones:**
  - Al iniciar: `node scripts/aurora-notion-sync.mjs` para ver tareas
  - Al crear tarea: Agregar a Notion primero
  - Al completar: Marcar done en Notion
  - Al cerrar sesión: `git push` de cambios

### 2. AGENTES DE TRABAJO (resto del equipo)
- **Responsabilidad:** Tomar tareas y ejecutar
- **Acciones:**
  - Al iniciar: Ver Notion para tareas disponibles
  - Al trabajar: Marcar `in_progress` en Notion
  - Al completar: Marcar `done` en Notion + commit

## Protocolo de Arranque (TODOS)

```bash
# 1. Sincronizar con Notion
cd trade-share
node scripts/aurora-notion-sync.mjs

# 2. Ver tareas pendientes
# → Todas las tareas "Sin empezar" en Notion están disponibles

# 3. Elegir tarea(s)
# → Marcar como "En curso" en Notion

# 4. Trabajar y marcar como "Listo" al terminar
```

## Reglas Anti-Conflicto

| Regla | Detalle |
|-------|---------|
| **1. Notion es la verdad** | Si TASK_BOARD.md y Notion discrepan, Notion gana |
| **2. Primero en marcar, primero en trabajar** | No pisar tareas tomadas |
| **3. Commits atómicos** | Una tarea = un commit descriptivo |
| **4. Pull antes de trabajar** | `git pull origin main` al iniciar sesión |
| **5. Push al terminar** | Siempre `git push` al cerrar |

## Script de Auto-Sync

Para sincronizar automáticamente:

```bash
# Crear tarea en Notion → aparece en TASK_BOARD al next pull
# Marcar done en Notion → refleja en TASK_BOARD al next pull
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| No veo tareas en Notion | Verificar conexión: `node scripts/aurora-notion-sync.mjs` |
| Tarea tomada por otro | Buscar en Notion quién la tiene "En curso" |
| Conflictos en Git | `git pull --rebase` luego `git push` |
| Notion no responde | Esperar 30s y reintentar; verificar API key |

---

**Última actualización:** 2026-03-28
**Versión:** 1.0
