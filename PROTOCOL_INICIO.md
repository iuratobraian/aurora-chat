# 🚀 Protocolo de INICIO — Ruflo v3.5 (TradeShare Mastermind)

Este protocolo es de ejecución **obligatoria** para cualquier agente que tome el relevo.
Integra el sistema Ruflo v3.5 de orquestación de swarms con el ecosistema Aurora.

> Para el flujo completo paso a paso ver: `.agent/skills/inicio/inicio.md`

---

## Activación Rápida

```bash
node scripts/aurora-inicio.mjs
```

Este script ejecuta automáticamente:
- Hook de sesión Ruflo (session-start)
- Context recovery de Aurora
- Brief operativo (task, drift, health)
- Routing de siguiente tarea

---

## Resumen de Pasos

| Paso | Acción | Herramienta |
|------|--------|-------------|
| 1 | Activar hooks de sesión | `@claude-flow/cli hooks session-start` |
| 2 | Recuperar contexto en paralelo | Leer 7 archivos clave + `aurora-session-brief` |
| 3 | Detectar complejidad y routing | Tabla en `TRADESHARE_AGENT_ROUTING.md` |
| 4 | Init Swarm (si aplica) | `swarm init` + spawn ALL agents en 1 mensaje |
| 5 | Mejora proactiva Aurora (AMM) | `aurora-integrator.mjs sync` |
| 6 | Reclamar 3 tareas del board | Actualizar `TASK_BOARD.md` + `CURRENT_FOCUS.md` |
| 7 | Ejecutar con estética Premium | SPARC + Hive-Mind + Obsidian Ether |
| 8 | Cerrar y loop | `hooks session-end` + sync Aurora + loop infinito |

---

## Reglas Críticas

- **AUTONOMÍA TOTAL**: Si hay tareas `pending` → continuar sin preguntar
- **ANTI-DRIFT**: Topología `hierarchical`, consenso `raft`, máx 8 agentes
- **ZERO LOSS**: Siempre cerrar con hook + Aurora sync + `AGENT_LOG.md`
- **PLAN INMUTABLE**: No modificar `implementation_plan.md` ni `task.md` sin orden del Usuario

> [!IMPORTANT]
> Al terminar un lote de tareas: si hay más `pending` en `TASK_BOARD.md`, el agente DEBE continuar al Paso 6 **sin detenerse**. Solo para cuando el tablero esté en 0.
