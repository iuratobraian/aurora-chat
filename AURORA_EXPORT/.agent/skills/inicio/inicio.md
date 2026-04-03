# Comando Maestro: `inicio` — Punto de Entrada TradeShare

## Propósito
El comando `inicio` es el **punto de entrada OBLIGATORIO** para cualquier sesión de trabajo en TradeShare. Conecta a Notion (fuente de verdad), sincroniza el tablero local y guía al agente paso a paso.

---

## 🔄 FLUJO COMPLETO DEL AGENTE (PASO A PASO)

### FASE 1: SINCRONIZACIÓN (Automática)
```
1. npm run inicio
   ├── git pull origin main          → Sincroniza código con GitHub
   ├── Conecta a Notion              → Verifica API y obtiene tareas
   ├── Genera TASK_BOARD.md          → Espejo local desde Notion
   └── Muestra tablero organizado    → Por dominio y prioridad
```

### FASE 2: SELECCIÓN DE TAREA (Manual del agente)
```
2. El agente revisa Notion en la web:
   https://www.notion.so/33142b008df080f8b6b3db69d36e84d5

3. Corrobora con TASK_BOARD.md local (espejo sincronizado)

4. Elige la tarea de MAYOR prioridad disponible:
   - Primero: Critical (🔴)
   - Luego: High (🟡)
   - Luego: Medium (🟢)
   - Último: Low (⚪)

5. Marca la tarea como "En progreso" en Notion:
   node scripts/notion-task-action.mjs progress "nombre de la tarea"

   → Esto actualiza TASK_BOARD.md automáticamente
   → El equipo ve el cambio tras el próximo git push
```

### FASE 3: TRABAJO (Implementación)
```
6. Lee la descripción completa de la tarea en Notion:
   - 📝 Descripción detallada de qué hacer
   - 📂 Archivos específicos a editar
   - 🚫 Archivos PROHIBIDOS (NO tocar)
   - ✅ Definición de Done (criterios de aceptación)

7. Implementa la solución siguiendo:
   - Solo editar los archivos permitidos
   - NUNCA tocar archivos prohibidos
   - Seguir convenciones del código existente
   - Documentar soluciones importantes en AGENT_HIVE.md
```

### FASE 4: COMPLETAR TAREA
```
8. Verificar que cumple la Definición de Done:
   - npm run lint pasa sin errores
   - No hay console.log de debug
   - No hay secrets hardcodeados
   - No hay archivos prohibidos modificados

9. Marcar tarea como "Listo" en Notion:
   node scripts/notion-task-action.mjs done "nombre de la tarea"

   → TASK_BOARD.md se actualiza automáticamente

10. Commit y push a Git:
    git add .
    git commit -m "fix: descripción clara del cambio"
    git push origin main
```

### FASE 5: LOOP INFINITO
```
11. VOLVER AL PASO 2 → Elegir nueva tarea → Repetir

    ⚠️ PROHIBIDO detenerse si hay tareas pendientes
    ⚠️ Cada 5 tareas terminadas → git push obligatorio
    ⚠️ Documentar learnings en AGENT_HIVE.md
```

---

## 📋 REGLAS DE ORO

| # | Regla | Descripción |
|---|-------|-------------|
| 1 | **Notion es la verdad** | TASK_BOARD.md es solo un espejo local |
| 2 | **Git pull al iniciar** | Siempre sincronizar antes de trabajar |
| 3 | **Marcar en Notion primero** | Antes de tocar código, marcar "En progreso" |
| 4 | **Archivos prohibidos** | NUNCA tocar src/App.tsx, src/Navigation.tsx salvo que la tarea lo indique |
| 5 | **Git push cada 5 tareas** | Compartir avances con el equipo |
| 6 | **Loop infinito** | Terminar → Commit → Nueva tarea → Repetir |
| 7 | **Documentar** | Guardar soluciones en AGENT_HIVE.md |
| 8 | **No detenerse** | Si hay tareas pendientes, seguir trabajando |

---

## 🚫 PROHIBIDO

- ❌ Referenciar o usar TurboQuant (eliminado permanentemente)
- ❌ Modificar src/App.tsx o src/Navigation.tsx sin tarea explícita
- ❌ Hardcodear secrets o API keys
- ❌ Usar localStorage como source of truth compartida
- ❌ Dejar mocks, placeholders o toasts "en desarrollo"
- ❌ Marcar tarea como done sin cumplir todos los criterios
- ❌ Detenerse si hay tareas pendientes

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run inicio` | Ver tablero completo desde Notion (con git pull) |
| `node scripts/notion-task-action.mjs list` | Listar todas las tareas |
| `node scripts/notion-task-action.mjs progress "<tarea>"` | Marcar en progreso |
| `node scripts/notion-task-action.mjs done "<tarea>"` | Marcar como lista |
| `node scripts/notion-task-action.mjs ready "<tarea>"` | Marcar como ready |
| `node scripts/notion-task-action.mjs backlog "<tarea>"` | Devolver a backlog |

---

## 📂 Archivos de Coordinación

| Archivo | Propósito |
|---------|-----------|
| `.agent/workspace/coordination/MASTER_PLAN.md` | Plan estratégico completo |
| `.agent/workspace/coordination/AGENT_HIVE.md` | Daily updates, Q&A, knowledge sharing |
| `.agent/workspace/coordination/KNOWLEDGE_BASE.md` | Soluciones y patrones reutilizables |
| `TASK_BOARD.md` | Espejo local del tablero de Notion |
| `AGENTS.md` | Reglas y convenciones del proyecto |

---

## 🔗 Links de Referencia

| Recurso | URL |
|---------|-----|
| Notion Board | https://www.notion.so/33142b008df080f8b6b3db69d36e84d5 |
| GitHub Repo | https://github.com/iuratobraian/trade-share |
| Convex Dashboard | https://dashboard.convex.dev/diligent-wildcat-523 |
| Convex URL | https://diligent-wildcat-523.convex.cloud |

---

## ⚡ Ejemplo de Sesión Completa

```bash
# 1. Iniciar sesión
npm run inicio

# 2. Ver tarea crítica disponible
# → "Fix: Crear comunidad — formulario completo"

# 3. Marcar en progreso
node scripts/notion-task-action.mjs progress "Fix: Crear comunidad"

# 4. Trabajar en los archivos indicados
# → convex/communities.ts
# → src/views/ComunidadView.tsx

# 5. Verificar con lint
npm run lint

# 6. Marcar como done
node scripts/notion-task-action.mjs done "Fix: Crear comunidad"

# 7. Commit y push
git add . && git commit -m "fix: community creation validation and auth" && git push

# 8. REPETIR desde paso 2
```
